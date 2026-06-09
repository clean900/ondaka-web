<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aviso extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'avisos';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'autor_user_id',
        'titulo',
        'descricao',
        'categoria',
        'prioridade',
        'estado',
        'publicar_em',
        'publicado_em',
        'arquivar_em',
        'permite_comentarios',
        'requer_confirmacao',
        'notificar_push',
        'notificar_email',
        'notificar_sms',
    ];

    protected $casts = [
        'publicar_em' => 'datetime',
        'publicado_em' => 'datetime',
        'arquivar_em' => 'datetime',
        'permite_comentarios' => 'boolean',
        'requer_confirmacao' => 'boolean',
        'notificar_push' => 'boolean',
        'notificar_email' => 'boolean',
        'notificar_sms' => 'boolean',
    ];

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'autor_user_id');
    }

    public function segmentacoes(): HasMany
    {
        return $this->hasMany(AvisoSegmentacao::class);
    }

    public function anexos(): HasMany
    {
        return $this->hasMany(AvisoAnexo::class);
    }

    public function leituras(): HasMany
    {
        return $this->hasMany(AvisoLeitura::class);
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(AvisoComentario::class)->whereNull('parent_id');
    }

    public function todosComentarios(): HasMany
    {
        return $this->hasMany(AvisoComentario::class);
    }

    /**
     * Scope: apenas avisos visíveis ao público (publicados, não-arquivados).
     */
    public function scopePublicados($query)
    {
        return $query->where('estado', 'publicado');
    }

    /**
     * Scope: avisos para esta empresa.
     */
    public function scopeParaEmpresa($query, int $empresaId)
    {
        return $query->where('empresa_gestora_id', $empresaId);
    }

    /**
     * Verifica se o aviso já foi publicado.
     */
    public function eVisivel(): bool
    {
        return $this->estado === 'publicado';
    }

    /**
     * Marca o aviso como publicado agora.
     */
    public function marcarPublicado(): void
    {
        $this->update([
            'estado' => 'publicado',
            'publicado_em' => now(),
        ]);
    }
}
