<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Services;

use App\Domains\Marketplace\Models\MarketplaceAnuncio;
use App\Domains\Marketplace\Models\MarketplaceDenuncia;
use Illuminate\Support\Facades\DB;

class MarketplaceService
{
    public function listar(
        ?int $condominioId,
        ?int $categoriaId = null,
        ?string $tipo = null,
        ?string $procura = null,
    ) {
        $query = MarketplaceAnuncio::query()
            ->visiveis()
            ->deAutorComSubscricaoActiva()
            ->paraCondomino($condominioId)
            ->where('estado_venda', '!=', 'cancelado')
            ->with(['categoria:id,nome,slug,icone', 'fotos:id,anuncio_id,path,ordem']);

        if ($categoriaId) {
            $query->where('categoria_id', $categoriaId);
        }
        if ($tipo && in_array($tipo, ['produto', 'servico'], true)) {
            $query->where('tipo', $tipo);
        }
        if ($procura) {
            $query->where(function ($q) use ($procura) {
                $q->where('titulo', 'like', "%{$procura}%")
                  ->orWhere('descricao', 'like', "%{$procura}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function meus(int $userId)
    {
        return MarketplaceAnuncio::query()
            ->where('user_id', $userId)
            ->with(['categoria:id,nome,slug,icone', 'fotos:id,anuncio_id,path,ordem'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function criar(array $dados): MarketplaceAnuncio
    {
        return DB::transaction(function () use ($dados) {
            return MarketplaceAnuncio::create($dados);
        });
    }

    public function alterarEstadoVenda(MarketplaceAnuncio $anuncio, string $estado): MarketplaceAnuncio
    {
        $validos = ['disponivel', 'em_negociacao', 'vendido', 'cancelado'];
        if (in_array($estado, $validos, true)) {
            $anuncio->update(['estado_venda' => $estado]);
        }
        return $anuncio->fresh();
    }

    public function denunciar(int $anuncioId, int $userId, string $motivo, ?string $detalhe = null): MarketplaceDenuncia
    {
        return MarketplaceDenuncia::create([
            'anuncio_id' => $anuncioId,
            'user_id' => $userId,
            'motivo' => $motivo,
            'detalhe' => $detalhe,
            'estado' => 'pendente',
        ]);
    }
}
