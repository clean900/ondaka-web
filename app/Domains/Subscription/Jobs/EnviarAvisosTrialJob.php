<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Jobs;

use App\Domains\Integracao\Sms\Services\SmsService;
use App\Domains\Subscription\Mail\TrialAvisoMail;
use App\Domains\Subscription\Models\AvisoSubscricao;
use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EnviarAvisosTrialJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;
    public int $tries = 3;

    public function handle(): void
    {
        Log::info('EnviarAvisosTrialJob: iniciado');

        $enviados = 0;

        // --- TRIAL ---
        $trialsAtivos = Subscricao::with('empresa')
            ->where('estado', 'trial')
            ->get();

        foreach ($trialsAtivos as $subscricao) {
            $dias = $subscricao->diasRestantesTrial();
            if ($dias === null) {
                continue;
            }

            $tipo = match (true) {
                $dias === 7 => 'trial_7_dias_restantes',
                $dias === 3 => 'trial_3_dias_restantes',
                $dias === 0 => 'trial_expira_hoje',
                default => null,
            };

            if ($tipo && $this->enviarAviso($subscricao, $tipo)) {
                $enviados++;
            }
        }

        // --- GRACE ---
        $emGrace = Subscricao::with('empresa')
            ->where('estado', 'grace')
            ->get();

        foreach ($emGrace as $subscricao) {
            $diasGrace = $subscricao->diasRestantesGrace();
            if ($diasGrace === null) {
                continue;
            }

            $diaGrace = 7 - $diasGrace;

            $tipo = match (true) {
                $diaGrace === 1 => 'grace_dia_1',
                $diaGrace === 3 => 'grace_dia_3',
                $diaGrace === 7 => 'grace_dia_7',
                default => null,
            };

            if ($tipo && $this->enviarAviso($subscricao, $tipo)) {
                $enviados++;
            }
        }

        Log::info('EnviarAvisosTrialJob: concluído', ['enviados' => $enviados]);
    }

    private function enviarAviso(Subscricao $subscricao, string $tipo): bool
    {
        $empresa = $subscricao->empresa;
        if (! $empresa) {
            return false;
        }

        if (AvisoSubscricao::jaEnviado($empresa->id, $tipo)) {
            return false;
        }

        $email = $empresa->email ?? null;
        if (! $email) {
            Log::warning('Empresa sem email, aviso ignorado', [
                'empresa_id' => $empresa->id,
                'tipo' => $tipo,
            ]);
            return false;
        }

        // Enviar email
        $avisoEmail = AvisoSubscricao::create([
            'empresa_gestora_id' => $empresa->id,
            'subscricao_id' => $subscricao->id,
            'tipo' => $tipo,
            'canal' => 'email',
            'destinatario' => $email,
            'estado' => 'pendente',
            'contexto' => [
                'estado_subscricao' => $subscricao->estado,
                'dias_restantes_trial' => $subscricao->diasRestantesTrial(),
                'dias_restantes_grace' => $subscricao->diasRestantesGrace(),
            ],
        ]);

        $sucesso = false;
        try {
            Mail::to($email)->send(new TrialAvisoMail($subscricao, $tipo));
            $avisoEmail->marcarEnviado();
            $sucesso = true;
        } catch (\Throwable $e) {
            $avisoEmail->marcarFalhou($e->getMessage());
            Log::error('Falha ao enviar aviso email', [
                'empresa_id' => $empresa->id,
                'tipo' => $tipo,
                'erro' => $e->getMessage(),
            ]);
        }

        // Enviar SMS em paralelo (se telefone disponível)
        $this->enviarSmsAviso($subscricao, $empresa, $tipo);

        return $sucesso;
    }

    /**
     * Envia aviso por SMS. Não falha o fluxo se SMS não conseguir.
     */
    private function enviarSmsAviso(Subscricao $subscricao, $empresa, string $tipo): void
    {
        $telefone = $empresa->telefone ?? null;
        if (! $telefone) {
            return;
        }

        // Evitar duplicados (por canal)
        $jaEnviadoSms = AvisoSubscricao::where('empresa_gestora_id', $empresa->id)
            ->where('tipo', $tipo)
            ->where('canal', 'sms')
            ->where('created_at', '>=', now()->subHours(20))
            ->where('estado', 'enviado')
            ->exists();

        if ($jaEnviadoSms) {
            return;
        }

        $mensagem = $this->mensagemSmsPorTipo($tipo, $subscricao);
        if (! $mensagem) {
            return;
        }

        $avisoSms = AvisoSubscricao::create([
            'empresa_gestora_id' => $empresa->id,
            'subscricao_id' => $subscricao->id,
            'tipo' => $tipo,
            'canal' => 'sms',
            'destinatario' => $telefone,
            'estado' => 'pendente',
            'contexto' => [
                'estado_subscricao' => $subscricao->estado,
            ],
        ]);

        try {
            app(SmsService::class)->enviarComFallback(
                $empresa,
                $telefone,
                $mensagem,
                [
                    'trigger' => $tipo,
                    'categoria' => 'sistema',
                ],
            );
            $avisoSms->marcarEnviado();
        } catch (\Throwable $e) {
            $avisoSms->marcarFalhou($e->getMessage());
            Log::warning('Falha ao enviar aviso SMS', [
                'empresa_id' => $empresa->id,
                'tipo' => $tipo,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    private function mensagemSmsPorTipo(string $tipo, Subscricao $subscricao): ?string
    {
        return match ($tipo) {
            'trial_7_dias_restantes' => 'ONDAKA: Faltam 7 dias para terminar o seu periodo de teste. Active a subscricao em ondaka.ao/subscricao',
            'trial_3_dias_restantes' => 'ONDAKA: Faltam 3 dias para terminar o teste. Active em ondaka.ao/subscricao para nao perder acesso.',
            'trial_expira_hoje' => 'ONDAKA: O seu teste termina hoje! Active a subscricao em ondaka.ao/subscricao.',
            'grace_dia_1' => 'ONDAKA: Subscricao expirada. Tem 7 dias para regularizar. ondaka.ao/subscricao',
            'grace_dia_3' => 'ONDAKA: Faltam 4 dias para suspensao total. Regularize em ondaka.ao/subscricao',
            'grace_dia_7' => 'ONDAKA: Ultimo dia para regularizar. Apos hoje o acesso sera suspenso.',
            default => null,
        };
    }
}
