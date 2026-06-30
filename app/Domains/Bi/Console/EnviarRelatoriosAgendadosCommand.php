<?php

declare(strict_types=1);

namespace App\Domains\Bi\Console;

use App\Domains\Bi\Models\RelatorioAgendado;
use App\Domains\Bi\Services\RelatorioPersonalizadoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Envia por email os Relatórios Personalizados agendados que estão em dia de
 * envio (Fase 2 #3). Agendar diariamente no scheduler.
 */
class EnviarRelatoriosAgendadosCommand extends Command
{
    protected $signature = 'relatorios:enviar-agendados';

    protected $description = 'Envia por email os Relatórios Personalizados agendados em dia de envio.';

    public function handle(RelatorioPersonalizadoService $svc): int
    {
        $hoje = now();
        // O global scope de tenancy é no-op fora de um request (empresa_gestora_actual
        // não está bound), por isso isto devolve os agendamentos de todas as empresas.
        $agendados = RelatorioAgendado::where('ativo', true)->get();
        $enviados = 0;

        foreach ($agendados as $a) {
            if (! $a->deveEnviarHoje($hoje)) {
                continue;
            }
            $emails = $a->emails();
            if (empty($emails)) {
                continue;
            }

            try {
                $pdf = $svc->pdfBytes(
                    (int) $a->empresa_gestora_id,
                    $a->condominio_id ? (int) $a->condominio_id : null,
                    (int) $a->meses,
                    (array) $a->seccoes,
                    $a->titulo,
                );

                Mail::send('emails.relatorio-agendado', ['agendado' => $a], function ($m) use ($emails, $a, $pdf) {
                    $m->to($emails)
                        ->subject('Relatório ONDAKA · ' . $a->titulo)
                        ->attachData($pdf, 'relatorio.pdf', ['mime' => 'application/pdf']);
                });

                $a->update(['ultimo_envio_em' => $hoje]);
                $enviados++;
                $this->info("✓ Agendamento {$a->id} enviado para " . implode(', ', $emails));
            } catch (\Throwable $e) {
                Log::error('[RelatorioAgendado] ' . $a->id . ' falhou: ' . $e->getMessage());
                $this->error("✗ Agendamento {$a->id}: " . $e->getMessage());
            }
        }

        $this->info("Concluído: {$enviados} relatório(s) enviado(s).");

        return self::SUCCESS;
    }
}
