<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Models\SubscricaoPeriodo;
use App\Domains\Subscription\Models\ConfiguracaoCobranca;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrialService
{
    public const TRIAL_DIAS = 30;
    public const GRACE_DIAS = 7;

    /**
     * Cria uma subscrição em trial para uma empresa.
     * Chamado no onboarding / criação de empresa.
     */
    public function iniciar(EmpresaGestora $empresa): Subscricao
    {
        // Já tem subscrição?
        $existente = Subscricao::where('empresa_gestora_id', $empresa->id)->first();
        if ($existente) {
            return $existente;
        }

        return DB::transaction(function () use ($empresa) {
            $agora = now();
            $trialFim = $agora->copy()->addDays(self::TRIAL_DIAS);
            $graceFim = $trialFim->copy()->addDays(self::GRACE_DIAS);

            $subscricao = Subscricao::create([
                'empresa_gestora_id' => $empresa->id,
                'estado' => 'trial',
                'ciclo' => 'mensal',
                'dia_aniversario' => $agora->day <= 28 ? $agora->day : 28,
                'trial_inicia_em' => $agora,
                'trial_expira_em' => $trialFim,
                'grace_expira_em' => $graceFim,
                'renovacao_automatica' => true,
            ]);

            // Criar configuração de cobrança default
            ConfiguracaoCobranca::paraEmpresa($empresa->id);

            Log::info('Trial iniciado', [
                'empresa_id' => $empresa->id,
                'expira_em' => $trialFim->toDateTimeString(),
            ]);

            return $subscricao;
        });
    }

    /**
     * Trial → grace quando trial expira.
     * Chamado por job diário.
     */
    public function transitarParaGrace(Subscricao $subscricao): bool
    {
        if (! $subscricao->emTrial()) {
            return false;
        }

        if (! $subscricao->trial_expira_em || $subscricao->trial_expira_em->isFuture()) {
            return false;
        }

        $subscricao->update(['estado' => 'grace']);

        Log::info('Subscrição transitou para grace', [
            'subscricao_id' => $subscricao->id,
            'empresa_id' => $subscricao->empresa_gestora_id,
        ]);

        return true;
    }

    /**
     * Grace → suspensa quando grace expira sem conversão.
     */
    public function suspender(Subscricao $subscricao): bool
    {
        if (! $subscricao->emGrace()) {
            return false;
        }

        if (! $subscricao->grace_expira_em || $subscricao->grace_expira_em->isFuture()) {
            return false;
        }

        $subscricao->update([
            'estado' => 'suspensa',
            'renovacao_automatica' => false,
        ]);

        Log::warning('Subscrição suspensa (grace expirou)', [
            'subscricao_id' => $subscricao->id,
            'empresa_id' => $subscricao->empresa_gestora_id,
        ]);

        return true;
    }

    /**
     * Converter trial → activa (cliente paga o primeiro período).
     * Retorna o primeiro SubscricaoPeriodo criado.
     */
    public function converter(
        Subscricao $subscricao,
        int $numeroFraccoes,
        float $precoPorFraccao,
        string $ciclo = 'mensal',
        float $descontoPct = 0,
        ?string $escalaoNome = null,
    ): SubscricaoPeriodo {
        return DB::transaction(function () use ($subscricao, $numeroFraccoes, $precoPorFraccao, $ciclo, $descontoPct, $escalaoNome) {
            $agora = now();

            // Calcular fim do período
            $fimPeriodo = $ciclo === 'anual'
                ? $agora->copy()->addYear()
                : $agora->copy()->addMonthNoOverflow();

            // Calcular valores
            $meses = $ciclo === 'anual' ? 12 : 1;
            $subtotal = $numeroFraccoes * $precoPorFraccao * $meses;
            $descontoValor = $subtotal * ($descontoPct / 100);
            $valorTotal = $subtotal - $descontoValor;

            // Criar período
            $periodo = SubscricaoPeriodo::create([
                'subscricao_id' => $subscricao->id,
                'inicio_em' => $agora,
                'fim_em' => $fimPeriodo,
                'ciclo' => $ciclo,
                'fraccoes_cobradas' => $numeroFraccoes,
                'preco_por_fraccao' => $precoPorFraccao,
                'subtotal' => $subtotal,
                'desconto_pct' => $descontoPct,
                'desconto_valor' => $descontoValor,
                'valor_total' => $valorTotal,
                'escalao_nome' => $escalaoNome,
                'estado' => 'pendente_pagamento',
            ]);

            // Actualizar subscrição
            $subscricao->update([
                'estado' => 'activa',
                'ciclo' => $ciclo,
                'activa_desde' => $agora,
                'periodo_actual_inicio' => $agora,
                'periodo_actual_fim' => $fimPeriodo,
                'desconto_anual_pct' => $ciclo === 'anual' ? $descontoPct : 0,
                'converteu_do_trial' => true,
            ]);

            Log::info('Trial convertido para activa', [
                'subscricao_id' => $subscricao->id,
                'ciclo' => $ciclo,
                'valor_total' => $valorTotal,
            ]);

            return $periodo;
        });
    }

    /**
     * Marcar período como pago (quando confirmado o pagamento).
     */
    public function confirmarPagamento(SubscricaoPeriodo $periodo): void
    {
        $periodo->update([
            'estado' => 'pago',
            'pago_em' => now(),
        ]);
    }

    /**
     * Reactivar uma subscrição suspensa (cliente voltou a pagar).
     */
    public function reactivar(Subscricao $subscricao): bool
    {
        if (! $subscricao->suspensa()) {
            return false;
        }

        $subscricao->update([
            'estado' => 'activa',
            'renovacao_automatica' => true,
        ]);

        Log::info('Subscrição reactivada', ['subscricao_id' => $subscricao->id]);

        return true;
    }

    /**
     * Estende manualmente o trial (operação de super-admin).
     */
    public function estenderTrial(Subscricao $subscricao, int $diasExtra): bool
    {
        if (! in_array($subscricao->estado, ['trial', 'grace'])) {
            return false;
        }

        $novoTrialFim = $subscricao->trial_expira_em
            ? $subscricao->trial_expira_em->copy()->addDays($diasExtra)
            : now()->addDays($diasExtra);

        $novoGraceFim = $novoTrialFim->copy()->addDays(self::GRACE_DIAS);

        $subscricao->update([
            'estado' => 'trial',
            'trial_expira_em' => $novoTrialFim,
            'grace_expira_em' => $novoGraceFim,
        ]);

        Log::info('Trial estendido', [
            'subscricao_id' => $subscricao->id,
            'dias_extra' => $diasExtra,
            'novo_fim' => $novoTrialFim->toDateTimeString(),
        ]);

        return true;
    }
}
