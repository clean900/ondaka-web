<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Http\Controllers\Web;

use App\Domains\Marketplace\Models\MarketplaceAnuncio;
use App\Domains\Marketplace\Models\MarketplaceDenuncia;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminMarketplaceController extends Controller
{
    /**
     * Lista denuncias (pendentes primeiro) + dados do anuncio.
     */
    public function index(Request $request): Response
    {
        $denuncias = MarketplaceDenuncia::query()
            ->with([
                'anuncio' => fn ($q) => $q->withTrashed()->with(['categoria:id,nome', 'autor:id,name,email,telefone,condominio_activo_id']),
            ])
            ->orderByRaw("FIELD(estado, 'pendente', 'resolvida')")
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Admin/Marketplace/Index', [
            'denuncias' => $denuncias->through(fn ($d) => [
                'id' => $d->id,
                'motivo' => $d->motivo,
                'detalhe' => $d->detalhe,
                'estado' => $d->estado,
                'created_at' => $d->created_at?->format('d/m/Y H:i'),
                'anuncio' => $d->anuncio ? [
                    'id' => $d->anuncio->id,
                    'titulo' => $d->anuncio->titulo,
                    'tipo' => $d->anuncio->tipo,
                    'preco' => $d->anuncio->preco ? (float) $d->anuncio->preco : null,
                    'nome_exibicao' => $d->anuncio->nome_exibicao,
                    'estado_moderacao' => $d->anuncio->estado_moderacao,
                    'estado_venda' => $d->anuncio->estado_venda,
                    'categoria' => $d->anuncio->categoria?->nome,
                    'autor' => $d->anuncio->autor ? [
                        'nome' => $d->anuncio->autor->name,
                        'email' => $d->anuncio->autor->email,
                        'telefone' => $d->anuncio->autor->telefone,
                        'condominio' => optional(\App\Domains\Condominio\Models\Condominio::find($d->anuncio->autor->condominio_activo_id))->nome,
                    ] : null,
                ] : null,
            ]),
        ]);
    }

    /**
     * Remove um anuncio (estado_moderacao = removido) e resolve denuncias.
     */
    public function remover(MarketplaceAnuncio $anuncio): RedirectResponse
    {
        $anuncio->update(['estado_moderacao' => 'removido']);
        MarketplaceDenuncia::where('anuncio_id', $anuncio->id)
            ->where('estado', 'pendente')
            ->update(['estado' => 'resolvida']);

        return back()->with('success', 'Anúncio removido.');
    }

    /**
     * Reactiva um anuncio removido (estado_moderacao = activo).
     */
    public function reactivar(MarketplaceAnuncio $anuncio): RedirectResponse
    {
        $anuncio->update(['estado_moderacao' => 'activo']);

        return back()->with('success', 'Anúncio reactivado.');
    }

    /**
     * Marca uma denuncia como resolvida sem remover o anuncio.
     */
    public function resolverDenuncia(MarketplaceDenuncia $denuncia): RedirectResponse
    {
        $denuncia->update(['estado' => 'resolvida']);

        return back()->with('success', 'Denúncia marcada como resolvida.');
    }

    /**
     * Listagem completa de TODOS os anuncios (auditoria), com dados reais do autor.
     */
    public function anuncios(Request $request): Response
    {
        $q = MarketplaceAnuncio::query()
            ->with(['categoria:id,nome', 'autor:id,name,email,telefone,condominio_activo_id'])
            ->withCount('denuncias');

        if ($procura = $request->input('q')) {
            $q->where(function ($sub) use ($procura) {
                $sub->where('titulo', 'like', "%{$procura}%")
                    ->orWhere('nome_exibicao', 'like', "%{$procura}%");
            });
        }
        if ($estado = $request->input('estado_moderacao')) {
            $q->where('estado_moderacao', $estado);
        }

        $anuncios = $q->orderByDesc('created_at')->paginate(25)->withQueryString();

        return Inertia::render('Admin/Marketplace/Anuncios', [
            'anuncios' => $anuncios->through(fn ($a) => [
                'id' => $a->id,
                'titulo' => $a->titulo,
                'tipo' => $a->tipo,
                'preco' => $a->preco ? (float) $a->preco : null,
                'nome_exibicao' => $a->nome_exibicao,
                'visibilidade' => $a->visibilidade,
                'estado_moderacao' => $a->estado_moderacao,
                'estado_venda' => $a->estado_venda,
                'categoria' => $a->categoria?->nome,
                'denuncias_count' => $a->denuncias_count,
                'created_at' => $a->created_at?->format('d/m/Y H:i'),
                'autor' => $a->autor ? [
                    'nome' => $a->autor->name,
                    'email' => $a->autor->email,
                    'telefone' => $a->autor->telefone,
                    'condominio' => optional(\App\Domains\Condominio\Models\Condominio::find($a->autor->condominio_activo_id))->nome,
                ] : null,
            ]),
            'filtros' => [
                'q' => $request->input('q', ''),
                'estado_moderacao' => $request->input('estado_moderacao', ''),
            ],
        ]);
    }

}
