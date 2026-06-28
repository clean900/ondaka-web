<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers\Web;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Visitor\Models\Visita;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dashboard de Portaria (add-on dashboard_portaria) — estatísticas de visitas
 * + alerta de "ainda dentro". Só leitura, para o gestor.
 */
class PortariaDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $base = fn () => Visita::where('empresa_gestora_id', $empresaId);

        $totalHoje = $base()->where('entrou_em', '>=', now()->startOfDay())->count();
        $dentro = $base()->whereNull('saiu_em')->count();
        $aindaMuito = $base()->whereNull('saiu_em')->where('entrou_em', '<', now()->subHours(12))->count();

        $permMediaMin = (int) round((float) $base()
            ->whereNotNull('saiu_em')
            ->where('entrou_em', '>=', now()->subDays(30))
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, entrou_em, saiu_em)) as m'))
            ->value('m'));

        // Fluxo por hora (últimas 24h)
        $fluxoRaw = $base()->where('entrou_em', '>=', now()->subHours(24))
            ->select(DB::raw('HOUR(entrou_em) as h'), DB::raw('COUNT(*) as total'))
            ->groupBy('h')->pluck('total', 'h');
        $fluxo = [];
        for ($h = 0; $h < 24; $h++) {
            $fluxo[] = ['hora' => sprintf('%02dh', $h), 'total' => (int) ($fluxoRaw[$h] ?? 0)];
        }

        // Top fracções (30 dias)
        $top = $base()->where('entrou_em', '>=', now()->subDays(30))
            ->whereNotNull('fraccao_id')
            ->select('fraccao_id', DB::raw('COUNT(*) as total'))
            ->groupBy('fraccao_id')->orderByDesc('total')->limit(6)->get();
        $idents = Fraccao::whereIn('id', $top->pluck('fraccao_id'))->pluck('identificador', 'id');
        $topFraccoes = $top->map(fn ($r) => [
            'fraccao' => 'Imóvel ' . ($idents[$r->fraccao_id] ?? $r->fraccao_id),
            'total' => (int) $r->total,
        ])->values();

        // Método mais usado (30 dias)
        $metodos = $base()->where('entrou_em', '>=', now()->subDays(30))
            ->select('metodo_validacao', DB::raw('COUNT(*) as total'))
            ->groupBy('metodo_validacao')->pluck('total', 'metodo_validacao');
        $metodoTop = $metodos->isEmpty() ? '—' : (string) $metodos->sortDesc()->keys()->first();

        // Lista "ainda dentro"
        $listaDentro = $base()->whereNull('saiu_em')
            ->with(['visitante:id,nome', 'fraccao:id,identificador'])
            ->orderBy('entrou_em')
            ->limit(50)
            ->get(['id', 'visitante_id', 'fraccao_id', 'entrou_em', 'matricula']);

        return Inertia::render('Visitantes/PortariaDashboard', [
            'kpis' => [
                'total_hoje' => $totalHoje,
                'dentro' => $dentro,
                'ainda_muito' => $aindaMuito,
                'permanencia_media_min' => $permMediaMin,
                'metodo_top' => $metodoTop,
            ],
            'fluxo' => $fluxo,
            'top_fraccoes' => $topFraccoes,
            'ainda_dentro' => $listaDentro,
        ]);
    }
}
