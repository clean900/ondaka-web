<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Console;

use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Services\FacturaPlataformaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class EmitirFacturasPlataforma extends Command
{
    protected $signature = 'subscricoes:emitir-facturas {--dry-run : Mostra mas não emite}';

    protected $description = 'Emite facturas plataforma para subscrições com trial expirado ou renovação';

    public function handle(FacturaPlataformaService $service): int
    {
        $this->info('🔍 A procurar subscrições para facturação...');

        $emitidas = 0;
        $erros = 0;
        $dryRun = $this->option('dry-run');

        // Cenário 1: Trial expirado, sem factura pendente
        $subsTrialExpirado = Subscricao::where('estado', 'trial')
            ->whereNotNull('trial_expira_em')
            ->where('trial_expira_em', '<=', now())
            ->where('num_imoveis', '>', 0)
            ->get();

        $this->info("Trial expirado encontradas: {$subsTrialExpirado->count()}");

        foreach ($subsTrialExpirado as $sub) {
            $jaTemPendente = DB::table('plataforma_facturas')
                ->where('subscricao_id', $sub->id)
                ->where('estado', 'pendente')
                ->exists();

            if ($jaTemPendente) {
                $this->line("  ⏭️  Subscrição {$sub->id}: já tem factura pendente.");
                continue;
            }

            try {
                if ($dryRun) {
                    $this->line("  📋 [DRY RUN] Subscrição {$sub->id}: emitiria factura ({$sub->ciclo}, {$sub->num_imoveis} imóveis)");
                } else {
                    $factura = $service->emitir($sub);
                    $this->info("  ✅ Subscrição {$sub->id}: factura {$factura['numero']} emitida (" . number_format($factura['valor_total_kz'], 2) . ' Kz)');
                    $emitidas++;
                }
            } catch (\Exception $e) {
                $this->error("  ❌ Subscrição {$sub->id}: " . $e->getMessage());
                $erros++;
            }
        }

        // Cenário 2: Subscrições activas com período a terminar nas próximas 24h
        $subsRenovacao = Subscricao::where('estado', 'activa')
            ->whereNotNull('periodo_actual_fim')
            ->where('periodo_actual_fim', '<=', now()->addDay())
            ->where('renovacao_automatica', true)
            ->where('num_imoveis', '>', 0)
            ->get();

        $this->info("Renovações pendentes: {$subsRenovacao->count()}");

        foreach ($subsRenovacao as $sub) {
            $jaTemPendente = DB::table('plataforma_facturas')
                ->where('subscricao_id', $sub->id)
                ->where('estado', 'pendente')
                ->where('periodo_referencia_inicio', '>=', now()->toDateString())
                ->exists();

            if ($jaTemPendente) {
                $this->line("  ⏭️  Subscrição {$sub->id}: renovação já facturada.");
                continue;
            }

            try {
                if ($dryRun) {
                    $this->line("  📋 [DRY RUN] Subscrição {$sub->id}: renovaria factura");
                } else {
                    $factura = $service->emitir($sub);
                    $this->info("  ✅ Subscrição {$sub->id}: renovação {$factura['numero']} emitida");
                    $emitidas++;
                }
            } catch (\Exception $e) {
                $this->error("  ❌ Subscrição {$sub->id}: " . $e->getMessage());
                $erros++;
            }
        }

        $this->newLine();
        $this->info("✅ Emitidas: {$emitidas}");
        if ($erros > 0) {
            $this->warn("❌ Erros: {$erros}");
        }

        return $erros > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
