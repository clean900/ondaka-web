<?php

declare(strict_types=1);

namespace App\Domains\Feature\Services;

use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class RecargaAutoService
{
    /**
     * Encontra todas as subscriptions que precisam de recarga automática.
     *
     * Critérios:
     * - recarga_automatica = true
     * - estado = activa
     * - feature = consumable
     * - saldo_actual <= recarga_limite_baixo
     * - recarga_pacote_id definido
     */
    public function encontrarCandidatas(): Collection
    {
        return FeatureSubscription::with(['feature', 'recargaPacote', 'owner'])
            ->where('recarga_automatica', true)
            ->where('estado', 'activa')
            ->whereNotNull('recarga_pacote_id')
            ->whereNotNull('recarga_limite_baixo')
            ->whereColumn('saldo_actual', '<=', 'recarga_limite_baixo')
            ->whereHas('feature', fn ($q) => $q->where('modelo_cobranca', 'consumable'))
            ->get();
    }

    /**
     * Dispara recarga para uma subscription.
     *
     * Cria uma ordem de compra automática (a ser implementada na Fase 3).
     * Por agora, apenas loga a necessidade.
     */
    public function dispararRecarga(FeatureSubscription $sub): bool
    {
        $pacote = $sub->recargaPacote;
        if (! $pacote) {
            Log::warning('Recarga auto: sem pacote definido', [
                'subscription_id' => $sub->id,
            ]);
            return false;
        }

        // FASE 3: Criar OrdemCompra + Pagamento
        // Por agora, apenas regista intenção
        Log::info('Recarga automática necessária', [
            'subscription_id' => $sub->id,
            'feature' => $sub->feature?->slug,
            'owner_type' => $sub->owner_type,
            'owner_id' => $sub->owner_id,
            'saldo_actual' => $sub->saldo_actual,
            'limite' => $sub->recarga_limite_baixo,
            'pacote' => $pacote->nome,
            'valor' => $pacote->preco,
            'quantidade' => $pacote->quantidade,
        ]);

        return true;
    }

    /**
     * Configura recarga automática numa subscription.
     */
    public function configurar(
        FeatureSubscription $sub,
        FeaturePacote $pacote,
        int $limiteBaixo,
    ): bool {
        if ($pacote->feature_id !== $sub->feature_id) {
            Log::warning('Pacote não pertence à feature da subscription', [
                'sub_feature_id' => $sub->feature_id,
                'pacote_feature_id' => $pacote->feature_id,
            ]);
            return false;
        }

        $sub->update([
            'recarga_automatica' => true,
            'recarga_pacote_id' => $pacote->id,
            'recarga_limite_baixo' => $limiteBaixo,
        ]);

        return true;
    }

    /**
     * Desactiva recarga automática.
     */
    public function desactivar(FeatureSubscription $sub): void
    {
        $sub->update([
            'recarga_automatica' => false,
            'recarga_pacote_id' => null,
            'recarga_limite_baixo' => null,
        ]);
    }

    /**
     * Subscriptions com saldo baixo (para alertas, mesmo sem recarga auto).
     */
    public function subscriptionsComSaldoBaixo(): Collection
    {
        return FeatureSubscription::with(['feature', 'owner'])
            ->where('estado', 'activa')
            ->whereHas('feature', fn ($q) => $q->where('modelo_cobranca', 'consumable'))
            ->get()
            ->filter(fn (FeatureSubscription $s) => $s->saldoBaixo());
    }
}
