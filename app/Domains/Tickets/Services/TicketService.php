<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Services;

use App\Domains\Tickets\Models\Ticket;
use App\Domains\Tickets\Models\TicketComentario;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

class TicketService
{
    public function __construct(
        protected TicketNotificationService $notificationService,
    ) {}

    public function criar(array $dados, User $abertoPor): Ticket
    {
        return DB::transaction(function () use ($dados, $abertoPor) {
            $ticket = Ticket::create([
                'empresa_gestora_id' => $abertoPor->empresa_gestora_id ?? $dados['empresa_gestora_id'],
                'condominio_id'      => $dados['condominio_id'],
                'aberto_por_user_id' => $abertoPor->id,
                'fraccao_id'         => $dados['fraccao_id'] ?? null,
                'titulo'             => $dados['titulo'],
                'descricao'          => $dados['descricao'],
                'tipo'               => $dados['tipo'] ?? 'particular',
                'categoria_id'       => $dados['categoria_id'] ?? null,
                'categoria'          => $dados['categoria'] ?? 'outro',
                'prioridade'         => $dados['prioridade'] ?? 'media',
                'estado'             => 'aberto',
                'threads_publicas'   => $dados['threads_publicas'] ?? true,
            ]);

            $this->notificarSeguro(fn() => $this->notificationService->ticketCriado($ticket));

            return $ticket->fresh(['abertoPor', 'fraccao', 'condominio']);
        });
    }

    public function atribuir(Ticket $ticket, User $responsavel, User $atribuidoPor): Ticket
    {
        return DB::transaction(function () use ($ticket, $responsavel, $atribuidoPor) {
            $estadoAnterior = $ticket->estado;

            $ticket->update([
                'atribuido_a_user_id' => $responsavel->id,
                'atribuido_em'        => now(),
                'estado'              => $ticket->estado === 'aberto' ? 'em_analise' : $ticket->estado,
            ]);

            if ($estadoAnterior !== $ticket->estado) {
                $this->registarMudancaEstado($ticket, $estadoAnterior, $ticket->estado, $atribuidoPor);
            }

            return $ticket->fresh(['atribuidoA']);
        });
    }

    public function comentar(
        Ticket $ticket,
        User $autor,
        string $mensagem,
        bool $publico = true,
    ): TicketComentario {
        if (! $ticket->podeSerComentadoPor($autor)) {
            throw new InvalidArgumentException('Sem permissão para comentar neste ticket.');
        }

        if ($autor->id === $ticket->aberto_por_user_id) {
            $publico = true;
        }

        $comentario = TicketComentario::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $autor->id,
            'mensagem'  => $mensagem,
            'publico'   => $publico,
        ]);

        $this->notificarSeguro(fn() => $this->notificationService->novoComentario($ticket, $comentario));

        return $comentario;
    }

    public function mudarEstado(
        Ticket $ticket,
        string $novoEstado,
        User $por,
        ?string $observacao = null,
    ): Ticket {
        $estadosValidos = ['aberto', 'em_analise', 'em_curso', 'resolvido', 'fechado', 'cancelado'];
        if (! in_array($novoEstado, $estadosValidos, true)) {
            throw new InvalidArgumentException("Estado inválido: $novoEstado");
        }

        return DB::transaction(function () use ($ticket, $novoEstado, $por, $observacao) {
            $estadoAnterior = $ticket->estado;

            if ($estadoAnterior === $novoEstado) {
                return $ticket;
            }

            $updates = ['estado' => $novoEstado];
            if ($novoEstado === 'resolvido') {
                $updates['resolvido_em'] = now();
            }
            if ($novoEstado === 'fechado') {
                $updates['fechado_em'] = now();
            }

            $ticket->update($updates);
            $this->registarMudancaEstado($ticket, $estadoAnterior, $novoEstado, $por, $observacao);

            $this->notificarSeguro(fn() => $this->notificationService->estadoMudou($ticket, $estadoAnterior, $novoEstado));

            return $ticket->fresh();
        });
    }

    public function cancelar(Ticket $ticket, User $por, ?string $motivo = null): Ticket
    {
        if ($ticket->aberto_por_user_id !== $por->id
            && ! $por->hasAnyRole(['super-admin', 'admin-empresa', 'gestor'])) {
            throw new InvalidArgumentException('Sem permissão para cancelar.');
        }

        if (in_array($ticket->estado, ['resolvido', 'fechado', 'cancelado'], true)) {
            throw new InvalidArgumentException('Ticket já foi finalizado.');
        }

        return $this->mudarEstado($ticket, 'cancelado', $por, $motivo);
    }

    private function registarMudancaEstado(
        Ticket $ticket,
        string $de,
        string $para,
        User $por,
        ?string $observacao = null,
    ): void {
        TicketComentario::create([
            'ticket_id'           => $ticket->id,
            'user_id'             => $por->id,
            'mensagem'            => $observacao ?? "Estado alterado: $de → $para",
            'publico'             => true,
            'mudanca_estado_de'   => $de,
            'mudanca_estado_para' => $para,
        ]);
    }

    private function notificarSeguro(callable $callback): void
    {
        try {
            $callback();
        } catch (Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[TicketService] Falha notification: ' . $e->getMessage());
        }
    }
}
