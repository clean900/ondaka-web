<?php

namespace App\Domains\Facturacao\Services;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Models\Pagamento;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

/**
 * Gera o documento "Confirmação de Pagamento" em PDF.
 *
 * NOTA: não é recibo nem factura fiscal (a plataforma ainda não está
 * certificada pela AGT). É uma confirmação interna de pagamento.
 */
class ConfirmacaoPagamentoPdfService
{
    private const METODOS_LABEL = [
        'transferencia_bancaria' => 'Transferência bancária',
        'deposito_bancario' => 'Depósito bancário',
        'proxypay_rps' => 'Multicaixa Express',
        'dinheiro' => 'Dinheiro',
        'outro' => 'Outro',
    ];

    /**
     * Gera o PDF e grava em disco. Devolve o path relativo (disk 'public')
     * ou null em caso de falha (não lança — é defensivo).
     */
    public function gerarEGuardar(Pagamento $pagamento): ?string
    {
        try {
            $pagamento->loadMissing(['condomino', 'fraccao', 'condominio', 'imputacoes.lancamento']);

            $config = CondominioFacturacaoConfig::where('condominio_id', $pagamento->condominio_id)->first();

            $dados = $this->montarDados($pagamento, $config);

            $pdf = Pdf::loadView('facturacao.confirmacao-pagamento', $dados)
                ->setPaper('a4', 'portrait');

            $nome = 'confirmacao-' . $pagamento->referencia . '-' . now()->format('YmdHis') . '.pdf';
            $path = 'confirmacoes/' . $nome;

            Storage::disk('public')->put($path, $pdf->output());

            return $path;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * Monta o array de dados para o template.
     */
    private function montarDados(Pagamento $pagamento, ?CondominioFacturacaoConfig $config): array
    {
        $itens = [];
        foreach ($pagamento->imputacoes as $imp) {
            $itens[] = [
                'descricao' => $imp->lancamento?->descricao ?? 'Lançamento',
                'valor' => $this->fmt($imp->valor),
            ];
        }

        return [
            'referencia' => $pagamento->referencia,
            'condominioNome' => $pagamento->condominio?->nome ?? '—',
            'condominoNome' => $pagamento->condomino?->nome_completo ?? '—',
            'imovel' => $pagamento->fraccao?->identificador ?? '—',
            'dataPagamento' => $pagamento->data_pagamento
                ? \Carbon\Carbon::parse($pagamento->data_pagamento)->format('d/m/Y')
                : '—',
            'metodo' => self::METODOS_LABEL[$pagamento->metodo] ?? $pagamento->metodo,
            'confirmadoEm' => $pagamento->confirmado_em
                ? \Carbon\Carbon::parse($pagamento->confirmado_em)->format('d/m/Y H:i')
                : '—',
            'valorTotal' => $this->fmt($pagamento->valor),
            'itens' => $itens,
            'nifEmissor' => $config?->nif_emissor,
            'geradoEm' => now()->format('d/m/Y H:i'),
            'logoBase64' => $this->logoBase64(),
        ];
    }

    /**
     * Carrega o logo ONDAKA como data-URI base64 (dompdf le melhor assim).
     * Devolve null se o ficheiro nao existir.
     */
    private function logoBase64(): ?string
    {
        $path = storage_path('app/public/branding/logo-ondaka.png');
        if (! is_file($path)) {
            return null;
        }
        $dados = @file_get_contents($path);
        if ($dados === false) {
            return null;
        }

        return 'data:image/png;base64,' . base64_encode($dados);
    }

    /**
     * Formata valor em estilo AO: 1.234.567,89
     */
    private function fmt($valor): string
    {
        return number_format((float) $valor, 2, ',', '.');
    }
}
