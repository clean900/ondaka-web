<?php

namespace App\Domains\Turnos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EscalaTurno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'escala_turnos';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'turno_modelo_id',
        'user_id',
        'data',
        'inicio_previsto',
        'fim_previsto',
        'estado',
        'criado_por_user_id',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date',
        'inicio_previsto' => 'datetime',
        'fim_previsto' => 'datetime',
    ];

    public function turnoModelo() { return $this->belongsTo(TurnoModelo::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function criadoPor() { return $this->belongsTo(User::class, 'criado_por_user_id'); }
    public function condominio() { return $this->belongsTo(\App\Domains\Condominio\Models\Condominio::class); }
    public function presencas() { return $this->hasMany(RegistoPresenca::class, 'escala_turno_id'); }

    public function scopeParaEmpresa($q, int $empresaId) { return $q->where('empresa_gestora_id', $empresaId); }
}
