<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcordoPrestacao extends Model
{
    protected $table = 'acordo_prestacoes';

    protected $fillable = [
        'acordo_id', 'lancamento_id', 'numero', 'valor', 'data_vencimento', 'estado', 'paga_em',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_vencimento' => 'date',
        'paga_em' => 'datetime',
    ];

    public function acordo(): BelongsTo
    {
        return $this->belongsTo(AcordoPagamento::class, 'acordo_id');
    }
}
