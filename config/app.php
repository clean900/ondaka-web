<?php

return [
    'name' => env('APP_NAME', 'Ondaka'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'https://ondaka.ao'),
    'timezone' => env('APP_TIMEZONE', 'Africa/Luanda'),
    'locale' => env('APP_LOCALE', 'pt'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'pt'),
    'faker_locale' => env('APP_FAKER_LOCALE', 'pt_PT'),
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [
        ...array_filter(explode(',', (string) env('APP_PREVIOUS_KEYS'))),
    ],
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],
];
