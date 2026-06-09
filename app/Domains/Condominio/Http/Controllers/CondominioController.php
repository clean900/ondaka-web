<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Http\Requests\GuardarCondominioRequest;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CondominioController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Condominio::class);

        $condominios = Condominio::query()
            ->withCount(['edificios', 'fraccoes'])
            ->with('administrador:id,name,email,telefone')
            ->when($request->string('pesquisa')->toString(), function ($q, $pesquisa) {
                $q->where(function ($sub) use ($pesquisa) {
                    $sub->where('nome', 'like', "%{$pesquisa}%")
                        ->orWhere('codigo', 'like', "%{$pesquisa}%")
                        ->orWhere('bairro', 'like', "%{$pesquisa}%")
                        ->orWhere('municipio', 'like', "%{$pesquisa}%");
                });
            })
            ->when($request->string('estado')->toString(), fn ($q, $e) => $q->where('estado', $e))
            ->orderBy('nome')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Condominios/Index', [
            'condominios' => $condominios,
            'filtros' => $request->only(['pesquisa', 'estado']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Condominio::class);

        return Inertia::render('Condominios/Form', [
            'provincias' => $this->provinciasAngola(),
        ]);
    }

    public function store(GuardarCondominioRequest $request): RedirectResponse
    {
        $condominio = Condominio::create($request->validated());

        return redirect()
            ->route('condominios.show', $condominio)
            ->with('success', "Condomínio «{$condominio->nome}» criado com sucesso.");
    }

    public function show(Condominio $condominio): Response
    {
        $this->authorize('view', $condominio);

        $condominio->load([
            'edificios' => fn ($q) => $q->withCount('fraccoes')->orderBy('codigo'),
            'administrador:id,name,email,telefone',
        ]);

        return Inertia::render('Condominios/Show', [
            'condominio' => $condominio,
            'estatisticas' => [
                'total_edificios' => $condominio->edificios->count(),
                'total_fraccoes' => $condominio->fraccoes()->count(),
                'fraccoes_ocupadas' => $condominio->fraccoes()->where('estado', 'ocupada')->count(),
                'fraccoes_vagas' => $condominio->fraccoes()->where('estado', 'vaga')->count(),
            ],
        ]);
    }

    public function edit(Condominio $condominio): Response
    {
        $this->authorize('update', $condominio);

        return Inertia::render('Condominios/Form', [
            'condominio' => $condominio,
            'provincias' => $this->provinciasAngola(),
        ]);
    }

    public function update(GuardarCondominioRequest $request, Condominio $condominio): RedirectResponse
    {
        $condominio->update($request->validated());

        return redirect()
            ->route('condominios.show', $condominio)
            ->with('success', 'Condomínio actualizado com sucesso.');
    }

    public function destroy(Condominio $condominio): RedirectResponse
    {
        $this->authorize('delete', $condominio);

        if ($condominio->fraccoes()->where('estado', 'ocupada')->exists()) {
            return back()->with(
                'error',
                'Não é possível arquivar um condomínio com fracções ocupadas.'
            );
        }

        $condominio->delete();

        return redirect()
            ->route('condominios.index')
            ->with('success', 'Condomínio arquivado.');
    }

    /**
     * Lista oficial das 21 províncias de Angola (após a reorganização administrativa de 2024).
     */
    private function provinciasAngola(): array
    {
        return [
            'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando', 'Cubango',
            'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
            'Icolo e Bengo', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje',
            'Moxico', 'Moxico Leste', 'Namibe', 'Uíge', 'Zaire',
        ];
    }
}
