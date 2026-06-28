<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\Visitante;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * Service de Validação na Portaria.
 *
 * Responsável por:
 * - Validar QR tokens e OTPs apresentados por visitantes
 * - Criar/reutilizar registo do Visitante
 * - Registar a Visita efectiva (entrada)
 * - Marcar a PreAprovacao como "usada"
 *
 * Usado pela app da portaria (guardas).
 */
class ValidacaoService
{
    /**
     * Guarda scaneou um QR token do visitante.
     */
    public function validarQrToken(string $qrToken, User $guarda): Visita
    {
        $preAprovacao = PreAprovacao::where('qr_token', $qrToken)->first();

        if ($preAprovacao === null) {
            throw new InvalidArgumentException('QR code não reconhecido.');
        }

        return $this->processarValidacao(
            $preAprovacao,
            $guarda,
            Visita::METODO_QR,
        );
    }

    /**
     * Guarda pediu o OTP ao visitante (verbal).
     *
     * Como OTPs são curtos (6 dígitos), filtramos também pelo estado pendente
     * para reduzir risco de colisão com códigos antigos já usados.
     */
    public function validarOtpCode(string $otpCode, User $guarda): Visita
    {
        $preAprovacao = PreAprovacao::where('otp_code', $otpCode)
            ->where('estado', PreAprovacao::ESTADO_PENDENTE)
            ->where('empresa_gestora_id', $guarda->empresa_gestora_id)
            ->first();

        if ($preAprovacao === null) {
            throw new InvalidArgumentException('Código não reconhecido ou já utilizado.');
        }

        return $this->processarValidacao(
            $preAprovacao,
            $guarda,
            Visita::METODO_OTP,
        );
    }

    /**
     * Guarda regista entrada manualmente (ex: sistema offline, visita inesperada autorizada por telefone).
     *
     * Este caso não requer pré-aprovação prévia. A visita fica marcada como
     * 'manual' para auditoria.
     */
    public function registarEntradaManual(
        User $guarda,
        int $fraccaoId,
        string $nomeVisitante,
        ?string $telefoneVisitante = null,
        ?string $biNumero = null,
        ?string $observacoes = null,
    ): Visita {
        return DB::transaction(function () use (
            $guarda, $fraccaoId, $nomeVisitante, $telefoneVisitante, $biNumero, $observacoes,
        ) {
            $visitante = $this->encontrarOuCriarVisitantePorDados(
                empresaId: $guarda->empresa_gestora_id,
                nome: $nomeVisitante,
                telefone: $telefoneVisitante,
                biNumero: $biNumero,
            );

            $visita = Visita::create([
                'empresa_gestora_id' => $guarda->empresa_gestora_id,
                'pre_aprovacao_id' => null, // manual não tem pré-aprovação
                'visitante_id' => $visitante->id,
                'fraccao_id' => $fraccaoId,
                'guarda_entrada_id' => $guarda->id,
                'entrou_em' => now(),
                'metodo_validacao' => Visita::METODO_MANUAL,
                'observacoes' => $observacoes,
            ]);

            return $visita->fresh(['visitante', 'fraccao']);
        });
    }

    /**
     * Sincroniza UMA entrada criada OFFLINE pelo guarda. É deliberadamente
     * LENIENTE: a entrada já aconteceu fisicamente (o guarda autorizou contra o
     * cache local), por isso registamos a visita com a hora offline em vez de
     * re-impor a janela/estado. A idempotency_key evita duplicar.
     *
     * @param array{idempotency_key?:string, qr_token?:string, otp_code?:string, entrou_em?:string, metodo?:string} $item
     * @return array{ok:bool, idempotency_key:?string, visita_id?:int, duplicada?:bool, erro?:string}
     */
    public function sincronizarEntradaOffline(User $guarda, array $item): array
    {
        $idem = $item['idempotency_key'] ?? null;
        $temQr = ! empty($item['qr_token']);
        $temOtp = ! empty($item['otp_code']);

        // Tem de trazer um código (qr ou otp); falha cedo sem abortar o lote.
        if (! $temQr && ! $temOtp) {
            return ['ok' => false, 'idempotency_key' => $idem, 'erro' => 'Entrada offline sem código (qr/otp).'];
        }

        // Idempotência: já sincronizada com esta chave?
        if ($idem) {
            $existe = Visita::where('idempotency_key', $idem)->first();
            if ($existe) {
                return ['ok' => true, 'duplicada' => true, 'visita_id' => $existe->id, 'idempotency_key' => $idem];
            }
        }

        // Resolver a pré-aprovação pelo token/otp (sempre dentro da empresa do guarda)
        $pa = null;
        if ($temQr) {
            $pa = PreAprovacao::where('qr_token', $item['qr_token'])
                ->where('empresa_gestora_id', $guarda->empresa_gestora_id)->first();
        } elseif ($temOtp) {
            $pa = PreAprovacao::where('otp_code', $item['otp_code'])
                ->where('empresa_gestora_id', $guarda->empresa_gestora_id)->first();
        }

        if ($pa === null) {
            return ['ok' => false, 'idempotency_key' => $idem, 'erro' => 'Pré-aprovação não encontrada.'];
        }

        // Pontual (não-passe): uma única entrada por pré-aprovação. Se já existe visita
        // para esta PA, devolve idempotente — impede reuso offline em 2 guardas/sessões.
        if (! $pa->ehPasse()) {
            $jaEntrou = Visita::where('pre_aprovacao_id', $pa->id)->first();
            if ($jaEntrou) {
                return ['ok' => true, 'duplicada' => true, 'visita_id' => $jaEntrou->id, 'idempotency_key' => $idem];
            }
        }

        // Hora de entrada offline (relógio do dispositivo); fora de uma janela sã → now().
        $entrouEm = ! empty($item['entrou_em']) ? \Illuminate\Support\Carbon::parse($item['entrou_em']) : now();
        if ($entrouEm->isAfter(now()->addMinutes(10)) || $entrouEm->isBefore(now()->subDays(7))) {
            $entrouEm = now();
        }
        $metodo = $item['metodo'] ?? ($temQr ? Visita::METODO_QR : Visita::METODO_OTP);

        try {
            $visita = DB::transaction(function () use ($pa, $guarda, $entrouEm, $metodo, $idem) {
                $visitante = $this->encontrarOuCriarVisitantePorPreAprovacao($pa);

                $v = Visita::create([
                    'empresa_gestora_id' => $pa->empresa_gestora_id,
                    'pre_aprovacao_id' => $pa->id,
                    'visitante_id' => $visitante->id,
                    'fraccao_id' => $pa->fraccao_id,
                    'guarda_entrada_id' => $guarda->id,
                    'entrou_em' => $entrouEm,
                    'metodo_validacao' => $metodo,
                    'idempotency_key' => $idem,
                ]);

                if (! $pa->ehPasse() && $pa->estado !== PreAprovacao::ESTADO_USADA) {
                    $pa->update(['estado' => PreAprovacao::ESTADO_USADA]);
                }

                return $v;
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Corrida na unique idempotency_key: outra request criou-a primeiro → idempotente.
            if ($idem) {
                $existe = Visita::where('idempotency_key', $idem)->first();
                if ($existe) {
                    return ['ok' => true, 'duplicada' => true, 'visita_id' => $existe->id, 'idempotency_key' => $idem];
                }
            }
            throw $e;
        }

        return ['ok' => true, 'idempotency_key' => $idem, 'visita_id' => $visita->id];
    }

    /* ======================================================
       PRIVADOS
       ====================================================== */

    /**
     * Fluxo central: valida pré-aprovação e cria a visita.
     */
    private function processarValidacao(
        PreAprovacao $preAprovacao,
        User $guarda,
        string $metodo,
    ): Visita {
        // 1. Multi-tenant: guarda só pode validar pré-aprovações da sua empresa
        if ($preAprovacao->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Pré-aprovação não pertence à empresa do guarda.');
        }

        // 2. Estado válido: PENDENTE (visita pontual) ou APROVADO (passe activo).
        if (! in_array($preAprovacao->estado, [PreAprovacao::ESTADO_PENDENTE, PreAprovacao::ESTADO_APROVADO], true)) {
            throw new InvalidArgumentException(
                match ($preAprovacao->estado) {
                    PreAprovacao::ESTADO_USADA => 'Este código já foi utilizado anteriormente.',
                    PreAprovacao::ESTADO_EXPIRADA => 'Este passe expirou. Peça ao condómino para estender a validade.',
                    PreAprovacao::ESTADO_RECUSADO => 'Este passe foi recusado.',
                    PreAprovacao::ESTADO_CANCELADA => 'Este código foi cancelado pelo condómino.',
                    default => 'Código inválido.',
                }
            );
        }

        // 3. Janela temporal
        $agora = now();

        if ($preAprovacao->valida_desde !== null && $agora->lt($preAprovacao->valida_desde)) {
            throw new InvalidArgumentException(
                'Este código só é válido a partir de '
                . $preAprovacao->valida_desde->format('d/m/Y H:i')
            );
        }

        if ($agora->gt($preAprovacao->valida_ate)) {
            // Oportunidade para marcar como expirada na BD (housekeeping)
            $preAprovacao->update(['estado' => PreAprovacao::ESTADO_EXPIRADA]);
            throw new InvalidArgumentException('Este código expirou.');
        }

        // 4. Tudo OK — criar visitante + visita (atómico)
        return DB::transaction(function () use ($preAprovacao, $guarda, $metodo) {
            $visitante = $this->encontrarOuCriarVisitantePorPreAprovacao($preAprovacao);

            $visita = Visita::create([
                'empresa_gestora_id' => $preAprovacao->empresa_gestora_id,
                'pre_aprovacao_id' => $preAprovacao->id,
                'visitante_id' => $visitante->id,
                'fraccao_id' => $preAprovacao->fraccao_id,
                'guarda_entrada_id' => $guarda->id,
                'entrou_em' => now(),
                'metodo_validacao' => $metodo,
            ]);

            // Passe (prestador/trabalhador) é reutilizável na janela — não marca usada.
            if (! $preAprovacao->ehPasse()) {
                $preAprovacao->update(['estado' => PreAprovacao::ESTADO_USADA]);
            }

            // Notificar o condómino dono da pré-aprovação (após commit; after_commit=false)
            $condominoId = $preAprovacao->condomino_id;
            $visitanteNome = $visitante->nome ?? 'Visitante';
            $horaEntrada = now()->format('H:i');
            $visitaId = $visita->id;
            \Illuminate\Support\Facades\DB::afterCommit(function () use ($condominoId, $visitanteNome, $horaEntrada, $visitaId) {
                if (! $condominoId) return;
                $condomino = \App\Domains\Condomino\Models\Condomino::find($condominoId);
                if (! $condomino || ! $condomino->user_id) return;
                $user = \App\Models\User::find($condomino->user_id);
                if (! $user) return;
                try {
                    $user->notify(new \App\Domains\Condomino\Notifications\VisitaEntrouNotification(
                        nome: $user->name,
                        visitante: $visitanteNome,
                        hora: $horaEntrada,
                        visitaId: $visitaId,
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('[ValidacaoService] Falha a notificar visita '.$visitaId.': '.$e->getMessage());
                }
            });

            return $visita->fresh(['visitante', 'fraccao', 'preAprovacao']);
        });
    }

    /**
     * Encontra ou cria o Visitante baseado nos dados da pré-aprovação.
     */
    private function encontrarOuCriarVisitantePorPreAprovacao(PreAprovacao $preAprovacao): Visitante
    {
        return $this->encontrarOuCriarVisitantePorDados(
            empresaId: $preAprovacao->empresa_gestora_id,
            nome: $preAprovacao->nome_visitante,
            telefone: $preAprovacao->telefone_visitante,
            biNumero: null,
        );
    }

    /**
     * Encontra ou cria Visitante (reutiliza por nome + telefone dentro da mesma empresa).
     */
    private function encontrarOuCriarVisitantePorDados(
        int $empresaId,
        string $nome,
        ?string $telefone,
        ?string $biNumero,
    ): Visitante {
        // Tenta encontrar por nome + telefone exacto
        if ($telefone !== null) {
            $existente = Visitante::where('empresa_gestora_id', $empresaId)
                ->where('nome', $nome)
                ->where('telefone', $telefone)
                ->first();

            if ($existente !== null) {
                return $existente;
            }
        }

        // Criar novo
        return Visitante::create([
            'empresa_gestora_id' => $empresaId,
            'nome' => $nome,
            'telefone' => $telefone,
            'bi_numero' => $biNumero,
        ]);
    }
}
