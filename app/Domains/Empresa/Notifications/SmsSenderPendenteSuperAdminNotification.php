<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SmsSenderPendenteSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Condominio $condominio,
        public string $senderName,
        public EmpresaGestora $empresa,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Sender ID a configurar: {$this->senderName} · ONDAKA")
            ->view('emails.b2b.sender-pendente-superadmin', [
                'empresa_nome' => $this->empresa->nome,
                'condominio_nome' => $this->condominio->nome,
                'sender_name' => $this->senderName,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'sms_sender_pendente',
            'titulo' => "Sender ID a configurar: {$this->senderName}",
            'mensagem' => "{$this->empresa->nome} definiu o remetente \"{$this->senderName}\" para o condominio {$this->condominio->nome}. A aguardar configuracao da api_key.",
            'empresa_id' => $this->empresa->id,
            'empresa_nome' => $this->empresa->nome,
            'condominio_id' => $this->condominio->id,
            'condominio_nome' => $this->condominio->nome,
            'sender_name' => $this->senderName,
            'url' => '/admin/sms',
        ];
    }
}
