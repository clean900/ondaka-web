<?php
declare(strict_types=1);
namespace App\Models;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles, HasApiTokens;
    protected $fillable = [
        'empresa_gestora_id', 'name', 'email', 'password',
        'telefone', 'bi_numero', 'bi_validade', 'nif', 'foto_path',
        'sms_2fa_enabled', 'sms_2fa_confirmed_at',
        'estado', 'locale', 'ultimo_login_em', 'ultimo_login_ip',
        'condominio_activo_id',
        'condominios_atribuidos',
        'must_change_password',
    ];
    protected $hidden = [
        'password', 'remember_token',
    ];
    protected function casts(): array
    {
        return [
            'condominios_atribuidos' => 'array',
            'email_verified_at' => 'datetime',
            'bi_validade' => 'date',
            'sms_2fa_enabled' => 'boolean',
            'sms_2fa_confirmed_at' => 'datetime',
            'ultimo_login_em' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }
    public function codigosVerificacao(): HasMany
    {
        return $this->hasMany(CodigoVerificacaoSms::class);
    }
    public function estaAtivo(): bool
    {
        return $this->estado === 'activo';
    }
    public function precisaDoisFactores(): bool
    {
        if (env("DOIS_FACTORES_ACTIVO", true) === false) {
            return false;
        }
        return $this->hasAnyRole([
            "super-admin", "admin-empresa", "gestor", "administrador-condominio",
        ]);
    }
    public function ehSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }
}
