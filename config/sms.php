<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Provider SMS activo
    |--------------------------------------------------------------------------
    | Determina qual adapter usar para envio de SMS.
    | Valores suportados: telcosms (default), log (para testes sem envio real)
    */
    'provider' => env('SMS_PROVIDER', 'telcosms'),

    /*
    |--------------------------------------------------------------------------
    | Configurações dos providers
    |--------------------------------------------------------------------------
    */
    'providers' => [
        'telcosms' => [
            'api_key' => env('TELCOSMS_API_KEY', ''),
            'sender_id' => env('TELCOSMS_SENDER_ID', 'ONDAKA'), // configurado na conta
            'url_base' => env('TELCOSMS_URL_BASE', 'https://www.telcosms.co.ao/api/v2'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Comportamento
    |--------------------------------------------------------------------------
    */
    'debug_log' => env('SMS_DEBUG_LOG', false), // verbose logging
    'taxa_minima_saldo' => env('SMS_TAXA_MINIMA_SALDO', 100), // alerta quando abaixo
];
