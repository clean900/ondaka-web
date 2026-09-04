<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domains\Payment\Models\ProxyPayPagamentoRecebido;
use Illuminate\Console\Command;

/**
 * Mostra a caixa de entrada de pagamentos ProxyPay.
 *
 * A lista que interessa vigiar é a dos POR RECLAMAR: pagamentos que a ProxyPay
 * entregou e que nenhum sistema reconheceu como seu. Enquanto a Fase 2 não
 * estiver feita (cada sistema a puxar o que é dele), é normal que apareçam aqui
 * os pagamentos do Welwitschia, da Academia e do BWEFACIL — a diferença é que
 * agora ficam guardados em vez de se perderem.
 *
 *   php artisan proxypay:caixa
 *   php artisan proxypay:caixa --todos
 */
class ProxyPayCaixaEntrada extends Command
{
    protected $signature = 'proxypay:caixa
                            {--todos : mostra também os já reclamados}
                            {--limite=30 : quantas linhas mostrar}';

    protected $description = 'Lista os pagamentos ProxyPay recebidos pelo webhook (caixa de entrada partilhada).';

    public function handle(): int
    {
        $limite = max(1, (int) $this->option('limite'));

        $query = ProxyPayPagamentoRecebido::query()->latest('id')->limit($limite);

        if (! $this->option('todos')) {
            $query->porReclamar();
        }

        $linhas = $query->get();

        $porReclamar = ProxyPayPagamentoRecebido::porReclamar()->count();
        $total = ProxyPayPagamentoRecebido::count();

        $this->line("Caixa de entrada ProxyPay: <fg=green>{$total}</> recebidos, <fg=yellow>{$porReclamar}</> por reclamar.");
        $this->newLine();

        if ($linhas->isEmpty()) {
            $this->line($this->option('todos')
                ? 'Ainda não chegou nenhum pagamento à caixa.'
                : 'Nenhum pagamento por reclamar.');

            return self::SUCCESS;
        }

        $this->table(
            ['#', 'referência', 'pagamento', 'valor', 'sistema', 'recebido', 'reclamado por'],
            $linhas->map(fn (ProxyPayPagamentoRecebido $p) => [
                $p->id,
                $p->reference_id,
                $p->payment_id ?? '—',
                number_format((float) $p->amount, 2, ',', '.'),
                $p->sistema ?: '—',
                optional($p->recebido_em)->format('d/m/Y H:i') ?: '—',
                $p->consumido_por ?: '<fg=yellow>por reclamar</>',
            ])->all()
        );

        return self::SUCCESS;
    }
}
