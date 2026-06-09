<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EncomendaRecebidaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $descricao,
        public int $encomendaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Encomenda na portaria',
            'corpo' => "Chegou uma encomenda para si. Levante na portaria.",
            'data' => [
                'tipo' => 'encomenda_recebida',
                'encomenda_id' => (string) $this->encomendaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'encomenda_recebida',
            'titulo' => 'Encomenda na portaria',
            'mensagem' => "Chegou uma encomenda para si ({$this->descricao}). Levante na portaria.",
            'encomenda_id' => $this->encomendaId,
            'descricao' => $this->descricao,
            'url' => '/encomendas',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Encomenda na portaria · ONDAKA")
            ->view('emails.condomino.encomenda-recebida', [
                'nome' => $this->nome,
                'descricao' => $this->descricao,
            ]);
    }
}
