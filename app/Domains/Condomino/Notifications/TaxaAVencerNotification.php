<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaxaAVencerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $periodo,
        public string $valor,
        public string $vencimento,
        public int $dias,
        public int $quotaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => "Taxa vence em {$this->dias} dias",
            'corpo' => "A sua taxa de {$this->periodo} ({$this->valor} Kz) vence a {$this->vencimento}.",
            'data' => [
                'tipo' => 'taxa_a_vencer',
                'quota_id' => (string) $this->quotaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'taxa_a_vencer',
            'titulo' => "Taxa vence em {$this->dias} dias",
            'mensagem' => "A sua taxa de {$this->periodo} ({$this->valor} Kz) vence a {$this->vencimento}.",
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
            ->subject("A sua taxa de condomínio vence em breve · ONDAKA")
            ->view('emails.condomino.taxa-a-vencer', [
                'nome' => $this->nome,
                'periodo' => $this->periodo,
                'valor' => $this->valor,
                'vencimento' => $this->vencimento,
                'dias' => $this->dias,
            ]);
    }
}
