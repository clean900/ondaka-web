<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Entrada da Lista Negra de Visitantes.
 * Banimento por BI, matrícula ou nome, ao nível do condomínio ou (se
 * partilhar_empresa) de toda a empresa gestora.
 */
class VisitanteBanido extends Model
{
    use SoftDeletes;

    protected $table = 'visitantes_banidos';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'tipo',
        'valor',
        'valor_normalizado',
        'motivo',
        'partilhar_empresa',
        'criado_por_user_id',
    ];

    protected $casts = [
        'partilhar_empresa' => 'boolean',
    ];

    /**
     * Normaliza um valor para comparação: maiúsculas, sem espaços, traços ou pontos.
     * Ex.: "AB-12-34" e "ab 1234" → "AB1234".
     */
    public static function normalizar(string $valor): string
    {
        $semAcentos = (string) preg_replace('/[\s\.\-\/]+/u', '', trim($valor));
        return mb_strtoupper($semAcentos);
    }
}
