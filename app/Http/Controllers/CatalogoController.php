<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Página pública /catalogo — lista completa de funcionalidades ONDAKA.
 * Sem autenticação. Dados baseados no catálogo v9 + cronograma v8.
 */
class CatalogoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Catalogo/Index');
    }
}
