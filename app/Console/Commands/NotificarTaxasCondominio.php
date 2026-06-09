<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domains\Condomino\Notifications\TaxaAVencerNotification;
use App\Domains\Condomino\Notifications\TaxaVencidaNotification;
use App\Domains\Facturacao\Models\Lancamento;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class NotificarTaxasCondominio extends Command
{
    protected $signature = 'taxas:notificar {--dias-aviso=3 : Dias antes do vencimento para avisar}';
    protected $description = 'Notifica condóminos sobre taxas a vencer e vencidas (push + sino + email).';

    private const TIPOS_TAXA = [
        Lancamento::TIPO_QUOTA_BASE,
        Lancamento::TIPO_FUNDO_RESERVA,
    ];

    public function handle(): int
    {
        $diasAviso = (int) $this->option('dias-aviso');
        $aVencer = 0;
        $vencidas = 0;

        // === Taxas a VENCER (vencem daqui a N dias) ===
        $dataAlvo = now()->addDays($diasAviso)->toDateString();
        $lancAVencer = Lancamento::emAberto()
            ->whereIn('tipo', self::TIPOS_TAXA)
            ->whereNotNull('data_vencimento')
            ->whereDate('data_vencimento', $dataAlvo)
            ->get();

        foreach ($lancAVencer as $lanc) {
            if ($this->notificar($lanc, 'taxa_a_vencer', function (User $user) use ($lanc, $diasAviso) {
                return new TaxaAVencerNotification(
                    nome: $user->name,
                    periodo: $this->periodo($lanc),
                    valor: $this->valor($lanc),
                    vencimento: $this->vencimento($lanc),
                    dias: $diasAviso,
                    quotaId: $lanc->id,
                );
            })) {
                $aVencer++;
            }
        }

        // === Taxas VENCIDAS (em atraso) ===
        $lancVencidas = Lancamento::emAtraso()
            ->whereIn('tipo', self::TIPOS_TAXA)
            ->get();

        foreach ($lancVencidas as $lanc) {
            if ($this->notificar($lanc, 'taxa_vencida', function (User $user) use ($lanc) {
                return new TaxaVencidaNotification(
                    nome: $user->name,
                    periodo: $this->periodo($lanc),
                    valor: $this->valor($lanc),
                    vencimento: $this->vencimento($lanc),
                    quotaId: $lanc->id,
                );
            })) {
                $vencidas++;
            }
        }

        $this->info("Taxas a vencer notificadas: {$aVencer}");
        $this->info("Taxas vencidas notificadas: {$vencidas}");
        Log::info("[taxas:notificar] a_vencer={$aVencer} vencidas={$vencidas}");

        return self::SUCCESS;
    }

    /**
     * Resolve o user do condómino, verifica anti-duplicado, e dispara.
     * Devolve true se notificou.
     */
    private function notificar(Lancamento $lanc, string $tipo, callable $fabricaNotificacao): bool
    {
        if (! $lanc->condomino_id) {
            return false;
        }

        $condomino = $lanc->condomino;
        if (! $condomino || ! $condomino->user_id) {
            return false;
        }

        $user = User::find($condomino->user_id);
        if (! $user) {
            return false;
        }

        // Anti-duplicado (opção A): já notificado para esta taxa + tipo?
        $jaNotificado = $user->notifications()
            ->where('data->tipo', $tipo)
            ->where('data->quota_id', $lanc->id)
            ->exists();

        if ($jaNotificado) {
            return false;
        }

        try {
            $user->notify($fabricaNotificacao($user));
            return true;
        } catch (\Throwable $e) {
            Log::warning("[taxas:notificar] Falha a notificar user {$user->id} (lanc {$lanc->id}): " . $e->getMessage());
            return false;
        }
    }

    private function periodo(Lancamento $lanc): string
    {
        // Usa a descrição (ex: "Quota 05/2026") ou o mês do vencimento
        return $lanc->descricao
            ?: ($lanc->data_vencimento ? Carbon::parse($lanc->data_vencimento)->format('m/Y') : '—');
    }

    private function valor(Lancamento $lanc): string
    {
        return number_format($lanc->valorEmDivida(), 2, ',', '.');
    }

    private function vencimento(Lancamento $lanc): string
    {
        return $lanc->data_vencimento
            ? Carbon::parse($lanc->data_vencimento)->format('d/m/Y')
            : '—';
    }
}
