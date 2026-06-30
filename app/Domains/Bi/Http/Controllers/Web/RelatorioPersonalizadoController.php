<?php

declare(strict_types=1);

namespace App\Domains\Bi\Http\Controllers\Web;

use App\Domains\Bi\Services\CobrancaService;
use App\Domains\Bi\Services\DespesasService;
use App\Domains\Bi\Services\ReceitasDespesasService;
use App\Domains\Bi\Services\SaudeFinanceiraService;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Add-on Relatórios Personalizados — o gestor escolhe as secções, o período, o
 * condomínio e o título, e gera um PDF à medida. Reutiliza os serviços do BI
 * (mesma fonte de verdade do Dashboard BI / Relatório Executivo).
 * Gate: feature:relatorios_personalizados.
 */
class RelatorioPersonalizadoController extends Controller
{
    /** Secções disponíveis (slug => label). */
    public const SECCOES = [
        'financeiro' => 'Receitas vs Despesas',
        'cobranca' => 'Cobrança e devedores',
        'despesas' => 'Despesas por categoria',
        'saude' => 'Saúde financeira',
    ];

    public function index(): InertiaResponse
    {
        return Inertia::render('Relatorios/Index', [
            'condominios' => Condominio::query()->orderBy('nome')->get(['id', 'nome']),
            'seccoes' => collect(self::SECCOES)->map(fn ($label, $slug) => ['slug' => $slug, 'nome' => $label])->values(),
        ]);
    }

    public function gerar(Request $request)
    {
        $dados = $request->validate([
            'titulo' => ['nullable', 'string', 'max:120'],
            'condominio_id' => ['nullable', 'integer'],
            'meses' => ['nullable', 'integer', 'in:3,6,12,24'],
            'seccoes' => ['required', 'array', 'min:1'],
            'seccoes.*' => ['string', 'in:' . implode(',', array_keys(self::SECCOES))],
        ]);

        $empresaId = (int) $request->user()->empresa_gestora_id;
        abort_if(! $empresaId, 403);

        $condominioId = null;
        if (! empty($dados['condominio_id'])) {
            $condominioId = Condominio::where('id', $dados['condominio_id'])->value('id');
            $condominioId = $condominioId ? (int) $condominioId : null;
        }

        $meses = (int) ($dados['meses'] ?? 12);
        $seccoes = $dados['seccoes'];

        $payload = [
            'titulo' => $dados['titulo'] ?: 'Relatório Personalizado',
            'empresa' => EmpresaGestora::find($empresaId),
            'condominioNome' => $condominioId ? Condominio::where('id', $condominioId)->value('nome') : null,
            'dataGeracao' => now()->format('d/m/Y H:i'),
            'meses' => $meses,
            'seccoes' => $seccoes,
            'receitas' => in_array('financeiro', $seccoes, true) ? (new ReceitasDespesasService())->calcular($empresaId, $condominioId, $meses) : null,
            'cobranca' => in_array('cobranca', $seccoes, true) ? (new CobrancaService())->calcular($empresaId, $condominioId) : null,
            'despesas' => in_array('despesas', $seccoes, true) ? (new DespesasService())->calcular($empresaId, $condominioId, $meses) : null,
            'saude' => in_array('saude', $seccoes, true) ? (new SaudeFinanceiraService())->calcular($empresaId, $condominioId) : null,
        ];

        $pdf = Pdf::loadView('relatorios.personalizado', $payload);

        return $pdf->download('relatorio-' . now()->format('Ymd-Hi') . '.pdf');
    }
}
