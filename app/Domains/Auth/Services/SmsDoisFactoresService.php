<?php

declare(strict_types=1);

namespace App\Domains\Auth\Services;

use App\Domains\Integracao\Sms\Exceptions\SmsException;
use App\Domains\Integracao\Sms\Services\SmsService;
use App\Models\CodigoVerificacaoSms;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SmsDoisFactoresService
{
    public function __construct(
        private readonly SmsService $smsService,
    ) {}

    /**
     * Gera código de 6 dígitos e envia por SMS.
     * Rate limit: 3 códigos por 10 minutos.
     *
     * Se user tem empresa com feature sms_sender_id activa, consome saldo.
     * Caso contrário, envia como sistema (2FA é crítico).
     */
    public function gerarEEnviar(User $user, string $proposito = 'login_2fa'): bool
    {
        if (empty($user->telefone)) {
            return false;
        }

        $recentes = CodigoVerificacaoSms::where('user_id', $user->id)
            ->where('proposito', $proposito)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->count();

        if ($recentes >= 3) {
            return false;
        }

        $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        CodigoVerificacaoSms::create([
            'user_id' => $user->id,
            'codigo_hash' => Hash::make($codigo),
            'telefone' => $user->telefone,
            'proposito' => $proposito,
            'expira_em' => now()->addMinutes(5),
            'ip_solicitacao' => request()->ip(),
        ]);

        $mensagem = "ONDAKA: O seu codigo e {$codigo}. Valido 5 minutos. Nao partilhe.";

        $contexto = [
            'trigger' => $proposito,
            'categoria' => 'sistema',
            'user_id' => $user->id,
        ];

        try {
            // Código 2FA é mensagem de sistema ONDAKA: envia sempre por sistema.
            // Nunca consome créditos do cliente nem bloqueia o login por falta de saldo.
            $this->smsService->enviarSistema($user->telefone, $mensagem, $contexto);

            return true;

        } catch (SmsException $e) {
            Log::error('[2FA] Falha ao enviar código SMS', [
                'user_id' => $user->id,
                'proposito' => $proposito,
                'erro' => $e->getMessage(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error('[2FA] Excepção ao enviar código SMS', [
                'user_id' => $user->id,
                'erro' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Verifica se o código é válido. Máximo 5 tentativas por código.
     */
    public function verificar(User $user, string $codigo, string $proposito = 'login_2fa'): bool
    {
        $registo = CodigoVerificacaoSms::where('user_id', $user->id)
            ->where('proposito', $proposito)
            ->whereNull('usado_em')
            ->where('expira_em', '>=', now())
            ->latest()
            ->first();

        if (! $registo) {
            return false;
        }

        $registo->increment('tentativas');

        if ($registo->tentativas > 5) {
            $registo->update(['usado_em' => now()]);
            return false;
        }

        if (! Hash::check($codigo, $registo->codigo_hash)) {
            return false;
        }

        $registo->update(['usado_em' => now()]);
        return true;
    }
}
