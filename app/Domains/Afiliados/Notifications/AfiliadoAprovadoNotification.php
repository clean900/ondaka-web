<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Notifications;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Integracao\WhatsApp\Concerns\NotificaAfiliadoPorWhatsApp;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Afiliado: conta aprovada/activada — recebe o código e o link. */
class AfiliadoAprovadoNotification extends Notification
{
    use NotificaAfiliadoPorWhatsApp;
    use Queueable;

    public function __construct(public Afiliado $afiliado) {}

    public function via(object $notifiable): array
    {
        return $this->comWhatsapp(['database', 'mail']);
    }

    protected function afiliadoAlvo(): ?Afiliado
    {
        return $this->afiliado;
    }

    /** Template Meta `afiliado_candidatura_aprovada`: {{1}} nome · {{2}} código · {{3}} link. */
    public function toWhatsapp(object $notifiable): array
    {
        return [
            'template' => (string) config('services.whatsapp.templates.candidatura_aprovada', 'afiliado_candidatura_aprovada'),
            'parametros' => [
                $this->afiliado->nome,
                $this->afiliado->codigo,
                $this->afiliado->linkReferencia(),
            ],
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('A sua conta de afiliado ONDAKA está activa')
            ->view('emails.afiliados.aprovado', [
                'afiliado' => $this->afiliado,
                'link' => $this->afiliado->linkReferencia(),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'afiliado_aprovado',
            'titulo' => '🎉 Conta de afiliado activa',
            'mensagem' => "O seu código é {$this->afiliado->codigo}. Partilhe o seu link e comece a ganhar comissões.",
            'url' => '/afiliado',
        ];
    }
}
