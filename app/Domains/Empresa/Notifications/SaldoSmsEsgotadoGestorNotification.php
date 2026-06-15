<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) gestor(es)/admin-empresa de que o saldo de SMS esgotou e os SMS
 * automáticos (visitantes, avisos, pedidos) deixaram de ser enviados.
 * Convida a comprar o add-on "Pacote Extra SMS".
 * Canal: sino (database).
 */
class SaldoSmsEsgotadoGestorNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'sms_esgotado',
            'titulo' => '📵 Saldo de SMS esgotado',
            'mensagem' => 'Os SMS automáticos (visitantes, avisos e pedidos) deixaram de ser enviados por falta de saldo. Adquira o Pacote Extra SMS para reactivar o envio.',
            'url' => '/funcionalidades/sms_pack_extra',
        ];
    }
}
