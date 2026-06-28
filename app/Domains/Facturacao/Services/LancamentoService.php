<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Service de gestão de lançamentos individuais.
 *
 * Responsabilidades:
 * - Criar despesa extra para uma fracção (admin manual)
 * - Cancelar um lançamento (com motivo + audit trail)
 * - Não trata de quotas (essas são via QuotaService)
 */
class LancamentoService
{
    /**
     * Cria um lançamento de despesa extra (despesa_extra ou ajuste_debito).
     *
     * @param array{
     *   fraccao_id: int,
     *   tipo: string,
     *   descricao: string,
     *   valor: float,
     *   data_vencimento?: ?string,
     *   detalhes?: ?string,
     *   observacoes?: ?string
     * } $dados
     */
    public function criarDespesaExtra(array $dados, User $criadoPor): Lancamento
    {
        $tipo = $dados['tipo'] ?? Lancamento::TIPO_DESPESA_EXTRA;
        $tiposPermitidos = [
            Lancamento::TIPO_DESPESA_EXTRA,
            Lancamento::TIPO_AJUSTE_DEBITO,
            Lancamento::TIPO_AJUSTE_CREDITO,
        ];

        if (! in_array($tipo, $tiposPermitidos, true)) {
            throw new InvalidArgumentException("Tipo '{$tipo}' não é permitido para lançamento manual.");
        }

        $valor = (float) $dados['valor'];
        if ($valor <= 0) {
            throw new InvalidArgumentException('Valor tem de ser positivo.');
        }

        $fraccao = \App\Domains\Condominio\Models\Fraccao::with(['condominio'])
            ->findOrFail($dados['fraccao_id']);

        // Tenancy: garantir que o user pode lançar nesta fracção
        if ($fraccao->empresa_gestora_id !== $criadoPor->empresa_gestora_id) {
            throw new InvalidArgumentException('Fracção não pertence à empresa do utilizador.');
        }

        // Descobrir condómino activo (snapshot histórico)
        $contrato = ContratoOcupacao::where('fraccao_id', $fraccao->id)
            ->where('estado', 'activo')
            ->orderByRaw("CASE WHEN tipo = 'proprietario' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->first();

        // Sem condómino activo não há a quem imputar a despesa (evita lançamento
        // órfão que parte o extrato do condómino).
        if ($contrato === null) {
            throw new InvalidArgumentException('Esta fracção não tem condómino activo. Atribua um contrato antes de lançar despesas.');
        }

        return DB::transaction(function () use ($dados, $tipo, $valor, $fraccao, $contrato, $criadoPor) {
            return Lancamento::create([
                'empresa_gestora_id' => $fraccao->empresa_gestora_id,
                'condominio_id' => $fraccao->condominio_id,
                'fraccao_id' => $fraccao->id,
                'condomino_id' => $contrato?->condomino_id,
                'tipo' => $tipo,
                'descricao' => $dados['descricao'],
                'detalhes' => $dados['detalhes'] ?? null,
                'valor' => $valor,
                'data_lancamento' => Carbon::now()->toDateString(),
                'data_vencimento' => $dados['data_vencimento'] ?? null,
                'estado' => Lancamento::ESTADO_EM_ABERTO,
                'criado_por_user_id' => $criadoPor->id,
                'observacoes' => $dados['observacoes'] ?? null,
            ]);
        });
    }

    /**
     * Cancela um lançamento existente.
     * Não permite cancelar se já tiver pagamentos confirmados imputados.
     */
    public function cancelarLancamento(Lancamento $lancamento, User $por, ?string $motivo = null): Lancamento
    {
        if ($lancamento->estado === Lancamento::ESTADO_CANCELADO) {
            throw new InvalidArgumentException('Lançamento já está cancelado.');
        }

        if ($lancamento->estado === Lancamento::ESTADO_PAGO || $lancamento->estado === Lancamento::ESTADO_PAGO_PARCIAL) {
            throw new InvalidArgumentException(
                'Não é possível cancelar um lançamento com pagamentos imputados. ' .
                'Estorne primeiro os pagamentos se necessário.'
            );
        }

        if ($lancamento->empresa_gestora_id !== $por->empresa_gestora_id) {
            throw new InvalidArgumentException('Lançamento não pertence à empresa do utilizador.');
        }

        return DB::transaction(function () use ($lancamento, $por, $motivo) {
            $lancamento->update([
                'estado' => Lancamento::ESTADO_CANCELADO,
                'cancelado_por_user_id' => $por->id,
                'cancelado_em' => now(),
                'motivo_cancelamento' => $motivo,
            ]);

            // Se o lançamento pertence a uma quota, recalcular
            $lancamento->quota?->recalcularEstado();

            return $lancamento->fresh();
        });
    }
}
