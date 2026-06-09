<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domains\Integracao\Sms\Adapters\TelcoSmsAdapter;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Integracao\TelcoSms\TelcoSmsService;
use Illuminate\Support\ServiceProvider;

class IntegracoesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Binding legado (mantido por compatibilidade)
        $this->app->singleton(TelcoSmsService::class, function () {
            return new TelcoSmsService(
                apiUrl: (string) config('services.telcosms.url'),
                apiKey: (string) config('services.telcosms.key'),
                senderId: (string) config('services.telcosms.sender'),
            );
        });

        // Binding novo — SmsProviderInterface
        $this->app->bind(SmsProviderInterface::class, function () {
            $provider = config('sms.provider', 'telcosms');

            return match ($provider) {
                'telcosms' => new TelcoSmsAdapter(
                    apiKey: (string) config('sms.providers.telcosms.api_key'),
                    urlBase: config('sms.providers.telcosms.url_base'),
                ),
                default => throw new \RuntimeException("SMS provider não suportado: {$provider}"),
            };
        });
    }
}
