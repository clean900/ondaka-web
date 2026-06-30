<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Http\Controllers;

use App\Domains\Condomino\Http\Requests\GuardarCondominoRequest;
use App\Domains\Condomino\Models\Condomino;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CondominoController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Condomino::class);

        $condominioFiltro = $request->string('condominio')->toString();

        $condominos = Condomino::query()
            ->withCount([
                'contratosActivos',
                'propriedades',
                'arrendamentos',
            ])
            // Condomínio(s) a que pertence — via contratos activos → fracção → condomínio.
            ->with(['contratosActivos.fraccao.condominio:id,nome'])
            ->when($request->string('pesquisa')->toString(), function ($q, $pesquisa) {
                $q->where(function ($sub) use ($pesquisa) {
                    $sub->where('nome_completo', 'like', "%{$pesquisa}%")
                        ->orWhere('nome_comercial', 'like', "%{$pesquisa}%")
                        ->orWhere('numero_bi', 'like', "%{$pesquisa}%")
                        ->orWhere('nif', 'like', "%{$pesquisa}%")
                        ->orWhere('email', 'like', "%{$pesquisa}%")
                        ->orWhere('telefone_principal', 'like', "%{$pesquisa}%");
                });
            })
            ->when($request->string('tipo')->toString(), fn ($q, $t) => $q->where('tipo', $t))
            ->when($request->string('estado')->toString(), fn ($q, $e) => $q->where('estado', $e))
            ->when($condominioFiltro, function ($q, $condominioId) {
                $q->whereHas('contratosActivos.fraccao', fn ($sub) => $sub->where('condominio_id', $condominioId));
            })
            ->orderBy('nome_completo')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($c) {
                // Nome(s) do condomínio para identificar no cartão.
                $nomes = $c->contratosActivos
                    ->map(fn ($ct) => $ct->fraccao?->condominio?->nome)
                    ->filter()
                    ->unique()
                    ->values();
                $c->setAttribute('condominio_nome', $nomes->first());
                $c->setAttribute('condominios_nomes', $nomes->all());
                $c->unsetRelation('contratosActivos'); // não enviar a relação pesada ao frontend
                return $c;
            });

        return Inertia::render('Condominos/Index', [
            'condominos' => $condominos,
            'filtros' => $request->only(['pesquisa', 'tipo', 'estado', 'condominio']),
            'condominios' => \App\Domains\Condominio\Models\Condominio::query()
                ->orderBy('nome')
                ->get(['id', 'nome']),
            'contagens' => [
                'total' => Condomino::count(),
                'singulares' => Condomino::where('tipo', 'singular')->count(),
                'empresas' => Condomino::where('tipo', 'empresa')->count(),
                'activos' => Condomino::where('estado', 'activo')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Condomino::class);

        return Inertia::render('Condominos/Form', [
            'tipoInicial' => $request->string('tipo', 'singular')->toString(),
            'provincias' => $this->provinciasAngola(),
        ]);
    }

    public function store(GuardarCondominoRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $criarUser = $data['criar_user'] ?? false;
        $password = $data['password'] ?? null;
        $mustChange = $data['must_change_password'] ?? false;
        $email = $data['email'] ?? null;

        unset($data['criar_user'], $data['password'], $data['must_change_password']);

        // Garantir empresa_gestora_id (vem do admin logado)
        $data['empresa_gestora_id'] = auth()->user()->empresa_gestora_id;

        $condomino = DB::transaction(function () use ($data, $criarUser, $password, $mustChange, $email) {
            $condomino = Condomino::create($data);

            if ($criarUser && $email && $password) {
                if (User::where('email', $email)->exists()) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'email' => 'Já existe um utilizador com este email.',
                    ]);
                }

                $user = User::create([
                    'name' => $data['nome_completo'],
                    'email' => $email,
                    'telefone' => $data['telefone_principal'] ?? null,
                    'empresa_gestora_id' => auth()->user()->empresa_gestora_id,
                    'password' => Hash::make($password),
                    'estado' => 'activo',
                    'must_change_password' => $mustChange,
                ]);

                $user->assignRole('condomino');
                $condomino->update(['user_id' => $user->id]);

                // Email de boas-vindas com credenciais (password em texto so existe aqui)
                try {
                    $empresaModel = \App\Domains\Empresa\Models\EmpresaGestora::find(auth()->user()->empresa_gestora_id);
                    $user->notify(new \App\Domains\Condomino\Notifications\CondominoContaCriadaNotification(
                        nome: $data['nome_completo'],
                        email: $email,
                        passwordTemporaria: $password,
                        gestor: auth()->user()->name ?? '—',
                        empresa: $empresaModel?->nome ?? '—',
                        condominio: null,
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('[Condomino] Falha a enviar email de boas-vindas: '.$e->getMessage());
                }
            }

            return $condomino;
        });

        $msg = "Condómino «{$condomino->nome_completo}» criado com sucesso.";
        if ($criarUser && $email && $password) {
            $msg .= " Conta de utilizador criada (email: {$email}).";
        }

        return redirect()
            ->route('condominos.show', $condomino)
            ->with('success', $msg);
    }

    public function show(Condomino $condomino): Response
    {
        $this->authorize('view', $condomino);

        $condomino->load([
            'contratos' => fn ($q) => $q->with([
                'fraccao:id,identificador,piso,edificio_id,area_privativa_m2',
                'fraccao.edificio:id,nome,codigo,condominio_id',
                'fraccao.edificio.condominio:id,nome,codigo',
                'proprietario:id,nome_completo,tipo',
            ])->orderByDesc('estado')->orderByDesc('data_inicio'),
        ]);

        return Inertia::render('Condominos/Show', [
            'condomino' => $condomino,
            'estatisticas' => [
                'total_contratos' => $condomino->contratos->count(),
                'total_propriedades' => $condomino->contratos->where('tipo', 'proprietario')->where('estado', 'activo')->count(),
                'total_arrendamentos' => $condomino->contratos->where('tipo', 'inquilino')->where('estado', 'activo')->count(),
                'total_fraccoes_activas' => $condomino->contratos->where('estado', 'activo')->count(),
            ],
        ]);
    }

    public function edit(Condomino $condomino): Response
    {
        $this->authorize('update', $condomino);

        return Inertia::render('Condominos/Form', [
            'condomino' => $condomino,
            'provincias' => $this->provinciasAngola(),
        ]);
    }

    public function update(GuardarCondominoRequest $request, Condomino $condomino): RedirectResponse
    {
        $data = $request->validated();
        // No update, ignoramos campos de criação de user (só são válidos no store)
        unset($data['criar_user'], $data['password'], $data['must_change_password']);

        DB::transaction(function () use ($condomino, $data) {
            $condomino->update($data);

            // SYNC: se houver user ligado, sincronizar nome + email (resolve B-USER-01)
            if ($condomino->user_id) {
                $userData = ['name' => $data['nome_completo']];
                if (!empty($data['email'])) {
                    $userData['email'] = $data['email'];
                }
                User::where('id', $condomino->user_id)->update($userData);
            }
        });

        return redirect()
            ->route('condominos.show', $condomino)
            ->with('success', 'Condómino actualizado com sucesso.');
    }

    public function destroy(Condomino $condomino): RedirectResponse
    {
        $this->authorize('delete', $condomino);

        // Não permitir arquivar se tem contratos activos
        if ($condomino->contratosActivos()->exists()) {
            return back()->with(
                'error',
                'Não é possível arquivar um condómino com contratos activos. Termine primeiro os contratos.'
            );
        }

        $condomino->delete();

        return redirect()
            ->route('condominos.index')
            ->with('success', 'Condómino arquivado.');
    }

    private function provinciasAngola(): array
    {
        return [
            'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando', 'Cubango',
            'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
            'Icolo e Bengo', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje',
            'Moxico', 'Moxico Leste', 'Namibe', 'Uíge', 'Zaire',
        ];
    }
}
