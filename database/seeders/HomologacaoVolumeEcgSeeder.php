<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoSegmentacao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Edificio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condominio\Models\TipoFraccao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Facturacao\Services\QuotaService;
use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\Despesa;
use App\Domains\Tickets\Models\Ticket;
use App\Models\ModeloDocumento;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\Visitante;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Volume de dados de DEMONSTRAÇÃO para a ECG.LDA (empresa #10).
 *
 *  - 10 condomínios novos + o Nova York (#9)
 *  - 200 fracções / 200 condóminos (40% no Nova York)
 *  - quotas mensais Jan–Jul 2026 (via QuotaService) — meses antigos marcados pagos
 *  - conta bancária, despesas, visitas, avisos, pedidos por condomínio
 *
 * ESTRITAMENTE limitado à empresa #10. NUNCA toca na empresa #1 / condomínio #1.
 * Idempotente (updateOrCreate/firstOrCreate). Resiliente: cada condomínio é
 * processado isoladamente (try/catch) — falha num não aborta os outros.
 *
 * Correr: php artisan db:seed --class=HomologacaoVolumeEcgSeeder --force
 */
class HomologacaoVolumeEcgSeeder extends Seeder
{
    private const EMPRESA_ID = 10;
    private const NOVA_YORK_ID = 9;
    private const ANO = 2026;
    private const MESES = [1, 2, 3, 4, 5, 6, 7]; // Jan–Jul
    private const MESES_PAGOS = [1, 2, 3, 4];     // meses antigos quitados

    private array $nomes = ['António', 'Maria', 'João', 'Ana', 'Manuel', 'Joaquina', 'Pedro', 'Teresa', 'Carlos', 'Luísa', 'Domingos', 'Esperança', 'Francisco', 'Rosa', 'Miguel', 'Beatriz', 'Paulo', 'Catarina', 'José', 'Filomena', 'Adão', 'Ngeleka', 'Kiala', 'Lukeni', 'Garcia', 'Mateus', 'Sónia', 'Hélder', 'Quitéria', 'Eduardo'];
    private array $apelidos = ['dos Santos', 'Domingos', 'Fernandes', 'Neto', 'Kiala', 'Mendes', 'Sebastião', 'Cardoso', 'Bumba', 'Lopes', 'Quintas', 'André', 'Gourgel', 'Ferreira', 'Pinto', 'Capita', 'Cassule', 'Tchikuteny', 'Manuel', 'Bengui'];
    private array $bancos = ['BANCO BAI', 'BANCO BFA', 'BANCO BIC', 'BANCO SOL', 'ATLÂNTICO', 'BANCO BCI', 'STANDARD BANK'];

    private int $seqCondomino = 0;
    private array $stats = ['condominios' => 0, 'fraccoes' => 0, 'condominos' => 0, 'despesas' => 0, 'visitas' => 0, 'pedidos' => 0, 'avisos' => 0, 'assembleias' => 0, 'documentos' => 0];

    public function run(): void
    {
        if (self::EMPRESA_ID === 1) {
            $this->command->error('RECUSADO: empresa #1. Abortado.');
            return;
        }

        $empresa = \App\Domains\Empresa\Models\EmpresaGestora::find(self::EMPRESA_ID);
        if ($empresa === null) {
            $this->command->error('Empresa #10 não encontrada. Abortado.');
            return;
        }

        $gestor = User::where('id', 25)->where('empresa_gestora_id', self::EMPRESA_ID)->first()
            ?? User::where('empresa_gestora_id', self::EMPRESA_ID)->first();
        $guarda = $this->garantirGuarda();
        $tipoFraccao = $this->garantirTipoFraccao();

        // --- Plano de condomínios: Nova York (#9) com 80 fracções + 10 novos com 12 cada ---
        $plano = [['id' => self::NOVA_YORK_ID, 'fraccoes' => 80, 'nome' => 'Condominio Nova York']];
        $nomesNovos = ['Residencial Talatona', 'Condomínio Maianga', 'Edifício Kilamba Sul', 'Residencial Benfica', 'Condomínio Miramar', 'Vila Alice Residence', 'Condomínio Camama', 'Residencial Patriota', 'Edifício Mutamba', 'Condomínio Cacuaco'];
        foreach ($nomesNovos as $i => $nome) {
            $plano[] = ['codigo' => 'ECGV-C' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT), 'fraccoes' => 12, 'nome' => $nome];
        }

        foreach ($plano as $idx => $p) {
            try {
                $this->processarCondominio($empresa, $p, $idx, $tipoFraccao, $gestor, $guarda);
            } catch (\Throwable $e) {
                $this->command->error("Condomínio '{$p['nome']}' falhou: " . $e->getMessage());
            }
        }

        try {
            $this->seedDocumentos($gestor);
        } catch (\Throwable $e) {
            $this->command->warn('Documentos: ' . $e->getMessage());
        }

        $this->imprimirResumo();
    }

    private function processarCondominio($empresa, array $p, int $idx, TipoFraccao $tipo, ?User $gestor, User $guarda): void
    {
        // Resolver/criar o condomínio
        if (isset($p['id'])) {
            $cond = Condominio::where('id', $p['id'])->where('empresa_gestora_id', self::EMPRESA_ID)->first();
            if ($cond === null) {
                $this->command->warn("Condomínio #{$p['id']} (Nova York) não existe — ignorado.");
                return;
            }
        } else {
            $cond = Condominio::updateOrCreate(
                ['empresa_gestora_id' => self::EMPRESA_ID, 'codigo' => $p['codigo']],
                [
                    'nome' => $p['nome'],
                    'municipio' => 'Luanda',
                    'morada' => $p['nome'] . ', Luanda',
                    'tipo' => 'vertical',
                    'estado' => 'activo',
                    'percentagem_fundo_reserva' => 10,
                ]
            );
            $this->stats['condominios']++;
        }

        // Edifício dedicado aos dados de demo (evita colidir com fracções existentes)
        $edificio = Edificio::updateOrCreate(
            ['condominio_id' => $cond->id, 'codigo' => 'BL-DEMO'],
            ['empresa_gestora_id' => self::EMPRESA_ID, 'nome' => 'Bloco Demo', 'tipo_bloco' => 'torre', 'numero_pisos' => 8],
        );

        // Conta bancária principal (necessária p/ despesas)
        $conta = ContaBancaria::firstOrCreate(
            ['condominio_id' => $cond->id, 'nome' => 'Conta Demo ' . $cond->id],
            [
                'banco' => $this->bancos[$idx % count($this->bancos)],
                'iban' => 'AO06' . str_pad((string) ($cond->id * 7), 21, '0', STR_PAD_LEFT),
                'tipo' => 'corrente',
                'moeda' => 'AOA',
                'saldo_inicial' => 250000,
                'saldo_actual' => 250000 + $idx * 50000,
                'activa' => true,
                'principal' => false,
                'aceita_manual' => true,
            ]
        );

        // Fracções + condóminos + contratos
        $n = $p['fraccoes'];
        $permil = round(1000 / max($n, 1), 4);
        for ($k = 1; $k <= $n; $k++) {
            $ident = 'D-' . str_pad((string) $k, 3, '0', STR_PAD_LEFT);
            $base = 7000 + ($k % 5) * 1500;           // 7.000–13.000
            $fundo = round($base * 0.10, 2);          // 10% p/ fundo de reserva

            $fraccao = Fraccao::updateOrCreate(
                ['edificio_id' => $edificio->id, 'identificador' => $ident],
                [
                    'empresa_gestora_id' => self::EMPRESA_ID,
                    'condominio_id' => $cond->id,
                    'tipo_fraccao_id' => $tipo->id,
                    'area_privativa_m2' => 60 + ($k % 6) * 18,
                    'permilagem' => $permil,
                    'piso' => $k % 8,
                    'estado' => 'ocupada',
                    'quota_mensal_base' => $base,
                    'quota_mensal_fundo_reserva' => $fundo,
                ]
            );

            $this->seqCondomino++;
            $nome = $this->nomes[$this->seqCondomino % count($this->nomes)] . ' ' . $this->apelidos[($this->seqCondomino * 3) % count($this->apelidos)];
            $bi = 'DV' . str_pad((string) $this->seqCondomino, 6, '0', STR_PAD_LEFT) . 'LA041';

            $condomino = Condomino::updateOrCreate(
                ['empresa_gestora_id' => self::EMPRESA_ID, 'numero_bi' => $bi],
                [
                    'tipo' => 'singular',
                    'nome_completo' => $nome,
                    'estado' => 'activo',
                    'nacionalidade' => 'Angolana',
                    'telefone_principal' => '+24492' . str_pad((string) (3000000 + $this->seqCondomino), 7, '0', STR_PAD_LEFT),
                ]
            );

            ContratoOcupacao::firstOrCreate(
                ['condomino_id' => $condomino->id, 'fraccao_id' => $fraccao->id, 'tipo' => 'proprietario'],
                [
                    'empresa_gestora_id' => self::EMPRESA_ID,
                    'data_inicio' => '2025-01-01',
                    'estado' => 'activo',
                    'percentagem_propriedade' => 100,
                ]
            );

            $this->stats['fraccoes']++;
            $this->stats['condominos']++;
        }

        // Quotas mensais (via serviço) + marcar meses antigos pagos
        $quotaService = app(QuotaService::class);
        foreach (self::MESES as $mes) {
            $quotaService->gerarQuotasParaPeriodo($cond->id, self::EMPRESA_ID, self::ANO, $mes, $gestor);
            if (in_array($mes, self::MESES_PAGOS, true)) {
                $this->marcarMesPago($cond->id, $mes);
            }
        }

        // --- Blocos secundários: independentes (falha num não derruba os outros) ---

        // Despesas (3 por condomínio, pagas)
        try {
            $despesasNomes = ['Limpeza de áreas comuns', 'Manutenção de elevadores', 'Energia eléctrica', 'Segurança/portaria', 'Jardinagem', 'Água'];
            for ($d = 0; $d < 3; $d++) {
                $mes = self::MESES_PAGOS[$d % count(self::MESES_PAGOS)];
                $desc = $despesasNomes[($idx + $d) % count($despesasNomes)];
                Despesa::firstOrCreate(
                    ['condominio_id' => $cond->id, 'descricao' => $desc, 'data_despesa' => sprintf('%d-%02d-15', self::ANO, $mes)],
                    [
                        'empresa_gestora_id' => self::EMPRESA_ID,
                        'tipo' => 'condominio',
                        'conta_bancaria_id' => $conta->id,
                        'valor' => 35000 + $d * 15000,
                        'fornecedor' => 'Fornecedor ' . ($d + 1),
                        'estado' => 'paga',
                        'paga_em' => sprintf('%d-%02d-16 10:00:00', self::ANO, $mes),
                        'criada_por_user_id' => $gestor?->id,
                    ]
                );
                $this->stats['despesas']++;
            }
        } catch (\Throwable $e) {
            $this->command->warn("Despesas ({$cond->nome}): " . $e->getMessage());
        }

        // Avisos (2) + segmentação todos
        try {
            foreach ([['Reunião de condóminos', 'reuniao'], ['Manutenção programada', 'manutencao']] as $a) {
                $aviso = Aviso::firstOrNew(['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => $cond->id, 'titulo' => $a[0]]);
                $aviso->fill([
                    'autor_user_id' => $gestor?->id ?? $guarda->id,
                    'descricao' => $a[0] . ' — comunicado de demonstração.',
                    'categoria' => $a[1],
                    'prioridade' => 'media',
                    'estado' => 'publicado',
                    'publicado_em' => now()->subDays(3),
                ]);
                $aviso->save();
                AvisoSegmentacao::firstOrCreate(['aviso_id' => $aviso->id, 'tipo' => 'todos'], ['alvo_id' => null]);
                $this->stats['avisos']++;
            }
        } catch (\Throwable $e) {
            $this->command->warn("Avisos ({$cond->nome}): " . $e->getMessage());
        }

        // Pedidos (2)
        try {
            foreach ([['Infiltração na garagem', 'manutencao', 'aberto'], ['Lâmpada fundida no hall', 'electricidade', 'resolvido']] as $t) {
                Ticket::firstOrCreate(
                    ['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => $cond->id, 'titulo' => $t[0]],
                    [
                        'aberto_por_user_id' => $gestor?->id ?? $guarda->id,
                        'descricao' => $t[0] . ' (demo).',
                        'categoria' => $t[1],
                        'prioridade' => 'media',
                        'estado' => $t[2],
                        'resolvido_em' => $t[2] === 'resolvido' ? now()->subDay() : null,
                    ]
                );
                $this->stats['pedidos']++;
            }
        } catch (\Throwable $e) {
            $this->command->warn("Pedidos ({$cond->nome}): " . $e->getMessage());
        }

        // Visitas (3): visitante + pré-aprovação + visita
        try {
            $condominoRef = Condomino::where('empresa_gestora_id', self::EMPRESA_ID)
                ->whereHas('contratos', fn ($q) => $q->where('estado', 'activo')->whereHas('fraccao', fn ($f) => $f->where('condominio_id', $cond->id)))
                ->first();
            $fraccaoRef = Fraccao::where('condominio_id', $cond->id)->first();
            if ($condominoRef && $fraccaoRef) {
                for ($v = 0; $v < 3; $v++) {
                    $this->criarVisita($cond, $fraccaoRef, $condominoRef, $guarda, $v);
                    $this->stats['visitas']++;
                }
            }
        } catch (\Throwable $e) {
            $this->command->warn("Visitas ({$cond->nome}): " . $e->getMessage());
        }

        // Assembleia (1 por condomínio) + participantes
        try {
            $this->criarAssembleia($cond, $gestor);
        } catch (\Throwable $e) {
            $this->command->warn("Assembleia ({$cond->nome}): " . $e->getMessage());
        }
    }

    private function criarAssembleia(Condominio $cond, ?User $gestor): void
    {
        $numero = 'ASS-2026-' . $cond->id;
        $assembleia = Assembleia::firstOrNew(['empresa_gestora_id' => self::EMPRESA_ID, 'condominio_id' => $cond->id, 'numero' => $numero]);
        if (! $assembleia->exists) {
            $assembleia->fill([
                'tipo' => 'ordinaria',
                'titulo' => 'Assembleia Geral Ordinária 2026',
                'ordem_do_dia' => "1. Aprovação de contas\n2. Orçamento 2026\n3. Fundo de reserva\n4. Outros assuntos",
                'data_agendada' => now()->addDays(15)->setTime(18, 0),
                'local' => 'Virtual (Jitsi)',
                'modo' => 'virtual',
                'sala_jitsi' => 'ondaka-ass-' . $cond->id . '-' . Str::lower(Str::random(6)),
                'quorum_minimo_percent' => 50,
                'estado' => 'agendada',
                'criada_por_user_id' => $gestor?->id,
            ]);
            $assembleia->save();
        }
        $this->stats['assembleias']++;

        // Participantes: condóminos com contrato activo neste condomínio (até 30)
        $condominos = Condomino::where('empresa_gestora_id', self::EMPRESA_ID)
            ->whereHas('contratos', fn ($q) => $q->where('estado', 'activo')->whereHas('fraccao', fn ($f) => $f->where('condominio_id', $cond->id)))
            ->limit(30)->get();
        foreach ($condominos as $c) {
            AssembleiaParticipante::firstOrCreate(
                ['assembleia_id' => $assembleia->id, 'condomino_id' => $c->id],
                ['nome_snapshot' => $c->nome_completo, 'documento_snapshot' => $c->numero_bi, 'presente' => false],
            );
        }
    }

    private function seedDocumentos(?User $gestor): void
    {
        $docs = [
            ['regulamento', 'Regulamento do Condomínio', 'documentos/demo/regulamento.pdf'],
            ['contrato', 'Modelo de Contrato de Arrendamento', 'documentos/demo/contrato.pdf'],
            ['outro', 'Manual de Boas Práticas', 'documentos/demo/manual.pdf'],
        ];
        foreach ($docs as $d) {
            ModeloDocumento::firstOrCreate(
                ['empresa_gestora_id' => self::EMPRESA_ID, 'categoria' => $d[0], 'nome' => $d[1]],
                ['ficheiro_path' => $d[2], 'visivel_mobile' => true, 'criado_por_user_id' => $gestor?->id],
            );
            $this->stats['documentos']++;
        }
    }

    private function marcarMesPago(int $condominioId, int $mes): void
    {
        $quotas = Quota::where('condominio_id', $condominioId)
            ->where('ano', self::ANO)->where('mes', $mes)->get();
        foreach ($quotas as $quota) {
            Lancamento::where('quota_id', $quota->id)->update(['valor_pago' => DB::raw('valor'), 'estado' => 'pago']);
            try {
                $quota->recalcularEstado();
            } catch (\Throwable $e) {
                // se o recalculo divergir, não bloqueia o seed
            }
        }
    }

    private function criarVisita(Condominio $cond, Fraccao $fraccao, Condomino $condomino, User $guarda, int $i): void
    {
        $nome = 'Visitante ' . $cond->id . '-' . ($i + 1);
        $tel = '+24493' . str_pad((string) ($cond->id * 10 + $i), 7, '0', STR_PAD_LEFT);

        $visitante = Visitante::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'nome' => $nome, 'telefone' => $tel],
            ['notas' => 'Demo volume']
        );

        $pa = PreAprovacao::firstOrNew([
            'empresa_gestora_id' => self::EMPRESA_ID, 'fraccao_id' => $fraccao->id, 'nome_visitante' => $nome, 'telefone_visitante' => $tel,
        ]);
        if (! $pa->exists) {
            $pa->qr_token = $this->qrUnico();
            $pa->otp_code = $this->otpUnico();
        }
        $pa->fill([
            'condomino_id' => $condomino->id,
            'tipo_acesso' => 'visita',
            'estado' => 'usada',
            'valida_ate' => now()->addDay(),
            'sms_enviado' => true,
        ]);
        $pa->save();

        $visita = Visita::firstOrNew([
            'empresa_gestora_id' => self::EMPRESA_ID, 'pre_aprovacao_id' => $pa->id, 'visitante_id' => $visitante->id,
        ]);
        if (! $visita->exists) {
            $visita->entrou_em = now()->subDays($i + 1)->setTime(10, 0);
        }
        $visita->fill([
            'fraccao_id' => $fraccao->id,
            'guarda_entrada_id' => $guarda->id,
            'saiu_em' => $i === 0 ? null : now()->subDays($i + 1)->setTime(12, 0),
            'guarda_saida_id' => $i === 0 ? null : $guarda->id,
            'metodo_validacao' => 'qr',
        ]);
        $visita->save();
    }

    private function garantirGuarda(): User
    {
        $guarda = User::firstOrNew(['email' => 'guarda.ecg@ondaka.ao']);
        $novo = ! $guarda->exists;
        $guarda->empresa_gestora_id = self::EMPRESA_ID;
        $guarda->name = 'Guarda ECG (Demo)';
        $guarda->estado = 'activo';
        $guarda->condominio_activo_id = self::NOVA_YORK_ID;
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

    private function garantirTipoFraccao(): TipoFraccao
    {
        return TipoFraccao::firstOrCreate(
            ['empresa_gestora_id' => self::EMPRESA_ID, 'codigo' => 'APT-DEMO'],
            ['nome' => 'Apartamento (Demo)', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true],
        );
    }

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
        $this->command->info('==== VOLUME ECG.LDA (empresa #10) ====');
        foreach ($this->stats as $k => $v) {
            $this->command->info(sprintf('  %-12s %d', $k, $v));
        }
        $this->command->info('Quotas Jan–Jul 2026 geradas; meses Jan–Abr marcados pagos.');
        $this->command->info('======================================');
    }
}
