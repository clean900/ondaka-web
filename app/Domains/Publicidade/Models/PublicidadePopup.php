<?php

namespace App\Domains\Publicidade\Models;

use Illuminate\Database\Eloquent\Model;

class PublicidadePopup extends Model
{
    protected $table = 'publicidade_popups';

    protected $fillable = [
        'titulo', 'mensagem', 'imagem_path', 'botao_texto',
        'link_url', 'alvo', 'ativo', 'inicio_em', 'fim_em',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'inicio_em' => 'datetime',
        'fim_em' => 'datetime',
    ];

    /**
     * Popups ativos AGORA: marcados ativo + dentro da janela de datas (se definida).
     * $alvo: 'mobile' ou 'web' (filtra os que sao para esse canal ou 'ambos').
     */
    public function scopeAtivoAgora($query, ?string $alvo = null)
    {
        $agora = now();
        $query->where('ativo', true)
            ->where(fn ($q) => $q->whereNull('inicio_em')->orWhere('inicio_em', '<=', $agora))
            ->where(fn ($q) => $q->whereNull('fim_em')->orWhere('fim_em', '>=', $agora));

        if ($alvo) {
            $query->whereIn('alvo', ['ambos', $alvo]);
        }

        return $query;
    }

    public function getImagemUrlAttribute(): ?string
    {
        return $this->imagem_path ? asset('storage/' . $this->imagem_path) : null;
    }
}
