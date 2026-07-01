<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia\Http;

use App\Domains\Integracao\Welwitschia\WelwitschiaClient;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Painel super-admin: consolidação financeira do ONDAKA no ERP Welwitschia
 * (lê /reconciliacao + /facturas + /clientes). Só leitura.
 */
class WelwitschiaController extends Controller
{
    public function index(WelwitschiaClient $welw): Response
    {
        if (! $welw->configurado()) {
            return Inertia::render('SuperAdmin/Welwitschia/Index', [
                'ligado' => false,
                'erro' => 'Integração não configurada (WELWITSCHIA_TOKEN em falta no servidor).',
                'identidade' => null,
                'reconciliacao' => null,
                'facturas' => [],
                'clientes' => [],
            ]);
        }

        $ping = $welw->ping();
        if (! ($ping['ok'] ?? false)) {
            return Inertia::render('SuperAdmin/Welwitschia/Index', [
                'ligado' => false,
                'erro' => 'Não foi possível ligar à Welwitschia. Verifique o token e a API.',
                'identidade' => null,
                'reconciliacao' => null,
                'facturas' => [],
                'clientes' => [],
            ]);
        }

        return Inertia::render('SuperAdmin/Welwitschia/Index', [
            'ligado' => true,
            'erro' => null,
            'identidade' => [
                'filial' => $ping['token'] ?? null,
                'tenant_id' => $ping['tenant_id'] ?? null,
                'branch_id' => $ping['branch_id'] ?? null,
            ],
            'reconciliacao' => $welw->reconciliacao()['data'] ?? null,
            'facturas' => $welw->facturas()['data'] ?? [],
            'clientes' => $welw->listarClientes()['data'] ?? [],
        ]);
    }
}
