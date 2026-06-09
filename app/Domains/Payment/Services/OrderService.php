<?php

declare(strict_types=1);

namespace App\Domains\Payment\Services;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Feature\Models\FeatureSubscription;
use App\Domains\Payment\Models\OrdemCompra;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Prazo de pagamento (dias) após criar ordem.
     */
    public const PRAZO_PAGAMENTO_DIAS = 7;

    /**
     * Taxa de IVA em Angola (DP 141/15).
     */
    public const TAXA_IVA = 6.5; // IPC Angola (6.5% para servicos digitais)

    /**
     * Criar uma ordem para compra de pacote consumível.
     * Ex: Pacote Médio SMS Sender ID para empresa.
     */
    public function criarOrdemPacote(
        Model $owner,
        FeaturePacote $pacote,
        ?int $userId = null,
        ?string $notasCliente = null,
    ): OrdemCompra {
        $pacote->loadMissing('feature');
        $feature = $pacote->feature;

        if (! $feature) {
            throw new \RuntimeException('Pacote sem feature associada.');
        }

        // Se é primeira activação desta feature para este owner, inclui activação
        $primeira = ! FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->getKey())
            ->exists();

        $valorBase = (float) $pacote->preco;
        $valorActivacao = $primeira ? (float) $feature->preco_activacao : 0.0;
        $subtotal = $valorBase + $valorActivacao;
        $iva = round($subtotal * (self::TAXA_IVA / 100), 2);
        $total = round($subtotal + $iva, 2);

        return DB::transaction(function () use (
            $owner, $feature, $pacote, $valorBase, $valorActivacao, $iva, $total, $userId, $notasCliente,
        ) {
            return OrdemCompra::create([
                'numero' => $this->gerarNumero(),
                'owner_type' => get_class($owner),
                'owner_id' => $owner->getKey(),
                'tipo_item' => 'pacote_consumivel',
                'feature_id' => $feature->id,
                'pacote_id' => $pacote->id,
                'descricao_item' => $feature->nome . ' — ' . $pacote->nome . ' (' . $pacote->quantidade . ' ' . $feature->unidade . ')',
                'valor_base' => $valorBase,
                'valor_activacao' => $valorActivacao,
                'valor_iva' => $iva,
                'valor_total' => $total,
                'estado' => 'pendente',
                'prazo_pagamento' => Carbon::now()->addDays(self::PRAZO_PAGAMENTO_DIAS),
                'notas_cliente' => $notasCliente,
                'criada_por_user_id' => $userId,
            ]);
        });
    }

    /**
     * Criar ordem para subscrição mensal (ex: White Label 3 meses).
     */
    public function criarOrdemSubscricao(
        Model $owner,
        Feature $feature,
        int $meses = 1,
        ?int $userId = null,
        ?string $notasCliente = null,
    ): OrdemCompra {
        if ($feature->modelo_cobranca !== 'subscription') {
            throw new \RuntimeException('Esta feature não é de subscrição.');
        }

        $meses = max(1, $meses);

        // Se é primeira activação, inclui activação
        $primeira = ! FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', get_class($owner))
            ->where('owner_id', $owner->getKey())
            ->exists();

        $valorBase = (float) $feature->preco_base * $meses;
        $valorActivacao = $primeira ? (float) $feature->preco_activacao : 0.0;
        $subtotal = $valorBase + $valorActivacao;
        $iva = round($subtotal * (self::TAXA_IVA / 100), 2);
        $total = round($subtotal + $iva, 2);

        return DB::transaction(function () use (
            $owner, $feature, $meses, $valorBase, $valorActivacao, $iva, $total, $userId, $notasCliente,
        ) {
            return OrdemCompra::create([
                'numero' => $this->gerarNumero(),
                'owner_type' => get_class($owner),
                'owner_id' => $owner->getKey(),
                'tipo_item' => 'feature',
                'feature_id' => $feature->id,
                'meses_contratados' => $meses,
                'descricao_item' => $feature->nome . ' — Subscrição ' . $meses . ' ' . ($meses === 1 ? 'mês' : 'meses'),
                'valor_base' => $valorBase,
                'valor_activacao' => $valorActivacao,
                'valor_iva' => $iva,
                'valor_total' => $total,
                'estado' => 'pendente',
                'prazo_pagamento' => Carbon::now()->addDays(self::PRAZO_PAGAMENTO_DIAS),
                'notas_cliente' => $notasCliente,
                'criada_por_user_id' => $userId,
            ]);
        });
    }

    /**
     * Aprovar ordem — activa a feature automaticamente.
     * Chamado pelo super-admin depois de validar o pagamento.
     */
    public function aprovar(
        OrdemCompra $ordem,
        int $adminUserId,
        ?string $notasAdmin = null,
    ): OrdemCompra {
        if (in_array($ordem->estado, ['aprovada', 'rejeitada', 'cancelada'])) {
            throw new \RuntimeException("Ordem já está em estado final: {$ordem->estado}");
        }

        return DB::transaction(function () use ($ordem, $adminUserId, $notasAdmin) {
            $sub = $this->activarFeatureSubscription($ordem, $adminUserId);

            $ordem->update([
                'estado' => 'aprovada',
                'aprovada_em' => now(),
                'aprovada_por_user_id' => $adminUserId,
                'feature_subscription_id' => $sub->id,
                'notas_admin' => $notasAdmin,
            ]);

            $ordemFresh = $ordem->fresh();

            // Emitir factura automaticamente
            try {
                app(\App\Domains\Payment\Services\FacturaService::class)->emitir($ordemFresh, $adminUserId);
            } catch (\Throwable $e) {
                \Log::warning("Falha ao emitir factura para ordem {$ordemFresh->numero}: ".$e->getMessage());
            }

            // Enviar SMS ao cliente (se tem telefone)
            try {
                $this->enviarSmsOrdemAprovada($ordemFresh);
            } catch (\Throwable $e) {
                \Log::warning("Falha ao enviar SMS ordem aprovada {$ordemFresh->numero}: ".$e->getMessage());
            }

            return $ordemFresh;
        });
    }

    /**
     * Envia SMS ao dono da ordem quando aprovada.
     * Não falha o fluxo se SMS não conseguir.
     */
    private function enviarSmsOrdemAprovada(OrdemCompra $ordem): void
    {
        $ordem->loadMissing('owner');
        $owner = $ordem->owner;
        if (! $owner) return;

        $telefone = $owner->telefone ?? null;
        if (! $telefone) return;

        $mensagem = "ONDAKA: Ordem {$ordem->numero} aprovada. Funcionalidade activada na sua conta. ondaka.ao";

        $smsService = app(\App\Domains\Integracao\Sms\Services\SmsService::class);

        if ($owner instanceof \Illuminate\Database\Eloquent\Model) {
            $smsService->enviarComFallback(
                $owner,
                $telefone,
                $mensagem,
                [
                    'trigger' => 'ordem_aprovada',
                    'categoria' => 'notificacao',
                    'ordem_compra_id' => $ordem->id,
                ],
            );
        }
    }

    /**
     * Rejeitar ordem.
     */
    public function rejeitar(
        OrdemCompra $ordem,
        int $adminUserId,
        string $motivo,
    ): OrdemCompra {
        if (in_array($ordem->estado, ['aprovada', 'cancelada'])) {
            throw new \RuntimeException("Ordem não pode ser rejeitada no estado: {$ordem->estado}");
        }

        $ordem->update([
            'estado' => 'rejeitada',
            'rejeitada_em' => now(),
            'aprovada_por_user_id' => $adminUserId,
            'motivo_rejeicao' => $motivo,
        ]);

        return $ordem->fresh();
    }

    /**
     * Cancelar ordem (pelo cliente ou super-admin).
     */
    public function cancelar(OrdemCompra $ordem, ?string $motivo = null): OrdemCompra
    {
        if (! $ordem->podeSerCancelada()) {
            throw new \RuntimeException("Ordem não pode ser cancelada no estado: {$ordem->estado}");
        }

        $ordem->update([
            'estado' => 'cancelada',
            'cancelada_em' => now(),
            'notas_admin' => $motivo ? trim(($ordem->notas_admin ?? '') . "\n[Cancelamento] " . $motivo) : $ordem->notas_admin,
        ]);

        return $ordem->fresh();
    }

    /**
     * Marcar em revisão (cliente submeteu comprovativo).
     */
    public function marcarEmRevisao(OrdemCompra $ordem): OrdemCompra
    {
        if ($ordem->estado === 'pendente') {
            $ordem->update(['estado' => 'em_revisao']);
        }
        return $ordem->fresh();
    }

    /**
     * Expirar ordens que passaram do prazo de pagamento.
     * Chamado por job diário.
     */
    public function expirarOrdens(): int
    {
        $ordens = OrdemCompra::whereIn('estado', ['pendente', 'em_revisao'])
            ->where('prazo_pagamento', '<', now())
            ->get();

        $count = 0;
        foreach ($ordens as $o) {
            $o->update(['estado' => 'expirada']);
            $count++;
        }

        return $count;
    }

    /* ============================================
       PRIVADOS
       ============================================ */

    /**
     * Cria ou actualiza FeatureSubscription depois de aprovada ordem.
     */
    private function activarFeatureSubscription(OrdemCompra $ordem, int $userId): FeatureSubscription
    {
        $feature = $ordem->feature;
        if (! $feature) {
            throw new \RuntimeException('Ordem sem feature associada.');
        }

        // Já existe subscription para este owner?
        $existente = FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', $ordem->owner_type)
            ->where('owner_id', $ordem->owner_id)
            ->whereIn('estado', ['activa', 'pendente', 'esgotada', 'expirada'])
            ->first();

        return match ($ordem->tipo_item) {
            'pacote_consumivel' => $this->activarConsumivel($ordem, $existente, $userId),
            'feature' => $this->activarSubscricaoFeature($ordem, $existente, $userId),
            default => throw new \RuntimeException("Tipo de item não suportado: {$ordem->tipo_item}"),
        };
    }

    private function activarConsumivel(
        OrdemCompra $ordem,
        ?FeatureSubscription $existente,
        int $userId,
    ): FeatureSubscription {
        $pacote = $ordem->pacote;
        if (! $pacote) {
            throw new \RuntimeException('Ordem de pacote sem pacote associado.');
        }

        $quantidade = (int) $pacote->quantidade;
        $valorPago = (float) $ordem->valor_total;

        if ($existente) {
            $existente->adicionarSaldo($quantidade, $valorPago);
            return $existente->fresh();
        }

        return FeatureSubscription::create([
            'feature_id' => $ordem->feature_id,
            'owner_type' => $ordem->owner_type,
            'owner_id' => $ordem->owner_id,
            'estado' => 'activa',
            'activada_em' => now(),
            'saldo_inicial' => $quantidade,
            'saldo_actual' => $quantidade,
            'saldo_utilizado' => 0,
            'valor_pago_total' => $valorPago,
            'activada_por_user_id' => $userId,
            'notas_admin' => 'Activada via ordem '.$ordem->numero,
        ]);
    }

    private function activarSubscricaoFeature(
        OrdemCompra $ordem,
        ?FeatureSubscription $existente,
        int $userId,
    ): FeatureSubscription {
        $meses = (int) ($ordem->meses_contratados ?? 1);
        $valor = (float) $ordem->valor_total;

        if ($existente) {
            // Estender expiração a partir de agora ou da data actual de expira_em
            $baseData = $existente->expira_em && $existente->expira_em->isFuture()
                ? $existente->expira_em
                : now();
            $existente->update([
                'estado' => 'activa',
                'activada_em' => $existente->activada_em ?? now(),
                'expira_em' => $baseData->copy()->addMonths($meses),
                'valor_pago_total' => (float) $existente->valor_pago_total + $valor,
                'activada_por_user_id' => $userId,
            ]);
            return $existente->fresh();
        }

        return FeatureSubscription::create([
            'feature_id' => $ordem->feature_id,
            'owner_type' => $ordem->owner_type,
            'owner_id' => $ordem->owner_id,
            'estado' => 'activa',
            'activada_em' => now(),
            'expira_em' => now()->addMonths($meses),
            'renovacao_automatica' => true,
            'valor_pago_total' => (float) $ordem->valor_total,
            'activada_por_user_id' => $userId,
            'notas_admin' => 'Activada via ordem '.$ordem->numero,
        ]);
    }

    /**
     * Gera número único de ordem: ORD-2026-000001
     */
    private function gerarNumero(): string
    {
        $ano = now()->year;
        $ultimo = OrdemCompra::where('numero', 'LIKE', "ORD-{$ano}-%")
            ->orderByDesc('id')
            ->value('numero');

        $seq = 1;
        if ($ultimo && preg_match('/-(\d+)$/', $ultimo, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return sprintf('ORD-%d-%06d', $ano, $seq);
    }
}
