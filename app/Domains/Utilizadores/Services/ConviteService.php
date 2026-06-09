<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Services;

use App\Domains\Utilizadores\Models\ConviteUtilizador;
use App\Domains\Utilizadores\Mail\ConviteUtilizadorMail;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\TelcoSms\TelcoSmsService;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Gere o ciclo de vida dos convites de utilizador.
 *
 * Fluxo:
 *   1. Admin chama criar()  -> gera token + envia email + SMS
 *   2. User clica no link   -> valida via tokenValido()
 *   3. User define password -> aceitar() cria User e marca convite como usado
 */
class ConviteService
{
    public const VALIDADE_DIAS = 7;

    public function __construct(
        protected TelcoSmsService $sms,
    ) {}

    /**
     * Cria um novo convite e envia email + SMS.
     *
     * @param array{nome:string,email:string,telefone:?string,role_name:string,empresa_gestora_id:?int,condominio_id:?int,fraccao_id:?int} $dados
     */
    public function criar(array $dados, User $convidadoPor): ConviteUtilizador
    {
        return DB::transaction(function () use ($dados, $convidadoPor) {
            // Cancela convites pendentes anteriores para o mesmo email
            ConviteUtilizador::where('email', $dados['email'])
                ->whereNull('usado_em')
                ->whereNull('cancelado_em')
                ->update(['cancelado_em' => now()]);

            $token = Str::random(64);

            $convite = ConviteUtilizador::create([
                'token' => $token,
                'email' => $dados['email'],
                'nome' => $dados['nome'],
                'telefone' => $dados['telefone'] ?? null,
                'role_name' => $dados['role_name'],
                'empresa_gestora_id' => $dados['empresa_gestora_id'] ?? null,
                'condominio_id' => $dados['condominio_id'] ?? null,
                'fraccao_id' => $dados['fraccao_id'] ?? null,
                'convidado_por_user_id' => $convidadoPor->id,
                'expira_em' => now()->addDays(self::VALIDADE_DIAS),
            ]);

            $this->enviarNotificacoes($convite);

            return $convite;
        });
    }

    /**
     * Reenvia email + SMS de um convite ainda pendente.
     */
    public function reenviar(ConviteUtilizador $convite): void
    {
        if (! $convite->estaValido()) {
            throw new \DomainException('Convite não está válido para reenvio.');
        }
        $this->enviarNotificacoes($convite);
    }

    /**
     * Cancela um convite ainda pendente.
     */
    public function cancelar(ConviteUtilizador $convite): void
    {
        if ($convite->usado_em || $convite->cancelado_em) {
            throw new \DomainException('Convite já não está pendente.');
        }
        $convite->update(['cancelado_em' => now()]);
    }

    /**
     * Verifica se um token é válido e devolve o convite.
     */
    public function obterPorToken(string $token): ?ConviteUtilizador
    {
        $convite = ConviteUtilizador::where('token', $token)->first();
        if (! $convite || ! $convite->estaValido()) {
            return null;
        }
        return $convite;
    }

    /**
     * Aceita o convite: cria o User, atribui role/empresa/condomínio, e marca usado.
     */
    public function aceitar(ConviteUtilizador $convite, string $password): User
    {
        if (! $convite->estaValido()) {
            throw new \DomainException('Convite expirado, cancelado ou já usado.');
        }

        return DB::transaction(function () use ($convite, $password) {
            // Verifica se já existe um user com este email (caso edge: convite duplicado)
            $existente = User::where('email', $convite->email)->first();
            if ($existente) {
                throw new \DomainException('Já existe um utilizador com este email.');
            }

            $user = User::create([
                'name' => $convite->nome,
                'email' => $convite->email,
                'telefone' => $convite->telefone,
                'password' => Hash::make($password),
                'empresa_gestora_id' => $convite->empresa_gestora_id,
                'condominio_activo_id' => $convite->condominio_id,
                'estado' => 'activo',
                'locale' => 'pt-PT',
                'email_verified_at' => now(),
            ]);

            $user->assignRole($convite->role_name);

            $convite->update([
                'usado_em' => now(),
                'user_criado_id' => $user->id,
            ]);

            return $user;
        });
    }

    /**
     * Envia email + SMS com o link de convite.
     */
    protected function enviarNotificacoes(ConviteUtilizador $convite): void
    {
        $url = url("/convite/{$convite->token}");

        // Email
        try {
            Mail::to($convite->email)->send(new ConviteUtilizadorMail($convite, $url));
        } catch (\Throwable $e) {
            Log::error('Falha ao enviar email de convite', [
                'convite_id' => $convite->id,
                'email' => $convite->email,
                'erro' => $e->getMessage(),
            ]);
        }

        // SMS (se houver telefone)
        if ($convite->telefone) {
            try {
                $msg = "ONDAKA: Foi convidado para a plataforma. Defina a sua password em: {$url} (válido " . self::VALIDADE_DIAS . " dias)";
                $this->sms->enviar($convite->telefone, $msg);
            } catch (\Throwable $e) {
                Log::error('Falha ao enviar SMS de convite', [
                    'convite_id' => $convite->id,
                    'telefone' => $convite->telefone,
                    'erro' => $e->getMessage(),
                ]);
            }
        }
    }
}
