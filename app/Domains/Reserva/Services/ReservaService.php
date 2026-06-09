<?php

declare(strict_types=1);

namespace App\Domains\Reserva\Services;

use App\Domains\Reserva\Models\Reserva;
use App\Domains\Reserva\Models\ReservaEspaco;
use App\Domains\Reserva\Notifications\ReservaDecisaoNotification;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservaService
{
    /**
     * Valida e cria um pedido de reserva (estado inicial: pendente).
     * Devolve ['ok' => bool, 'erro' => ?string, 'reserva' => ?Reserva].
     */
    public function pedir(int $userId, ?int $condominioId, int $espacoId, string $data, string $horaInicio, string $horaFim, ?string $motivo = null): array
    {
        $espaco = ReservaEspaco::where('activo', true)->find($espacoId);
        if (! $espaco) {
            return ['ok' => false, 'erro' => 'Espaço indisponível.', 'reserva' => null];
        }

        $erro = $this->validarPedido($espaco, $data, $horaInicio, $horaFim);
        if ($erro !== null) {
            return ['ok' => false, 'erro' => $erro, 'reserva' => null];
        }

        $reserva = Reserva::create([
            'espaco_id' => $espaco->id,
            'user_id' => $userId,
            'condominio_id' => $condominioId,
            'data' => $data,
            'hora_inicio' => $horaInicio,
            'hora_fim' => $horaFim,
            'estado' => 'pendente',
            'motivo' => $motivo,
        ]);

        return ['ok' => true, 'erro' => null, 'reserva' => $reserva];
    }

    /** Aplica todas as regras do espaço. Devolve null se OK, ou a mensagem de erro. */
    public function validarPedido(ReservaEspaco $espaco, string $data, string $horaInicio, string $horaFim, ?int $ignorarReservaId = null): ?string
    {
        $inicio = Carbon::parse($data . ' ' . $horaInicio);
        $fim = Carbon::parse($data . ' ' . $horaFim);
        $agora = Carbon::now();

        // 1. Fim depois do início
        if ($fim->lessThanOrEqualTo($inicio)) {
            return 'A hora de fim tem de ser depois da hora de início.';
        }

        // 2. Dentro da janela diária do espaço
        $abertura = Carbon::parse($data . ' ' . $espaco->hora_abertura);
        $fecho = Carbon::parse($data . ' ' . $espaco->hora_fecho);
        if ($inicio->lessThan($abertura) || $fim->greaterThan($fecho)) {
            return 'Fora do horário do espaço (' . substr((string) $espaco->hora_abertura, 0, 5) . '–' . substr((string) $espaco->hora_fecho, 0, 5) . ').';
        }

        // 3. Duração min/max
        $horas = abs($inicio->diffInMinutes($fim)) / 60;
        if ($horas < $espaco->duracao_min_horas) {
            return 'Duração mínima: ' . $espaco->duracao_min_horas . 'h.';
        }
        if ($horas > $espaco->duracao_max_horas) {
            return 'Duração máxima: ' . $espaco->duracao_max_horas . 'h.';
        }

        // 4. Antecedência mínima
        if ($inicio->lessThan($agora->copy()->addHours($espaco->antecedencia_min_horas))) {
            return 'É preciso reservar com pelo menos ' . $espaco->antecedencia_min_horas . 'h de antecedência.';
        }

        // 5. Antecedência máxima
        if ($inicio->greaterThan($agora->copy()->addDays($espaco->antecedencia_max_dias))) {
            return 'Só é possível reservar até ' . $espaco->antecedencia_max_dias . ' dias no futuro.';
        }

        // 6. Conflito com outra reserva activa (não recusada/cancelada)
        $conflito = Reserva::where('espaco_id', $espaco->id)
            ->where('data', $data)
            ->whereNotIn('estado', ['recusada', 'cancelada'])
            ->when($ignorarReservaId, fn ($q) => $q->where('id', '!=', $ignorarReservaId))
            ->where(function ($q) use ($horaInicio, $horaFim) {
                // sobreposição: inicio < fim_existente AND fim > inicio_existente
                $q->where('hora_inicio', '<', $horaFim)
                  ->where('hora_fim', '>', $horaInicio);
            })
            ->exists();
        if ($conflito) {
            return 'Já existe uma reserva nesse horário.';
        }

        return null;
    }

    /** Gestor aprova: se o espaço tem caução -> aguarda_caucao; senão -> confirmada. */
    public function aprovar(Reserva $reserva, int $gestorUserId): Reserva
    {
        $espaco = $reserva->espaco;
        $novoEstado = ($espaco && $espaco->tem_caucao) ? 'aguarda_caucao' : 'confirmada';
        $reserva->update([
            'estado' => $novoEstado,
            'decidida_em' => now(),
            'decidida_por_user_id' => $gestorUserId,
        ]);
        if ($novoEstado === 'confirmada') {
            $this->notificarDecisao($reserva->fresh(), true);
        }
        return $reserva->fresh();
    }

    /** Gestor recusa. */
    public function recusar(Reserva $reserva, int $gestorUserId, ?string $motivo = null): Reserva
    {
        $reserva->update([
            'estado' => 'recusada',
            'motivo' => $motivo ?? $reserva->motivo,
            'decidida_em' => now(),
            'decidida_por_user_id' => $gestorUserId,
        ]);
        $this->notificarDecisao($reserva->fresh(), false);
        return $reserva->fresh();
    }

    /** Gestor confirma o pagamento da caução -> confirmada. */
    public function confirmarCaucao(Reserva $reserva): Reserva
    {
        $reserva->update(['estado' => 'confirmada', 'caucao_paga' => true]);
        $this->notificarDecisao($reserva->fresh(), true);
        return $reserva->fresh();
    }

    private function notificarDecisao(Reserva $reserva, bool $confirmada): void
    {
        try {
            $user = User::find($reserva->user_id);
            if (! $user) return;

            $espaco = $reserva->espaco;
            $nomeEspaco = $espaco?->nome ?? 'espaço comum';
            $dataFmt = $reserva->data ? \Carbon\Carbon::parse($reserva->data)->format('d/m/Y') : '';
            $quando = $dataFmt ? " para {$dataFmt}" : '';

            if ($confirmada) {
                $descricao = "A sua reserva do {$nomeEspaco}{$quando} foi confirmada.";
            } else {
                $motivo = $reserva->motivo ? " Motivo: {$reserva->motivo}." : '';
                $descricao = "A sua reserva do {$nomeEspaco}{$quando} foi recusada.{$motivo}";
            }

            try {
                $user->notify(new ReservaDecisaoNotification($reserva->id, $confirmada, $descricao));
            } catch (\Throwable $e) {
                Log::warning("[Reserva] Sino falhou user {$user->id}: " . $e->getMessage());
            }

            try {
                app(FcmSenderService::class)->enviarParaUser(
                    $user,
                    $confirmada ? '✅ Reserva confirmada' : '❌ Reserva recusada',
                    $descricao,
                    ['reserva_id' => (string) $reserva->id, 'tipo' => $confirmada ? 'reserva_confirmada' : 'reserva_recusada']
                );
            } catch (\Throwable $e) {
                Log::warning("[Reserva] Push falhou user {$user->id}: " . $e->getMessage());
            }

            if ($user->email) {
                try {
                    $cond = $espaco?->condominio ?? null;
                    $dados = [
                        'assunto' => ($confirmada ? 'Reserva confirmada' : 'Reserva recusada') . ' · ONDAKA',
                        'titulo' => $confirmada ? 'Reserva confirmada' : 'Reserva recusada',
                        'corpo' => $descricao,
                        'condominioNome' => $cond ? 'Condomínio ' . $cond->nome : null,
                        'empresaNome' => $cond && $cond->empresaGestora ? $cond->empresaGestora->nome : null,
                        'saudacao' => 'Caro(a) ' . $user->name . ',',
                        'badge' => $confirmada ? '✅ Reserva' : '❌ Reserva',
                    ];
                    Mail::send('emails.notificacao', $dados, function ($m) use ($user, $confirmada) {
                        $m->to($user->email, $user->name)->subject(($confirmada ? 'Reserva confirmada' : 'Reserva recusada') . ' · ONDAKA');
                    });
                } catch (\Throwable $e) {
                    Log::warning("[Reserva] Email falhou {$user->email}: " . $e->getMessage());
                }
            }
        } catch (\Throwable $e) {
            Log::error("[Reserva] notificarDecisao falhou reserva {$reserva->id}: " . $e->getMessage());
        }
    }
}
