<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Welwitschia\Jobs\SincronizarFacturaWelwitschiaJob;
use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Prepara e despacha o sync de uma factura da plataforma ONDAKA para a
 * Welwitschia (como venda). Idempotente do lado da API — chamar na emissão
 * (pendente) e no pagamento (paga) actualiza a mesma factura.
 */
class FacturaWelwitschiaSync
{
    public static function sincronizar(int $facturaId): void
    {
        try {
            $f = DB::table('plataforma_facturas')->where('id', $facturaId)->first();
            if (! $f) {
                return;
            }

            $sub = Subscricao::find($f->subscricao_id);
            $empresa = $sub ? EmpresaGestora::find($sub->empresa_gestora_id) : null;
            if (! $empresa) {
                return;
            }

            $total = (float) $f->valor_total_kz;
            $pago = ($f->estado ?? null) === 'paga' ? $total : 0.0;

            SincronizarFacturaWelwitschiaJob::dispatch([
                'customer_name' => $empresa->nome,
                'customer_email' => $empresa->email_contacto,
                'invoice_number' => $f->numero,
                'total_amount' => $total,
                'paid_amount' => $pago,
                'invoice_date' => $f->data_emissao ? substr((string) $f->data_emissao, 0, 10) : null,
                'due_date' => $f->data_vencimento ? substr((string) $f->data_vencimento, 0, 10) : null,
            ])->afterCommit();
        } catch (\Throwable $e) {
            Log::warning('[Welwitschia] falha a preparar sync de factura', [
                'factura_id' => $facturaId,
                'erro' => $e->getMessage(),
            ]);
        }
    }
}
