<?php

namespace App\Console\Commands\Encomendas;

use App\Domains\Encomenda\Models\CondominioEncomendaConfig;
use App\Domains\Encomenda\Models\Encomenda;
use Illuminate\Console\Command;

class AvisoCincoDias extends Command
{
    protected $signature = 'encomendas:aviso-5-dias';

    protected $description = 'Envia aviso ao residente quando uma encomenda atinge o limite de dias na portaria (configurável por condomínio).';

    public function handle(): int
    {
        $this->info('Verificando encomendas que precisam de aviso...');

        // Buscar todas as encomendas que estão na portaria sem aviso enviado
        $encomendas = Encomenda::query()
            ->where('estado', Encomenda::ESTADO_AGUARDA_LEVANTAMENTO)
            ->whereNull('aviso_5_dias_em')
            ->whereNotNull('chegou_em')
            ->with('condomino:id,user_id,nome_completo')
            ->get();

        if ($encomendas->isEmpty()) {
            $this->info('Nenhuma encomenda candidata.');
            return self::SUCCESS;
        }

        // Agrupar por condomínio para usar a config certa
        $porCondominio = $encomendas->groupBy('condominio_id');

        $totalAvisadas = 0;

        foreach ($porCondominio as $condominioId => $lista) {
            $config = CondominioEncomendaConfig::paraCondominio($condominioId);

            foreach ($lista as $encomenda) {
                if (! $encomenda->precisaAvisoCincoDias($config->dias_aviso, $config->dias_multa)) {
                    continue;
                }

                $encomenda->update(['aviso_5_dias_em' => now()]);
                $totalAvisadas++;

                $this->line("  ✓ Encomenda #{$encomenda->id} ({$encomenda->condomino?->nome_completo}) — avisada");

                // TODO: enviar push notification
                // app(NotificationService::class)->avisoEncomendaPendente($encomenda);
            }
        }

        $this->info("Total avisadas: $totalAvisadas");

        return self::SUCCESS;
    }
}
