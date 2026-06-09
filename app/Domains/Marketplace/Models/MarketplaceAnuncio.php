<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketplaceAnuncio extends Model
{
    use SoftDeletes;

    protected $table = 'marketplace_anuncios';

    protected $fillable = [
        'user_id', 'condominio_id', 'empresa_gestora_id', 'categoria_id',
        'tipo', 'titulo', 'descricao', 'preco', 'visibilidade',
        'estado_venda', 'estado_moderacao', 'nome_exibicao',
        'contacto_telefone', 'contacto_whatsapp', 'contacto_email',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(MarketplaceCategoria::class, 'categoria_id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(MarketplaceAnuncioFoto::class, 'anuncio_id')->orderBy('ordem');
    }

    public function denuncias(): HasMany
    {
        return $this->hasMany(MarketplaceDenuncia::class, 'anuncio_id');
    }

    // Apenas anuncios visiveis (nao removidos pela moderacao)
    public function scopeVisiveis($query)
    {
        return $query->where('estado_moderacao', 'activo');
    }

    // So mostra anuncios cujo dono tem subscricao marketplace activa (nao expirada).
    // Usado apenas na listagem publica; o dono ve sempre os seus via meus().
    public function scopeDeAutorComSubscricaoActiva($query)
    {
        return $query->whereExists(function ($q) {
            $q->selectRaw('1')
              ->from('feature_subscriptions as fs')
              ->join('features as ft', 'ft.id', '=', 'fs.feature_id')
              ->whereColumn('fs.owner_id', 'marketplace_anuncios.user_id')
              ->where('fs.owner_type', \App\Models\User::class)
              ->where('ft.slug', 'marketplace')
              ->where('fs.estado', 'activa')
              ->where(function ($w) {
                  $w->whereNull('fs.expira_em')
                    ->orWhere('fs.expira_em', '>', now());
              });
        });
    }

    // Filtro de visibilidade para um condomino:
    // ve os anuncios marcados 'plataforma' (toda a rede)
    // + os 'condominio' do SEU proprio condominio
    public function scopeParaCondomino($query, ?int $condominioId)
    {
        return $query->where(function ($q) use ($condominioId) {
            $q->where('visibilidade', 'plataforma')
              ->orWhere(function ($q2) use ($condominioId) {
                  $q2->where('visibilidade', 'condominio')
                     ->where('condominio_id', $condominioId);
              });
        });
    }
}
