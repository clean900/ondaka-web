<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Mail;

use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialAvisoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Subscricao $subscricao,
        public string $tipo,
    ) {}

    public function envelope(): Envelope
    {
        $assunto = match ($this->tipo) {
            'trial_boas_vindas' => 'Bem-vindo ao ONDAKA — 30 dias grátis começaram',
            'trial_7_dias_restantes' => 'Faltam 7 dias para o fim do seu trial',
            'trial_3_dias_restantes' => 'Apenas 3 dias para o fim do trial — prepare o pagamento',
            'trial_expira_hoje' => 'O seu trial termina hoje — converta agora',
            'grace_dia_1' => 'Período de graça iniciou — tem 7 dias para pagar',
            'grace_dia_3' => 'Período de graça — faltam 4 dias antes da suspensão',
            'grace_dia_7' => 'ÚLTIMO AVISO — a sua conta será suspensa amanhã',
            'conta_suspensa' => 'A sua conta ONDAKA foi suspensa',
            default => 'Notificação ONDAKA',
        };

        return new Envelope(
            subject: $assunto,
            from: config('mail.from.address', 'noreply@ondaka.ao'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.trial-aviso',
            with: [
                'subscricao' => $this->subscricao,
                'empresa' => $this->subscricao->empresa,
                'tipo' => $this->tipo,
                'diasTrial' => $this->subscricao->diasRestantesTrial(),
                'diasGrace' => $this->subscricao->diasRestantesGrace(),
            ],
        );
    }
}
