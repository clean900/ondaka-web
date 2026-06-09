<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\ContaBancariaMovimento;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Backfill de pagamentos confirmados antigos sem conta_bancaria_id.
 * Para cada um: atribui conta principal do condominio + cria movimento
 * de entrada retroactivo (data = data_pagamento) + recalcula saldo.
 *
 * Idempotente: salta pagamentos que ja tem movimento_id.
 * Uso: php artisan backfill:pagamentos [--dry-run]
 */
class BackfillPagamentosCommand extends Command
{
    protected $signature = 'backfill:pagamentos {--dry-run : Mostra o que faria sem gravar}';
    protected $description = 'Backfill: associa conta + cria movimentos retroactivos para pagamentos confirmados sem conta';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $userSistema = User::where('email', 'sistema@ondaka.ao')->first();
        if (! $userSistema) {
            $this->error('User sistema@ondaka.ao nao existe. Correr migration primeiro.');
            return self::FAILURE;
        }

        $pagamentos = DB::table('pagamentos_condomino')
            ->where('estado', 'confirmado')
            ->whereNull('deleted_at')
            ->whereNull('conta_bancaria_id')
            ->whereNull('movimento_id')
            ->orderBy('condominio_id')->orderBy('data_pagamento')->orderBy('id')
            ->get();

        $this->info('Pagamentos a processar: ' . $pagamentos->count() . ($dryRun ? ' [DRY-RUN]' : ''));
        $this->line(str_repeat('-', 70));

        $processados = 0; $saltados = 0; $totalPorConta = [];

        if (! $dryRun) {
            DB::beginTransaction();
        }

        try {
            foreach ($pagamentos as $p) {
                $conta = ContaBancaria::where('condominio_id', $p->condominio_id)
                    ->where('activa', true)->orderByDesc('principal');
                $conta = $dryRun ? $conta->first() : $conta->lockForUpdate()->first();

                if (! $conta) {
                    $this->warn("  SALTADO pag #{$p->id} (cond {$p->condominio_id}): sem conta activa");
                    $saltados++;
                    continue;
                }

                $saldoApos = bcadd((string) $conta->saldo_actual, (string) $p->valor, 2);

                if (! $dryRun) {
                    $movimento = ContaBancariaMovimento::create([
                        'conta_bancaria_id' => $conta->id,
                        'data' => $p->data_pagamento ?? $p->confirmado_em ?? now()->toDateString(),
                        'tipo' => 'entrada',
                        'descricao' => 'Pagamento ' . $p->referencia . ' — ' . ($p->metodo ?? '') . ' (backfill)',
                        'valor' => $p->valor,
                        'saldo_apos' => $saldoApos,
                        'origem_tipo' => 'pagamento_aprovado',
                        'origem_id' => $p->id,
                        'criado_por_user_id' => $userSistema->id,
                    ]);
                    $conta->update(['saldo_actual' => $saldoApos]);
                    DB::table('pagamentos_condomino')->where('id', $p->id)->update([
                        'conta_bancaria_id' => $conta->id,
                        'movimento_id' => $movimento->id,
                        'updated_at' => now(),
                    ]);
                }

                $totalPorConta[$conta->id] = bcadd($totalPorConta[$conta->id] ?? '0', (string) $p->valor, 2);
                $this->line("  OK pag #{$p->id} (cond {$p->condominio_id}) -> conta #{$conta->id} | +{$p->valor} | saldo={$saldoApos}");
                $processados++;
            }

            if (! $dryRun) {
                DB::commit();
            }
        } catch (\Throwable $e) {
            if (! $dryRun) {
                DB::rollBack();
            }
            $this->error('ERRO (rollback): ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->line(str_repeat('-', 70));
        $this->info("Processados: {$processados} | Saltados: {$saltados}" . ($dryRun ? ' [DRY-RUN — nada gravado]' : ''));

        foreach ($totalPorConta as $contaId => $soma) {
            $c = ContaBancaria::find($contaId);
            $this->line("  Conta #{$contaId} ({$c->nome}, cond {$c->condominio_id}): saldo = {$c->saldo_actual} (backfill +{$soma})");
        }

        return self::SUCCESS;
    }
}
