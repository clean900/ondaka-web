<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Services;

use App\Domains\Afiliados\Models\Afiliado;
use Illuminate\Support\Facades\DB;

/**
 * Configuração global do Programa de Afiliados (chaves `afiliado_*` em plataforma_config).
 */
class AfiliadoConfigService
{
    public const DEFAULTS = [
        'afiliado_programa_activo' => '1',
        'afiliado_taxa_base_pct' => '6',
        'afiliado_taxa_prata_pct' => '8',
        'afiliado_taxa_ouro_pct' => '10',
        'afiliado_nivel_prata_clientes' => '5',
        'afiliado_nivel_ouro_clientes' => '10',
        'afiliado_carencia_dias' => '15',
        'afiliado_pagamento_minimo_kz' => '10000',
        'afiliado_cookie_dias' => '90',
        'afiliado_duracao_meses' => '0',
        'afiliado_retencao_pct' => '0',
        'afiliado_aprovacao_automatica' => '0',
    ];

    public const TIPOS = [
        'afiliado_programa_activo' => 'bool',
        'afiliado_taxa_base_pct' => 'percent',
        'afiliado_taxa_prata_pct' => 'percent',
        'afiliado_taxa_ouro_pct' => 'percent',
        'afiliado_nivel_prata_clientes' => 'int',
        'afiliado_nivel_ouro_clientes' => 'int',
        'afiliado_carencia_dias' => 'int',
        'afiliado_pagamento_minimo_kz' => 'decimal',
        'afiliado_cookie_dias' => 'int',
        'afiliado_duracao_meses' => 'int',
        'afiliado_retencao_pct' => 'percent',
        'afiliado_aprovacao_automatica' => 'bool',
    ];

    public const DESCRICOES = [
        'afiliado_programa_activo' => 'Programa de afiliados activo (aceita candidaturas e atribui comissões)',
        'afiliado_taxa_base_pct' => 'Comissão nível Bronze (%) — sobre o valor sem imposto',
        'afiliado_taxa_prata_pct' => 'Comissão nível Prata (%)',
        'afiliado_taxa_ouro_pct' => 'Comissão nível Ouro (%)',
        'afiliado_nivel_prata_clientes' => 'Clientes pagantes necessários para Prata',
        'afiliado_nivel_ouro_clientes' => 'Clientes pagantes necessários para Ouro',
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
        return number_format((float) str_replace(',', '.', $this->get($chave)), 2, '.', '');
    }

    public function bool(string $chave): bool
    {
        return in_array(strtolower($this->get($chave)), ['1', 'true', 'sim', 'on'], true);
    }

    public function programaActivo(): bool
    {
        return $this->bool('afiliado_programa_activo');
    }

    public function taxaPorNivel(string $nivel): string
    {
        return match ($nivel) {
            Afiliado::NIVEL_PRATA => $this->decimal('afiliado_taxa_prata_pct'),
            Afiliado::NIVEL_OURO => $this->decimal('afiliado_taxa_ouro_pct'),
            default => $this->decimal('afiliado_taxa_base_pct'),
        };
    }

    public function nivelPorClientes(int $clientesPagantes): string
    {
        if ($clientesPagantes >= $this->int('afiliado_nivel_ouro_clientes')) {
            return Afiliado::NIVEL_OURO;
        }
        if ($clientesPagantes >= $this->int('afiliado_nivel_prata_clientes')) {
            return Afiliado::NIVEL_PRATA;
        }

        return Afiliado::NIVEL_BRONZE;
    }

    /** Tabela de níveis para apresentação. */
    public function niveis(): array
    {
        $prata = $this->int('afiliado_nivel_prata_clientes');
        $ouro = $this->int('afiliado_nivel_ouro_clientes');

        return [
            ['nivel' => Afiliado::NIVEL_BRONZE, 'label' => 'Bronze', 'taxa_pct' => $this->taxaPorNivel(Afiliado::NIVEL_BRONZE), 'min_clientes' => 0, 'max_clientes' => max(0, $prata - 1)],
            ['nivel' => Afiliado::NIVEL_PRATA, 'label' => 'Prata', 'taxa_pct' => $this->taxaPorNivel(Afiliado::NIVEL_PRATA), 'min_clientes' => $prata, 'max_clientes' => max($prata, $ouro - 1)],
            ['nivel' => Afiliado::NIVEL_OURO, 'label' => 'Ouro', 'taxa_pct' => $this->taxaPorNivel(Afiliado::NIVEL_OURO), 'min_clientes' => $ouro, 'max_clientes' => null],
        ];
    }

    /** Subconjunto seguro para as páginas (portal, landing, super-admin). */
    public function publico(): array
    {
        return [
            'programa_activo' => $this->programaActivo(),
            'niveis' => $this->niveis(),
            'carencia_dias' => $this->int('afiliado_carencia_dias'),
            'pagamento_minimo_kz' => $this->decimal('afiliado_pagamento_minimo_kz'),
            'cookie_dias' => $this->int('afiliado_cookie_dias'),
            'duracao_meses' => $this->int('afiliado_duracao_meses'),
            'retencao_pct' => $this->decimal('afiliado_retencao_pct'),
            'aprovacao_automatica' => $this->bool('afiliado_aprovacao_automatica'),
            'taxa_min_pct' => $this->taxaPorNivel(Afiliado::NIVEL_BRONZE),
            'taxa_max_pct' => $this->taxaPorNivel(Afiliado::NIVEL_OURO),
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
}
