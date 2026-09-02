<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Super-admin: resumo mensal de comissões aprovadas que atingiram o mínimo de pagamento. */
class ComissoesAPagarSuperAdminNotification extends Notification
{
    use Queueable;

    /** @param array<int, array{nome:string,codigo:string,total_kz:string,n:int,iban:?string}> $linhas */
    public function __construct(public array $linhas, public string $totalKz) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Comissões de afiliados a pagar: '.number_format((float) $this->totalKz, 2, ',', '.').' Kz · ONDAKA')
            ->view('emails.afiliados.resumo-superadmin', [
                'linhas' => $this->linhas,
                'total' => number_format((float) $this->totalKz, 2, ',', '.').' Kz',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_a_pagar',
            'titulo' => '🏦 Comissões de afiliados a pagar',
            'mensagem' => count($this->linhas).' afiliado(s) atingiram o mínimo. Total: '.number_format((float) $this->totalKz, 2, ',', '.').' Kz.',
            'url' => '/super-admin/afiliados?estado=activo',
        ];
    }
}
