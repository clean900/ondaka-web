<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Cria (ou remove) a CONTA DE AFILIADO DE DEMONSTRAÇÃO do ONDAKA.
 *
 * PARA QUE SERVE: mostrar o programa de afiliados a quem está a pensar aderir,
 * e capturar os ecrãs para os tutoriais em vídeo. A conta de um afiliado a
 * sério não serve para nenhuma das duas coisas — as comissões de alguém não
 * são material de demonstração.
 *
 * CRIA JÁ COM DADOS. Um painel de afiliado acabado de criar está vazio, e um
 * painel vazio não mostra nada a ninguém: entram três clientes indicados,
 * comissões nos três estados e um pagamento já feito.
 *
 * OS CLIENTES SÃO EMPRESAS FICTÍCIAS CRIADAS AQUI, não empresas reais. No
 * ONDAKA a atribuição vive numa coluna da própria empresa gestora
 * (`empresas_gestoras.afiliado_id`); apontar uma empresa real a este afiliado
 * punha comissões inventadas na ficha de um cliente a sério. As fictícias
 * nascem com `activa = 0`, nome «DEMO ·» e NIF DEMOAF*, e a subscrição que
 * levam tem `renovacao_automatica = 0` — nada de facturas nem renovações.
 *
 * Tudo o que escreve leva marca própria — código DEMO-ONDAKA e referências
 * DEMO-AF-* — e nada toca em afiliados, empresas ou facturas existentes.
 * É idempotente, e `--remover` limpa tudo.
 *
 *   php artisan afiliado:demonstracao --senha='...'
 *   php artisan afiliado:demonstracao --remover
 */
class AfiliadoDemonstracao extends Command
{
    protected $signature = 'afiliado:demonstracao {--senha= : palavra-passe da conta (mínimo 10 caracteres)} {--remover : apaga a conta, os clientes fictícios e tudo o que lhes pertence}';

    protected $description = 'Conta de afiliado de demonstração, com dados fictícios, para mostrar o programa e capturar os tutoriais';

    private const EMAIL = 'demo.afiliado@ondaka.ao';
    private const CODIGO = 'DEMO-ONDAKA';
    private const NOME = 'Afiliado de Demonstração';
    private const MARCA = 'CONTA DE DEMONSTRAÇÃO — dados fictícios. Não pagar.';
    private const NIF_PREFIXO = 'DEMOAF';

    /** Clientes fictícios: nome, tipo_cliente, província, município, nº de imóveis. */
    private const CLIENTES = [
        ['DEMO · Horizonte Gestão de Condomínios', 'empresa_gestora', 'Luanda', 'Talatona', 180],
        ['DEMO · Baía Administração de Imóveis', 'empresa_gestora', 'Benguela', 'Lobito', 96],
        ['DEMO · António Kiluanje (admin. independente)', 'admin_independente', 'Luanda', 'Belas', 42],
    ];

    public function handle(AfiliadoService $afiliados): int
    {
        if ($this->option('remover')) {
            return $this->remover();
        }

        $senha = (string) $this->option('senha');
        if (mb_strlen($senha) < 10) {
            $this->error('--senha com pelo menos 10 caracteres — é uma conta que fica num site público.');

            return self::FAILURE;
        }

        $af = DB::transaction(function () use ($senha) {
            $user = User::where('email', self::EMAIL)->first();
            if ($user) {
                // email_verified_at é obrigatório: o portal do afiliado está
                // atrás do middleware «verified», e sem isto a conta entra e
                // fica presa no ecrã de verificação — inútil para demonstrar
                // seja o que for.
                $user->forceFill(['password' => Hash::make($senha), 'email_verified_at' => now()])->save();
                $this->line("utilizador já existia (#{$user->id}) — palavra-passe actualizada");
            } else {
                $user = new User;
                $user->forceFill([
                    'name' => self::NOME,
                    'email' => self::EMAIL,
                    'password' => Hash::make($senha),
                    'telefone' => '+244 900 000 000',
                    'email_verified_at' => now(),
                ])->save();
                $this->line("utilizador criado (#{$user->id})");
            }
            if (! $user->hasRole('afiliado')) {
                $user->assignRole('afiliado');
            }

            // ESTADO «activo» de propósito: um afiliado pendente não tem
            // atribuição nenhuma, e o painel abriria morto.
            $af = Afiliado::firstOrNew(['codigo' => self::CODIGO]);
            $novo = ! $af->exists;
            $af->forceFill([
                'user_id' => $user->id,
                'nome' => self::NOME,
                'email' => self::EMAIL,
                'telefone' => '+244 900 000 000',
                'tipo' => 'particular',
                'nif' => null,
                'estado' => Afiliado::ESTADO_ACTIVO,
                'iban' => 'AO06 0040 0000 0000 0000 0000 0',
                'banco' => 'BAI',
                'titular_conta' => self::NOME,
                'como_divulga' => 'Visitas a empresas gestoras, grupos de WhatsApp de condomínios e redes sociais.',
                'notas_admin' => self::MARCA,
                'aprovado_em' => now()->subMonths(11),
                'total_cliques' => 143,
            ])->save();
            $this->line('afiliado '.($novo ? 'criado' : 'já existia')." (#{$af->id}), código ".self::CODIGO);

            $this->semear($af);

            return $af;
        });

        // Nível e taxa saem do volume dos 12 meses — deixar o próprio serviço
        // calcular, para o painel mostrar o mesmo que mostraria a um afiliado
        // verdadeiro com este volume.
        $afiliados->recalcularNivel($af);
        $af->refresh();

        $this->newLine();
        $this->info('Conta pronta:');
        $this->line('  portal  https://ondaka.ao/afiliado');
        $this->line('  email   '.self::EMAIL);
        $this->line('  código  '.self::CODIGO.'   (link: '.$af->linkReferencia().')');
        $this->line('  escalão '.$af->nivel.' — '.$af->taxa_actual_pct.'%');
        $this->newLine();
        $this->line('Tudo o que isto escreveu leva marca própria — código '.self::CODIGO.',');
        $this->line('empresas «DEMO ·» com NIF '.self::NIF_PREFIXO.'* e referências DEMO-AF-*.');
        $this->line('Corra «php artisan afiliado:demonstracao --remover» quando já não precisar.');

        return self::SUCCESS;
    }

    /** Dados fictícios: três clientes, comissões nos três estados e um pagamento feito. */
    private function semear(Afiliado $af): void
    {
        // limpa só o que é desta conta, para o cenário ser sempre o mesmo
        AfiliadoComissao::where('afiliado_id', $af->id)->delete();
        AfiliadoPagamento::where('afiliado_id', $af->id)->delete();

        $empresas = $this->clientesFicticios($af);

        // base sem imposto, imposto (IVA 14%), taxa aplicada, escalão, estado, meses atrás
        $linhas = [
            [350000, 49000, '6.00', 'e1', AfiliadoComissao::ESTADO_PAGA, 10],
            [420000, 58800, '6.00', 'e1', AfiliadoComissao::ESTADO_PAGA, 7],
            [300000, 42000, '7.00', 'e2', AfiliadoComissao::ESTADO_PAGA, 5],
            [500000, 70000, '8.00', 'e3', AfiliadoComissao::ESTADO_APROVADA, 2],
            [180000, 25200, '8.00', 'e3', AfiliadoComissao::ESTADO_PENDENTE, 0],
        ];

        $descricoes = [
            AfiliadoComissao::ORIGEM_FACTURA_PLATAFORMA => 'Subscrição ONDAKA',
            AfiliadoComissao::ORIGEM_ORDEM_COMPRA => 'Pacote de SMS e add-ons',
        ];

        $pagas = [];
        foreach ($linhas as $i => [$base, $imposto, $taxa, $nivel, $estado, $meses]) {
            $quando = $meses > 0 ? now()->subMonths($meses) : now()->subDays(4);
            $origem = $i % 2 === 0
                ? AfiliadoComissao::ORIGEM_FACTURA_PLATAFORMA
                : AfiliadoComissao::ORIGEM_ORDEM_COMPRA;
            $comissao = round($base * (float) $taxa / 100, 2);

            $c = new AfiliadoComissao;
            $c->forceFill([
                'afiliado_id' => $af->id,
                'empresa_gestora_id' => $empresas[$i % count($empresas)],
                'origem_type' => $origem,
                // origem_id é NOT NULL e único com origem_type: aponta para a
                // factura/ordem que deu origem à comissão. Aqui não há nenhuma
                // — são dados fictícios —, por isso vai um número alto e
                // improvável, que a referência DEMO-AF-* identifica de
                // qualquer modo.
                'origem_id' => 900000 + $i,
                'origem_numero' => sprintf('DEMO-AF-%04d', $i + 1),
                'descricao' => $descricoes[$origem].' — '.self::MARCA,
                'valor_pago_total_kz' => $base + $imposto,
                'valor_imposto_kz' => $imposto,
                'valor_base_kz' => $base,
                'taxa_pct' => $taxa,
                'valor_comissao_kz' => $comissao,
                'nivel' => $nivel,
                'estado' => $estado,
                'pago_pelo_cliente_em' => $quando,
                'disponivel_em' => $quando->copy()->addDays(15)->toDateString(),
                'aprovada_em' => $estado === AfiliadoComissao::ESTADO_PENDENTE ? null : $quando->copy()->addDays(15),
                'paga_em' => $estado === AfiliadoComissao::ESTADO_PAGA ? $quando->copy()->addDays(40) : null,
                // created_at manda no gráfico dos 12 meses: sem isto as cinco
                // barras caíam todas no mês de hoje.
                'created_at' => $quando,
                'updated_at' => $quando,
            ])->save();

            if ($estado === AfiliadoComissao::ESTADO_PAGA) {
                $pagas[] = $c;
            }
        }

        if ($pagas) {
            $total = array_sum(array_map(fn ($c) => (float) $c->valor_comissao_kz, $pagas));
            $pag = new AfiliadoPagamento;
            $pag->forceFill([
                'afiliado_id' => $af->id,
                'numero' => 'AFP/DEMO/0001',
                'num_comissoes' => count($pagas),
                'valor_bruto_kz' => $total,
                'retencao_pct' => 0,
                'retencao_valor_kz' => 0,
                'valor_liquido_kz' => $total,
                'metodo' => 'transferencia_bancaria',
                'referencia_bancaria' => 'DEMO-TRF-0001',
                'iban_destino' => $af->iban,
                'pago_em' => now()->subMonths(3)->toDateString(),
                'notas' => self::MARCA,
            ])->save();

            AfiliadoComissao::whereIn('id', array_map(fn ($c) => $c->id, $pagas))
                ->update(['afiliado_pagamento_id' => $pag->id]);
        }

        $this->line('dados semeados: '.count($empresas).' clientes, '.count($linhas).' comissões e 1 pagamento');
    }

    /**
     * Empresas gestoras FICTÍCIAS atribuídas a este afiliado.
     *
     * Escritas com DB::table de propósito: criar um EmpresaGestora pelo modelo
     * dispara o que estiver pendurado no ciclo de vida da empresa (subscrição,
     * emails de boas-vindas, condomínio inicial) e isto é só cenário de ecrã.
     *
     * @return list<int> ids das empresas
     */
    private function clientesFicticios(Afiliado $af): array
    {
        $ids = [];
        foreach (self::CLIENTES as $i => [$nome, $tipo, $provincia, $municipio, $imoveis]) {
            $nif = self::NIF_PREFIXO.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT);
            $slug = 'demo-afiliados-'.($i + 1);
            $atribuido = now()->subMonths(11 - $i * 3);

            $dados = [
                'nome' => $nome,
                'slug' => $slug,
                'email_contacto' => self::EMAIL,
                'telefone' => '+244 900 000 00'.($i + 1),
                'provincia' => $provincia,
                'municipio' => $municipio,
                'tipo_cliente' => $tipo,
                'plano' => 'pro',
                // activa = 0: são cenário, não clientes. Fica de fora das
                // contagens de empresas activas da plataforma.
                'activa' => 0,
                'afiliado_id' => $af->id,
                'afiliado_atribuido_em' => $atribuido,
                'afiliado_origem' => $i === 0 ? 'link' : 'manual',
                'afiliado_expira_em' => null,
                'updated_at' => now(),
            ];

            $existente = DB::table('empresas_gestoras')->where('nif', $nif)->first();
            if ($existente) {
                DB::table('empresas_gestoras')->where('id', $existente->id)->update($dados);
                $id = (int) $existente->id;
            } else {
                $id = (int) DB::table('empresas_gestoras')->insertGetId($dados + [
                    'nif' => $nif,
                    'created_at' => $atribuido,
                ]);
            }
            $ids[] = $id;

            // Subscrição só para o painel mostrar «activa» e o nº de imóveis.
            // renovacao_automatica = 0 e fim do período longe: nem a renovação
            // nem a emissão de facturas da plataforma lhe tocam (ambas exigem
            // renovacao_automatica = 1).
            $sub = [
                'empresa_gestora_id' => $id,
                'estado' => 'activa',
                'ciclo' => 'mensal',
                'num_imoveis' => $imoveis,
                'dia_aniversario' => 1,
                'activa_desde' => $atribuido,
                'periodo_actual_inicio' => now()->startOfMonth(),
                'periodo_actual_fim' => now()->addYears(5),
                'renovacao_automatica' => 0,
                'updated_at' => now(),
            ];
            $subExistente = DB::table('subscricoes')->where('empresa_gestora_id', $id)->first();
            if ($subExistente) {
                DB::table('subscricoes')->where('id', $subExistente->id)->update($sub);
            } else {
                DB::table('subscricoes')->insert($sub + ['created_at' => $atribuido]);
            }
        }

        return $ids;
    }

    private function remover(): int
    {
        $af = Afiliado::where('codigo', self::CODIGO)->first();
        $empresas = DB::table('empresas_gestoras')->where('nif', 'like', self::NIF_PREFIXO.'%')->pluck('id')->all();

        if (! $af && ! $empresas) {
            $this->line('Não existe nenhuma conta de demonstração.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($af, $empresas) {
            if ($af) {
                AfiliadoComissao::where('afiliado_id', $af->id)->delete();
                AfiliadoPagamento::where('afiliado_id', $af->id)->delete();
                DB::table('afiliado_cliques')->where('afiliado_id', $af->id)->delete();
                DB::table('empresas_gestoras')->where('afiliado_id', $af->id)
                    ->update(['afiliado_id' => null, 'afiliado_atribuido_em' => null, 'afiliado_origem' => null]);
                $userId = $af->user_id;
                $af->forceDelete();
                User::where('id', $userId)->where('email', self::EMAIL)->delete();
            }
            if ($empresas) {
                DB::table('subscricoes')->whereIn('empresa_gestora_id', $empresas)->delete();
                DB::table('empresas_gestoras')->whereIn('id', $empresas)->delete();
            }
        });

        $this->info('Removida a conta de demonstração, '.count($empresas).' empresa(s) fictícia(s) e tudo o que lhes pertencia.');

        return self::SUCCESS;
    }
}
