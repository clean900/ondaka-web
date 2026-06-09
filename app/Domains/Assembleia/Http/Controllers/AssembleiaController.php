<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Http\Controllers;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Services\AssembleiaService;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssembleiaController extends Controller
{
    public function __construct(
        protected AssembleiaService $service,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $query = Assembleia::with(['condominio:id,nome,codigo', 'participantes'])
            ->where('empresa_gestora_id', $empresa->id)
            ->orderByDesc('data_agendada');

        if ($estado = $request->string('estado')->toString()) {
            $query->where('estado', $estado);
        }
        if ($condominioId = $request->integer('condominio_id')) {
            $query->where('condominio_id', $condominioId);
        }

        $assembleias = $query->paginate(20)->withQueryString()
            ->through(fn ($a) => [
                'id' => $a->id,
                'numero' => $a->numero,
                'titulo' => $a->titulo,
                'tipo' => $a->tipo,
                'tipo_label' => $a->tipo_label,
                'modo' => $a->modo,
                'estado' => $a->estado,
                'estado_label' => $a->estado_label,
                'data_agendada' => $a->data_agendada->toIso8601String(),
                'condominio' => $a->condominio ? [
                    'id' => $a->condominio->id,
                    'nome' => $a->condominio->nome,
                ] : null,
                'total_participantes' => $a->participantes->count(),
                'presentes' => $a->participantes->where('presente', true)->count(),
            ]);

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return Inertia::render('Assembleias/Index', [
            'assembleias' => $assembleias,
            'condominios' => $condominios,
            'filtros' => [
                'estado' => $request->string('estado')->toString(),
                'condominio_id' => $request->integer('condominio_id') ?: null,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->orderBy('nome')
            ->get(['id', 'nome', 'codigo']);

        return Inertia::render('Assembleias/Form', [
            'condominios' => $condominios,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $data = $request->validate([
            'condominio_id' => 'required|exists:condominios,id',
            'tipo' => 'required|in:ordinaria,extraordinaria',
            'titulo' => 'required|string|max:200',
            'ordem_do_dia' => 'required|string',
            'observacoes' => 'nullable|string',
            'data_agendada' => 'required|date|after:now',
            'data_segunda_convocatoria' => 'nullable|date|after:data_agendada',
            'local' => 'nullable|string|max:200',
            'modo' => 'required|in:virtual,presencial,hibrida',
            'quorum_minimo_percent' => 'nullable|numeric|min:0|max:100',
            'enviar_convocatorias_ja' => 'nullable|boolean',
        ]);

        $condominio = Condominio::where('id', $data['condominio_id'])
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        $assembleia = $this->service->criar($condominio, $data, $user->id);

        if (! empty($data['enviar_convocatorias_ja'])) {
            try {
                $stats = $this->service->enviarConvocatorias($assembleia);
                return redirect()
                    ->route('assembleias.show', $assembleia)
                    ->with('success', "Assembleia criada. {$stats['emails_enviados']} emails + {$stats['sms_enviados']} SMS enviados.");
            } catch (\Throwable $e) {
                return redirect()
                    ->route('assembleias.show', $assembleia)
                    ->with('warning', 'Assembleia criada mas falha ao enviar convocatórias: '.$e->getMessage());
            }
        }

        return redirect()
            ->route('assembleias.show', $assembleia)
            ->with('success', "Assembleia {$assembleia->numero} criada.");
    }

    public function show(Assembleia $assembleia, Request $request): Response
    {
        $this->autorizar($assembleia, $request);

        $assembleia->load([
            'condominio',
            'participantes.condomino:id,nome_completo,nome_comercial,tipo,user_id',
            'criadaPor:id,name',
            'pontosVotacao.votos',
        ]);
        $quorum = $assembleia->calcularQuorum();

        $userId = $request->user()->id;

        // Participante do user actual (se existir) para decidir UI de votação
        $participanteActual = $assembleia->participantes->first(function ($p) use ($userId) {
            return $p->condomino && $p->condomino->user_id === $userId;
        });

        // Para cada ponto, descobrir se user actual já votou
        $pontosPayload = $assembleia->pontosVotacao->map(function ($p) use ($participanteActual) {
            $jaVotou = false;
            if ($participanteActual) {
                $jaVotou = $p->votos->where('participante_id', $participanteActual->id)->isNotEmpty();
            }

            return [
                'id' => $p->id,
                'ordem' => $p->ordem,
                'titulo' => $p->titulo,
                'descricao' => $p->descricao,
                'estado' => $p->estado,
                'detectado_automaticamente' => $p->detectado_automaticamente,
                'total_votos_sim' => $p->total_votos_sim,
                'total_votos_nao' => $p->total_votos_nao,
                'total_votos_abstencao' => $p->total_votos_abstencao,
                'permilagem_sim' => (float) $p->permilagem_sim,
                'permilagem_nao' => (float) $p->permilagem_nao,
                'permilagem_abstencao' => (float) $p->permilagem_abstencao,
                'resultado' => $p->resultado,
                'aberta_em' => $p->aberta_em?->toIso8601String(),
                'fechada_em' => $p->fechada_em?->toIso8601String(),
                'ja_votou' => $jaVotou,
            ];
        });

        return Inertia::render('Assembleias/Show', [
            'assembleia' => [
                'id' => $assembleia->id,
                'numero' => $assembleia->numero,
                'titulo' => $assembleia->titulo,
                'tipo' => $assembleia->tipo,
                'tipo_label' => $assembleia->tipo_label,
                'ordem_do_dia' => $assembleia->ordem_do_dia,
                'observacoes' => $assembleia->observacoes,
                'data_agendada' => $assembleia->data_agendada->toIso8601String(),
                'data_segunda_convocatoria' => $assembleia->data_segunda_convocatoria?->toIso8601String(),
                'local' => $assembleia->local,
                'modo' => $assembleia->modo,
                'sala_jitsi' => $assembleia->sala_jitsi,
                'url_jitsi' => $assembleia->url_jitsi,
                'estado' => $assembleia->estado,
                'estado_label' => $assembleia->estado_label,
                'iniciada_em' => $assembleia->iniciada_em?->toIso8601String(),
                'terminada_em' => $assembleia->terminada_em?->toIso8601String(),
                'total_fraccoes' => $assembleia->total_fraccoes,
                'quorum_minimo_percent' => (float) $assembleia->quorum_minimo_percent,
                'convocatorias_enviadas' => $assembleia->convocatorias_enviadas,
                'condominio' => [
                    'id' => $assembleia->condominio->id,
                    'nome' => $assembleia->condominio->nome,
                ],
                'criada_por' => $assembleia->criadaPor?->name,
                'participantes' => $assembleia->participantes->map(fn ($p) => [
                    'id' => $p->id,
                    'condomino_id' => $p->condomino_id,
                    'nome' => $p->nome_snapshot,
                    'documento' => $p->documento_snapshot,
                    'numero_fraccoes' => $p->numero_fraccoes,
                    'permilagem_total' => (float) $p->permilagem_total,
                    'email_convocacao' => $p->email_convocacao,
                    'telefone_convocacao' => $p->telefone_convocacao,
                    'email_enviado' => $p->email_enviado,
                    'sms_enviado' => $p->sms_enviado,
                    'presente' => $p->presente,
                    'entrou_em' => $p->entrou_em?->toIso8601String(),
                ]),
                'quorum' => $quorum,
                'pontos_votacao' => $pontosPayload,
                'participante_actual_id' => $participanteActual?->id,
                'pode_gerir' => $request->user()->empresaGestora?->id === $assembleia->empresa_gestora_id,
            ],
        ]);
    }

    public function enviarConvocatorias(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $stats = $this->service->enviarConvocatorias($assembleia);
            return back()->with('success', "Convocatórias enviadas: {$stats['emails_enviados']} emails + {$stats['sms_enviados']} SMS.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: '.$e->getMessage());
        }
    }

    public function regenerarParticipantes(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $total = $this->service->regenerarParticipantes($assembleia);
            return back()->with('success', "Lista actualizada: {$total} participantes convocados.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: '.$e->getMessage());
        }
    }

    public function downloadActa(Assembleia $assembleia, Request $request, \App\Domains\Assembleia\Services\ActaService $actaService)
    {
        $this->autorizar($assembleia, $request);

        $pdfBytes = $actaService->obterPdf($assembleia);

        if (! $pdfBytes) {
            return back()->with('error', 'Não foi possível gerar a acta. Verifica os logs.');
        }

        $filename = 'acta-'.str_replace(['/', ' '], ['_', '_'], $assembleia->numero).'.pdf';

        return response($pdfBytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    public function regenerarActa(Assembleia $assembleia, Request $request, \App\Domains\Assembleia\Services\ActaService $actaService): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $actaService->gerarPdf($assembleia);
            return back()->with('success', 'Acta regenerada com sucesso.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha ao gerar acta: '.$e->getMessage());
        }
    }

    public function iniciar(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $this->service->iniciar($assembleia, $request->user()->id);
            return back()->with('success', 'Assembleia iniciada.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function terminar(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $this->service->terminar($assembleia, $request->user()->id);
            return back()->with('success', 'Assembleia concluída.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancelar(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia, $request);

        try {
            $this->service->cancelar($assembleia);
            return back()->with('success', 'Assembleia cancelada.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Rota de entrada do condómino: redirecciona para Jitsi e regista presença.
     */
    public function entrar(Assembleia $assembleia, Request $request): mixed
    {
        $user = $request->user();

        // Verifica se o user tem condomino associado
        $condomino = \App\Domains\Condomino\Models\Condomino::where('user_id', $user->id)->first();

        if (! $condomino) {
            return Inertia::render('Assembleias/Entrar', [
                'assembleia' => [
                    'numero' => $assembleia->numero,
                    'titulo' => $assembleia->titulo,
                    'url_jitsi' => $assembleia->url_jitsi,
                    'estado' => $assembleia->estado,
                ],
                'erro' => 'Não foi possível identificar o seu registo de condómino. Contacte a administração.',
            ]);
        }

        // Regista presença
        $participante = $this->service->registarEntrada(
            $assembleia,
            $condomino,
            $request->ip(),
            (string) $request->userAgent(),
        );

        if (! $participante) {
            return Inertia::render('Assembleias/Entrar', [
                'assembleia' => [
                    'numero' => $assembleia->numero,
                    'titulo' => $assembleia->titulo,
                    'url_jitsi' => $assembleia->url_jitsi,
                    'estado' => $assembleia->estado,
                ],
                'erro' => 'Não consta como participante convocado. Contacte a administração.',
            ]);
        }

        return Inertia::render('Assembleias/Entrar', [
            'assembleia' => [
                'id' => $assembleia->id,
                'numero' => $assembleia->numero,
                'titulo' => $assembleia->titulo,
                'sala_jitsi' => $assembleia->sala_jitsi,
                'url_jitsi' => $assembleia->url_jitsi,
                'estado' => $assembleia->estado,
                'modo' => $assembleia->modo,
                'data_agendada' => $assembleia->data_agendada->toIso8601String(),
            ],
            'participante' => [
                'nome' => $participante->nome_snapshot,
                'numero_fraccoes' => $participante->numero_fraccoes,
                'permilagem_total' => (float) $participante->permilagem_total,
                'entrou_em' => $participante->entrou_em?->toIso8601String(),
            ],
        ]);
    }

    /* Helpers */
    private function autorizar(Assembleia $assembleia, Request $request): void
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        if ($assembleia->empresa_gestora_id !== $empresa?->id && ! $user->hasRole('super-admin')) {
            abort(403);
        }
    }
}
