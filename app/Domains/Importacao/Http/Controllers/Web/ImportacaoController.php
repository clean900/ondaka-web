<?php

declare(strict_types=1);

namespace App\Domains\Importacao\Http\Controllers\Web;

use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Importacao\Services\ImportacaoCondominosService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportacaoController extends Controller
{
    public function __construct(protected ImportacaoCondominosService $service) {}

    public function index(): Response|RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        if (! $empresa || ! FeatureGate::has($empresa, 'importacao_massiva')) {
            return redirect()->route('funcionalidades.show', 'importacao_massiva');
        }

        return Inertia::render('Importacao/Condominos', ['preview' => null]);
    }

    public function analisar(Request $request): Response
    {
        $request->validate([
            'ficheiro' => ['required', 'file', 'mimes:csv,txt', 'max:4096'],
        ]);

        $analise = $this->service->analisar($request->file('ficheiro'));

        return Inertia::render('Importacao/Condominos', [
            'preview' => $analise,
        ]);
    }

    public function importar(Request $request): RedirectResponse
    {
        $request->validate([
            'ficheiro' => ['required', 'file', 'mimes:csv,txt', 'max:4096'],
        ]);

        $resultado = $this->service->importar(
            $request->file('ficheiro'),
            (int) $request->user()->empresa_gestora_id,
        );

        return redirect()->route('importacao.index')->with(
            'success',
            "Importação concluída: {$resultado['importados']} condóminos importados"
                . ($resultado['ignorados'] > 0 ? ", {$resultado['ignorados']} ignorados (com erros)." : '.'),
        );
    }
}
