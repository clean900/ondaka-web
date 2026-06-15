<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Services;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Integracao\Sms\Services\SmsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AssembleiaService
{
    /**
     * Cria nova assembleia e snapshot dos condóminos convocados.
     */
    public function criar(Condominio $condominio, array $dados, int $criadaPorUserId): Assembleia
    {
        return DB::transaction(function () use ($condominio, $dados, $criadaPorUserId) {
            // Numeração sequencial GLOBAL por ano. O índice `numero` é unique
            // global, por isso a sequência tem de ser global — antes derivava de
            // max('id') por empresa, o que gerava sempre ASS-{ano}-000001 e
            // colidia entre empresas (1062 Duplicate entry).
            $ano = date('Y');
            $ultimoNumero = Assembleia::where('numero', 'like', "ASS-{$ano}-%")
                ->lockForUpdate()
                ->max('numero');
            $ultimoSeq = $ultimoNumero ? (int) substr($ultimoNumero, -6) : 0;
            $seq = str_pad((string) ($ultimoSeq + 1), 6, '0', STR_PAD_LEFT);
            $numero = "ASS-{$ano}-{$seq}";

            // Total de fracções para cálculo de quórum
            $totalFraccoes = Fraccao::where('condominio_id', $condominio->id)->count();

            // Sala Jitsi única
            $salaJitsi = 'ondaka-'.Str::lower($condominio->codigo ?: 'cond').'-'.Str::random(12);

            $assembleia = Assembleia::create([
                'empresa_gestora_id' => $condominio->empresa_gestora_id,
                'condominio_id' => $condominio->id,
                'numero' => $numero,
                'tipo' => $dados['tipo'] ?? 'ordinaria',
                'titulo' => $dados['titulo'],
                'ordem_do_dia' => $dados['ordem_do_dia'],
                'observacoes' => $dados['observacoes'] ?? null,
                'data_agendada' => $dados['data_agendada'],
                'data_segunda_convocatoria' => $dados['data_segunda_convocatoria'] ?? null,
                'local' => $dados['local'] ?? 'Virtual (Jitsi)',
                'modo' => $dados['modo'] ?? 'virtual',
                'sala_jitsi' => $salaJitsi,
                'quorum_minimo_percent' => $dados['quorum_minimo_percent'] ?? 50.00,
                'total_fraccoes' => $totalFraccoes,
                'estado' => 'agendada',
                'criada_por_user_id' => $criadaPorUserId,
            ]);

            // Snapshot dos participantes (condóminos com fracções neste condomínio)
            $this->criarParticipantes($assembleia, $condominio);

            return $assembleia->fresh('participantes');
        });
    }

    /**
     * Cria registos de participantes com snapshot das fracções que possuem.
     *
     * Nota: busca condóminos que tenham contratos de tipo 'proprietario'
     * activos numa das fracções do condomínio.
     */
    private function criarParticipantes(Assembleia $assembleia, Condominio $condominio): void
    {
        // Buscar condóminos únicos com contrato activo de propriedade neste condomínio
        $condominos = Condomino::whereHas('contratosActivos', function ($q) use ($condominio) {
            $q->whereHas('fraccao', fn ($qf) => $qf->where('condominio_id', $condominio->id))
                ->where('tipo', 'proprietario')
                ->where('estado', 'activo');
        })
            ->with(['contratosActivos' => function ($q) use ($condominio) {
                $q->where('tipo', 'proprietario')
                    ->where('estado', 'activo')
                    ->whereHas('fraccao', fn ($qf) => $qf->where('condominio_id', $condominio->id))
                    ->with('fraccao');
            }])
            ->get();

        foreach ($condominos as $condomino) {
            $fraccoesNoCondo = $condomino->contratosActivos
                ->filter(fn ($c) => $c->fraccao && $c->fraccao->condominio_id === $condominio->id);

            $numeroFraccoes = $fraccoesNoCondo->count();
            $permilagemTotal = (float) $fraccoesNoCondo->sum(fn ($c) => (float) ($c->fraccao->permilagem ?? 0));

            if ($numeroFraccoes === 0) continue;

            // Fallback: se as fracções nao tiverem permilagem configurada (0), o voto
            // conta por fraccao (peso = nº de fracções). Evita resultados a 0 / "Empate".
            if ($permilagemTotal <= 0) {
                $permilagemTotal = (float) $numeroFraccoes;
            }

            AssembleiaParticipante::create([
                'assembleia_id' => $assembleia->id,
                'condomino_id' => $condomino->id,
                'nome_snapshot' => $condomino->nome_exibicao ?? $condomino->nome_completo ?? '—',
                'documento_snapshot' => $condomino->documento_principal ?? null,
                'numero_fraccoes' => $numeroFraccoes,
                'permilagem_total' => $permilagemTotal,
                'email_convocacao' => $condomino->email ?? $condomino->representante_email ?? null,
                'telefone_convocacao' => $condomino->telefone_principal ?? $condomino->representante_telefone ?? null,
            ]);
        }
    }

    /**
     * Envia convocatórias (email + SMS) aos participantes.
     */
    public function enviarConvocatorias(Assembleia $assembleia, bool $email = true, bool $sms = true): array
    {
        $assembleia->loadMissing('participantes', 'empresa', 'condominio');

        $emailsEnviados = 0;
        $smsEnviados = 0;
        $empresa = $assembleia->empresa;

        foreach ($assembleia->participantes as $participante) {
            if ($participante->convocado_em) continue; // já convocado

            // Email
            if ($email && $participante->email_convocacao) {
                try {
                    Mail::raw(
                        $this->textoConvocatoria($assembleia, $participante),
                        function ($msg) use ($assembleia, $participante) {
                            $msg->to($participante->email_convocacao, $participante->nome_snapshot)
                                ->subject("Convocatória: {$assembleia->titulo} — ONDAKA");
                        }
                    );
                    $participante->email_enviado = true;
                    $emailsEnviados++;
                } catch (\Throwable $e) {
                    Log::warning("Falha ao enviar email convocatória: ".$e->getMessage());
                }
            }

            // SMS
            if ($sms && $participante->telefone_convocacao) {
                $msgSms = $this->textoConvocatoriaSms($assembleia);
                try {
                    app(SmsService::class)->enviar(
                        $empresa,
                        $participante->telefone_convocacao,
                        $msgSms,
                        [
                            'trigger' => 'assembleia_convocatoria',
                            'categoria' => 'notificacao',
                        ],
                    );
                    $participante->sms_enviado = true;
                    $smsEnviados++;
                } catch (\Throwable $e) {
                    Log::warning("Falha ao enviar SMS convocatória: ".$e->getMessage());
                }
            }

            // Push + sino ao condómino (email/SMS já tratados acima; #16)
            if ($participante->condomino_id) {
                $cond = \App\Domains\Condomino\Models\Condomino::find($participante->condomino_id);
                if ($cond && $cond->user_id) {
                    $u = \App\Models\User::find($cond->user_id);
                    if ($u) {
                        try {
                            $u->notify(new \App\Domains\Condomino\Notifications\AssembleiaConvocadaNotification(
                                titulo: $assembleia->titulo,
                                data: $assembleia->data_agendada ? \Carbon\Carbon::parse($assembleia->data_agendada)->format('d/m/Y H:i') : '—',
                                assembleiaId: $assembleia->id,
                            ));
                        } catch (\Throwable $e) {
                            Log::warning('[Assembleia] Falha push convocatória '.$assembleia->id.': '.$e->getMessage());
                        }
                    }
                }
            }

            $participante->convocado_em = now();
            $participante->canal_convocacao = match (true) {
                $participante->email_enviado && $participante->sms_enviado => 'email_sms',
                $participante->email_enviado => 'email',
                $participante->sms_enviado => 'sms',
                default => null,
            };
            $participante->save();
        }

        $assembleia->update([
            'convocatorias_enviadas' => [
                'emails' => $emailsEnviados,
                'sms' => $smsEnviados,
                'enviadas_em' => now()->toIso8601String(),
            ],
        ]);

        return [
            'emails_enviados' => $emailsEnviados,
            'sms_enviados' => $smsEnviados,
            'total_participantes' => $assembleia->participantes->count(),
        ];
    }

    /**
     * Regenera snapshot de participantes (útil quando contratos mudam).
     * Apaga participantes ainda não convocados e recria.
     */
    public function regenerarParticipantes(Assembleia $assembleia): int
    {
        if (! in_array($assembleia->estado, ['agendada'])) {
            throw new \RuntimeException("Só pode regenerar participantes em assembleias agendadas (estado actual: {$assembleia->estado})");
        }

        // Apagar apenas os não convocados ainda (segurança)
        $assembleia->participantes()->whereNull('convocado_em')->delete();

        $assembleia->loadMissing('condominio');
        $this->criarParticipantes($assembleia, $assembleia->condominio);

        return $assembleia->participantes()->count();
    }

    public function iniciar(Assembleia $assembleia, int $userId): Assembleia
    {
        if (! $assembleia->podeIniciar()) {
            throw new \RuntimeException("Assembleia não pode ser iniciada no estado: {$assembleia->estado}");
        }

        $assembleia->update([
            'estado' => 'em_curso',
            'iniciada_em' => now(),
            'iniciada_por_user_id' => $userId,
        ]);

        return $assembleia->fresh();
    }

    public function terminar(Assembleia $assembleia, int $userId, bool $semQuorum = false): Assembleia
    {
        if (! $assembleia->podeTerminar()) {
            throw new \RuntimeException("Assembleia não pode ser terminada no estado: {$assembleia->estado}");
        }

        $assembleia->update([
            'estado' => $semQuorum ? 'sem_quorum' : 'concluida',
            'terminada_em' => now(),
            'terminada_por_user_id' => $userId,
        ]);

        return $assembleia->fresh();
    }

    public function cancelar(Assembleia $assembleia): Assembleia
    {
        if (in_array($assembleia->estado, ['concluida', 'sem_quorum', 'cancelada'])) {
            throw new \RuntimeException("Não é possível cancelar assembleia no estado: {$assembleia->estado}");
        }

        $assembleia->update([
            'estado' => 'cancelada',
        ]);

        return $assembleia->fresh();
    }

    /**
     * Regista entrada de um condómino na assembleia.
     * Chamado quando o condómino clica em "Entrar" e é redireccionado para Jitsi.
     */
    public function registarEntrada(Assembleia $assembleia, Condomino $condomino, ?string $ip, ?string $userAgent): ?AssembleiaParticipante
    {
        $participante = $assembleia->participantes()
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $participante) return null;

        $participante->marcarPresente($ip, $userAgent);

        return $participante;
    }

    /* ===================================================
       Textos de convocatória
       =================================================== */

    private function textoConvocatoria(Assembleia $a, AssembleiaParticipante $p): string
    {
        $data = $a->data_agendada->format('d/m/Y');
        $hora = $a->data_agendada->format('H:i');
        $condominio = $a->condominio->nome;

        return "Ex.mo(a) {$p->nome_snapshot},\n\n"
            ."Vem pelo presente convocar-se V. Ex.a para a Assembleia {$a->tipo_label} "
            ."do Condomínio {$condominio}, a realizar-se no dia {$data}, pelas {$hora} horas.\n\n"
            ."ORDEM DO DIA:\n{$a->ordem_do_dia}\n\n"
            ."LOCAL: {$a->local}\n"
            .($a->modo === 'virtual' ? "LINK: ".rtrim(config('app.url'), '/')."/assembleias/{$a->id}/entrar\n\n" : "\n")
            ."Número da assembleia: {$a->numero}\n\n"
            ."Este email é uma convocatória formal nos termos do DP 141/15 de 29 de Junho.\n\n"
            ."A gestão,\n{$a->empresa->nome}\n"
            ."(via ONDAKA)";
    }

    private function textoConvocatoriaSms(Assembleia $a): string
    {
        $data = $a->data_agendada->format('d/m H:i');
        $tipo = strtolower($a->tipo_label);
        return "ONDAKA: Convocatoria assembleia {$tipo} {$a->condominio->nome} dia {$data}. Aceda ondaka.ao/assembleias/{$a->id}/entrar";
    }
}
