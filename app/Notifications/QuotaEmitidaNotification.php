<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Domains\Notifications\Channels\FcmChannel;

class QuotaEmitidaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $imovel,
        public string $condominio,
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
            'titulo' => 'Nova taxa de condomínio',
            'corpo' => 'Taxa de '.$this->valor.' Kz para '.$this->imovel.', vence em '.$this->vencimento.'.',
            'data' => [
                'tipo' => 'quota_emitida',
                'quota_id' => (string) $this->quotaId,
            ],
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Quota {$this->periodo} emitida · ONDAKA")
            ->view('emails.condomino.quota-emitida', [
                'nome' => $this->nome,
                'imovel' => $this->imovel,
                'condominio' => $this->condominio,
                'periodo' => $this->periodo,
                'valor' => $this->valor,
                'vencimento' => $this->vencimento,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'quota_emitida',
            'titulo' => "Nova quota: {$this->periodo}",
            'mensagem' => "Quota de {$this->valor} Kz para o imóvel {$this->imovel}, vence em {$this->vencimento}.",
            'quota_id' => $this->quotaId,
            'imovel' => $this->imovel,
            'condominio' => $this->condominio,
            'periodo' => $this->periodo,
            'valor' => $this->valor,
            'vencimento' => $this->vencimento,
            'url' => '/minhas-quotas',
        ];
    }
}
