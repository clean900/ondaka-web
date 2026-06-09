<?php

namespace App\Domains\Encomenda\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EncomendaChegouNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $encomendaId,
        public string $descricao,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'encomenda_chegou',
            'titulo' => '📦 Encomenda na portaria',
            'mensagem' => $this->descricao,
            'encomenda_id' => $this->encomendaId,
            'url' => '/encomendas',
        ];
    }
}
