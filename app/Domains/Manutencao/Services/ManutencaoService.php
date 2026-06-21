<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Services;

use App\Domains\Manutencao\Models\Equipamento;
use App\Domains\Manutencao\Models\ManutencaoIntervencao;
use App\Domains\Manutencao\Models\ManutencaoPlano;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ManutencaoService
{
    /** Janelas de alerta (dias antes da próxima manutenção). */
    public const JANELAS_ALERTA = [30, 15, 7];

    /**
     * Regista uma intervenção e avança a próxima data do plano
     * (data realizada + periodicidade).
     */
    public function registarIntervencao(ManutencaoPlano $plano, array $dados, int $userId): ManutencaoIntervencao
    {
        return DB::transaction(function () use ($plano, $dados, $userId) {
            $dataRealizada = Carbon::parse($dados['data_realizada']);

            $intervencao = ManutencaoIntervencao::create([
                'plano_id' => $plano->id,
                'equipamento_id' => $plano->equipamento_id,
                'data_realizada' => $dataRealizada->toDateString(),
                'descricao' => $dados['descricao'] ?? null,
                'custo' => $dados['custo'] ?? null,
                'realizado_por' => $dados['realizado_por'] ?? null,
                'relatorio_path' => $dados['relatorio_path'] ?? null,
                'registado_por_user_id' => $userId,
            ]);

            // Avança a próxima data a partir da data realizada.
            $plano->update([
                'proxima_data' => $dataRealizada->copy()->addDays($plano->periodicidade_dias)->toDateString(),
            ]);

            return $intervencao;
        });
    }

    /**
     * Próximas manutenções de um condomínio (ou empresa) ordenadas por data.
     *
     * @return Collection<int,ManutencaoPlano>
     */
    public function proximas(int $empresaGestoraId, ?int $condominioId = null, int $diasHorizonte = 120): Collection
    {
        return ManutencaoPlano::query()
            ->where('activo', true)
            ->whereDate('proxima_data', '<=', now()->addDays($diasHorizonte))
            ->whereHas('equipamento', function ($q) use ($empresaGestoraId, $condominioId) {
                $q->where('empresa_gestora_id', $empresaGestoraId);
                if ($condominioId) {
                    $q->where('condominio_id', $condominioId);
                }
            })
            ->with('equipamento:id,nome,tipo,condominio_id')
            ->orderBy('proxima_data')
            ->get();
    }

    /**
     * Planos cuja próxima data cai exactamente numa das janelas de alerta
     * (usado pelo comando diário). Devolve [plano, dias] agrupado.
     *
     * @return Collection<int,array{plano:ManutencaoPlano,dias:int}>
     */
    public function planosParaAlertar(): Collection
    {
        $datasAlvo = collect(self::JANELAS_ALERTA)
            ->mapWithKeys(fn ($d) => [now()->addDays($d)->toDateString() => $d]);

        return ManutencaoPlano::query()
            ->where('activo', true)
            ->whereIn(DB::raw('DATE(proxima_data)'), $datasAlvo->keys()->all())
            ->with('equipamento')
            ->get()
            ->map(fn (ManutencaoPlano $p) => [
                'plano' => $p,
                'dias' => $datasAlvo[$p->proxima_data->toDateString()] ?? 0,
            ]);
    }

    /**
     * @return Collection<int,Equipamento>
     */
    public function equipamentos(int $empresaGestoraId, ?int $condominioId = null): Collection
    {
        return Equipamento::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->withCount('planos')
            ->orderBy('nome')
            ->get();
    }
}
