<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Services;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoClique;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Notifications\AfiliadoAprovadoNotification;
use App\Domains\Afiliados\Notifications\AfiliadoNovoClienteNotification;
use App\Domains\Afiliados\Notifications\AfiliadoRecusadoNotification;
use App\Domains\Afiliados\Notifications\NovaCandidaturaAfiliadoSuperAdminNotification;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Ciclo de vida do afiliado: candidatura, aprovação, códigos, níveis e atribuição de clientes.
 */
class AfiliadoService
{
    public function __construct(
        protected AfiliadoConfigService $config,
    ) {}

    // -----------------------------------------------------------------
    // Consulta
    // -----------------------------------------------------------------

    public function porCodigo(string $codigo, bool $soActivos = true): ?Afiliado
    {
        $codigo = strtoupper(trim($codigo));
        if ($codigo === '' || ! preg_match('/^[A-Z0-9]{4,20}$/', $codigo)) {
            return null;
        }
        $q = Afiliado::where('codigo', $codigo);
        if ($soActivos) {
            $q->where('estado', Afiliado::ESTADO_ACTIVO);
        }

        return $q->first();
    }

    public function doUser(?User $user): ?Afiliado
    {
        return $user ? Afiliado::where('user_id', $user->id)->first() : null;
    }

    public function gerarCodigo(string $nome): string
    {
        $base = strtoupper((string) preg_replace('/[^A-Z0-9]/', '', strtoupper(Str::ascii($nome))));
        $base = substr($base, 0, 5);
        if (strlen($base) < 3) {
            $base = 'ONDK';
        }
        do {
            $codigo = $base.strtoupper(Str::random(3));
        } while (Afiliado::withTrashed()->where('codigo', $codigo)->exists());

        return $codigo;
    }

    // -----------------------------------------------------------------
    // Candidatura / adesão
    // -----------------------------------------------------------------

    /** Candidatura pública: cria conta de utilizador + afiliado (pendente ou activo). */
    public function candidatar(array $d): Afiliado
    {
        return DB::transaction(function () use ($d) {
            $user = User::create([
                'name' => $d['nome'],
                'email' => $d['email'],
                'password' => Hash::make($d['password']),
                'telefone' => $d['telefone'] ?? null,
                'nif' => $d['nif'] ?? null,
                'estado' => 'activo',
                'locale' => 'pt-PT',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('afiliado');

            return $this->criarAfiliado($user, $d, null);
        });
    }

    /** Adesão de um utilizador já autenticado (ex.: gestor de uma empresa cliente). */
    public function aderir(User $user, array $d = []): Afiliado
    {
        $existente = $this->doUser($user);
        if ($existente) {
            return $existente;
        }

        return DB::transaction(function () use ($user, $d) {
            if (! $user->hasRole('afiliado')) {
                $user->assignRole('afiliado');
            }
            $empresa = $user->empresa_gestora_id ? EmpresaGestora::find($user->empresa_gestora_id) : null;
            $tipo = $d['tipo'] ?? ($empresa ? 'empresa' : 'particular');
            $d['tipo'] = $tipo;
            $d['nome'] = trim((string) ($d['nome'] ?? '')) !== ''
                ? $d['nome']
                : ($tipo === 'empresa' && $empresa ? $empresa->nome : $user->name);
            $d['email'] = $user->email;
            $d['telefone'] = $d['telefone'] ?? $user->telefone;
            $d['nif'] = $d['nif'] ?? ($tipo === 'empresa' && $empresa ? $empresa->nif : $user->nif);

            return $this->criarAfiliado($user, $d, $empresa?->id);
        });
    }

    protected function criarAfiliado(User $user, array $d, ?int $empresaId): Afiliado
    {
        $auto = $this->config->bool('afiliado_aprovacao_automatica');
        $nivel = Afiliado::NIVEL_BRONZE;

        $af = Afiliado::create([
            'user_id' => $user->id,
            'codigo' => $this->gerarCodigo((string) $d['nome']),
            'tipo' => $d['tipo'] ?? 'particular',
            'nome' => $d['nome'],
            'email' => $d['email'],
            'telefone' => $d['telefone'] ?? null,
            'nif' => $d['nif'] ?? null,
            'empresa_gestora_id' => $empresaId,
            'estado' => $auto ? Afiliado::ESTADO_ACTIVO : Afiliado::ESTADO_PENDENTE,
            'nivel' => $nivel,
            'taxa_actual_pct' => $this->config->taxaPorNivel($nivel),
            'iban' => $d['iban'] ?? null,
            'banco' => $d['banco'] ?? null,
            'titular_conta' => $d['titular_conta'] ?? null,
            'como_divulga' => $d['como_divulga'] ?? null,
            'aprovado_em' => $auto ? now() : null,
        ]);

        Log::info('Afiliado criado', ['afiliado_id' => $af->id, 'codigo' => $af->codigo, 'auto' => $auto]);

        $this->notificarSuperAdmins(new NovaCandidaturaAfiliadoSuperAdminNotification($af));
        if ($auto) {
            $this->notificarAfiliado($af, new AfiliadoAprovadoNotification($af));
        }

        return $af;
    }

    // -----------------------------------------------------------------
    // Estado (super-admin)
    // -----------------------------------------------------------------

    public function aprovar(Afiliado $af, int $adminId): Afiliado
    {
        $af->forceFill([
            'estado' => Afiliado::ESTADO_ACTIVO,
            'aprovado_em' => $af->aprovado_em ?? now(),
            'aprovado_por_user_id' => $adminId,
            'motivo_recusa' => null,
            'motivo_suspensao' => null,
            'suspenso_em' => null,
        ])->save();
        $this->recalcularNivel($af);
        $this->notificarAfiliado($af, new AfiliadoAprovadoNotification($af));

        return $af;
    }

    public function recusar(Afiliado $af, int $adminId, string $motivo): Afiliado
    {
        $af->forceFill([
            'estado' => Afiliado::ESTADO_RECUSADO,
            'motivo_recusa' => Str::limit($motivo, 250, ''),
            'aprovado_por_user_id' => $adminId,
        ])->save();
        $this->notificarAfiliado($af, new AfiliadoRecusadoNotification($af, $motivo));

        return $af;
    }

    public function suspender(Afiliado $af, int $adminId, string $motivo): Afiliado
    {
        $af->forceFill([
            'estado' => Afiliado::ESTADO_SUSPENSO,
            'suspenso_em' => now(),
            'motivo_suspensao' => Str::limit($motivo, 250, ''),
        ])->save();
        Log::info('Afiliado suspenso', ['afiliado_id' => $af->id, 'admin' => $adminId, 'motivo' => $motivo]);

        return $af;
    }

    public function definirTaxaManual(Afiliado $af, ?string $taxa): Afiliado
    {
        $valor = null;
        if ($taxa !== null && trim($taxa) !== '') {
            $valor = number_format((float) str_replace(',', '.', $taxa), 2, '.', '');
            if ((float) $valor < 0 || (float) $valor > 100) {
                throw new \RuntimeException('Taxa inválida (0 a 100%).');
            }
        }
        $af->forceFill(['taxa_manual_pct' => $valor])->save();

        return $this->recalcularNivel($af);
    }

    public function actualizarNotasAdmin(Afiliado $af, ?string $notas): void
    {
        $af->forceFill(['notas_admin' => $notas])->save();
    }

    /** Dados editáveis pelo próprio afiliado. */
    public function actualizarDados(Afiliado $af, array $d): Afiliado
    {
        $af->fill(array_intersect_key($d, array_flip([
            'nome', 'tipo', 'nif', 'telefone', 'iban', 'banco', 'titular_conta', 'como_divulga',
        ])))->save();

        return $af;
    }

    // -----------------------------------------------------------------
    // Níveis / taxa
    // -----------------------------------------------------------------

    /** Nº de clientes distintos que já geraram pelo menos uma comissão (não anulada). */
    public function clientesPagantes(Afiliado $af): int
    {
        return (int) AfiliadoComissao::where('afiliado_id', $af->id)
            ->naoAnuladas()
            ->distinct()
            ->count('empresa_gestora_id');
    }

    public function taxaEfectiva(Afiliado $af): string
    {
        if ($af->taxa_manual_pct !== null) {
            return number_format((float) $af->taxa_manual_pct, 2, '.', '');
        }

        return $this->config->taxaPorNivel($this->config->nivelPorClientes($this->clientesPagantes($af)));
    }

    public function recalcularNivel(Afiliado $af): Afiliado
    {
        $n = $this->clientesPagantes($af);
        $nivel = $this->config->nivelPorClientes($n);
        $taxa = $af->taxa_manual_pct !== null
            ? number_format((float) $af->taxa_manual_pct, 2, '.', '')
            : $this->config->taxaPorNivel($nivel);

        if ($af->nivel !== $nivel || (string) $af->taxa_actual_pct !== $taxa) {
            $af->forceFill(['nivel' => $nivel, 'taxa_actual_pct' => $taxa])->save();
        }

        return $af;
    }

    /** Próximo nível a atingir (null se já está no topo). */
    public function proximoNivel(Afiliado $af): ?array
    {
        $n = $this->clientesPagantes($af);
        foreach ($this->config->niveis() as $nivel) {
            if ($nivel['min_clientes'] > $n) {
                return [
                    'nivel' => $nivel['nivel'],
                    'label' => $nivel['label'],
                    'taxa_pct' => $nivel['taxa_pct'],
                    'min_clientes' => $nivel['min_clientes'],
                    'faltam' => $nivel['min_clientes'] - $n,
                ];
            }
        }

        return null;
    }

    // -----------------------------------------------------------------
    // Cliques
    // -----------------------------------------------------------------

    /** Regista um clique no link (1 por IP por dia, para não inflacionar). */
    public function registarClique(Afiliado $af, Request $request): void
    {
        $ipHash = hash('sha256', ($request->ip() ?? '').'|'.(string) config('app.key'));
        $jaHoje = AfiliadoClique::where('afiliado_id', $af->id)
            ->where('ip_hash', $ipHash)
            ->where('created_at', '>=', now()->startOfDay())
            ->exists();
        if ($jaHoje) {
            return;
        }
        AfiliadoClique::create([
            'afiliado_id' => $af->id,
            'ip_hash' => $ipHash,
            'user_agent' => Str::limit((string) $request->userAgent(), 250, ''),
            'url_destino' => Str::limit($request->path(), 250, ''),
            'referer' => Str::limit((string) $request->headers->get('referer'), 250, ''),
            'created_at' => now(),
        ]);
        Afiliado::where('id', $af->id)->increment('total_cliques');
    }

    // -----------------------------------------------------------------
    // Atribuição de clientes
    // -----------------------------------------------------------------

    public function atribuicaoValida(EmpresaGestora $e): bool
    {
        if (! $e->afiliado_id) {
            return false;
        }
        if ($e->afiliado_expira_em && Carbon::parse((string) $e->afiliado_expira_em)->endOfDay()->isPast()) {
            return false;
        }

        return true;
    }

    /** Devolve mensagem de erro se a atribuição não for permitida, null se for. */
    public function podeAtribuir(EmpresaGestora $e, Afiliado $af): ?string
    {
        if ($af->empresa_gestora_id && (int) $af->empresa_gestora_id === (int) $e->id) {
            return 'Um afiliado não pode indicar a sua própria empresa.';
        }
        $af->loadMissing('user');
        if ($af->user && $af->user->empresa_gestora_id && (int) $af->user->empresa_gestora_id === (int) $e->id) {
            return 'Um afiliado não pode indicar a sua própria empresa.';
        }
        if ($e->afiliado_id && (int) $e->afiliado_id === (int) $af->id) {
            return 'Este cliente já está atribuído a este afiliado.';
        }
        if ($e->afiliado_id) {
            return 'Este cliente já está atribuído a outro afiliado.';
        }

        return null;
    }

    public function atribuirCliente(EmpresaGestora $e, Afiliado $af, string $origem = 'manual', ?int $adminId = null, bool $notificar = true): void
    {
        $erro = $this->podeAtribuir($e, $af);
        if ($erro) {
            throw new \RuntimeException($erro);
        }
        $meses = $this->config->int('afiliado_duracao_meses');
        $e->forceFill([
            'afiliado_id' => $af->id,
            'afiliado_atribuido_em' => now(),
            'afiliado_origem' => $origem,
            'afiliado_expira_em' => $meses > 0 ? now()->addMonths($meses)->toDateString() : null,
        ])->save();

        Log::info('Cliente atribuído a afiliado', [
            'empresa_id' => $e->id, 'afiliado_id' => $af->id, 'origem' => $origem, 'admin' => $adminId,
        ]);

        if ($notificar) {
            $this->notificarAfiliado($af, new AfiliadoNovoClienteNotification($af, $e));
        }
    }

    public function removerAtribuicao(EmpresaGestora $e, ?int $adminId = null): void
    {
        Log::info('Atribuição de afiliado removida', ['empresa_id' => $e->id, 'afiliado_id' => $e->afiliado_id, 'admin' => $adminId]);
        $e->forceFill([
            'afiliado_id' => null,
            'afiliado_atribuido_em' => null,
            'afiliado_origem' => null,
            'afiliado_expira_em' => null,
        ])->save();
    }

    /** Chamado no auto-registo: código vem do link ?ref= ou do cookie. Nunca falha o registo. */
    public function atribuirNoRegisto(EmpresaGestora $e, ?string $codigo): ?Afiliado
    {
        if (! $codigo || ! $this->config->programaActivo()) {
            return null;
        }
        $af = $this->porCodigo($codigo);
        if (! $af || $this->podeAtribuir($e, $af) !== null) {
            return null;
        }
        $this->atribuirCliente($e, $af, 'link', null, true);

        return $af;
    }

    // -----------------------------------------------------------------
    // Internos
    // -----------------------------------------------------------------

    protected function notificarSuperAdmins(Notification $notification): void
    {
        try {
            foreach (User::role('super-admin')->get() as $sa) {
                $sa->notify($notification);
            }
        } catch (\Throwable $e) {
            Log::error('Afiliados: notificação super-admin falhou: '.$e->getMessage());
        }
    }

    protected function notificarAfiliado(Afiliado $af, Notification $notification): void
    {
        try {
            $af->loadMissing('user');
            $af->user?->notify($notification);
        } catch (\Throwable $e) {
            Log::error('Afiliados: notificação ao afiliado falhou: '.$e->getMessage(), ['afiliado_id' => $af->id]);
        }
    }
}
