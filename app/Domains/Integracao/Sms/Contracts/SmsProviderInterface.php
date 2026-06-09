<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Contracts;

/**
 * Contrato para providers SMS.
 * Permite trocar TelcoSMS por outro provedor sem mudar código de negócio.
 */
interface SmsProviderInterface
{
    /**
     * Envia um SMS.
     * Lança SmsException em caso de falha.
     *
     * @return SmsResult Com ID da mensagem, status inicial, etc
     */
    public function enviar(string $numero, string $mensagem): SmsResult;

    /**
     * Consulta saldo/créditos restantes na conta do provider.
     * Devolve null se não suportado.
     */
    public function saldo(): ?int;

    /**
     * Nome do provider (para logs, interface admin).
     */
    public function nome(): string;
}
