<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * F-01: modelo (template) de documentação de uma empresa gestora.
 * Categorias: contrato, regulamento, outro. Ficheiro servido via /ficheiros/.
 */
class ModeloDocumento extends Model
{
    protected $table = 'modelos_documentos';

    protected $fillable = [
        'empresa_gestora_id',
        'categoria',
        'nome',
        'descricao',
        'ficheiro_path',
        'visivel_mobile',
        'criado_por_user_id',
    ];

    protected $casts = [
        'visivel_mobile' => 'boolean',
    ];
}
