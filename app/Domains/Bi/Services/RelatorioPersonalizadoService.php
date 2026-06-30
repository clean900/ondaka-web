<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Constrói o PDF do Relatório Personalizado a partir dos serviços BI.
 * Partilhado pelo controller (on-demand) e pelo comando de envio agendado.
 */
class RelatorioPersonalizadoService
{
    public const SECCOES = [
        'financeiro' => 'Receitas vs Despesas',
        'cobranca' => 'Cobrança e devedores',
        'despesas' => 'Despesas por categoria',
        'saude' => 'Saúde financeira',
    ];

    /** Monta o payload da vista a partir das secções escolhidas. */
    public function payload(int $empresaId, ?int $condominioId, int $meses, array $seccoes, ?string $titulo): array
    {
        return [
            'titulo' => $titulo ?: 'Relatório Personalizado',
            'empresa' => EmpresaGestora::find($empresaId),
            'condominioNome' => $condominioId ? Condominio::where('id', $condominioId)->value('nome') : null,
            'dataGeracao' => now()->format('d/m/Y H:i'),
            'meses' => $meses,
            'seccoes' => $seccoes,
            'receitas' => in_array('financeiro', $seccoes, true) ? (new ReceitasDespesasService())->calcular($empresaId, $condominioId, $meses) : null,
            'cobranca' => in_array('cobranca', $seccoes, true) ? (new CobrancaService())->calcular($empresaId, $condominioId) : null,
            'despesas' => in_array('despesas', $seccoes, true) ? (new DespesasService())->calcular($empresaId, $condominioId, $meses) : null,
            'saude' => in_array('saude', $seccoes, true) ? (new SaudeFinanceiraService())->calcular($empresaId, $condominioId) : null,
        ];
    }

    /** Devolve os bytes do PDF pronto a descarregar/anexar. */
    public function pdfBytes(int $empresaId, ?int $condominioId, int $meses, array $seccoes, ?string $titulo): string
    {
        return Pdf::loadView('relatorios.personalizado', $this->payload($empresaId, $condominioId, $meses, $seccoes, $titulo))->output();
    }
}
