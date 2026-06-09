<?php

namespace App\Domains\Visitor\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VisitanteChegouNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $visitaId,
        public string $descricao,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'visitante_chegou',
            'titulo' => '🚶 Visitante na portaria',
            'mensagem' => $this->descricao,
            'visita_id' => $this->visitaId,
            'url' => '/visitantes',
        ];
    }
}
