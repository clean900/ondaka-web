<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) super-admin(s) de que um novo cliente B2B se registou.
 * Canais: sino (database) + email.
 */
class NovoClienteSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public EmpresaGestora $empresa,
        public User $novoUser,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tipo = $this->empresa->tipo_cliente === 'admin_independente'
            ? 'Administrador Independente'
            : 'Empresa Gestora';

        return (new MailMessage)
            ->subject("Novo cliente: {$this->empresa->nome} · ONDAKA")
            ->view('emails.b2b.novo-cliente-superadmin', [
                'empresa' => $this->empresa,
                'tipo' => $tipo,
                'responsavel_nome' => $this->novoUser->name,
                'responsavel_email' => $this->novoUser->email,
                'localizacao' => trim(($this->empresa->municipio ?? '') . ', ' . ($this->empresa->provincia ?? ''), ', '),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'novo_cliente_b2b',
            'titulo' => "Novo cliente: {$this->empresa->nome}",
            'mensagem' => "{$this->empresa->nome} registou-se e iniciou o trial de 30 dias.",
            'empresa_id' => $this->empresa->id,
            'empresa_nome' => $this->empresa->nome,
            'tipo_cliente' => $this->empresa->tipo_cliente,
            'user_email' => $this->novoUser->email,
            'url' => '/super-admin/clientes',
        ];
    }
}
