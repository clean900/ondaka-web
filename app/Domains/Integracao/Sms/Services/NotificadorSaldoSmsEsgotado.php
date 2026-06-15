<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Empresa\Notifications\SaldoSmsEsgotadoCondominoNotification;
use App\Domains\Empresa\Notifications\SaldoSmsEsgotadoGestorNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Quando um SMS de cliente é bloqueado por falta de saldo (sms_pack_extra esgotado):
 *  - notifica os gestores/admin-empresa da empresa (convite a comprar o Pacote Extra
 *    SMS), com throttle de 6h por empresa para não inundar o sino;
 *  - opcionalmente notifica o condómino que despoletou a acção (consultar o gestor),
 *    com throttle de 1h por condómino.
 *
 * Nunca lança excepção: a notificação não deve, em caso algum, partir o fluxo de envio.
 */
class NotificadorSaldoSmsEsgotado
{
    public function notificar(Model $owner, ?User $condomino = null): void
    {
        try {
            $empresa = $this->resolverEmpresa($owner);
            if ($empresa) {
                $this->notificarGestores($empresa);
            }
            if ($condomino) {
                $this->notificarCondomino($condomino);
            }
        } catch (\Throwable $e) {
            Log::warning('[SMS] Falha a notificar saldo esgotado: '.$e->getMessage());
        }
    }

    private function resolverEmpresa(Model $owner): ?EmpresaGestora
    {
        if ($owner instanceof EmpresaGestora) {
            return $owner;
        }

        $empresaId = $owner->empresa_gestora_id ?? null;

        return $empresaId ? EmpresaGestora::find($empresaId) : null;
    }

    private function notificarGestores(EmpresaGestora $empresa): void
    {
        // Throttle: 1 notificação por empresa a cada 6h
        if (! Cache::add("sms_esgotado_gestor_{$empresa->id}", true, now()->addHours(6))) {
            return;
        }

        $gestores = $empresa->users()
            ->role(['admin-empresa', 'gestor'])
            ->get();

        foreach ($gestores as $gestor) {
            $gestor->notify(new SaldoSmsEsgotadoGestorNotification());
        }
    }

    private function notificarCondomino(User $condomino): void
    {
        // Throttle: 1 notificação por condómino a cada 1h
        if (! Cache::add("sms_esgotado_condomino_{$condomino->id}", true, now()->addHour())) {
            return;
        }

        $condomino->notify(new SaldoSmsEsgotadoCondominoNotification());
    }
}
