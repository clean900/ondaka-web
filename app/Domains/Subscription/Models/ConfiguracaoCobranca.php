<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfiguracaoCobranca extends Model
{
    use HasFactory;

    protected $table = 'configuracoes_cobranca';

    protected $fillable = [
        'empresa_gestora_id',
        'comportamento_saldo_zero',
        'limite_credito_cortesia',
        'email_facturacao', 'nif_facturacao',
        'morada_facturacao', 'designacao_fiscal',
        'notificar_saldo_baixo_email',
        'notificar_saldo_baixo_sms',
        'limite_saldo_baixo_pct',
        'metodo_pagamento_preferido',
    ];

    protected $casts = [
        'limite_credito_cortesia' => 'decimal:2',
        'notificar_saldo_baixo_email' => 'boolean',
        'notificar_saldo_baixo_sms' => 'boolean',
        'limite_saldo_baixo_pct' => 'decimal:2',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    /**
     * Devolve configuração da empresa ou defaults se não existir.
     */
    public static function paraEmpresa(int $empresaGestoraId): self
    {
        return self::firstOrCreate(
            ['empresa_gestora_id' => $empresaGestoraId],
            [
                'comportamento_saldo_zero' => 'bloqueia',
                'limite_credito_cortesia' => 0,
                'notificar_saldo_baixo_email' => true,
                'notificar_saldo_baixo_sms' => false,
                'limite_saldo_baixo_pct' => 20,
                'metodo_pagamento_preferido' => 'transferencia_bancaria',
            ]
        );
    }

    public function bloqueiaSaldoZero(): bool
    {
        return $this->comportamento_saldo_zero === 'bloqueia';
    }

    public function permiteCortesia(): bool
    {
        return $this->comportamento_saldo_zero === 'cortesia';
    }

    public function facturaFimMes(): bool
    {
        return $this->comportamento_saldo_zero === 'factura_fim_mes';
    }
}
