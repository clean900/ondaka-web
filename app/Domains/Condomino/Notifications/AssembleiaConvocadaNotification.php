<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AssembleiaConvocadaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $titulo,
        public string $data,
        public int $assembleiaId,
    ) {}

    public function via(object $notifiable): array
    {
        // Só push + sino: o email da convocatória é enviado pelo fluxo existente (Mail::raw)
        return [FcmChannel::class, 'database'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Assembleia convocada',
            'corpo' => "Convocada assembleia \"{$this->titulo}\" para {$this->data}.",
            'data' => [
                'tipo' => 'assembleia_convocada',
                'assembleia_id' => (string) $this->assembleiaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'assembleia_convocada',
            'titulo' => 'Assembleia convocada',
            'mensagem' => "Convocada assembleia \"{$this->titulo}\" para {$this->data}. Confirme presença.",
            'assembleia_id' => $this->assembleiaId,
            'titulo_assembleia' => $this->titulo,
            'data_assembleia' => $this->data,
            'url' => '/assembleias',
        ];
    }
}
