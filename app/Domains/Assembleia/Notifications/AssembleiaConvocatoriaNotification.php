<?php

namespace App\Domains\Assembleia\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssembleiaConvocatoriaNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $assembleiaId,
        public string $titulo,
        public string $resumo,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'assembleia_convocatoria',
            'titulo' => '🗳️ Convocatória: ' . $this->titulo,
            'mensagem' => $this->resumo,
            'assembleia_id' => $this->assembleiaId,
            'url' => '/assembleias/' . $this->assembleiaId,
        ];
    }
}
