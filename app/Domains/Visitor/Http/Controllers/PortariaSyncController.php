<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Models\VisitanteBanido;
use App\Domains\Visitor\Services\ValidacaoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Modo Offline da Portaria (#6) — o guarda descarrega o que precisa para validar
 * sem rede (pull) e envia as entradas feitas offline quando volta a ligação (push).
 *
 * Estas rotas expõem segredos (qr_token/otp_code das pré-aprovações) e criam
 * registos de entrada, por isso são restritas a guardas/funcionários.
 */
class PortariaSyncController extends Controller
{
    public function __construct(protected ValidacaoService $validacao) {}

    /**
     * Só guardas/funcionários acedem à sincronização da portaria.
     */
    private function autorizarGuarda(Request $request): void
    {
        abort_unless(
            $request->user()?->hasAnyRole(['funcionario', 'guarda']) ?? false,
            403,
            'Apenas guardas/funcionários podem sincronizar a portaria.'
        );
    }

    /**
     * GET /api/portaria/sync — dados para validação offline (pré-aprovações + lista negra).
     */
    public function pull(Request $request): JsonResponse
    {
        $this->autorizarGuarda($request);

        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $condominioId = $user->condominio_activo_id;

        $preAprovacoes = PreAprovacao::with('fraccao:id,identificador')
            ->where('empresa_gestora_id', $empresaId)
            ->whereIn('estado', [PreAprovacao::ESTADO_PENDENTE, PreAprovacao::ESTADO_APROVADO])
            ->where('valida_ate', '>=', now())
            ->get()
            ->map(fn (PreAprovacao $p) => [
                'id' => $p->id,
                'qr_token' => $p->qr_token,
                'otp_code' => $p->otp_code,
                'nome_visitante' => $p->nome_visitante,
                'telefone_visitante' => $p->telefone_visitante,
                'fraccao_id' => $p->fraccao_id,
                'fraccao' => $p->fraccao?->identificador,
                'valida_desde' => optional($p->valida_desde)->toIso8601String(),
                'valida_ate' => optional($p->valida_ate)->toIso8601String(),
                'estado' => $p->estado,
                'tipo_acesso' => $p->tipo_acesso,
            ]);

        // Lista negra com o mesmo scoping do online (ListaNegraService::verificar):
        // partilhadas pela empresa OU específicas do condomínio activo do guarda.
        $listaNegra = VisitanteBanido::where('empresa_gestora_id', $empresaId)
            ->where(function ($q) use ($condominioId) {
                $q->where('partilhar_empresa', true);
                if ($condominioId) {
                    $q->orWhere('condominio_id', $condominioId);
                }
            })
            ->get(['tipo', 'valor', 'valor_normalizado', 'motivo'])
            ->map(fn ($b) => [
                'tipo' => $b->tipo,
                'valor_normalizado' => $b->valor_normalizado,
                'motivo' => $b->motivo,
            ]);

        return response()->json([
            'data' => [
                'pre_aprovacoes' => $preAprovacoes,
                'lista_negra' => $listaNegra,
                'sincronizado_em' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * POST /api/portaria/sync/entradas — lote de entradas feitas offline.
     * Body: { entradas: [{ idempotency_key, qr_token?, otp_code?, entrou_em, metodo? }] }
     */
    public function pushEntradas(Request $request): JsonResponse
    {
        $this->autorizarGuarda($request);

        $dados = $request->validate([
            'entradas' => ['required', 'array', 'max:200'],
            'entradas.*.idempotency_key' => ['required', 'uuid'],
            'entradas.*.qr_token' => ['nullable', 'string', 'max:100'],
            'entradas.*.otp_code' => ['nullable', 'string', 'max:10'],
            'entradas.*.entrou_em' => ['required', 'date'],
            'entradas.*.metodo' => ['nullable', 'string', 'in:qr,otp,manual'],
        ]);

        $guarda = $request->user();
        $resultados = [];
        foreach ($dados['entradas'] as $item) {
            try {
                $resultados[] = $this->validacao->sincronizarEntradaOffline($guarda, $item);
            } catch (\Throwable $e) {
                $resultados[] = [
                    'ok' => false,
                    'idempotency_key' => $item['idempotency_key'] ?? null,
                    'erro' => 'Erro ao sincronizar: ' . $e->getMessage(),
                ];
            }
        }

        // Auditoria: quem sincronizou, quantas, e quantas falharam.
        $falhas = collect($resultados)->where('ok', false)->count();
        Log::info('Portaria offline sync', [
            'guarda_id' => $guarda->id,
            'empresa_gestora_id' => $guarda->empresa_gestora_id,
            'total' => count($dados['entradas']),
            'falhas' => $falhas,
        ]);

        return response()->json(['data' => $resultados]);
    }
}
