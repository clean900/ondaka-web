<?php

declare(strict_types=1);

namespace App\Domains\Bi\Http\Controllers\Web;

use App\Domains\Bi\Services\CobrancaService;
use App\Domains\Bi\Services\DespesasService;
use App\Domains\Bi\Services\SaudeFinanceiraService;
use App\Domains\Bi\Services\PreditivoService;
use App\Domains\Bi\Services\MultiCondominioService;
use App\Domains\Bi\Services\OperacionalService;
use App\Domains\Bi\Services\AlertasService;
use App\Domains\Bi\Services\ReceitasDespesasService;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class BiDashboardController extends Controller
{
    private const FEATURE_SLUG = 'dashboard_bi';

    /** Resolve a gestora do user e confirma o gate. Devolve o id ou null. */
    private function gestoraComAcesso(Request $request): ?int
    {
        $user = $request->user();
        $empresaGestoraId = $user->empresa_gestora_id ?? null;
        if (! $empresaGestoraId) {
            return null;
        }
        $empresa = EmpresaGestora::find($empresaGestoraId);
        if (! $empresa || ! FeatureGate::has($empresa, self::FEATURE_SLUG)) {
            return null;
        }
        return $empresaGestoraId;
    }

    /** Lê o nº de meses do request (3/6/12/24), default 12. */
    private function mesesDoRequest(Request $request): int
    {
        $m = (int) $request->integer('meses', 12);
        return in_array($m, [3, 6, 12, 24], true) ? $m : 12;
    }


    public function index(Request $request): Response
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);

        if (! $empresaGestoraId) {
            return Inertia::render('Bi/Upgrade', ['feature_slug' => self::FEATURE_SLUG]);
        }

        $condominios = Condominio::where('empresa_gestora_id', $empresaGestoraId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($co) => ['id' => $co->id, 'nome' => $co->nome]);

        return Inertia::render('Bi/Dashboard', [
            'condominios' => $condominios,
        ]);
    }

    /** Dados da área Receitas vs Despesas (JSON). */
    public function dadosReceitas(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $meses = $this->mesesDoRequest($request);
        $service = new ReceitasDespesasService();
        $dados = $service->calcular($empresaGestoraId, $condominioId, $meses);
        $dados['comparacao'] = $service->comparacao($empresaGestoraId, $condominioId, $meses);
        return response()->json($dados);
    }

    /** Dados da área Cobrança (JSON). */
    public function dadosCobranca(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new CobrancaService())->calcular($empresaGestoraId, $condominioId);
        return response()->json($dados);
    }

    /** Dados da área Despesas (JSON). */
    public function dadosDespesas(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new DespesasService())->calcular($empresaGestoraId, $condominioId, $this->mesesDoRequest($request));
        return response()->json($dados);
    }


    /** Dados da área Saúde financeira (JSON). */
    public function dadosSaude(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new SaudeFinanceiraService())->calcular($empresaGestoraId, $condominioId);
        return response()->json($dados);
    }


    /** Exporta Receitas vs Despesas (mensal) em CSV. */
    public function exportarCsv(Request $request): StreamedResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        abort_if(! $empresaGestoraId, 403);

        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new ReceitasDespesasService())->calcular($empresaGestoraId, $condominioId, $this->mesesDoRequest($request));

        $nome = 'bi-receitas-despesas-' . now()->format('Ymd-Hi') . '.csv';

        return response()->streamDownload(function () use ($dados) {
            $out = fopen('php://output', 'w');
            // BOM para Excel reconhecer UTF-8
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($out, ['Mes', 'Receita', 'Despesa', 'Saldo']);
            foreach ($dados['meses'] as $m) {
                fputcsv($out, [$m['label'], $m['receita'], $m['despesa'], $m['saldo']]);
            }
            fputcsv($out, []);
            fputcsv($out, ['TOTAL', $dados['totais']['receita'], $dados['totais']['despesa'], $dados['totais']['saldo']]);
            fclose($out);
        }, $nome, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }


    /** Relatório executivo em PDF (resumo das áreas). */
    public function exportarPdf(Request $request)
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        abort_if(! $empresaGestoraId, 403);

        $condominioId = $request->integer('condominio_id') ?: null;

        $empresa = EmpresaGestora::find($empresaGestoraId);
        $condominioNome = null;
        if ($condominioId) {
            $condominioNome = Condominio::where('id', $condominioId)->value('nome');
        }

        $receitas = (new ReceitasDespesasService())->calcular($empresaGestoraId, $condominioId, 12);
        $cobranca = (new CobrancaService())->calcular($empresaGestoraId, $condominioId);
        $despesas = (new DespesasService())->calcular($empresaGestoraId, $condominioId, 12);
        $saude = (new SaudeFinanceiraService())->calcular($empresaGestoraId, $condominioId);

        $pdf = Pdf::loadView('bi.relatorio', [
            'empresa' => $empresa,
            'condominioNome' => $condominioNome,
            'dataGeracao' => now()->format('d/m/Y H:i'),
            'receitas' => $receitas,
            'cobranca' => $cobranca,
            'despesas' => $despesas,
            'saude' => $saude,
        ]);

        return $pdf->download('relatorio-executivo-' . now()->format('Ymd-Hi') . '.pdf');
    }


    /** Dados da área Preditivo (JSON). */
    public function dadosPreditivo(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new PreditivoService())->calcular($empresaGestoraId, $condominioId);
        return response()->json($dados);
    }


    /** Dados da área Multi-condomínio (JSON). Ignora o filtro de condomínio. */
    public function dadosMulti(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $dados = (new MultiCondominioService())->calcular($empresaGestoraId);
        return response()->json($dados);
    }


    /** Dados da área Operacional (JSON). */
    public function dadosOperacional(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new OperacionalService())->calcular($empresaGestoraId, $condominioId, $this->mesesDoRequest($request));
        return response()->json($dados);
    }


    /** Devedores detalhados (JSON). */
    public function dadosDevedores(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $filtros = [
            'antiguidade' => (string) $request->input('antiguidade', 'todos'),
            'tipo' => (string) $request->input('tipo', 'todos'),
            'ordenar' => (string) $request->input('ordenar', 'divida'),
        ];
        $dados = (new CobrancaService())->devedoresDetalhados($empresaGestoraId, $condominioId, $filtros);
        return response()->json(['devedores' => $dados]);
    }

    /** Lançamentos em dívida de uma fracção (para expandir). */
    public function dadosLancamentosFraccao(Request $request, int $fraccao): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $dados = (new CobrancaService())->lancamentosDaFraccao($empresaGestoraId, $fraccao);
        return response()->json(['lancamentos' => $dados]);
    }


    /** Alertas inteligentes (JSON). */
    public function dadosAlertas(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new AlertasService())->calcular($empresaGestoraId, $condominioId);
        return response()->json($dados);
    }


    /** Exporta os imóveis em dívida (devedores detalhados) em CSV. */
    public function exportarCobrancaCsv(Request $request): StreamedResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        abort_if(! $empresaGestoraId, 403);

        $condominioId = $request->integer('condominio_id') ?: null;
        $filtros = [
            'antiguidade' => (string) $request->input('antiguidade', 'todos'),
            'tipo' => (string) $request->input('tipo', 'todos'),
            'ordenar' => (string) $request->input('ordenar', 'divida'),
        ];
        $devedores = (new CobrancaService())->devedoresDetalhados($empresaGestoraId, $condominioId, $filtros);
        $nome = 'bi-cobranca-devedores-' . now()->format('Ymd-Hi') . '.csv';

        return response()->streamDownload(function () use ($devedores) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($out, ['Imovel', 'Condomino', 'Facturas', 'Meses', 'Divida']);
            foreach ($devedores as $d) {
                fputcsv($out, [$d['imovel'], $d['condomino'], $d['facturas'], $d['meses'], $d['divida']]);
            }
            fclose($out);
        }, $nome, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Exporta as despesas em CSV (por categoria + evolução mensal). */
    public function exportarDespesasCsv(Request $request): StreamedResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        abort_if(! $empresaGestoraId, 403);

        $condominioId = $request->integer('condominio_id') ?: null;
        $dados = (new DespesasService())->calcular($empresaGestoraId, $condominioId, $this->mesesDoRequest($request));
        $nome = 'bi-despesas-' . now()->format('Ymd-Hi') . '.csv';

        return response()->streamDownload(function () use ($dados) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($out, ['POR CATEGORIA']);
            fputcsv($out, ['Categoria', 'Total']);
            foreach ($dados['por_categoria'] as $cat) {
                fputcsv($out, [$cat['categoria'], $cat['total']]);
            }
            fputcsv($out, ['TOTAL', $dados['total']]);
            fputcsv($out, []);
            fputcsv($out, ['EVOLUCAO MENSAL']);
            fputcsv($out, ['Mes', 'Total']);
            foreach ($dados['meses'] as $m) {
                fputcsv($out, [$m['label'], $m['total']]);
            }
            fclose($out);
        }, $nome, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }


    /** Lê config dos alertas (limites) da gestora. */
    public function configAlertas(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $row = \DB::table('bi_alertas_config')->where('empresa_gestora_id', $empresaGestoraId)->first();
        return response()->json([
            'taxa_cobranca_min' => $row ? (float) $row->taxa_cobranca_min : AlertasService::DEFAULT_TAXA_COBRANCA_MIN,
            'divida_imovel_limite' => $row ? (float) $row->divida_imovel_limite : AlertasService::DEFAULT_DIVIDA_IMOVEL_LIMITE,
        ]);
    }

    /** Guarda config dos alertas (upsert por empresa_gestora_id). */
    public function guardarConfigAlertas(Request $request): JsonResponse
    {
        $empresaGestoraId = $this->gestoraComAcesso($request);
        if (! $empresaGestoraId) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $taxa = max(0, min(100, (float) $request->input('taxa_cobranca_min', 50)));
        $divida = max(0, (float) $request->input('divida_imovel_limite', 100000));
        \DB::table('bi_alertas_config')->updateOrInsert(
            ['empresa_gestora_id' => $empresaGestoraId],
            [
                'taxa_cobranca_min' => $taxa,
                'divida_imovel_limite' => $divida,
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
        return response()->json(['ok' => true, 'taxa_cobranca_min' => $taxa, 'divida_imovel_limite' => $divida]);
    }

}
