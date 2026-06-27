<?php

namespace App\Domains\Visitor\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Alerta ao gestor: um visitante saiu com um item NÃO declarado à entrada.
 */
class ItemNaoDeclaradoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $visitaId,
        public string $descricaoItem,
        public string $nomeVisitante,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'item_nao_declarado',
            'titulo' => '⚠️ Item não declarado à saída',
            'mensagem' => "{$this->nomeVisitante} saiu com \"{$this->descricaoItem}\" — não declarado à entrada.",
            'visita_id' => $this->visitaId,
            'url' => '/visitantes/historico',
        ];
    }
}
