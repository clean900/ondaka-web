<?php

declare(strict_types=1);

namespace App\Domains\Integracao\WhatsApp;

use Illuminate\Notifications\Notification;

/**
 * Canal de notificação 'whatsapp'. Registado em IntegracoesServiceProvider via
 * Notification::extend('whatsapp', ...).
 *
 * A notificação expõe toWhatsapp($notifiable): ?array no formato
 *   ['template' => 'nome_do_template', 'idioma' => 'pt_PT', 'parametros' => [..]]
 * e, opcionalmente, whatsappPara($notifiable): ?string (número de destino).
 */
class WhatsAppChannel
{
    public function __construct(private WhatsAppService $whatsapp) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toWhatsapp')) {
            return;
        }

        $msg = $notification->toWhatsapp($notifiable);
        if (! is_array($msg) || empty($msg['template'])) {
            return;
        }

        $numero = null;
        if (method_exists($notification, 'whatsappPara')) {
            $numero = $notification->whatsappPara($notifiable);
        }
        if (! $numero && method_exists($notifiable, 'routeNotificationFor')) {
            $numero = $notifiable->routeNotificationFor('whatsapp', $notification);
        }
        if (! $numero && isset($notifiable->telefone)) {
            $numero = $notifiable->telefone;
        }

        $this->whatsapp->enviarTemplate(
            $numero,
            (string) $msg['template'],
            $msg['idioma'] ?? null,
            (array) ($msg['parametros'] ?? []),
        );
    }
}
