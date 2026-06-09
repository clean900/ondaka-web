<?php

declare(strict_types=1);

namespace App\Domains\Payment\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\Factura;
use App\Domains\Payment\Models\OrdemCompra;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FacturaService
{
    /**
     * Emite factura (Factura-Recibo quando já paga) para uma ordem.
     * Chamado automaticamente ao aprovar uma ordem.
     *
     * Conformidade DP 141/15 de 29 de Junho (Angola):
     * - Numeração sequencial por série
     * - NIF emissor obrigatório
     * - Snapshot destinatário
     * - IVA separado a 14%
     * - Hash de integridade
     */
    public function emitir(OrdemCompra $ordem, ?int $emitidaPorUserId = null): Factura
    {
        // Se já tem factura, devolve a existente (idempotente)
        $existente = Factura::where('ordem_compra_id', $ordem->id)->first();
        if ($existente) {
            return $existente;
        }

        $ordem->loadMissing('owner', 'feature', 'pacote', 'pagamentos');

        return DB::transaction(function () use ($ordem, $emitidaPorUserId) {
            $serie = config('ondaka.factura.serie', date('Y'));
            $tipoDocumento = $this->determinarTipoDocumento($ordem);
            $numeroSequencial = $this->proximoNumeroSequencial($serie, $tipoDocumento);
            $numero = sprintf('%s %s/%06d', $tipoDocumento, $serie, $numeroSequencial);

            // Snapshot destinatário
            $owner = $ordem->owner;
            $destinatario = [
                'nome' => $owner?->nome ?? '—',
                'nif' => $owner?->nif ?? null,
                'morada' => $owner?->morada ?? null,
                'provincia' => $owner?->provincia ?? null,
                'municipio' => $owner?->municipio ?? null,
                'email' => $owner?->email_contacto ?? $owner?->email ?? null,
                'telefone' => $owner?->telefone ?? null,
            ];

            // Linhas
            $linhas = $this->construirLinhas($ordem);

            $factura = Factura::create([
                'numero' => $numero,
                'serie' => $serie,
                'numero_sequencial' => $numeroSequencial,
                'tipo_documento' => $tipoDocumento,
                'ordem_compra_id' => $ordem->id,

                // Destinatário (snapshot)
                'destinatario_nome' => $destinatario['nome'],
                'destinatario_nif' => $destinatario['nif'],
                'destinatario_morada' => $destinatario['morada'],
                'destinatario_provincia' => $destinatario['provincia'],
                'destinatario_municipio' => $destinatario['municipio'],
                'destinatario_email' => $destinatario['email'],
                'destinatario_telefone' => $destinatario['telefone'],

                // Emissor
                'emissor_nome' => config('ondaka.emissor.nome'),
                'emissor_nif' => config('ondaka.emissor.nif'),
                'emissor_morada' => config('ondaka.emissor.morada'),

                // Valores
                'valor_base' => (float) $ordem->valor_base + (float) $ordem->valor_activacao,
                'valor_desconto' => 0,
                'valor_iva' => (float) $ordem->valor_iva,
                'taxa_iva' => config('ondaka.factura.taxa_iva', 14.0),
                'valor_total' => (float) $ordem->valor_total,
                'valor_pago' => $tipoDocumento === 'FR' ? (float) $ordem->valor_total : 0,
                'moeda' => 'AOA',

                // Datas
                'data_emissao' => Carbon::now()->toDateString(),
                'data_vencimento' => $tipoDocumento === 'FR'
                    ? null
                    : Carbon::now()->addDays(config('ondaka.factura.prazo_vencimento_dias', 30))->toDateString(),

                // Estado
                'estado' => $tipoDocumento === 'FR' ? 'paga' : 'emitida',

                // Linhas
                'linhas' => $linhas,

                // Observações
                'observacoes' => $this->construirObservacoes($ordem),

                'emitida_por_user_id' => $emitidaPorUserId,
            ]);

            // Hash de integridade (SHA-256 dos campos chave)
            $hash = $this->calcularHash($factura);
            $factura->update(['hash_integridade' => $hash]);

            // Gerar PDF
            try {
                $this->gerarPdf($factura);
            } catch (\Throwable $e) {
                \Log::warning("Falha ao gerar PDF da factura {$factura->numero}: ".$e->getMessage());
            }

            // Guardar número da factura na ordem
            $ordem->update(['numero_factura' => $factura->numero]);

            return $factura->fresh();
        });
    }

    /**
     * Gera PDF da factura e guarda em storage.
     */
    public function gerarPdf(Factura $factura): string
    {
        $factura->loadMissing('ordem.feature', 'ordem.pacote', 'ordem.pagamentos');

        $pdf = Pdf::loadView('pdf.factura', [
            'factura' => $factura,
            'ordem' => $factura->ordem,
        ])->setPaper('a4', 'portrait');

        $pasta = 'facturas/'.Carbon::parse($factura->data_emissao)->format('Y/m');
        $nomeFicheiro = str_replace(['/', ' '], ['_', '_'], $factura->numero).'.pdf';
        $caminho = $pasta.'/'.$nomeFicheiro;

        Storage::disk('local')->put($caminho, $pdf->output());

        $factura->update(['pdf_path' => $caminho]);

        return $caminho;
    }

    /**
     * Devolve bytes do PDF (regenera se não existir).
     */
    public function obterPdf(Factura $factura): ?string
    {
        if ($factura->pdf_path && Storage::disk('local')->exists($factura->pdf_path)) {
            return Storage::disk('local')->get($factura->pdf_path);
        }

        // Regenerar se não existir
        try {
            $this->gerarPdf($factura);
            return Storage::disk('local')->get($factura->fresh()->pdf_path);
        } catch (\Throwable $e) {
            \Log::error("Falha ao obter PDF factura {$factura->numero}: ".$e->getMessage());
            return null;
        }
    }

    /* ============================================
       PRIVADOS
       ============================================ */

    /**
     * FR = Factura-Recibo (pagamento já efectuado no acto).
     * FT = Factura (pagamento a ser efectuado).
     */
    private function determinarTipoDocumento(OrdemCompra $ordem): string
    {
        return $ordem->estaTotalmentePaga() ? 'FR' : 'FT';
    }

    private function proximoNumeroSequencial(string $serie, string $tipoDocumento): int
    {
        $ultimo = Factura::where('serie', $serie)
            ->where('tipo_documento', $tipoDocumento)
            ->lockForUpdate()
            ->orderByDesc('numero_sequencial')
            ->value('numero_sequencial');

        return ((int) ($ultimo ?? 0)) + 1;
    }

    private function construirLinhas(OrdemCompra $ordem): array
    {
        $linhas = [];

        $descricaoBase = $ordem->descricao_item;
        $quantidade = 1;
        $unidade = 'un';

        // Se é pacote consumível, descrição + quantidade
        if ($ordem->tipo_item === 'pacote_consumivel' && $ordem->pacote) {
            $unidade = $ordem->feature?->unidade ?? 'un';
        }

        $linhas[] = [
            'descricao' => $descricaoBase,
            'quantidade' => $quantidade,
            'unidade' => $unidade,
            'preco_unitario' => (float) $ordem->valor_base,
            'subtotal' => (float) $ordem->valor_base,
            'taxa_iva' => config('ondaka.factura.taxa_iva', 14.0),
        ];

        // Activação como linha separada (se aplicável)
        if ((float) $ordem->valor_activacao > 0) {
            $linhas[] = [
                'descricao' => 'Taxa de activação (única vez)',
                'quantidade' => 1,
                'unidade' => 'un',
                'preco_unitario' => (float) $ordem->valor_activacao,
                'subtotal' => (float) $ordem->valor_activacao,
                'taxa_iva' => config('ondaka.factura.taxa_iva', 14.0),
            ];
        }

        return $linhas;
    }

    private function construirObservacoes(OrdemCompra $ordem): string
    {
        $obs = ['Referente à ordem '.$ordem->numero.'.'];

        if ($ordem->tipo_item === 'feature' && $ordem->meses_contratados) {
            $obs[] = 'Subscrição de '.$ordem->meses_contratados.' '.($ordem->meses_contratados === 1 ? 'mês' : 'meses').'.';
        }

        $obs[] = 'IVA à taxa legal de '.number_format((float) config('ondaka.factura.taxa_iva', 14.0), 0, ',', '.').'% (Angola).';

        return implode("\n", $obs);
    }

    /**
     * Hash de integridade SHA-256 dos campos críticos.
     * Usado para detectar alterações após emissão (preparação SAFT-AO).
     */
    private function calcularHash(Factura $factura): string
    {
        $campos = [
            $factura->numero,
            $factura->tipo_documento,
            $factura->data_emissao?->toDateString(),
            $factura->emissor_nif,
            $factura->destinatario_nome,
            $factura->destinatario_nif,
            number_format((float) $factura->valor_base, 2, '.', ''),
            number_format((float) $factura->valor_iva, 2, '.', ''),
            number_format((float) $factura->valor_total, 2, '.', ''),
            json_encode($factura->linhas),
        ];

        return hash('sha256', implode('|', $campos));
    }
}
