<?php

declare(strict_types=1);

namespace App\Domains\Payment\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Payment\Services\OrderService;
use Illuminate\Console\Command;

class CriarOrdemTesteCommand extends Command
{
    protected $signature = 'ordens:criar-teste
                            {empresa : ID da empresa}
                            {feature : slug da feature}
                            {--pacote= : slug do pacote}
                            {--meses=1 : meses para subscrições}';

    protected $description = 'Criar ordem de teste (para QA)';

    public function handle(OrderService $orderService): int
    {
        $empresa = EmpresaGestora::find((int) $this->argument('empresa'));
        if (! $empresa) {
            $this->error('Empresa não encontrada.');
            return self::FAILURE;
        }

        $feature = Feature::where('slug', $this->argument('feature'))->first();
        if (! $feature) {
            $this->error('Feature não encontrada.');
            return self::FAILURE;
        }

        if ($feature->ehConsumivel()) {
            $pacoteSlug = $this->option('pacote');
            if (! $pacoteSlug) {
                $this->error('Para consumíveis precisa --pacote=');
                return self::FAILURE;
            }

            $pacote = FeaturePacote::where('feature_id', $feature->id)
                ->where('slug', $pacoteSlug)
                ->first();

            if (! $pacote) {
                $this->error("Pacote '{$pacoteSlug}' não existe.");
                return self::FAILURE;
            }

            $ordem = $orderService->criarOrdemPacote($empresa, $pacote);
        } else {
            $meses = (int) $this->option('meses');
            $ordem = $orderService->criarOrdemSubscricao($empresa, $feature, $meses);
        }

        $this->info('✓ Ordem criada');
        $this->line('  Número: '.$ordem->numero);
        $this->line('  Descrição: '.$ordem->descricao_item);
        $this->line('  Valor base: '.number_format((float) $ordem->valor_base, 0, ',', '.').' Kz');
        if ($ordem->valor_activacao > 0) {
            $this->line('  Activação: '.number_format((float) $ordem->valor_activacao, 0, ',', '.').' Kz');
        }
        $this->line('  IVA (14%): '.number_format((float) $ordem->valor_iva, 0, ',', '.').' Kz');
        $this->line('  Total: '.number_format((float) $ordem->valor_total, 0, ',', '.').' Kz');
        $this->line('  Prazo pagamento: '.$ordem->prazo_pagamento->format('d/m/Y'));

        return self::SUCCESS;
    }
}
