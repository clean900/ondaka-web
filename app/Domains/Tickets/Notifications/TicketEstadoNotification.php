<?php

namespace App\Domains\Tickets\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketEstadoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $ticketId,
        public string $ticketTitulo,
        public string $estadoNovo,
        public string $titulo,
        public string $mensagem,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'ticket_estado',
            'titulo' => $this->titulo,
            'mensagem' => $this->mensagem,
            'ticket_id' => $this->ticketId,
            'estado' => $this->estadoNovo,
            'url' => '/tickets/' . $this->ticketId,
        ];
    }
}
