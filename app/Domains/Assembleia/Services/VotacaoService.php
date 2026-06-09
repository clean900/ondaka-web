<?php

namespace App\Domains\Assembleia\Services;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Assembleia\Models\AssembleiaPontoVotacao;
use App\Domains\Assembleia\Models\AssembleiaVoto;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class VotacaoService
{
    /**
     * Palavras-chave que indicam um ponto da ordem do dia é deliberativo.
     * Baseado em linguagem comum usada em actas de condomínios angolanos.
     */
    protected const PALAVRAS_DELIBERATIVAS = [
        'aprovar', 'aprovação', 'aprova',
        'decidir', 'decisão', 'decide',
        'votar', 'votação', 'vota',
        'eleger', 'eleição', 'eleger',
        'autorizar', 'autorização', 'autoriza',
        'deliberar', 'deliberação', 'delibera',
        'ratificar', 'ratificação',
        'confirmar', 'confirmação',
    ];

    /**
     * Detecta automaticamente pontos deliberativos na ordem do dia de uma assembleia
     * e cria registos em assembleia_pontos_votacao.
     *
     * Retorna array: [ 'detectados' => N, 'pontos_ambiguos' => [...] ]
     */
    public function detectarPontosDeliberativos(Assembleia $assembleia): array
    {
        if ($assembleia->pontosVotacao()->exists()) {
            return ['detectados' => 0, 'pontos_ambiguos' => [], 'ja_existiam' => true];
        }

        $linhas = $this->parsearOrdemDoDia($assembleia->ordem_do_dia);
        $detectados = 0;
        $ambiguos = [];
        $ordem = 0;

        foreach ($linhas as $linha) {
            $ordem++;
            $ehDeliberativo = $this->pontoEhDeliberativo($linha);

            if ($ehDeliberativo === true) {
                AssembleiaPontoVotacao::create([
                    'assembleia_id' => $assembleia->id,
                    'ordem' => $ordem,
                    'titulo' => $linha,
                    'estado' => 'pendente',
                    'detectado_automaticamente' => true,
                ]);
                $detectados++;
            } elseif ($ehDeliberativo === null) {
                $ambiguos[] = ['ordem' => $ordem, 'titulo' => $linha];
            }
        }

        return [
            'detectados' => $detectados,
            'pontos_ambiguos' => $ambiguos,
            'ja_existiam' => false,
        ];
    }

    /**
     * Parse da ordem do dia: remove numeração e espaços, devolve array de linhas úteis.
     */
    protected function parsearOrdemDoDia(string $ordemDoDia): array
    {
        $linhas = preg_split('/\r\n|\r|\n/', $ordemDoDia);

        return collect($linhas)
            ->map(fn ($l) => trim($l))
            ->filter(fn ($l) => strlen($l) > 3)
            ->map(function ($l) {
                // Remove numeração tipo "1.", "1)", "1 -", "1:" etc.
                return trim(preg_replace('/^\d+\s*[\.\)\-:]\s*/u', '', $l));
            })
            ->filter(fn ($l) => strlen($l) > 3)
            ->values()
            ->all();
    }

    /**
     * Heurística: devolve true/false/null.
     * - true: claramente deliberativo (tem palavra-chave)
     * - false: claramente informativo (não tem palavra-chave)
     * - null: ambíguo (pedir ao gestor)
     */
    protected function pontoEhDeliberativo(string $texto): ?bool
    {
        $textoLower = mb_strtolower($texto);

        foreach (self::PALAVRAS_DELIBERATIVAS as $palavra) {
            if (mb_strpos($textoLower, $palavra) !== false) {
                return true;
            }
        }

        // Verifica palavras que sugerem apenas informação
        $palavrasInformativas = ['apresentar', 'apresentação', 'informar', 'informação',
            'ponto de situação', 'balanço', 'análise', 'debate'];

        foreach ($palavrasInformativas as $palavra) {
            if (mb_strpos($textoLower, $palavra) !== false) {
                return false;
            }
        }

        return null; // ambíguo
    }

    /**
     * Criar ponto de votação manualmente (gestor lança durante assembleia).
     */
    public function criarPontoManual(Assembleia $assembleia, string $titulo, ?string $descricao = null): AssembleiaPontoVotacao
    {
        $ordem = $assembleia->pontosVotacao()->max('ordem') + 1;

        return AssembleiaPontoVotacao::create([
            'assembleia_id' => $assembleia->id,
            'ordem' => $ordem,
            'titulo' => $titulo,
            'descricao' => $descricao,
            'estado' => 'pendente',
            'detectado_automaticamente' => false,
        ]);
    }

    /**
     * Abrir votação de um ponto.
     */
    public function abrirVotacao(AssembleiaPontoVotacao $ponto, int $userId): AssembleiaPontoVotacao
    {
        if (! $ponto->assembleia->estaActiva()) {
            throw new RuntimeException('Só pode abrir votação numa assembleia em curso.');
        }

        if ($ponto->estado !== 'pendente') {
            throw new RuntimeException("Ponto não está pendente (estado actual: {$ponto->estado}).");
        }

        // Verifica se já existe outro ponto em votação
        $outroEmVotacao = $ponto->assembleia->pontosVotacao()
            ->where('estado', 'em_votacao')
            ->where('id', '!=', $ponto->id)
            ->exists();

        if ($outroEmVotacao) {
            throw new RuntimeException('Já existe outra votação em curso. Fecha-a primeiro.');
        }

        $ponto->update([
            'estado' => 'em_votacao',
            'aberta_em' => now(),
            'aberta_por_user_id' => $userId,
        ]);

        // Notificar participantes que a votação abriu (#17)
        $assembleia = $ponto->assembleia;
        $assembleia->loadMissing('participantes');
        foreach ($assembleia->participantes as $part) {
            if (! $part->condomino_id) continue;
            $cond = \App\Domains\Condomino\Models\Condomino::find($part->condomino_id);
            if (! $cond || ! $cond->user_id) continue;
            $u = \App\Models\User::find($cond->user_id);
            if (! $u) continue;
            try {
                $u->notify(new \App\Domains\Condomino\Notifications\VotacaoAbertaNotification(
                    nome: $u->name,
                    assembleia: $assembleia->titulo,
                    ponto: $ponto->titulo,
                    assembleiaId: $assembleia->id,
                ));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('[Votacao] Falha push votacao '.$ponto->id.': '.$e->getMessage());
            }
        }

        return $ponto->fresh();
    }

    /**
     * Registar voto de um participante.
     */
    public function registarVoto(AssembleiaPontoVotacao $ponto, AssembleiaParticipante $participante, string $opcao): AssembleiaVoto
    {
        if ($ponto->estado !== 'em_votacao') {
            throw new RuntimeException('Votação não está aberta.');
        }

        if (! in_array($opcao, ['sim', 'nao', 'abstencao'], true)) {
            throw new RuntimeException("Opção inválida: {$opcao}. Use sim/nao/abstencao.");
        }

        if (! $participante->presente) {
            throw new RuntimeException('Participante não está presente na assembleia.');
        }

        // Impede voto duplicado
        $jaVotou = AssembleiaVoto::where('ponto_votacao_id', $ponto->id)
            ->where('participante_id', $participante->id)
            ->where('votou_como_procurador', false)
            ->exists();

        if ($jaVotou) {
            throw new RuntimeException('Participante já votou neste ponto.');
        }

        $peso = (float) ($participante->permilagem_total ?? 0);

        return AssembleiaVoto::create([
            'ponto_votacao_id' => $ponto->id,
            'participante_id' => $participante->id,
            'opcao' => $opcao,
            'peso_permilagem' => $peso,
            'votou_como_procurador' => false,
            'votado_em' => now(),
        ]);
    }

    /**
     * Fechar votação e calcular resultado definitivo.
     */
    public function fecharVotacao(AssembleiaPontoVotacao $ponto, int $userId): AssembleiaPontoVotacao
    {
        if ($ponto->estado !== 'em_votacao') {
            throw new RuntimeException('Votação não está aberta.');
        }

        $resultado = $ponto->calcularResultado();

        $ponto->update(array_merge($resultado, [
            'estado' => 'encerrado',
            'fechada_em' => now(),
            'fechada_por_user_id' => $userId,
        ]));

        return $ponto->fresh();
    }
}
