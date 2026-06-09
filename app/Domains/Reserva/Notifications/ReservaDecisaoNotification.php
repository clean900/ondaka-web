<?php

namespace App\Domains\Reserva\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReservaDecisaoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $reservaId,
        public bool $confirmada,
        public string $descricao,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => $this->confirmada ? 'reserva_confirmada' : 'reserva_recusada',
            'titulo' => $this->confirmada ? '✅ Reserva confirmada' : '❌ Reserva recusada',
            'mensagem' => $this->descricao,
            'reserva_id' => $this->reservaId,
            'url' => '/reservas',
        ];
    }
}
