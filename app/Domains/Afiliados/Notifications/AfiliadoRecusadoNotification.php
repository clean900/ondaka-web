<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: candidatura recusada. */
class AfiliadoRecusadoNotification extends Notification
{
    use Queueable;

    public function __construct(public Afiliado $afiliado, public string $motivo) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Candidatura ao programa de afiliados ONDAKA')
            ->view('emails.afiliados.recusado', [
                'afiliado' => $this->afiliado,
                'motivo' => $this->motivo,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_recusado',
            'titulo' => 'Candidatura a afiliado não aprovada',
            'mensagem' => $this->motivo,
            'url' => '/afiliado',
        ];
    }
}
