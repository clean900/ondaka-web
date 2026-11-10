<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Integracao\WhatsApp\Concerns\NotificaAfiliadoPorWhatsApp;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: uma comissão terminou a carência e passou a aprovada (conta para pagamento). */
class AfiliadoComissaoAprovadaNotification extends Notification
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

    private function valor(): string
    {
        return number_format((float) $this->comissao->valor_comissao_kz, 2, ',', '.').' Kz';
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->comissao->loadMissing('empresa');

        return (new MailMessage)
            ->subject('Comissão aprovada: '.$this->valor().' · ONDAKA')
            ->view('emails.afiliados.comissao-aprovada', [
                'comissao' => $this->comissao,
                'valor' => $this->valor(),
                'cliente' => $this->comissao->empresa?->nome ?? 'Cliente',
            ]);
    }

    /** Template Meta `afiliado_comissao_aprovada`: {{1}} valor. */
    public function toWhatsapp(object $notifiable): array
    {
        return [
            'template' => (string) config('services.whatsapp.templates.comissao_aprovada', 'afiliado_comissao_aprovada'),
            'parametros' => [$this->valor()],
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_comissao_aprovada',
            'titulo' => '✅ Comissão aprovada: '.$this->valor(),
            'mensagem' => 'Terminou a carência. A comissão já conta para o próximo pagamento.',
            'comissao_id' => $this->comissao->id,
            'url' => '/afiliado/comissoes',
        ];
    }
}
