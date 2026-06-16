<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Models\AcordoPagamento;
use App\Domains\Facturacao\Models\AcordoPrestacao;
use App\Domains\Facturacao\Models\AcordoProposta;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AcordoService
{
    public function __construct(
        private LimitacaoAcessoService $limitacao,
    ) {}

    /**
     * Condómino propõe um acordo. Calcula o total em dívida no momento.
     * Não cria prestações ainda (só ao aprovar) - o gestor pode ajustar o nº.
     */
    public function propor(Condomino $condomino, int $numPrestacoes, ?string $observacoes = null): AcordoPagamento
    {
        $numPrestacoes = max(2, min(6, $numPrestacoes));

        // Já tem acordo aberto (pendente/aprovado/em_cumprimento)? Não cria outro.
        $existe = AcordoPagamento::where('condomino_id', $condomino->id)
            ->whereIn('estado', ['pendente', 'aprovado', 'em_cumprimento'])
            ->exists();
        if ($existe) {
            throw new \RuntimeException('Já existe um acordo activo ou pendente para este condómino.');
        }

        $total = $this->calcularDividaTotal($condomino);
        if ($total <= 0) {
            throw new \RuntimeException('Não há dívida em atraso para negociar.');
        }

        $condominioId = $this->descobrirCondominioId($condomino);

        return AcordoPagamento::create([
            'condomino_id' => $condomino->id,
            'condominio_id' => $condominioId,
            'empresa_gestora_id' => $condomino->empresa_gestora_id,
            'valor_total' => $total,
            'num_prestacoes' => $numPrestacoes,
            'estado' => 'pendente',
            'proposto_por_user_id' => $condomino->user_id,
            'observacoes' => $observacoes,
        ]);
    }

    /**
     * Gestor aprova. Pode ajustar o nº de prestações. Cria as prestações.
     */
    public function aprovar(AcordoPagamento $acordo, User $gestor, ?int $numPrestacoesAjustado = null): AcordoPagamento
    {
        if ($acordo->estado !== 'pendente') {
            throw new \RuntimeException('Só acordos pendentes podem ser aprovados.');
        }

        $num = $numPrestacoesAjustado ? max(2, min(6, $numPrestacoesAjustado)) : $acordo->num_prestacoes;

        return DB::transaction(function () use ($acordo, $gestor, $num) {
            $acordo->update([
                'estado' => 'aprovado',
                'num_prestacoes' => $num,
                'aprovado_por_user_id' => $gestor->id,
                'decidido_em' => now(),
            ]);

            // dividir o total em N prestações (a última ajusta o arredondamento)
            $total = (float) $acordo->valor_total;
            $base = round($total / $num, 2);
            $acumulado = 0.0;

            for ($i = 1; $i <= $num; $i++) {
                $valor = ($i < $num) ? $base : round($total - $acumulado, 2);
                $acumulado += $valor;
                AcordoPrestacao::create([
                    'acordo_id' => $acordo->id,
                    'numero' => $i,
                    'valor' => $valor,
                    'data_vencimento' => now()->addMonths($i)->startOfDay(),
                    'estado' => 'pendente',
                ]);
            }

            return $acordo->fresh('prestacoes');
        });
    }

    public function recusar(AcordoPagamento $acordo, User $gestor, ?string $motivo = null): AcordoPagamento
    {
        if ($acordo->estado !== 'pendente') {
            throw new \RuntimeException('Só acordos pendentes podem ser recusados.');
        }
        $acordo->update([
            'estado' => 'recusado',
            'aprovado_por_user_id' => $gestor->id,
            'decidido_em' => now(),
            'motivo_recusa' => $motivo,
        ]);
        return $acordo;
    }

    /**
     * Marca uma prestação como paga e recalcula o estado do acordo.
     */
    public function marcarPrestacaoPaga(AcordoPrestacao $prestacao): AcordoPagamento
    {
        return DB::transaction(function () use ($prestacao) {
            $prestacao->update(['estado' => 'paga', 'paga_em' => now()]);
            $acordo = $prestacao->acordo;

            $total = $acordo->prestacoes()->count();
            $pagas = $acordo->prestacoes()->where('estado', 'paga')->count();

            if ($pagas >= $total) {
                $acordo->update(['estado' => 'cumprido']);
            } else {
                $acordo->update(['estado' => 'em_cumprimento']);
            }
            return $acordo->fresh('prestacoes');
        });
    }

    /**
     * Usado pela LimitacaoAcessoService: o acordo restaura o acesso?
     * Verdadeiro se há acordo aprovado/em_cumprimento SEM prestações atrasadas.
     */
    /**
     * Verifica se o condomino esta EM DIA com o RITMO do acordo.
     * Meta = soma das prestacoes vencidas ha mais de 10 dias (tolerancia).
     * Pago = soma do valor pago das quotas que compoem o acordo (limitado ao que entrou).
     * Em dia se: pago >= meta.
     */
    public function acordoEmDiaComRitmo(AcordoPagamento $acordo): bool
    {
        // Meta acumulada: prestacoes cujo vencimento ja passou ha mais de 10 dias
        $limiteData = now()->subDays(10)->startOfDay();
        $meta = (float) $acordo->prestacoes()
            ->whereDate('data_vencimento', '<=', $limiteData)
            ->sum('valor');

        if ($meta <= 0) {
            // Ainda nenhuma prestacao venceu (com tolerancia) -> esta em dia
            return true;
        }

        // Pago: somar o valor pago das quotas do acordo, limitado ao valor que entrou
        $pago = 0.0;
        $linhas = DB::table('acordo_quotas')->where('acordo_id', $acordo->id)->get();
        foreach ($linhas as $linha) {
            $quota = \App\Domains\Facturacao\Models\Quota::find($linha->quota_id);
            if (! $quota) {
                continue;
            }
            // quanto desta quota ja foi pago, mas no maximo o que entrou no acordo
            $pagoQuota = min((float) $quota->valor_pago, (float) $linha->valor_em_divida);
            $pago += $pagoQuota;
        }

        // F-05: somar também o pago dos outros lançamentos do acordo.
        $linhasLanc = DB::table('acordo_lancamentos')->where('acordo_id', $acordo->id)->get();
        foreach ($linhasLanc as $linha) {
            $l = \App\Domains\Facturacao\Models\Lancamento::find($linha->lancamento_id);
            if (! $l) {
                continue;
            }
            $pago += min((float) $l->valor_pago, (float) $linha->valor_em_divida);
        }

        return round($pago, 2) >= round($meta, 2);
    }

    /**
     * Decide se o acordo do condomino lhe DESBLOQUEIA o acesso.
     * Regras (decididas com o cliente):
     *  - O acordo tem de estar aprovado/em_cumprimento.
     *  - Tem de estar EM DIA COM O RITMO (senao, quebra na hora e nao desbloqueia).
     *  - Tem de NAO ter taxa corrente (do mes) nova com mais de 10 dias por pagar.
     * Devolve true se desbloqueia; false se mantem bloqueado.
     */
    public function acordoDesbloqueia(Condomino $condomino): bool
    {
        $acordo = AcordoPagamento::where('condomino_id', $condomino->id)
            ->whereIn('estado', ['aprovado', 'em_cumprimento'])
            ->latest()
            ->first();
        if (! $acordo) {
            return false;
        }

        // 1) So desbloqueia depois de pagar a 1a prestacao (entrada), confirmada pelo gestor.
        $temPrestacaoPaga = $acordo->prestacoes()->where('estado', 'paga')->exists();
        if (! $temPrestacaoPaga) {
            return false;
        }

        // 2) Prestacao seguinte vencida ha mais de 10 dias por pagar -> QUEBRA e nao desbloqueia.
        $limite = now()->subDays(10);
        $prestacaoEmFalta = $acordo->prestacoes()
            ->where('estado', '!=', 'paga')
            ->whereDate('data_vencimento', '<', $limite)
            ->exists();
        if ($prestacaoEmFalta) {
            if ($acordo->estado !== 'quebrado') {
                $acordo->update(['estado' => 'quebrado']);
            }
            return false;
        }

        // 3) Taxas correntes: quota NOVA (vence apos o acordo) com mais de 10 dias por pagar -> bloqueia.
        if ($this->temTaxaCorrenteVencidaHaMais10Dias($condomino, $acordo)) {
            return false;
        }

        return true;
    }

    /**
     * Ha alguma quota (taxa do mes) criada DEPOIS do acordo, ainda por pagar,
     * com mais de 10 dias desde a sua criacao?
     */
    private function temTaxaCorrenteVencidaHaMais10Dias(Condomino $condomino, AcordoPagamento $acordo): bool
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        if ($fraccaoIds->isEmpty()) {
            return false;
        }
        // Taxa NOVA = vence depois do inicio do acordo. Em falta = vencida ha mais de 10 dias.
        $limite = now()->subDays(10);
        return \App\Domains\Facturacao\Models\Quota::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->where('data_vencimento', '>', $acordo->created_at)
            ->whereDate('data_vencimento', '<', $limite)
            ->exists();
    }

    public function estaActivoEmDia(Condomino $condomino): bool
    {
        $acordo = AcordoPagamento::where('condomino_id', $condomino->id)
            ->whereIn('estado', ['aprovado', 'em_cumprimento'])
            ->latest()
            ->first();

        if (! $acordo) {
            return false;
        }

        // So desbloqueia apos pelo menos 1 prestacao paga e confirmada pelo gestor
        $temPrestacaoPaga = $acordo->prestacoes()
            ->where('estado', 'paga')
            ->exists();

        if (! $temPrestacaoPaga) {
            return false;
        }
        $temVencidaPorPagar = $acordo->prestacoes()
            ->where('estado', '!=', 'paga')
            ->whereDate('data_vencimento', '<', now())
            ->exists();
        return ! $temVencidaPorPagar;
    }

    public function configAcordo(int $condominioId): array
    {
        $c = DB::table('condominio_facturacao_config')
            ->where('condominio_id', $condominioId)
            ->first();

        return [
            'min' => (int) ($c->acordo_min_prestacoes ?? 2),
            'max' => (int) ($c->acordo_max_prestacoes ?? 6),
            'entrada_pct' => (float) ($c->acordo_entrada_minima_pct ?? 0),
            'juro_pct' => (float) ($c->acordo_juro_pct ?? 0),
        ];
    }

    public function calcularValores(float $divida, int $numPrestacoes, array $cfg): array
    {
        $comJuro = round($divida * (1 + $cfg['juro_pct'] / 100), 2);
        $entrada = round($comJuro * ($cfg['entrada_pct'] / 100), 2);
        $resto = round($comJuro - $entrada, 2);
        $prestacao = $numPrestacoes > 0 ? round($resto / $numPrestacoes, 2) : 0.0;

        return [
            'valor_com_juro' => $comJuro,
            'valor_entrada' => $entrada,
            'valor_prestacao' => $prestacao,
        ];
    }

    public function proporComDialogo(Condomino $condomino, int $numPrestacoes, ?string $observacoes = null): AcordoPagamento
    {
        $existe = AcordoPagamento::where('condomino_id', $condomino->id)
            ->whereIn('estado', ['pendente', 'aprovado', 'em_cumprimento', 'aguarda_gestor', 'aguarda_condomino'])
            ->exists();
        if ($existe) {
            throw new \RuntimeException('Ja existe um acordo activo ou em negociacao para este condomino.');
        }

        $divida = $this->calcularDividaTotal($condomino);
        if ($divida <= 0) {
            throw new \RuntimeException('Nao ha divida em atraso para negociar.');
        }

        $condominioId = $this->descobrirCondominioId($condomino);
        $cfg = $this->configAcordo($condominioId);
        $numPrestacoes = max($cfg['min'], min($cfg['max'], $numPrestacoes));
        $vals = $this->calcularValores($divida, $numPrestacoes, $cfg);

        return DB::transaction(function () use ($condomino, $condominioId, $divida, $numPrestacoes, $vals, $observacoes) {
            $acordo = AcordoPagamento::create([
                'condomino_id' => $condomino->id,
                'condominio_id' => $condominioId,
                'empresa_gestora_id' => $condomino->empresa_gestora_id,
                'valor_total' => $divida,
                'valor_entrada' => $vals['valor_entrada'],
                'valor_com_juro' => $vals['valor_com_juro'],
                'num_prestacoes' => $numPrestacoes,
                'estado' => 'aguarda_gestor',
                'proposto_por_user_id' => $condomino->user_id,
                'observacoes' => $observacoes,
                'rondas_condomino' => 1,
                'rondas_gestor' => 0,
            ]);

            AcordoProposta::create([
                'acordo_id' => $acordo->id,
                'autor' => 'condomino',
                'ronda' => 1,
                'num_prestacoes' => $numPrestacoes,
                'valor_com_juro' => $vals['valor_com_juro'],
                'valor_entrada' => $vals['valor_entrada'],
                'observacoes' => $observacoes,
                'autor_user_id' => $condomino->user_id,
            ]);

            // Registar as QUOTAS vencidas que compoem este acordo (divida velha).
            $this->registarQuotasDoAcordo($acordo, $condomino);
            // F-05: registar também os outros lançamentos em dívida (multa/extra/juros).
            $this->registarLancamentosDoAcordo($acordo, $condomino);

            app(AcordoNotificacaoService::class)->avisarGestor(
                $acordo, 'Nova proposta de acordo',
                'Um condomino enviou uma proposta de acordo de pagamento.'
            );

            return $acordo->fresh('propostas');
        });
    }

    public function contrapropostaGestor(AcordoPagamento $acordo, User $gestor, int $numPrestacoes, ?string $observacoes = null): AcordoPagamento
    {
        if ($acordo->estado !== 'aguarda_gestor') {
            throw new \RuntimeException('Nao e a vez do gestor responder a este acordo.');
        }
        if ($acordo->rondas_gestor >= 3) {
            throw new \RuntimeException('Limite de contrapropostas do gestor atingido.');
        }

        $cfg = $this->configAcordo($acordo->condominio_id);
        $numPrestacoes = max($cfg['min'], min($cfg['max'], $numPrestacoes));
        $vals = $this->calcularValores((float) $acordo->valor_total, $numPrestacoes, $cfg);

        return DB::transaction(function () use ($acordo, $gestor, $numPrestacoes, $vals, $observacoes) {
            $acordo->update([
                'estado' => 'aguarda_condomino',
                'num_prestacoes' => $numPrestacoes,
                'valor_entrada' => $vals['valor_entrada'],
                'valor_com_juro' => $vals['valor_com_juro'],
                'rondas_gestor' => $acordo->rondas_gestor + 1,
            ]);

            AcordoProposta::create([
                'acordo_id' => $acordo->id,
                'autor' => 'gestor',
                'ronda' => $acordo->rondas_gestor + 1,
                'num_prestacoes' => $numPrestacoes,
                'valor_com_juro' => $vals['valor_com_juro'],
                'valor_entrada' => $vals['valor_entrada'],
                'observacoes' => $observacoes,
                'autor_user_id' => $gestor->id,
            ]);

            app(AcordoNotificacaoService::class)->avisarCondomino(
                $acordo, 'A gestao respondeu ao seu acordo',
                'A gestao enviou uma contraproposta ao seu acordo de pagamento.'
            );

            return $acordo->fresh('propostas');
        });
    }

    public function contrapropostaCondomino(AcordoPagamento $acordo, int $numPrestacoes, ?string $observacoes = null): AcordoPagamento
    {
        if ($acordo->estado !== 'aguarda_condomino') {
            throw new \RuntimeException('Nao e a vez do condomino responder a este acordo.');
        }
        if ($acordo->rondas_condomino >= 3) {
            return $this->aplicarUltimaDoGestor($acordo);
        }

        $cfg = $this->configAcordo($acordo->condominio_id);
        $numPrestacoes = max($cfg['min'], min($cfg['max'], $numPrestacoes));
        $vals = $this->calcularValores((float) $acordo->valor_total, $numPrestacoes, $cfg);

        return DB::transaction(function () use ($acordo, $numPrestacoes, $vals, $observacoes) {
            $acordo->update([
                'estado' => 'aguarda_gestor',
                'num_prestacoes' => $numPrestacoes,
                'valor_entrada' => $vals['valor_entrada'],
                'valor_com_juro' => $vals['valor_com_juro'],
                'rondas_condomino' => $acordo->rondas_condomino + 1,
            ]);

            AcordoProposta::create([
                'acordo_id' => $acordo->id,
                'autor' => 'condomino',
                'ronda' => $acordo->rondas_condomino + 1,
                'num_prestacoes' => $numPrestacoes,
                'valor_com_juro' => $vals['valor_com_juro'],
                'valor_entrada' => $vals['valor_entrada'],
                'observacoes' => $observacoes,
                'autor_user_id' => $acordo->proposto_por_user_id,
            ]);

            app(AcordoNotificacaoService::class)->avisarGestor(
                $acordo, 'Nova contraproposta do condomino',
                'O condomino respondeu com uma contraproposta ao acordo.'
            );

            return $acordo->fresh('propostas');
        });
    }

    public function aceitarDialogo(AcordoPagamento $acordo, int $quemUserId): AcordoPagamento
    {
        if (! in_array($acordo->estado, ['aguarda_gestor', 'aguarda_condomino'], true)) {
            throw new \RuntimeException('Este acordo nao esta em negociacao.');
        }
        $aprovado = $this->gerarPrestacoesEAprovar($acordo, $quemUserId);

        $notif = app(AcordoNotificacaoService::class);
        if ($quemUserId === (int) $acordo->proposto_por_user_id) {
            $notif->avisarGestor($aprovado, 'Acordo aceite pelo condomino', 'O condomino aceitou o acordo de pagamento. Ja esta activo.');
        } else {
            $notif->avisarCondomino($aprovado, 'O seu acordo foi aceite', 'A gestao aceitou o seu acordo. Ja pode comecar a pagar as prestacoes.');
        }

        return $aprovado;
    }

    public function recusarDialogo(AcordoPagamento $acordo, int $quemUserId, ?string $motivo = null): AcordoPagamento
    {
        if (! in_array($acordo->estado, ['aguarda_gestor', 'aguarda_condomino'], true)) {
            throw new \RuntimeException('Este acordo nao esta em negociacao.');
        }
        $acordo->update([
            'estado' => 'recusado',
            'aprovado_por_user_id' => $quemUserId,
            'decidido_em' => now(),
            'motivo_recusa' => $motivo,
        ]);

        $notif = app(AcordoNotificacaoService::class);
        if ($quemUserId === (int) $acordo->proposto_por_user_id) {
            $notif->avisarGestor($acordo, 'Acordo recusado pelo condomino', 'O condomino recusou a contraproposta da gestao.');
        } else {
            $notif->avisarCondomino($acordo, 'O seu acordo foi recusado', 'A gestao recusou o seu acordo de pagamento.');
        }

        return $acordo;
    }

    private function aplicarUltimaDoGestor(AcordoPagamento $acordo): AcordoPagamento
    {
        $ultimaGestor = AcordoProposta::where('acordo_id', $acordo->id)
            ->where('autor', 'gestor')
            ->latest('id')
            ->first();

        if ($ultimaGestor) {
            $acordo->update([
                'num_prestacoes' => $ultimaGestor->num_prestacoes,
                'valor_entrada' => $ultimaGestor->valor_entrada,
                'valor_com_juro' => $ultimaGestor->valor_com_juro,
            ]);
        }
        return $this->gerarPrestacoesEAprovar($acordo, $acordo->aprovado_por_user_id ?? $acordo->proposto_por_user_id);
    }

    private function criarLancamentoAcordo(AcordoPagamento $acordo, ?int $fraccaoId, float $valor, $vencimento, string $descricao, int $quemUserId)
    {
        if (! $fraccaoId) {
            return null;
        }
        $id = DB::table('lancamentos_condomino')->insertGetId([
            'empresa_gestora_id' => $acordo->empresa_gestora_id,
            'condominio_id' => $acordo->condominio_id,
            'fraccao_id' => $fraccaoId,
            'condomino_id' => $acordo->condomino_id,
            'tipo' => 'acordo',
            'descricao' => $descricao,
            'valor' => number_format($valor, 2, '.', ''),
            'data_lancamento' => now()->toDateString(),
            'data_vencimento' => $vencimento instanceof \DateTimeInterface ? $vencimento->format('Y-m-d') : $vencimento,
            'estado' => 'em_aberto',
            'valor_pago' => '0.00',
            'criado_por_user_id' => $quemUserId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return (object) ['id' => $id];
    }

    private function gerarPrestacoesEAprovar(AcordoPagamento $acordo, int $quemUserId): AcordoPagamento
    {
        return DB::transaction(function () use ($acordo, $quemUserId) {
            $acordo->update([
                'estado' => 'aprovado',
                'aprovado_por_user_id' => $quemUserId,
                'decidido_em' => now(),
            ]);

            AcordoPrestacao::where('acordo_id', $acordo->id)->delete();

            // Dados de contexto para os lancamentos (a prestacao gera um lancamento normal, tipo 'acordo')
            $condomino = \App\Domains\Condomino\Models\Condomino::find($acordo->condomino_id);
            $fraccaoId = $condomino?->contratosActivos()->value('fraccao_id');

            $num = (int) $acordo->num_prestacoes;
            $comJuro = (float) ($acordo->valor_com_juro ?? $acordo->valor_total);
            $entrada = (float) ($acordo->valor_entrada ?? 0);
            $resto = round($comJuro - $entrada, 2);
            $base = $num > 0 ? round($resto / $num, 2) : 0.0;
            $acumulado = 0.0;

            $proxNumero = 1;
            if ($entrada > 0) {
                $venc = now()->addDays(7)->startOfDay();
                $lanc = $this->criarLancamentoAcordo($acordo, $fraccaoId, $entrada, $venc, 'Entrada do acordo de pagamento', $quemUserId);
                AcordoPrestacao::create([
                    'acordo_id' => $acordo->id,
                    'lancamento_id' => $lanc?->id,
                    'numero' => $proxNumero,
                    'valor' => $entrada,
                    'data_vencimento' => $venc,
                    'estado' => 'pendente',
                ]);
                $proxNumero++;
            }

            for ($i = 1; $i <= $num; $i++) {
                $valor = ($i < $num) ? $base : round($resto - $acumulado, 2);
                $acumulado += $valor;
                $venc = now()->addMonths($i)->startOfDay();
                $lanc = $this->criarLancamentoAcordo($acordo, $fraccaoId, $valor, $venc, 'Prestacao ' . $proxNumero . ' do acordo de pagamento', $quemUserId);
                AcordoPrestacao::create([
                    'acordo_id' => $acordo->id,
                    'lancamento_id' => $lanc?->id,
                    'numero' => $proxNumero,
                    'valor' => $valor,
                    'data_vencimento' => $venc,
                    'estado' => 'pendente',
                ]);
                $proxNumero++;
            }

            // Anular as quotas originais que entraram no acordo (evita duplicacao).
            $quotaIds = DB::table('acordo_quotas')->where('acordo_id', $acordo->id)->pluck('quota_id');
            foreach ($quotaIds as $qid) {
                $quota = \App\Domains\Facturacao\Models\Quota::find($qid);
                if (! $quota) {
                    continue;
                }
                \App\Domains\Facturacao\Models\Lancamento::where('quota_id', $qid)
                    ->whereIn('estado', ['em_aberto', 'pago_parcial'])
                    ->update([
                        'estado' => 'cancelado',
                        'motivo_cancelamento' => 'Substituido por acordo de pagamento #' . $acordo->id,
                        'cancelado_em' => now(),
                    ]);
                $quota->update([
                    'estado' => 'cancelada',
                    'observacoes' => trim((string) $quota->observacoes . ' | Incluida no acordo #' . $acordo->id),
                ]);
            }

            // F-05: anular também os outros lançamentos que entraram no acordo.
            $lancamentoIds = DB::table('acordo_lancamentos')->where('acordo_id', $acordo->id)->pluck('lancamento_id');
            \App\Domains\Facturacao\Models\Lancamento::whereIn('id', $lancamentoIds)
                ->whereIn('estado', ['em_aberto', 'pago_parcial'])
                ->update([
                    'estado' => 'cancelado',
                    'motivo_cancelamento' => 'Substituido por acordo de pagamento #' . $acordo->id,
                    'cancelado_em' => now(),
                ]);

            return $acordo->fresh(['prestacoes', 'propostas']);
        });
    }

    /**
     * Regista as quotas vencidas que compoem o acordo, com o valor em divida no momento.
     * O ritmo do acordo e medido pelo valor_pago destas quotas ao longo do tempo.
     */
    private function registarQuotasDoAcordo(AcordoPagamento $acordo, Condomino $condomino): void
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        if ($fraccaoIds->isEmpty()) {
            return;
        }
        $quotas = \App\Domains\Facturacao\Models\Quota::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->whereDate('data_vencimento', '<', now())
            ->get();
        foreach ($quotas as $q) {
            $emDivida = round((float) $q->valor_total - (float) $q->valor_pago, 2);
            if ($emDivida <= 0) {
                continue;
            }
            DB::table('acordo_quotas')->insert([
                'acordo_id' => $acordo->id,
                'quota_id' => $q->id,
                'valor_em_divida' => number_format($emDivida, 2, '.', ''),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * F-05: regista os outros lançamentos em dívida (multa, despesa extra, juros,
     * ajuste a débito) que compõem o acordo, à semelhança de registarQuotasDoAcordo.
     */
    private function registarLancamentosDoAcordo(AcordoPagamento $acordo, Condomino $condomino): void
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        if ($fraccaoIds->isEmpty()) {
            return;
        }
        $lancamentos = \App\Domains\Facturacao\Models\Lancamento::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('tipo', ['despesa_extra', 'multa', 'juros', 'ajuste_debito'])
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->get();
        foreach ($lancamentos as $l) {
            $emDivida = round((float) $l->valor - (float) $l->valor_pago, 2);
            if ($emDivida <= 0) {
                continue;
            }
            DB::table('acordo_lancamentos')->insert([
                'acordo_id' => $acordo->id,
                'lancamento_id' => $l->id,
                'valor_em_divida' => number_format($emDivida, 2, '.', ''),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function calcularDividaTotal(Condomino $condomino): float
    {
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id');
        if ($fraccaoIds->isEmpty()) {
            return 0.0;
        }
        $totalQuotas = \App\Domains\Facturacao\Models\Quota::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->whereDate('data_vencimento', '<', now())
            ->sum(DB::raw('valor_total - valor_pago'));

        // F-05: incluir também os outros lançamentos em dívida (multa, despesa
        // extra, juros, ajuste a débito) — acordos para todo o tipo de faturas.
        // Estes são cobranças pontuais: negociáveis mesmo antes do vencimento.
        $totalLancamentos = \App\Domains\Facturacao\Models\Lancamento::whereIn('fraccao_id', $fraccaoIds)
            ->whereIn('tipo', ['despesa_extra', 'multa', 'juros', 'ajuste_debito'])
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->sum(DB::raw('valor - valor_pago'));

        return round((float) $totalQuotas + (float) $totalLancamentos, 2);
    }

    private function descobrirCondominioId(Condomino $condomino): ?int
    {
        $fraccaoId = $condomino->contratosActivos()->value('fraccao_id');
        if (! $fraccaoId) {
            return null;
        }
        return DB::table('fraccoes')->where('id', $fraccaoId)->value('condominio_id');
    }
}
