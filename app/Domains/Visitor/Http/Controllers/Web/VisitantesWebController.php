<?php

namespace App\Domains\Visitor\Http\Controllers\Web;

use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Models\Visita;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Fraccao;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use App\Domains\Visitor\Services\PreAprovacaoService;

/**
 * Controller para as páginas web do módulo Visitantes.
 *
 * Serve 3 páginas:
 *   - /visitantes/dentro-agora    → DentroAgora.tsx
 *   - /visitantes/historico       → Historico.tsx
 *   - /visitantes/pre-aprovacoes  → PreAprovacoes.tsx
 */
class VisitantesWebController extends Controller
{
    /**
     * Lista de visitantes actualmente no condomínio.
     */
    public function dentroAgora(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $visitas = Visita::with(['visitante', 'fraccao', 'guardaEntrada'])
            ->paraEmpresa($empresaId)
            ->whereNull('saiu_em')
            ->orderBy('entrou_em', 'desc')
            ->get();

        return Inertia::render('Visitantes/DentroAgora', [
            'visitas' => $visitas,
            'total' => $visitas->count(),
        ]);
    }

    /**
     * Histórico de visitas com filtros e paginação.
     */
    public function historico(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $query = Visita::with(['visitante', 'fraccao', 'guardaEntrada', 'guardaSaida'])
            ->paraEmpresa($empresaId)
            ->orderBy('entrou_em', 'desc');

        // Filtros
        if ($desde = $request->query('desde')) {
            try {
                $query->where('entrou_em', '>=', Carbon::parse($desde)->startOfDay());
            } catch (\Exception) {
            }
        }

        if ($ate = $request->query('ate')) {
            try {
                $query->where('entrou_em', '<=', Carbon::parse($ate)->endOfDay());
            } catch (\Exception) {
            }
        }

        if ($nome = $request->query('nome')) {
            $nome = trim($nome);
            if (strlen($nome) >= 2) {
                $query->whereHas('visitante', fn($q) => $q->where('nome', 'LIKE', "%{$nome}%"));
            }
        }

        if ($metodo = $request->query('metodo')) {
            if (in_array($metodo, ['qr', 'otp', 'manual'], true)) {
                $query->where('metodo_validacao', $metodo);
            }
        }

        $paginada = $query->paginate(20)->withQueryString();

        return Inertia::render('Visitantes/Historico', [
            'visitas' => $paginada,
            'filtros' => [
                'desde' => $request->query('desde', ''),
                'ate' => $request->query('ate', ''),
                'nome' => $request->query('nome', ''),
                'metodo' => $request->query('metodo', ''),
            ],
        ]);
    }

    /**
     * Lista de pré-aprovações criadas pelos condóminos.
     */
    public function preAprovacoes(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        $query = PreAprovacao::with(['fraccao', 'condomino.user'])
            ->paraEmpresa($empresaId)
            ->orderBy('created_at', 'desc');

        if ($estado = $request->query('estado')) {
            if (in_array($estado, ['pendente', 'usada', 'expirada', 'cancelada'], true)) {
                $query->where('estado', $estado);
            }
        }
        if ($nome = $request->query('nome')) {
            $nome = trim($nome);
            if (strlen($nome) >= 2) {
                $query->where('nome_visitante', 'LIKE', "%{$nome}%");
            }
        }

        $paginada = $query->paginate(20)->withQueryString();

        // Detectar role
        $rolePrincipal = $user->getRoleNames()->first();
        $isCondomino = $rolePrincipal === 'condomino';
        $isGestor = in_array($rolePrincipal, ['admin-empresa', 'gestor', 'administrador-condominio', 'super-admin'], true);

        // Para condómino: carregar as suas próprias fracções
        $minhasFraccoes = [];
        if ($isCondomino) {
            $condominoRecord = Condomino::where('user_id', $user->id)->first();
            if ($condominoRecord) {
                $contratos = $condominoRecord->contratosActivos()
                    ->with(['fraccao.edificio:id,nome'])
                    ->get();
                $minhasFraccoes = $contratos->map(function ($contrato) {
                    $f = $contrato->fraccao;
                    if (!$f) return null;
                    return [
                        'id' => $f->id,
                        'identificador' => $f->identificador,
                        'piso' => $f->piso,
                        'edificio_nome' => $f->edificio?->nome,
                    ];
                })->filter()->values()->all();
            }
        }

        // Para gestor/admin: carregar todos os condóminos da empresa
        $condominosLista = [];
        if ($isGestor) {
            $condominosLista = Condomino::with([
                    'user:id,name,email',
                    'contratosActivos.fraccao:id,identificador,piso,edificio_id',
                    'contratosActivos.fraccao.edificio:id,nome',
                ])
                ->where('empresa_gestora_id', $empresaId)
                ->limit(500)
                ->get()
                ->map(function ($cn) {
                    $fraccoes = $cn->contratosActivos->map(function ($ct) {
                        $f = $ct->fraccao;
                        if (!$f) return null;
                        return [
                            'id' => $f->id,
                            'identificador' => $f->identificador,
                            'piso' => $f->piso,
                            'edificio_nome' => $f->edificio?->nome,
                        ];
                    })->filter()->values()->all();
                    return [
                        'id' => $cn->id,
                        'nome' => $cn->user?->name ?? 'Sem nome',
                        'email' => $cn->user?->email,
                        'fraccoes' => $fraccoes,
                    ];
                })->all();
        }

        return Inertia::render('Visitantes/PreAprovacoes', [
            'preAprovacoes' => $paginada,
            'filtros' => [
                'estado' => $request->query('estado', ''),
                'nome' => $request->query('nome', ''),
            ],
            'meta' => [
                'role' => $rolePrincipal,
                'is_condomino' => $isCondomino,
                'is_gestor' => $isGestor,
            ],
            'minhasFraccoes' => $minhasFraccoes,
            'condominos' => $condominosLista,
        ]);
    }

    /**
     * Cria pre-aprovacao via web (auth session). Aceita criacao em nome
     * do proprio user (condomino) ou em nome de outro condomino (admin/gestor).
     */
    public function criarPreAprovacao(Request $request, PreAprovacaoService $service): RedirectResponse
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $rolePrincipal = $user->getRoleNames()->first();
        $isCondomino = $rolePrincipal === 'condomino';
        $isGestor = in_array($rolePrincipal, ['admin-empresa', 'gestor', 'administrador-condominio', 'super-admin'], true);

        $regras = [
            'fraccao_id' => 'required|integer|exists:fraccoes,id',
            'nome_visitante' => 'required|string|min:2|max:150',
            'telefone_visitante' => 'required|string|max:20',
            'valida_ate' => 'required|date|after:now',
            'valida_desde' => 'nullable|date|before:valida_ate',
            'observacoes' => 'nullable|string|max:500',
        ];
        if ($isGestor && !$isCondomino) {
            $regras['condomino_id'] = 'required|integer|exists:condominos,id';
        }

        $validator = Validator::make($request->all(), $regras);
        if ($validator->fails()) {
            return back()->withErrors($validator)->with('error', 'Verifique os campos preenchidos.');
        }

        // Determinar o condomino
        if ($isCondomino) {
            $condomino = \App\Domains\Condomino\Models\Condomino::where('user_id', $user->id)->first();
            if (!$condomino) {
                return back()->with('error', 'O seu utilizador nao esta associado a nenhum condomino.');
            }
        } else {
            $condomino = \App\Domains\Condomino\Models\Condomino::where('id', $request->input('condomino_id'))
                ->where('empresa_gestora_id', $empresaId)
                ->first();
            if (!$condomino) {
                return back()->with('error', 'Condomino nao encontrado.');
            }
        }

        try {
            $service->criar(
                condomino: $condomino,
                fraccaoId: (int) $request->input('fraccao_id'),
                nomeVisitante: $request->input('nome_visitante'),
                telefoneVisitante: $request->input('telefone_visitante'),
                validaAte: Carbon::parse($request->input('valida_ate')),
                validaDesde: $request->filled('valida_desde')
                    ? Carbon::parse($request->input('valida_desde'))
                    : null,
                observacoes: $request->input('observacoes'),
            );
            return back()->with('success', 'Pre-aprovacao criada com sucesso.');
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro: ' . $e->getMessage());
        }
    }

}
