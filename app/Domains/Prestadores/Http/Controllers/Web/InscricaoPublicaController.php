<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Http\Controllers\Web;

use App\Domains\Prestadores\Models\PrestadorCategoria;
use App\Domains\Prestadores\Services\PrestadoresService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InscricaoPublicaController extends Controller
{
    public function __construct(
        protected PrestadoresService $service,
    ) {}

    /**
     * Formulário público de inscrição de prestador.
     */
    public function criar(): Response
    {
        return Inertia::render('Prestadores/InscricaoPublica', [
            'categorias' => PrestadorCategoria::activas()->get(['id', 'nome', 'slug', 'icone']),
            'valorSubscricao' => 5000,
        ]);
    }

    /**
     * Submeter inscrição (fica pendente de aprovação super-admin).
     */
    public function submeter(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'required|string|max:30',
            'email' => 'nullable|email|max:150',
            'especialidades' => 'required|string|max:1000',
            'observacoes' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $this->service->inscreverPublico($data);

        return back()->with('success', 'Inscrição submetida. Será analisada pela equipa ONDAKA e contactada em breve.');
    }
}
