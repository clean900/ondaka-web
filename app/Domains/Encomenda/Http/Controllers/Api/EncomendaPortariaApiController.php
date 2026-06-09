<?php

namespace App\Domains\Encomenda\Http\Controllers\Api;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Encomenda\Models\Encomenda;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EncomendaPortariaApiController extends Controller
{
    // =====================================================================
    // CONDOMÍNIO ACTIVO (escolha por sessão)
    // =====================================================================

    public function condominioActivo(Request $request): JsonResponse
    {
        $user = $request->user();

        $disponiveis = Condominio::where('empresa_gestora_id', $user->empresa_gestora_id)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        $condominio = $user->condominio_activo_id
            ? Condominio::find($user->condominio_activo_id)
            : null;

        return response()->json([
            'condominio_activo' => $condominio
                ? ['id' => $condominio->id, 'nome' => $condominio->nome]
                : null,
            'disponiveis' => $disponiveis,
        ]);
    }

    public function escolherCondominio(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'condominio_id' => ['required', 'integer', 'exists:condominios,id'],
        ]);

        $condominio = Condominio::where('id', $validated['condominio_id'])
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->first();

        if (! $condominio) {
            return response()->json([
                'message' => 'Condomínio não pertence à sua empresa.',
            ], 403);
        }

        $user->update(['condominio_activo_id' => $condominio->id]);

        return response()->json([
            'message' => 'Condomínio activo definido.',
            'condominio_activo' => [
                'id' => $condominio->id,
                'nome' => $condominio->nome,
            ],
        ]);
    }

    // =====================================================================
    // LISTAGENS
    // =====================================================================

    /**
     * GET /api/portaria/encomendas/aguarda-chegada
     * Pré-anúncios que ainda não chegaram (Fluxo B).
     */
    public function aguardaChegada(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomendas = Encomenda::query()
            ->doCondominio($condominioId)
            ->aguardandoChegada()
            ->with(['condomino:id,user_id,nome_completo', 'fraccao:id,identificador'])
            ->orderBy('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $encomendas->map(fn ($e) => $this->serializar($e)),
        ]);
    }

    /**
     * GET /api/portaria/encomendas/portaria
     * Encomendas que estão na portaria (aguardam levantamento).
     */
    public function naPortaria(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomendas = Encomenda::query()
            ->doCondominio($condominioId)
            ->naPortaria()
            ->with(['condomino:id,user_id,nome_completo', 'fraccao:id,identificador'])
            ->orderByDesc('chegou_em')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $encomendas->map(fn ($e) => $this->serializar($e)),
        ]);
    }

    // =====================================================================
    // ACÇÕES
    // =====================================================================

    /**
     * POST /api/portaria/encomendas/registar
     * Fluxo A: estafeta chegou sem aviso. Guarda regista a encomenda directamente.
     */
    public function registar(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $validated = $request->validate([
            'condomino_id' => ['nullable', 'integer', 'exists:condominos,id'],
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'descricao' => ['required', 'string', 'max:500'],
            'remetente' => ['nullable', 'string', 'max:255'],
            'notas_guarda' => ['nullable', 'string', 'max:1000'],
            'foto_path' => ['nullable', 'string', 'max:500'],
        ]);

        // Se condomino_id nao fornecido, descobrir titular activo da fraccao
        if (empty($validated['condomino_id'])) {
            $contrato = \App\Domains\Condomino\Models\ContratoOcupacao::query()
                ->where('fraccao_id', $validated['fraccao_id'])
                ->where('estado', 'activo')
                ->orderByRaw("CASE WHEN tipo = 'proprietario' THEN 0 ELSE 1 END")
                ->orderBy('created_at')
                ->first();

            if (! $contrato) {
                return response()->json([
                    'message' => 'Esta fracção não tem condómino activo. Não é possível registar a encomenda.',
                ], 422);
            }
            $validated['condomino_id'] = $contrato->condomino_id;
        }

        // Verificar tenancy: condomino + fraccao pertencem ao condominio activo
        $condomino = Condomino::find($validated['condomino_id']);
        if (! $condomino || $condomino->empresa_gestora_id !== $request->user()->empresa_gestora_id) {
            return response()->json(['message' => 'Condómino inválido.'], 422);
        }

        $encomenda = Encomenda::create([
            'condominio_id' => $condominioId,
            'fraccao_id' => $validated['fraccao_id'],
            'condomino_id' => $validated['condomino_id'],
            'descricao' => $validated['descricao'],
            'remetente' => $validated['remetente'] ?? null,
            'notas_guarda' => $validated['notas_guarda'] ?? null,
            'foto_path' => $validated['foto_path'] ?? null,
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'origem' => Encomenda::ORIGEM_SEM_AVISO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
            'chegou_em' => now(),
            'recebida_por_user_id' => $request->user()->id,
        ]);

        // Notificar o condómino — encomenda chegou e aguarda levantamento
        $this->notificarEncomendaRecebida($encomenda);

        return response()->json([
            'message' => 'Encomenda registada na portaria.',
            'data' => $this->serializar($encomenda->fresh(['condomino', 'fraccao'])),
        ], 201);
    }

    /**
     * POST /api/portaria/encomendas/{id}/marcar-chegada
     * Fluxo B: pré-anúncio chegou à portaria. Guarda confirma chegada.
     */
    public function marcarChegada(Request $request, int $id): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomenda = Encomenda::where('id', $id)
            ->where('condominio_id', $condominioId)
            ->first();

        if (! $encomenda) {
            return response()->json(['message' => 'Encomenda não encontrada.'], 404);
        }

        if ($encomenda->estado !== Encomenda::ESTADO_AGUARDA_CHEGADA) {
            return response()->json([
                'message' => 'Esta encomenda não está em estado de pré-anúncio.',
            ], 422);
        }

        $validated = $request->validate([
            'notas_guarda' => ['nullable', 'string', 'max:1000'],
            'foto_path' => ['nullable', 'string', 'max:500'],
        ]);

        $encomenda->update([
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'chegou_em' => now(),
            'recebida_por_user_id' => $request->user()->id,
            'notas_guarda' => $validated['notas_guarda'] ?? $encomenda->notas_guarda,
            'foto_path' => $validated['foto_path'] ?? $encomenda->foto_path,
        ]);

        // Notificar o condómino — encomenda chegou e aguarda levantamento
        $this->notificarEncomendaRecebida($encomenda);

        return response()->json([
            'message' => 'Chegada confirmada.',
            'data' => $this->serializar($encomenda->fresh(['condomino', 'fraccao'])),
        ]);
    }

    /**
     * POST /api/portaria/encomendas/{id}/entregar
     * Marca encomenda como entregue. Aceita levantamento por titular ou autorizado.
     */
    public function entregar(Request $request, int $id): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomenda = Encomenda::where('id', $id)
            ->where('condominio_id', $condominioId)
            ->first();

        if (! $encomenda) {
            return response()->json(['message' => 'Encomenda não encontrada.'], 404);
        }

        if ($encomenda->estado !== Encomenda::ESTADO_AGUARDA_LEVANTAMENTO) {
            return response()->json([
                'message' => 'Encomenda não está pronta para levantamento.',
            ], 422);
        }

        $validated = $request->validate([
            'levantada_por' => ['required', 'string', 'max:255'],
            'foto_bi_path' => ['nullable', 'string', 'max:500'],
        ]);

        $encomenda->update([
            'estado' => Encomenda::ESTADO_ENTREGUE,
            'local_atual' => Encomenda::LOCAL_ENTREGUE,
            'levantada_em' => now(),
            'levantada_por' => $validated['levantada_por'],
            'entregue_por_user_id' => $request->user()->id,
        ]);

        $this->notificarEncomendaEntregue($encomenda, $validated['levantada_por']);

        return response()->json([
            'message' => 'Encomenda entregue.',
            'data' => $this->serializar($encomenda->fresh(['condomino', 'fraccao'])),
        ]);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    /**
     * Garante que o user tem condomínio activo. Retorna ID ou JsonResponse de erro.
     */
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
            'levantada_em' => $e->levantada_em?->toIso8601String(),
            'levantada_por' => $e->levantada_por,
            'foto_path' => $e->foto_path,
            'condomino' => $e->condomino ? [
                'id' => $e->condomino->id,
                'nome_completo' => $e->condomino->nome_completo,
            ] : null,
            'fraccao' => $e->fraccao ? [
                'id' => $e->fraccao->id,
                'identificador' => $e->fraccao->identificador,
            ] : null,
            'created_at' => $e->created_at->toIso8601String(),
        ];
    }

    /**
     * GET /api/portaria/fraccoes
     * Lista fraccoes do condominio activo do guarda, com pesquisa.
     */
    public function fraccoes(Request $request): JsonResponse
    {
        $user = $request->user();
        $condominioId = $user->condominio_activo_id;

        if (! $condominioId) {
            return response()->json([
                'message' => 'Sem condominio activo. Escolhe um primeiro.',
            ], 422);
        }

        $q = (string) $request->query('q', '');

        $query = \App\Domains\Condominio\Models\Fraccao::query()
            ->where('condominio_id', $condominioId)
            ->orderBy('identificador');

        if (strlen($q) >= 1) {
            $query->where('identificador', 'LIKE', "%{$q}%");
        }

        $fraccoes = $query->limit(50)->get(['id', 'identificador']);

        return response()->json(['data' => $fraccoes]);
    }

    /**
     * GET /api/portaria/encomendas/historico
     * Lista encomendas que ESTE guarda especifico entregou.
     * Filtrado por entregue_por_user_id = user actual.
     */
    public function historico(Request $request): JsonResponse
    {
        $condominioId = $this->exigirCondominioActivo($request);
        if ($condominioId instanceof JsonResponse) return $condominioId;

        $encomendas = Encomenda::query()
            ->doCondominio($condominioId)
            ->where('estado', Encomenda::ESTADO_ENTREGUE)
            ->where('entregue_por_user_id', $request->user()->id)
            ->with(['fraccao:id,identificador'])
            ->orderByDesc('levantada_em')
            ->limit(50)
            ->get();

        return response()->json(['data' => $encomendas]);
    }
    /**
     * Notifica o condómino que a encomenda chegou e aguarda levantamento (#14).
     */
    private function notificarEncomendaRecebida(Encomenda $encomenda): void
    {
        if (! $encomenda->condomino_id) return;
        $condomino = \App\Domains\Condomino\Models\Condomino::find($encomenda->condomino_id);
        if (! $condomino || ! $condomino->user_id) return;
        $user = \App\Models\User::find($condomino->user_id);
        if (! $user) return;
        try {
            $user->notify(new \App\Domains\Condomino\Notifications\EncomendaRecebidaNotification(
                nome: $user->name,
                descricao: $encomenda->descricao ?? 'Encomenda',
                encomendaId: $encomenda->id,
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[Encomenda] Falha a notificar recebida '.$encomenda->id.': '.$e->getMessage());
        }
    }

    /**
     * Notifica o condómino que a encomenda foi entregue/levantada (#15).
     */
    private function notificarEncomendaEntregue(Encomenda $encomenda, string $levantadaPor): void
    {
        if (! $encomenda->condomino_id) return;
        $condomino = \App\Domains\Condomino\Models\Condomino::find($encomenda->condomino_id);
        if (! $condomino || ! $condomino->user_id) return;
        $user = \App\Models\User::find($condomino->user_id);
        if (! $user) return;
        try {
            $user->notify(new \App\Domains\Condomino\Notifications\EncomendaEntregueNotification(
                nome: $user->name,
                descricao: $encomenda->descricao ?? 'Encomenda',
                levantadaPor: $levantadaPor,
                data: now()->format('d/m/Y H:i'),
                encomendaId: $encomenda->id,
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[Encomenda] Falha a notificar entregue '.$encomenda->id.': '.$e->getMessage());
        }
    }
}
