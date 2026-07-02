<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia;

use App\Domains\Integracao\Welwitschia\Jobs\SincronizarFacturaWelwitschiaJob;
use App\Domains\Payment\Models\Factura;
use App\Domains\Payment\Models\OrdemCompra;
use Illuminate\Support\Facades\Log;

/**
 * Empurra uma ORDEM DA LOJA (addon/pacote — OrdemCompra) do ONDAKA para o ERP Welwitschia,
 * como venda. Complementa o FacturaWelwitschiaSync (que trata só as subscrições da plataforma).
 * Idempotente do lado da API (updateOrCreate por invoice_number). Chamar ao aprovar a ordem.
 */
class OrdemWelwitschiaSync
{
    public static function sincronizar(int $ordemId): void
    {
        try {
            $o = OrdemCompra::find($ordemId);
            if (! $o) {
                return;
            }

            // Cliente: preferir a factura fiscal (FR) emitida; senão o dono da ordem.
            $factura = $o->numero_factura ? Factura::where('numero', $o->numero_factura)->first() : null;
            $o->loadMissing('owner');
            $owner = $o->owner;

            $nome = $factura->destinatario_nome
                ?? ($owner->nome ?? $owner->name ?? 'Cliente ONDAKA');
            $email = $factura->destinatario_email
                ?? ($owner->email_contacto ?? $owner->email ?? null);

            $base = (float) $o->valor_base + (float) $o->valor_activacao;
            $ivaPct = $base > 0 ? round(((float) $o->valor_iva) / $base * 100, 2) : 0.0;
            $total = (float) $o->valor_total;
            $pago = min((float) $o->totalPago(), $total);

            SincronizarFacturaWelwitschiaJob::dispatch([
                'customer_name' => $nome,
                'customer_email' => $email,
                'invoice_number' => $o->numero_factura ?: $o->numero,
                'total_amount' => $total,
                'paid_amount' => $pago,
                'invoice_date' => optional($o->aprovada_em)->toDateString() ?? now()->toDateString(),
                'itens' => [[
                    'descricao' => $o->descricao_item ?: 'Compra ONDAKA',
                    'quantidade' => 1,
                    'preco' => $base,
                    'iva_percent' => $ivaPct,
                ]],
            ])->afterCommit();
        } catch (\Throwable $e) {
            Log::warning('[Welwitschia] falha a preparar sync de ordem', [
                'ordem_id' => $ordemId,
                'erro' => $e->getMessage(),
            ]);
        }
    }
}
