<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MultaAplicadaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $motivo,
        public string $valor,
        public string $vencimento,
        public int $multaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Multa aplicada',
            'corpo' => "Foi aplicada uma multa de {$this->valor} Kz. {$this->motivo}",
            'data' => [
                'tipo' => 'multa_aplicada',
                'multa_id' => (string) $this->multaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'multa_aplicada',
            'titulo' => 'Multa aplicada',
            'mensagem' => "Foi aplicada uma multa de {$this->valor} Kz. {$this->motivo}",
            'multa_id' => $this->multaId,
            'motivo' => $this->motivo,
            'valor' => $this->valor,
            'vencimento' => $this->vencimento,
            'url' => '/minhas-quotas',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Multa aplicada · ONDAKA")
            ->view('emails.condomino.multa-aplicada', [
                'nome' => $this->nome,
                'motivo' => $this->motivo,
                'valor' => $this->valor,
                'vencimento' => $this->vencimento,
            ]);
    }
}
