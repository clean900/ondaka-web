<?php

namespace App\Domains\Tickets\Models;

use App\Domains\Prestadores\Models\PrestadorAvaliacao;
use App\Domains\Prestadores\Models\PrestadorDestaque;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmpresaPrestadora extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empresas_prestadoras';

    protected $fillable = [
        'empresa_gestora_id',
        'tipo',
        'nome',
        'nif',
        'telefone',
        'email',
        'especialidades',
        'observacoes',
        'ativa',
        'latitude',
        'longitude',
        'foto_path',
        'estado_aprovacao',
        'certificado',
        'certificado_em',
        'aprovado_por',
        'subscricao_activa',
        'subscricao_expira_em',
        'subscricao_valor',
    ];

    protected $casts = [
        'ativa' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'certificado' => 'boolean',
        'certificado_em' => 'datetime',
        'subscricao_activa' => 'boolean',
        'subscricao_expira_em' => 'date',
        'subscricao_valor' => 'decimal:2',
    ];

    public function scopeCertificados($q)
    {
        return $q->where('certificado', true);
    }

    // ─── Scopes existentes (Tickets) ───
    public function scopeAtivas($q)
    {
        return $q->where('ativa', true);
    }

    public function scopeParaEmpresa($q, int $empresaId)
    {
        return $q->where('empresa_gestora_id', $empresaId);
    }

    // ─── Scopes Marketplace ───
    public function scopeTipoGestora($q)
    {
        return $q->where('tipo', 'gestora');
    }

    public function scopeTipoPublico($q)
    {
        return $q->where('tipo', 'publico');
    }

    public function scopeAprovados($q)
    {
        return $q->where('estado_aprovacao', 'aprovado');
    }

    public function scopePendentes($q)
    {
        return $q->where('estado_aprovacao', 'pendente');
    }

    /**
     * Públicos visíveis no marketplace: aprovados + subscrição activa + não expirada.
     */
    public function scopePublicoVisivel($q)
    {
        return $q->where('tipo', 'publico')
            ->where('estado_aprovacao', 'aprovado')
            ->where('subscricao_activa', true)
            ->where(function ($sub) {
                $sub->whereNull('subscricao_expira_em')
                    ->orWhere('subscricao_expira_em', '>=', now()->toDateString());
            });
    }

    // ─── Relações Marketplace ───
    public function avaliacoes(): HasMany
    {
        return $this->hasMany(PrestadorAvaliacao::class, 'empresa_prestadora_id');
    }

    public function destaques(): HasMany
    {
        return $this->hasMany(PrestadorDestaque::class, 'empresa_prestadora_id');
    }

    // ─── Acessores ───
    public function getMediaEstrelasAttribute(): float
    {
        return round((float) $this->avaliacoes()->where('aprovado', true)->avg('estrelas'), 1);
    }

    public function getTotalAvaliacoesAttribute(): int
    {
        return $this->avaliacoes()->where('aprovado', true)->count();
    }
}
