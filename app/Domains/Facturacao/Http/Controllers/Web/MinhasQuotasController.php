<?php

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MinhasQuotasController extends Controller
{
    /**
     * GET /minhas-quotas
     * Página para o condómino ver as suas quotas, lançamentos e créditos.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        // Obter o(s) registo(s) de condomino associado ao user
        $condominoRecord = DB::table('condominos')
            ->where('user_id', $user->id)
            ->where('empresa_gestora_id', $empresaId)
            ->first();

        if (!$condominoRecord) {
            return Inertia::render('Condominio/MinhasQuotas', [
                'quotas' => [],
                'lancamentos' => [],
                'credito_total' => '0',
                'kpis' => $this->kpisVazios(),
            ]);
        }

        // Buscar fracções via contratos activos
        $fraccaoIds = DB::table('contratos_ocupacao')
            ->where('condomino_id', $condominoRecord->id)
            ->where('estado', 'activo')
            ->whereNull('deleted_at')
            ->pluck('fraccao_id')
            ->unique()
            ->all();

        if (empty($fraccaoIds)) {
            return Inertia::render('Condominio/MinhasQuotas', [
                'quotas' => [],
                'lancamentos' => [],
                'credito_total' => '0',
                'kpis' => $this->kpisVazios(),
            ]);
        }

        // Quotas
        $quotas = DB::table('quotas as q')
            ->leftJoin('fraccoes as f', 'f.id', '=', 'q.fraccao_id')
            ->leftJoin('edificios as e', 'e.id', '=', 'f.edificio_id')
            ->leftJoin('condominios as c', 'c.id', '=', 'e.condominio_id')
            ->where('q.empresa_gestora_id', $empresaId)
            ->whereIn('q.fraccao_id', $fraccaoIds)
            ->whereNull('q.deleted_at')
            ->select(
                'q.id',
                'q.ano',
                'q.mes',
                'q.data_referencia',
                'q.data_vencimento',
                'q.valor_quota_base',
                'q.valor_fundo_reserva',
                'q.valor_total',
                'q.valor_pago',
                'q.estado',
                'q.paga_em',
                'f.identificador as fraccao_identificador',
                'c.nome as condominio_nome'
            )
            ->orderByDesc('q.ano')
            ->orderByDesc('q.mes')
            ->get();

        // Lançamentos (lancamentos_condomino)
        $lancamentos = DB::table('lancamentos_condomino as l')
            ->leftJoin('fraccoes as f', 'f.id', '=', 'l.fraccao_id')
            ->leftJoin('edificios as e', 'e.id', '=', 'f.edificio_id')
            ->leftJoin('condominios as c', 'c.id', '=', 'e.condominio_id')
            ->where('l.empresa_gestora_id', $empresaId)
            ->whereIn('l.fraccao_id', $fraccaoIds)
            ->whereIn('l.tipo', ['despesa_extra', 'multa', 'juros', 'ajuste_credito', 'ajuste_debito'])
            ->whereNull('l.deleted_at')
            ->select(
                'l.id',
                'l.tipo',
                'l.descricao',
                'l.valor',
                'l.valor_pago',
                'l.estado',
                'l.data_lancamento',
                'l.data_vencimento',
                'l.pago_em',
                'f.identificador as fraccao_identificador',
                'c.nome as condominio_nome'
            )
            ->orderByDesc('l.data_lancamento')
            ->get();

        // Crédito disponível
        $creditoTotal = (string) DB::table('creditos_fraccao')
            ->where('empresa_gestora_id', $empresaId)
            ->whereIn('fraccao_id', $fraccaoIds)
            ->whereNull('deleted_at')
            ->sum(DB::raw('valor - valor_usado'));

        // KPIs
        $totalEmAberto = $quotas->whereIn('estado', ['aberta', 'paga_parcial'])->sum(function ($q) {
            return (float) $q->valor_total - (float) $q->valor_pago;
        });
        $totalEmAberto += $lancamentos->whereIn('estado', ['em_aberto', 'pago_parcial'])->sum(function ($l) {
            return (float) $l->valor - (float) $l->valor_pago;
        });

        $totalPagas = $quotas->where('estado', 'paga')->count() + $lancamentos->where('estado', 'pago')->count();
        $totalAbertas = $quotas->whereIn('estado', ['aberta', 'paga_parcial'])->count() + $lancamentos->whereIn('estado', ['em_aberto', 'pago_parcial'])->count();

        return Inertia::render('Condominio/MinhasQuotas', [
            'quotas' => $quotas->map(fn ($q) => $this->mapQuota($q))->values()->all(),
            'lancamentos' => $lancamentos->map(fn ($l) => $this->mapLancamento($l))->values()->all(),
            'credito_total' => $creditoTotal,
            'kpis' => [
                'total_em_aberto' => (string) $totalEmAberto,
                'total_pagas' => $totalPagas,
                'total_abertas' => $totalAbertas,
                'credito' => $creditoTotal,
            ],
        ]);
    }

    private function mapQuota($q): array
    {
        return [
            'id' => $q->id,
            'tipo_item' => 'quota',
            'titulo' => sprintf('Quota %02d/%d', $q->mes, $q->ano),
            'descricao' => "Imóvel {$q->fraccao_identificador} · {$q->condominio_nome}",
            'data_lancamento' => $q->data_referencia,
            'data_vencimento' => $q->data_vencimento,
            'valor' => (string) $q->valor_total,
            'valor_pago' => (string) $q->valor_pago,
            'valor_em_falta' => (string) ((float) $q->valor_total - (float) $q->valor_pago),
            'estado' => $q->estado,
            'pago_em' => $q->paga_em,
        ];
    }

    private function mapLancamento($l): array
    {
        $tipoLabel = [
            'despesa_extra' => 'Despesa extra',
            'multa' => 'Multa',
            'juros' => 'Juros',
            'ajuste_credito' => 'Crédito',
            'ajuste_debito' => 'Ajuste',
        ];
        return [
            'id' => $l->id,
            'tipo_item' => 'lancamento',
            'tipo' => $l->tipo,
            'tipo_label' => $tipoLabel[$l->tipo] ?? $l->tipo,
            'titulo' => $l->descricao,
            'descricao' => "Imóvel {$l->fraccao_identificador} · {$l->condominio_nome}",
            'data_lancamento' => $l->data_lancamento,
            'data_vencimento' => $l->data_vencimento,
            'valor' => (string) $l->valor,
            'valor_pago' => (string) $l->valor_pago,
            'valor_em_falta' => (string) ((float) $l->valor - (float) $l->valor_pago),
            'estado' => $l->estado,
            'pago_em' => $l->pago_em,
        ];
    }

    private function kpisVazios(): array
    {
        return [
            'total_em_aberto' => '0',
            'total_pagas' => 0,
            'total_abertas' => 0,
            'credito' => '0',
        ];
    }
    /**
     * GET /api/minhas-quotas
     * Versão API do index() — mesma lógica, devolve JSON em vez de Inertia.
     */
    public function apiIndex(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        $condominoRecord = DB::table('condominos')
            ->where('user_id', $user->id)
            ->where('empresa_gestora_id', $empresaId)
            ->first();

        if (!$condominoRecord) {
            return response()->json([
                'quotas' => [],
                'lancamentos' => [],
                'credito_total' => '0',
                'kpis' => $this->kpisVazios(),
            ]);
        }

        $fraccaoIds = DB::table('contratos_ocupacao')
            ->where('condomino_id', $condominoRecord->id)
            ->where('estado', 'activo')
            ->whereNull('deleted_at')
            ->pluck('fraccao_id')
            ->unique()
            ->all();

        if (empty($fraccaoIds)) {
            return response()->json([
                'quotas' => [],
                'lancamentos' => [],
                'credito_total' => '0',
                'kpis' => $this->kpisVazios(),
            ]);
        }

        $quotas = DB::table('quotas as q')
            ->leftJoin('fraccoes as f', 'f.id', '=', 'q.fraccao_id')
            ->leftJoin('edificios as e', 'e.id', '=', 'f.edificio_id')
            ->leftJoin('condominios as c', 'c.id', '=', 'e.condominio_id')
            ->where('q.empresa_gestora_id', $empresaId)
            ->whereIn('q.fraccao_id', $fraccaoIds)
            ->whereNull('q.deleted_at')
            ->select(
                'q.id', 'q.ano', 'q.mes', 'q.data_referencia', 'q.data_vencimento',
                'q.valor_quota_base', 'q.valor_fundo_reserva', 'q.valor_total',
                'q.valor_pago', 'q.estado', 'q.paga_em',
                'f.identificador as fraccao_identificador',
                'c.nome as condominio_nome'
            )
            ->orderByDesc('q.ano')
            ->orderByDesc('q.mes')
            ->get();

        $lancamentos = DB::table('lancamentos_condomino as l')
            ->leftJoin('fraccoes as f', 'f.id', '=', 'l.fraccao_id')
            ->leftJoin('edificios as e', 'e.id', '=', 'f.edificio_id')
            ->leftJoin('condominios as c', 'c.id', '=', 'e.condominio_id')
            ->where('l.empresa_gestora_id', $empresaId)
            ->whereIn('l.fraccao_id', $fraccaoIds)
            ->whereIn('l.tipo', ['despesa_extra', 'multa', 'juros', 'ajuste_credito', 'ajuste_debito'])
            ->whereNull('l.deleted_at')
            ->select(
                'l.id', 'l.tipo', 'l.descricao', 'l.valor', 'l.valor_pago',
                'l.estado', 'l.data_lancamento', 'l.data_vencimento', 'l.pago_em',
                'f.identificador as fraccao_identificador',
                'c.nome as condominio_nome'
            )
            ->orderByDesc('l.data_lancamento')
            ->get();

        $creditoTotal = (string) DB::table('creditos_fraccao')
            ->where('empresa_gestora_id', $empresaId)
            ->whereIn('fraccao_id', $fraccaoIds)
            ->whereNull('deleted_at')
            ->sum(DB::raw('valor - valor_usado'));

        $totalEmAberto = $quotas->whereIn('estado', ['aberta', 'paga_parcial'])->sum(function ($q) {
            return (float) $q->valor_total - (float) $q->valor_pago;
        });
        $totalEmAberto += $lancamentos->whereIn('estado', ['em_aberto', 'pago_parcial'])->sum(function ($l) {
            return (float) $l->valor - (float) $l->valor_pago;
        });

        $totalPagas = $quotas->where('estado', 'paga')->count() + $lancamentos->where('estado', 'pago')->count();
        $totalAbertas = $quotas->whereIn('estado', ['aberta', 'paga_parcial'])->count() + $lancamentos->whereIn('estado', ['em_aberto', 'pago_parcial'])->count();

        return response()->json([
            'quotas' => $quotas->map(fn ($q) => $this->mapQuota($q))->values()->all(),
            'lancamentos' => $lancamentos->map(fn ($l) => $this->mapLancamento($l))->values()->all(),
            'credito_total' => $creditoTotal,
            'kpis' => [
                'total_em_aberto' => (string) $totalEmAberto,
                'total_pagas' => $totalPagas,
                'total_abertas' => $totalAbertas,
                'credito' => $creditoTotal,
            ],
        ]);
    }
}
