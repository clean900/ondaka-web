<?php

declare(strict_types=1);

namespace App\Domains\Feature\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeaturePacote extends Model
{
    use HasFactory;

    protected $table = 'feature_pacotes';

    protected $fillable = [
        'feature_id', 'nome', 'slug',
        'quantidade', 'preco', 'valor_unitario',
        'destaque', 'descricao', 'ordem', 'activo',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'preco' => 'decimal:2',
        'valor_unitario' => 'decimal:4',
        'destaque' => 'boolean',
        'activo' => 'boolean',
        'ordem' => 'integer',
    ];

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function getPrecoFormatadoAttribute(): string
    {
        return number_format((float) $this->preco, 0, ',', '.') . ' Kz';
    }

    public function getValorUnitarioFormatadoAttribute(): string
    {
        return number_format((float) $this->valor_unitario, 2, ',', '.') . ' Kz';
    }
}
