<?php

declare(strict_types=1);

namespace App\Domains\Payment\Console;

use App\Domains\Payment\Models\Factura;
use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Services\FacturaService;
use Illuminate\Console\Command;

class EmitirFacturaCommand extends Command
{
    protected $signature = 'facturas:emitir
                            {ordem? : Número da ordem (ORD-YYYY-NNNNNN)}
                            {--regenerar-pdf : Apenas regenera PDF de facturas existentes}';

    protected $description = 'Emitir factura para ordem aprovada, ou regenerar PDFs';

    public function handle(FacturaService $facturaService): int
    {
        if ($this->option('regenerar-pdf')) {
            return $this->regenerarPdfs($facturaService);
        }

        $numero = $this->argument('ordem');

        if (! $numero) {
            $this->error('Argumento "ordem" obrigatório ou use --regenerar-pdf');
            return self::FAILURE;
        }

        $ordem = OrdemCompra::where('numero', $numero)->first();

        if (! $ordem) {
            $this->error("Ordem {$numero} não encontrada.");
            return self::FAILURE;
        }

        if (! $ordem->estaAprovada()) {
            if (! $this->confirm("Ordem não está aprovada (estado: {$ordem->estado}). Emitir na mesma?", false)) {
                return self::FAILURE;
            }
        }

        try {
            $factura = $facturaService->emitir($ordem);
            $this->info('✓ Factura emitida');
            $this->line('  Número: '.$factura->numero);
            $this->line('  Tipo: '.$factura->tipo_documento_label);
            $this->line('  Total: '.number_format((float) $factura->valor_total, 0, ',', '.').' Kz');
            $this->line('  PDF: '.($factura->pdf_path ?? 'NAO gerado'));
            $this->line('  Hash: '.substr($factura->hash_integridade ?? '—', 0, 16).'...');
        } catch (\Throwable $e) {
            $this->error('Erro: '.$e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function regenerarPdfs(FacturaService $facturaService): int
    {
        $facturas = Factura::all();
        $count = 0;

        foreach ($facturas as $f) {
            try {
                $facturaService->gerarPdf($f);
                $this->line('✓ '.$f->numero);
                $count++;
            } catch (\Throwable $e) {
                $this->error('✗ '.$f->numero.': '.$e->getMessage());
            }
        }

        $this->newLine();
        $this->info("Regenerados {$count} PDFs.");
        return self::SUCCESS;
    }
}
