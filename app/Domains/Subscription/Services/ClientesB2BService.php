<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use App\Domains\Subscription\Services\NotificacaoB2BService;
use Illuminate\Support\Facades\DB;

/**
 * Gestão centralizada de todos os clientes B2B (super-admin).
 * Lista, detalhe, e acções operacionais.
 */
class ClientesB2BService
{
    public function __construct(
        protected NotificacaoB2BService $notificacao,
    ) {}
    /**
     * Lista paginada de clientes B2B com filtros.
     */
    public function listar(array $filtros = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = DB::table('empresas_gestoras as e')
            ->leftJoin('subscricoes as s', function ($j) {
                $j->on('s.empresa_gestora_id', '=', 'e.id')
                    ->whereNull('s.deleted_at');
            })
            ->whereNull('e.deleted_at')
            ->select(
                'e.id',
                'e.nome',
                'e.tipo_cliente',
                'e.nif',
                'e.documento_tipo',
                'e.email_contacto',
                'e.telefone',
                'e.provincia',
                'e.activa as empresa_activa',
                'e.created_at as empresa_created',
                's.id as subscricao_id',
                's.estado as sub_estado',
                's.ciclo as sub_ciclo',
                's.num_imoveis as sub_num_imoveis',
                's.trial_expira_em as sub_trial_expira',
                's.activa_desde as sub_activa_desde',
                's.cancelada_em as sub_cancelada_em',
            );

        // Busca
        if (! empty($filtros['busca'])) {
            $busca = '%' . $filtros['busca'] . '%';
            $query->where(function ($q) use ($busca) {
                $q->where('e.nome', 'like', $busca)
                    ->orWhere('e.nif', 'like', $busca)
                    ->orWhere('e.email_contacto', 'like', $busca);
            });
        }

        // Filtro estado
        if (! empty($filtros['estado']) && $filtros['estado'] !== 'todos') {
            if ($filtros['estado'] === 'sem_subscricao') {
                $query->whereNull('s.id');
            } else {
                $query->where('s.estado', $filtros['estado']);
            }
        }

        // Filtro tipo
        if (! empty($filtros['tipo']) && $filtros['tipo'] !== 'todos') {
            $query->where('e.tipo_cliente', $filtros['tipo']);
        }

        // Ordenação
        $orderBy = $filtros['order_by'] ?? 'created';
        $orderDir = $filtros['order_dir'] ?? 'desc';
        $orderColumn = match ($orderBy) {
            'nome' => 'e.nome',
            'imoveis' => 's.num_imoveis',
            default => 'e.created_at',
        };
        $query->orderBy($orderColumn, $orderDir);

        $clientes = $query->paginate($perPage);

        // Calcular MRR para cada cliente activo
        $clientes->getCollection()->transform(function ($c) {
            $c->mrr_kz = $this->calcularMrrCliente($c->subscricao_id);
            $c->trial_dias_restantes = $c->sub_trial_expira
                ? max(0, Carbon::now()->diffInDays(Carbon::parse($c->sub_trial_expira), false))
                : null;
            return $c;
        });

        return $clientes;
    }

    /**
     * Detalhe completo de um cliente.
     */
    public function detalhar(int $empresaId): array
    {
        $empresa = DB::table('empresas_gestoras')->where('id', $empresaId)->first();
        if (! $empresa) {
            return [];
        }

        $subscricao = DB::table('subscricoes')
            ->where('empresa_gestora_id', $empresaId)
            ->whereNull('deleted_at')
            ->first();

        $facturas = DB::table('plataforma_facturas')
            ->where('subscricao_id', $subscricao?->id)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        $eventos = DB::table('plataforma_subscricao_eventos')
            ->where('subscricao_id', $subscricao?->id)
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get();

        $alteracoesImoveis = DB::table('plataforma_alteracoes_imoveis')
            ->where('subscricao_id', $subscricao?->id)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        $totalCondominios = DB::table('condominios')
            ->where('empresa_gestora_id', $empresaId)
            ->whereNull('deleted_at')
            ->count();

        $totalUsers = DB::table('users')
            ->where('empresa_gestora_id', $empresaId)
            ->whereNull('deleted_at')
            ->count();

        $mrr = $this->calcularMrrCliente($subscricao?->id);

        return [
            'empresa' => $empresa,
            'subscricao' => $subscricao,
            'facturas' => $facturas,
            'eventos' => $eventos,
            'alteracoes_imoveis' => $alteracoesImoveis,
            'total_condominios' => $totalCondominios,
            'total_users' => $totalUsers,
            'mrr_kz' => $mrr,
            'trial_dias_restantes' => $subscricao?->trial_expira_em
                ? max(0, Carbon::now()->diffInDays(Carbon::parse($subscricao->trial_expira_em), false))
                : null,
        ];
    }

    /**
     * Calcula MRR para uma subscrição específica.
     */
    public function calcularMrrCliente(?int $subscricaoId): float
    {
        if (! $subscricaoId) return 0;

        $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
        if (! $sub || $sub->estado !== 'activa') return 0;

        $factura = DB::table('plataforma_facturas')
            ->where('subscricao_id', $subscricaoId)
            ->where('estado', 'paga')
            ->orderBy('id', 'desc')
            ->first();

        if (! $factura) return 0;

        $meses = match ($sub->ciclo) {
            'mensal' => 1,
            'semestral' => 6,
            'anual' => 12,
            default => 1,
        };

        return round((float) $factura->valor_total_kz / $meses, 2);
    }

    /**
     * Estende trial em N dias.
     */
    public function extenderTrial(int $subscricaoId, int $dias, ?int $userId = null, ?string $motivo = null): bool
    {
        return DB::transaction(function () use ($subscricaoId, $dias, $userId, $motivo) {
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            if (! $sub) return false;

            $novoFim = $sub->trial_expira_em
                ? Carbon::parse($sub->trial_expira_em)->addDays($dias)
                : Carbon::now()->addDays($dias);

            DB::table('subscricoes')->where('id', $subscricaoId)->update([
                'trial_expira_em' => $novoFim,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'trial_estendido',
                'descricao' => "Trial estendido em {$dias} dias até {$novoFim->format('Y-m-d')}",
                'meta_json' => json_encode([
                    'dias' => $dias,
                    'novo_fim' => $novoFim->toIso8601String(),
                    'motivo' => $motivo,
                ]),
                'user_id' => $userId,
                'created_at' => now(),
            ]);

            return true;
        });
    }

    /**
     * Cancela subscrição (cancela_no_fim_periodo=true).
     */
    public function cancelar(int $subscricaoId, ?int $userId = null, ?string $motivo = null): bool
    {
        return DB::transaction(function () use ($subscricaoId, $userId, $motivo) {
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            $dataFimAcesso = $sub?->periodo_actual_fim ?? $sub?->trial_expira_em ?? now();
            DB::table('subscricoes')->where('id', $subscricaoId)->update([
                'cancela_no_fim_periodo' => $dataFimAcesso,
                'cancelada_em' => now(),
                'motivo_cancelamento' => $motivo,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'cancelada',
                'descricao' => 'Subscrição cancelada (termina no fim do período pago)',
                'meta_json' => json_encode(['motivo' => $motivo, 'origem' => 'super_admin']),
                'user_id' => $userId,
                'created_at' => now(),
            ]);

            // Notificação por email
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            if ($sub) {
                $empresa = EmpresaGestora::find($sub->empresa_gestora_id);
                $user = User::where('empresa_gestora_id', $sub->empresa_gestora_id)
                    ->whereHas('roles', fn($q) => $q->where('name', 'admin-empresa'))
                    ->first();
                if ($empresa && $user) {
                    $this->notificacao->cancelamentoProcessado($user, $empresa, $motivo);
                }
            }

            return true;
        });
    }

    /**
     * Muda plano (ciclo): mensal/semestral/anual.
     */
    public function mudarPlano(int $subscricaoId, string $novoCiclo, ?int $userId = null): bool
    {
        if (! in_array($novoCiclo, ['mensal', 'semestral', 'anual'])) return false;

        return DB::transaction(function () use ($subscricaoId, $novoCiclo, $userId) {
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            if (! $sub) return false;

            $cicloAntigo = $sub->ciclo;

            DB::table('subscricoes')->where('id', $subscricaoId)->update([
                'ciclo' => $novoCiclo,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'plano_alterado',
                'descricao' => "Ciclo alterado de {$cicloAntigo} para {$novoCiclo}",
                'meta_json' => json_encode(['de' => $cicloAntigo, 'para' => $novoCiclo]),
                'user_id' => $userId,
                'created_at' => now(),
            ]);

            return true;
        });
    }
}
