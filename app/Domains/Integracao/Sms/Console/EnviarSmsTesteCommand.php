<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Integracao\Sms\Services\SmsService;
use App\Domains\Integracao\Sms\Support\NumeroAngola;
use Illuminate\Console\Command;

class EnviarSmsTesteCommand extends Command
{
    protected $signature = 'sms:enviar-teste
                            {numero : Número destinatário (9XX XXX XXX)}
                            {mensagem? : Mensagem (opcional, default: teste ONDAKA)}
                            {--empresa= : ID da empresa (consome saldo da feature; se omitido, usa modo sistema)}
                            {--sem-saldo : Força envio sistema mesmo com --empresa}';

    protected $description = 'Enviar SMS de teste via serviço SMS ONDAKA';

    public function handle(SmsService $smsService, SmsProviderInterface $provider): int
    {
        $numero = (string) $this->argument('numero');
        $mensagem = (string) ($this->argument('mensagem') ?: 'Teste ONDAKA: integração com TelcoSMS operacional. '.now()->format('d/m/Y H:i'));

        try {
            $numeroNormalizado = NumeroAngola::normalizar($numero);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }

        $this->info('=== Teste de envio SMS via TelcoSMS ===');
        $this->line('Provider: '.$provider->nome());
        $this->line('Destinatário: '.NumeroAngola::formatarApresentacao($numeroNormalizado));
        $this->line('Mensagem: '.$mensagem);
        $this->line('Comprimento: '.mb_strlen($mensagem).' chars');
        $this->newLine();

        // Consultar saldo do provider antes
        $saldoAntes = $provider->saldo();
        if ($saldoAntes !== null) {
            $this->line('Saldo TelcoSMS (conta ONDAKA): '.$saldoAntes.' SMS');
        }
        $this->newLine();

        if (! $this->confirm('Enviar SMS real agora?', true)) {
            $this->warn('Cancelado.');
            return self::SUCCESS;
        }

        $empresaId = $this->option('empresa');
        $semSaldo = (bool) $this->option('sem-saldo');

        try {
            if ($empresaId && ! $semSaldo) {
                $empresa = EmpresaGestora::find((int) $empresaId);
                if (! $empresa) {
                    $this->error("Empresa #{$empresaId} não encontrada.");
                    return self::FAILURE;
                }
                $this->line("Modo: consome saldo da feature sms_sender_id de '{$empresa->nome}'");
                $resultado = $smsService->enviar($empresa, $numeroNormalizado, $mensagem, [
                    'origem' => 'cli',
                ]);
            } else {
                $this->line('Modo: envio sistema (sem consumir saldo cliente)');
                $resultado = $smsService->enviarSistema($numeroNormalizado, $mensagem, [
                    'origem' => 'cli',
                ]);
            }

            $this->newLine();
            $this->info('✓ SMS enviado com sucesso');
            $this->line('  ID mensagem: '.($resultado->idMensagem ?? '—'));
            $this->line('  Status: '.$resultado->status);
            if ($resultado->saldoRestante !== null) {
                $this->line('  Saldo TelcoSMS restante: '.$resultado->saldoRestante);
            }

            return self::SUCCESS;

        } catch (\Throwable $e) {
            $this->newLine();
            $this->error('✗ Falha: '.$e->getMessage());
            if (method_exists($e, 'getCodigoHttp') && $e->codigoHttp) {
                $this->line('  HTTP: '.$e->codigoHttp);
            }
            return self::FAILURE;
        }
    }
}
