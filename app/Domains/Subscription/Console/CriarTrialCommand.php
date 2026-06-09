<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Services\TrialService;
use App\Domains\Subscription\Services\SubscriptionService;
use Illuminate\Console\Command;

class CriarTrialCommand extends Command
{
    protected $signature = 'ondaka:criar-trial
                            {empresa : ID ou slug da empresa gestora}
                            {--show : Apenas mostrar o preço, sem criar trial}';

    protected $description = 'Criar trial de 30 dias para uma empresa gestora';

    public function handle(TrialService $trial, SubscriptionService $sub): int
    {
        $input = $this->argument('empresa');

        $empresa = is_numeric($input)
            ? EmpresaGestora::find((int) $input)
            : EmpresaGestora::where('slug', $input)->first();

        if (! $empresa) {
            $this->error("Empresa '{$input}' não encontrada.");
            return self::FAILURE;
        }

        $this->info("Empresa: {$empresa->nome} (ID {$empresa->id})");
        $this->newLine();

        // Mostrar cálculo de preço
        $mensal = $sub->calcularPrecoMensal($empresa);
        $anual = $sub->calcularPrecoAnual($empresa);

        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Nº de fracções', $mensal['numero_fraccoes']],
                ['Escalão', $mensal['escalao_nome'] ?? '—'],
                ['Preço por fracção', number_format($mensal['preco_por_fraccao'], 2, ',', '.') . ' Kz'],
                ['Valor mensal', number_format($mensal['valor_mensal'], 2, ',', '.') . ' Kz'],
                ['Valor anual (sem desc)', number_format($anual['subtotal_12_meses'], 2, ',', '.') . ' Kz'],
                ['Desconto anual', $anual['desconto_pct'] . '%'],
                ['Valor anual (com desc)', number_format($anual['valor_anual'], 2, ',', '.') . ' Kz'],
            ]
        );

        if ($this->option('show')) {
            return self::SUCCESS;
        }

        if (! $this->confirm('Criar trial de 30 dias para esta empresa?', true)) {
            $this->warn('Cancelado.');
            return self::SUCCESS;
        }

        $subscricao = $trial->iniciar($empresa);

        $this->newLine();
        $this->info('✓ Trial criado!');
        $this->line("  ID: {$subscricao->id}");
        $this->line("  Estado: {$subscricao->estado}");
        $this->line("  Trial expira em: {$subscricao->trial_expira_em?->toDateTimeString()}");
        $this->line("  Grace expira em: {$subscricao->grace_expira_em?->toDateTimeString()}");

        return self::SUCCESS;
    }
}
