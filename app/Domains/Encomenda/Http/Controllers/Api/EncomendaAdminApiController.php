<?php

namespace App\Domains\Encomenda\Http\Controllers\Api;

use App\Domains\Encomenda\Models\CondominioEncomendaConfig;
use App\Domains\Encomenda\Models\Encomenda;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EncomendaAdminApiController extends Controller
{
    /**
     * GET /api/admin/encomendas
     * Listar todas as encomendas do condomínio activo, com filtros opcionais.
     * Query: ?estado=multa_aplicada&multa_estado=pendente
     */
    public function index(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $query = Encomenda::query()
            ->doCondominio($condominioId)
            ->with([
                'condomino:id,user_id,nome_completo',
                'fraccao:id,identificador',
                'recebidaPor:id,name',
                'entreguePor:id,name',
            ])
            ->orderByDesc('created_at');

        if ($estado = $request->query('estado')) {
            $estados = is_array($estado) ? $estado : explode(',', $estado);
            $query->whereIn('estado', $estados);
        }

        if ($multaEstado = $request->query('multa_estado')) {
            $query->where('multa_estado', $multaEstado);
        }

        $encomendas = $query->limit(200)->get();

        return response()->json([
            'data' => $encomendas->map(fn ($e) => $this->serializar($e)),
        ]);
    }

    /**
     * POST /api/admin/encomendas/{id}/cobrar-multa
     * Body: { "valor_kz": 5000, "via": "dinheiro|proxypay|extracto", "observacoes": "..." }
     */
    public function cobrarMulta(Request $request, int $id): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomenda = Encomenda::where('id', $id)
            ->where('condominio_id', $condominioId)
            ->first();

        if (! $encomenda) {
            return response()->json(['message' => 'Encomenda não encontrada.'], 404);
        }

        if ($encomenda->estado !== Encomenda::ESTADO_MULTA_APLICADA) {
            return response()->json([
                'message' => 'Encomenda não tem multa aplicada.',
            ], 422);
        }

        if ($encomenda->multa_estado !== Encomenda::MULTA_PENDENTE) {
            return response()->json([
                'message' => 'Multa já foi paga ou desbloqueada.',
            ], 422);
        }

        $validated = $request->validate([
            'valor_kz' => ['nullable', 'numeric', 'min:0'],
            'via' => ['required', Rule::in([
                Encomenda::PAGO_VIA_PROXYPAY,
                Encomenda::PAGO_VIA_EXTRACTO,
                Encomenda::PAGO_VIA_DINHEIRO,
            ])],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Se valor não foi enviado, usa o valor da multa existente
        $valor = $validated['valor_kz'] ?? $encomenda->multa_valor_kz;

        $encomenda->update([
            'multa_estado' => Encomenda::MULTA_PAGA,
            'multa_valor_kz' => $valor,
            'multa_pago_via' => $validated['via'],
            'multa_pago_em' => now(),
            'multa_pago_observacoes' => $validated['observacoes'] ?? null,
            // Encomenda fica disponível para entrega novamente
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
        ]);

        return response()->json([
            'message' => 'Multa registada como paga. Encomenda volta a estar disponível para levantamento.',
            'data' => $this->serializar($encomenda->fresh(['condomino', 'fraccao'])),
        ]);
    }

    /**
     * POST /api/admin/encomendas/{id}/desbloquear
     * Liberta encomenda sem cobrança (decisão do gestor).
     */
    public function desbloquear(Request $request, int $id): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomenda = Encomenda::where('id', $id)
            ->where('condominio_id', $condominioId)
            ->first();

        if (! $encomenda) {
            return response()->json(['message' => 'Encomenda não encontrada.'], 404);
        }

        if ($encomenda->estado !== Encomenda::ESTADO_MULTA_APLICADA) {
            return response()->json([
                'message' => 'Encomenda não tem multa aplicada.',
            ], 422);
        }

        $validated = $request->validate([
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);

        $encomenda->update([
            'multa_estado' => Encomenda::MULTA_DESBLOQUEADA,
            'multa_pago_em' => now(),
            'multa_pago_observacoes' => $validated['observacoes']
                ?? 'Desbloqueada sem cobrança pelo gestor.',
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
        ]);

        return response()->json([
            'message' => 'Encomenda desbloqueada sem cobrança.',
            'data' => $this->serializar($encomenda->fresh(['condomino', 'fraccao'])),
        ]);
    }

    /**
     * GET /api/admin/encomendas/config
     * Mostra a configuração de encomendas do condomínio activo.
     */
    public function config(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $config = CondominioEncomendaConfig::paraCondominio($condominioId);

        return response()->json([
            'data' => $config,
        ]);
    }

    /**
     * PUT /api/admin/encomendas/config
     * Actualiza configuração de encomendas (valores padrão, dias, vias de pagamento).
     */
    public function actualizarConfig(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $validated = $request->validate([
            'multa_valor_padrao_kz' => ['sometimes', 'numeric', 'min:0'],
            'dias_aviso' => ['sometimes', 'integer', 'min:1', 'max:30'],
            'dias_multa' => ['sometimes', 'integer', 'min:1', 'max:60'],
            'permite_pagamento_proxypay' => ['sometimes', 'boolean'],
            'permite_pagamento_extracto' => ['sometimes', 'boolean'],
            'permite_pagamento_dinheiro' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['dias_aviso']) && isset($validated['dias_multa'])
            && $validated['dias_aviso'] >= $validated['dias_multa']) {
            return response()->json([
                'message' => 'dias_aviso deve ser menor que dias_multa.',
            ], 422);
        }

        $config = CondominioEncomendaConfig::paraCondominio($condominioId);
        $config->update($validated);

        return response()->json([
            'message' => 'Configuração actualizada.',
            'data' => $config->fresh(),
        ]);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    protected function exigirCondominioActivo(Request $request): int|JsonResponse
    {
        $user = $request->user();
        if (! $user->condominio_activo_id) {
            return response()->json([
                'message' => 'Selecciona um condomínio activo primeiro.',
            ], 422);
        }
        return $user->condominio_activo_id;
    }

    protected function serializar(Encomenda $e): array
    {
        return [
            'id' => $e->id,
            'descricao' => $e->descricao,
            'remetente' => $e->remetente,
            'notas_guarda' => $e->notas_guarda,
            'estado' => $e->estado,
            'origem' => $e->origem,
            'local_atual' => $e->local_atual,
            'janela_inicio' => $e->janela_inicio?->toIso8601String(),
            'janela_fim' => $e->janela_fim?->toIso8601String(),
            'chegou_em' => $e->chegou_em?->toIso8601String(),
            'aviso_5_dias_em' => $e->aviso_5_dias_em?->toIso8601String(),
            'levantada_em' => $e->levantada_em?->toIso8601String(),
            'levantada_por' => $e->levantada_por,
            'multa_aplicada_em' => $e->multa_aplicada_em?->toIso8601String(),
            'multa_valor_kz' => $e->multa_valor_kz,
            'multa_estado' => $e->multa_estado,
            'multa_pago_via' => $e->multa_pago_via,
            'multa_pago_em' => $e->multa_pago_em?->toIso8601String(),
            'multa_pago_observacoes' => $e->multa_pago_observacoes,
            'foto_path' => $e->foto_path,
            'condomino' => $e->condomino ? [
                'id' => $e->condomino->id,
                'nome_completo' => $e->condomino->nome_completo,
            ] : null,
            'fraccao' => $e->fraccao ? [
                'id' => $e->fraccao->id,
                'identificador' => $e->fraccao->identificador,
            ] : null,
            'recebida_por' => $e->recebidaPor?->name,
            'entregue_por' => $e->entreguePor?->name,
            'created_at' => $e->created_at->toIso8601String(),
        ];
    }
}
