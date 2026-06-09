<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActaDisponivelNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $assembleia,
        public string $data,
        public int $assembleiaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Acta publicada',
            'corpo' => "A acta da assembleia de {$this->data} já está disponível.",
            'data' => [
                'tipo' => 'acta_disponivel',
                'assembleia_id' => (string) $this->assembleiaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'acta_disponivel',
            'titulo' => 'Acta publicada',
            'mensagem' => "A acta da assembleia \"{$this->assembleia}\" ({$this->data}) já está disponível.",
            'assembleia_id' => $this->assembleiaId,
            'assembleia' => $this->assembleia,
            'data_assembleia' => $this->data,
            'url' => '/assembleias',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Acta da assembleia disponível · ONDAKA")
            ->view('emails.condomino.acta-disponivel', [
                'nome' => $this->nome,
                'assembleia' => $this->assembleia,
                'data' => $this->data,
            ]);
    }
}
