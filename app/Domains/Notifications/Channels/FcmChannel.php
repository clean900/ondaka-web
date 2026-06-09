<?php

declare(strict_types=1);

namespace App\Domains\Notifications\Channels;

use App\Domains\Notifications\Services\FcmSenderService;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Canal de notificação para push via FCM.
 *
 * Usar no via() de uma Notification: FcmChannel::class
 * A Notification deve implementar toFcm($notifiable): array
 *   ['titulo' => string, 'corpo' => string, 'data' => array]
 */
class FcmChannel
{
    public function __construct(protected FcmSenderService $fcmSender) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toFcm')) {
            return;
        }

        $payload = $notification->toFcm($notifiable);

        if (empty($payload['titulo'])) {
            return;
        }

        try {
            $this->fcmSender->enviarParaUser(
                $notifiable,
                $payload['titulo'],
                $payload['corpo'] ?? '',
                $payload['data'] ?? [],
            );
        } catch (\Throwable $e) {
            Log::error("[FcmChannel] Push falhou user {$notifiable->id}: " . $e->getMessage());
        }
    }
}
