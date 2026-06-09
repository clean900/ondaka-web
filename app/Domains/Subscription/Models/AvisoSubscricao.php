<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisoSubscricao extends Model
{
    use HasFactory;

    protected $table = 'avisos_subscricao';

    protected $fillable = [
        'empresa_gestora_id', 'subscricao_id',
        'tipo', 'canal', 'destinatario',
        'estado', 'enviado_em', 'erro', 'contexto',
    ];

    protected $casts = [
        'enviado_em' => 'datetime',
        'contexto' => 'array',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function subscricao(): BelongsTo
    {
        return $this->belongsTo(Subscricao::class);
    }

    /**
     * Verifica se já foi enviado um aviso deste tipo à empresa
     * dentro do período (evita duplicados).
     */
    public static function jaEnviado(int $empresaId, string $tipo, int $horasWindow = 20): bool
    {
        return self::where('empresa_gestora_id', $empresaId)
            ->where('tipo', $tipo)
            ->where('estado', 'enviado')
            ->where('enviado_em', '>=', now()->subHours($horasWindow))
            ->exists();
    }

    public function marcarEnviado(): void
    {
        $this->update([
            'estado' => 'enviado',
            'enviado_em' => now(),
            'erro' => null,
        ]);
    }

    public function marcarFalhou(string $erro): void
    {
        $this->update([
            'estado' => 'falhou',
            'erro' => $erro,
        ]);
    }
}
