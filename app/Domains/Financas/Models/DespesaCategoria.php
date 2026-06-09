<?php

declare(strict_types=1);

namespace App\Domains\Financas\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DespesaCategoria extends Model
{
    use HasFactory;

    protected $table = 'despesa_categorias';

    protected $fillable = [
        'empresa_gestora_id',
        'nome',
        'slug',
        'icone',
        'cor',
        'ordem',
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
        'ordem' => 'integer',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function despesas(): HasMany
    {
        return $this->hasMany(Despesa::class, 'categoria_id');
    }
}
