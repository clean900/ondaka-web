<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\PagamentoReferencia;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Pagamento B2C — Empresa Gestora ↔ Condómino.
 *
 * Separado da tabela `pagamentos` (B2B) para isolamento.
 * Vincula-se a lançamentos via `pagamento_imputacoes`.
 */
class Pagamento extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'pagamentos_condomino';

    // Métodos
    public const METODO_TRANSFERENCIA = 'transferencia_bancaria';
    public const METODO_DEPOSITO = 'deposito_bancario';
    public const METODO_PROXYPAY = 'proxypay_rps';
    public const METODO_DINHEIRO = 'dinheiro';
    public const METODO_OUTRO = 'outro';

    // Estados
    public const ESTADO_PENDENTE = 'pendente';
    public const ESTADO_EM_REVISAO = 'em_revisao';
    public const ESTADO_CONFIRMADO = 'confirmado';
    public const ESTADO_REJEITADO = 'rejeitado';
    public const ESTADO_DEVOLVIDO = 'devolvido';

    protected $fillable = [
        'referencia',
        'empresa_gestora_id',
        'condominio_id',
        'fraccao_id',
        'condomino_id',
        'conta_bancaria_id',
        'metodo',
        'valor',
        'moeda',
        'data_pagamento',
        'confirmado_em',
        'rejeitado_em',
        'comprovativo_path',
        'comprovativo_nome_original',
        'comprovativo_mime',
        'comprovativo_tamanho_bytes',
        'confirmacao_pdf_path',
        'referencia_externa',
        'banco_origem',
        'pagamento_referencia_id',
        'estado',
        'motivo_rejeicao',
        'registado_por_user_id',
        'confirmado_por_user_id',
        'notas_admin',
        'notas_condomino',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_pagamento' => 'date',
        'confirmado_em' => 'datetime',
        'rejeitado_em' => 'datetime',
        'comprovativo_tamanho_bytes' => 'integer',
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

    public function pagamentoReferencia(): BelongsTo
    {
        return $this->belongsTo(PagamentoReferencia::class);
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por_user_id');
    }

    public function confirmadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmado_por_user_id');
    }

    public function lancamentos(): BelongsToMany
    {
        return $this->belongsToMany(
            Lancamento::class,
            'pagamento_imputacoes',
            'pagamento_id',
            'lancamento_id'
        )->withPivot('valor')->withTimestamps();
    }

    public function imputacoes(): HasMany
    {
        return $this->hasMany(PagamentoImputacao::class, 'pagamento_id');
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

    public function scopeAValidar(Builder $q): Builder
    {
        return $q->whereIn('estado', [self::ESTADO_PENDENTE, self::ESTADO_EM_REVISAO]);
    }

    public function scopeConfirmados(Builder $q): Builder
    {
        return $q->where('estado', self::ESTADO_CONFIRMADO);
    }

    // Helpers

    public function valorImputado(): float
    {
        return (float) $this->imputacoes->sum('valor');
    }

    public function saldoNaoImputado(): float
    {
        $diff = bcsub((string) $this->valor, (string) $this->valorImputado(), 2);
        return max(0, (float) $diff);
    }

    public function podeSerEditado(): bool
    {
        return in_array($this->estado, [self::ESTADO_PENDENTE, self::ESTADO_EM_REVISAO], true);
    }

    /**
     * Gera próxima referência única — formato PAG-AAAA-NNNNN.
     */
    public static function gerarReferencia(int $empresaGestoraId): string
    {
        $ano = now()->year;
        $prefix = "PAG-{$ano}-";

        $ultimaRef = self::where('empresa_gestora_id', $empresaGestoraId)
            ->where('referencia', 'LIKE', "{$prefix}%")
            ->orderByDesc('id')
            ->value('referencia');

        $proximo = 1;
        if ($ultimaRef && preg_match('/(\d+)$/', $ultimaRef, $m)) {
            $proximo = (int) $m[1] + 1;
        }

        return $prefix . str_pad((string) $proximo, 5, '0', STR_PAD_LEFT);
    }
}
