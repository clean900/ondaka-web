<?php

declare(strict_types=1);

namespace App\Domains\Feature\Services;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureGate
{
    /**
     * Tempo de cache para lookup de Feature (não muda frequentemente)
     */
    protected const FEATURE_CACHE_TTL = 300; // 5 min

    /**
     * Verifica se um owner (Empresa ou Condomínio) tem uma feature activa.
     *
     * Uso:
     *   FeatureGate::has($empresa, 'sms_sender_id')
     *   FeatureGate::has($condominio, 'proxypay_rps')
     *
     * Retorna true apenas se:
     *   - Existe subscription para este slug + owner
     *   - Estado = activa
     *   - Se tem expira_em, ainda não passou
     *   - Se é consumível, tem saldo > 0
     */
    public static function has(Model $owner, string $featureSlug): bool
    {
        $sub = self::getSubscription($owner, $featureSlug);
        return $sub !== null && $sub->estaActiva();
    }

    /**
     * Consome saldo de uma feature consumível.
     *
     * Uso:
     *   FeatureGate::consume($empresa, 'sms_sender_id', 1, 'sms_enviado', $factura)
     *
     * Retorna false se:
     *   - Feature não existe ou não está activa para o owner
     *   - Saldo insuficiente
     *   - Erro na transacção
     */
    public static function consume(
        Model $owner,
        string $featureSlug,
        int $quantidade = 1,
        string $acao = 'uso_generico',
        ?Model $referenciavel = null,
        ?array $metadata = null,
        ?int $userId = null,
    ): bool {
        $sub = self::getSubscription($owner, $featureSlug);

        if (! $sub || ! $sub->estaActiva()) {
            return false;
        }

        return $sub->consumir($quantidade, $acao, $referenciavel, $metadata, $userId);
    }

    /**
     * Saldo actual de uma feature consumível.
     *
     * Uso:
     *   $saldoSms = FeatureGate::balance($empresa, 'sms_sender_id');
     *
     * Retorna 0 se feature não existe ou não está activa.
     */
    public static function balance(Model $owner, string $featureSlug): int
    {
        $sub = self::getSubscription($owner, $featureSlug);
        return (int) ($sub?->saldo_actual ?? 0);
    }

    /**
     * Configuração específica da feature activa.
     *
     * Uso:
     *   $sender = FeatureGate::config($empresa, 'sms_sender_id', 'sender_name');
     *   $todasConfigs = FeatureGate::config($empresa, 'white_label');
     *
     * Retorna default se feature não está activa.
     */
    public static function config(
        Model $owner,
        string $featureSlug,
        ?string $key = null,
        mixed $default = null,
    ): mixed {
        $sub = self::getSubscription($owner, $featureSlug);

        if (! $sub || ! $sub->estaActiva()) {
            return $default;
        }

        $cfg = $sub->configuracao ?? [];

        if ($key === null) {
            return $cfg;
        }

        return data_get($cfg, $key, $default);
    }

    /**
     * Lista todas as features activas de um owner, com detalhes.
     *
     * Retorna array de:
     *   ['slug' => ..., 'nome' => ..., 'saldo' => ..., 'expira_em' => ...]
     */
    public static function allActive(Model $owner): array
    {
        return FeatureSubscription::with('feature')
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->getKey())
            ->where('estado', 'activa')
            ->get()
            ->filter(fn (FeatureSubscription $s) => $s->estaActiva())
            ->map(fn (FeatureSubscription $s) => [
                'subscription_id' => $s->id,
                'slug' => $s->feature?->slug,
                'nome' => $s->feature?->nome,
                'modelo_cobranca' => $s->feature?->modelo_cobranca,
                'unidade' => $s->feature?->unidade,
                'saldo_actual' => $s->saldo_actual,
                'saldo_inicial' => $s->saldo_inicial,
                'saldo_utilizado' => $s->saldo_utilizado,
                'expira_em' => $s->expira_em?->toIso8601String(),
                'saldo_baixo' => $s->saldoBaixo(),
                'renovacao_automatica' => $s->renovacao_automatica,
                'recarga_automatica' => $s->recarga_automatica,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Obtém a FeatureSubscription activa ou pendente de um owner para um slug.
     * Método primário usado pelos outros.
     *
     * Nota: usa cache de `Feature` (não muda), mas busca sempre FeatureSubscription
     * fresh (saldo muda constantemente).
     */
    public static function getSubscription(Model $owner, string $featureSlug): ?FeatureSubscription
    {
        $feature = self::getFeatureBySlug($featureSlug);

        if (! $feature) {
            return null;
        }

        return FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->getKey())
            ->whereIn('estado', ['activa', 'pendente'])
            ->latest('id')
            ->first();
    }

    /**
     * Verifica se um slug existe como feature registada e activa.
     */
    public static function exists(string $featureSlug): bool
    {
        return self::getFeatureBySlug($featureSlug) !== null;
    }

    /**
     * Lookup de Feature por slug (com cache).
     */
    public static function getFeatureBySlug(string $slug): ?Feature
    {
        return Cache::remember(
            "feature:slug:{$slug}",
            self::FEATURE_CACHE_TTL,
            fn () => Feature::where('slug', $slug)->where('activa', true)->first(),
        );
    }

    /**
     * Limpar cache quando uma feature é editada (chamar após admin editar).
     */
    public static function flushFeatureCache(string $slug): void
    {
        Cache::forget("feature:slug:{$slug}");
    }

    /**
     * Limpar TODO o cache de features (usar com cuidado).
     */
    public static function flushAllCache(): void
    {
        // Simples: usar prefix store se disponível, ou limpar cache inteiro
        Cache::flush();
    }
}
