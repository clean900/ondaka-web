<?php

declare(strict_types=1);

namespace App\Domains\Reserva\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReservaEspaco extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'reserva_espacos';
    protected $fillable = [
        'empresa_gestora_id', 'condominio_id', 'nome', 'descricao',
        'hora_abertura', 'hora_fecho', 'duracao_min_horas', 'duracao_max_horas',
        'antecedencia_min_horas', 'antecedencia_max_dias',
        'tem_caucao', 'valor_caucao', 'activo',
    ];
    protected $casts = [
        'tem_caucao' => 'boolean',
        'activo' => 'boolean',
        'valor_caucao' => 'decimal:2',
        'duracao_min_horas' => 'integer',
        'duracao_max_horas' => 'integer',
        'antecedencia_min_horas' => 'integer',
        'antecedencia_max_dias' => 'integer',
    ];

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class, 'espaco_id');
    }
}
