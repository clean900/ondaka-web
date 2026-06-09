<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminFacturasPlataformaController extends Controller
{
    /**
     * Lista facturas plataforma de todas as empresas.
     */
    public function index(Request $request): Response
    {
        $estado = $request->query('estado'); // null, pendente, paga, anulada
        $empresaId = $request->query('empresa_id');
        $busca = $request->query('busca'); // numero ou nome empresa

        $query = DB::table('plataforma_facturas as f')
            ->leftJoin('subscricoes as s', 's.id', '=', 'f.subscricao_id')
            ->leftJoin('empresas_gestoras as e', 'e.id', '=', 's.empresa_gestora_id')
            ->select(
                'f.*',
                's.estado as subscricao_estado',
                's.ciclo as subscricao_ciclo',
                'e.id as empresa_id',
                'e.nome as empresa_nome',
                'e.slug as empresa_slug',
                'e.nif as empresa_nif',
            )
            ->orderBy('f.id', 'desc');

        if ($estado) {
            $query->where('f.estado', $estado);
        }

        if ($empresaId) {
            $query->where('e.id', $empresaId);
        }

        if ($busca) {
            $query->where(function ($q) use ($busca) {
                $q->where('f.numero', 'like', '%' . $busca . '%')
                    ->orWhere('e.nome', 'like', '%' . $busca . '%');
            });
        }

        $facturas = $query->paginate(20)->through(fn ($f) => [
            'id' => $f->id,
            'numero' => $f->numero,
            'periodo_inicio' => $f->periodo_referencia_inicio,
            'periodo_fim' => $f->periodo_referencia_fim,
            'num_imoveis' => $f->num_imoveis_facturado,
            'subtotal_kz' => (float) $f->subtotal_kz,
            'imposto_valor_kz' => (float) $f->imposto_valor_kz,
            'valor_total_kz' => (float) $f->valor_total_kz,
            'estado' => $f->estado,
            'data_emissao' => $f->data_emissao,
            'data_vencimento' => $f->data_vencimento,
            'data_pagamento' => $f->data_pagamento,
            'tem_referencia_pagamento' => !empty($f->proxypay_referencia_id),
            'empresa' => [
                'id' => $f->empresa_id,
                'nome' => $f->empresa_nome,
                'slug' => $f->empresa_slug,
                'nif' => $f->empresa_nif,
            ],
            'subscricao_estado' => $f->subscricao_estado,
            'subscricao_ciclo' => $f->subscricao_ciclo,
        ]);

        // Stats agregadas (sem filtro)
        $stats = [
            'total_facturas' => DB::table('plataforma_facturas')->count(),
            'pendentes' => DB::table('plataforma_facturas')->where('estado', 'pendente')->count(),
            'pagas' => DB::table('plataforma_facturas')->where('estado', 'paga')->count(),
            'anuladas' => DB::table('plataforma_facturas')->where('estado', 'anulada')->count(),
            'valor_pendente_kz' => (float) DB::table('plataforma_facturas')->where('estado', 'pendente')->sum('valor_total_kz'),
            'valor_pago_kz' => (float) DB::table('plataforma_facturas')->where('estado', 'paga')->sum('valor_total_kz'),
            'valor_pago_mes_actual_kz' => (float) DB::table('plataforma_facturas')
                ->where('estado', 'paga')
                ->whereMonth('data_pagamento', now()->month)
                ->whereYear('data_pagamento', now()->year)
                ->sum('valor_total_kz'),
        ];

        // Lista de empresas para filtro
        $empresas = DB::table('empresas_gestoras')
            ->whereNull('deleted_at')
            ->orderBy('nome')
            ->get(['id', 'nome', 'slug']);

        return Inertia::render('SuperAdmin/FacturasPlataforma/Index', [
            'facturas' => $facturas,
            'stats' => $stats,
            'empresas' => $empresas,
            'filtros' => [
                'estado' => $estado,
                'empresa_id' => $empresaId,
                'busca' => $busca,
            ],
        ]);
    }

    /**
     * Anula uma factura.
     */
    public function anular(Request $request, int $id): JsonResponse
    {
        $factura = DB::table('plataforma_facturas')->where('id', $id)->first();
        if (!$factura) {
            return response()->json(['success' => false, 'message' => 'Factura não encontrada.'], 404);
        }

        if ($factura->estado === 'paga') {
            return response()->json(['success' => false, 'message' => 'Não pode anular uma factura já paga.'], 422);
        }

        DB::transaction(function () use ($factura, $request) {
            DB::table('plataforma_facturas')
                ->where('id', $factura->id)
                ->update([
                    'estado' => 'anulada',
                    'updated_at' => now(),
                ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $factura->subscricao_id,
                'tipo' => 'factura_emitida',
                'descricao' => "Factura {$factura->numero} ANULADA pelo super-admin",
                'meta_json' => json_encode([
                    'factura_id' => $factura->id,
                    'numero' => $factura->numero,
                    'valor_total_kz' => (float) $factura->valor_total_kz,
                    'motivo' => $request->input('motivo'),
                ]),
                'user_id' => $request->user()?->id,
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => "Factura {$factura->numero} anulada.",
        ]);
    }
}
