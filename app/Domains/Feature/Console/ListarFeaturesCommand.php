<?php

declare(strict_types=1);

namespace App\Domains\Feature\Console;

use App\Domains\Feature\Models\Feature;
use Illuminate\Console\Command;

class ListarFeaturesCommand extends Command
{
    protected $signature = 'ondaka:listar-features
                            {--categoria= : Filtrar por categoria}
                            {--disponivel : Só disponíveis (não "em breve")}';

    protected $description = 'Listar catálogo de add-ons/features';

    public function handle(): int
    {
        $query = Feature::query()->orderBy('ordem_listagem');

        if ($cat = $this->option('categoria')) {
            $query->where('categoria', $cat);
        }

        if ($this->option('disponivel')) {
            $query->where('activa', true)->where('em_breve', false);
        }

        $features = $query->get();

        if ($features->isEmpty()) {
            $this->warn('Nenhuma feature encontrada.');
            return self::SUCCESS;
        }

        $this->info("Catálogo ONDAKA — {$features->count()} features");
        $this->newLine();

        $rows = $features->map(function (Feature $f) {
            $estado = match (true) {
                ! $f->activa => '⏸  Inactiva',
                $f->em_breve => '🔜 Em breve',
                default => '✓  Disponível',
            };

            $preco = match ($f->modelo_cobranca) {
                'subscription' => number_format((float) $f->preco_base, 0, ',', '.') . ' Kz/mês',
                'one_time' => number_format((float) $f->preco_base, 0, ',', '.') . ' Kz (único)',
                'consumable' => 'Pacotes',
                default => '—',
            };

            $activacao = $f->preco_activacao > 0
                ? '+' . number_format((float) $f->preco_activacao, 0, ',', '.') . ' Kz'
                : '—';

            return [
                str_pad((string) $f->ordem_listagem, 3, '0', STR_PAD_LEFT),
                $f->nome,
                $f->categoria_label,
                $f->comprador_label,
                $preco,
                $activacao,
                $estado,
            ];
        })->toArray();

        $this->table(
            ['#', 'Nome', 'Categoria', 'Comprador', 'Preço', 'Activação', 'Estado'],
            $rows,
        );

        // Contadores (queries separadas para evitar colisão de nomes)
        $total = Feature::count();
        $disponivel = Feature::where('activa', true)->where('em_breve', false)->count();
        $emBreve = Feature::where('em_breve', true)->count();

        $this->newLine();
        $this->line("Total: {$total} · Disponíveis: {$disponivel} · Em breve: {$emBreve}");

        return self::SUCCESS;
    }
}
