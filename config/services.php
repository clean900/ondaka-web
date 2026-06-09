<?php

return [

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | TelcoSMS Angola — 2FA e notificações SMS
    |--------------------------------------------------------------------------
    */
    'telcosms' => [
        'url' => env('TELCOSMS_API_URL', 'https://api.telcosms.co.ao/v1/sms/send'),
        'key' => env('TELCOSMS_API_KEY'),
        'sender' => env('TELCOSMS_SENDER_ID', 'ONDAKA'),
    ],

    /*
    |--------------------------------------------------------------------------
    | ProxyPay Angola — Gateway pagamentos
    |--------------------------------------------------------------------------
    */
    'proxypay' => [
        'mode' => env('PROXYPAY_MODE', 'sandbox'),
        'base_url' => env('PROXYPAY_MODE') === 'production'
            ? env('PROXYPAY_BASE_URL', 'https://api.proxypay.co.ao')
            : env('PROXYPAY_SANDBOX_URL', 'https://api.sandbox.proxypay.co.ao'),
        'api_key' => env('PROXYPAY_API_KEY'),
        'entity_id' => env('PROXYPAY_ENTITY_ID'),
        'webhook_secret' => env('PROXYPAY_WEBHOOK_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Hikvision ANPR — Matrículas
    |--------------------------------------------------------------------------
    */
    'hikvision' => [
        'username' => env('HIKVISION_USERNAME'),
        'password' => env('HIKVISION_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Conformidade DP 141/15 Angola
    |--------------------------------------------------------------------------
    */
    'dp14115' => [
        'fundo_reserva_minimo_pct' => env('DP14115_PERCENTAGEM_FUNDO_RESERVA_MINIMA', 10.00),
        'limite_quota_ucf_m2' => env('DP14115_LIMITE_QUOTA_UCF_POR_M2', 6.00),
    ],

    /*
    |--------------------------------------------------------------------------
    | ONDAKA — User sistema para acções automáticas
    |--------------------------------------------------------------------------
    */
    'ondaka' => [
        'system_user_id' => (int) env('ONDAKA_SYSTEM_USER_ID', 0),
    ],


    /*
    |--------------------------------------------------------------------------
    | Firebase Cloud Messaging (Push Notifications)
    |--------------------------------------------------------------------------
    */
    'fcm' => [
        'project_id' => env('FCM_PROJECT_ID', 'ondaka-prod'),
        'service_account_path' => env('FCM_SERVICE_ACCOUNT_PATH'),
    ],

];
