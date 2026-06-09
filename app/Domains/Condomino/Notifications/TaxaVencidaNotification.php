<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaxaVencidaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $periodo,
        public string $valor,
        public string $vencimento,
        public int $quotaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Taxa em atraso',
            'corpo' => "A taxa de {$this->periodo} ({$this->valor} Kz) está vencida desde {$this->vencimento}.",
            'data' => [
                'tipo' => 'taxa_vencida',
                'quota_id' => (string) $this->quotaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'taxa_vencida',
            'titulo' => 'Taxa em atraso',
            'mensagem' => "A taxa de {$this->periodo} ({$this->valor} Kz) está vencida desde {$this->vencimento}.",
            'quota_id' => $this->quotaId,
            'periodo' => $this->periodo,
            'valor' => $this->valor,
            'vencimento' => $this->vencimento,
            'url' => '/minhas-quotas',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Taxa de condomínio em atraso · ONDAKA")
            ->view('emails.condomino.taxa-vencida', [
                'nome' => $this->nome,
                'periodo' => $this->periodo,
                'valor' => $this->valor,
                'vencimento' => $this->vencimento,
            ]);
    }
}
