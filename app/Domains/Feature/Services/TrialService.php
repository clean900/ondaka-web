<?php

namespace App\Domains\Feature\Services;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Database\Eloquent\Model;
use RuntimeException;

/**
 * ONDAKA — TrialService
 *
 * Gere o ciclo de vida de trials de 7 dias para features premium.
 *
 * Regras de negócio:
 *  - Cada (owner, feature) só pode iniciar trial UMA VEZ.
 *    Verifica histórico completo (mesmo trials já expirados/cancelados).
 *  - Se já houver subscrição activa (mesmo paga), não pode iniciar trial.
 *  - Trial = subscrição com:
 *      estado='activa', valor_pago_total=0,
 *      expira_em=now+7d, renovacao_automatica=false,
 *      configuracao.is_trial=true
 *  - Trial expira automaticamente via comando feature:expire-trials
 *    que corre diariamente.
 *
 * Nota técnica: o JSON do campo `configuracao` é pesquisado via LIKE
 * '%is_trial%' (chave existe = sempre true) porque whereJsonContains
 * não é fiável nesta versão de MariaDB.
 */
class TrialService
{
    public const DIAS_TRIAL = 7;

    /**
     * Filtro reutilizável para identificar trials no campo `configuracao`.
     */
    private function aplicarFiltroTrial($query): void
    {
        $query->where('configuracao', 'like', '%is_trial%');
    }

    /**
     * Verifica se o (owner, feature) pode iniciar trial.
     * Devolve ['pode' => bool, 'motivo' => string|null]
     */
    public function podeIniciar(Model $owner, Feature $feature): array
    {
        // Já tem subscrição activa (paga, manual ou trial)?
        $temActiva = FeatureSubscription::query()
            ->where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->id)
            ->where('estado', 'activa')
            ->exists();

        if ($temActiva) {
            return ['pode' => false, 'motivo' => 'Já tem esta funcionalidade activa.'];
        }

        // Já fez trial alguma vez? (qualquer estado, mesmo expirado/cancelado/soft-deleted)
        $temTrialHistorico = FeatureSubscription::withTrashed()
            ->where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->id)
            ->where('configuracao', 'like', '%is_trial%')
            ->exists();

        if ($temTrialHistorico) {
            return ['pode' => false, 'motivo' => 'Trial desta funcionalidade já foi utilizado anteriormente.'];
        }

        if ((int) $feature->em_breve === 1) {
            return ['pode' => false, 'motivo' => 'Esta funcionalidade ainda não está disponível.'];
        }

        if ((int) $feature->activa === 0) {
            return ['pode' => false, 'motivo' => 'Esta funcionalidade está desactivada.'];
        }

        return ['pode' => true, 'motivo' => null];
    }

    /**
     * Inicia trial. Lança RuntimeException se não elegível.
     */
    public function iniciar(Model $owner, Feature $feature, ?int $userId = null): FeatureSubscription
    {
        $check = $this->podeIniciar($owner, $feature);
        if (! $check['pode']) {
            throw new RuntimeException($check['motivo'] ?? 'Não é possível iniciar trial.');
        }

        return FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->id,
            'estado' => 'activa',
            'activada_em' => now(),
            'expira_em' => now()->addDays(self::DIAS_TRIAL),
            'renovacao_automatica' => false,
            'valor_pago_total' => 0,
            'activada_por_user_id' => $userId ?? auth()->id(),
            'notas_admin' => 'Trial de ' . self::DIAS_TRIAL . ' dias iniciado em ' . now()->format('d/m/Y H:i'),
            'configuracao' => json_encode([
                'is_trial' => true,
                'iniciado_em' => now()->toIso8601String(),
                'dias' => self::DIAS_TRIAL,
            ]),
        ]);
    }

    /**
     * Marca trials cuja data de expiração já passou como 'expirada'.
     */
    public function expirarVencidos(): int
    {
        $vencidos = FeatureSubscription::query()
            ->where('estado', 'activa')
            ->where('expira_em', '<=', now())
            ->where('configuracao', 'like', '%is_trial%')
            ->get();

        $count = 0;
        foreach ($vencidos as $sub) {
            $sub->update([
                'estado' => 'expirada',
                'notas_admin' => trim(($sub->notas_admin ?? '') . "\nTrial expirado em " . now()->format('d/m/Y H:i')),
            ]);
            $count++;
        }

        return $count;
    }

    /**
     * Devolve trials activos para um owner (para banner).
     */
    public function activosDoOwner(Model $owner)
    {
        return FeatureSubscription::query()
            ->with('feature')
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->id)
            ->where('estado', 'activa')
            ->where('configuracao', 'like', '%is_trial%')
            ->orderBy('expira_em', 'asc')
            ->get();
    }

    /**
     * Trials que expiram nas próximas 24h (para emails de aviso).
     */
    public function aExpirarEm24h()
    {
        return FeatureSubscription::query()
            ->with(['feature', 'owner'])
            ->where('estado', 'activa')
            ->whereBetween('expira_em', [now(), now()->addDay()])
            ->where('configuracao', 'like', '%is_trial%')
            ->get();
    }
}
