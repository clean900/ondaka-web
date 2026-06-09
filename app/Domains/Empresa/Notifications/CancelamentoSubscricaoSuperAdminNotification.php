<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use App\Domains\Empresa\Models\EmpresaGestora;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) super-admin(s) de que um cliente cancelou a subscrição (self-service).
 * Canais: sino (database) + email.
 */
class CancelamentoSubscricaoSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public EmpresaGestora $empresa,
        public string $motivo,
        public ?string $acessoAte = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    private function acessoAteFormatado(): string
    {
        if (! $this->acessoAte) {
            return 'fim do período actual';
        }
        try {
            return Carbon::parse($this->acessoAte)->format('d/m/Y');
        } catch (\Throwable $e) {
            return $this->acessoAte;
        }
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->empresa->nome} cancelou a subscrição · ONDAKA")
            ->view('emails.b2b.cancelamento-superadmin', [
                'empresa' => $this->empresa,
                'motivo' => $this->motivo,
                'acesso_ate' => $this->acessoAteFormatado(),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'cancelamento_b2b',
            'titulo' => "🔻 {$this->empresa->nome} cancelou a subscrição",
            'mensagem' => "Motivo: {$this->motivo}. Acesso mantém-se até {$this->acessoAteFormatado()}.",
            'empresa_id' => $this->empresa->id,
            'empresa_nome' => $this->empresa->nome,
            'motivo' => $this->motivo,
            'acesso_ate' => $this->acessoAteFormatado(),
            'url' => '/super-admin/clientes',
        ];
    }
}
