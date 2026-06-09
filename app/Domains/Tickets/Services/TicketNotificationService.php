<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Services;

use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Tickets\Notifications\TicketEstadoNotification;
use App\Domains\Tickets\Models\Ticket;
use App\Domains\Tickets\Models\TicketComentario;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Orquestra envio de notificações relacionadas com Tickets.
 *
 * Canais (todos opcionais, falla silenciosa em cada um):
 *   1. Email (sempre que destinatário tenha email)
 *   2. SMS (consome saldo via FeatureGate; sem saldo = skip)
 *   3. Push FCM (envia para todos os device tokens do user)
 */
class TicketNotificationService
{
    public function __construct(
        protected SmsProviderInterface $smsProvider,
        protected FcmSenderService $fcmSender,
    ) {}

    public function ticketCriado(Ticket $ticket): void
    {
        Log::info("[TicketNotification] Ticket #{$ticket->id} criado: {$ticket->titulo}");
        // Notificar admins do condomínio (futuro: filtrar por preferências de cada admin)
    }

    public function estadoMudou(Ticket $ticket, string $estadoAnterior, string $estadoNovo): void
    {
        $destinatario = $ticket->abertoPor;
        if (! $destinatario) {
            return;
        }

        $labels = [
            'aberto' => 'Aberto', 'em_analise' => 'Em análise', 'em_curso' => 'Em curso',
            'resolvido' => 'Resolvido', 'fechado' => 'Fechado', 'cancelado' => 'Cancelado',
        ];
        $de = $labels[$estadoAnterior] ?? $estadoAnterior;
        $para = $labels[$estadoNovo] ?? $estadoNovo;

        if ($estadoNovo === 'resolvido') {
            $assunto = "✅ Pedido #{$ticket->id} resolvido";
            $mensagem = "Boas notícias! O pedido \"{$ticket->titulo}\" foi marcado como resolvido. Se considera que o problema persiste, pode reabri-lo na aplicação ONDAKA.";
            $pushTitulo = '✅ Pedido resolvido';
            $pushCorpo = "O seu pedido \"{$ticket->titulo}\" foi resolvido.";
        } else {
            $assunto = "Pedido #{$ticket->id} — Estado actualizado";
            $mensagem = "O pedido \"{$ticket->titulo}\" mudou de estado: {$de} → {$para}.";
            $pushTitulo = 'Estado actualizado';
            $pushCorpo = "Pedido #{$ticket->id}: {$de} → {$para}";
        }

        $this->enviarMultiCanal(
            ticket: $ticket,
            destinatario: $destinatario,
            assunto: $assunto,
            mensagem: $mensagem,
            pushTitulo: $pushTitulo,
            pushCorpo: $pushCorpo,
            pushData: [
                'ticket_id' => (string) $ticket->id,
                'tipo' => 'estado_alterado',
            ],
        );

        try {
            $destinatario->notify(new TicketEstadoNotification(
                ticketId: $ticket->id,
                ticketTitulo: $ticket->titulo,
                estadoNovo: $estadoNovo,
                titulo: $pushTitulo,
                mensagem: $pushCorpo,
            ));
        } catch (Throwable $e) {
            Log::warning("[TicketNotification] Falha sino in-app ticket {$ticket->id}: " . $e->getMessage());
        }
    }

    public function novoComentario(Ticket $ticket, TicketComentario $comentario): void
    {
        if (! $comentario->publico) {
            return;
        }

        if ($comentario->user_id === $ticket->aberto_por_user_id) {
            return;
        }

        $destinatario = $ticket->abertoPor;
        if (! $destinatario) {
            return;
        }

        $autor = $comentario->user->name ?? 'Equipa';
        $assunto = "Ticket #{$ticket->id} — Novo comentário";
        $mensagem = "{$autor} comentou no ticket \"{$ticket->titulo}\":\n\n{$comentario->mensagem}";

        $this->enviarMultiCanal(
            ticket: $ticket,
            destinatario: $destinatario,
            assunto: $assunto,
            mensagem: $mensagem,
            pushTitulo: "Novo comentário no ticket #{$ticket->id}",
            pushCorpo: $autor . ': ' . mb_strimwidth($comentario->mensagem, 0, 80, '...'),
            pushData: [
                'ticket_id' => (string) $ticket->id,
                'tipo' => 'novo_comentario',
            ],
        );
    }

    protected function enviarMultiCanal(
        Ticket $ticket,
        User $destinatario,
        string $assunto,
        string $mensagem,
        string $pushTitulo,
        string $pushCorpo,
        array $pushData = [],
    ): void {
        $this->tentarEnviarEmail($destinatario, $assunto, $mensagem);
        $this->tentarEnviarSms($ticket, $destinatario, $mensagem);
        $this->tentarEnviarPush($destinatario, $pushTitulo, $pushCorpo, $pushData);
    }

    protected function tentarEnviarEmail(User $destinatario, string $assunto, string $mensagem, ?Ticket $ticket = null): void
    {
        if (empty($destinatario->email)) {
            return;
        }

        try {
            $condominioNome = $ticket && $ticket->condominio ? 'Condomínio ' . $ticket->condominio->nome : null;
            $empresaNome = $ticket && $ticket->empresaGestora ? $ticket->empresaGestora->nome : null;
            $dados = [
                'assunto' => $assunto,
                'titulo' => $assunto,
                'corpo' => $mensagem,
                'condominioNome' => $condominioNome,
                'empresaNome' => $empresaNome,
                'saudacao' => 'Caro(a) ' . $destinatario->name . ',',
                'badge' => 'Pedido',
            ];
            Mail::send('emails.notificacao', $dados, function ($message) use ($destinatario, $assunto) {
                $message->to($destinatario->email, $destinatario->name)
                    ->subject($assunto);
            });
        } catch (Throwable $e) {
            Log::warning("[TicketNotification] Falha email para {$destinatario->email}: " . $e->getMessage());
        }
    }

    protected function tentarEnviarSms(Ticket $ticket, User $destinatario, string $mensagem): void
    {
        $numero = $destinatario->phone ?? $destinatario->telefone ?? null;
        if (empty($numero)) {
            return;
        }

        $condominio = $ticket->condominio;
        if (! $condominio) {
            return;
        }

        $featureSlug = FeatureGate::has($condominio, 'sms_sender_id')
            ? 'sms_sender_id'
            : 'sms_pack_extra';

        if (! FeatureGate::has($condominio, $featureSlug)) {
            return;
        }

        $smsMensagem = mb_strimwidth($mensagem, 0, 155, '...');

        $consumido = FeatureGate::consume(
            owner: $condominio,
            featureSlug: $featureSlug,
            quantidade: 1,
            acao: 'sms_ticket_notificacao',
            referenciavel: $ticket,
            metadata: ['ticket_id' => $ticket->id, 'numero' => $numero],
        );

        if (! $consumido) {
            return;
        }

        try {
            $this->smsProvider->enviar($numero, $smsMensagem);
        } catch (Throwable $e) {
            Log::error("[TicketNotification] Falha SMS para {$numero}: " . $e->getMessage());
        }
    }

    protected function tentarEnviarPush(
        User $destinatario,
        string $titulo,
        string $corpo,
        array $data = [],
    ): void {
        try {
            $enviados = $this->fcmSender->enviarParaUser($destinatario, $titulo, $corpo, $data);
            if ($enviados > 0) {
                Log::info("[TicketNotification] Push enviado para user {$destinatario->id} ({$enviados} devices)");
            }
        } catch (Throwable $e) {
            Log::error("[TicketNotification] Falha push para user {$destinatario->id}: " . $e->getMessage());
        }
    }
}
