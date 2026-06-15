<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Exceptions;

/**
 * Lançada quando o cliente não tem créditos de SMS (feature 'sms_pack_extra' esgotada
 * ou inexistente).
 *
 * Distingue-se da SmsException genérica: NÃO deve cair em fallback de sistema.
 * O envio é bloqueado de propósito (controlo de custo) e o gestor + condómino
 * são notificados para adquirir mais SMS.
 */
class SmsSemSaldoException extends SmsException
{
}
