<?php

namespace App\Domains\Comunicados\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComunicadoGlobalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $titulo,
        public string $mensagem,
    ) {}

    public function via(object $notifiable): array
    {
        // Email + sino in-app. (Push é enviado à parte pelo serviço, via FcmSenderService.)
        return $notifiable->email ? ['mail', 'database'] : ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->titulo . ' · ONDAKA')
            ->view('emails.notificacao', [
                'assunto' => $this->titulo . ' · ONDAKA',
                'titulo' => $this->titulo,
                'corpo' => $this->mensagem,
                'condominioNome' => null,
                'empresaNome' => null,
                'saudacao' => 'Olá ' . ($notifiable->name ?? '') . ',',
                'badge' => '📣 Comunicado ONDAKA',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'comunicado_global',
            'titulo' => '📣 ' . $this->titulo,
            'mensagem' => $this->mensagem,
            'url' => '/',
        ];
    }
}
