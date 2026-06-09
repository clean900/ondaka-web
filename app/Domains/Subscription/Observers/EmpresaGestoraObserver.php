<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Observers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Services\TrialService;
use Illuminate\Support\Facades\Log;

class EmpresaGestoraObserver
{
    public function __construct(
        protected TrialService $trialService,
    ) {}

    /**
     * Quando uma empresa é criada, automaticamente inicia trial de 30 dias.
     */
    public function created(EmpresaGestora $empresa): void
    {
        try {
            $subscricao = $this->trialService->iniciar($empresa);
            Log::info('Trial auto-criado via observer', [
                'empresa_id' => $empresa->id,
                'subscricao_id' => $subscricao->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Falha ao auto-criar trial', [
                'empresa_id' => $empresa->id,
                'erro' => $e->getMessage(),
            ]);
            // Não bloqueia a criação da empresa
        }
    }
}
