<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Models\EscalaoCore;
use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Models\SubscricaoPeriodo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Calcular o preço mensal para uma empresa.
     * Usa: (1) preço customizado se definido, ou (2) escalão apropriado.
     *
     * Retorna array com detalhes do cálculo.
     */
    public function calcularPrecoMensal(EmpresaGestora $empresa): array
    {
        $subscricao = $empresa->subscricao;
        $numeroFraccoes = $this->contarFraccoesActivas($empresa);

        // 1. Se tem preço customizado (Enterprise negociado), usa esse
        if ($subscricao && $subscricao->preco_customizado_por_fraccao > 0) {
            $precoUnit = (float) $subscricao->preco_customizado_por_fraccao;

            return [
                'numero_fraccoes' => $numeroFraccoes,
                'preco_por_fraccao' => $precoUnit,
                'valor_mensal' => round($numeroFraccoes * $precoUnit, 2),
                'escalao' => null,
                'escalao_nome' => 'Customizado',
                'usa_customizado' => true,
            ];
        }

        // 2. Caso contrário, procurar escalão
        $escalao = EscalaoCore::paraFraccoes($numeroFraccoes);

        if (! $escalao) {
            Log::warning('Sem escalão para empresa', [
                'empresa_id' => $empresa->id,
                'numero_fraccoes' => $numeroFraccoes,
            ]);

            return [
                'numero_fraccoes' => $numeroFraccoes,
                'preco_por_fraccao' => 0,
                'valor_mensal' => 0,
                'escalao' => null,
                'escalao_nome' => null,
                'usa_customizado' => false,
            ];
        }

        return [
            'numero_fraccoes' => $numeroFraccoes,
            'preco_por_fraccao' => (float) $escalao->preco_por_fraccao_mensal,
            'valor_mensal' => $escalao->calcularValorMensal($numeroFraccoes),
            'escalao' => $escalao,
            'escalao_nome' => $escalao->nome,
            'usa_customizado' => false,
        ];
    }

    /**
     * Calcular preço anual com desconto.
     */
    public function calcularPrecoAnual(EmpresaGestora $empresa): array
    {
        $mensal = $this->calcularPrecoMensal($empresa);
        $subscricao = $empresa->subscricao;

        // Desconto: do escalão ou override da subscrição
        $desconto = 0;
        if ($subscricao && $subscricao->desconto_anual_pct > 0) {
            $desconto = (float) $subscricao->desconto_anual_pct;
        } elseif ($mensal['escalao']) {
            $desconto = (float) $mensal['escalao']->desconto_anual_pct;
        }

        $subtotal = $mensal['valor_mensal'] * 12;
        $descontoValor = round($subtotal * ($desconto / 100), 2);
        $total = round($subtotal - $descontoValor, 2);

        return array_merge($mensal, [
            'subtotal_12_meses' => $subtotal,
            'desconto_pct' => $desconto,
            'desconto_valor' => $descontoValor,
            'valor_anual' => $total,
        ]);
    }

    /**
     * Conta fracções activas da empresa.
     * Usa o modelo existente Condominio e suas relações.
     */
    public function contarFraccoesActivas(EmpresaGestora $empresa): int
    {
        return (int) DB::table('fraccoes')
            ->join('edificios', 'fraccoes.edificio_id', '=', 'edificios.id')
            ->join('condominios', 'edificios.condominio_id', '=', 'condominios.id')
            ->where('condominios.empresa_gestora_id', $empresa->id)
            ->whereNull('fraccoes.deleted_at')
            ->whereNull('edificios.deleted_at')
            ->whereNull('condominios.deleted_at')
            ->count();
    }

    /**
     * Renovar subscrição (cria novo período).
     * Chamado por RenovarSubscricoesJob no dia do aniversário.
     */
    public function renovar(Subscricao $subscricao): ?SubscricaoPeriodo
    {
        if (! $subscricao->activa() || ! $subscricao->renovacao_automatica) {
            return null;
        }

        if ($subscricao->cancelada()) {
            return null;
        }

        return DB::transaction(function () use ($subscricao) {
            $empresa = $subscricao->empresa;
            $ciclo = $subscricao->ciclo;

            // Recalcular preço com nº fracções actual
            $calculo = $ciclo === 'anual'
                ? $this->calcularPrecoAnual($empresa)
                : $this->calcularPrecoMensal($empresa);

            $agora = now();
            $inicio = $subscricao->periodo_actual_fim ?? $agora;
            $fim = $ciclo === 'anual'
                ? $inicio->copy()->addYear()
                : $inicio->copy()->addMonthNoOverflow();

            $valorTotal = $ciclo === 'anual'
                ? $calculo['valor_anual']
                : $calculo['valor_mensal'];

            $periodo = SubscricaoPeriodo::create([
                'subscricao_id' => $subscricao->id,
                'inicio_em' => $inicio,
                'fim_em' => $fim,
                'ciclo' => $ciclo,
                'fraccoes_cobradas' => $calculo['numero_fraccoes'],
                'preco_por_fraccao' => $calculo['preco_por_fraccao'],
                'subtotal' => $ciclo === 'anual' ? $calculo['subtotal_12_meses'] : $calculo['valor_mensal'],
                'desconto_pct' => $calculo['desconto_pct'] ?? 0,
                'desconto_valor' => $calculo['desconto_valor'] ?? 0,
                'valor_total' => $valorTotal,
                'escalao_nome' => $calculo['escalao_nome'],
                'estado' => 'pendente_pagamento',
            ]);

            $subscricao->update([
                'periodo_actual_inicio' => $inicio,
                'periodo_actual_fim' => $fim,
            ]);

            Log::info('Subscrição renovada - período criado', [
                'subscricao_id' => $subscricao->id,
                'periodo_id' => $periodo->id,
                'valor_total' => $valorTotal,
            ]);

            return $periodo;
        });
    }

    /**
     * Cancelar subscrição (mantém acesso até fim do período).
     */
    public function cancelar(Subscricao $subscricao, ?string $motivo = null): void
    {
        $subscricao->update([
            'estado' => 'cancelada',
            'cancelada_em' => now(),
            'cancela_no_fim_periodo' => $subscricao->periodo_actual_fim,
            'motivo_cancelamento' => $motivo,
            'renovacao_automatica' => false,
        ]);

        Log::info('Subscrição cancelada', [
            'subscricao_id' => $subscricao->id,
            'motivo' => $motivo,
        ]);
    }

    /**
     * Mudar ciclo (mensal ↔ anual).
     * Aplica no próximo período.
     */
    public function mudarCiclo(Subscricao $subscricao, string $novoCiclo): bool
    {
        if (! in_array($novoCiclo, ['mensal', 'anual'])) {
            return false;
        }

        if ($subscricao->ciclo === $novoCiclo) {
            return false;
        }

        $subscricao->update(['ciclo' => $novoCiclo]);

        Log::info('Ciclo alterado', [
            'subscricao_id' => $subscricao->id,
            'novo_ciclo' => $novoCiclo,
        ]);

        return true;
    }

    /**
     * Suspender subscrição (falta grave de pagamento).
     */
    public function suspender(Subscricao $subscricao, string $motivo): void
    {
        $subscricao->update([
            'estado' => 'suspensa',
            'motivo_cancelamento' => $motivo,
            'renovacao_automatica' => false,
        ]);

        Log::warning('Subscrição suspensa', [
            'subscricao_id' => $subscricao->id,
            'motivo' => $motivo,
        ]);
    }
}
