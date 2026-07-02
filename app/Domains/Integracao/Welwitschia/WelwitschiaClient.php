<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
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
    /** Chave de integração: da BD (definida no painel) com fallback ao .env. */
    public function token(): ?string
    {
        $db = $this->config('welwitschia_token');
        return filled($db) ? $db : (config('services.welwitschia.token') ?: null);
    }

    public function url(): string
    {
        $db = $this->config('welwitschia_url');
        return rtrim((string) (filled($db) ? $db : config('services.welwitschia.url')), '/');
    }

    private function config(string $chave): ?string
    {
        try {
            return DB::table('plataforma_config')->where('chave', $chave)->value('valor');
        } catch (\Throwable) {
            return null;
        }
    }

    public function configurado(): bool
    {
        return filled($this->token()) && filled($this->url());
    }

    private function req(): PendingRequest
    {
        return Http::baseUrl($this->url())
            ->withToken((string) $this->token())
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

    /**
     * Cria/actualiza uma factura na Welwitschia (idempotente por invoice_number).
     * $dados: customer_name*, customer_email, invoice_number*, total_amount*,
     *         paid_amount, invoice_date, due_date.
     */
    public function criarFactura(array $dados): Response
    {
        return $this->req()->post('/facturas', array_filter(
            $dados,
            fn ($v) => $v !== null && $v !== '',
        ));
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
