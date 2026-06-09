<?php

namespace App\Domains\Encomenda\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Encomenda\Models\Encomenda;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Encomenda\Models\FraccaoAutorizado;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EncomendaCondominoApiController extends Controller
{
    /**
     * GET /api/encomendas — listar todas as encomendas do condómino logado.
     */
    public function index(Request $request): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }
        if (! $this->temAcessoEncomendas($condomino)) {
            return response()->json(['erro' => 'sem_acesso', 'data' => []], 403);
        }

        $estados = $request->query('estado');
        $query = Encomenda::query()
            ->where('condomino_id', $condomino->id)
            ->with(['fraccao:id,identificador,edificio_id'])
            ->orderByDesc('created_at');

        if ($estados) {
            $estados = is_array($estados) ? $estados : explode(',', $estados);
            $query->whereIn('estado', $estados);
        }

        $encomendas = $query->limit(100)->get();

        return response()->json([
            'data' => $encomendas->map(fn ($e) => $this->serializar($e)),
        ]);
    }

    /**
     * POST /api/encomendas/pre-anuncio — criar pré-anúncio (Fluxo B).
     */
    public function preAnuncio(Request $request): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }

        $contrato = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->with('fraccao:id,condominio_id')
            ->first();

        if (! $contrato || ! $contrato->fraccao) {
            return response()->json(['message' => 'Sem fracção activa.'], 422);
        }

        $validated = $request->validate([
            'descricao' => ['required', 'string', 'max:500'],
            'remetente' => ['nullable', 'string', 'max:255'],
            'janela_inicio' => ['nullable', 'date'],
            'janela_fim' => ['nullable', 'date', 'after_or_equal:janela_inicio'],
        ]);

        $encomenda = Encomenda::create([
            'condominio_id' => $contrato->fraccao->condominio_id,
            'fraccao_id' => $contrato->fraccao_id,
            'condomino_id' => $condomino->id,
            'descricao' => $validated['descricao'],
            'remetente' => $validated['remetente'] ?? null,
            'estado' => Encomenda::ESTADO_AGUARDA_CHEGADA,
            'origem' => Encomenda::ORIGEM_PRE_ANUNCIADA,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
            'janela_inicio' => $validated['janela_inicio'] ?? null,
            'janela_fim' => $validated['janela_fim'] ?? null,
        ]);

        return response()->json([
            'message' => 'Pré-anúncio criado.',
            'data' => $this->serializar($encomenda->fresh(['fraccao'])),
        ], 201);
    }

    /**
     * POST /api/encomendas/{id}/cancelar — cancelar pré-anúncio próprio.
     */
    public function cancelar(Request $request, int $id): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }

        $encomenda = Encomenda::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $encomenda) {
            return response()->json(['message' => 'Encomenda não encontrada.'], 404);
        }

        if ($encomenda->estado !== Encomenda::ESTADO_AGUARDA_CHEGADA) {
            return response()->json([
                'message' => 'Só é possível cancelar pré-anúncios que ainda não chegaram.',
            ], 422);
        }

        $encomenda->update(['estado' => Encomenda::ESTADO_CANCELADA]);

        return response()->json(['message' => 'Pré-anúncio cancelado.']);
    }

    /**
     * GET /api/fraccao/autorizados — listar autorizados da fracção do condómino.
     */
    public function listarAutorizados(Request $request): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }

        $contrato = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->first();

        if (! $contrato) {
            return response()->json(['data' => []]);
        }

        $autorizados = FraccaoAutorizado::ativos()
            ->daFraccao($contrato->fraccao_id)
            ->orderBy('nome_completo')
            ->get(['id', 'nome_completo', 'bi_passport', 'telefone', 'relacao', 'foto_path']);

        return response()->json(['data' => $autorizados]);
    }

    /**
     * POST /api/fraccao/autorizados — adicionar autorizado.
     */
    public function criarAutorizado(Request $request): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }

        $contrato = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->first();

        if (! $contrato) {
            return response()->json(['message' => 'Sem fracção activa.'], 422);
        }

        $validated = $request->validate([
            'nome_completo' => ['required', 'string', 'max:255'],
            'bi_passport' => ['nullable', 'string', 'max:50'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'relacao' => ['required', Rule::in([
                FraccaoAutorizado::RELACAO_CONJUGE,
                FraccaoAutorizado::RELACAO_FILHO,
                FraccaoAutorizado::RELACAO_EMPREGADA,
                FraccaoAutorizado::RELACAO_FAMILIAR,
                FraccaoAutorizado::RELACAO_OUTRO,
            ])],
        ]);

        $autorizado = FraccaoAutorizado::create([
            'fraccao_id' => $contrato->fraccao_id,
            'cadastrado_por_condomino_id' => $condomino->id,
            'nome_completo' => $validated['nome_completo'],
            'bi_passport' => $validated['bi_passport'] ?? null,
            'telefone' => $validated['telefone'] ?? null,
            'relacao' => $validated['relacao'],
            'activo' => true,
        ]);

        return response()->json([
            'message' => 'Autorizado adicionado.',
            'data' => $autorizado,
        ], 201);
    }

    /**
     * DELETE /api/fraccao/autorizados/{id} — remover autorizado (soft delete).
     */
    public function removerAutorizado(Request $request, int $id): JsonResponse
    {
        $condomino = $this->condominoDoUser($request);
        if (! $condomino) {
            return response()->json(['message' => 'Condómino não encontrado.'], 404);
        }

        $contrato = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->first();

        if (! $contrato) {
            return response()->json(['message' => 'Sem fracção activa.'], 422);
        }

        $autorizado = FraccaoAutorizado::where('id', $id)
            ->where('fraccao_id', $contrato->fraccao_id)
            ->first();

        if (! $autorizado) {
            return response()->json(['message' => 'Autorizado não encontrado.'], 404);
        }

        $autorizado->delete();

        return response()->json(['message' => 'Autorizado removido.']);
    }

    // ===== Helpers =====

    protected function temAcessoEncomendas(Condomino $condomino): bool
    {
        if (! $condomino->empresa_gestora_id) {
            return false;
        }
        $empresa = EmpresaGestora::find($condomino->empresa_gestora_id);
        return $empresa && FeatureGate::has($empresa, 'encomendas_avancado');
    }

    protected function condominoDoUser(Request $request): ?Condomino
    {
        return CondominoResolver::paraUser($request->user());
    }

    protected function serializar(Encomenda $e): array
    {
        return [
            'id' => $e->id,
            'descricao' => $e->descricao,
            'remetente' => $e->remetente,
            'estado' => $e->estado,
            'origem' => $e->origem,
            'local_atual' => $e->local_atual,
            'janela_inicio' => $e->janela_inicio?->toIso8601String(),
            'janela_fim' => $e->janela_fim?->toIso8601String(),
            'chegou_em' => $e->chegou_em?->toIso8601String(),
            'levantada_em' => $e->levantada_em?->toIso8601String(),
            'levantada_por' => $e->levantada_por,
            'multa_aplicada_em' => $e->multa_aplicada_em?->toIso8601String(),
            'multa_valor_kz' => $e->multa_valor_kz,
            'multa_estado' => $e->multa_estado,
            'fraccao_codigo' => $e->fraccao?->identificador,
            'created_at' => $e->created_at->toIso8601String(),
        ];
    }
}
