<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Dados da empresa emissora (ONDAKA / Soluções Simples, Lda)
    |--------------------------------------------------------------------------
    | Aparecem nas facturas e comprovativos legais.
    | Conformes com DP 141/15 de 29 de Junho (Angola).
    */
    'emissor' => [
        'nome' => env('ONDAKA_EMISSOR_NOME', 'Soluções Simples, Lda'),
        'nif' => env('ONDAKA_EMISSOR_NIF', 'PLACEHOLDER_NIF_SOLUCOES_SIMPLES'),
        'morada' => env('ONDAKA_EMISSOR_MORADA', 'Luanda, Angola'),
        'provincia' => env('ONDAKA_EMISSOR_PROVINCIA', 'Luanda'),
        'telefone' => env('ONDAKA_EMISSOR_TELEFONE', ''),
        'email' => env('ONDAKA_EMISSOR_EMAIL', 'geral@ondaka.ao'),
        'website' => 'https://ondaka.ao',
    ],

    /*
    |--------------------------------------------------------------------------
    | Dados bancários (apresentados ao cliente para pagamento)
    |--------------------------------------------------------------------------
    */
    'banco' => [
        'nome' => env('ONDAKA_BANCO_NOME', 'Banco de Fomento Angola (BFA)'),
        'iban' => env('ONDAKA_IBAN', 'AO06 0006 0000 0000 0000 0000 0'),
        'moeda' => 'AOA',
    ],

    /*
    |--------------------------------------------------------------------------
    | Facturação
    |--------------------------------------------------------------------------
    */
    'factura' => [
        'serie' => env('ONDAKA_FACTURA_SERIE', date('Y')), // "2026"
        'taxa_iva' => 14.00,
        'prazo_vencimento_dias' => 30,
        // Moeda para impressão
        'moeda_simbolo' => 'Kz',
    ],
];
