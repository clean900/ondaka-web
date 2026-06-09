<?php

declare(strict_types=1);

namespace App\Domains\Nps\Services;

use App\Domains\Nps\Models\NpsResposta;
use App\Domains\Nps\Models\NpsConfiguracao;
use Illuminate\Support\Facades\DB;

class NpsService
{
    /** Intervalo (dias) entre pedidos de NPS ao mesmo utilizador para o mesmo alvo. */
    public const INTERVALO_DIAS = 90;

    /**
     * Grava uma resposta NPS (histórico — nunca substitui).
     */
    public function registar(array $dados): NpsResposta
    {
        $dados['categoria'] = NpsResposta::classificar((int) $dados['nota']);

        return NpsResposta::create($dados);
    }

    /**
     * Deve pedir-se NPS a este utilizador para este alvo?
     * True se nunca respondeu ou se já passou o intervalo desde a última resposta.
     */
    public function devePedir(int $userId, string $alvo, ?int $condominioId = null, ?int $empresaGestoraId = null): bool
    {
        // Config efectiva (com fallback ao padrao)
        $config = NpsConfiguracao::resolver($alvo, $empresaGestoraId);

        // Se o NPS deste alvo estiver desactivado, nunca pede
        if (! ($config['activo'] ?? true)) {
            return false;
        }

        $intervalo = (int) ($config['periodicidade_dias'] ?? self::INTERVALO_DIAS);

        $q = NpsResposta::where('user_id', $userId)->where('alvo', $alvo);
        if ($condominioId !== null) {
            $q->where('condominio_id', $condominioId);
        }
        $ultima = $q->latest('created_at')->first();

        if (! $ultima) {
            return true;
        }

        return $ultima->created_at->addDays($intervalo)->isPast();
    }

    /**
     * Calcula o score NPS para um conjunto de respostas (query builder já filtrado).
     * NPS = %promotores - %detractores. Devolve métricas para o dashboard.
     */
    public function calcularScore($query): array
    {
        $total = (clone $query)->count();

        if ($total === 0) {
            return [
                'score' => null,
                'total' => 0,
                'promotores' => 0,
                'passivos' => 0,
                'detractores' => 0,
                'pct_promotores' => 0,
                'pct_passivos' => 0,
                'pct_detractores' => 0,
            ];
        }

        $promotores = (clone $query)->where('categoria', 'promotor')->count();
        $passivos = (clone $query)->where('categoria', 'passivo')->count();
        $detractores = (clone $query)->where('categoria', 'detractor')->count();

        $pctProm = ($promotores / $total) * 100;
        $pctDet = ($detractores / $total) * 100;

        return [
            'score' => (int) round($pctProm - $pctDet),
            'total' => $total,
            'promotores' => $promotores,
            'passivos' => $passivos,
            'detractores' => $detractores,
            'pct_promotores' => round($pctProm, 1),
            'pct_passivos' => round(($passivos / $total) * 100, 1),
            'pct_detractores' => round($pctDet, 1),
        ];
    }
}
