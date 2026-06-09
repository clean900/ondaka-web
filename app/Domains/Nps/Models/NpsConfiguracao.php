<?php

declare(strict_types=1);

namespace App\Domains\Nps\Models;

use Illuminate\Database\Eloquent\Model;

class NpsConfiguracao extends Model
{
    protected $table = 'nps_configuracoes';

    protected $fillable = [
        'alvo',
        'empresa_gestora_id',
        'activo',
        'periodicidade_dias',
        'pergunta',
        'seguimento',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'periodicidade_dias' => 'integer',
    ];

    /** Valores por omissão quando não há config gravada. */
    public const PADRAO = [
        'plataforma' => [
            'activo' => true,
            'periodicidade_dias' => 90,
            'pergunta' => 'De 0 a 10, qual a probabilidade de recomendar a ONDAKA a um amigo?',
            'seguimento' => 'O que poderia melhorar?',
        ],
        'condominio' => [
            'activo' => true,
            'periodicidade_dias' => 90,
            'pergunta' => 'De 0 a 10, qual a probabilidade de recomendar a gestão do seu condomínio a um amigo?',
            'seguimento' => 'O que poderia melhorar?',
        ],
    ];

    /**
     * Resolve a config efectiva para um alvo + gestora (com fallback ao padrão).
     */
    public static function resolver(string $alvo, ?int $empresaGestoraId): array
    {
        $query = static::where('alvo', $alvo);
        if ($alvo === 'plataforma') {
            $query->whereNull('empresa_gestora_id');
        } else {
            $query->where('empresa_gestora_id', $empresaGestoraId);
        }
        $config = $query->first();

        $padrao = self::PADRAO[$alvo];

        if (! $config) {
            return $padrao;
        }

        return [
            'activo' => $config->activo,
            'periodicidade_dias' => $config->periodicidade_dias,
            'pergunta' => $config->pergunta ?: $padrao['pergunta'],
            'seguimento' => $config->seguimento ?: $padrao['seguimento'],
        ];
    }
}
