<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Notifications;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifica o(s) super-admin(s) de um pagamento B2B confirmado (webhook ProxyPay).
 * Distingue conversão (1.ª subscrição) de renovação.
 * Canais: sino (database) + email.
 */
class PagamentoB2BSuperAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public EmpresaGestora $empresa,
        public string $facturaNumero,
        public float $valor,
        public bool $ehConversao,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    private function valorFormatado(): string
    {
        return number_format($this->valor, 2, ',', '.') . ' Kz';
    }

    public function toMail(object $notifiable): MailMessage
    {
        $valor = $this->valorFormatado();
        $assunto = $this->ehConversao
            ? "{$this->empresa->nome} activou subscrição · ONDAKA"
            : "Pagamento recebido: {$this->empresa->nome} · ONDAKA";

        return (new MailMessage)
            ->subject($assunto)
            ->view('emails.b2b.pagamento-superadmin', [
                'empresa' => $this->empresa,
                'valor' => $valor,
                'factura_numero' => $this->facturaNumero,
                'eh_conversao' => $this->ehConversao,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $valor = $this->valorFormatado();

        return [
            'tipo' => $this->ehConversao ? 'conversao_b2b' : 'pagamento_b2b',
            'titulo' => $this->ehConversao
                ? "💰 {$this->empresa->nome} activou a subscrição"
                : "🔄 Pagamento recebido: {$this->empresa->nome}",
            'mensagem' => $this->ehConversao
                ? "{$this->empresa->nome} pagou e activou a subscrição. Valor: {$valor}."
                : "{$this->empresa->nome} pagou a factura {$this->facturaNumero}. Valor: {$valor}.",
            'empresa_id' => $this->empresa->id,
            'empresa_nome' => $this->empresa->nome,
            'factura_numero' => $this->facturaNumero,
            'valor' => $valor,
            'eh_conversao' => $this->ehConversao,
            'url' => '/super-admin/facturas-plataforma',
        ];
    }
}
