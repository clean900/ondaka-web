<?php

declare(strict_types=1);

namespace App\Domains\Financas\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContaBancariaMovimento extends Model
{
    use HasFactory;

    protected $table = 'contas_bancarias_movimentos';

    protected $fillable = [
        'conta_bancaria_id',
        'data',
        'tipo',
        'descricao',
        'valor',
        'saldo_apos',
        'origem_tipo',
        'origem_id',
        'criado_por_user_id',
    ];

    protected $casts = [
        'data' => 'date',
        'valor' => 'decimal:2',
        'saldo_apos' => 'decimal:2',
    ];

    public function conta(): BelongsTo
    {
        return $this->belongsTo(ContaBancaria::class, 'conta_bancaria_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_user_id');
    }
}
