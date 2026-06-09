<?php

declare(strict_types=1);

namespace App\Domains\Financas\Services;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Financas\Models\ContaBancaria;

class SincronizarContaBancariaService
{
    /**
     * Cria ou completa a conta bancaria em contas_bancarias a partir
     * dos dados de uma CondominioFacturacaoConfig. Fonte unica para web e mobile.
     * Retorna: 'criada' | 'completada' | 'inalterada' | 'sem_dados'
     */
    public function sincronizarDeConfig(CondominioFacturacaoConfig $config): string
    {
        $banco = trim((string) $config->banco_nome);
        $iban = trim((string) $config->iban);
        $numeroConta = trim((string) $config->numero_conta);

        if ($banco === '' || $iban === '') {
            return 'sem_dados';
        }

        $ibanNorm = $this->normalizarIban($iban);

        $existe = ContaBancaria::where('condominio_id', $config->condominio_id)
            ->get()
            ->first(fn ($c) => $this->normalizarIban((string) $c->iban) === $ibanNorm);

        if ($existe) {
            $mudou = false;
            if (($existe->numero_conta === null || $existe->numero_conta === '') && $numeroConta !== '') {
                $existe->numero_conta = $numeroConta;
                $mudou = true;
            }
            if ($mudou) {
                $existe->save();

                return 'completada';
            }

            return 'inalterada';
        }

        ContaBancaria::create([
            'condominio_id' => $config->condominio_id,
            'nome' => $config->titular_conta ?: 'Conta do condominio',
            'banco' => $banco,
            'iban' => $iban,
            'numero_conta' => $numeroConta !== '' ? $numeroConta : null,
            'tipo' => 'corrente',
            'moeda' => 'AOA',
            'activa' => true,
            'principal' => true,
            'aceita_manual' => true,
            'aceita_proxypay' => false,
        ]);

        return 'criada';
    }

    public function normalizarIban(string $iban): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $iban) ?? '');
    }
}
