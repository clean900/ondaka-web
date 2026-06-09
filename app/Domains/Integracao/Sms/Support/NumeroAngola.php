<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Support;

/**
 * Normaliza números de telefone para o formato aceite pelo TelcoSMS.
 *
 * Aceita os seguintes formatos de entrada:
 *   - 923456789          (9 dígitos começando por 9)
 *   - 0923456789         (com 0 à frente)
 *   - 244923456789       (com indicativo)
 *   - +244923456789      (E.164)
 *   - 244 923 456 789    (com espaços)
 *   - 923-456-789        (com hífens)
 *
 * Devolve: 9XX XXX XXX no formato normalizado "923456789"
 * (TelcoSMS aceita sem indicativo, 9 dígitos).
 *
 * Em Angola, números móveis começam obrigatoriamente por 9.
 */
class NumeroAngola
{
    /**
     * @throws \InvalidArgumentException Se o número for inválido
     */
    public static function normalizar(string $numero): string
    {
        // Remover tudo que não seja dígito
        $digitos = preg_replace('/\D+/', '', $numero);

        // Remover prefixo 244 (código do país)
        if (str_starts_with($digitos, '244') && strlen($digitos) === 12) {
            $digitos = substr($digitos, 3);
        }

        // Remover 0 à frente (ex: 0923456789 → 923456789)
        if (str_starts_with($digitos, '0') && strlen($digitos) === 10) {
            $digitos = substr($digitos, 1);
        }

        // Validar: 9 dígitos começando por 9
        if (! preg_match('/^9\d{8}$/', $digitos)) {
            throw new \InvalidArgumentException(
                "Número '{$numero}' não é um móvel angolano válido. "
                ."Formato esperado: 9XX XXX XXX (9 dígitos começando por 9)."
            );
        }

        return $digitos;
    }

    /**
     * Versão com indicativo (para apresentação ou logs):
     *   923456789 → +244 923 456 789
     */
    public static function formatarApresentacao(string $numero): string
    {
        try {
            $d = self::normalizar($numero);
            return '+244 '.substr($d, 0, 3).' '.substr($d, 3, 3).' '.substr($d, 6);
        } catch (\InvalidArgumentException) {
            return $numero;
        }
    }

    /**
     * Verifica se é um número angolano válido sem lançar excepção.
     */
    public static function ehValido(string $numero): bool
    {
        try {
            self::normalizar($numero);
            return true;
        } catch (\InvalidArgumentException) {
            return false;
        }
    }
}
