<?php

declare(strict_types=1);

namespace App\Domains\Payment\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Factura extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'facturas';

    protected $fillable = [
        'numero', 'serie', 'numero_sequencial', 'tipo_documento',
        'ordem_compra_id',
        'destinatario_nome', 'destinatario_nif', 'destinatario_morada',
        'destinatario_provincia', 'destinatario_municipio',
        'destinatario_email', 'destinatario_telefone',
        'emissor_nome', 'emissor_nif', 'emissor_morada',
        'valor_base', 'valor_desconto', 'valor_iva', 'taxa_iva',
        'valor_total', 'valor_pago', 'moeda',
        'data_emissao', 'data_vencimento',
        'estado', 'hash_integridade', 'pdf_path',
        'linhas', 'observacoes',
        'emitida_por_user_id',
    ];

    protected $casts = [
        'numero_sequencial' => 'integer',
        'valor_base' => 'decimal:2',
        'valor_desconto' => 'decimal:2',
        'valor_iva' => 'decimal:2',
        'taxa_iva' => 'decimal:2',
        'valor_total' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'data_emissao' => 'date',
        'data_vencimento' => 'date',
        'linhas' => 'array',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function ordem(): BelongsTo
    {
        return $this->belongsTo(OrdemCompra::class, 'ordem_compra_id');
    }

    public function emitidaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'emitida_por_user_id');
    }

    /* ============================================
       VERIFICAÇÕES
       ============================================ */

    public function estaPaga(): bool
    {
        return $this->estado === 'paga';
    }

    public function temPdf(): bool
    {
        return ! empty($this->pdf_path);
    }

    /* ============================================
       LABELS
       ============================================ */

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'rascunho' => 'Rascunho',
            'emitida' => 'Emitida',
            'paga' => 'Paga',
            'anulada' => 'Anulada',
            default => ucfirst($this->estado),
        };
    }

    public function getTipoDocumentoLabelAttribute(): string
    {
        return match ($this->tipo_documento) {
            'FT' => 'Factura',
            'FR' => 'Factura-Recibo',
            'NC' => 'Nota de Crédito',
            'ND' => 'Nota de Débito',
            'RC' => 'Recibo',
            default => $this->tipo_documento,
        };
    }
}
