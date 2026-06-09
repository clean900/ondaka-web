<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Contracts;

/**
 * Resultado de envio de SMS.
 */
final class SmsResult
{
    public function __construct(
        public readonly bool $sucesso,
        public readonly ?string $idMensagem,
        public readonly string $status,
        public readonly ?int $creditosUsados = null,
        public readonly ?int $saldoRestante = null,
        public readonly ?string $mensagemErro = null,
        public readonly array $respostaBruta = [],
    ) {}

    public static function sucesso(
        ?string $idMensagem,
        string $status,
        ?int $creditosUsados = null,
        ?int $saldoRestante = null,
        array $respostaBruta = [],
    ): self {
        return new self(
            sucesso: true,
            idMensagem: $idMensagem,
            status: $status,
            creditosUsados: $creditosUsados,
            saldoRestante: $saldoRestante,
            respostaBruta: $respostaBruta,
        );
    }

    public static function falha(string $mensagemErro, array $respostaBruta = []): self
    {
        return new self(
            sucesso: false,
            idMensagem: null,
            status: 'failed',
            mensagemErro: $mensagemErro,
            respostaBruta: $respostaBruta,
        );
    }
}
