<?php

namespace App\Domains\Facturacao\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaxaVencimentoNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $quotaId,
        public bool $aVencer,
        public string $titulo,
        public string $descricao,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => $this->aVencer ? 'taxa_a_vencer' : 'taxa_vencida',
            'titulo' => $this->titulo,
            'mensagem' => $this->descricao,
            'quota_id' => $this->quotaId,
            'url' => '/minhas-quotas',
        ];
    }
}
