<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Http\Controllers\Api;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoLeitura;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Facturacao\Services\LimitacaoAcessoService;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Tickets\Models\Ticket;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    /**
     * GET /api/dashboard/condomino
     * 4 widgets: assembleias, avisos, tickets, visitas.
     */
    /**
     * GET /api/condomino/estado-acesso
     * Endpoint leve: a app verifica no arranque/retorno se o condomino esta limitado.
     */
    public function estadoAcesso(Request $request): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['limitado' => false]);
        }
        $svc = app(LimitacaoAcessoService::class);
        if (! $svc->estaLimitado($condomino)) {
            return response()->json(['limitado' => false]);
        }
        return response()->json([
            'limitado' => true,
            'motivo' => $svc->motivoLimitacao($condomino),
        ]);
    }

    public function condomino(Request $request): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);

        if (! $condomino) {
            return response()->json([
                'data' => [
                    'assembleias_proximas' => [],
                    'avisos_nao_lidos' => 0,
                    'tickets_abertos' => 0,
                    'visitas_proximas' => 0,
                ],
                'message' => 'User não é condómino.',
            ]);
        }

        return response()->json([
            'data' => [
                'assembleias_proximas' => $this->assembleiasProximas($condomino->id),
                'avisos_nao_lidos' => $this->avisosNaoLidos($user->id, $condomino),
                'tickets_abertos' => $this->ticketsAbertos($user->id),
                'visitas_proximas' => $this->visitasProximas($condomino->id),
            ],
        ]);
    }

    /**
     * Próximas assembleias (estado=agendada, data >= hoje), max 3.
     */
    protected function assembleiasProximas(int $condominoId): array
    {
        $assembleiaIds = AssembleiaParticipante::where('condomino_id', $condominoId)
            ->pluck('assembleia_id');

        return Assembleia::whereIn('id', $assembleiaIds)
            ->where('estado', 'agendada')
            ->where('data_agendada', '>=', now())
            ->orderBy('data_agendada', 'asc')
            ->limit(3)
            ->get(['id', 'numero', 'titulo', 'data_agendada', 'modo'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'numero' => $a->numero,
                'titulo' => $a->titulo,
                'data_agendada' => $a->data_agendada,
                'modo' => $a->modo,
            ])
            ->values()
            ->all();
    }

    /**
     * Conta avisos publicados que o user nunca leu.
     */
    protected function avisosNaoLidos(int $userId, Condomino $condomino): int
    {
        $condominioId = $this->descobrirCondominioId($condomino->id);

        $q = Aviso::query()
            ->where('estado', 'publicado')
            ->where('empresa_gestora_id', $condomino->empresa_gestora_id);

        if ($condominioId) {
            $q->where(function ($sub) use ($condominioId) {
                $sub->where('condominio_id', $condominioId)
                    ->orWhereNull('condominio_id');
            });
        }

        $idsAvisosVisiveis = $q->pluck('id');

        if ($idsAvisosVisiveis->isEmpty()) {
            return 0;
        }

        $idsLidos = AvisoLeitura::where('user_id', $userId)
            ->whereIn('aviso_id', $idsAvisosVisiveis)
            ->whereNotNull('lido_em')
            ->pluck('aviso_id');

        return $idsAvisosVisiveis->diff($idsLidos)->count();
    }

    /**
     * Tickets abertos pelo user e ainda não resolvidos.
     */
    protected function ticketsAbertos(int $userId): int
    {
        return Ticket::where('aberto_por_user_id', $userId)
            ->whereIn('estado', ['aberto', 'em_analise'])
            ->count();
    }

    /**
     * Pré-aprovações activas (válida_até >= agora).
     */
    protected function visitasProximas(int $condominoId): int
    {
        return PreAprovacao::where('condomino_id', $condominoId)
            ->where('valida_ate', '>=', now())
            ->where('estado', 'pendente')
            ->count();
    }

    /**
     * Descobre o condomínio do condómino via primeiro contrato activo.
     */
    protected function descobrirCondominioId(int $condominoId): ?int
    {
        $contrato = ContratoOcupacao::where('condomino_id', $condominoId)
            ->where('estado', 'activo')
            ->with('fraccao:id,condominio_id')
            ->first();

        return $contrato?->fraccao?->condominio_id;
    }
}
