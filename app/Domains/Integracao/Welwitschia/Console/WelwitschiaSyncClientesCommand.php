<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Welwitschia\WelwitschiaClient;
use Illuminate\Console\Command;

/**
 * Sincroniza as empresas gestoras do ONDAKA como clientes na Welwitschia
 * (backfill inicial + reparação). Ping antes; --dry mostra sem enviar.
 */
class WelwitschiaSyncClientesCommand extends Command
{
    protected $signature = 'welwitschia:sync-clientes {--dry : Mostra o que seria enviado, sem enviar}';

    protected $description = 'Empurra as empresas gestoras do ONDAKA para a Welwitschia como clientes.';

    public function handle(WelwitschiaClient $welw): int
    {
        if (! $welw->configurado()) {
            $this->error('WELWITSCHIA_TOKEN / WELWITSCHIA_URL não configurados no .env.');
            return self::FAILURE;
        }

        // Confirma identidade do token.
        $ping = $welw->ping();
        if (! ($ping['ok'] ?? false)) {
            $this->error('Ping falhou — token inválido ou API inacessível. Resposta: ' . json_encode($ping));
            return self::FAILURE;
        }
        $this->info("Ligado à Welwitschia — filial: " . ($ping['token'] ?? '?') . " (tenant {$ping['tenant_id']}, branch {$ping['branch_id']}).");

        $dry = (bool) $this->option('dry');
        $empresas = EmpresaGestora::query()->orderBy('id')->get(['id', 'nome', 'email_contacto']);
        $this->info(($dry ? '[DRY] ' : '') . "A sincronizar {$empresas->count()} empresa(s)...");

        $ok = 0; $falhou = 0;
        foreach ($empresas as $e) {
            $nome = (string) $e->nome;
            $email = $e->email_contacto ?: null;
            if ($dry) {
                $this->line("  · #{$e->id} {$nome} <{$email}>");
                continue;
            }
            $resp = $welw->criarCliente($nome, $email);
            if ($resp->successful()) {
                $ok++;
                $this->line("  ✓ #{$e->id} {$nome}");
            } else {
                $falhou++;
                $this->line("  ✗ #{$e->id} {$nome} — HTTP {$resp->status()}");
            }
        }

        if (! $dry) {
            $this->info("Concluído: {$ok} sincronizada(s), {$falhou} falha(s).");
        }

        return self::SUCCESS;
    }
}
