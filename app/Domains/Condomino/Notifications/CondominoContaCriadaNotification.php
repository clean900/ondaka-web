<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CondominoContaCriadaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $nome,
        public string $email,
        public string $passwordTemporaria,
        public string $gestor,
        public string $empresa,
        public ?string $condominio = null,
    ) {}

    public function via(object $notifiable): array
    {
        // Apenas email: o condómino ainda não tem a app, e a password só existe agora
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('A sua conta ONDAKA foi criada · ONDAKA')
            ->view('emails.condomino.conta-criada', [
                'nome' => $this->nome,
                'email' => $this->email,
                'password' => $this->passwordTemporaria,
                'gestor' => $this->gestor,
                'empresa' => $this->empresa,
                'condominio' => $this->condominio,
            ]);
    }
}
