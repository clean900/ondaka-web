<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Services;

use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoComentario;
use App\Domains\Avisos\Models\AvisoLeitura;
use App\Domains\Avisos\Models\AvisoSegmentacao;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

class AvisoService
{
    public function __construct(
        protected AvisoNotificationService $notificationService,
    ) {}

    /**
     * Cria um novo aviso (ainda em rascunho ou agendado).
     *
     * @param  array  $dados  ['condominio_id', 'titulo', 'descricao', 'categoria', 'prioridade',
     *                         'publicar_em', 'permite_comentarios', 'requer_confirmacao',
     *                         'notificar_push', 'notificar_email', 'notificar_sms']
     * @param  array  $segmentacoes  [['tipo' => 'fraccao', 'alvo_id' => 5], ...]
     */
    public function criar(array $dados, array $segmentacoes, User $autor): Aviso
    {
        return DB::transaction(function () use ($dados, $segmentacoes, $autor) {
            // Determinar estado inicial
            $estado = 'rascunho';
            if (isset($dados['publicar_em'])) {
                $estado = $dados['publicar_em'] > now() ? 'agendado' : 'publicado';
            }

            $aviso = Aviso::create([
                'empresa_gestora_id' => $autor->empresa_gestora_id,
                'condominio_id' => $dados['condominio_id'],
                'autor_user_id' => $autor->id,
                'titulo' => $dados['titulo'],
                'descricao' => $dados['descricao'],
                'categoria' => $dados['categoria'] ?? 'geral',
                'prioridade' => $dados['prioridade'] ?? 'media',
                'estado' => $estado,
                'publicar_em' => $dados['publicar_em'] ?? null,
                'publicado_em' => $estado === 'publicado' ? now() : null,
                'arquivar_em' => $dados['arquivar_em'] ?? null,
                'permite_comentarios' => $dados['permite_comentarios'] ?? true,
                'requer_confirmacao' => $dados['requer_confirmacao'] ?? false,
                'notificar_push' => $dados['notificar_push'] ?? true,
                'notificar_email' => $dados['notificar_email'] ?? true,
                'notificar_sms' => $dados['notificar_sms'] ?? false,
            ]);

            // Criar segmentações
            foreach ($segmentacoes as $seg) {
                AvisoSegmentacao::create([
                    'aviso_id' => $aviso->id,
                    'tipo' => $seg['tipo'],
                    'alvo_id' => $seg['alvo_id'] ?? null,
                    'valor_texto' => $seg['valor_texto'] ?? null,
                ]);
            }

            // Se publicado imediatamente, disparar notificações
            if ($estado === 'publicado') {
                $this->notificarSeguro(fn() => $this->notificationService->avisoPublicado($aviso));
            }

            return $aviso->fresh(['autor', 'condominio', 'segmentacoes']);
        });
    }

    /**
     * Publica um aviso que está em rascunho ou agendado.
     */
    public function publicar(Aviso $aviso): Aviso
    {
        if ($aviso->estado === 'publicado') {
            return $aviso;
        }

        $aviso->marcarPublicado();
        $this->notificarSeguro(fn() => $this->notificationService->avisoPublicado($aviso));

        return $aviso->fresh();
    }

    /**
     * Arquiva um aviso (não aparece mais nas listas activas).
     */
    public function arquivar(Aviso $aviso): Aviso
    {
        $aviso->update(['estado' => 'arquivado']);
        return $aviso->fresh();
    }

    /**
     * Lista avisos visíveis ao user (segmentação aplicada).
     */
    public function paraUser(User $user, ?int $condominioId = null): Builder
    {
        $query = Aviso::query()
            ->where('estado', 'publicado')
            ->orderBy('publicado_em', 'desc');

        if ($condominioId) {
            $query->where('condominio_id', $condominioId);
        }

        // Resolver fracções e edifícios (blocos) onde o user tem contrato activo
        $fraccoesIds = \DB::table('contratos_ocupacao')
            ->join('condominos', 'contratos_ocupacao.condomino_id', '=', 'condominos.id')
            ->where('condominos.user_id', $user->id)
            ->where('contratos_ocupacao.estado', 'activo')
            ->pluck('contratos_ocupacao.fraccao_id')
            ->toArray();

        $edificiosIds = empty($fraccoesIds) ? [] : \DB::table('fraccoes')
            ->whereIn('id', $fraccoesIds)
            ->pluck('edificio_id')
            ->filter()
            ->unique()
            ->toArray();

        // FRONTEIRA DE ISOLAMENTO: condomínios onde o user tem acesso legítimo.
        // Condómino: via contratos activos (fracções -> condomínio).
        // Sem contratos (guarda/prestador): via condominios_atribuidos / condominio_activo_id.
        $condominioIds = empty($fraccoesIds) ? [] : \DB::table('fraccoes')
            ->whereIn('id', $fraccoesIds)
            ->pluck('condominio_id')
            ->filter()
            ->unique()
            ->toArray();

        if (empty($condominioIds)) {
            $atribuidos = $user->condominios_atribuidos ?? [];
            if (! empty($user->condominio_activo_id)) {
                $atribuidos[] = $user->condominio_activo_id;
            }
            $condominioIds = array_values(array_unique(array_filter($atribuidos)));
        }

        // Sem condomínios legítimos -> nenhum aviso (fail-safe, nunca [] que devolveria tudo).
        $query->whereIn('condominio_id', $condominioIds ?: [-1]);

        // Aviso visível se tem segmentação:
        //   - tipo=todos
        //   - tipo=fraccao com alvo em uma das fracções do user
        //   - tipo=bloco com alvo em um dos edifícios do user
        $query->whereHas('segmentacoes', function ($s) use ($fraccoesIds, $edificiosIds) {
            $s->where('tipo', 'todos');
            if (! empty($fraccoesIds)) {
                $s->orWhere(function ($sq) use ($fraccoesIds) {
                    $sq->where('tipo', 'fraccao')->whereIn('alvo_id', $fraccoesIds);
                });
            }
            if (! empty($edificiosIds)) {
                $s->orWhere(function ($sq) use ($edificiosIds) {
                    $sq->where('tipo', 'bloco')->whereIn('alvo_id', $edificiosIds);
                });
            }
        });

        return $query;
    }

    /**
     * Marca um aviso como lido pelo user.
     */
    public function marcarLido(Aviso $aviso, User $user, bool $confirmar = false): AvisoLeitura
    {
        return AvisoLeitura::updateOrCreate(
            ['aviso_id' => $aviso->id, 'user_id' => $user->id],
            [
                'lido_em' => now(),
                'confirmado_em' => $confirmar ? now() : null,
            ],
        );
    }

    /**
     * Adiciona um comentário a um aviso.
     */
    public function comentar(
        Aviso $aviso,
        User $user,
        string $mensagem,
        ?int $parentId = null,
    ): AvisoComentario {
        if (! $aviso->permite_comentarios) {
            throw new InvalidArgumentException('Aviso não permite comentários.');
        }

        $comentario = AvisoComentario::create([
            'aviso_id' => $aviso->id,
            'user_id' => $user->id,
            'parent_id' => $parentId,
            'mensagem' => $mensagem,
        ]);

        $this->notificarSeguro(fn() => $this->notificationService->novoComentario($aviso, $comentario));

        return $comentario;
    }

    /**
     * Estatísticas de leitura para admin.
     */
    public function estatisticasLeitura(Aviso $aviso): array
    {
        $totalLeituras = AvisoLeitura::where('aviso_id', $aviso->id)->count();
        $confirmados = AvisoLeitura::where('aviso_id', $aviso->id)
            ->whereNotNull('confirmado_em')
            ->count();

        return [
            'total_lidos' => $totalLeituras,
            'total_confirmados' => $confirmados,
        ];
    }

    private function notificarSeguro(callable $callback): void
    {
        try {
            $callback();
        } catch (Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[AvisoService] Falha notification: ' . $e->getMessage());
        }
    }
}
