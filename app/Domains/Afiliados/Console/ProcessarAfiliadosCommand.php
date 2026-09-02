<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Console;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Notifications\ComissoesAPagarSuperAdminNotification;
use App\Domains\Afiliados\Services\AfiliadoComissaoService;
use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Tarefa diária do programa de afiliados:
 *  1. comissões cuja carência terminou → aprovadas
 *  2. recalcular nível/taxa de todos os afiliados activos
 *  3. (dia 1 de cada mês, ou --resumo) avisar super-admins das comissões a pagar
 */
class ProcessarAfiliadosCommand extends Command
{
    protected $signature = 'afiliados:processar {--resumo : Envia já o resumo de comissões a pagar aos super-admins}';

    protected $description = 'Aprova comissões vencidas, recalcula níveis e envia o resumo mensal de comissões a pagar';

    public function handle(
        AfiliadoComissaoService $comissoes,
        AfiliadoService $afiliados,
        AfiliadoConfigService $config,
    ): int {
        $aprovadas = $comissoes->aprovarVencidas();
        $this->info("Comissões aprovadas (carência terminada): {$aprovadas}");

        $n = 0;
        Afiliado::where('estado', Afiliado::ESTADO_ACTIVO)->orderBy('id')->chunkById(100, function ($lote) use ($afiliados, &$n) {
            foreach ($lote as $af) {
                $afiliados->recalcularNivel($af);
                $n++;
            }
        });
        $this->info("Níveis recalculados: {$n}");

        if ($this->option('resumo') || now()->day === 1) {
            $this->enviarResumo($config);
        }

        Log::info('afiliados:processar concluído', ['aprovadas' => $aprovadas, 'recalculados' => $n]);

        return self::SUCCESS;
    }

    protected function enviarResumo(AfiliadoConfigService $config): void
    {
        $minimo = $config->decimal('afiliado_pagamento_minimo_kz');
        $rows = AfiliadoComissao::where('estado', AfiliadoComissao::ESTADO_APROVADA)
            ->selectRaw('afiliado_id, COUNT(*) as n, SUM(valor_comissao_kz) as total')
            ->groupBy('afiliado_id')
            ->havingRaw('SUM(valor_comissao_kz) >= ?', [$minimo])
            ->get();

        if ($rows->isEmpty()) {
            $this->info('Resumo: nenhum afiliado atingiu o mínimo de pagamento.');

            return;
        }

        $afs = Afiliado::whereIn('id', $rows->pluck('afiliado_id'))->get()->keyBy('id');
        $linhas = [];
        $total = '0.00';
        foreach ($rows as $r) {
            $af = $afs[$r->afiliado_id] ?? null;
            if (! $af) {
                continue;
            }
            $t = bcadd((string) $r->total, '0', 2);
            $total = bcadd($total, $t, 2);
            $linhas[] = ['nome' => $af->nome, 'codigo' => $af->codigo, 'total_kz' => $t, 'n' => (int) $r->n, 'iban' => $af->iban];
        }

        try {
            foreach (User::role('super-admin')->get() as $sa) {
                $sa->notify(new ComissoesAPagarSuperAdminNotification($linhas, $total));
            }
            $this->info('Resumo enviado: '.count($linhas).' afiliado(s), total '.$total.' Kz.');
        } catch (\Throwable $e) {
            Log::error('afiliados:processar — resumo falhou: '.$e->getMessage());
            $this->error('Falha ao enviar resumo: '.$e->getMessage());
        }
    }
}
