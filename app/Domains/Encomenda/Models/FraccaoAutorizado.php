<?php

namespace App\Domains\Encomenda\Models;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Fraccao;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $fraccao_id
 * @property int $cadastrado_por_condomino_id
 * @property string $nome_completo
 * @property string|null $bi_passport
 * @property string|null $telefone
 * @property string $relacao
 * @property string|null $foto_path
 * @property bool $activo
 */
class FraccaoAutorizado extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'fraccao_autorizados';

    public const RELACAO_CONJUGE = 'conjuge';
    public const RELACAO_FILHO = 'filho';
    public const RELACAO_EMPREGADA = 'empregada';
    public const RELACAO_FAMILIAR = 'familiar';
    public const RELACAO_OUTRO = 'outro';

    protected $fillable = [
        'fraccao_id',
        'cadastrado_por_condomino_id',
        'nome_completo',
        'bi_passport',
        'telefone',
        'relacao',
        'foto_path',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function cadastradoPor(): BelongsTo
    {
        return $this->belongsTo(Condomino::class, 'cadastrado_por_condomino_id');
    }

    public function scopeAtivos(Builder $q): Builder
    {
        return $q->where('activo', true);
    }

    public function scopeDaFraccao(Builder $q, int $fraccaoId): Builder
    {
        return $q->where('fraccao_id', $fraccaoId);
    }
}
