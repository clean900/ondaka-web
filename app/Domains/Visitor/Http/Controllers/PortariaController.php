<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Visitor\Http\Requests\EntradaManualRequest;
use App\Domains\Visitor\Http\Requests\ValidarOtpRequest;
use App\Domains\Visitor\Http\Requests\ValidarQrRequest;
use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Services\ListaNegraService;
use App\Domains\Visitor\Services\ValidacaoService;
use App\Domains\Visitor\Services\VisitaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

/**
 * API — acções da PORTARIA (guardas/funcionarios).
 *
 * Todas as rotas são protegidas por auth:sanctum.
 * O user autenticado deve ter role 'funcionario' (verificado nas rotas).
 */
class PortariaController extends Controller
{
    public function __construct(
        protected ValidacaoService $validacaoService,
        protected VisitaService $visitaService,
        protected ListaNegraService $listaNegra,
    ) {}

    /**
     * Add-ons da portaria activos para a empresa do utilizador.
     * O mobile usa isto para mostrar/esconder funcionalidades (matrícula, foto,
     * controlo de bens, livro de ocorrências, etc.).
     *
     * GET /api/portaria/features
     */
    public function features(Request $request): JsonResponse
    {
        $empresa = EmpresaGestora::find($request->user()->empresa_gestora_id);
        $slugs = ['controlo_bens', 'livro_ocorrencias', 'registo_viaturas', 'dashboard_portaria', 'foto_conferencia'];

        $out = [];
        foreach ($slugs as $slug) {
            $out[$slug] = $empresa !== null && FeatureGate::has($empresa, $slug);
        }

        return response()->json(['data' => $out]);
    }

    /**
     * Pré-verificação na Lista Negra — o guarda confere ANTES de autorizar.
     *
     * POST /api/portaria/lista-negra/verificar
     * Body: { "bi": "...", "matricula": "...", "nome": "..." } (qualquer um)
     */
    public function verificarListaNegra(Request $request): JsonResponse
    {
        $guarda = $request->user();
        $alerta = $this->listaNegra->verificarParaApi(
            empresaGestoraId: (int) $guarda->empresa_gestora_id,
            condominioId: $guarda->condominio_activo_id,
            dados: [
                'bi' => $request->input('bi'),
                'matricula' => $request->input('matricula'),
                'nome' => $request->input('nome'),
            ],
        );

        return response()->json(['lista_negra' => $alerta]);
    }

    /**
     * Alerta de lista negra para uma visita já registada (nome/BI do visitante).
     */
    private function alertaParaVisita(Visita $visita, $guarda): ?array
    {
        $visitante = $visita->visitante;
        if (! $visitante) {
            return null;
        }

        return $this->listaNegra->verificarParaApi(
            empresaGestoraId: (int) $guarda->empresa_gestora_id,
            condominioId: $guarda->condominio_activo_id,
            dados: [
                'bi' => $visitante->bi_numero ?? null,
                'nome' => $visitante->nome ?? null,
            ],
        );
    }

    /**
     * Guarda scaneou um QR code.
     *
     * POST /api/portaria/validar-qr
     * Body: { "qr_token": "..." }
     */
    public function validarQr(ValidarQrRequest $request): JsonResponse
    {
        $guarda = $request->user();

        try {
            $visita = $this->validacaoService->validarQrToken(
                qrToken: $request->input('qr_token'),
                guarda: $guarda,
            );

            return response()->json([
                'message' => 'Entrada autorizada.',
                'data' => $visita->load(['visitante', 'fraccao', 'preAprovacao']),
                'lista_negra' => $this->alertaParaVisita($visita, $guarda),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /**
     * Guarda introduziu OTP verbal.
     *
     * POST /api/portaria/validar-otp
     * Body: { "otp_code": "123456" }
     */
    public function validarOtp(ValidarOtpRequest $request): JsonResponse
    {
        $guarda = $request->user();

        try {
            $visita = $this->validacaoService->validarOtpCode(
                otpCode: $request->input('otp_code'),
                guarda: $guarda,
            );

            return response()->json([
                'message' => 'Entrada autorizada.',
                'data' => $visita->load(['visitante', 'fraccao', 'preAprovacao']),
                'lista_negra' => $this->alertaParaVisita($visita, $guarda),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /**
     * Entrada manual (sem pré-aprovação) — situação excepcional.
     *
     * POST /api/portaria/entrada-manual
     */
    public function entradaManual(EntradaManualRequest $request): JsonResponse
    {
        $guarda = $request->user();

        try {
            $visita = $this->validacaoService->registarEntradaManual(
                guarda: $guarda,
                fraccaoId: (int) $request->input('fraccao_id'),
                nomeVisitante: $request->input('nome_visitante'),
                telefoneVisitante: $request->input('telefone_visitante'),
                biNumero: $request->input('bi_numero'),
                observacoes: $request->input('observacoes'),
            );

            return response()->json([
                'message' => 'Entrada manual registada.',
                'data' => $visita->load(['visitante', 'fraccao']),
                'lista_negra' => $this->alertaParaVisita($visita, $guarda),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Lista visitantes que ainda estão dentro do condomínio.
     *
     * GET /api/portaria/dentro-agora
     * Query params (opcional):
     *   ?fraccao_id=68  (filtrar por fracção específica)
     */
    public function dentroAgora(Request $request): JsonResponse
    {
        $guarda = $request->user();

        $fraccaoId = $request->query('fraccao_id');
        $fraccaoId = $fraccaoId !== null ? (int) $fraccaoId : null;

        $visitas = $this->visitaService->dentroAgora(
            empresaGestoraId: $guarda->empresa_gestora_id,
            fraccaoId: $fraccaoId,
        );

        $total = $this->visitaService->contarDentroAgora(
            empresaGestoraId: $guarda->empresa_gestora_id,
            fraccaoId: $fraccaoId,
        );

        return response()->json([
            'data' => $visitas,
            'meta' => [
                'total' => $total,
            ],
        ]);
    }

    /**
     * Regista saída de uma visita em curso.
     *
     * POST /api/portaria/visitas/{id}/saida
     * Body (opcional): { "observacoes": "..." }
     */
    public function registarSaida(Request $request, int $id): JsonResponse
    {
        $guarda = $request->user();

        $visita = Visita::find($id);

        if ($visita === null) {
            return response()->json(['message' => 'Visita não encontrada.'], 404);
        }

        // Add-on Controlo de Bens: se activo, exige reconciliação dos itens.
        $empresa = EmpresaGestora::find($guarda->empresa_gestora_id);
        $exigirReconciliacao = $empresa !== null && FeatureGate::has($empresa, 'controlo_bens');

        try {
            $visita = $this->visitaService->registarSaida(
                visita: $visita,
                guarda: $guarda,
                observacoes: $request->input('observacoes'),
                exigirReconciliacao: $exigirReconciliacao,
            );

            return response()->json([
                'message' => 'Saída registada.',
                'data' => $visita,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /**
     * Regista/atualiza a matrícula do veículo de uma visita (add-on registo_viaturas).
     *
     * POST /api/portaria/visitas/{id}/matricula  body: { matricula }
     */
    public function registarMatricula(Request $request, int $id): JsonResponse
    {
        $visita = Visita::paraEmpresa($request->user()->empresa_gestora_id)->find($id);
        if ($visita === null) {
            return response()->json(['message' => 'Visita não encontrada.'], 404);
        }

        $dados = $request->validate(['matricula' => ['required', 'string', 'max:20']]);
        $visita->update(['matricula' => mb_strtoupper(trim($dados['matricula']))]);

        return response()->json(['message' => 'Matrícula registada.', 'data' => $visita]);
    }

    /**
     * Histórico de visitas da empresa do guarda, com filtros.
     *
     * GET /api/portaria/visitas
     * Query params (todos opcionais):
     *   ?desde=YYYY-MM-DD      (filtra entrou_em >= desde)
     *   ?ate=YYYY-MM-DD        (filtra entrou_em <= ate+23:59:59)
     *   ?nome=joao             (LIKE %joao% no nome do visitante)
     *   ?fraccao_id=68         (filtra fracção específica)
     *   ?metodo=qr|otp|manual  (filtra método de validação)
     *   ?per_page=20           (paginação, max 100)
     */
    public function historico(Request $request): JsonResponse
    {
        $guarda = $request->user();

        $query = \App\Domains\Visitor\Models\Visita::with(['visitante', 'fraccao', 'guardaEntrada', 'guardaSaida'])
            ->paraEmpresa($guarda->empresa_gestora_id)
            ->orderBy('entrou_em', 'desc');

        // Filtro: data desde
        if ($desde = $request->query('desde')) {
            try {
                $query->where('entrou_em', '>=', \Carbon\Carbon::parse($desde)->startOfDay());
            } catch (\Exception) {
                // data inválida, ignora filtro
            }
        }

        // Filtro: data ate
        if ($ate = $request->query('ate')) {
            try {
                $query->where('entrou_em', '<=', \Carbon\Carbon::parse($ate)->endOfDay());
            } catch (\Exception) {
                // data inválida, ignora filtro
            }
        }

        // Filtro: nome do visitante (LIKE)
        if ($nome = $request->query('nome')) {
            $nome = trim($nome);
            if (strlen($nome) >= 2) {
                $query->whereHas('visitante', function ($q) use ($nome) {
                    $q->where('nome', 'LIKE', '%' . $nome . '%');
                });
            }
        }

        // Filtro: fracção específica
        if ($fraccaoId = $request->query('fraccao_id')) {
            $query->where('fraccao_id', (int) $fraccaoId);
        }

        // Filtro: método de validação
        if ($metodo = $request->query('metodo')) {
            if (in_array($metodo, ['qr', 'otp', 'manual'], true)) {
                $query->where('metodo_validacao', $metodo);
            }
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = min(max($perPage, 1), 100);

        $paginada = $query->paginate($perPage);

        return response()->json([
            'data' => $paginada->items(),
            'meta' => [
                'current_page' => $paginada->currentPage(),
                'last_page' => $paginada->lastPage(),
                'total' => $paginada->total(),
                'per_page' => $paginada->perPage(),
            ],
        ]);
    }
}
