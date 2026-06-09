<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Facturacao\Models\Pagamento;
use Illuminate\Console\Command;

/**
 * Soft-delete de pagamentos rejeitados/devolvidos antigos.
 *
 * Schedule: semanal (Domingo 04:00 — definido em routes/console.php)
 *
 * Critério: pagamentos com:
 *   - estado in (rejeitado, devolvido)
 *   - rejeitado_em < (hoje - dias) — ou updated_at se rejeitado_em null
 *
 * Soft-delete preserva audit trail. Pagamentos podem ser
 * recuperados via Pagamento::onlyTrashed().
 *
 * Uso manual:
 *   php artisan pagamentos:limpar-rejeitados
 *   php artisan pagamentos:limpar-rejeitados --dias=180
 *   php artisan pagamentos:limpar-rejeitados --dry-run
 */
class LimparPagamentosRejeitadosCommand extends Command
{
    protected $signature = 'pagamentos:limpar-rejeitados
                            {--dias=90 : Idade mínima em dias}
                            {--dry-run : Apenas simula, não actualiza}';

    protected $description = 'Soft-delete pagamentos rejeitados/devolvidos há mais de N dias';

    public function handle(): int
    {
        $dias = (int) $this->option('dias');
        $dryRun = (bool) $this->option('dry-run');

        if ($dias < 30) {
            $this->error('Mínimo permitido: 30 dias (segurança).');
            return self::FAILURE;
        }

        $dataLimite = now()->subDays($dias);

        $this->info("=== Limpeza pagamentos rejeitados/devolvidos — " . now()->toDateTimeString() . " ===");
        $this->info("Critério: estado in (rejeitado, devolvido) E última actualização < " . $dataLimite->toDateString());
        if ($dryRun) {
            $this->warn('MODO DRY-RUN — nada será gravado.');
        }
        $this->newLine();

        $query = Pagamento::query()
            ->whereIn('estado', [
                Pagamento::ESTADO_REJEITADO,
                Pagamento::ESTADO_DEVOLVIDO,
            ])
            ->where(function ($q) use ($dataLimite) {
                $q->where('rejeitado_em', '<', $dataLimite)
                    ->orWhere(function ($qq) use ($dataLimite) {
                        $qq->whereNull('rejeitado_em')
                            ->where('updated_at', '<', $dataLimite);
                    });
            });

        $candidatos = $query->get();

        if ($candidatos->isEmpty()) {
            $this->info('Nenhum pagamento elegível para limpeza.');
            return self::SUCCESS;
        }

        $this->info("Encontrados {$candidatos->count()} pagamentos elegíveis.");
        $this->newLine();

        $linhas = [];
        $apagados = 0;

        foreach ($candidatos as $p) {
            $linhas[] = [
                $p->referencia,
                $p->estado,
                $p->valor . ' Kz',
                ($p->rejeitado_em ?? $p->updated_at)?->toDateString(),
                $dryRun ? 'dry-run' : 'apagado',
            ];

            if (! $dryRun) {
                $p->delete();
                $apagados++;
            }
        }

        $this->table(
            ['Referência', 'Estado', 'Valor', 'Última actualização', 'Acção'],
            $linhas
        );

        $this->newLine();
        if ($dryRun) {
            $this->info("Seriam apagados: {$candidatos->count()}");
        } else {
            $this->info("Apagados: {$apagados}");
            $this->info('(Recuperáveis via Pagamento::onlyTrashed())');
        }

        return self::SUCCESS;
    }
}
