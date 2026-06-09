<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Http\Controllers\Api;

use App\Domains\Marketplace\Models\MarketplaceAnuncio;
use App\Domains\Marketplace\Models\MarketplaceCategoria;
use App\Domains\Marketplace\Services\MarketplaceService;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Feature\Models\Feature;
use App\Domains\Payment\Services\ProxyPayService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Domains\Marketplace\Models\MarketplaceAnuncioFoto;

class MarketplaceApiController extends Controller
{
    public function __construct(
        protected MarketplaceService $service,
    ) {}

    /**
     * Serializa um anuncio para resposta publica (SEM dados pessoais reais).
     */
    private function serializar(MarketplaceAnuncio $a): array
    {
        return [
            'id' => $a->id,
            'tipo' => $a->tipo,
            'titulo' => $a->titulo,
            'descricao' => $a->descricao,
            'preco' => $a->preco,
            'visibilidade' => $a->visibilidade,
            'estado_venda' => $a->estado_venda,
            'nome_exibicao' => $a->nome_exibicao,
            'contacto_telefone' => $a->contacto_telefone,
            'contacto_whatsapp' => $a->contacto_whatsapp,
            'contacto_email' => $a->contacto_email,
            'categoria' => $a->categoria ? [
                'id' => $a->categoria->id,
                'nome' => $a->categoria->nome,
                'slug' => $a->categoria->slug,
                'icone' => $a->categoria->icone,
            ] : null,
            'fotos' => $a->fotos->map(fn ($f) => [
                'id' => $f->id,
                'path' => $f->path,
                'url' => url('/api/marketplace/foto/' . $f->id),
                'ordem' => $f->ordem,
            ])->values(),
            'created_at' => $a->created_at?->toIso8601String(),
        ];
    }

    /**
     * Lista de anuncios visiveis para o condomino. VER e gratis para todos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $condominioId = $user->condominio_activo_id ?? null;

        $anuncios = $this->service->listar(
            $condominioId,
            $request->has('categoria_id') ? (int) $request->input('categoria_id') : null,
            $request->input('tipo'),
            $request->input('q'),
        );

        // Pode publicar? (gate por condomino individual)
        $podePublicar = FeatureGate::has($user, 'marketplace');

        return response()->json([
            'pode_publicar' => $podePublicar,
            'categorias' => MarketplaceCategoria::activas()->get(['id', 'nome', 'slug', 'icone']),
            'anuncios' => collect($anuncios->items())->map(fn ($a) => $this->serializar($a))->values(),
            'pagina' => $anuncios->currentPage(),
            'ultima_pagina' => $anuncios->lastPage(),
        ]);
    }

    /**
     * Detalhe de um anuncio.
     */
    public function show(MarketplaceAnuncio $anuncio): JsonResponse
    {
        $anuncio->load(['categoria', 'fotos']);
        return response()->json(['anuncio' => $this->serializar($anuncio)]);
    }

    /**
     * Os meus anuncios (do utilizador autenticado).
     */
    public function meus(Request $request): JsonResponse
    {
        $anuncios = $this->service->meus($request->user()->id);
        return response()->json([
            'anuncios' => $anuncios->map(fn ($a) => array_merge(
                $this->serializar($a),
                ['estado_moderacao' => $a->estado_moderacao],
            ))->values(),
        ]);
    }

    /**
     * Criar anuncio — REQUER gate (subscricao marketplace activa).
     */
    public function criar(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! FeatureGate::has($user, 'marketplace')) {
            return response()->json([
                'erro' => 'subscricao_necessaria',
                'mensagem' => 'Precisa de uma subscrição activa do Marketplace para publicar anúncios.',
            ], 403);
        }

        $dados = $request->validate([
            'categoria_id' => 'required|exists:marketplace_categorias,id',
            'tipo' => 'required|in:produto,servico',
            'titulo' => 'required|string|max:150',
            'descricao' => 'nullable|string|max:5000',
            'preco' => 'nullable|numeric|min:0',
            'visibilidade' => 'required|in:condominio,plataforma',
            'nome_exibicao' => 'nullable|string|max:80',
            'contacto_telefone' => 'nullable|string|max:30',
            'contacto_whatsapp' => 'nullable|string|max:30',
            'contacto_email' => 'nullable|email|max:120',
        ]);

        $dados['user_id'] = $user->id;
        $dados['condominio_id'] = $user->condominio_activo_id ?? null;
        $dados['empresa_gestora_id'] = $user->empresa_gestora_id ?? null;

        $anuncio = $this->service->criar($dados);
        $anuncio->load(['categoria', 'fotos']);

        return response()->json([
            'sucesso' => true,
            'anuncio' => $this->serializar($anuncio),
        ], 201);
    }

    /**
     * Alterar estado de venda — so o dono.
     */
    public function alterarEstado(Request $request, MarketplaceAnuncio $anuncio): JsonResponse
    {
        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['erro' => 'nao_autorizado'], 403);
        }

        $data = $request->validate([
            'estado_venda' => 'required|in:disponivel,em_negociacao,vendido,cancelado',
        ]);

        $anuncio = $this->service->alterarEstadoVenda($anuncio, $data['estado_venda']);

        return response()->json(['sucesso' => true, 'estado_venda' => $anuncio->estado_venda]);
    }

    /**
     * Denunciar um anuncio.
     */
    public function denunciar(Request $request, MarketplaceAnuncio $anuncio): JsonResponse
    {
        $data = $request->validate([
            'motivo' => 'required|string|max:100',
            'detalhe' => 'nullable|string|max:1000',
        ]);

        $this->service->denunciar($anuncio->id, $request->user()->id, $data['motivo'], $data['detalhe'] ?? null);

        return response()->json(['sucesso' => true]);
    }

    /**
     * Upload de fotos para um anuncio (so o dono). Multipart.
     */
    public function uploadFotos(Request $request, MarketplaceAnuncio $anuncio): JsonResponse
    {
        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['erro' => 'nao_autorizado'], 403);
        }

        $request->validate([
            'fotos' => 'required|array|max:6',
            'fotos.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $ordemBase = (int) $anuncio->fotos()->max('ordem');
        $criadas = [];

        foreach ($request->file('fotos', []) as $i => $ficheiro) {
            $path = $ficheiro->store("marketplace/{$anuncio->id}", 'public');
            $foto = MarketplaceAnuncioFoto::create([
                'anuncio_id' => $anuncio->id,
                'path' => $path,
                'ordem' => $ordemBase + $i + 1,
            ]);
            $criadas[] = ['id' => $foto->id, 'path' => $foto->path, 'ordem' => $foto->ordem];
        }

        return response()->json(['sucesso' => true, 'fotos' => $criadas], 201);
    }


    /**
     * Serve uma foto de anuncio directamente (contorna symlink do LiteSpeed).
     */
    public function verFoto(int $fotoId)
    {
        $foto = MarketplaceAnuncioFoto::find($fotoId);
        if (! $foto || ! Storage::disk('public')->exists($foto->path)) {
            abort(404);
        }

        $conteudo = Storage::disk('public')->get($foto->path);
        $mime = Storage::disk('public')->mimeType($foto->path) ?: 'image/jpeg';

        return response($conteudo, 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=86400');
    }


    /**
     * Editar anuncio (so o dono). Campos: titulo, descricao, preco, categoria, visibilidade, contactos.
     */
    public function editar(Request $request, MarketplaceAnuncio $anuncio): JsonResponse
    {
        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['erro' => 'nao_autorizado'], 403);
        }

        $dados = $request->validate([
            'categoria_id' => 'sometimes|exists:marketplace_categorias,id',
            'tipo' => 'sometimes|in:produto,servico',
            'titulo' => 'sometimes|string|max:150',
            'descricao' => 'nullable|string|max:5000',
            'preco' => 'nullable|numeric|min:0',
            'visibilidade' => 'sometimes|in:condominio,plataforma',
            'nome_exibicao' => 'nullable|string|max:80',
            'contacto_telefone' => 'nullable|string|max:30',
            'contacto_whatsapp' => 'nullable|string|max:30',
            'contacto_email' => 'nullable|email|max:120',
        ]);

        $anuncio->update($dados);
        $anuncio->load(['categoria', 'fotos']);

        return response()->json([
            'sucesso' => true,
            'anuncio' => $this->serializar($anuncio),
        ]);
    }

    /**
     * Apagar uma foto especifica (so o dono).
     */
    public function apagarFoto(Request $request, MarketplaceAnuncio $anuncio, int $fotoId): JsonResponse
    {
        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['erro' => 'nao_autorizado'], 403);
        }

        $foto = MarketplaceAnuncioFoto::where('anuncio_id', $anuncio->id)->where('id', $fotoId)->first();
        if ($foto) {
            Storage::disk('public')->delete($foto->path);
            $foto->delete();
        }

        return response()->json(['sucesso' => true]);
    }


    /**
     * Pedir subscricao do marketplace — gera referencia ProxyPay para o condomino pagar.
     */
    public function subscrever(Request $request, ProxyPayService $proxyPay): JsonResponse
    {
        $user = $request->user();

        // Ja tem subscricao activa?
        if (FeatureGate::has($user, 'marketplace')) {
            return response()->json([
                'erro' => 'ja_subscrito',
                'mensagem' => 'Já tem uma subscrição activa do Marketplace.',
            ], 422);
        }

        $feature = Feature::where('slug', 'marketplace')->first();
        if (! $feature) {
            return response()->json(['erro' => 'feature_indisponivel'], 500);
        }

        $empresaGestoraId = $user->empresa_gestora_id;
        if (! $empresaGestoraId) {
            return response()->json([
                'erro' => 'sem_gestora',
                'mensagem' => 'A sua conta não está associada a uma gestão.',
            ], 422);
        }

        try {
            $ref = $proxyPay->criarReferenciaMarketplace(
                userId: $user->id,
                empresaGestoraId: (int) $empresaGestoraId,
                valor: (float) $feature->preco_base,
                featureId: $feature->id,
            );
        } catch (\Throwable $e) {
            return response()->json([
                'erro' => 'falha_referencia',
                'mensagem' => 'Não foi possível gerar a referência de pagamento. Tente mais tarde.',
            ], 500);
        }

        return response()->json([
            'sucesso' => true,
            'referencia' => [
                'entidade' => $ref->entity_id,
                'referencia' => $ref->reference_id,
                'montante' => (float) $ref->amount,
                'expira_em' => $ref->expira_em?->toIso8601String(),
            ],
            'instrucoes' => 'Pague por Multicaixa, ATM ou app do seu banco. A subscrição activa automaticamente após o pagamento.',
        ]);
    }

}
