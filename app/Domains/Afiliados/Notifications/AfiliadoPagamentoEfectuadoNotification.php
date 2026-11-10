<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Integracao\WhatsApp\Concerns\NotificaAfiliadoPorWhatsApp;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: a ONDAKA pagou as suas comissões. */
class AfiliadoPagamentoEfectuadoNotification extends Notification
{
    use NotificaAfiliadoPorWhatsApp;
    use Queueable;

    public function __construct(public AfiliadoPagamento $pagamento) {}

    public function via(object $notifiable): array
    {
        return $this->comWhatsapp(['database', 'mail']);
    }

    protected function afiliadoAlvo(): ?Afiliado
    {
        return $this->pagamento->afiliado;
    }

    /** Template Meta `afiliado_pagamento`: {{1}} número · {{2}} líquido · {{3}} método. */
    public function toWhatsapp(object $notifiable): array
    {
        return [
            'template' => (string) config('services.whatsapp.templates.pagamento', 'afiliado_pagamento'),
            'parametros' => [
                $this->pagamento->numero,
                $this->fmt($this->pagamento->valor_liquido_kz),
                (string) $this->pagamento->metodo_label,
            ],
        ];
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
