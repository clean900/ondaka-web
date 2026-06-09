<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) super-admin(s) de que uma tarefa agendada (cron) falhou.
 * Canais: sino (database) + email.
 */
class CronFalhouSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $tarefa,
        public ?string $detalhe = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("⚠ Tarefa agendada falhou: {$this->tarefa} · ONDAKA")
            ->view('emails.b2b.cron-falhou-superadmin', [
                'tarefa' => $this->tarefa,
                'detalhe' => $this->detalhe ?: 'Sem detalhe disponível.',
                'momento' => now()->format('d/m/Y H:i'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'cron_falhou',
            'titulo' => "⚠ Tarefa \"{$this->tarefa}\" falhou",
            'mensagem' => "A tarefa agendada \"{$this->tarefa}\" não concluiu com sucesso. Verificar registos.",
            'tarefa' => $this->tarefa,
            'detalhe' => $this->detalhe,
            'url' => '/super-admin',
        ];
    }
}
