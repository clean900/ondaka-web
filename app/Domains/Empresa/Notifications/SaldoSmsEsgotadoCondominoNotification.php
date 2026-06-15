<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notifica o condómino que despoletou uma acção com SMS (ex.: pré-aprovação de
 * visitante) de que o SMS não foi enviado por falta de saldo do condomínio, e que
 * deve consultar o gestor/administração para adquirir mais SMS.
 * Canal: sino (database) — surge também na lista de notificações do mobile.
 * 'tipo' = 'generica' (sem navegação): o mobile faz fallback seguro para genérica.
 */
class SaldoSmsEsgotadoCondominoNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'generica',
            'titulo' => '📵 SMS não enviado',
            'mensagem' => 'Não foi possível enviar o SMS por falta de saldo do condomínio. Contacte o gestor/administração para adquirir mais SMS.',
            'url' => null,
        ];
    }
}
