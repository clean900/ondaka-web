<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Feature\Models\Feature;
use Inertia\Inertia;
use Inertia\Response;

class LojaController extends Controller
{
    public function index(): Response
    {
        $features = Feature::where('activa', true)
            ->where('em_breve', false) // 98% implementado — só add-ons disponíveis
            ->orderBy('ordem_listagem')
            ->orderBy('nome')
            ->get(['id', 'slug', 'nome', 'descricao', 'icone', 'categoria',
                   'modelo_cobranca', 'preco_base', 'preco_activacao', 'em_breve'])
            ->map(fn($f) => [
                'id' => $f->id,
                'slug' => $f->slug,
                'nome' => $f->nome,
                'descricao' => $f->descricao,
                'icone' => $f->icone,
                'categoria' => $f->categoria,
                'modelo_cobranca' => $f->modelo_cobranca,
                'preco_base' => (float) $f->preco_base,
                'preco_activacao' => (float) $f->preco_activacao,
                'em_breve' => (bool) $f->em_breve,
            ])->all();

        return Inertia::render('Loja/Index', ['features' => $features]);
    }
}
