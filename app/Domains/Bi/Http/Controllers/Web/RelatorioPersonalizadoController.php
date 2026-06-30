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

    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('Relatorios/Index', [
            'condominios' => Condominio::query()->orderBy('nome')->get(['id', 'nome']),
            'seccoes' => collect(self::SECCOES)->map(fn ($label, $slug) => ['slug' => $slug, 'nome' => $label])->values(),
            'agendados' => \App\Domains\Bi\Models\RelatorioAgendado::query()
                ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
                ->orderByDesc('id')
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'titulo' => $a->titulo,
                    'condominio_id' => $a->condominio_id,
                    'seccoes' => $a->seccoes,
                    'meses' => $a->meses,
                    'frequencia' => $a->frequencia,
                    'dia' => $a->dia,
                    'destinatarios' => $a->destinatarios,
                    'ativo' => $a->ativo,
                    'ultimo_envio_em' => $a->ultimo_envio_em?->toIso8601String(),
                ]),
        ]);
    }

    /** Cria um agendamento de envio por email. */
    public function agendar(Request $request)
    {
        $dados = $request->validate([
            'titulo' => ['nullable', 'string', 'max:120'],
            'condominio_id' => ['nullable', 'integer'],
            'meses' => ['required', 'integer', 'in:3,6,12,24'],
            'seccoes' => ['required', 'array', 'min:1'],
            'seccoes.*' => ['string', 'in:' . implode(',', array_keys(self::SECCOES))],
            'frequencia' => ['required', 'in:mensal,semanal'],
            // semanal → dia da semana (1-7); mensal → dia do mês (1-28).
            'dia' => ['required', 'integer', 'min:1', $request->input('frequencia') === 'semanal' ? 'max:7' : 'max:28'],
            'destinatarios' => ['required', 'string', 'max:500'],
        ]);

        $empresaId = (int) $request->user()->empresa_gestora_id;
        abort_if(! $empresaId, 403);

        // Garante que o condomínio (se indicado) pertence à empresa do gestor.
        $condominioId = null;
        if (! empty($dados['condominio_id'])) {
            $condominioId = Condominio::where('id', $dados['condominio_id'])->value('id');
        }

        \App\Domains\Bi\Models\RelatorioAgendado::create([
            'empresa_gestora_id' => $empresaId,
            'condominio_id' => $condominioId ? (int) $condominioId : null,
            'titulo' => $dados['titulo'] ?: 'Relatório Personalizado',
            'seccoes' => $dados['seccoes'],
            'meses' => $dados['meses'],
            'frequencia' => $dados['frequencia'],
            'dia' => $dados['dia'],
            'destinatarios' => $dados['destinatarios'],
            'ativo' => true,
        ]);

        return back()->with('flash.success', 'Agendamento criado.');
    }

    /** Remove um agendamento. */
    public function removerAgendamento(int $id)
    {
        \App\Domains\Bi\Models\RelatorioAgendado::where('id', $id)->delete();
        return back()->with('flash.success', 'Agendamento removido.');
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

        $bytes = (new \App\Domains\Bi\Services\RelatorioPersonalizadoService())
            ->pdfBytes($empresaId, $condominioId, $meses, $dados['seccoes'], $dados['titulo'] ?? null);

        return response($bytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="relatorio-' . now()->format('Ymd-Hi') . '.pdf"',
        ]);
    }
}
