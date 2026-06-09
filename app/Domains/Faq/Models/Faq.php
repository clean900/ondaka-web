<?php

namespace App\Domains\Faq\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faq extends Model
{
    use HasFactory;

    protected $table = 'faqs';

    protected $fillable = [
        'condominio_id',
        'empresa_gestora_id',
        'categoria',
        'pergunta',
        'resposta',
        'palavras_chave',
        'ordem',
        'activa',
        'vezes_respondida',
        'util_sim',
        'util_nao',
        'criada_por_user_id',
    ];

    protected $casts = [
        'activa' => 'boolean',
        'ordem' => 'integer',
        'vezes_respondida' => 'integer',
        'util_sim' => 'integer',
        'util_nao' => 'integer',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function criadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criada_por_user_id');
    }

    public function incrementarRespondida(): void
    {
        $this->increment('vezes_respondida');
    }

    public function marcarUtil(bool $util): void
    {
        $this->increment($util ? 'util_sim' : 'util_nao');
    }

    /**
     * Devolve as palavras-chave como array limpo.
     */
    public function getPalavrasChaveArrayAttribute(): array
    {
        if (! $this->palavras_chave) {
            return [];
        }

        return collect(explode(',', $this->palavras_chave))
            ->map(fn ($p) => trim(mb_strtolower($p)))
            ->filter()
            ->values()
            ->all();
    }
}
