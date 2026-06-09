<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Models;

use App\Domains\Tickets\Models\EmpresaPrestadora;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestadorDestaque extends Model
{
    protected $table = 'prestador_destaques';

    protected $fillable = ['empresa_gestora_id', 'empresa_prestadora_id', 'ordem'];

    protected $casts = [
        'ordem' => 'integer',
    ];

    public function prestadora(): BelongsTo
    {
        return $this->belongsTo(EmpresaPrestadora::class, 'empresa_prestadora_id');
    }
}
