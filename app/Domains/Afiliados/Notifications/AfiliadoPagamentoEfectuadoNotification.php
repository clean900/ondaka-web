<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\AfiliadoPagamento;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: a ONDAKA pagou as suas comissões. */
class AfiliadoPagamentoEfectuadoNotification extends Notification
{
    use Queueable;

    public function __construct(public AfiliadoPagamento $pagamento) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    private function fmt(mixed $v): string
    {
        return number_format((float) $v, 2, ',', '.').' Kz';
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pagamento de comissões '.$this->pagamento->numero.' · ONDAKA')
            ->view('emails.afiliados.pagamento-efectuado', [
                'pagamento' => $this->pagamento,
                'bruto' => $this->fmt($this->pagamento->valor_bruto_kz),
                'retencao' => $this->fmt($this->pagamento->retencao_valor_kz),
                'liquido' => $this->fmt($this->pagamento->valor_liquido_kz),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_pagamento',
            'titulo' => '🏦 Pagamento efectuado: '.$this->fmt($this->pagamento->valor_liquido_kz),
            'mensagem' => "Pagamento {$this->pagamento->numero} de {$this->pagamento->num_comissoes} comissão(ões) por {$this->pagamento->metodo_label}.",
            'pagamento_id' => $this->pagamento->id,
            'url' => '/afiliado/pagamentos',
        ];
    }
}
