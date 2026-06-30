<?php

declare(strict_types=1);

namespace App\Domains\Contabilidade\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Contabilidade\Services\ExportContabilidadeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Add-on Integração Contabilidade (PHC/Primavera) — export de movimentos
 * financeiros em CSV para o contabilista importar no ERP.
 * Gate: feature:integracao_contabilidade.
 */
class ContabilidadeController extends Controller
{
    public function __construct(private ExportContabilidadeService $service) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('Contabilidade/Index', [
            'condominios' => Condominio::query()->orderBy('nome')->get(['id', 'nome']),
            'tipos' => [
                ['slug' => 'pagamentos', 'nome' => 'Recibos / Pagamentos', 'descricao' => 'Pagamentos confirmados (receitas).'],
                ['slug' => 'lancamentos', 'nome' => 'Taxas / Lançamentos', 'descricao' => 'Taxas de condomínio e lançamentos (a débito).'],
                ['slug' => 'despesas', 'nome' => 'Despesas', 'descricao' => 'Despesas do condomínio (custos).'],
                ['slug' => 'saft', 'nome' => 'SAF-T (AO) — XML', 'descricao' => 'Ficheiro SAF-T (AO) com clientes e documentos de venda. Validar com o schema AGT antes de submissão oficial.'],
            ],
        ]);
    }

    public function exportar(Request $request, string $tipo): Response
    {
        abort_unless(in_array($tipo, ExportContabilidadeService::TIPOS, true), 404);

        $dados = $request->validate([
            'condominio_id' => ['nullable', 'integer'],
            'de' => ['nullable', 'date'],
            'ate' => ['nullable', 'date', 'after_or_equal:de'],
        ]);

        $empresaId = (int) $request->user()->empresa_gestora_id;

        // Garante que o condomínio (se indicado) pertence à empresa do utilizador.
        $condominioId = null;
        if (! empty($dados['condominio_id'])) {
            $condominioId = Condominio::where('id', $dados['condominio_id'])->value('id');
        }

        [$csv, $nome] = $this->service->gerar(
            $tipo,
            $empresaId,
            $condominioId ? (int) $condominioId : null,
            $dados['de'] ?? null,
            $dados['ate'] ?? null,
        );

        $contentType = str_ends_with($nome, '.xml') ? 'application/xml; charset=UTF-8' : 'text/csv; charset=UTF-8';

        return response($csv, 200, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'attachment; filename="' . $nome . '"',
        ]);
    }
}
