<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Quota mensal de uma fracção.
 *
 * Funciona como AGRUPADOR: quando uma quota é gerada, cria 2 lançamentos
 * na tabela `lancamentos_condomino`:
 *   - tipo='quota_base' (manutenção corrente)
 *   - tipo='fundo_reserva' (reserva legal — Decreto 141/15)
 */
class Quota extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'quotas';

    public const ESTADO_ABERTA = 'aberta';
    public const ESTADO_PAGA_PARCIAL = 'paga_parcial';
    public const ESTADO_PAGA = 'paga';
    public const ESTADO_CANCELADA = 'cancelada';

    public const ORIGEM_AUTOMATICA = 'automatica';
    public const ORIGEM_MANUAL = 'manual';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'fraccao_id',
        'ano',
        'mes',
        'data_referencia',
        'data_vencimento',
        'valor_quota_base',
        'valor_fundo_reserva',
        'valor_total',
        'estado',
        'valor_pago',
        'paga_em',
        'origem_geracao',
        'gerada_por_user_id',
        'observacoes',
    ];

    protected $casts = [
        'ano' => 'integer',
        'mes' => 'integer',
        'data_referencia' => 'date',
        'data_vencimento' => 'date',
        'valor_quota_base' => 'decimal:2',
        'valor_fundo_reserva' => 'decimal:2',
        'valor_total' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'paga_em' => 'datetime',
    ];

    // Relações

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function geradaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gerada_por_user_id');
    }

    public function lancamentos(): HasMany
    {
        return $this->hasMany(Lancamento::class, 'quota_id');
    }

    // Scopes

    public function scopeDoCondominio(Builder $q, int $condominioId): Builder
    {
        return $q->where('condominio_id', $condominioId);
    }

    public function scopeDaFraccao(Builder $q, int $fraccaoId): Builder
    {
        return $q->where('fraccao_id', $fraccaoId);
    }

    public function scopeNoPeriodo(Builder $q, int $ano, int $mes): Builder
    {
        return $q->where('ano', $ano)->where('mes', $mes);
    }

    public function scopeEmAberto(Builder $q): Builder
    {
        return $q->whereIn('estado', [self::ESTADO_ABERTA, self::ESTADO_PAGA_PARCIAL]);
    }

    // Helpers

    public function valorEmDivida(): float
    {
        $diff = bcsub((string) $this->valor_total, (string) $this->valor_pago, 2);
        return max(0, (float) $diff);
    }

    public function estaEmAtraso(): bool
    {
        return $this->estado !== self::ESTADO_PAGA
            && $this->estado !== self::ESTADO_CANCELADA
            && now()->greaterThan($this->data_vencimento);
    }

    /**
     * Recalcula o estado e valor pago a partir dos lançamentos vinculados.
     */
    public function recalcularEstado(): void
    {
        $valorPago = $this->lancamentos()->sum('valor_pago');
        $valorTotal = (float) $this->valor_total;

        $estado = self::ESTADO_ABERTA;
        $pagaEm = null;

        if ($valorPago >= $valorTotal && $valorTotal > 0) {
            $estado = self::ESTADO_PAGA;
            $pagaEm = now();
        } elseif ($valorPago > 0) {
            $estado = self::ESTADO_PAGA_PARCIAL;
        }

        $this->update([
            'valor_pago' => $valorPago,
            'estado' => $estado,
            'paga_em' => $pagaEm,
        ]);
    }
}
