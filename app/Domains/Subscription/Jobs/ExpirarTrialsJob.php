<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Jobs;

use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Services\TrialService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpirarTrialsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries = 3;

    public function handle(TrialService $trialService): void
    {
        Log::info('ExpirarTrialsJob: iniciado');

        // 1. Trial -> Grace (trials expirados)
        $paraGrace = Subscricao::where('estado', 'trial')
            ->where('trial_expira_em', '<=', now())
            ->get();

        $transicoesGrace = 0;
        foreach ($paraGrace as $subscricao) {
            if ($trialService->transitarParaGrace($subscricao)) {
                $transicoesGrace++;
            }
        }

        // 2. Grace -> Suspensa (grace period expirado sem conversão)
        $paraSuspender = Subscricao::where('estado', 'grace')
            ->where('grace_expira_em', '<=', now())
            ->get();

        $suspensas = 0;
        foreach ($paraSuspender as $subscricao) {
            if ($trialService->suspender($subscricao)) {
                $suspensas++;
            }
        }

        Log::info('ExpirarTrialsJob: concluído', [
            'transicoes_grace' => $transicoesGrace,
            'suspensas' => $suspensas,
        ]);
    }
}
