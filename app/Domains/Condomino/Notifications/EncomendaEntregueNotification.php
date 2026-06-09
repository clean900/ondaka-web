<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EncomendaEntregueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $descricao,
        public string $levantadaPor,
        public string $data,
        public int $encomendaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Encomenda entregue',
            'corpo' => "A sua encomenda foi levantada por {$this->levantadaPor}.",
            'data' => [
                'tipo' => 'encomenda_entregue',
                'encomenda_id' => (string) $this->encomendaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'encomenda_entregue',
            'titulo' => 'Encomenda entregue',
            'mensagem' => "A sua encomenda foi levantada por {$this->levantadaPor} a {$this->data}.",
            'encomenda_id' => $this->encomendaId,
            'descricao' => $this->descricao,
            'levantada_por' => $this->levantadaPor,
            'url' => '/encomendas',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Encomenda entregue · ONDAKA")
            ->view('emails.condomino.encomenda-entregue', [
                'nome' => $this->nome,
                'descricao' => $this->descricao,
                'levantadaPor' => $this->levantadaPor,
                'data' => $this->data,
            ]);
    }
}
