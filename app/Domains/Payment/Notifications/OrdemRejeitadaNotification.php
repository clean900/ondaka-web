<?php

declare(strict_types=1);

namespace App\Domains\Payment\Notifications;

use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrdemRejeitadaNotification extends Notification
{
    use Queueable;

    public function __construct(public OrdemCompra $ordem) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Pagamento não confirmado',
            'corpo' => 'A ordem '.$this->ordem->numero.' foi rejeitada.',
            'data' => [
                'tipo' => 'ordem_rejeitada',
                'ordem_id' => (string) $this->ordem->id,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'ordem_rejeitada',
            'titulo' => 'Pagamento não confirmado',
            'mensagem' => 'A ordem '.$this->ordem->numero.' foi rejeitada. Motivo: '.($this->ordem->motivo_rejeicao ?: 'não especificado').'.',
            'ordem_id' => $this->ordem->id,
            'numero' => $this->ordem->numero,
            'url' => '/ordens/'.$this->ordem->id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.url'), '/').'/ordens/'.$this->ordem->id;
        $motivo = $this->ordem->motivo_rejeicao ?: 'Não especificado.';

        return (new MailMessage)
            ->subject('Ordem '.$this->ordem->numero.' rejeitada · ONDAKA')
            ->view('emails.condomino.ordem-rejeitada', [
                'numero' => $this->ordem->numero,
                'motivo' => $motivo,
                'url' => $url,
            ]);
    }
}
