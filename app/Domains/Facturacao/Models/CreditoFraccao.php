<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Crédito a favor do condómino numa fracção.
 *
 * Origem mais comum: conversão de pagamento (parcial/excedente) em saldo.
 *
 * Uso:
 * - manual: admin imputa a um lançamento futuro
 * - automático: deduzido quando um novo pagamento é processado
 *
 * Saldo disponível = valor - valor_usado.
 */
class CreditoFraccao extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'creditos_fraccao';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'fraccao_id',
        'condomino_id',
        'valor',
        'valor_usado',
        'descricao',
        'motivo',
        'pagamento_origem_id',
        'created_by_user_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'valor_usado' => 'decimal:2',
    ];

    /**
     * Saldo disponível (valor - valor_usado), como string para evitar floats.
     */
    public function saldoDisponivel(): string
    {
        return bcsub((string) $this->valor, (string) $this->valor_usado, 2);
    }

    /**
     * True se o crédito ainda tem saldo positivo.
     */
    public function temSaldo(): bool
    {
        return bccomp($this->saldoDisponivel(), '0', 2) > 0;
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function pagamentoOrigem(): BelongsTo
    {
        return $this->belongsTo(Pagamento::class, 'pagamento_origem_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Soma o saldo disponível de todos os créditos não esgotados de uma fracção.
     */
    public static function saldoTotalFraccao(int $fraccaoId): string
    {
        $total = '0';
        $creditos = self::where('fraccao_id', $fraccaoId)->get();
        foreach ($creditos as $c) {
            $disp = $c->saldoDisponivel();
            if (bccomp($disp, '0', 2) > 0) {
                $total = bcadd($total, $disp, 2);
            }
        }
        return $total;
    }
}
