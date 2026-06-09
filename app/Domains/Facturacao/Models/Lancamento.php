<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Lançamento no extracto do condómino.
 *
 * Representa um DÉBITO (dívida) — quotas, multas, despesas extras.
 * Pagamentos são tratados via `pagamentos_condomino` + `pagamento_imputacoes`.
 */
class Lancamento extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'lancamentos_condomino';

    // Tipos de lançamento
    public const TIPO_QUOTA_BASE = 'quota_base';
    public const TIPO_FUNDO_RESERVA = 'fundo_reserva';
    public const TIPO_DESPESA_EXTRA = 'despesa_extra';
    public const TIPO_MULTA = 'multa';
    public const TIPO_JUROS = 'juros';
    public const TIPO_AJUSTE_CREDITO = 'ajuste_credito';
    public const TIPO_AJUSTE_DEBITO = 'ajuste_debito';

    // Estados
    public const ESTADO_EM_ABERTO = 'em_aberto';
    public const ESTADO_PAGO_PARCIAL = 'pago_parcial';
    public const ESTADO_PAGO = 'pago';
    public const ESTADO_CANCELADO = 'cancelado';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'fraccao_id',
        'condomino_id',
        'quota_id',
        'tipo',
        'descricao',
        'detalhes',
        'valor',
        'data_lancamento',
        'data_vencimento',
        'estado',
        'valor_pago',
        'pago_em',
        'lancamento_origem_id',
        'criado_por_user_id',
        'cancelado_por_user_id',
        'cancelado_em',
        'motivo_cancelamento',
        'observacoes',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'data_lancamento' => 'date',
        'data_vencimento' => 'date',
        'pago_em' => 'datetime',
        'cancelado_em' => 'datetime',
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

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function quota(): BelongsTo
    {
        return $this->belongsTo(Quota::class);
    }

    public function lancamentoOrigem(): BelongsTo
    {
        return $this->belongsTo(self::class, 'lancamento_origem_id');
    }

    public function multasGeradas(): HasMany
    {
        return $this->hasMany(self::class, 'lancamento_origem_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_user_id');
    }

    public function pagamentos(): BelongsToMany
    {
        return $this->belongsToMany(
            Pagamento::class,
            'pagamento_imputacoes',
            'lancamento_id',
            'pagamento_id'
        )->withPivot('valor')->withTimestamps();
    }

    public function imputacoes(): HasMany
    {
        return $this->hasMany(PagamentoImputacao::class, 'lancamento_id');
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

    public function scopeDoCondomino(Builder $q, int $condominoId): Builder
    {
        return $q->where('condomino_id', $condominoId);
    }

    public function scopeEmAberto(Builder $q): Builder
    {
        return $q->whereIn('estado', [self::ESTADO_EM_ABERTO, self::ESTADO_PAGO_PARCIAL]);
    }

    public function scopeEmAtraso(Builder $q): Builder
    {
        return $q->emAberto()
            ->whereNotNull('data_vencimento')
            ->where('data_vencimento', '<', now()->toDateString());
    }

    public function scopeDoTipo(Builder $q, string $tipo): Builder
    {
        return $q->where('tipo', $tipo);
    }

    // Helpers

    public function valorEmDivida(): float
    {
        // Usar bcsub para evitar imprecisão de floats com decimal(14,2)
        $diff = bcsub((string) $this->valor, (string) $this->valor_pago, 2);
        return max(0, (float) $diff);
    }

    public function estaEmAtraso(): bool
    {
        return ! in_array($this->estado, [self::ESTADO_PAGO, self::ESTADO_CANCELADO], true)
            && $this->data_vencimento !== null
            && now()->greaterThan($this->data_vencimento);
    }

    /**
     * Recalcula estado e valor_pago a partir das imputações recebidas.
     * Soma apenas pagamentos com estado='confirmado'.
     */
    public function recalcularEstado(): void
    {
        $valorPago = $this->imputacoes()
            ->whereHas('pagamento', fn ($q) => $q->where('estado', Pagamento::ESTADO_CONFIRMADO))
            ->sum('valor');

        $valor = (float) $this->valor;
        $estado = self::ESTADO_EM_ABERTO;
        $pagoEm = null;

        if ($valorPago >= $valor && $valor > 0) {
            $estado = self::ESTADO_PAGO;
            $pagoEm = now();
        } elseif ($valorPago > 0) {
            $estado = self::ESTADO_PAGO_PARCIAL;
        }

        $this->update([
            'valor_pago' => $valorPago,
            'estado' => $estado,
            'pago_em' => $pagoEm,
        ]);

        // Se este lançamento pertence a uma quota, recalcular também a quota
        if ($this->quota_id) {
            $this->quota?->recalcularEstado();
        }
    }
}
