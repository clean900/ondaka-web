<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) super-admin(s) de que o saldo de SMS está abaixo do limite.
 * Operacionalmente crítico: sem saldo, 2FA e avisos por SMS param.
 * Canais: sino (database) + email.
 */
class SaldoSmsBaixoSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $saldo,
        public int $limite,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("⚠ Saldo SMS baixo: {$this->saldo} créditos · ONDAKA")
            ->view('emails.b2b.saldo-sms-superadmin', [
                'saldo' => $this->saldo,
                'limite' => $this->limite,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'saldo_sms_baixo',
            'titulo' => "⚠ Saldo SMS baixo: {$this->saldo} créditos",
            'mensagem' => "Restam {$this->saldo} SMS (limite: {$this->limite}). Recarregue para garantir 2FA e avisos.",
            'saldo' => $this->saldo,
            'limite' => $this->limite,
            'url' => '/admin/sms',
        ];
    }
}
