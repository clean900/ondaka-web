<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Integracao\WhatsApp\Concerns\NotificaAfiliadoPorWhatsApp;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: uma comissão foi creditada (cliente pagou). */
class AfiliadoComissaoCreditadaNotification extends Notification
{
    use NotificaAfiliadoPorWhatsApp;
    use Queueable;

    public function __construct(public AfiliadoComissao $comissao) {}

    public function via(object $notifiable): array
    {
        return $this->comWhatsapp(['database', 'mail']);
    }

    protected function afiliadoAlvo(): ?Afiliado
    {
        return $this->comissao->afiliado;
    }

    /** Template Meta `afiliado_comissao_nova`: {{1}} valor · {{2}} cliente. */
    public function toWhatsapp(object $notifiable): array
    {
        $this->comissao->loadMissing('empresa');

        return [
            'template' => (string) config('services.whatsapp.templates.comissao_nova', 'afiliado_comissao_nova'),
            'parametros' => [
                $this->valor(),
                $this->comissao->empresa?->nome ?? 'Um cliente',
            ],
        ];
    }

    private function valor(): string
    {
        return number_format((float) $this->comissao->valor_comissao_kz, 2, ',', '.').' Kz';
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->comissao->loadMissing(['empresa', 'afiliado']);

        return (new MailMessage)
            ->subject('Comissão creditada: '.$this->valor().' · ONDAKA')
            ->view('emails.afiliados.comissao-creditada', [
                'comissao' => $this->comissao,
                'valor' => $this->valor(),
                'base' => number_format((float) $this->comissao->valor_base_kz, 2, ',', '.').' Kz',
                'taxa' => rtrim(rtrim(number_format((float) $this->comissao->taxa_pct, 2, ',', '.'), '0'), ','),
                'cliente' => $this->comissao->empresa?->nome ?? 'Cliente',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $this->comissao->loadMissing('empresa');
        $cliente = $this->comissao->empresa?->nome ?? 'Cliente';

        return [
            'tipo' => 'afiliado_comissao',
            'titulo' => '💰 Comissão creditada: '.$this->valor(),
            'mensagem' => "{$cliente} pagou {$this->comissao->descricao}. Comissão de {$this->comissao->taxa_pct}% sobre o valor sem imposto.",
            'comissao_id' => $this->comissao->id,
            'url' => '/afiliado/comissoes',
        ];
    }
}
