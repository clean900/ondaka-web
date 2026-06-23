<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Http\Controllers\Api;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Assembleia\Models\AssembleiaVoto;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssembleiaApiController extends Controller
{
    /**
     * GET /api/assembleias — Lista assembleias onde o user é participante.
     */
    private function temAcesso($user): bool
    {
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino || ! $condomino->empresa_gestora_id) {
            return false;
        }
        $empresa = EmpresaGestora::find($condomino->empresa_gestora_id);
        return $empresa && FeatureGate::has($empresa, 'assembleia_virtual');
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso', 'data' => []], 403);
        }
        $condomino = CondominoResolver::paraUser($user);

        if (! $condomino) {
            return response()->json(['data' => [], 'message' => 'User não é condómino.']);
        }

        $assembleiaIds = AssembleiaParticipante::where('condomino_id', $condomino->id)
            ->pluck('assembleia_id');

        $assembleias = Assembleia::whereIn('id', $assembleiaIds)
            ->orderBy('data_agendada', 'desc')
            ->get(['id', 'numero', 'tipo', 'titulo', 'data_agendada', 'estado',
                   'local', 'modo', 'acta_gerada']);

        return response()->json(['data' => $assembleias]);
    }

    /**
     * GET /api/assembleias/{id} — Detalhe + pontos + status do voto.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['message' => 'User não é condómino.'], 403);
        }

        $assembleia = Assembleia::with(['pontosVotacao'])->find($id);
        if (! $assembleia) {
            return response()->json(['message' => 'Assembleia não encontrada.'], 404);
        }

        // Verificar se é participante
        $participante = AssembleiaParticipante::where('assembleia_id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $participante) {
            return response()->json(['message' => 'Não és participante desta assembleia.'], 403);
        }

        // Buscar votos do user para cada ponto
        $votos = AssembleiaVoto::where('participante_id', $participante->id)
            ->pluck('opcao', 'ponto_votacao_id');

        $pontos = $assembleia->pontosVotacao->map(function ($p) use ($votos) {
            return [
                'id' => $p->id,
                'ordem' => $p->ordem,
                'titulo' => $p->titulo,
                'descricao' => $p->descricao,
                'tipo' => $p->tipo,
                'estado' => $p->estado,
                'opcoes' => $p->opcoes,
                'meu_voto' => $votos[$p->id] ?? null,
                'votacao_aberta' => $p->estado === 'em_votacao',
            ];
        });

        return response()->json([
            'data' => [
                'assembleia' => $assembleia->only([
                    'id', 'numero', 'tipo', 'titulo', 'ordem_do_dia',
                    'data_agendada', 'local', 'modo', 'estado',
                    'acta_gerada', 'acta_path', 'sala_jitsi',
                ]),
                'participante' => [
                    'id' => $participante->id,
                    'numero_fraccoes' => $participante->numero_fraccoes,
                    'permilagem_total' => $participante->permilagem_total,
                ],
                'pontos' => $pontos,
            ],
        ]);
    }

    /**
     * POST /api/assembleias/{id}/pontos/{ponto}/votar
     */
    public function votar(Request $request, int $id, int $pontoId): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['message' => 'User não é condómino.'], 403);
        }

        $request->validate([
            'opcao' => 'required|string|max:100',
        ]);

        // O mobile envia rotulos ("Sim"/"Não"/"Abstenção"); o canonico e sim/nao/abstencao.
        $opcao = \Illuminate\Support\Str::lower(
            \Illuminate\Support\Str::ascii((string) $request->string('opcao'))
        );
        if (! in_array($opcao, ['sim', 'nao', 'abstencao'], true)) {
            return response()->json(['message' => 'Opção inválida.'], 422);
        }

        $participante = AssembleiaParticipante::where('assembleia_id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $participante) {
            return response()->json(['message' => 'Não és participante.'], 403);
        }

        $ponto = \App\Domains\Assembleia\Models\AssembleiaPontoVotacao::find($pontoId);
        if (! $ponto || $ponto->assembleia_id !== $id) {
            return response()->json(['message' => 'Ponto não encontrado.'], 404);
        }

        if ($ponto->estado !== 'em_votacao') {
            return response()->json(['message' => 'Votação não está aberta.'], 422);
        }

        // Quem vota está presente — corrige acta/quórum no fluxo mobile
        // (antes, votar pelo telemóvel deixava o participante como ausente).
        $participante->marcarPresente($request->ip(), $request->userAgent());

        AssembleiaVoto::updateOrCreate(
            ['ponto_votacao_id' => $pontoId, 'participante_id' => $participante->id],
            [
                'opcao' => $opcao,
                'peso_permilagem' => (float) ($participante->permilagem_total ?? 0),
                'votou_como_procurador' => false,
                'votado_em' => now(),
            ],
        );

        return response()->json(['message' => 'Voto registado.']);
    }

    /**
     * POST /api/assembleias/{id}/entrar — Marca o participante como presente
     * (entrou na sala virtual). Idempotente. Conta para quórum e acta.
     */
    public function entrar(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['message' => 'User não é condómino.'], 403);
        }

        $participante = AssembleiaParticipante::where('assembleia_id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $participante) {
            return response()->json(['message' => 'Não és participante desta assembleia.'], 403);
        }

        $participante->marcarPresente($request->ip(), $request->userAgent());

        return response()->json(['message' => 'Presença registada.']);
    }

    /**
     * GET /api/assembleias/{id}/acta — Stream do PDF da acta.
     * Servido aqui (autenticado, só participantes) porque a acta vive no
     * disco privado e NÃO pode passar por /ficheiros/ (disco público sem auth).
     */
    public function baixarActa(Request $request, int $id)
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['message' => 'User não é condómino.'], 403);
        }

        $assembleia = Assembleia::find($id);
        if (! $assembleia) {
            return response()->json(['message' => 'Assembleia não encontrada.'], 404);
        }

        $participante = AssembleiaParticipante::where('assembleia_id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $participante) {
            return response()->json(['message' => 'Não és participante desta assembleia.'], 403);
        }

        $pdf = app(\App\Domains\Assembleia\Services\ActaService::class)->obterPdf($assembleia);
        if ($pdf === null) {
            return response()->json(['message' => 'Acta ainda não disponível.'], 404);
        }

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="acta-assembleia-'.$assembleia->numero.'.pdf"',
        ]);
    }
}
