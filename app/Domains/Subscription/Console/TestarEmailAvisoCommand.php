<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Mail\TrialAvisoMail;
use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestarEmailAvisoCommand extends Command
{
    protected $signature = 'ondaka:testar-email-aviso
                            {empresa : ID ou slug da empresa}
                            {tipo=trial_7_dias_restantes : Tipo de aviso}
                            {--destinatario= : Email alternativo (sem enviar ao email oficial)}';

    protected $description = 'Enviar email de teste de aviso de subscrição';

    public function handle(): int
    {
        $input = $this->argument('empresa');
        $tipo = $this->argument('tipo');
        $destinatarioCustom = $this->option('destinatario');

        $tiposValidos = [
            'trial_boas_vindas',
            'trial_7_dias_restantes',
            'trial_3_dias_restantes',
            'trial_expira_hoje',
            'grace_dia_1',
            'grace_dia_3',
            'grace_dia_7',
        ];

        if (! in_array($tipo, $tiposValidos)) {
            $this->error("Tipo '{$tipo}' inválido.");
            $this->line('Tipos válidos: ' . implode(', ', $tiposValidos));
            return self::FAILURE;
        }

        $empresa = is_numeric($input)
            ? EmpresaGestora::find((int) $input)
            : EmpresaGestora::where('slug', $input)->first();

        if (! $empresa) {
            $this->error("Empresa '{$input}' não encontrada.");
            return self::FAILURE;
        }

        $subscricao = Subscricao::where('empresa_gestora_id', $empresa->id)->first();
        if (! $subscricao) {
            $this->error('Empresa não tem subscrição. Criar com ondaka:criar-trial primeiro.');
            return self::FAILURE;
        }

        $destinatario = $destinatarioCustom ?: ($empresa->email_contacto ?? null);
        if (! $destinatario) {
            $this->error('Sem destinatário — empresa não tem email_contacto e --destinatario não foi fornecido.');
            return self::FAILURE;
        }

        $this->info("Empresa: {$empresa->nome}");
        $this->line("Destinatário: {$destinatario}");
        $this->line("Tipo de aviso: {$tipo}");
        $this->newLine();

        if (! $this->confirm('Enviar email?', true)) {
            $this->warn('Cancelado.');
            return self::SUCCESS;
        }

        try {
            Mail::to($destinatario)->send(new TrialAvisoMail($subscricao, $tipo));
            $this->info('✓ Email enviado com sucesso.');
            $this->line("Verifica a caixa de entrada de {$destinatario}.");
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Falha ao enviar: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Verifica configuração SMTP em .env:');
            $this->line('  MAIL_MAILER=smtp');
            $this->line('  MAIL_HOST=...');
            $this->line('  MAIL_PORT=...');
            $this->line('  MAIL_USERNAME=...');
            $this->line('  MAIL_PASSWORD=...');
            $this->line('  MAIL_FROM_ADDRESS=noreply@ondaka.ao');
            return self::FAILURE;
        }
    }
}
