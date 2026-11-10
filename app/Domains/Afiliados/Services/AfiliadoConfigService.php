<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Services;

use Illuminate\Support\Facades\DB;

/**
 * Configuração global do Programa de Afiliados (chaves `afiliado_*` em plataforma_config).
 *
 * Escalões de comissão por VOLUME DE RECEITA dos últimos 12 meses de cada afiliado
 * (valor pago depois do imposto — líquido de IVA). A taxa sobe de escalão à medida
 * que o volume acumulado nos últimos 12 meses cresce; a subida aplica-se às comissões
 * seguintes (nunca retroactivo).
 *
 * Canon (idêntico nos três produtos ONDAKA / Academia / Welwitschia):
 *   6%  desde o 1.º Kz
 *   7%  a partir de   500.000 Kz
 *   8%  a partir de 1.500.000 Kz
 *   9%  a partir de 3.000.000 Kz
 *  10%  a partir de 6.000.000 Kz
 */
class AfiliadoConfigService
{
    public const DEFAULTS = [
        'afiliado_programa_activo' => '1',
        // Escalão base (desde o 1.º Kz)
        'afiliado_taxa_e1_pct' => '6',
        // Escalões por volume de receita (12 meses) — taxa + limiar
        'afiliado_taxa_e2_pct' => '7',
        'afiliado_vol_e2_kz' => '500000',
        'afiliado_taxa_e3_pct' => '8',
        'afiliado_vol_e3_kz' => '1500000',
        'afiliado_taxa_e4_pct' => '9',
        'afiliado_vol_e4_kz' => '3000000',
        'afiliado_taxa_e5_pct' => '10',
        'afiliado_vol_e5_kz' => '6000000',
        'afiliado_carencia_dias' => '15',
        'afiliado_pagamento_minimo_kz' => '10000',
        'afiliado_cookie_dias' => '90',
        'afiliado_duracao_meses' => '0',
        'afiliado_retencao_pct' => '0',
        'afiliado_aprovacao_automatica' => '0',
    ];

    public const TIPOS = [
        'afiliado_programa_activo' => 'bool',
        'afiliado_taxa_e1_pct' => 'percent',
        'afiliado_taxa_e2_pct' => 'percent',
        'afiliado_vol_e2_kz' => 'decimal',
        'afiliado_taxa_e3_pct' => 'percent',
        'afiliado_vol_e3_kz' => 'decimal',
        'afiliado_taxa_e4_pct' => 'percent',
        'afiliado_vol_e4_kz' => 'decimal',
        'afiliado_taxa_e5_pct' => 'percent',
        'afiliado_vol_e5_kz' => 'decimal',
        'afiliado_carencia_dias' => 'int',
        'afiliado_pagamento_minimo_kz' => 'decimal',
        'afiliado_cookie_dias' => 'int',
        'afiliado_duracao_meses' => 'int',
        'afiliado_retencao_pct' => 'percent',
        'afiliado_aprovacao_automatica' => 'bool',
    ];

    public const DESCRICOES = [
        'afiliado_programa_activo' => 'Programa de afiliados activo (aceita candidaturas e atribui comissões)',
        'afiliado_taxa_e1_pct' => 'Comissão base (%) — desde o 1.º Kz, sobre o valor sem imposto',
        'afiliado_taxa_e2_pct' => 'Comissão (%) a partir do 2.º escalão de volume',
        'afiliado_vol_e2_kz' => 'Volume de receita (12 meses) para o 2.º escalão (Kz)',
        'afiliado_taxa_e3_pct' => 'Comissão (%) a partir do 3.º escalão de volume',
        'afiliado_vol_e3_kz' => 'Volume de receita (12 meses) para o 3.º escalão (Kz)',
        'afiliado_taxa_e4_pct' => 'Comissão (%) a partir do 4.º escalão de volume',
        'afiliado_vol_e4_kz' => 'Volume de receita (12 meses) para o 4.º escalão (Kz)',
        'afiliado_taxa_e5_pct' => 'Comissão (%) a partir do 5.º escalão de volume',
        'afiliado_vol_e5_kz' => 'Volume de receita (12 meses) para o 5.º escalão (Kz)',
        'afiliado_carencia_dias' => 'Dias de carência antes de a comissão ficar aprovada',
        'afiliado_pagamento_minimo_kz' => 'Valor mínimo acumulado para pagamento ao afiliado (Kz)',
        'afiliado_cookie_dias' => 'Dias em que o link de afiliado fica memorizado no browser do visitante',
        'afiliado_duracao_meses' => 'Meses em que o cliente gera comissão ao afiliado (0 = vitalício)',
        'afiliado_retencao_pct' => 'Retenção na fonte aplicada por defeito aos pagamentos de comissões (%)',
        'afiliado_aprovacao_automatica' => 'Aprovar candidaturas automaticamente',
    ];

    private static ?array $cache = null;

    public function all(): array
    {
        if (self::$cache === null) {
            $db = DB::table('plataforma_config')
                ->where('chave', 'like', 'afiliado\_%')
                ->pluck('valor', 'chave')
                ->all();
            self::$cache = array_merge(self::DEFAULTS, array_filter($db, fn ($v) => $v !== null));
        }

        return self::$cache;
    }

    public static function limparCache(): void
    {
        self::$cache = null;
    }

    public function get(string $chave): string
    {
        return (string) ($this->all()[$chave] ?? self::DEFAULTS[$chave] ?? '');
    }

    public function int(string $chave): int
    {
        return (int) $this->get($chave);
    }

    /** Valor decimal normalizado com 2 casas (string, para bcmath). */
    public function decimal(string $chave): string
    {
        return $this->norm($this->get($chave));
    }

    public function bool(string $chave): bool
    {
        return in_array(strtolower($this->get($chave)), ['1', 'true', 'sim', 'on'], true);
    }

    public function programaActivo(): bool
    {
        return $this->bool('afiliado_programa_activo');
    }

    // -----------------------------------------------------------------
    // Escalões por volume de receita (12 meses)
    // -----------------------------------------------------------------

    /**
     * Tabela de escalões, ordenada por volume mínimo crescente. Cada escalão:
     *   ['codigo', 'label', 'taxa_pct', 'min_volume_kz', 'max_volume_kz' (null no topo)]
     */
    public function escaloes(): array
    {
        $def = [
            ['codigo' => 'e1', 'min' => '0.00', 'taxa' => $this->decimal('afiliado_taxa_e1_pct')],
            ['codigo' => 'e2', 'min' => $this->decimal('afiliado_vol_e2_kz'), 'taxa' => $this->decimal('afiliado_taxa_e2_pct')],
            ['codigo' => 'e3', 'min' => $this->decimal('afiliado_vol_e3_kz'), 'taxa' => $this->decimal('afiliado_taxa_e3_pct')],
            ['codigo' => 'e4', 'min' => $this->decimal('afiliado_vol_e4_kz'), 'taxa' => $this->decimal('afiliado_taxa_e4_pct')],
            ['codigo' => 'e5', 'min' => $this->decimal('afiliado_vol_e5_kz'), 'taxa' => $this->decimal('afiliado_taxa_e5_pct')],
        ];

        // Robustez: ordenar por volume mínimo crescente (defende de limiares mal configurados).
        usort($def, fn ($a, $b) => bccomp($a['min'], $b['min'], 2));

        $n = count($def);
        $out = [];
        foreach ($def as $i => $e) {
            $max = $i + 1 < $n ? $def[$i + 1]['min'] : null;
            $out[] = [
                'codigo' => $e['codigo'],
                'label' => bccomp($e['min'], '0.00', 2) <= 0 ? 'Desde o 1.º Kz' : 'A partir de '.$this->fmtKz($e['min']),
                'taxa_pct' => $e['taxa'],
                'min_volume_kz' => $e['min'],
                'max_volume_kz' => $max,
            ];
        }

        return $out;
    }

    /** Escalão correspondente ao volume (maior `min_volume_kz` <= volume). */
    public function escalaoPorVolume(string $volume): array
    {
        $volume = $this->norm($volume);
        $escaloes = $this->escaloes();
        $escolhido = $escaloes[0];
        foreach ($escaloes as $e) {
            if (bccomp($volume, $e['min_volume_kz'], 2) >= 0) {
                $escolhido = $e;
            }
        }

        return $escolhido;
    }

    /** Taxa (%) aplicável a um volume de receita (12 meses). */
    public function taxaPorVolume(string $volume): string
    {
        return $this->escalaoPorVolume($volume)['taxa_pct'];
    }

    /** Próximo escalão acima do volume actual (null se já está no topo). */
    public function proximoEscalao(string $volume): ?array
    {
        $volume = $this->norm($volume);
        foreach ($this->escaloes() as $e) {
            if (bccomp($e['min_volume_kz'], $volume, 2) > 0) {
                return [
                    'codigo' => $e['codigo'],
                    'label' => $e['label'],
                    'taxa_pct' => $e['taxa_pct'],
                    'min_volume_kz' => $e['min_volume_kz'],
                    'faltam_kz' => bcsub($e['min_volume_kz'], $volume, 2),
                ];
            }
        }

        return null;
    }

    /** Rótulo de um escalão pelo código (trata códigos legados bronze/prata/ouro). */
    public function rotuloEscalao(?string $codigo): string
    {
        foreach ($this->escaloes() as $e) {
            if ($e['codigo'] === $codigo) {
                return $e['label'];
            }
        }

        return match ($codigo) {
            'bronze' => 'Bronze', 'prata' => 'Prata', 'ouro' => 'Ouro',
            default => (string) $codigo,
        };
    }

    /** Subconjunto seguro para as páginas (portal, landing, super-admin). */
    public function publico(): array
    {
        $escaloes = $this->escaloes();

        return [
            'programa_activo' => $this->programaActivo(),
            'escaloes' => $escaloes,
            'carencia_dias' => $this->int('afiliado_carencia_dias'),
            'pagamento_minimo_kz' => $this->decimal('afiliado_pagamento_minimo_kz'),
            'cookie_dias' => $this->int('afiliado_cookie_dias'),
            'duracao_meses' => $this->int('afiliado_duracao_meses'),
            'retencao_pct' => $this->decimal('afiliado_retencao_pct'),
            'aprovacao_automatica' => $this->bool('afiliado_aprovacao_automatica'),
            'taxa_min_pct' => $escaloes[0]['taxa_pct'],
            'taxa_max_pct' => $escaloes[count($escaloes) - 1]['taxa_pct'],
        ];
    }

    public function guardar(array $valores): void
    {
        $agora = now();
        foreach ($valores as $chave => $valor) {
            if (! array_key_exists($chave, self::DEFAULTS)) {
                continue;
            }
            $valor = is_bool($valor) ? ($valor ? '1' : '0') : (string) $valor;
            $existe = DB::table('plataforma_config')->where('chave', $chave)->exists();
            if ($existe) {
                DB::table('plataforma_config')->where('chave', $chave)->update(['valor' => $valor, 'updated_at' => $agora]);
            } else {
                DB::table('plataforma_config')->insert([
                    'chave' => $chave,
                    'valor' => $valor,
                    'tipo' => self::TIPOS[$chave],
                    'descricao' => self::DESCRICOES[$chave],
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]);
            }
        }
        self::limparCache();
    }

    /** Normaliza qualquer valor para string decimal com 2 casas (bcmath). */
    private function norm(mixed $v): string
    {
        $s = str_replace([',', ' '], ['.', ''], trim((string) ($v ?? '0')));
        if ($s === '' || ! is_numeric($s)) {
            $s = '0';
        }

        return bcadd($s, '0', 2);
    }

    /** "500.000" a partir de "500000.00" (separador de milhares PT, sem casas). */
    private function fmtKz(string $valor): string
    {
        return number_format((float) $valor, 0, ',', '.').' Kz';
    }
}
