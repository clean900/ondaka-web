<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Support;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Integracao\Sms\Adapters\TelcoSmsAdapter;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Integracao\Sms\Models\SmsSenderConfig;

/**
 * Decide qual provider SMS usar para um dado condomínio.
 *
 * - Se o condomínio tem SmsSenderConfig configurada (estado=configurado + api_key),
 *   devolve um adapter com a API key própria (SMS sai com o sender personalizado).
 * - Caso contrário, devolve o provider global (sender "ONDAKA").
 */
class SmsSenderResolver
{
    public function __construct(
        private readonly SmsProviderInterface $providerGlobal,
    ) {}

    public function paraCondominio(?Condominio $condominio): SmsProviderInterface
    {
        if (! $condominio) {
            return $this->providerGlobal;
        }

        $config = SmsSenderConfig::query()
            ->where('condominio_id', $condominio->id)
            ->where('estado', 'configurado')
            ->whereNotNull('api_key')
            ->first();

        if (! $config || empty($config->api_key)) {
            return $this->providerGlobal;
        }

        return new TelcoSmsAdapter(
            apiKey: (string) $config->api_key,
            urlBase: (string) config('sms.providers.telcosms.url_base'),
        );
    }
}
