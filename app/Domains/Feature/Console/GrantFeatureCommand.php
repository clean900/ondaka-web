<?php

declare(strict_types=1);

namespace App\Domains\Feature\Console;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;

class GrantFeatureCommand extends Command
{
    protected $signature = 'feature:grant
                            {tipo : empresa|condominio}
                            {owner : ID ou slug}
                            {feature : slug da feature}
                            {--pacote= : slug do pacote (para consumíveis)}
                            {--quantidade= : quantidade para consumíveis (ignora pacote)}
                            {--meses=1 : duração em meses para subscrições}
                            {--notas= : notas administrativas}';

    protected $description = 'Activar feature manualmente para empresa ou condomínio (super-admin)';

    public function handle(): int
    {
        $tipo = $this->argument('tipo');
        $ownerInput = $this->argument('owner');
        $featureSlug = $this->argument('feature');

        // Resolver owner
        $owner = $this->resolverOwner($tipo, $ownerInput);
        if (! $owner) {
            $this->error("Owner '{$ownerInput}' ({$tipo}) não encontrado.");
            return self::FAILURE;
        }

        // Resolver feature
        $feature = Feature::where('slug', $featureSlug)->first();
        if (! $feature) {
            $this->error("Feature '{$featureSlug}' não existe.");
            return self::FAILURE;
        }

        $this->info('Owner: ' . ($owner->nome ?? $owner->id));
        $this->info('Feature: ' . $feature->nome);
        $this->info('Modelo: ' . $feature->modelo_cobranca_label);
        $this->newLine();

        // Verificar se já existe subscription
        $existente = FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->getKey())
            ->whereIn('estado', ['activa', 'pendente'])
            ->first();

        if ($existente && ! $feature->ehConsumivel()) {
            $this->warn('Subscrição já existe (ID ' . $existente->id . '). Não é consumível, não faz sentido duplicar.');
            return self::FAILURE;
        }

        // Executar conforme modelo
        $sub = match ($feature->modelo_cobranca) {
            'consumable' => $this->activarConsumivel($owner, $feature, $existente),
            'subscription' => $this->activarSubscricao($owner, $feature),
            'one_time' => $this->activarUnica($owner, $feature),
            default => null,
        };

        if (! $sub) {
            return self::FAILURE;
        }

        $this->newLine();
        $this->info('✓ Feature activada!');
        $this->line('  Subscription ID: ' . $sub->id);
        $this->line('  Estado: ' . $sub->estado_label);
        if ($sub->saldo_actual > 0) {
            $this->line('  Saldo: ' . $sub->saldo_actual . ' ' . ($feature->unidade ?? 'unidades'));
        }
        if ($sub->expira_em) {
            $this->line('  Expira em: ' . $sub->expira_em->toDateTimeString());
        }

        return self::SUCCESS;
    }

    private function resolverOwner(string $tipo, string $input): ?Model
    {
        $class = match ($tipo) {
            'empresa' => EmpresaGestora::class,
            'condominio' => Condominio::class,
            default => null,
        };

        if (! $class) {
            return null;
        }

        if (is_numeric($input)) {
            return $class::find((int) $input);
        }

        return $class::where('slug', $input)->first();
    }

    private function activarConsumivel(Model $owner, Feature $feature, ?FeatureSubscription $existente): ?FeatureSubscription
    {
        $quantidade = 0;
        $valorPago = 0.0;

        if ($this->option('quantidade')) {
            $quantidade = (int) $this->option('quantidade');
        } elseif ($pacoteSlug = $this->option('pacote')) {
            $pacote = FeaturePacote::where('feature_id', $feature->id)
                ->where('slug', $pacoteSlug)
                ->first();

            if (! $pacote) {
                $this->error("Pacote '{$pacoteSlug}' não existe para esta feature.");
                $this->line('Pacotes disponíveis:');
                foreach ($feature->pacotes as $p) {
                    $this->line("  - {$p->slug}: {$p->quantidade} {$feature->unidade} por {$p->preco_formatado}");
                }
                return null;
            }

            $quantidade = $pacote->quantidade;
            $valorPago = (float) $pacote->preco;
            $this->line("Pacote: {$pacote->nome} ({$quantidade} {$feature->unidade} por {$pacote->preco_formatado})");
        } else {
            $this->error('Para consumíveis indica --pacote= ou --quantidade=');
            return null;
        }

        // Existe subscription → adiciona saldo
        if ($existente) {
            $existente->adicionarSaldo($quantidade, $valorPago);
            if ($notas = $this->option('notas')) {
                $existente->update(['notas_admin' => $notas]);
            }
            return $existente;
        }

        // Criar nova
        $sub = FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->getKey(),
            'estado' => 'activa',
            'activada_em' => now(),
            'saldo_inicial' => $quantidade,
            'saldo_actual' => $quantidade,
            'saldo_utilizado' => 0,
            'valor_pago_total' => $valorPago,
            'notas_admin' => $this->option('notas'),
        ]);

        return $sub;
    }

    private function activarSubscricao(Model $owner, Feature $feature): ?FeatureSubscription
    {
        $meses = max(1, (int) $this->option('meses'));
        $expiraEm = now()->addMonths($meses);

        $valorTotal = (float) $feature->preco_base * $meses + (float) $feature->preco_activacao;

        $sub = FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->getKey(),
            'estado' => 'activa',
            'activada_em' => now(),
            'expira_em' => $expiraEm,
            'renovacao_automatica' => true,
            'valor_pago_total' => $valorTotal,
            'notas_admin' => $this->option('notas'),
        ]);

        $this->line("Duração: {$meses} mês" . ($meses > 1 ? 'es' : ''));
        $this->line('Valor cobrado: ' . number_format($valorTotal, 0, ',', '.') . ' Kz');

        return $sub;
    }

    private function activarUnica(Model $owner, Feature $feature): ?FeatureSubscription
    {
        $valor = (float) $feature->preco_base + (float) $feature->preco_activacao;

        $sub = FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->getKey(),
            'estado' => 'activa',
            'activada_em' => now(),
            'valor_pago_total' => $valor,
            'notas_admin' => $this->option('notas'),
        ]);

        $this->line('Valor único: ' . number_format($valor, 0, ',', '.') . ' Kz');

        return $sub;
    }
}
