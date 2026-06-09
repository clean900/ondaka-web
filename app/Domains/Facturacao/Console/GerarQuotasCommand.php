<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Facturacao\Services\QuotaService;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * Comando manual para gerar quotas de um condomínio num período específico.
 *
 * Útil para:
 * - Geração inicial em condomínio novo
 * - Reposição manual quando algo falhou no cron
 * - Testes
 *
 * Uso:
 *   php artisan quotas:gerar 2 --ano=2026 --mes=5
 *   php artisan quotas:gerar 2 --ano=2026 --mes=5 --user=1
 */
class GerarQuotasCommand extends Command
{
    protected $signature = 'quotas:gerar
                            {condominio : ID do condomínio}
                            {--ano= : Ano (default: ano actual)}
                            {--mes= : Mês 1-12 (default: mês actual)}
                            {--user= : ID do user que origina (default: nenhum)}
                            {--origem=manual : automatica ou manual}';

    protected $description = 'Gera quotas mensais para todas as fracções com contrato activo';

    public function handle(QuotaService $service): int
    {
        $condominioId = (int) $this->argument('condominio');
        $condominio = Condominio::find($condominioId);

        if (! $condominio) {
            $this->error("Condomínio #{$condominioId} não encontrado.");
            return self::FAILURE;
        }

        $ano = (int) ($this->option('ano') ?? now()->year);
        $mes = (int) ($this->option('mes') ?? now()->month);

        if ($mes < 1 || $mes > 12) {
            $this->error('Mês inválido. Tem de ser entre 1 e 12.');
            return self::FAILURE;
        }

        $userId = $this->option('user');
        $user = $userId ? User::find((int) $userId) : null;

        $origem = $this->option('origem') === 'automatica'
            ? Quota::ORIGEM_AUTOMATICA
            : Quota::ORIGEM_MANUAL;

        $this->info("Gerando quotas para {$condominio->nome} — período {$mes}/{$ano} (origem: {$origem})");
        $this->newLine();

        $resultado = $service->gerarQuotasParaPeriodo(
            condominioId: $condominio->id,
            empresaGestoraId: $condominio->empresa_gestora_id,
            ano: $ano,
            mes: $mes,
            por: $user,
            origem: $origem,
        );

        // Resumo
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Geradas', $resultado['geradas']],
                ['Já existem', $resultado['ignoradas_ja_existem']],
                ['Sem contrato', $resultado['ignoradas_sem_contrato']],
                ['Sem valores', $resultado['ignoradas_sem_valores']],
                ['Total facturado (Kz)', number_format($resultado['total_kz'], 2, ',', '.')],
            ]
        );

        // Detalhes só se for verbose ou houve geração
        if ($this->getOutput()->isVerbose() || $resultado['geradas'] > 0) {
            $this->newLine();
            $this->info('Detalhes por fracção:');
            $linhas = [];
            foreach ($resultado['detalhes'] as $d) {
                $linhas[] = [
                    $d['identificador'],
                    $d['status'],
                    $d['mensagem'],
                    $d['valor_total'] ? number_format($d['valor_total'], 2) . ' Kz' : '—',
                ];
            }
            $this->table(['Fracção', 'Estado', 'Mensagem', 'Valor'], $linhas);
        }

        $this->newLine();
        $this->info("✓ Concluído. Geradas: {$resultado['geradas']}");

        return self::SUCCESS;
    }
}
