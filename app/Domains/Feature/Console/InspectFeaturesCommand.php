<?php

declare(strict_types=1);

namespace App\Domains\Feature\Console;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use Illuminate\Console\Command;

class InspectFeaturesCommand extends Command
{
    protected $signature = 'feature:inspect
                            {tipo : empresa|condominio}
                            {owner : ID ou slug}';

    protected $description = 'Ver todas as features activas de empresa ou condomínio';

    public function handle(): int
    {
        $tipo = $this->argument('tipo');
        $input = $this->argument('owner');

        $class = match ($tipo) {
            'empresa' => EmpresaGestora::class,
            'condominio' => Condominio::class,
            default => null,
        };

        if (! $class) {
            $this->error("Tipo inválido. Usa 'empresa' ou 'condominio'.");
            return self::FAILURE;
        }

        $owner = is_numeric($input)
            ? $class::find((int) $input)
            : $class::where('slug', $input)->first();

        if (! $owner) {
            $this->error("Owner '{$input}' ({$tipo}) não encontrado.");
            return self::FAILURE;
        }

        $this->info(($owner->nome ?? '') . " (ID {$owner->getKey()})");
        $this->newLine();

        $features = FeatureGate::allActive($owner);

        if (empty($features)) {
            $this->warn('Nenhuma feature activa.');
            return self::SUCCESS;
        }

        $rows = array_map(function ($f) {
            $saldo = $f['modelo_cobranca'] === 'consumable'
                ? "{$f['saldo_actual']}/{$f['saldo_inicial']} {$f['unidade']}"
                : '—';

            $expira = $f['expira_em']
                ? \Carbon\Carbon::parse($f['expira_em'])->format('d/m/Y')
                : '—';

            $flags = [];
            if ($f['saldo_baixo']) $flags[] = '⚠ Saldo baixo';
            if ($f['recarga_automatica']) $flags[] = '🔄 Recarga auto';
            if ($f['renovacao_automatica']) $flags[] = '↻ Renovação auto';

            return [
                $f['slug'],
                $f['nome'],
                ucfirst($f['modelo_cobranca']),
                $saldo,
                $expira,
                implode(' · ', $flags) ?: '—',
            ];
        }, $features);

        $this->table(
            ['Slug', 'Nome', 'Modelo', 'Saldo', 'Expira', 'Flags'],
            $rows,
        );

        $this->line('Total: ' . count($features) . ' features activas');

        return self::SUCCESS;
    }
}
