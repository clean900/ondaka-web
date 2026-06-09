<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Jobs;

use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Services\SubscriptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RenovarSubscricoesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;
    public int $tries = 3;

    public function handle(SubscriptionService $subscriptionService): void
    {
        Log::info('RenovarSubscricoesJob: iniciado');

        $agora = now();
        $hoje = $agora->day;

        // Subscrições cujo período actual terminou OU termina hoje
        // E que têm renovação automática activa
        $paraRenovar = Subscricao::where('estado', 'activa')
            ->where('renovacao_automatica', true)
            ->where(function ($q) use ($agora) {
                $q->whereNull('periodo_actual_fim')
                    ->orWhere('periodo_actual_fim', '<=', $agora);
            })
            ->get();

        $renovadas = 0;
        $falhas = 0;

        foreach ($paraRenovar as $subscricao) {
            try {
                $periodo = $subscriptionService->renovar($subscricao);
                if ($periodo) {
                    $renovadas++;
                    Log::info('Subscrição renovada', [
                        'subscricao_id' => $subscricao->id,
                        'periodo_id' => $periodo->id,
                    ]);
                }
            } catch (\Throwable $e) {
                $falhas++;
                Log::error('Falha ao renovar subscrição', [
                    'subscricao_id' => $subscricao->id,
                    'erro' => $e->getMessage(),
                ]);
            }
        }

        Log::info('RenovarSubscricoesJob: concluído', [
            'renovadas' => $renovadas,
            'falhas' => $falhas,
        ]);
    }
}
