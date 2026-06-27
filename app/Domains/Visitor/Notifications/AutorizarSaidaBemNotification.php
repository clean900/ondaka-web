<?php

namespace App\Domains\Visitor\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Pedido ao condómino para autorizar a saída de um bem não declarado à entrada.
 */
class AutorizarSaidaBemNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $visitaId,
        public int $itemId,
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
            'tipo' => 'autorizar_saida_bem',
            'titulo' => 'Autorizar saída de bem',
            'mensagem' => "{$this->nomeVisitante} quer sair com \"{$this->descricaoItem}\" (não declarado à entrada). Autoriza?",
            'visita_id' => $this->visitaId,
            'item_id' => $this->itemId,
            'url' => '/visitantes/historico',
        ];
    }
}
