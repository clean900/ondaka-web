<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Feature\Models\Feature;
use App\Support\Publico\PrecosPublicos;
use Illuminate\Contracts\View\View;

/**
 * Loja pública de add-ons (/loja), a partir da tabela features.
 * Blade, para o texto vir no HTML do servidor (ver LandingController).
 */
class LojaController extends Controller
{
    public function index(PrecosPublicos $precos): View
    {
        $features = Feature::where('activa', true)
            ->where('em_breve', false) // só add-ons disponíveis
            ->orderBy('ordem_listagem')
            ->orderBy('nome')
            ->get(['id', 'slug', 'nome', 'descricao', 'categoria',
                   'modelo_cobranca', 'preco_base', 'preco_activacao'])
            ->map(fn ($f) => [
                'slug' => (string) $f->slug,
                'nome' => (string) $f->nome,
                'descricao' => $f->descricao,
                'categoria' => (string) $f->categoria,
                'modelo_cobranca' => (string) $f->modelo_cobranca,
                'preco_base' => (float) $f->preco_base,
                'preco_activacao' => (float) $f->preco_activacao,
            ])->all();

        return view('publico.loja', [
            'features' => $features,
            'condicoes' => $precos->condicoes(),
        ]);
    }
}
