<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VotacaoAbertaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $assembleia,
        public string $ponto,
        public int $assembleiaId,
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'titulo' => 'Votação aberta',
            'corpo' => "Já pode votar: {$this->ponto}",
            'data' => [
                'tipo' => 'votacao_aberta',
                'assembleia_id' => (string) $this->assembleiaId,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'votacao_aberta',
            'titulo' => 'Votação aberta',
            'mensagem' => "Já pode votar no ponto \"{$this->ponto}\" da assembleia \"{$this->assembleia}\".",
            'assembleia_id' => $this->assembleiaId,
            'assembleia' => $this->assembleia,
            'ponto' => $this->ponto,
            'url' => '/assembleias',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Votação aberta · ONDAKA")
            ->view('emails.condomino.votacao-aberta', [
                'nome' => $this->nome,
                'assembleia' => $this->assembleia,
                'ponto' => $this->ponto,
            ]);
    }
}
