<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Exceptions;

class SmsException extends \RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?int $codigoHttp = null,
        public readonly array $respostaBruta = [],
    ) {
        parent::__construct($message);
    }
}
