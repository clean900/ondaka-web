<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia\Console;

use App\Domains\Integracao\Welwitschia\WelwitschiaClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Backfill: empurra as facturas da plataforma ONDAKA para a Welwitschia como
 * vendas (idempotente por invoice_number). Ping antes; --dry mostra sem enviar.
 */
class WelwitschiaSyncFacturasCommand extends Command
{
    protected $signature = 'welwitschia:sync-facturas {--dry : Mostra o que seria enviado, sem enviar}';

    protected $description = 'Empurra as facturas da plataforma ONDAKA para a Welwitschia como vendas.';

    public function handle(WelwitschiaClient $welw): int
    {
        if (! $welw->configurado()) {
            $this->error('WELWITSCHIA_TOKEN / WELWITSCHIA_URL não configurados no .env.');
            return self::FAILURE;
        }

        $ping = $welw->ping();
        if (! ($ping['ok'] ?? false)) {
            $this->error('Ping falhou. Resposta: ' . json_encode($ping));
            return self::FAILURE;
        }
        $this->info('Ligado à Welwitschia — filial: ' . ($ping['token'] ?? '?') . '.');

        $facturas = DB::table('plataforma_facturas as f')
            ->join('subscricoes as s', 's.id', '=', 'f.subscricao_id')
            ->join('empresas_gestoras as e', 'e.id', '=', 's.empresa_gestora_id')
            ->where('f.estado', '!=', 'anulada')
            ->orderBy('f.id')
            ->get([
                'f.numero', 'f.valor_total_kz', 'f.subtotal_kz', 'f.imposto_taxa_pct',
                'f.num_imoveis_facturado', 'f.periodo_referencia_inicio', 'f.periodo_referencia_fim',
                'f.estado', 'f.data_emissao', 'f.data_vencimento',
                'e.nome as empresa_nome', 'e.email_contacto as empresa_email',
            ]);

        $dry = (bool) $this->option('dry');
        $this->info(($dry ? '[DRY] ' : '') . "A sincronizar {$facturas->count()} factura(s)...");

        $ok = 0; $falhou = 0;
        foreach ($facturas as $f) {
            $total = (float) $f->valor_total_kz;
            $pago = $f->estado === 'paga' ? $total : 0.0;
            $desc = 'Subscrição ONDAKA — ' . $f->num_imoveis_facturado . ' imóvel(is) ('
                . substr((string) $f->periodo_referencia_inicio, 0, 10) . ' a '
                . substr((string) $f->periodo_referencia_fim, 0, 10) . ')';
            $payload = [
                'customer_name' => $f->empresa_nome,
                'customer_email' => $f->empresa_email,
                'invoice_number' => $f->numero,
                'total_amount' => $total,
                'paid_amount' => $pago,
                'invoice_date' => $f->data_emissao ? substr((string) $f->data_emissao, 0, 10) : null,
                'due_date' => $f->data_vencimento ? substr((string) $f->data_vencimento, 0, 10) : null,
                'itens' => [[
                    'descricao' => $desc,
                    'quantidade' => 1,
                    'preco' => (float) $f->subtotal_kz,
                    'iva_percent' => (float) ($f->imposto_taxa_pct ?? 0),
                ]],
            ];

            if ($dry) {
                $this->line("  · {$f->numero} — {$f->empresa_nome} — " . number_format($total, 2) . " Kz ({$f->estado})");
                continue;
            }

            $resp = $welw->criarFactura($payload);
            if ($resp->successful()) {
                $ok++;
                $this->line("  ✓ {$f->numero}");
            } else {
                $falhou++;
                $this->line("  ✗ {$f->numero} — HTTP {$resp->status()}");
            }
        }

        if (! $dry) {
            $this->info("Concluído: {$ok} sincronizada(s), {$falhou} falha(s).");
        }

        return self::SUCCESS;
    }
}
