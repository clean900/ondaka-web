<?php

declare(strict_types=1);

namespace App\Domains\Sos\Catalog;

/**
 * Catálogo dos 13 tipos de SOS por gravidade.
 *
 * Gravidades:
 *  - critico: Vida em perigo imediato (incêndio, médica, assalto, agressão, fuga gás)
 *  - alto:    Risco material ou potencial vida (inundação, falha eléctrica, elevador, acidente)
 *  - medio:   Segurança comprometida sem urgência crítica (animais, pessoas suspeitas)
 *  - baixo:   Perturbação ou reporte genérico (barulho, outro)
 */
class TiposSos
{
    public const CRITICO = 'critico';
    public const ALTO = 'alto';
    public const MEDIO = 'medio';
    public const BAIXO = 'baixo';

    /**
     * @return array<string,array{label:string,gravidade:string,icone:string,cor:string}>
     */
    public static function todos(): array
    {
        return [
            // 🔴 CRÍTICOS — vida em perigo
            'incendio' => [
                'label' => 'Incêndio',
                'gravidade' => self::CRITICO,
                'icone' => 'fire',
                'cor' => '#DC2626',
            ],
            'medica' => [
                'label' => 'Emergência médica',
                'gravidade' => self::CRITICO,
                'icone' => 'medical',
                'cor' => '#DC2626',
            ],
            'assalto' => [
                'label' => 'Assalto / roubo em curso',
                'gravidade' => self::CRITICO,
                'icone' => 'shield-alert',
                'cor' => '#DC2626',
            ],
            'agressao' => [
                'label' => 'Agressão / violência',
                'gravidade' => self::CRITICO,
                'icone' => 'alert-octagon',
                'cor' => '#DC2626',
            ],
            'fuga_gas' => [
                'label' => 'Fuga de gás',
                'gravidade' => self::CRITICO,
                'icone' => 'wind',
                'cor' => '#DC2626',
            ],

            // 🟠 ALTOS — risco material ou potencial vida
            'inundacao' => [
                'label' => 'Inundação / canalização',
                'gravidade' => self::ALTO,
                'icone' => 'droplet',
                'cor' => '#EA580C',
            ],
            'falha_electrica' => [
                'label' => 'Falha eléctrica geral',
                'gravidade' => self::ALTO,
                'icone' => 'zap-off',
                'cor' => '#EA580C',
            ],
            'elevador_avariado' => [
                'label' => 'Elevador avariado com pessoas',
                'gravidade' => self::ALTO,
                'icone' => 'arrow-up-down',
                'cor' => '#EA580C',
            ],
            'acidente' => [
                'label' => 'Acidente em áreas comuns',
                'gravidade' => self::ALTO,
                'icone' => 'alert-triangle',
                'cor' => '#EA580C',
            ],

            // 🟡 MÉDIOS — segurança comprometida
            'animal_perigoso' => [
                'label' => 'Animal perigoso / suspeito',
                'gravidade' => self::MEDIO,
                'icone' => 'paw-print',
                'cor' => '#F59E0B',
            ],
            'pessoa_suspeita' => [
                'label' => 'Pessoa suspeita / intruso',
                'gravidade' => self::MEDIO,
                'icone' => 'user-x',
                'cor' => '#F59E0B',
            ],

            // 🟢 BAIXOS — perturbação/reporte
            'barulho' => [
                'label' => 'Barulho excessivo / perturbação',
                'gravidade' => self::BAIXO,
                'icone' => 'volume-2',
                'cor' => '#10B981',
            ],
            'outro' => [
                'label' => 'Outro (descrever)',
                'gravidade' => self::BAIXO,
                'icone' => 'help-circle',
                'cor' => '#10B981',
            ],
        ];
    }

    public static function tipos(): array
    {
        return array_keys(self::todos());
    }

    public static function gravidade(string $tipo): ?string
    {
        return self::todos()[$tipo]['gravidade'] ?? null;
    }

    public static function ehCritico(string $tipo): bool
    {
        return self::gravidade($tipo) === self::CRITICO;
    }

    public static function existe(string $tipo): bool
    {
        return isset(self::todos()[$tipo]);
    }
}
