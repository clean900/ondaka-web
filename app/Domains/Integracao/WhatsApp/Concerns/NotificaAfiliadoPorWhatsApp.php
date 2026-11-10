<?php

declare(strict_types=1);

namespace App\Domains\Integracao\WhatsApp\Concerns;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Integracao\WhatsApp\WhatsAppService;

/**
 * Acrescenta o canal 'whatsapp' a uma notificação de afiliado, sem remover os outros.
 * A notificação que usa o trait implementa afiliadoAlvo(): ?Afiliado e toWhatsapp(): ?string.
 */
trait NotificaAfiliadoPorWhatsApp
{
    /** O afiliado a quem a mensagem diz respeito (origem do número de telefone). */
    abstract protected function afiliadoAlvo(): ?Afiliado;

    /** Acrescenta 'whatsapp' aos canais quando o serviço está configurado e há número. */
    protected function comWhatsapp(array $canais): array
    {
        if (app(WhatsAppService::class)->configurado() && filled($this->whatsappPara())) {
            $canais[] = 'whatsapp';
        }

        return $canais;
    }

    public function whatsappPara(?object $notifiable = null): ?string
    {
        $af = $this->afiliadoAlvo();

        return $af?->telefone ?: $af?->user?->telefone;
    }
}
