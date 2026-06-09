<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Sms\Services\SmsService;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Centraliza notificações B2B (5 tipos) por Email + SMS opcional.
 *
 * Tipos:
 *  1. Boas-vindas (trial iniciado) — Email
 *  2. Factura emitida — Email + SMS
 *  3. Pagamento confirmado — Email + SMS
 *  4. Cancelamento processado — Email
 *  5. Recuperação (trial a expirar) — Email + SMS
 */
class NotificacaoB2BService
{
    public function __construct(
        protected SmsService $smsService,
    ) {}

    /**
     * 1. Boas-vindas — só email.
     */
    public function boasVindas(User $user, EmpresaGestora $empresa): void
    {
        $this->enviarEmail(
            email: $user->email,
            assunto: 'Bem-vindo à ONDAKA · Trial 30 dias activo',
            view: 'emails.b2b.boas-vindas',
            dados: [
                'user' => $user,
                'empresa' => $empresa,
            ],
        );
    }

    /**
     * 2. Factura emitida — Email + SMS.
     */
    public function facturaEmitida(User $user, array $factura, EmpresaGestora $empresa): void
    {
        $this->enviarEmail(
            email: $user->email,
            assunto: "Factura {$factura['numero']} emitida · ONDAKA",
            view: 'emails.b2b.factura-emitida',
            dados: [
                'user' => $user,
                'empresa' => $empresa,
                'factura' => $factura,
            ],
        );

        if ($user->telefone) {
            $valor = number_format((float) $factura['valor_total_kz'], 2, ',', '.');
            $this->enviarSms(
                user: $user,
                mensagem: "ONDAKA: Factura {$factura['numero']} de {$valor} Kz emitida. Pague em https://ondaka.ao para manter o serviço activo.",
                contexto: ['tipo' => 'factura_emitida', 'factura_id' => $factura['id'] ?? null],
            );
        }
    }

    /**
     * 3. Pagamento confirmado — Email + SMS.
     */
    public function pagamentoConfirmado(User $user, array $factura, EmpresaGestora $empresa): void
    {
        $this->enviarEmail(
            email: $user->email,
            assunto: "Pagamento confirmado · {$factura['numero']}",
            view: 'emails.b2b.pagamento-confirmado',
            dados: [
                'user' => $user,
                'empresa' => $empresa,
                'factura' => $factura,
            ],
        );

        if ($user->telefone) {
            $valor = number_format((float) $factura['valor_total_kz'], 2, ',', '.');
            $this->enviarSms(
                user: $user,
                mensagem: "ONDAKA: Pagamento de {$valor} Kz confirmado. Subscrição activa. Obrigado!",
                contexto: ['tipo' => 'pagamento_confirmado', 'factura_id' => $factura['id'] ?? null],
            );
        }
    }

    /**
     * 4. Cancelamento — só email.
     */
    public function cancelamentoProcessado(User $user, EmpresaGestora $empresa, ?string $motivo = null): void
    {
        $this->enviarEmail(
            email: $user->email,
            assunto: 'Cancelamento da subscrição ONDAKA',
            view: 'emails.b2b.cancelamento',
            dados: [
                'user' => $user,
                'empresa' => $empresa,
                'motivo' => $motivo,
            ],
        );
    }

    /**
     * 5. Recuperação (trial a expirar) — Email + SMS.
     */
    public function recuperacaoTrialExpirar(User $user, EmpresaGestora $empresa, int $diasRestantes): void
    {
        $this->enviarEmail(
            email: $user->email,
            assunto: "O seu trial expira em {$diasRestantes} dias · ONDAKA",
            view: 'emails.b2b.recuperacao-trial',
            dados: [
                'user' => $user,
                'empresa' => $empresa,
                'dias_restantes' => $diasRestantes,
            ],
        );

        // SMS apenas quando faltar 7 dias ou menos
        if ($diasRestantes <= 7 && $user->telefone) {
            $this->enviarSms(
                user: $user,
                mensagem: "ONDAKA: O seu trial expira em {$diasRestantes} " . ($diasRestantes === 1 ? 'dia' : 'dias') . ". Subscreva em https://ondaka.ao para não perder o acesso.",
                contexto: ['tipo' => 'recuperacao_trial', 'dias' => $diasRestantes],
            );
        }
    }

    // -----------------------------------------------------------------
    // INTERNOS
    // -----------------------------------------------------------------

    protected function enviarEmail(string $email, string $assunto, string $view, array $dados): void
    {
        try {
            Mail::send($view, $dados, function ($message) use ($email, $assunto) {
                $message->to($email)->subject($assunto);
            });
        } catch (\Throwable $e) {
            Log::error('NotificacaoB2B email falhou', [
                'email' => $email,
                'view' => $view,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    protected function enviarSms(User $user, string $mensagem, array $contexto = []): void
    {
        if (! $user->telefone) {
            return;
        }
        try {
            $this->smsService->enviarComFallback(
                owner: $user,
                numero: $user->telefone,
                mensagem: $mensagem,
                contexto: array_merge(['origem' => 'notificacao_b2b'], $contexto),
            );
        } catch (\Throwable $e) {
            Log::error('NotificacaoB2B SMS falhou', [
                'user_id' => $user->id,
                'erro' => $e->getMessage(),
            ]);
        }
    }
}
