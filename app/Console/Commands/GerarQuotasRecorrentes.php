<?php

namespace App\Console\Commands;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Services\QuotaService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Notifications\QuotaEmitidaNotification;

class GerarQuotasRecorrentes extends Command
{
    protected $signature = 'quotas:gerar-recorrente
                            {--dry-run : Apenas mostrar o que seria gerado, sem criar}
                            {--condominio= : ID específico de condomínio (ignora dia_geracao)}
                            {--mes= : Mês alvo (YYYY-MM), default mês actual}';

    protected $description = 'Gera quotas mensais automaticamente para condomínios elegíveis (corre diariamente via schedule).';

    public function handle(QuotaService $quotaService): int
    {
        $dryRun = $this->option('dry-run');
        $condominioForcado = $this->option('condominio');

        $mesOpt = $this->option('mes');
        if ($mesOpt) {
            try {
                $alvo = Carbon::createFromFormat('Y-m', $mesOpt)->startOfMonth();
            } catch (\Exception $e) {
                $this->error('Formato de --mes inválido. Use YYYY-MM.');
                return self::FAILURE;
            }
        } else {
            $alvo = now()->startOfMonth();
        }

        $hoje = now()->day;

        $this->info("=== Geração de quotas recorrentes ===");
        $this->line("Mês alvo: {$alvo->format('Y-m')}");
        $this->line("Dia actual: {$hoje}");
        $this->line($dryRun ? "MODO DRY-RUN (não grava nada)" : "Execução real");

        // Buscar configs elegíveis
        $query = CondominioFacturacaoConfig::where('geracao_automatica', true);
        if ($condominioForcado) {
            $query->where('condominio_id', $condominioForcado);
            $this->warn("Condomínio forçado: {$condominioForcado} (ignora dia_geracao)");
        } else {
            $query->where('dia_geracao', $hoje);
        }

        $configs = $query->get();
        $this->line("Condomínios elegíveis hoje: {$configs->count()}");

        if ($configs->isEmpty()) {
            $this->line("Nada a fazer.");
            return self::SUCCESS;
        }

        $totalGeradas = 0;
        $totalIgnoradas = 0;

        foreach ($configs as $config) {
            $this->newLine();
            $this->info("--- Condomínio #{$config->condominio_id} (empresa {$config->empresa_gestora_id}) ---");

            // Verificar se já existem quotas para o mês alvo
            $jaExistem = \App\Domains\Facturacao\Models\Quota::where('condominio_id', $config->condominio_id)
                ->where('ano', $alvo->year)
                ->where('mes', $alvo->month)
                ->count();

            if ($jaExistem > 0) {
                $this->warn("  ! Já existem {$jaExistem} quotas para {$alvo->format('Y-m')}. Salto.");
                continue;
            }

            if ($dryRun) {
                $this->line("  [DRY] Geraria quotas para condomínio {$config->condominio_id}");
                continue;
            }

            try {
                $stats = $quotaService->gerarQuotasParaPeriodo(
                    condominioId: $config->condominio_id,
                    empresaGestoraId: $config->empresa_gestora_id,
                    ano: $alvo->year,
                    mes: $alvo->month,
                    por: null,
                    origem: 'automatica'
                );

                $this->line("  ✓ Geradas: {$stats['geradas']} | Ignoradas: " . ($stats['ignoradas_ja_existem'] + $stats['ignoradas_sem_contrato'] + $stats['ignoradas_sem_valores']));
                $this->line("  Total: " . number_format($stats['total_kz'], 2, ',', '.') . " Kz");

                // ===== Notificar condóminos =====
                if ($stats['geradas'] > 0) {
                    $quotasNovas = \App\Domains\Facturacao\Models\Quota::with(['fraccao.condominio'])
                        ->where('condominio_id', $config->condominio_id)
                        ->where('ano', $alvo->year)
                        ->where('mes', $alvo->month)
                        ->get();

                    $notificadosCount = 0;
                    foreach ($quotasNovas as $quota) {
                        $fraccao = $quota->fraccao;
                        if (!$fraccao) continue;
                        $condominio = $fraccao->condominio;
                        if (!$condominio) continue;

                        // Buscar proprietários/utilizadores via contrato activo
                        $contratos = \DB::table('contratos_ocupacao')
                            ->where('fraccao_id', $fraccao->id)
                            ->where('estado', 'activo')
                            ->whereNull('deleted_at')
                            ->get(['condomino_id']);

                        $userIds = [];
                        foreach ($contratos as $contrato) {
                            $cond = \DB::table('condominos')
                                ->where('id', $contrato->condomino_id)
                                ->whereNotNull('user_id')
                                ->first(['user_id', 'nome_completo']);
                            if ($cond && $cond->user_id) {
                                $userIds[$cond->user_id] = $cond->nome_completo;
                            }
                        }

                        foreach ($userIds as $userId => $nome) {
                            $user = \App\Models\User::find($userId);
                            if (!$user) continue;
                            try {
                                $user->notify(new QuotaEmitidaNotification(
                                    nome: $nome ?? $user->name,
                                    imovel: $fraccao->identificador,
                                    condominio: $condominio->nome,
                                    periodo: $alvo->format('m/Y'),
                                    valor: number_format($quota->valor_total, 2, ',', '.'),
                                    vencimento: $quota->data_vencimento ? \Carbon\Carbon::parse($quota->data_vencimento)->format('d/m/Y') : '—',
                                    quotaId: $quota->id,
                                ));
                                $notificadosCount++;
                            } catch (\Throwable $e) {
                                Log::warning("Falha a notificar user {$userId}: " . $e->getMessage());
                            }
                        }
                    }
                    $this->line("  → Notificados {$notificadosCount} utilizadores.");
                }

                $totalGeradas += $stats['geradas'];
                $totalIgnoradas += ($stats['ignoradas_ja_existem'] + $stats['ignoradas_sem_contrato'] + $stats['ignoradas_sem_valores']);

                Log::channel('daily')->info("[quotas:gerar-recorrente] Condomínio {$config->condominio_id}: geradas={$stats['geradas']}, total={$stats['total_kz']}");
            } catch (\Throwable $e) {
                $this->error("  ✗ Erro: " . $e->getMessage());
                Log::error("[quotas:gerar-recorrente] Falha no condomínio {$config->condominio_id}: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("=== Resumo ===");
        $this->line("Total geradas: {$totalGeradas}");
        $this->line("Total ignoradas: {$totalIgnoradas}");

        return self::SUCCESS;
    }
}
