<?php

declare(strict_types=1);

namespace App\Domains\Payment\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pagamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pagamentos';

    protected $fillable = [
        'referencia', 'ordem_compra_id', 'metodo',
        'valor', 'moeda',
        'referencia_externa', 'data_transacao',
        'banco_origem', 'conta_origem', 'nome_ordenante',
        'comprovativo_path', 'comprovativo_original_name',
        'comprovativo_mime', 'comprovativo_tamanho_bytes',
        'estado', 'confirmado_em', 'rejeitado_em',
        'notas', 'motivo_rejeicao',
        'registado_por_user_id', 'confirmado_por_user_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_transacao' => 'date',
        'confirmado_em' => 'datetime',
        'rejeitado_em' => 'datetime',
        'comprovativo_tamanho_bytes' => 'integer',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function ordem(): BelongsTo
    {
        return $this->belongsTo(OrdemCompra::class, 'ordem_compra_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por_user_id');
    }

    public function confirmadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmado_por_user_id');
    }

    /* ============================================
       VERIFICAÇÕES
       ============================================ */

    public function estaConfirmado(): bool
    {
        return $this->estado === 'confirmado';
    }

    public function temComprovativo(): bool
    {
        return ! empty($this->comprovativo_path);
    }

    /* ============================================
       LABELS
       ============================================ */

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'registado' => 'Registado',
            'em_analise' => 'Em análise',
            'confirmado' => 'Confirmado',
            'rejeitado' => 'Rejeitado',
            'devolvido' => 'Devolvido',
            default => ucfirst($this->estado),
        };
    }

    public function getMetodoLabelAttribute(): string
    {
        return match ($this->metodo) {
            'transferencia_bancaria' => 'Transferência bancária',
            'deposito_bancario' => 'Depósito bancário',
            'proxypay_rps' => 'Referência Multicaixa (RPS)',
            'proxypay_dds' => 'Débito directo (DDS)',
            'multicaixa_express' => 'Multicaixa Express',
            'outro' => 'Outro',
            default => $this->metodo,
        };
    }

    public function getComprovativoTamanhoFormatadoAttribute(): string
    {
        if (! $this->comprovativo_tamanho_bytes) return '—';
        $bytes = (int) $this->comprovativo_tamanho_bytes;
        if ($bytes < 1024) return $bytes.' B';
        if ($bytes < 1048576) return number_format($bytes / 1024, 1).' KB';
        return number_format($bytes / 1048576, 1).' MB';
    }
}
