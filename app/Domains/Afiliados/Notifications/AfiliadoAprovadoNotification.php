<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: conta aprovada/activada — recebe o código e o link. */
class AfiliadoAprovadoNotification extends Notification
{
    use Queueable;

    public function __construct(public Afiliado $afiliado) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('A sua conta de afiliado ONDAKA está activa')
            ->view('emails.afiliados.aprovado', [
                'afiliado' => $this->afiliado,
                'link' => $this->afiliado->linkReferencia(),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_aprovado',
            'titulo' => '🎉 Conta de afiliado activa',
            'mensagem' => "O seu código é {$this->afiliado->codigo}. Partilhe o seu link e comece a ganhar comissões.",
            'url' => '/afiliado',
        ];
    }
}
