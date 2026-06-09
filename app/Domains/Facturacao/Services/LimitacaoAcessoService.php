<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Models\Quota;
use Illuminate\Support\Facades\DB;

class LimitacaoAcessoService
{
    private const ESTADOS_DIVIDA = ['aberta', 'paga_parcial'];

    public function estaLimitado(Condomino $condomino): bool
    {
        if (! $this->interruptorMestreLigado()) {
            return false;
        }

        $condominioId = $this->descobrirCondominioId($condomino);
        if (! $condominioId) {
            return false;
        }

        $config = DB::table('condominio_facturacao_config')
            ->where('condominio_id', $condominioId)
            ->first();

        if (! $config || ! $config->limitar_acesso_divida) {
            return false;
        }

        // Se ha acordo aprovado/em_cumprimento, a decisao e feita PELO ACORDO
        // (as taxas originais foram absorvidas no acordo).
        $temAcordo = \App\Domains\Facturacao\Models\AcordoPagamento::where('condomino_id', $condomino->id)
            ->whereIn('estado', ['aprovado', 'em_cumprimento'])
            ->exists();
        if ($temAcordo) {
            return ! $this->temAcordoAtivoEmDia($condomino);
        }

        // Sem acordo: regra normal das taxas vencidas vs limiar
        $limiar = (int) ($config->meses_limite_acesso ?? 3);
        $vencidas = $this->contarTaxasVencidas($condomino);
        if ($vencidas < $limiar) {
            return false;
        }

        return true;
    }

    public function contarTaxasVencidas(Condomino $condomino): int
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        if ($fraccaoIds->isEmpty()) {
            return 0;
        }

        return Quota::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('estado', self::ESTADOS_DIVIDA)
            ->whereDate('data_vencimento', '<', now())
            ->count();
    }

    public function motivoLimitacao(Condomino $condomino): array
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        $vencidas = $this->contarTaxasVencidas($condomino);

        $totalDivida = Quota::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('estado', self::ESTADOS_DIVIDA)
            ->whereDate('data_vencimento', '<', now())
            ->sum(DB::raw('valor_total - valor_pago'));

        $config = DB::table('condominio_facturacao_config')
            ->where('condominio_id', $this->descobrirCondominioId($condomino))
            ->first();

        return [
            'limitado' => $this->estaLimitado($condomino),
            'taxas_vencidas' => $vencidas,
            'limiar' => (int) ($config->meses_limite_acesso ?? 3),
            'total_em_divida' => round((float) $totalDivida, 2),
            'mensagem' => 'O acesso esta limitado por taxas de condominio em atraso. '
                . 'Regularize o pagamento ou proponha um acordo para restaurar o acesso completo.',
        ];
    }

    private function descobrirCondominioId(Condomino $condomino): ?int
    {
        $fraccaoId = $condomino->contratosActivos()->value('fraccao_id');
        if (! $fraccaoId) {
            return null;
        }
        return DB::table('fraccoes')->where('id', $fraccaoId)->value('condominio_id');
    }

    private function interruptorMestreLigado(): bool
    {
        $sw = DB::table('plataforma_config')
            ->where('chave', 'modo_limitado_condominos_activo')
            ->value('valor');

        return $sw === '1';
    }

    private function temAcordoAtivoEmDia(Condomino $condomino): bool
    {
        return app(AcordoService::class)->acordoDesbloqueia($condomino);
    }
}
