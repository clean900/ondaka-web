<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Console;

use App\Domains\Manutencao\Services\ManutencaoService;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Alertas de manutenção preventiva: avisa os gestores quando um equipamento
 * está a 30, 15 ou 7 dias da próxima manutenção. Correr 1x/dia.
 */
class AlertarManutencoesCommand extends Command
{
    protected $signature = 'manutencao:alertas';

    protected $description = 'Notifica gestores de manutenções preventivas a vencer (30/15/7 dias).';

    public function handle(ManutencaoService $service, FcmSenderService $fcm): int
    {
        $itens = $service->planosParaAlertar();
        $this->info("Planos a alertar: {$itens->count()}");

        foreach ($itens as $item) {
            /** @var \App\Domains\Manutencao\Models\ManutencaoPlano $plano */
            $plano = $item['plano'];
            $dias = $item['dias'];
            $equipamento = $plano->equipamento;
            if (! $equipamento) {
                continue;
            }

            $titulo = "🔧 Manutenção em {$dias} dias";
            $corpo = "{$equipamento->nome}: \"{$plano->titulo}\" vence em {$dias} dias.";
            $data = [
                'tipo' => 'manutencao',
                'plano_id' => (string) $plano->id,
                'equipamento_id' => (string) $equipamento->id,
                'condominio_id' => (string) $equipamento->condominio_id,
            ];

            foreach ($this->gestores($equipamento->empresa_gestora_id, $equipamento->condominio_id) as $user) {
                try {
                    $fcm->enviarParaUser($user, $titulo, $corpo, $data);
                } catch (Throwable $e) {
                    Log::warning('[Manutencao] Falha push gestor ' . $user->id, ['erro' => $e->getMessage()]);
                }
            }
        }

        Log::info('[Manutencao] Alertas processados', ['total' => $itens->count()]);

        return self::SUCCESS;
    }

    /**
     * Gestores/admins da empresa a notificar (preferindo os do condomínio).
     *
     * @return \Illuminate\Support\Collection<int,User>
     */
    private function gestores(int $empresaGestoraId, int $condominioId)
    {
        return User::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin-empresa', 'gestor', 'administrador-condominio']))
            ->get();
    }
}
