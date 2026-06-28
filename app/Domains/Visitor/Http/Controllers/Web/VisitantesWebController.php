<?php

namespace App\Domains\Visitor\Http\Controllers\Web;

use App\Domains\Feature\Services\FeatureGate;
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
use App\Domains\Visitor\Services\VisitaItemService;

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

        $controloBens = FeatureGate::has($request->user(), 'controlo_bens');

        $visitas = Visita::with(['visitante', 'fraccao', 'guardaEntrada', 'itens'])
            ->paraEmpresa($empresaId)
            ->whereNull('saiu_em')
            ->orderBy('entrou_em', 'desc')
            ->get();

        return Inertia::render('Visitantes/DentroAgora', [
            'visitas' => $visitas,
            'total' => $visitas->count(),
            'controloBensActivo' => $controloBens,
            'livroOcorrenciasActivo' => FeatureGate::has($request->user(), 'livro_ocorrencias'),
            'dashboardPortariaActivo' => FeatureGate::has($request->user(), 'dashboard_portaria'),
        ]);
    }

    /**
     * Histórico de visitas com filtros e paginação.
     */
    public function historico(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $controloBens = FeatureGate::has($request->user(), 'controlo_bens');

        $query = Visita::with(['visitante', 'fraccao', 'guardaEntrada', 'guardaSaida', 'itens'])
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
            'controloBensActivo' => $controloBens,
            'filtros' => [
                'desde' => $request->query('desde', ''),
                'ate' => $request->query('ate', ''),
                'nome' => $request->query('nome', ''),
                'metodo' => $request->query('metodo', ''),
            ],
        ]);
    }

    /**
     * Livro de Ocorrências (web, gestor) — só leitura + resolver.
     */
    public function livroOcorrencias(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $ocorrencias = \App\Domains\Visitor\Models\OcorrenciaPortaria::with(['guarda:id,name', 'resolvidaPor:id,name'])
            ->where('empresa_gestora_id', $empresaId)
            ->latest('id')
            ->limit(200)
            ->get();

        $passagens = \App\Domains\Visitor\Models\PassagemTurno::with(['guarda:id,name'])
            ->where('empresa_gestora_id', $empresaId)
            ->latest('id')
            ->limit(30)
            ->get();

        return Inertia::render('Visitantes/LivroOcorrencias', [
            'ocorrencias' => $ocorrencias,
            'passagens' => $passagens,
        ]);
    }

    public function resolverOcorrencia(Request $request, int $id): RedirectResponse
    {
        $oc = \App\Domains\Visitor\Models\OcorrenciaPortaria::where('empresa_gestora_id', $request->user()->empresa_gestora_id)->find($id);
        if (! $oc) {
            return back()->with('error', 'Ocorrência não encontrada.');
        }
        try {
            app(\App\Domains\Visitor\Services\OcorrenciaPortariaService::class)
                ->resolver($oc, $request->user(), $request->input('notas'));
            return back()->with('success', 'Ocorrência resolvida.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // =========================================================================
    // Add-on Controlo de Bens — acções web (registar/resolver itens)
    // =========================================================================

    public function registarItem(Request $request, int $visitaId): RedirectResponse
    {
        $dados = $request->validate([
            'descricao' => ['required', 'string', 'min:2', 'max:150'],
            'quantidade' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'identificador' => ['nullable', 'string', 'max:100'],
        ]);

        $visita = $this->visitaDaEmpresa($request, $visitaId);
        if (! $visita) {
            return back()->with('error', 'Visita não encontrada.');
        }

        try {
            app(VisitaItemService::class)->registar($visita, $request->user(), $dados);
            return back()->with('success', 'Item registado.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function resolverItem(Request $request, int $visitaId, int $itemId): RedirectResponse
    {
        $dados = $request->validate([
            'resolucao' => ['required', 'string', 'in:saiu,ficou'],
        ]);

        $item = \App\Domains\Visitor\Models\VisitaItem::where('visita_id', $visitaId)->find($itemId);
        if (! $item) {
            return back()->with('error', 'Item não encontrado.');
        }

        try {
            app(VisitaItemService::class)->resolver($item, $request->user(), $dados['resolucao']);
            return back()->with('success', 'Item resolvido.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function itemNaoDeclarado(Request $request, int $visitaId): RedirectResponse
    {
        $dados = $request->validate([
            'descricao' => ['required', 'string', 'min:2', 'max:150'],
            'quantidade' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'identificador' => ['nullable', 'string', 'max:100'],
        ]);

        $visita = $this->visitaDaEmpresa($request, $visitaId);
        if (! $visita) {
            return back()->with('error', 'Visita não encontrada.');
        }

        try {
            app(VisitaItemService::class)->registarNaoDeclarado($visita, $request->user(), $dados);
            return back()->with('success', 'Item não declarado registado. Gestor notificado.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    private function visitaDaEmpresa(Request $request, int $visitaId): ?Visita
    {
        return Visita::paraEmpresa($request->user()->empresa_gestora_id)->find($visitaId);
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

        // Add-on #9: acesso por horário/área activo para esta empresa?
        $empresa = \App\Domains\Empresa\Models\EmpresaGestora::find($empresaId);
        $acessoHorarioAreaActivo = $empresa !== null && FeatureGate::has($empresa, 'acesso_horario_area');

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
            'acessoHorarioAreaActivo' => $acessoHorarioAreaActivo,
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
            // Add-on #9: acesso por horário/área (opcional)
            'horarios' => 'nullable|array|max:7',
            'horarios.*.dias' => 'required_with:horarios|array|min:1',
            'horarios.*.dias.*' => 'integer|between:1,7',
            'horarios.*.inicio' => 'nullable|date_format:H:i',
            'horarios.*.fim' => 'nullable|date_format:H:i',
            'areas' => 'nullable|array|max:20',
            'areas.*' => 'string|max:60',
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

        // Add-on #9: normalizar horários/áreas (áreas como texto livre informativo)
        $horarios = $this->normalizarHorarios($request->input('horarios'));
        $areas = collect($request->input('areas', []))
            ->map(fn ($n) => trim((string) $n))
            ->filter()
            ->unique()
            ->map(fn ($n) => ['tipo' => 'livre', 'nome' => $n])
            ->values()
            ->all();

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
                horarios: $horarios ?: null,
                areas: $areas ?: null,
            );
            return back()->with('success', 'Pre-aprovacao criada com sucesso.');
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro: ' . $e->getMessage());
        }
    }

    /**
     * Add-on #9: limpa as regras de horário recorrente vindas do formulário,
     * descartando regras sem dias. Formato: [{ dias:[1..7], inicio?, fim? }].
     */
    private function normalizarHorarios($raw): array
    {
        if (! is_array($raw)) {
            return [];
        }

        $out = [];
        foreach ($raw as $r) {
            if (! is_array($r)) {
                continue;
            }
            $dias = array_values(array_unique(array_filter(
                array_map('intval', (array) ($r['dias'] ?? [])),
                fn ($d) => $d >= 1 && $d <= 7,
            )));
            if (empty($dias)) {
                continue;
            }
            $regra = ['dias' => $dias];
            if (! empty($r['inicio'])) {
                $regra['inicio'] = (string) $r['inicio'];
            }
            if (! empty($r['fim'])) {
                $regra['fim'] = (string) $r['fim'];
            }
            $out[] = $regra;
        }

        return $out;
    }

}
