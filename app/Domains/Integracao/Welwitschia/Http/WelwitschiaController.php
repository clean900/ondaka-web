<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia\Http;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Welwitschia\FacturaWelwitschiaSync;
use App\Domains\Integracao\Welwitschia\Jobs\SincronizarClienteWelwitschiaJob;
use App\Domains\Integracao\Welwitschia\WelwitschiaClient;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Painel super-admin de INTEGRAÇÃO com o ERP Welwitschia.
 *
 * Direção ÚNICA: o ONDAKA empurra os seus clientes e faturas PARA a Welwitschia
 * (ERP central certificado pela AGT). NÃO lê dados da Welwitschia de volta.
 * O gestor cola aqui a chave gerada na Welwitschia e a integração arranca.
 */
class WelwitschiaController extends Controller
{
    public function index(WelwitschiaClient $welw): Response
    {
        $configurado = $welw->configurado();
        $identidade = null;
        if ($configurado) {
            $ping = $welw->ping();
            if ($ping['ok'] ?? false) {
                $identidade = [
                    'filial' => $ping['token'] ?? null,
                    'tenant_id' => $ping['tenant_id'] ?? null,
                    'branch_id' => $ping['branch_id'] ?? null,
                ];
            }
        }

        return Inertia::render('SuperAdmin/Welwitschia/Index', [
            'configurado' => $configurado,
            'ligado' => $identidade !== null,
            'identidade' => $identidade,
            // Estado do que o ONDAKA envia (a nossa ponta), não dados da Welwitschia.
            'ondaka' => [
                'clientes' => EmpresaGestora::count(),
                'facturas' => DB::table('plataforma_facturas')->where('estado', '!=', 'anulada')->count(),
            ],
            'url' => $welw->url(),
        ]);
    }

    /** Guarda a chave de integração (e URL opcional) e valida com um ping. */
    public function guardarChave(Request $request, WelwitschiaClient $welw): RedirectResponse
    {
        $dados = $request->validate([
            'token' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:255'],
        ]);

        DB::table('plataforma_config')->updateOrInsert(
            ['chave' => 'welwitschia_token'],
            ['valor' => trim($dados['token']), 'tipo' => 'string', 'descricao' => 'Chave de integração Welwitschia', 'updated_at' => now(), 'created_at' => now()],
        );
        if (! empty($dados['url'])) {
            DB::table('plataforma_config')->updateOrInsert(
                ['chave' => 'welwitschia_url'],
                ['valor' => rtrim($dados['url'], '/'), 'tipo' => 'string', 'descricao' => 'URL da API Welwitschia', 'updated_at' => now(), 'created_at' => now()],
            );
        }

        $ping = app(WelwitschiaClient::class)->ping();
        if ($ping['ok'] ?? false) {
            return back()->with('flash.success', 'Integração ligada à filial ' . ($ping['token'] ?? '') . '.');
        }

        return back()->with('flash.error', 'Chave guardada, mas o ping falhou — verifique a chave/URL.');
    }

    /** Backfill manual: reenvia todos os clientes e faturas para a Welwitschia. */
    public function sincronizar(WelwitschiaClient $welw): RedirectResponse
    {
        if (! $welw->configurado()) {
            return back()->with('flash.error', 'Configure a chave de integração primeiro.');
        }

        EmpresaGestora::query()->get(['id', 'nome', 'email_contacto'])->each(function ($e) {
            SincronizarClienteWelwitschiaJob::dispatch($e->nome, $e->email_contacto, (int) $e->id);
        });

        DB::table('plataforma_facturas')->where('estado', '!=', 'anulada')->pluck('id')
            ->each(fn ($id) => FacturaWelwitschiaSync::sincronizar((int) $id));

        return back()->with('flash.success', 'Sincronização iniciada — clientes e faturas estão a ser enviados.');
    }
}
