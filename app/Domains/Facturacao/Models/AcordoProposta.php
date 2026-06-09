<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcordoProposta extends Model
{
    protected $table = 'acordo_propostas';

    protected $fillable = [
        'acordo_id', 'autor', 'ronda', 'num_prestacoes',
        'valor_com_juro', 'valor_entrada', 'observacoes', 'autor_user_id',
    ];

    protected $casts = [
        'valor_com_juro' => 'decimal:2',
        'valor_entrada' => 'decimal:2',
    ];

    public function acordo(): BelongsTo
    {
        return $this->belongsTo(AcordoPagamento::class, 'acordo_id');
    }
}
