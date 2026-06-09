<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Models;

use App\Models\User;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Condominio\Models\Condominio;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ConviteUtilizador extends Model
{
    protected $table = 'convites_utilizadores';

    protected $fillable = [
        'token', 'email', 'nome', 'telefone', 'role_name',
        'empresa_gestora_id', 'condominio_id', 'fraccao_id',
        'convidado_por_user_id', 'expira_em', 'usado_em',
        'user_criado_id', 'cancelado_em',
    ];

    protected $casts = [
        'expira_em' => 'datetime',
        'usado_em' => 'datetime',
        'cancelado_em' => 'datetime',
    ];

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class, 'condominio_id');
    }

    public function convidadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'convidado_por_user_id');
    }

    public function userCriado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_criado_id');
    }

    public function estaValido(): bool
    {
        return $this->usado_em === null
            && $this->cancelado_em === null
            && $this->expira_em->isFuture();
    }

    public function estado(): string
    {
        if ($this->cancelado_em) return 'cancelado';
        if ($this->usado_em) return 'usado';
        if ($this->expira_em->isPast()) return 'expirado';
        return 'pendente';
    }
}
