<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VisitaEntrouNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $visitante,
        public string $hora,
        public int $visitaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Visita entrou',
            'corpo' => "{$this->visitante} deu entrada no condomínio às {$this->hora}.",
            'data' => [
                'tipo' => 'visita_entrou',
                'visita_id' => (string) $this->visitaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'visita_entrou',
            'titulo' => 'Visita entrou',
            'mensagem' => "{$this->visitante} deu entrada no condomínio às {$this->hora}.",
            'visita_id' => $this->visitaId,
            'visitante' => $this->visitante,
            'hora' => $this->hora,
            'url' => '/visitas',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Visita registada · ONDAKA")
            ->view('emails.condomino.visita-entrou', [
                'nome' => $this->nome,
                'visitante' => $this->visitante,
                'hora' => $this->hora,
            ]);
    }
}
