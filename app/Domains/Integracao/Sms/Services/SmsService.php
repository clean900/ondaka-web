<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Services;

use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Integracao\Sms\Contracts\SmsResult;
use App\Domains\Integracao\Sms\Exceptions\SmsException;
use App\Domains\Integracao\Sms\Models\SmsLog;
use App\Domains\Integracao\Sms\Support\NumeroAngola;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

/**
 * Serviço orquestrador de envios SMS.
 */
class SmsService
{
    public function __construct(
        protected SmsProviderInterface $provider,
    ) {}

    /**
     * Envia SMS consumindo saldo da feature 'sms_sender_id' do owner.
     */
    public function enviar(Model $owner, string $numero, string $mensagem, array $contexto = []): SmsResult
    {
        if (! FeatureGate::has($owner, 'sms_sender_id')) {
            $this->registarLogErro($owner, $numero, $mensagem, 'Feature SMS Sender ID não está activa', $contexto);
            throw new SmsException('Feature SMS Sender ID não está activa para este cliente.');
        }

        $consumido = FeatureGate::consume(
            owner: $owner,
            featureSlug: 'sms_sender_id',
            quantidade: 1,
            acao: 'sms_enviado',
            metadata: ['trigger' => $contexto['trigger'] ?? null],
            userId: $contexto['user_id'] ?? null,
        );

        if (! $consumido) {
            $this->registarLogErro($owner, $numero, $mensagem, 'Saldo SMS esgotado', $contexto);
            throw new SmsException('Saldo SMS esgotado. Recarregue a feature SMS Sender ID para continuar.');
        }

        $subscription = FeatureGate::getSubscription($owner, 'sms_sender_id');

        $log = $this->criarLog(
            owner: $owner,
            numero: $numero,
            mensagem: $mensagem,
            categoria: $contexto['categoria'] ?? 'sistema',
            contexto: $contexto,
            subscriptionId: $subscription?->id,
            creditosConsumidos: 1,
        );

        try {
            $resultado = $this->provider->enviar($numero, $mensagem);

            if (! $resultado->sucesso) {
                $this->devolverCredito($owner, $log, 'Provider rejeitou: '.$resultado->mensagemErro);
                $this->actualizarLogFalha($log, $resultado->mensagemErro ?? 'Envio falhou', $resultado->respostaBruta);
                throw new SmsException($resultado->mensagemErro ?? 'Envio falhou no provider.');
            }

            $this->actualizarLogSucesso($log, $resultado);
            return $resultado;

        } catch (SmsException $e) {
            $this->devolverCredito($owner, $log, $e->getMessage());
            $this->actualizarLogFalha($log, $e->getMessage());
            throw $e;
        } catch (\Throwable $e) {
            $this->devolverCredito($owner, $log, 'Excepção: '.$e->getMessage());
            $this->actualizarLogFalha($log, 'Excepção: '.$e->getMessage());
            throw new SmsException('Erro inesperado ao enviar SMS: '.$e->getMessage());
        }
    }

    /**
     * Enviar SMS sem consumir saldo cliente (SMS de sistema).
     */
    public function enviarSistema(string $numero, string $mensagem, array $contexto = []): SmsResult
    {
        $log = $this->criarLog(
            owner: null,
            numero: $numero,
            mensagem: $mensagem,
            categoria: $contexto['categoria'] ?? 'sistema',
            contexto: $contexto,
            subscriptionId: null,
            creditosConsumidos: 0,
        );

        try {
            $resultado = $this->provider->enviar($numero, $mensagem);

            if ($resultado->sucesso) {
                $this->actualizarLogSucesso($log, $resultado);
            } else {
                $this->actualizarLogFalha($log, $resultado->mensagemErro ?? 'Falhou', $resultado->respostaBruta);
            }

            return $resultado;
        } catch (\Throwable $e) {
            $this->actualizarLogFalha($log, $e->getMessage());
            throw $e;
        }
    }

    /**
     * Enviar com fallback automático:
     *   Tenta consumir saldo cliente. Se não tem feature activa ou saldo,
     *   usa modo sistema (não falha o fluxo crítico).
     */
    public function enviarComFallback(Model $owner, string $numero, string $mensagem, array $contexto = []): SmsResult
    {
        try {
            return $this->enviar($owner, $numero, $mensagem, $contexto);
        } catch (SmsException $e) {
            Log::info('[SMS] Fallback para sistema', [
                'motivo' => $e->getMessage(),
                'contexto' => $contexto,
            ]);
            return $this->enviarSistema($numero, $mensagem, array_merge($contexto, [
                'fallback_de_cliente' => true,
                'fallback_motivo' => $e->getMessage(),
            ]));
        }
    }

    public function saldoProvider(): ?int
    {
        return $this->provider->saldo();
    }

    /* =========================================================
       PRIVADOS
       ========================================================= */

    private function criarLog(
        ?Model $owner,
        string $numero,
        string $mensagem,
        string $categoria,
        array $contexto,
        ?int $subscriptionId,
        int $creditosConsumidos,
    ): SmsLog {
        try {
            $numeroNormalizado = NumeroAngola::normalizar($numero);
        } catch (\InvalidArgumentException) {
            $numeroNormalizado = $numero;
        }

        return SmsLog::create([
            'owner_type' => $owner ? get_class($owner) : null,
            'owner_id' => $owner?->getKey(),
            'numero_destinatario' => $numeroNormalizado,
            'numero_mascarado' => $this->mascarar($numeroNormalizado),
            'mensagem' => mb_substr($mensagem, 0, 800),
            'tamanho_chars' => mb_strlen($mensagem),
            'segmentos' => SmsLog::calcularSegmentos($mensagem),
            'categoria' => $categoria,
            'trigger' => $contexto['trigger'] ?? null,
            'user_id' => $contexto['user_id'] ?? null,
            'feature_subscription_id' => $subscriptionId,
            'ordem_compra_id' => $contexto['ordem_compra_id'] ?? null,
            'provider' => $this->provider->nome(),
            'estado' => 'pendente',
            'tentativas' => 1,
            'creditos_consumidos_cliente' => $creditosConsumidos,
        ]);
    }

    private function actualizarLogSucesso(SmsLog $log, SmsResult $resultado): void
    {
        $log->update([
            'estado' => 'enviado',
            'provider_id' => $resultado->idMensagem,
            'saldo_provider_apos' => $resultado->saldoRestante,
            'resposta_bruta' => $resultado->respostaBruta,
            'enviado_em' => now(),
        ]);
    }

    private function actualizarLogFalha(SmsLog $log, string $erro, array $respostaBruta = []): void
    {
        $log->update([
            'estado' => 'falhado',
            'erro_mensagem' => $erro,
            'resposta_bruta' => $respostaBruta,
            'falhado_em' => now(),
        ]);
    }

    private function registarLogErro(Model $owner, string $numero, string $mensagem, string $erro, array $contexto): void
    {
        try {
            $numeroNormalizado = NumeroAngola::normalizar($numero);
        } catch (\InvalidArgumentException) {
            $numeroNormalizado = $numero;
        }

        SmsLog::create([
            'owner_type' => get_class($owner),
            'owner_id' => $owner->getKey(),
            'numero_destinatario' => $numeroNormalizado,
            'numero_mascarado' => $this->mascarar($numeroNormalizado),
            'mensagem' => mb_substr($mensagem, 0, 800),
            'tamanho_chars' => mb_strlen($mensagem),
            'segmentos' => SmsLog::calcularSegmentos($mensagem),
            'categoria' => $contexto['categoria'] ?? 'sistema',
            'trigger' => $contexto['trigger'] ?? null,
            'user_id' => $contexto['user_id'] ?? null,
            'ordem_compra_id' => $contexto['ordem_compra_id'] ?? null,
            'provider' => $this->provider->nome(),
            'estado' => 'rejeitado',
            'erro_mensagem' => $erro,
            'falhado_em' => now(),
        ]);
    }

    private function devolverCredito(Model $owner, SmsLog $log, string $motivo): void
    {
        try {
            $subscription = FeatureGate::getSubscription($owner, 'sms_sender_id');

            if ($subscription) {
                $subscription->increment('saldo_actual', 1);
                $subscription->decrement('saldo_utilizado', 1);
                $log->update(['saldo_devolvido' => true]);

                Log::warning('[SMS] Crédito devolvido', [
                    'subscription_id' => $subscription->id,
                    'log_id' => $log->id,
                    'motivo' => $motivo,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('[SMS] Falha ao devolver crédito: '.$e->getMessage());
        }
    }

    private function mascarar(string $numero): string
    {
        if (strlen($numero) < 4) return '***';
        return substr($numero, 0, 3).'****'.substr($numero, -2);
    }
}
