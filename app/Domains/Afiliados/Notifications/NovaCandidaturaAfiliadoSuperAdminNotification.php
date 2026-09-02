<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Super-admin: nova candidatura / adesão ao programa de afiliados. */
class NovaCandidaturaAfiliadoSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(public Afiliado $afiliado) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $auto = $this->afiliado->estado === Afiliado::ESTADO_ACTIVO;

        return (new MailMessage)
            ->subject(($auto ? 'Novo afiliado activo: ' : 'Candidatura a afiliado: ').$this->afiliado->nome.' · ONDAKA')
            ->view('emails.afiliados.candidatura-superadmin', [
                'afiliado' => $this->afiliado,
                'auto' => $auto,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $auto = $this->afiliado->estado === Afiliado::ESTADO_ACTIVO;

        return [
            'tipo' => 'afiliado_candidatura',
            'titulo' => $auto ? "🤝 Novo afiliado: {$this->afiliado->nome}" : "🤝 Candidatura a afiliado: {$this->afiliado->nome}",
            'mensagem' => $auto
                ? "{$this->afiliado->nome} aderiu ao programa de afiliados (código {$this->afiliado->codigo})."
                : "{$this->afiliado->nome} candidatou-se ao programa de afiliados. Aguarda aprovação.",
            'afiliado_id' => $this->afiliado->id,
            'url' => '/super-admin/afiliados/'.$this->afiliado->id,
        ];
    }
}
