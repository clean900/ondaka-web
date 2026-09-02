<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: um novo cliente registou-se com o seu código. */
class AfiliadoNovoClienteNotification extends Notification
{
    use Queueable;

    public function __construct(public Afiliado $afiliado, public EmpresaGestora $empresa) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Novo cliente indicado: {$this->empresa->nome} · ONDAKA")
            ->view('emails.afiliados.novo-cliente', [
                'afiliado' => $this->afiliado,
                'empresa' => $this->empresa,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_novo_cliente',
            'titulo' => "🏢 Novo cliente indicado: {$this->empresa->nome}",
            'mensagem' => "{$this->empresa->nome} registou-se na ONDAKA através do seu link. Cada pagamento gera comissão de {$this->afiliado->taxa_actual_pct}%.",
            'empresa_id' => $this->empresa->id,
            'url' => '/afiliado/clientes',
        ];
    }
}
