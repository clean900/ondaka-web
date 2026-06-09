<?php

namespace App\Domains\Avisos\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AvisoNovoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $avisoId,
        public string $avisoTitulo,
        public string $resumo,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'aviso_publicado',
            'titulo' => '📢 ' . $this->avisoTitulo,
            'mensagem' => $this->resumo,
            'aviso_id' => $this->avisoId,
            'url' => '/avisos/' . $this->avisoId,
        ];
    }
}
