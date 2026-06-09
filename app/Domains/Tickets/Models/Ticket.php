<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'aberto_por_user_id',
        'fraccao_id',
        'atribuido_a_user_id',
        'titulo',
        'descricao',
        'tipo',
        'categoria_id',
        'categoria',
        'prioridade',
        'estado',
        'atribuido_em',
        'resolvido_em',
        'fechado_em',
        'threads_publicas',
    ];

    protected $casts = [
        'atribuido_em' => 'datetime',
        'resolvido_em' => 'datetime',
        'fechado_em' => 'datetime',
        'threads_publicas' => 'boolean',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function abertoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aberto_por_user_id');
    }

    public function atribuidoA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atribuido_a_user_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(TicketComentario::class)->orderBy('created_at');
    }

    public function comentariosPublicos(): HasMany
    {
        return $this->hasMany(TicketComentario::class)
            ->where('publico', true)
            ->orderBy('created_at');
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(TicketFoto::class);
    }

    public function scopeParaEmpresa(Builder $query, int $empresaId): Builder
    {
        return $query->where('empresa_gestora_id', $empresaId);
    }

    public function estaAberto(): bool
    {
        return ! in_array($this->estado, ['resolvido', 'fechado', 'cancelado'], true);
    }

    public function podeSerComentadoPor(User $user): bool
    {
        if ($user->id === $this->aberto_por_user_id && $this->threads_publicas) {
            return true;
        }
        return $user->hasAnyRole(['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio']);
    }
}
