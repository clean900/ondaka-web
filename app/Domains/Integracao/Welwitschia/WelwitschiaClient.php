<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Cliente da API de Integração da Welwitschia (ERP).
 * Base: https://welwitschia.ao/api/integration/v1 · Auth: Bearer <token de filial>.
 *
 * O ONDAKA é uma filial na Welwitschia e empurra as empresas gestoras como
 * clientes (POST /clientes). Leitura: /clientes, /facturas, /reconciliacao.
 */
class WelwitschiaClient
{
    public function configurado(): bool
    {
        return filled(config('services.welwitschia.token'))
            && filled(config('services.welwitschia.url'));
    }

    private function req(): PendingRequest
    {
        return Http::baseUrl(rtrim((string) config('services.welwitschia.url'), '/'))
            ->withToken((string) config('services.welwitschia.token'))
            ->acceptJson()
            ->timeout(15)
            ->retry(2, 500, throw: false);
    }

    /** Identidade do token (tenant/filial). */
    public function ping(): array
    {
        return $this->req()->get('/ping')->json() ?? [];
    }

    /** Cria/sincroniza um cliente na Welwitschia. Idempotente do lado do ERP (por email/nome). */
    public function criarCliente(string $name, ?string $email = null): Response
    {
        return $this->req()->post('/clientes', array_filter([
            'name' => $name,
            'email' => $email,
        ], fn ($v) => $v !== null && $v !== ''));
    }

    public function listarClientes(): array
    {
        return $this->req()->get('/clientes')->json() ?? [];
    }

    public function facturas(): array
    {
        return $this->req()->get('/facturas')->json() ?? [];
    }

    public function reconciliacao(): array
    {
        return $this->req()->get('/reconciliacao')->json() ?? [];
    }
}
