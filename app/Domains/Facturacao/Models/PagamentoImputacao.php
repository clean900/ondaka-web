<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Imputação — distribuição de um pagamento por lançamentos.
 *
 * Permite "1 pagamento de 50.000 Kz paga 3 lançamentos diferentes":
 *  - 15.000 → quota_base de Maio
 *  - 5.000  → fundo_reserva de Maio
 *  - 30.000 → despesa_extra
 *
 * Quando uma imputacao é criada/apagada, o valor_pago do lançamento
 * deve ser recalculado (Lancamento::recalcularEstado()).
 */
class PagamentoImputacao extends Model
{
    use HasFactory;

    protected $table = 'pagamento_imputacoes';

    protected $fillable = [
        'pagamento_id',
        'lancamento_id',
        'valor',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
    ];

    public function pagamento(): BelongsTo
    {
        return $this->belongsTo(Pagamento::class);
    }

    public function lancamento(): BelongsTo
    {
        return $this->belongsTo(Lancamento::class);
    }

    /**
     * Boot — auto-recalcular estado do lançamento ao criar/apagar imputação.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::saved(function (self $imputacao) {
            $imputacao->lancamento?->recalcularEstado();
        });

        static::deleted(function (self $imputacao) {
            $imputacao->lancamento?->recalcularEstado();
        });
    }
}
