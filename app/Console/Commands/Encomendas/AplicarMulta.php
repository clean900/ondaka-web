<?php

namespace App\Console\Commands\Encomendas;

use App\Domains\Encomenda\Models\CondominioEncomendaConfig;
use App\Domains\Encomenda\Models\Encomenda;
use Illuminate\Console\Command;

class AplicarMulta extends Command
{
    protected $signature = 'encomendas:aplicar-multa';

    protected $description = 'Aplica multa automática a encomendas que ultrapassaram os dias permitidos na portaria. Encomenda passa para a administração.';

    public function handle(): int
    {
        $this->info('Verificando encomendas que precisam de multa...');

        // Encomendas que estão na portaria há tempo demais
        $encomendas = Encomenda::query()
            ->where('estado', Encomenda::ESTADO_AGUARDA_LEVANTAMENTO)
            ->whereNotNull('chegou_em')
            ->with('condomino:id,user_id,nome_completo')
            ->get();

        if ($encomendas->isEmpty()) {
            $this->info('Nenhuma encomenda candidata.');
            return self::SUCCESS;
        }

        $porCondominio = $encomendas->groupBy('condominio_id');

        $totalMultadas = 0;

        foreach ($porCondominio as $condominioId => $lista) {
            $config = CondominioEncomendaConfig::paraCondominio($condominioId);

            foreach ($lista as $encomenda) {
                if (! $encomenda->precisaAplicarMulta($config->dias_multa)) {
                    continue;
                }

                $encomenda->update([
                    'estado' => Encomenda::ESTADO_MULTA_APLICADA,
                    'local_atual' => Encomenda::LOCAL_ADMINISTRACAO,
                    'multa_aplicada_em' => now(),
                    'multa_valor_kz' => $config->multa_valor_padrao_kz,
                    'multa_estado' => Encomenda::MULTA_PENDENTE,
                ]);

                $totalMultadas++;

                $this->line("  ⚠ Encomenda #{$encomenda->id} ({$encomenda->condomino?->nome_completo}) — multa de {$config->multa_valor_padrao_kz} Kz aplicada, transferida para administração");

                // TODO: enviar push notification ao residente + ao admin
            }
        }

        $this->info("Total multadas: $totalMultadas");

        return self::SUCCESS;
    }
}
