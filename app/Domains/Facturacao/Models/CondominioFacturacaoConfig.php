<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Configuração de facturação por condomínio.
 *
 * Define regras de geração de quotas, vencimentos, multas, e dados
 * bancários a apresentar nos extractos.
 */
class CondominioFacturacaoConfig extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'condominio_facturacao_config';

    public const MULTA_TIPO_FIXA = 'fixa';
    public const MULTA_TIPO_PERCENTAGEM = 'percentagem';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'geracao_automatica',
        'dia_geracao',
        'dia_vencimento',
        'limitar_acesso_divida',
        'meses_limite_acesso',
        'acordo_min_prestacoes',
        'acordo_max_prestacoes',
        'acordo_entrada_minima_pct',
        'acordo_juro_pct',
        'multa_activa',
        'dias_tolerancia_multa',
        'multa_valor_kz',
        'multa_tipo',
        'multa_percentagem',
        'multa_recorrente',
        'multa_percentagem_base',
        'banco_nome',
        'iban',
        'numero_conta',
        'titular_conta',
        'nif_emissor',
        'observacoes_facturacao',
        'proxypay_entity_id',
        'proxypay_api_token',
        'proxypay_sandbox',
        'proxypay_activo',
        'transparencia_financeira',
    ];

    protected $casts = [
        'geracao_automatica' => 'boolean',
        'dia_geracao' => 'integer',
        'dia_vencimento' => 'integer',
        'multa_activa' => 'boolean',
        'dias_tolerancia_multa' => 'integer',
        'multa_valor_kz' => 'decimal:2',
        'multa_percentagem' => 'decimal:2',
        'multa_recorrente' => 'boolean',
        'proxypay_entity_id' => 'integer',
        'proxypay_sandbox' => 'boolean',
        'proxypay_activo' => 'boolean',
        'transparencia_financeira' => 'boolean',
    ];

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    /**
     * Calcula o valor da multa para um lançamento em atraso.
     */
    public function calcularMulta(float $valorEmDivida): float
    {
        if (! $this->multa_activa) {
            return 0;
        }

        if ($this->multa_tipo === self::MULTA_TIPO_PERCENTAGEM && $this->multa_percentagem) {
            return round($valorEmDivida * ((float) $this->multa_percentagem / 100), 2);
        }

        return (float) $this->multa_valor_kz;
    }

    /**
     * Retorna o config do condomínio, criando defaults se não existir.
     */
    public static function paraCondominio(int $condominioId, int $empresaGestoraId): self
    {
        return self::firstOrCreate(
            ['condominio_id' => $condominioId],
            [
                'empresa_gestora_id' => $empresaGestoraId,
                'geracao_automatica' => true,
                'dia_geracao' => 1,
                'dia_vencimento' => 8,
                'multa_activa' => true,
                'dias_tolerancia_multa' => 7,
                'multa_valor_kz' => 5000.00,
                'multa_tipo' => self::MULTA_TIPO_FIXA,
            ]
        );
    }
}
