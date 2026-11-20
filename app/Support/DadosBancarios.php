<?php

namespace App\Support;

/**
 * OS DADOS BANCÁRIOS DA PLATAFORMA, NUM SÍTIO SÓ.
 *
 * Três sítios montavam este painel à mão a partir do `config('ondaka.banco.*')`
 * — o OrdemController (com cópias do IBAN escritas no código como rede de
 * segurança) e dois pontos do SubscricaoController. Duas cópias do IBAN é como
 * se transfere para uma conta velha.
 *
 * E havia um buraco pior: `ONDAKA_IBAN=` no .env (definido e VAZIO) faz o
 * `env()` devolver `''`, não `null` — por isso o `?? 'AO06…'` nunca disparava e
 * o cliente via o painel de transferência com o IBAN em branco e um botão
 * «Copiar» que não copia nada. Aqui, vazio e ausente são a mesma coisa, e
 * quando não há IBAN confirmado o painel não aparece de todo: mais vale mandar
 * o cliente falar connosco do que publicar uma conta que não existe.
 */
final class DadosBancarios
{
    /** Os dados tal como vão para o ecrã. Vazio = não configurado. */
    public static function dados(): array
    {
        $b = (array) config('ondaka.banco', []);
        $v = static fn (string $k): string => trim((string) ($b[$k] ?? ''));

        return [
            'beneficiario' => $v('titular'),
            'nif' => $v('nif'),
            'banco' => $v('nome'),
            'iban' => $v('iban'),
            'numero_conta' => $v('numero_conta'),
            'moeda' => $v('moeda') ?: 'AOA',
            'email_comprovativo' => trim((string) config('ondaka.contactos.email')),
        ];
    }

    /** Só se anuncia a transferência quando há mesmo para onde transferir. */
    public static function activo(): bool
    {
        $d = self::dados();

        return $d['iban'] !== '' && $d['beneficiario'] !== '';
    }
}
