<?php

namespace App\Domains\Encomenda\Models;

use App\Domains\Condominio\Models\Condominio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $condominio_id
 * @property float $multa_valor_padrao_kz
 * @property int $dias_aviso
 * @property int $dias_multa
 * @property bool $permite_pagamento_proxypay
 * @property bool $permite_pagamento_extracto
 * @property bool $permite_pagamento_dinheiro
 */
class CondominioEncomendaConfig extends Model
{
    use HasFactory;

    protected $table = 'condominio_encomenda_config';

    protected $fillable = [
        'condominio_id',
        'multa_valor_padrao_kz',
        'dias_aviso',
        'dias_multa',
        'permite_pagamento_proxypay',
        'permite_pagamento_extracto',
        'permite_pagamento_dinheiro',
    ];

    protected $casts = [
        'multa_valor_padrao_kz' => 'decimal:2',
        'dias_aviso' => 'integer',
        'dias_multa' => 'integer',
        'permite_pagamento_proxypay' => 'boolean',
        'permite_pagamento_extracto' => 'boolean',
        'permite_pagamento_dinheiro' => 'boolean',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    /**
     * Retorna a config do condomínio (cria com defaults se não existir).
     */
    public static function paraCondominio(int $condominioId): self
    {
        return self::firstOrCreate(
            ['condominio_id' => $condominioId],
            [
                'multa_valor_padrao_kz' => 5000,
                'dias_aviso' => 5,
                'dias_multa' => 7,
            ],
        );
    }
}
