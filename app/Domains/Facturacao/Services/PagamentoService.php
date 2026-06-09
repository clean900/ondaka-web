<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Facturacao\Models\PagamentoImputacao;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Service de gestão de pagamentos B2C.
 *
 * Responsabilidades:
 * - Criar pagamento submetido pelo condómino
 * - Editar pagamento pendente
 * - Imputar valor a lançamentos (admin)
 * - Confirmar pagamento (admin)
 * - Rejeitar pagamento (admin)
 * - Cancelar pagamento (condómino enquanto pendente)
 *
 * Toda a lógica usa transações para garantir consistência.
 */
class PagamentoService
{
    /**
     * Cria pagamento submetido pelo condómino.
     *
     * @param array{
     *   fraccao_id: int,
     *   metodo: string,
     *   valor: string,
     *   data_pagamento: string,
     *   lancamento_ids?: array<int>,
     *   referencia_externa?: ?string,
     *   banco_origem?: ?string,
     *   notas_condomino?: ?string,
     *   comprovativo?: array{path: string, nome_original: string, mime: string, tamanho: int}
     * } $dados
     */
    public function criarPagamentoCondomino(array $dados, User $registadoPor): Pagamento
    {
        $condomino = Condomino::where('user_id', $registadoPor->id)->first();
        if (! $condomino) {
            throw new InvalidArgumentException('User não tem condómino associado.');
        }

        $fraccaoId = (int) $dados['fraccao_id'];

        // Tenancy: garantir que o condómino tem contrato activo nesta fracção
        $contrato = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('fraccao_id', $fraccaoId)
            ->where('estado', 'activo')
            ->first();

        if (! $contrato) {
            throw new InvalidArgumentException('Não tens contrato activo nesta fracção.');
        }

        $fraccao = \App\Domains\Condominio\Models\Fraccao::findOrFail($fraccaoId);

        // Validar comprovativo obrigatório para transferência e depósito
        $metodo = $dados['metodo'];
        $exigeComprovativo = in_array($metodo, [
            Pagamento::METODO_TRANSFERENCIA,
            Pagamento::METODO_DEPOSITO,
        ], true);

        if ($exigeComprovativo && empty($dados['comprovativo'])) {
            throw new InvalidArgumentException(
                'Comprovativo é obrigatório para transferência bancária ou depósito.'
            );
        }

        // Validar valor
        $valor = $dados['valor'] ?? '0';
        if (bccomp((string) $valor, '0.01', 2) < 0) {
            throw new InvalidArgumentException('Valor mínimo é 0,01 Kz.');
        }

        return DB::transaction(function () use ($dados, $condomino, $contrato, $fraccao, $metodo, $valor, $registadoPor) {
            $pagamento = Pagamento::create([
                'referencia' => Pagamento::gerarReferencia($fraccao->empresa_gestora_id),
                'empresa_gestora_id' => $fraccao->empresa_gestora_id,
                'condominio_id' => $fraccao->condominio_id,
                'fraccao_id' => $fraccao->id,
                'condomino_id' => $condomino->id,
                'conta_bancaria_id' => $dados['conta_bancaria_id'] ?? null,
                'metodo' => $metodo,
                'valor' => $valor,
                'moeda' => 'AOA',
                'data_pagamento' => $dados['data_pagamento'],
                'comprovativo_path' => $dados['comprovativo']['path'] ?? null,
                'comprovativo_nome_original' => $dados['comprovativo']['nome_original'] ?? null,
                'comprovativo_mime' => $dados['comprovativo']['mime'] ?? null,
                'comprovativo_tamanho_bytes' => $dados['comprovativo']['tamanho'] ?? null,
                'referencia_externa' => $dados['referencia_externa'] ?? null,
                'banco_origem' => $dados['banco_origem'] ?? null,
                'estado' => Pagamento::ESTADO_PENDENTE,
                'registado_por_user_id' => $registadoPor->id,
                'notas_condomino' => $dados['notas_condomino'] ?? null,
            ]);

            // Imputações sugeridas pelo condómino (escolha de lançamentos)
            if (! empty($dados['lancamento_ids']) && is_array($dados['lancamento_ids'])) {
                $this->imputarSugestao($pagamento, $dados['lancamento_ids']);
            }

            return $pagamento->fresh(['imputacoes']);
        });
    }

    /**
     * Cria imputações "sugeridas" — não actualizam o estado dos lançamentos
     * porque o pagamento ainda está PENDENTE. Apenas regista a intenção
     * do condómino. Quando o admin confirmar, é que se materializam.
     */
    private function imputarSugestao(Pagamento $pagamento, array $lancamentoIds): void
    {
        $lancamentos = Lancamento::whereIn('id', $lancamentoIds)
            ->where('fraccao_id', $pagamento->fraccao_id)
            ->emAberto()
            ->get();

        $valorRestante = (string) $pagamento->valor;

        foreach ($lancamentos as $lancamento) {
            if (bccomp($valorRestante, '0', 2) <= 0) {
                break;
            }

            $emDivida = bcsub((string) $lancamento->valor, (string) $lancamento->valor_pago, 2);
            $imputar = bccomp($valorRestante, $emDivida, 2) >= 0 ? $emDivida : $valorRestante;

            // Cria imputação SEM disparar recalcularEstado()
            // Vamos inserir directamente no DB para evitar o boot::saved
            DB::table('pagamento_imputacoes')->insert([
                'pagamento_id' => $pagamento->id,
                'lancamento_id' => $lancamento->id,
                'valor' => $imputar,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $valorRestante = bcsub($valorRestante, $imputar, 2);
        }
    }

    /**
     * Edita um pagamento pendente.
     */
    public function editarPagamento(Pagamento $pagamento, array $dados, User $por): Pagamento
    {
        if (! $pagamento->podeSerEditado()) {
            throw new InvalidArgumentException(
                'Pagamento não pode ser editado no estado actual.'
            );
        }

        // Tenancy: condómino só pode editar o seu próprio
        $condomino = Condomino::where('user_id', $por->id)->first();
        if ($condomino && $pagamento->condomino_id !== $condomino->id) {
            throw new InvalidArgumentException('Não podes editar este pagamento.');
        }

        return DB::transaction(function () use ($pagamento, $dados) {
            $atualizaveis = [
                'metodo', 'valor', 'data_pagamento', 'referencia_externa',
                'banco_origem', 'notas_condomino',
            ];

            $update = array_intersect_key($dados, array_flip($atualizaveis));

            if (! empty($dados['comprovativo'])) {
                $update['comprovativo_path'] = $dados['comprovativo']['path'];
                $update['comprovativo_nome_original'] = $dados['comprovativo']['nome_original'];
                $update['comprovativo_mime'] = $dados['comprovativo']['mime'];
                $update['comprovativo_tamanho_bytes'] = $dados['comprovativo']['tamanho'];
            }

            if (! empty($update)) {
                $pagamento->update($update);
            }

            // Reimputar se mandou novos IDs
            if (isset($dados['lancamento_ids'])) {
                DB::table('pagamento_imputacoes')
                    ->where('pagamento_id', $pagamento->id)
                    ->delete();

                if (is_array($dados['lancamento_ids']) && ! empty($dados['lancamento_ids'])) {
                    $this->imputarSugestao($pagamento->fresh(), $dados['lancamento_ids']);
                }
            }

            return $pagamento->fresh(['imputacoes']);
        });
    }

    /**
     * Confirma um pagamento (admin) — materializa as imputações.
     * Ao confirmar, o boot::saved do PagamentoImputacao recalcula
     * automaticamente o valor_pago dos lançamentos.
     */
    public function confirmarPagamento(Pagamento $pagamento, User $admin, ?array $imputacoes = null, bool $automatico = false): Pagamento
    {
        if ($pagamento->estado !== Pagamento::ESTADO_PENDENTE
            && $pagamento->estado !== Pagamento::ESTADO_EM_REVISAO) {
            throw new InvalidArgumentException('Pagamento já foi processado.');
        }

        // Tenancy (saltado em confirmacao automatica de sistema, ex: webhook ProxyPay)
        if (! $automatico && $pagamento->empresa_gestora_id !== $admin->empresa_gestora_id) {
            throw new InvalidArgumentException('Pagamento de outra empresa gestora.');
        }

        return DB::transaction(function () use ($pagamento, $admin, $imputacoes) {
            // Se admin enviou imputações, substituir as sugeridas
            if (is_array($imputacoes)) {
                DB::table('pagamento_imputacoes')
                    ->where('pagamento_id', $pagamento->id)
                    ->delete();

                $this->imputarManual($pagamento, $imputacoes);
            }

            // Confirmar pagamento
            $pagamento->update([
                'estado' => Pagamento::ESTADO_CONFIRMADO,
                'confirmado_em' => now(),
                'confirmado_por_user_id' => $admin->id,
            ]);

            // Forçar recálculo dos lançamentos imputados
            $pagamento->load('imputacoes.lancamento');
            foreach ($pagamento->imputacoes as $imputacao) {
                $lancamento = $imputacao->lancamento;
                $lancamento?->recalcularEstado();

                // GANCHO ACORDO: se o lancamento e de um acordo e ficou pago,
                // marca a prestacao correspondente como paga (a prestacao e a fonte da verdade).
                if ($lancamento && $lancamento->tipo === 'acordo' && $lancamento->estado === 'pago') {
                    $this->marcarPrestacaoDoLancamentoComoPaga($lancamento->id);
                }
            }

            // Conciliação automática: criar movimento (entrada) na conta bancária
            if ($pagamento->conta_bancaria_id) {
                $conta = \App\Domains\Financas\Models\ContaBancaria::lockForUpdate()->find($pagamento->conta_bancaria_id);
                if ($conta) {
                    $saldoApos = bcadd((string) $conta->saldo_actual, (string) $pagamento->valor, 2);

                    $movimento = \App\Domains\Financas\Models\ContaBancariaMovimento::create([
                        'conta_bancaria_id' => $conta->id,
                        'data' => $pagamento->data_pagamento ?? now()->toDateString(),
                        'tipo' => 'entrada',
                        'descricao' => 'Pagamento ' . $pagamento->referencia . ' — ' . ($pagamento->metodo ?? ''),
                        'valor' => $pagamento->valor,
                        'saldo_apos' => $saldoApos,
                        'origem_tipo' => 'pagamento_aprovado',
                        'origem_id' => $pagamento->id,
                        'criado_por_user_id' => $admin->id,
                    ]);

                    $conta->update(['saldo_actual' => $saldoApos]);

                    $pagamento->update(['movimento_id' => $movimento->id]);
                }
            }

            // Gerar Confirmacao de Pagamento PDF (defensivo: nao rebenta a confirmacao)
            $pdfPath = app(\App\Domains\Facturacao\Services\ConfirmacaoPagamentoPdfService::class)
                ->gerarEGuardar($pagamento);
            if ($pdfPath) {
                $pagamento->update(['confirmacao_pdf_path' => $pdfPath]);
            }

            return $pagamento->fresh(['imputacoes.lancamento']);
        });
    }

    /**
     * Imputação manual pelo admin — formato:
     * [['lancamento_id' => 1, 'valor' => '15000.00'], ...]
     */
    /**
     * Quando um lancamento do tipo 'acordo' e pago, marca a prestacao do acordo correspondente.
     * A prestacao e a fonte da verdade do estado de pagamento do acordo.
     */
    private function marcarPrestacaoDoLancamentoComoPaga(int $lancamentoId): void
    {
        $prestacao = \App\Domains\Facturacao\Models\AcordoPrestacao::where('lancamento_id', $lancamentoId)
            ->where('estado', '!=', 'paga')
            ->first();
        if (! $prestacao) {
            return;
        }
        app(\App\Domains\Facturacao\Services\AcordoService::class)->marcarPrestacaoPaga($prestacao);
    }

    private function imputarManual(Pagamento $pagamento, array $imputacoes): void
    {
        $totalImputado = '0';

        foreach ($imputacoes as $imp) {
            $lancamentoId = (int) $imp['lancamento_id'];
            $valor = (string) $imp['valor'];

            $lancamento = Lancamento::where('id', $lancamentoId)
                ->where('fraccao_id', $pagamento->fraccao_id)
                ->first();

            if (! $lancamento) {
                throw new InvalidArgumentException("Lançamento #{$lancamentoId} não pertence à fracção do pagamento.");
            }

            DB::table('pagamento_imputacoes')->insert([
                'pagamento_id' => $pagamento->id,
                'lancamento_id' => $lancamentoId,
                'valor' => $valor,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalImputado = bcadd($totalImputado, $valor, 2);
        }

        if (bccomp($totalImputado, (string) $pagamento->valor, 2) > 0) {
            throw new InvalidArgumentException(
                "Total imputado ({$totalImputado}) excede valor do pagamento ({$pagamento->valor})."
            );
        }
    }

    /**
     * Rejeita um pagamento (admin).
     */
    public function rejeitarPagamento(Pagamento $pagamento, User $admin, string $motivo): Pagamento
    {
        if ($pagamento->estado === Pagamento::ESTADO_CONFIRMADO) {
            throw new InvalidArgumentException('Não é possível rejeitar pagamento já confirmado.');
        }

        if ($pagamento->empresa_gestora_id !== $admin->empresa_gestora_id) {
            throw new InvalidArgumentException('Pagamento de outra empresa gestora.');
        }

        return DB::transaction(function () use ($pagamento, $admin, $motivo) {
            // Limpar imputações sugeridas
            DB::table('pagamento_imputacoes')
                ->where('pagamento_id', $pagamento->id)
                ->delete();

            $pagamento->update([
                'estado' => Pagamento::ESTADO_REJEITADO,
                'rejeitado_em' => now(),
                'motivo_rejeicao' => $motivo,
                'confirmado_por_user_id' => $admin->id,
            ]);

            return $pagamento->fresh();
        });
    }

    /**
     * Cancela um pagamento (condómino, enquanto pendente).
     */
    /**
     * Devolve um pagamento confirmado.
     *
     * Estado: confirmado -> devolvido
     * Lançamentos imputados: voltam ao estado original (valor_pago restaurado)
     * Audit: motivo + admin guardados.
     *
     * Caso de uso real: dinheiro tem que ser devolvido fisicamente
     * ao condómino (transferência, balcão, etc).
     *
     * Para devolução virtual (manter como saldo), usa converterEmCredito.
     */
    public function devolverPagamento(Pagamento $pagamento, User $admin, string $motivo): Pagamento
    {
        if ($pagamento->estado !== Pagamento::ESTADO_CONFIRMADO) {
            throw new \InvalidArgumentException("Só pagamentos confirmados podem ser devolvidos. Actual: {$pagamento->estado}");
        }

        if (mb_strlen($motivo) < 5) {
            throw new \InvalidArgumentException('Motivo da devolução deve ter pelo menos 5 caracteres.');
        }

        \DB::transaction(function () use ($pagamento, $admin, $motivo) {
            // Reverter imputações: restaurar valor_pago dos lançamentos
            foreach ($pagamento->imputacoes as $imp) {
                $lancamento = $imp->lancamento;
                if (! $lancamento) continue;

                // Restaurar valor_pago
                $novoPago = bcsub((string) $lancamento->valor_pago, (string) $imp->valor, 2);
                if (bccomp($novoPago, '0', 2) < 0) {
                    $novoPago = '0';
                }
                $lancamento->update(['valor_pago' => $novoPago]);

                // Recalcular estado do lançamento
                if (bccomp($novoPago, '0', 2) === 0) {
                    $lancamento->update(['estado' => \App\Domains\Facturacao\Models\Lancamento::ESTADO_EM_ABERTO]);
                } elseif (bccomp($novoPago, (string) $lancamento->valor, 2) < 0) {
                    $lancamento->update(['estado' => \App\Domains\Facturacao\Models\Lancamento::ESTADO_PAGO_PARCIAL]);
                }
            }

            // Apagar imputações
            $pagamento->imputacoes()->delete();

            // Anular movimento bancário associado (se existir)
            $this->anularMovimentoDoPagamento($pagamento, $admin, 'Devolução: ' . $motivo);

            // Marcar pagamento como devolvido
            $pagamento->update([
                'estado' => Pagamento::ESTADO_DEVOLVIDO,
                'rejeitado_em' => now(),
                'rejeitado_por_user_id' => $admin->id,
                'motivo_rejeicao' => 'Devolvido: ' . $motivo,
            ]);
        });

        return $pagamento->fresh();
    }

    /**
     * Converte um pagamento confirmado em crédito (saldo a favor) na fracção.
     *
     * Estado do pagamento: confirmado -> devolvido (mas com nota explícita)
     * Lançamentos imputados: voltam ao estado original
     * Cria CreditoFraccao com valor = valor pago.
     *
     * Caso de uso: condómino pagou a mais ou pagamento já não é necessário,
     * mas em vez de devolver dinheiro físico, mantém-se como crédito a usar.
     */
    public function converterEmCredito(Pagamento $pagamento, User $admin, string $motivo): \App\Domains\Facturacao\Models\CreditoFraccao
    {
        if ($pagamento->estado !== Pagamento::ESTADO_CONFIRMADO) {
            throw new \InvalidArgumentException("Só pagamentos confirmados podem ser convertidos em crédito. Actual: {$pagamento->estado}");
        }

        if (mb_strlen($motivo) < 5) {
            throw new \InvalidArgumentException('Motivo deve ter pelo menos 5 caracteres.');
        }

        return \DB::transaction(function () use ($pagamento, $admin, $motivo) {
            // Reverter imputações: restaurar valor_pago dos lançamentos
            foreach ($pagamento->imputacoes as $imp) {
                $lancamento = $imp->lancamento;
                if (! $lancamento) continue;

                $novoPago = bcsub((string) $lancamento->valor_pago, (string) $imp->valor, 2);
                if (bccomp($novoPago, '0', 2) < 0) {
                    $novoPago = '0';
                }
                $lancamento->update(['valor_pago' => $novoPago]);

                if (bccomp($novoPago, '0', 2) === 0) {
                    $lancamento->update(['estado' => \App\Domains\Facturacao\Models\Lancamento::ESTADO_EM_ABERTO]);
                } elseif (bccomp($novoPago, (string) $lancamento->valor, 2) < 0) {
                    $lancamento->update(['estado' => \App\Domains\Facturacao\Models\Lancamento::ESTADO_PAGO_PARCIAL]);
                }
            }

            // Apagar imputações
            $pagamento->imputacoes()->delete();

            // Criar crédito
            $credito = \App\Domains\Facturacao\Models\CreditoFraccao::create([
                'empresa_gestora_id' => $pagamento->empresa_gestora_id,
                'condominio_id' => $pagamento->condominio_id,
                'fraccao_id' => $pagamento->fraccao_id,
                'condomino_id' => $pagamento->condomino_id,
                'valor' => $pagamento->valor,
                'valor_usado' => '0.00',
                'descricao' => 'Crédito de ' . $pagamento->referencia,
                'motivo' => $motivo,
                'pagamento_origem_id' => $pagamento->id,
                'created_by_user_id' => $admin->id,
            ]);

            // Anular movimento bancário associado (se existir)
            $this->anularMovimentoDoPagamento($pagamento, $admin, 'Convertido em crédito: ' . $motivo);

            // Marcar pagamento como devolvido (com nota explícita)
            $pagamento->update([
                'estado' => Pagamento::ESTADO_DEVOLVIDO,
                'rejeitado_em' => now(),
                'rejeitado_por_user_id' => $admin->id,
                'motivo_rejeicao' => 'Convertido em crédito #' . $credito->id . ': ' . $motivo,
            ]);

            return $credito;
        });
    }

    public function cancelarPagamento(Pagamento $pagamento, User $por): Pagamento
    {
        if (! $pagamento->podeSerEditado()) {
            throw new InvalidArgumentException('Pagamento não pode ser cancelado neste estado.');
        }

        $condomino = Condomino::where('user_id', $por->id)->first();
        if ($condomino && $pagamento->condomino_id !== $condomino->id) {
            throw new InvalidArgumentException('Não podes cancelar este pagamento.');
        }

        return DB::transaction(function () use ($pagamento) {
            DB::table('pagamento_imputacoes')
                ->where('pagamento_id', $pagamento->id)
                ->delete();

            $pagamento->delete(); // soft delete

            return $pagamento;
        });
    }

    /**
     * Anula o movimento bancário associado a um pagamento (se existir).
     * Marca como anulado (não apaga) + reverte saldo da conta.
     */
    private function anularMovimentoDoPagamento(Pagamento $pagamento, User $admin, string $motivo): void
    {
        if (! $pagamento->movimento_id) {
            return;
        }

        $movimento = \App\Domains\Financas\Models\ContaBancariaMovimento::find($pagamento->movimento_id);
        if (! $movimento || $movimento->anulado) {
            return;
        }

        $conta = \App\Domains\Financas\Models\ContaBancaria::lockForUpdate()->find($movimento->conta_bancaria_id);
        if ($conta) {
            $novoSaldo = bcsub((string) $conta->saldo_actual, (string) $movimento->valor, 2);
            $conta->update(['saldo_actual' => $novoSaldo]);
        }

        $movimento->update([
            'anulado' => true,
            'anulado_em' => now(),
            'anulado_por_user_id' => $admin->id,
            'motivo_anulacao' => mb_substr($motivo, 0, 300),
        ]);
    }
}
