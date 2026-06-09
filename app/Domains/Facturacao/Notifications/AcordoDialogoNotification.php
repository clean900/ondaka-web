<?php

namespace App\Domains\Facturacao\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AcordoDialogoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $acordoId,
        public string $titulo,
        public string $mensagem,
        public string $url,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'acordo_dialogo',
            'titulo' => $this->titulo,
            'mensagem' => $this->mensagem,
            'acordo_id' => $this->acordoId,
            'url' => $this->url,
        ];
    }
}
