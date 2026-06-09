<?php

declare(strict_types=1);

namespace App\Domains\Payment\Console;

use App\Domains\Payment\Models\OrdemCompra;
use Illuminate\Console\Command;

class ListarOrdensCommand extends Command
{
    protected $signature = 'ordens:listar
                            {--estado= : Filtrar por estado}
                            {--limit=20 : Máximo a mostrar}';

    protected $description = 'Listar ordens de compra';

    public function handle(): int
    {
        $query = OrdemCompra::with(['owner', 'feature', 'pacote'])
            ->orderByDesc('id');

        if ($estado = $this->option('estado')) {
            $query->where('estado', $estado);
        }

        $limit = (int) $this->option('limit');
        $ordens = $query->limit($limit)->get();

        if ($ordens->isEmpty()) {
            $this->warn('Nenhuma ordem encontrada.');
            return self::SUCCESS;
        }

        $rows = $ordens->map(fn (OrdemCompra $o) => [
            $o->numero,
            $o->owner?->nome ?? 'ID '.$o->owner_id,
            substr($o->descricao_item, 0, 40).(strlen($o->descricao_item) > 40 ? '…' : ''),
            number_format((float) $o->valor_total, 0, ',', '.').' Kz',
            $o->estado_label,
            $o->prazo_pagamento?->format('d/m') ?? '—',
            $o->created_at->format('d/m H:i'),
        ])->toArray();

        $this->table(
            ['Número', 'Cliente', 'Item', 'Total', 'Estado', 'Prazo', 'Criada'],
            $rows,
        );

        // Contadores
        $total = OrdemCompra::count();
        $pendentes = OrdemCompra::whereIn('estado', ['pendente', 'em_revisao'])->count();
        $aprovadas = OrdemCompra::where('estado', 'aprovada')->count();
        $valor = (float) OrdemCompra::where('estado', 'aprovada')->sum('valor_total');

        $this->newLine();
        $this->line("Total: {$total} · Pendentes: {$pendentes} · Aprovadas: {$aprovadas}");
        $this->line('Valor aprovado total: '.number_format($valor, 0, ',', '.').' Kz');

        return self::SUCCESS;
    }
}
