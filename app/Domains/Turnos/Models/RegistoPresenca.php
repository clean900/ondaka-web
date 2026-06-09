<?php

namespace App\Domains\Turnos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RegistoPresenca extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'registos_presenca';

    protected $fillable = [
        'empresa_gestora_id',
        'escala_turno_id',
        'user_id',
        'condominio_id',
        'checkin_em',
        'checkout_em',
        'horas_trabalhadas',
        'observacoes_checkin',
        'observacoes_checkout',
        'ip_checkin',
        'ip_checkout',
    ];

    protected $casts = [
        'checkin_em' => 'datetime',
        'checkout_em' => 'datetime',
        'horas_trabalhadas' => 'decimal:2',
    ];

    public function escala() { return $this->belongsTo(EscalaTurno::class, 'escala_turno_id'); }
    public function user() { return $this->belongsTo(User::class); }
    public function condominio() { return $this->belongsTo(\App\Domains\Condominio\Models\Condominio::class); }

    public function scopeParaEmpresa($q, int $empresaId) { return $q->where('empresa_gestora_id', $empresaId); }
    public function scopeEmCurso($q) { return $q->whereNull('checkout_em'); }
}
