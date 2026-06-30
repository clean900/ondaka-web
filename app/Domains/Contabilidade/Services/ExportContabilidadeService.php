<?php

declare(strict_types=1);

namespace App\Domains\Contabilidade\Services;

use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Financas\Models\Despesa;
use Illuminate\Support\Carbon;

/**
 * Exporta os movimentos financeiros do condomínio num formato CSV que o
 * contabilista importa no PHC, Primavera ou outro ERP (add-on integracao_contabilidade).
 *
 * Phase 1 = CSV de movimentos (Recibos/Pagamentos, Taxas/Lançamentos, Despesas).
 * Phase 2 (futuro) = SAF-T (AO) XML. O CSV usa ';' + BOM UTF-8 para abrir
 * directamente no Excel em PT/AO.
 */
class ExportContabilidadeService
{
    /** Tipos de export suportados. */
    public const TIPOS = ['pagamentos', 'lancamentos', 'despesas'];

    /**
     * Gera o CSV do tipo pedido.
     *
     * @return array{0: string, 1: string} [conteudoCsv, nomeFicheiro]
     */
    public function gerar(string $tipo, int $empresaId, ?int $condominioId, ?string $de, ?string $ate): array
    {
        [$desde, $ateData] = $this->intervalo($de, $ate);

        return match ($tipo) {
            'pagamentos' => [$this->csvPagamentos($empresaId, $condominioId, $desde, $ateData), $this->nome('recibos', $desde, $ateData)],
            'lancamentos' => [$this->csvLancamentos($empresaId, $condominioId, $desde, $ateData), $this->nome('taxas', $desde, $ateData)],
            'despesas' => [$this->csvDespesas($empresaId, $condominioId, $desde, $ateData), $this->nome('despesas', $desde, $ateData)],
            default => throw new \InvalidArgumentException("Tipo de export inválido: {$tipo}"),
        };
    }

    private function csvPagamentos(int $empresaId, ?int $condominioId, Carbon $de, Carbon $ate): string
    {
        $linhas = Pagamento::query()
            ->where('empresa_gestora_id', $empresaId)
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->where('estado', 'confirmado')
            ->whereBetween('data_pagamento', [$de, $ate])
            ->with(['condominio:id,nome', 'fraccao:id,identificador', 'condomino:id,nome_completo,nome_comercial,numero_bi,nif'])
            ->orderBy('data_pagamento')
            ->get()
            ->map(fn (Pagamento $p) => [
                $this->data($p->data_pagamento),
                $p->referencia ?? '',
                $p->condominio?->nome ?? '',
                $p->fraccao?->identificador ?? '',
                $this->nomeCondomino($p->condomino),
                $this->docFiscal($p->condomino),
                $this->metodo($p->metodo),
                $p->banco_origem ?? '',
                $this->valor($p->valor),
                'EUR' === $p->moeda ? 'EUR' : 'AOA',
                $this->estadoLabel($p->estado),
            ]);

        return $this->montar(
            ['Data', 'Documento', 'Condomínio', 'Imóvel', 'Condómino', 'NIF/BI', 'Método', 'Banco', 'Valor', 'Moeda', 'Estado'],
            $linhas->all(),
        );
    }

    private function csvLancamentos(int $empresaId, ?int $condominioId, Carbon $de, Carbon $ate): string
    {
        $linhas = Lancamento::query()
            ->where('empresa_gestora_id', $empresaId)
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->where('estado', '!=', 'cancelado')
            ->whereBetween('data_lancamento', [$de, $ate])
            ->with(['condominio:id,nome', 'fraccao:id,identificador', 'condomino:id,nome_completo,nome_comercial,numero_bi,nif'])
            ->orderBy('data_lancamento')
            ->get()
            ->map(fn (Lancamento $l) => [
                $this->data($l->data_lancamento),
                ucfirst((string) $l->tipo),
                $l->condominio?->nome ?? '',
                $l->fraccao?->identificador ?? '',
                $this->nomeCondomino($l->condomino),
                $this->docFiscal($l->condomino),
                (string) $l->descricao,
                $this->valor($l->valor),
                $this->valor($l->valor_pago ?? 0),
                $this->data($l->data_vencimento),
                $this->estadoLabel($l->estado),
            ]);

        return $this->montar(
            ['Data', 'Tipo', 'Condomínio', 'Imóvel', 'Condómino', 'NIF/BI', 'Descrição', 'Valor', 'Valor pago', 'Vencimento', 'Estado'],
            $linhas->all(),
        );
    }

    private function csvDespesas(int $empresaId, ?int $condominioId, Carbon $de, Carbon $ate): string
    {
        $linhas = Despesa::query()
            ->where('empresa_gestora_id', $empresaId)
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->where('estado', '!=', 'cancelada')
            ->whereBetween('data_despesa', [$de, $ate])
            ->with(['condominio:id,nome', 'categoria:id,nome'])
            ->orderBy('data_despesa')
            ->get()
            ->map(fn (Despesa $d) => [
                $this->data($d->data_despesa),
                $d->condominio?->nome ?? '',
                $d->categoria?->nome ?? '',
                $d->fornecedor ?? '',
                (string) $d->descricao,
                $this->metodo($d->metodo_pagamento),
                $this->valor($d->valor),
                $this->estadoLabel($d->estado),
            ]);

        return $this->montar(
            ['Data', 'Condomínio', 'Categoria', 'Fornecedor', 'Descrição', 'Método', 'Valor', 'Estado'],
            $linhas->all(),
        );
    }

    /* ===================== helpers ===================== */

    private function intervalo(?string $de, ?string $ate): array
    {
        $desde = $de ? Carbon::parse($de)->startOfDay() : Carbon::now()->startOfYear();
        $ateData = $ate ? Carbon::parse($ate)->endOfDay() : Carbon::now()->endOfDay();
        return [$desde, $ateData];
    }

    private function montar(array $cabecalho, array $linhas): string
    {
        $out = "\xEF\xBB\xBF"; // BOM UTF-8 → Excel PT abre certo
        $out .= $this->linhaCsv($cabecalho);
        foreach ($linhas as $linha) {
            $out .= $this->linhaCsv($linha);
        }
        return $out;
    }

    private function linhaCsv(array $campos): string
    {
        $celulas = array_map(function ($c) {
            $c = (string) $c;
            if (str_contains($c, ';') || str_contains($c, '"') || str_contains($c, "\n")) {
                $c = '"' . str_replace('"', '""', $c) . '"';
            }
            return $c;
        }, $campos);
        return implode(';', $celulas) . "\r\n";
    }

    private function data($valor): string
    {
        if (! $valor) return '';
        return $valor instanceof Carbon ? $valor->format('Y-m-d') : (string) Carbon::parse($valor)->format('Y-m-d');
    }

    private function valor($v): string
    {
        // PT/AO: vírgula decimal (Excel local interpreta como número).
        return number_format((float) $v, 2, ',', '');
    }

    private function nomeCondomino($condomino): string
    {
        if (! $condomino) return '';
        return $condomino->nome_comercial ?: ($condomino->nome_completo ?: '');
    }

    private function docFiscal($condomino): string
    {
        if (! $condomino) return '';
        return $condomino->nif ?: ($condomino->numero_bi ?: '');
    }

    private function metodo(?string $m): string
    {
        return match ($m) {
            'transferencia_bancaria', 'transferencia' => 'Transferência',
            'multicaixa_express', 'multicaixa' => 'Multicaixa Express',
            'numerario', 'dinheiro' => 'Numerário',
            'cheque' => 'Cheque',
            'deposito' => 'Depósito',
            null, '' => '',
            default => ucfirst(str_replace('_', ' ', $m)),
        };
    }

    private function estadoLabel(?string $e): string
    {
        return $e ? ucfirst(str_replace('_', ' ', $e)) : '';
    }

    private function nome(string $base, Carbon $de, Carbon $ate): string
    {
        return "ondaka_{$base}_{$de->format('Ymd')}_{$ate->format('Ymd')}.csv";
    }
}
