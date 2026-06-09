<?php

declare(strict_types=1);

namespace App\Domains\Payment\Notifications;

use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Services\FacturaService;
use App\Domains\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrdemAprovadaNotification extends Notification
{
    use Queueable;

    public function __construct(public OrdemCompra $ordem) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    public function toFcm(object $notifiable): array
    {
        $valor = number_format((float) $this->ordem->valor_total, 0, ',', '.').' Kz';
        return [
            'titulo' => 'Pagamento confirmado',
            'corpo' => 'A ordem '.$this->ordem->numero.' foi aprovada ('.$valor.').',
            'data' => [
                'tipo' => 'ordem_aprovada',
                'ordem_id' => (string) $this->ordem->id,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        $valor = number_format((float) $this->ordem->valor_total, 0, ',', '.').' Kz';
        return [
            'tipo' => 'ordem_aprovada',
            'titulo' => 'Pagamento confirmado',
            'mensagem' => 'A ordem '.$this->ordem->numero.' foi aprovada ('.$valor.').',
            'ordem_id' => $this->ordem->id,
            'numero' => $this->ordem->numero,
            'url' => '/ordens/'.$this->ordem->id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $valor = number_format((float) $this->ordem->valor_total, 0, ',', '.').' Kz';
        $url = rtrim(config('app.url'), '/').'/ordens/'.$this->ordem->id;

        $this->ordem->loadMissing('factura');
        $facturaNumero = $this->ordem->factura?->numero;
        $temAnexo = false;

        $mail = (new MailMessage)
            ->subject('Ordem '.$this->ordem->numero.' aprovada · ONDAKA')
            ->view('emails.condomino.ordem-aprovada', [
                'numero' => $this->ordem->numero,
                'descricaoItem' => $this->ordem->descricao_item,
                'valor' => $valor,
                'url' => $url,
                'facturaNumero' => $facturaNumero,
                'temAnexo' => &$temAnexo,
            ]);

        // Anexar factura se disponível
        if ($this->ordem->factura) {
            try {
                $facturaService = app(FacturaService::class);
                $factura = $this->ordem->factura;

                // Forçar regeneração se pdf_path estiver vazio ou ficheiro não existir
                if (! $factura->pdf_path || ! \Storage::disk('local')->exists($factura->pdf_path)) {
                    \Log::info("Factura {$factura->numero}: PDF em falta, a regenerar antes de anexar ao email.");
                    $facturaService->gerarPdf($factura);
                    $factura = $factura->fresh();
                }

                $pdfBytes = $facturaService->obterPdf($factura);

                if ($pdfBytes && strlen($pdfBytes) > 100) {
                    $filename = str_replace(['/', ' '], ['_', '_'], $factura->numero).'.pdf';
                    $mail->attachData($pdfBytes, $filename, ['mime' => 'application/pdf']);
                    $temAnexo = true;
                    \Log::info("Factura {$factura->numero}: PDF anexado ao email (".strlen($pdfBytes)." bytes).");
                } else {
                    \Log::warning("Factura {$factura->numero}: obterPdf devolveu null ou bytes insuficientes. Email enviado sem anexo.");
                }
            } catch (\Throwable $e) {
                \Log::error("Factura {$this->ordem->factura->numero}: falha ao anexar ao email: ".$e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return $mail;
    }
}
