<?php

namespace App\Console\Commands;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Notifications\Services\FcmSenderService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AvisarTaxasVencimento extends Command
{
    protected $signature = 'taxas:avisar-vencimento
                            {--dias-antes=3 : Dias antes do vencimento para o aviso "a vencer"}
                            {--dry-run : Apenas mostrar, sem enviar}';

    protected $description = 'Avisa condóminos de taxas a vencer (em N dias) e vencidas (há 1 dia). Corre diariamente.';

    public function handle(): int
    {
        $diasAntes = (int) $this->option('dias-antes');
        $dryRun = (bool) $this->option('dry-run');

        $hoje = now()->startOfDay();
        $dataVencer = $hoje->copy()->addDays($diasAntes)->toDateString();   // vence daqui a N dias
        $dataVencida = $hoje->copy()->subDay()->toDateString();              // venceu ontem

        $emDivida = [Quota::ESTADO_ABERTA, Quota::ESTADO_PAGA_PARCIAL];

        // 1) A VENCER (vence exatamente daqui a N dias)
        $aVencer = Quota::whereIn('estado', $emDivida)
            ->whereDate('data_vencimento', $dataVencer)
            ->get();

        // 2) VENCIDAS (venceu ontem)
        $vencidas = Quota::whereIn('estado', $emDivida)
            ->whereDate('data_vencimento', $dataVencida)
            ->get();

        $this->info("=== Avisos de taxas ===");
        $this->info("A vencer ({$dataVencer}): {$aVencer->count()} | Vencidas ({$dataVencida}): {$vencidas->count()}");

        $enviados = 0;
        foreach ($aVencer as $q) {
            if ($this->notificar($q, true, $dryRun)) $enviados++;
        }
        foreach ($vencidas as $q) {
            if ($this->notificar($q, false, $dryRun)) $enviados++;
        }

        $this->info($dryRun ? "DRY-RUN: {$enviados} avisos seriam enviados." : "{$enviados} avisos enviados.");
        return self::SUCCESS;
    }

    private function notificar(Quota $quota, bool $aVencer, bool $dryRun): bool
    {
        try {
            $contrato = ContratoOcupacao::query()
                ->where('fraccao_id', $quota->fraccao_id)
                ->where('estado', 'activo')
                ->orderByRaw("CASE WHEN tipo = 'proprietario' THEN 0 ELSE 1 END")
                ->orderBy('created_at')
                ->first();
            if (! $contrato) return false;

            $condomino = Condomino::find($contrato->condomino_id);
            $user = $condomino?->user;
            if (! $user) return false;

            $valor = number_format((float) $quota->valorEmDivida(), 0, ',', '.') . ' Kz';
            $venc = Carbon::parse($quota->data_vencimento)->format('d/m/Y');
            $periodo = sprintf('%02d/%d', (int) $quota->mes, (int) $quota->ano);

            if ($aVencer) {
                $titulo = '💰 Taxa a vencer';
                $descricao = "A sua taxa de condomínio referente a {$periodo} ({$valor}) vence a {$venc}.";
            } else {
                $titulo = '⚠️ Taxa vencida';
                $descricao = "A sua taxa de condomínio referente a {$periodo} ({$valor}) está vencida desde {$venc}. Regularize assim que possível.";
            }

            if ($dryRun) {
                $this->line("  -> user {$user->id} | {$titulo} | {$descricao}");
                return true;
            }

            // Sino
            try {
                $user->notify(new \App\Domains\Facturacao\Notifications\TaxaVencimentoNotification($quota->id, $aVencer, $titulo, $descricao));
            } catch (\Throwable $e) {
                Log::warning("[Taxa] Sino falhou user {$user->id}: " . $e->getMessage());
            }

            // Push
            try {
                app(FcmSenderService::class)->enviarParaUser(
                    $user, $titulo, $descricao,
                    ['quota_id' => (string) $quota->id, 'tipo' => $aVencer ? 'taxa_a_vencer' : 'taxa_vencida']
                );
            } catch (\Throwable $e) {
                Log::warning("[Taxa] Push falhou user {$user->id}: " . $e->getMessage());
            }

            // Email
            if ($user->email) {
                try {
                    $cond = $quota->condominio ?? null;
                    $dados = [
                        'assunto' => ($aVencer ? 'Taxa a vencer' : 'Taxa vencida') . ' · ONDAKA',
                        'titulo' => $aVencer ? 'Taxa a vencer' : 'Taxa vencida',
                        'corpo' => $descricao,
                        'condominioNome' => $cond ? 'Condomínio ' . $cond->nome : null,
                        'empresaNome' => $cond && $cond->empresaGestora ? $cond->empresaGestora->nome : null,
                        'saudacao' => 'Caro(a) ' . $user->name . ',',
                        'badge' => $aVencer ? '💰 Taxa' : '⚠️ Taxa',
                    ];
                    Mail::send('emails.notificacao', $dados, function ($m) use ($user, $aVencer) {
                        $m->to($user->email, $user->name)->subject(($aVencer ? 'Taxa a vencer' : 'Taxa vencida') . ' · ONDAKA');
                    });
                } catch (\Throwable $e) {
                    Log::warning("[Taxa] Email falhou {$user->email}: " . $e->getMessage());
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::error("[Taxa] notificar falhou quota {$quota->id}: " . $e->getMessage());
            return false;
        }
    }
}
