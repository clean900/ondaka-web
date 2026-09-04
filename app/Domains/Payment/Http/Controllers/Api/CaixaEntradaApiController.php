<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers\Api;

use App\Domains\Payment\Models\ProxyPayPagamentoRecebido;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * CAIXA DE ENTRADA ProxyPay — leitura pelos outros sistemas (Fase 2).
 *
 * A conta ProxyPay é partilhada e só há um webhook, que aponta para o ONDAKA.
 * Desde 4 Set 2026 o ONDAKA regista TUDO o que a ProxyPay entrega, incluindo o
 * que não é dele. Este controlador é a porta por onde os outros sistemas
 * (Welwitschia, Academia Digital, BWEFACIL) vêm buscar o que lhes pertence.
 *
 * REGRA DE OURO: o ONDAKA NÃO decide de quem é o pagamento. Devolve a lista dos
 * que ninguém reclamou e cada sistema reconhece — pelas referências que ele
 * próprio emitiu — quais são seus. Um sistema não consegue reclamar o que não é
 * dele porque não sabe que referências emitiu outro; e mesmo que tentasse, o
 * pagamento continuaria a ter de bater certo com um documento do lado dele.
 *
 * Autenticação: segredo partilhado no cabeçalho X-Caixa-Token, comparado em
 * tempo constante. Servidor-a-servidor, dentro do mesmo cPanel.
 */
class CaixaEntradaApiController extends Controller
{
    /** Pagamentos que ainda ninguém reclamou. */
    public function index(Request $request): JsonResponse
    {
        if (! $this->autenticado($request)) {
            return response()->json(['erro' => 'nao autorizado'], 401);
        }

        $limite = min(200, max(1, (int) $request->query('limite', '100')));

        $linhas = ProxyPayPagamentoRecebido::porReclamar()
            ->orderBy('id')
            ->limit($limite)
            ->get(['id', 'reference_id', 'payment_id', 'amount', 'sistema', 'custom_fields', 'recebido_em']);

        return response()->json([
            'total_por_reclamar' => ProxyPayPagamentoRecebido::porReclamar()->count(),
            'pagamentos' => $linhas,
        ]);
    }

    /**
     * Um sistema reclama um pagamento que reconheceu como seu.
     *
     * Idempotente e à prova de corrida: só marca se ainda estiver por reclamar,
     * e devolve quem o reclamou quando já estava. Se dois sistemas pedirem o
     * mesmo (não devia acontecer, mas não se confia em "não devia"), só o
     * primeiro fica com ele.
     */
    public function reclamar(Request $request, int $id): JsonResponse
    {
        if (! $this->autenticado($request)) {
            return response()->json(['erro' => 'nao autorizado'], 401);
        }

        $sistema = trim((string) $request->input('sistema', ''));

        if ($sistema === '') {
            return response()->json(['erro' => 'indique o sistema que reclama'], 422);
        }

        $pagamento = ProxyPayPagamentoRecebido::find($id);

        if (! $pagamento) {
            return response()->json(['erro' => 'pagamento nao encontrado'], 404);
        }

        // Só o primeiro fica com ele. O update condicional resolve a corrida sem
        // transacção: ou actualizou 1 linha, ou alguém chegou primeiro.
        $marcou = ProxyPayPagamentoRecebido::where('id', $id)
            ->whereNull('consumido_por')
            ->update([
                'consumido_por' => substr($sistema, 0, 60),
                'consumido_em' => now(),
                'updated_at' => now(),
            ]);

        $pagamento->refresh();

        if (! $marcou && $pagamento->consumido_por !== $sistema) {
            Log::warning('Caixa ProxyPay: tentativa de reclamar um pagamento já reclamado', [
                'pagamento' => $id,
                'pediu' => $sistema,
                'pertence_a' => $pagamento->consumido_por,
            ]);

            return response()->json([
                'erro' => 'ja reclamado',
                'consumido_por' => $pagamento->consumido_por,
            ], 409);
        }

        return response()->json([
            'ok' => true,
            'consumido_por' => $pagamento->consumido_por,
            'consumido_em' => $pagamento->consumido_em,
        ]);
    }

    /** Segredo partilhado, comparado em tempo constante. */
    private function autenticado(Request $request): bool
    {
        $esperado = (string) config('services.proxypay_caixa.token');

        if ($esperado === '') {
            Log::warning('Caixa ProxyPay: PROXYPAY_CAIXA_TOKEN por configurar — acesso recusado.');

            return false;
        }

        return hash_equals($esperado, (string) $request->header('X-Caixa-Token', ''));
    }
}
