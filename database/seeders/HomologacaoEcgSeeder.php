<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoSegmentacao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeatureSubscription;
use App\Domains\Reserva\Models\Reserva;
use App\Domains\Reserva\Models\ReservaEspaco;
use App\Domains\Tickets\Models\Ticket;
use App\Domains\Visitor\Models\OcorrenciaPortaria;
use App\Domains\Visitor\Models\PassagemTurno;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\Visitante;
use App\Domains\Visitor\Models\VisitaItem;
use App\Domains\Visitor\Models\VisitanteBanido;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeder de HOMOLOGAÇÃO da ECG.LDA — dados de demonstração para a apresentação.
 *
 * ESTRITAMENTE limitado à empresa gestora #10 (ECG.LDA) e condomínio #9 (Nova York).
 * NUNCA toca na empresa #1 / condomínio #1 (Torres Atlântico — piloto real).
 *
 * Idempotente (updateOrCreate / firstOrNew) e atómico (DB::transaction): se algo
 * falhar, NADA é persistido. Não envia SMS (cria pré-aprovações via Model, não Service).
 *
 * Correr: php artisan db:seed --class=HomologacaoEcgSeeder --force
 */
class HomologacaoEcgSeeder extends Seeder
{
    private const EMPRESA_ID = 10;
    private const CONDOMINIO_ID = 9;
    private const FRACCAO_ID = 76;

    /** Códigos OTP das pré-aprovações validáveis no demo (para imprimir no fim). */
    private array $otpsDemo = [];

    public function run(): void
    {
        // --- Salvaguardas duras: nunca o piloto real ---
        if (self::EMPRESA_ID === 1 || self::CONDOMINIO_ID === 1) {
            $this->command->error('RECUSADO: alvo é o piloto real (#1). Abortado.');
            return;
        }

        $empresa = EmpresaGestora::find(self::EMPRESA_ID);
        $cond = Condominio::find(self::CONDOMINIO_ID);
        if ($empresa === null || $cond === null) {
            $this->command->error('Empresa #10 ou Condomínio #9 não encontrados. Abortado.');
            return;
        }
        if ((int) $cond->empresa_gestora_id !== self::EMPRESA_ID) {
            $this->command->error('Condomínio #9 não pertence à empresa #10. Abortado por segurança.');
            return;
        }

        $fraccao = Fraccao::where('id', self::FRACCAO_ID)
            ->where('condominio_id', self::CONDOMINIO_ID)->first();
        if ($fraccao === null) {
            $this->command->error('Fracção #76 não encontrada no condomínio #9. Abortado.');
            return;
        }

        $condomino = Condomino::where('user_id', 27)->where('empresa_gestora_id', self::EMPRESA_ID)->first()
            ?? Condomino::where('empresa_gestora_id', self::EMPRESA_ID)->first();
        if ($condomino === null) {
            $this->command->error('Nenhum condómino encontrado na empresa #10. Abortado.');
            return;
        }

        $gestor = User::where('id', 25)->where('empresa_gestora_id', self::EMPRESA_ID)->first()
            ?? User::where('empresa_gestora_id', self::EMPRESA_ID)->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin-empresa', 'gestor']))->first();
        $condominoUser = User::where('id', 27)->first() ?? $gestor;

        try {
        DB::transaction(function () use ($empresa, $cond, $fraccao, $condomino, $gestor, $condominoUser) {
            // 1) Garantir add-ons da portaria activos (para todos os ecrãs aparecerem)
            foreach (['controlo_bens', 'livro_ocorrencias', 'registo_viaturas', 'foto_conferencia', 'dashboard_portaria', 'acesso_horario_area'] as $slug) {
                $this->ativarFeature($slug, $empresa);
            }

            // 2) Conta de GUARDA (role funcionario) para o demo do mobile
            $guarda = $this->garantirGuarda();

            // 3) Pré-aprovações (validáveis na portaria)
            $this->seedPreAprovacoes($condomino);

            // 4) Visitas (dentro agora + histórico + matrícula) — anexa visitante + PA
            $visitaComItens = $this->seedVisitas($condomino, $guarda);

            // 5) Controlo de bens numa das visitas (itens dentro + 1 a aguardar autorização)
            $this->seedItens($visitaComItens, $guarda);

            // 6) Lista negra
            $this->seedListaNegra($guarda);

            // 7) Ocorrências + passagem de turno
            $this->seedOcorrencias($guarda);

            // 8) Avisos (com segmentação 'todos')
            $this->seedAvisos($gestor ?? $guarda);

            // 9) Pedidos (tickets)
            $this->seedPedidos($fraccao, $condominoUser ?? $guarda);

            // 10) Reservas de espaços comuns
            $this->seedReservas($condominoUser ?? $guarda, $gestor ?? $guarda);
        });
        } catch (\Throwable $e) {
            $this->command->error('Falha no seeder de homologação — NADA foi gravado (rollback).');
            $this->command->error($e->getMessage());
            return;
        }

        $this->imprimirResumo();
    }

    // ====================================================================

    private function ativarFeature(string $slug, EmpresaGestora $empresa): void
    {
        $f = Feature::where('slug', $slug)->first();
        if ($f === null) {
            return;
        }
        $s = FeatureSubscription::firstOrNew([
            'feature_id' => $f->id,
            'owner_type' => $empresa->getMorphClass(),
            'owner_id' => $empresa->id,
        ]);
        $s->estado = 'activa';
        if (! $s->activada_em) {
            $s->activada_em = now();
        }
        $s->expira_em = null;
        $s->save();
    }

    private function garantirGuarda(): User
    {
        $guarda = User::firstOrNew(['email' => 'guarda.ecg@ondaka.ao']);
        $novo = ! $guarda->exists;
        $guarda->empresa_gestora_id = self::EMPRESA_ID;
        $guarda->name = 'Guarda ECG (Demo)';
        $guarda->estado = 'activo';
        $guarda->condominio_activo_id = self::CONDOMINIO_ID;
        $guarda->locale = 'pt';
        if ($novo) {
            $guarda->password = Hash::make('Guarda#2026');
        }
        $guarda->save();
        if (! $guarda->hasRole('funcionario')) {
            $guarda->assignRole('funcionario');
        }
        return $guarda;
    }

    private function seedPreAprovacoes(Condomino $condomino): void
    {
        $cid = $condomino->id;

        // a) Visita normal (validável já)
        $this->preAprovacao('Carlos Mendes (Demo)', '+244923000001', $cid, [
            'tipo_acesso' => 'visita',
            'estado' => 'pendente',
            'valida_ate' => now()->addDays(7),
        ], demo: true);

        // b) Empregada com horário Seg-Sex 08:00-12:00 + área Piscina (#9)
        $this->preAprovacao('Maria Empregada (Demo)', '+244923000002', $cid, [
            'tipo_acesso' => 'trabalhador',
            'estado' => 'aprovado',
            'valida_ate' => now()->addDays(90),
            'horarios_json' => [['dias' => [1, 2, 3, 4, 5], 'inicio' => '08:00', 'fim' => '12:00']],
            'areas_json' => [['tipo' => 'livre', 'id' => null, 'nome' => 'Piscina']],
        ], demo: true);

        // c) Horário que cai FORA agora (03:00-04:00) — para mostrar o aviso âmbar (#9)
        $this->preAprovacao('Técnico Madrugada (Demo)', '+244923000003', $cid, [
            'tipo_acesso' => 'prestador',
            'estado' => 'aprovado',
            'valida_ate' => now()->addDays(30),
            'horarios_json' => [['dias' => [1, 2, 3, 4, 5, 6, 7], 'inicio' => '03:00', 'fim' => '04:00']],
            'areas_json' => [['tipo' => 'livre', 'id' => null, 'nome' => 'Garagem']],
        ], demo: true);

        // d) Prestador (passe recorrente)
        $this->preAprovacao('Canalizador ABC (Demo)', '+244923000004', $cid, [
            'tipo_acesso' => 'prestador',
            'estado' => 'aprovado',
            'valida_ate' => now()->addDays(30),
        ], demo: true);

        // e) Expirada (mostra tratamento de expirado)
        $this->preAprovacao('Visitante Expirado (Demo)', '+244923000005', $cid, [
            'tipo_acesso' => 'visita',
            'estado' => 'expirada',
            'valida_ate' => now()->subDays(2),
        ], demo: false);
    }

    private function preAprovacao(string $nome, string $telefone, int $condominoId, array $extra, bool $demo): PreAprovacao
    {
        $pa = PreAprovacao::firstOrNew([
            'empresa_gestora_id' => self::EMPRESA_ID,
            'fraccao_id' => self::FRACCAO_ID,
            'nome_visitante' => $nome,
            'telefone_visitante' => $telefone,
        ]);
        if (! $pa->exists) {
            $pa->qr_token = $this->qrUnico();
            $pa->otp_code = $this->otpUnico();
        }
        $pa->fill(array_merge([
            'condomino_id' => $condominoId,
            'sms_enviado' => true,
        ], $extra));
        $pa->save();

        if ($demo) {
            $this->otpsDemo[] = ['nome' => $nome, 'otp' => $pa->otp_code, 'estado' => $pa->estado];
        }
        return $pa;
    }

    private function seedVisitas(Condomino $condomino, User $guarda): Visita
    {
        $cid = $condomino->id;
        $visitaItens = null;

        // Dentro agora (3) — saiu_em null
        $d1 = $this->visita($cid, $guarda, 'José Pereira (Demo)', '+244924000001', now()->subHours(2), null, 'qr');
        $this->visita($cid, $guarda, 'Ana Silva (Demo)', '+244924000002', now()->subHours(1), null, 'otp');
        $this->visita($cid, $guarda, 'Fornecedor Águas (Demo)', '+244924000003', now()->subMinutes(40), null, 'manual', matricula: 'LD-42-15-AB');
        $visitaItens = $d1;

        // Histórico (saiu) — incl. matrícula
        $this->visita($cid, $guarda, 'Pedro Costa (Demo)', '+244924000004', now()->subDays(1)->setTime(9, 0), now()->subDays(1)->setTime(11, 30), 'qr');
        $this->visita($cid, $guarda, 'Entrega Mercadoria (Demo)', '+244924000005', now()->subDays(2)->setTime(14, 0), now()->subDays(2)->setTime(15, 0), 'manual', matricula: 'LD-08-99-XY');

        return $visitaItens;
    }

    private function visita(int $condominoId, User $guarda, string $nome, string $telefone, Carbon $entrou, ?Carbon $saiu, string $metodo, ?string $matricula = null): Visita
    {
        $visitante = Visitante::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'nome' => $nome, 'telefone' => $telefone],
            ['notas' => 'Homologação ECG']
        );

        $pa = PreAprovacao::firstOrNew([
            'empresa_gestora_id' => self::EMPRESA_ID,
            'fraccao_id' => self::FRACCAO_ID,
            'nome_visitante' => $nome,
            'telefone_visitante' => $telefone,
        ]);
        if (! $pa->exists) {
            $pa->qr_token = $this->qrUnico();
            $pa->otp_code = $this->otpUnico();
        }
        $pa->fill([
            'condomino_id' => $condominoId,
            'tipo_acesso' => 'visita',
            'estado' => 'usada',
            'valida_ate' => $entrou->copy()->addDay(),
            'sms_enviado' => true,
        ]);
        $pa->save();

        $visita = Visita::firstOrNew([
            'empresa_gestora_id' => self::EMPRESA_ID,
            'pre_aprovacao_id' => $pa->id,
            'visitante_id' => $visitante->id,
        ]);
        if (! $visita->exists) {
            $visita->entrou_em = $entrou;
        }
        $visita->fill([
            'fraccao_id' => self::FRACCAO_ID,
            'guarda_entrada_id' => $guarda->id,
            'saiu_em' => $saiu,
            'guarda_saida_id' => $saiu !== null ? $guarda->id : null,
            'metodo_validacao' => $metodo,
            'matricula' => $matricula,
        ]);
        $visita->save();
        return $visita;
    }

    private function seedItens(Visita $visita, User $guarda): void
    {
        $itens = [
            ['descricao' => 'Computador portátil Dell', 'categoria' => 'eletronico', 'identificador' => 'SN-DELL-99821', 'estado' => 'dentro'],
            ['descricao' => 'Caixa de ferramentas', 'categoria' => 'ferramenta', 'identificador' => null, 'estado' => 'dentro'],
            ['descricao' => 'Mala não declarada à entrada', 'categoria' => null, 'identificador' => null, 'estado' => 'aguarda_autorizacao'],
        ];
        foreach ($itens as $it) {
            $item = VisitaItem::firstOrNew([
                'empresa_gestora_id' => self::EMPRESA_ID,
                'visita_id' => $visita->id,
                'descricao' => $it['descricao'],
            ]);
            $item->fill([
                'categoria' => $it['categoria'],
                'quantidade' => 1,
                'identificador' => $it['identificador'],
                'estado' => $it['estado'],
                'registado_na_entrada' => $it['estado'] !== 'aguarda_autorizacao',
                'registado_por' => $guarda->id,
            ]);
            $item->save();
        }
    }

    private function seedListaNegra(User $guarda): void
    {
        $entradas = [
            ['tipo' => 'nome', 'valor' => 'João Indesejado'],
            ['tipo' => 'matricula', 'valor' => 'LD-13-13-ZZ'],
        ];
        foreach ($entradas as $e) {
            VisitanteBanido::firstOrCreate(
                [
                    'empresa_gestora_id' => self::EMPRESA_ID,
                    'tipo' => $e['tipo'],
                    'valor_normalizado' => VisitanteBanido::normalizar($e['valor']),
                ],
                [
                    'condominio_id' => self::CONDOMINIO_ID,
                    'valor' => $e['valor'],
                    'motivo' => 'Registo de homologação (demo).',
                    'partilhar_empresa' => false,
                    'criado_por_user_id' => $guarda->id,
                ]
            );
        }
    }

    private function seedOcorrencias(User $guarda): void
    {
        OcorrenciaPortaria::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'guarda_id' => $guarda->id, 'descricao' => 'Portão automático com ruído anormal.'],
            ['condominio_id' => self::CONDOMINIO_ID, 'tipo' => 'observacao']
        );
        OcorrenciaPortaria::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'guarda_id' => $guarda->id, 'descricao' => 'Tentativa de entrada sem autorização às 23h.'],
            ['condominio_id' => self::CONDOMINIO_ID, 'tipo' => 'incidente', 'resolvida_em' => now()->subHours(3), 'resolvida_por' => $guarda->id, 'notas_resolucao' => 'Situação verificada e resolvida.']
        );

        PassagemTurno::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'guarda_id' => $guarda->id, 'resumo' => 'Turno sem incidentes graves. 3 visitantes ainda dentro.'],
            ['condominio_id' => self::CONDOMINIO_ID, 'total_dentro' => 3, 'ocorrencias_abertas' => 1]
        );
    }

    private function seedAvisos(User $autor): void
    {
        $avisos = [
            ['titulo' => 'Manutenção dos elevadores', 'categoria' => 'manutencao', 'prioridade' => 'alta', 'descricao' => 'Os elevadores estarão em manutenção no sábado, das 09h às 13h.'],
            ['titulo' => 'Reunião de condóminos', 'categoria' => 'reuniao', 'prioridade' => 'media', 'descricao' => 'Convocatória para a assembleia ordinária. Ordem de trabalhos em anexo.'],
        ];
        foreach ($avisos as $a) {
            $aviso = Aviso::firstOrNew([
                'empresa_gestora_id' => self::EMPRESA_ID,
                'condominio_id' => self::CONDOMINIO_ID,
                'titulo' => $a['titulo'],
            ]);
            $aviso->fill([
                'autor_user_id' => $autor->id,
                'descricao' => $a['descricao'],
                'categoria' => $a['categoria'],
                'prioridade' => $a['prioridade'],
                'estado' => 'publicado',
                'publicado_em' => now()->subDays(1),
            ]);
            $aviso->save();

            AvisoSegmentacao::firstOrCreate(
                ['aviso_id' => $aviso->id, 'tipo' => 'todos'],
                ['alvo_id' => null]
            );
        }
    }

    private function seedPedidos(Fraccao $fraccao, User $aberto): void
    {
        Ticket::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => self::CONDOMINIO_ID, 'titulo' => 'Infiltração na garagem'],
            [
                'aberto_por_user_id' => $aberto->id,
                'fraccao_id' => $fraccao->id,
                'descricao' => 'Há uma infiltração de água no tecto da garagem, junto ao lugar 12.',
                'categoria' => 'manutencao',
                'prioridade' => 'alta',
                'estado' => 'aberto',
            ]
        );
        Ticket::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => self::CONDOMINIO_ID, 'titulo' => 'Lâmpada fundida no hall'],
            [
                'aberto_por_user_id' => $aberto->id,
                'fraccao_id' => $fraccao->id,
                'descricao' => 'A lâmpada do hall de entrada do piso 2 está fundida.',
                'categoria' => 'electricidade',
                'prioridade' => 'media',
                'estado' => 'resolvido',
                'resolvido_em' => now()->subDays(1),
            ]
        );
    }

    private function seedReservas(User $condominoUser, User $gestor): void
    {
        $espaco = ReservaEspaco::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => self::CONDOMINIO_ID, 'nome' => 'Salão de Festas'],
            [
                'descricao' => 'Salão de festas comum do condomínio.',
                'hora_abertura' => '08:00',
                'hora_fecho' => '23:00',
                'duracao_min_horas' => 1,
                'duracao_max_horas' => 6,
                'antecedencia_min_horas' => 24,
                'antecedencia_max_dias' => 90,
                'tem_caucao' => false,
                'activo' => true,
            ]
        );

        Reserva::firstOrCreate(
            [
                'espaco_id' => $espaco->id,
                'user_id' => $condominoUser->id,
                'data' => now()->addDays(7)->toDateString(),
                'hora_inicio' => '15:00',
            ],
            [
                'condominio_id' => self::CONDOMINIO_ID,
                'hora_fim' => '19:00',
                'estado' => 'confirmada',
                'motivo' => 'Festa de aniversário (demo).',
                'decidida_em' => now(),
                'decidida_por_user_id' => $gestor->id,
            ]
        );
    }

    // ====================================================================

    private function qrUnico(): string
    {
        do {
            $t = Str::random(32);
        } while (PreAprovacao::withTrashed()->where('qr_token', $t)->exists());
        return $t;
    }

    private function otpUnico(): string
    {
        do {
            $o = (string) random_int(100000, 999999);
        } while (PreAprovacao::withTrashed()->where('otp_code', $o)->exists());
        return $o;
    }

    private function imprimirResumo(): void
    {
        $this->command->info('');
        $this->command->info('==== HOMOLOGAÇÃO ECG.LDA (empresa #10 / condomínio #9) ====');
        $this->command->info('Guarda (mobile):  guarda.ecg@ondaka.ao  /  Guarda#2026  (role funcionario)');
        $this->command->info('Pré-aprovações validáveis na portaria (código OTP):');
        foreach ($this->otpsDemo as $d) {
            $this->command->info(sprintf('  - %-28s OTP %s  [%s]', $d['nome'], $d['otp'], $d['estado']));
        }
        $this->command->info('Dados criados: visitas (dentro+histórico), controlo de bens, lista negra,');
        $this->command->info('ocorrências, passagem de turno, avisos, pedidos e reservas.');
        $this->command->info('===========================================================');
    }
}
