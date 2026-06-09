<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Domains\Financas\Services\SincronizarContaBancariaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuração de facturação por condomínio.
 *
 * URL: /condominios/{condominio}/facturacao
 *
 * Tabs:
 * 1. Coordenadas Bancárias
 * 2. ProxyPay
 * 3. Quotas (Fase C)
 * 4. Multas (Fase C)
 */
class FacturacaoConfigController extends Controller
{
    public function show(Request $request, Condominio $condominio): Response
    {
        $user = $request->user();
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) abort(403);

        $config = CondominioFacturacaoConfig::firstOrCreate(
            ['condominio_id' => $condominio->id],
            ['empresa_gestora_id' => $condominio->empresa_gestora_id]
        );

        return Inertia::render('Facturacao/Config', [
            'condominio' => [
                'id' => $condominio->id,
                'nome' => $condominio->nome,
            ],
            'config' => [
                // Coordenadas bancárias
                'banco_nome' => $config->banco_nome,
                'iban' => $config->iban,
                'numero_conta' => $config->numero_conta,
                'titular_conta' => $config->titular_conta,
                'nif_emissor' => $config->nif_emissor,

                // ProxyPay
                'proxypay_entity_id' => $config->proxypay_entity_id,
                'proxypay_api_token' => $config->proxypay_api_token
                    ? str_repeat('*', max(0, strlen($config->proxypay_api_token) - 6))
                        . substr($config->proxypay_api_token, -6)
                    : null,
                'proxypay_sandbox' => (bool) $config->proxypay_sandbox,
                'proxypay_activo' => (bool) $config->proxypay_activo,

                // Quotas
                'geracao_automatica' => (bool) $config->geracao_automatica,
                'dia_geracao' => $config->dia_geracao,
                'dia_vencimento' => $config->dia_vencimento,
                'limitar_acesso_divida' => (bool) $config->limitar_acesso_divida,
                'meses_limite_acesso' => $config->meses_limite_acesso ?? 3,
                'acordo_min_prestacoes' => $config->acordo_min_prestacoes ?? 2,
                'acordo_max_prestacoes' => $config->acordo_max_prestacoes ?? 6,
                'acordo_entrada_minima_pct' => (string) ($config->acordo_entrada_minima_pct ?? 0),
                'acordo_juro_pct' => (string) ($config->acordo_juro_pct ?? 0),

                // Multas
                'multa_activa' => (bool) $config->multa_activa,
                'dias_tolerancia_multa' => $config->dias_tolerancia_multa,
                'multa_tipo' => $config->multa_tipo,
                'multa_valor_kz' => (string) $config->multa_valor_kz,
                'multa_percentagem' => $config->multa_percentagem !== null ? (string) $config->multa_percentagem : null,
                'multa_percentagem_base' => $config->multa_percentagem_base,
                'multa_recorrente' => (bool) $config->multa_recorrente,
            ],
        ]);
    }

    public function actualizarCoordenadasBancarias(Request $request, Condominio $condominio): RedirectResponse
    {
        $user = $request->user();
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) abort(403);

        $validated = $request->validate([
            'banco_nome' => ['nullable', 'string', 'max:100'],
            'iban' => ['nullable', 'string', 'max:50'],
            'numero_conta' => ['nullable', 'string', 'max:50'],
            'titular_conta' => ['nullable', 'string', 'max:200'],
            'nif_emissor' => ['nullable', 'string', 'max:20'],
        ]);

        $config = CondominioFacturacaoConfig::firstOrCreate(
            ['condominio_id' => $condominio->id],
            ['empresa_gestora_id' => $condominio->empresa_gestora_id]
        );
        $config->update($validated);

        // Sincroniza para contas_bancarias (fonte unica web+mobile) automaticamente
        app(SincronizarContaBancariaService::class)->sincronizarDeConfig($config->fresh());

        return back()->with('flash.success', 'Coordenadas bancárias actualizadas.');
    }

    public function actualizarProxyPay(Request $request, Condominio $condominio): RedirectResponse
    {
        $user = $request->user();
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) abort(403);

        $validated = $request->validate([
            'proxypay_entity_id' => ['nullable', 'integer', 'min:1', 'max:99999999'],
            'proxypay_api_token' => ['nullable', 'string', 'max:255'],
            'proxypay_sandbox' => ['required', 'boolean'],
            'proxypay_activo' => ['required', 'boolean'],
        ]);

        $config = CondominioFacturacaoConfig::firstOrCreate(
            ['condominio_id' => $condominio->id],
            ['empresa_gestora_id' => $condominio->empresa_gestora_id]
        );

        $update = $validated;
        if (! empty($validated['proxypay_api_token']) && str_contains($validated['proxypay_api_token'], '*')) {
            unset($update['proxypay_api_token']);
        }

        if ($validated['proxypay_activo']) {
            $entityId = $validated['proxypay_entity_id'] ?? $config->proxypay_entity_id;
            $token = $update['proxypay_api_token'] ?? $config->proxypay_api_token;
            if (empty($entityId) || empty($token)) {
                return back()->withErrors([
                    'proxypay_activo' => 'Para activar ProxyPay, preenche entity_id E api_token.',
                ]);
            }
        }

        $config->update($update);
        return back()->with('flash.success', 'Configuração ProxyPay actualizada.');
    }

    /**
     * PATCH /condominios/{condominio}/facturacao/quotas
     */
    public function actualizarQuotas(Request $request, Condominio $condominio): RedirectResponse
    {
        $user = $request->user();
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) abort(403);

        $validated = $request->validate([
            'geracao_automatica' => ['required', 'boolean'],
            'dia_geracao' => ['required', 'integer', 'min:1', 'max:28'],
            'dia_vencimento' => ['required', 'integer', 'min:1', 'max:28'],
            'limitar_acesso_divida' => ['sometimes', 'boolean'],
            'meses_limite_acesso' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'acordo_min_prestacoes' => ['sometimes', 'integer', 'min:1', 'max:36'],
            'acordo_max_prestacoes' => ['sometimes', 'integer', 'min:1', 'max:36'],
            'acordo_entrada_minima_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'acordo_juro_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($validated['dia_vencimento'] < $validated['dia_geracao']) {
            return back()->withErrors([
                'dia_vencimento' => 'Dia de vencimento deve ser igual ou posterior ao dia de geração.',
            ]);
        }

        $config = CondominioFacturacaoConfig::firstOrCreate(
            ['condominio_id' => $condominio->id],
            ['empresa_gestora_id' => $condominio->empresa_gestora_id]
        );
        $config->update($validated);

        return back()->with('flash.success', 'Configuração de Quotas actualizada.');
    }

    /**
     * PATCH /condominios/{condominio}/facturacao/multas
     */
    public function actualizarMultas(Request $request, Condominio $condominio): RedirectResponse
    {
        $user = $request->user();
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) abort(403);

        $validated = $request->validate([
            'multa_activa' => ['required', 'boolean'],
            'dias_tolerancia_multa' => ['required', 'integer', 'min:0', 'max:90'],
            'multa_tipo' => ['required', 'in:fixa,percentagem'],
            'multa_valor_kz' => ['nullable', 'numeric', 'min:0'],
            'multa_percentagem' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'multa_percentagem_base' => ['required', 'in:divida,original'],
            'multa_recorrente' => ['required', 'boolean'],
        ]);

        // Validação cruzada: tipo dita qual valor é obrigatório
        if ($validated['multa_activa']) {
            if ($validated['multa_tipo'] === 'fixa' && empty($validated['multa_valor_kz'])) {
                return back()->withErrors([
                    'multa_valor_kz' => 'Valor fixo é obrigatório quando o tipo é "fixa".',
                ]);
            }
            if ($validated['multa_tipo'] === 'percentagem' && empty($validated['multa_percentagem'])) {
                return back()->withErrors([
                    'multa_percentagem' => 'Percentagem é obrigatória quando o tipo é "percentagem".',
                ]);
            }
        }

        $config = CondominioFacturacaoConfig::firstOrCreate(
            ['condominio_id' => $condominio->id],
            ['empresa_gestora_id' => $condominio->empresa_gestora_id]
        );
        $config->update($validated);

        return back()->with('flash.success', 'Configuração de Multas actualizada.');
    }
}
