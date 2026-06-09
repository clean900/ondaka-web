<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Domains\Subscription\Services\NotificacaoB2BService;
use App\Domains\Empresa\Notifications\NovoClienteSuperAdminNotification;
use Illuminate\Support\Facades\Log;

/**
 * Cria empresa + user admin + subscrição trial num único fluxo transaccional.
 * Usado pelo auto-registo público (visitantes da landing).
 */
class RegistoEmpresaService
{
    public function __construct(
        protected NotificacaoB2BService $notificacao,
    ) {}
    /**
     * Processa registo completo.
     *
     * @return array{empresa: EmpresaGestora, user: User, subscricao_id: int}
     */
    public function registar(array $dados): array
    {
        return DB::transaction(function () use ($dados) {
            $agora = Carbon::now();
            $trialFim = $agora->copy()->addDays(30);

            // 1. Criar empresa_gestora
            $empresa = EmpresaGestora::create([
                'nome' => $dados['nome_empresa'],
                'tipo_cliente' => $dados['tipo_cliente'],
                'nif' => $dados['documento_numero'],
                'documento_tipo' => $dados['documento_tipo'],
                'nome_completo_responsavel' => $dados['nome_completo_responsavel'] ?? null,
                'slug' => Str::slug($dados['nome_empresa']) . '-' . Str::random(4),
                'email_contacto' => $dados['email_contacto'],
                'telefone' => $dados['telefone'],
                'provincia' => $dados['provincia'],
                'municipio' => $dados['municipio'],
                'plano' => 'trial',
                'trial_termina_em' => $trialFim,
                'activa' => true,
            ]);

            // 1b. Semear tipos de fracção padrão para a nova empresa
            //     (falha não reverte o registo — apenas logada)
            try {
                app()->instance('empresa_gestora_actual', $empresa);
                (new \Database\Seeders\TiposFraccaoSeeder)->seedParaEmpresa($empresa->id);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Falha ao semear tipos de fraccao no registo', [
                    'empresa_id' => $empresa->id,
                    'erro' => $e->getMessage(),
                ]);
            }

            // 2. Criar user admin-empresa
            $user = User::create([
                'name' => $dados['user_nome'],
                'email' => $dados['user_email'],
                'password' => Hash::make($dados['user_password']),
                'empresa_gestora_id' => $empresa->id,
                'estado' => 'activo',
                'locale' => 'pt-PT',
                'email_verified_at' => $agora,
            ]);

            // Atribuir role admin-empresa
            $user->assignRole('admin-empresa');

            // 3. Criar subscrição trial 30 dias
            $subscricaoId = DB::table('subscricoes')->insertGetId([
                'empresa_gestora_id' => $empresa->id,
                'administrador_user_id' => $user->id,
                'estado' => 'trial',
                'ciclo' => 'mensal',
                'num_imoveis' => 0,
                'trial_inicia_em' => $agora,
                'trial_expira_em' => $trialFim,
                'renovacao_automatica' => false,
                'converteu_do_trial' => false,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);

            // 4. Audit trail
            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'trial_iniciado',
                'descricao' => 'Trial de 30 dias iniciado via auto-registo',
                'meta_json' => json_encode([
                    'origem' => 'auto_registo',
                    'tipo_cliente' => $dados['tipo_cliente'],
                    'documento_tipo' => $dados['documento_tipo'],
                    'provincia' => $dados['provincia'],
                ]),
                'user_id' => $user->id,
                'created_at' => $agora,
            ]);

            // 5. Notificação boas-vindas (email)
            $this->notificacao->boasVindas($user, $empresa);

            // 6. Notificar super-admins (sino + email) — falha não reverte o registo
            try {
                $superAdmins = User::role('super-admin')->get();
                foreach ($superAdmins as $sa) {
                    $sa->notify(new NovoClienteSuperAdminNotification($empresa, $user));
                }
            } catch (\Throwable $e) {
                Log::error('Falha ao notificar super-admin de novo cliente', [
                    'empresa_id' => $empresa->id,
                    'erro' => $e->getMessage(),
                ]);
            }

            return [
                'empresa' => $empresa,
                'user' => $user,
                'subscricao_id' => $subscricaoId,
            ];
        });
    }
}
