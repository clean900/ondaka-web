<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\VisitaItem;
use App\Domains\Visitor\Notifications\AutorizarSaidaBemNotification;
use App\Domains\Visitor\Notifications\ItemNaoDeclaradoNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use InvalidArgumentException;
use RuntimeException;

/**
 * Service do add-on "Controlo de Bens" — itens registados à entrada de uma visita.
 */
class VisitaItemService
{
    public function __construct(
        protected ?FcmSenderService $fcm = null,
    ) {}

    /**
     * Lista os itens de uma visita (multi-tenant).
     *
     * @return Collection<VisitaItem>
     */
    public function listar(Visita $visita, User $guarda): Collection
    {
        $this->garantirMesmaEmpresa($visita, $guarda);

        return $visita->itens()->with(['registadoPor:id,name', 'resolvidoPor:id,name'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Regista um item à entrada (fica com estado 'dentro').
     *
     * @throws RuntimeException Multi-tenant
     * @throws InvalidArgumentException Visita já encerrada
     */
    public function registar(Visita $visita, User $guarda, array $dados): VisitaItem
    {
        $this->garantirMesmaEmpresa($visita, $guarda);

        if (! $visita->aindaDentro()) {
            throw new InvalidArgumentException('Esta visita já saiu — não é possível registar itens.');
        }

        return $visita->itens()->create([
            'empresa_gestora_id' => $visita->empresa_gestora_id,
            'descricao' => $dados['descricao'],
            'categoria' => $dados['categoria'] ?? null,
            'quantidade' => $dados['quantidade'] ?? 1,
            'identificador' => $dados['identificador'] ?? null,
            'foto_entrada_path' => $dados['foto_entrada_path'] ?? null,
            'estado' => VisitaItem::ESTADO_DENTRO,
            'registado_por' => $guarda->id,
            'observacoes' => $dados['observacoes'] ?? null,
        ]);
    }

    /**
     * Regista um item DETECTADO na saída que não foi declarado à entrada
     * (anomalia). Fica saiu + registado_na_entrada=false e notifica os gestores.
     *
     * @throws RuntimeException Multi-tenant
     * @throws InvalidArgumentException Visita já encerrada
     */
    public function registarNaoDeclarado(Visita $visita, User $guarda, array $dados): VisitaItem
    {
        $this->garantirMesmaEmpresa($visita, $guarda);

        if (! $visita->aindaDentro()) {
            throw new InvalidArgumentException('Esta visita já saiu.');
        }

        // Item não declarado → fica a AGUARDAR AUTORIZAÇÃO do condómino (a saída
        // fica bloqueada até alguém autorizar). Não é libertado automaticamente.
        $item = $visita->itens()->create([
            'empresa_gestora_id' => $visita->empresa_gestora_id,
            'descricao' => $dados['descricao'],
            'quantidade' => $dados['quantidade'] ?? 1,
            'identificador' => $dados['identificador'] ?? null,
            'foto_entrada_path' => $dados['foto_entrada_path'] ?? null,
            'estado' => VisitaItem::ESTADO_AGUARDA_AUTORIZACAO,
            'registado_na_entrada' => false,
            'registado_por' => $guarda->id,
            'observacoes' => $dados['observacoes'] ?? null,
        ]);

        $this->notificarPedidoAutorizacao($visita, $item);

        return $item;
    }

    /**
     * Condómino (ou gestor) autoriza/recusa a saída de um bem não declarado.
     *
     * @throws RuntimeException Multi-tenant / sem permissão
     * @throws InvalidArgumentException Item não está pendente
     */
    public function autorizarSaida(VisitaItem $item, User $user, bool $aprovar): VisitaItem
    {
        if ($item->empresa_gestora_id !== $user->empresa_gestora_id) {
            throw new RuntimeException('Este item não pertence à empresa do utilizador.');
        }
        if ($item->estado !== VisitaItem::ESTADO_AGUARDA_AUTORIZACAO) {
            throw new InvalidArgumentException('Este item não está à espera de autorização.');
        }
        if (! $this->podeAutorizar($item->visita, $user)) {
            throw new RuntimeException('Não tem permissão para autorizar a saída deste bem.');
        }

        $item->update([
            'estado' => $aprovar ? VisitaItem::ESTADO_SAIU : VisitaItem::ESTADO_RETIDO,
            'autorizado_por' => $user->id,
            'autorizado_em' => now(),
        ]);

        $this->notificarResultadoAoGuarda($item, $aprovar);

        return $item->fresh();
    }

    /**
     * O guarda retém um bem que ficou à espera de autorização (sem resposta do
     * condómino, ou recusa verbal). O visitante sai sem o bem; a saída desbloqueia.
     *
     * @throws RuntimeException Multi-tenant
     * @throws InvalidArgumentException Item não está à espera de autorização
     */
    public function reterItem(VisitaItem $item, User $guarda): VisitaItem
    {
        if ($item->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Este item não pertence à empresa do guarda.');
        }
        if ($item->estado !== VisitaItem::ESTADO_AGUARDA_AUTORIZACAO) {
            throw new InvalidArgumentException('Só itens à espera de autorização podem ser retidos.');
        }

        $item->update([
            'estado' => VisitaItem::ESTADO_RETIDO,
            'resolvido_por' => $guarda->id,
            'resolvido_em' => now(),
        ]);

        return $item->fresh();
    }

    /**
     * Itens à espera de autorização para um utilizador (condómino vê os seus;
     * gestor vê os da empresa).
     *
     * @return Collection<VisitaItem>
     */
    public function pendentesAutorizacao(User $user): Collection
    {
        $query = VisitaItem::with(['visita.visitante', 'visita.fraccao'])
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->where('estado', VisitaItem::ESTADO_AGUARDA_AUTORIZACAO);

        // Condómino: só os bens das suas fracções
        if ($user->hasRole('condomino')) {
            $fraccoes = $this->fraccoesDoCondomino($user);
            $query->whereHas('visita', fn ($q) => $q->whereIn('fraccao_id', $fraccoes));
        }

        return $query->latest('id')->get();
    }

    // --- Autorização: helpers ---

    private function condominoDaVisita(Visita $visita): ?User
    {
        $fraccao = Fraccao::find($visita->fraccao_id);
        $contrato = $fraccao?->contratosActivos()->with('condomino.user')->first();

        return $contrato?->condomino?->user;
    }

    /** @return array<int> ids das fracções com contrato activo do condómino */
    private function fraccoesDoCondomino(User $user): array
    {
        $condomino = \App\Domains\Condomino\Models\Condomino::where('user_id', $user->id)->first();
        if (! $condomino) {
            return [];
        }

        return $condomino->contratosActivos()->pluck('fraccao_id')->all();
    }

    private function podeAutorizar(Visita $visita, User $user): bool
    {
        if ($user->hasAnyRole(['gestor', 'administrador-condominio', 'admin-empresa', 'super-admin'])) {
            return true;
        }
        $condomino = $this->condominoDaVisita($visita);

        return $condomino !== null && $condomino->id === $user->id;
    }

    private function notificarPedidoAutorizacao(Visita $visita, VisitaItem $item): void
    {
        $nome = $visita->loadMissing('visitante')->visitante?->nome ?? 'Visitante';

        // 1) Condómino do imóvel → push + sino
        try {
            $condomino = $this->condominoDaVisita($visita);
            if ($condomino) {
                $condomino->notify(new AutorizarSaidaBemNotification($visita->id, $item->id, $item->descricao, $nome));
                $this->fcm?->enviarParaUser(
                    $condomino,
                    'Autorizar saída de bem',
                    "{$nome} quer sair com \"{$item->descricao}\" (não declarado). Autoriza?",
                    [
                        'tipo' => 'autorizar_saida_bem',
                        'visita_id' => (string) $visita->id,
                        'item_id' => (string) $item->id,
                        'descricao' => $item->descricao,
                    ],
                );
            }
        } catch (\Throwable $e) {
            Log::warning('[VisitaItemService] Falha a notificar condómino: '.$e->getMessage());
        }

        // 2) Gestores → sino + push + email
        try {
            $gestores = User::where('empresa_gestora_id', $visita->empresa_gestora_id)
                ->whereHas('roles', fn ($q) => $q->whereIn('name', ['gestor', 'administrador-condominio', 'admin-empresa']))
                ->get();

            foreach ($gestores as $gestor) {
                $gestor->notify(new ItemNaoDeclaradoNotification($visita->id, $item->descricao, $nome));
                $this->fcm?->enviarParaUser(
                    $gestor,
                    '⚠️ Bem não declarado à saída',
                    "{$nome} quer sair com \"{$item->descricao}\" — não declarado à entrada.",
                    ['tipo' => 'item_nao_declarado', 'visita_id' => (string) $visita->id, 'item_id' => (string) $item->id],
                );
                if ($gestor->email) {
                    $this->enviarEmailGestor($gestor->email, $nome, $item->descricao);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[VisitaItemService] Falha a notificar gestores: '.$e->getMessage());
        }
    }

    private function enviarEmailGestor(string $email, string $nomeVisitante, string $descricao): void
    {
        try {
            Mail::raw(
                "Alerta de segurança — Controlo de Bens\n\n"
                . "O visitante {$nomeVisitante} tentou sair com o bem \"{$descricao}\", que NÃO foi declarado à entrada.\n"
                . "A saída está a aguardar autorização do condómino.\n\n"
                . "Veja em: Visitantes → Histórico.",
                function ($m) use ($email) {
                    $m->to($email)->subject('⚠️ ONDAKA — Bem não declarado à saída');
                }
            );
        } catch (\Throwable $e) {
            Log::warning('[VisitaItemService] Falha email gestor: '.$e->getMessage());
        }
    }

    private function notificarResultadoAoGuarda(VisitaItem $item, bool $aprovar): void
    {
        try {
            $guarda = User::find($item->registado_por);
            if (! $guarda) {
                return;
            }
            $msg = $aprovar
                ? "Saída de \"{$item->descricao}\" AUTORIZADA pelo condómino."
                : "Saída de \"{$item->descricao}\" RECUSADA pelo condómino — reter o bem.";
            $this->fcm?->enviarParaUser(
                $guarda,
                $aprovar ? 'Saída autorizada' : 'Saída recusada',
                $msg,
                ['tipo' => 'resultado_autorizacao_bem', 'item_id' => (string) $item->id, 'aprovado' => $aprovar ? '1' : '0'],
            );
        } catch (\Throwable $e) {
            Log::warning('[VisitaItemService] Falha a notificar guarda: '.$e->getMessage());
        }
    }

    /**
     * Reconcilia um item na saída: 'saiu' (levou) ou 'ficou' (deixou no condomínio).
     *
     * @throws RuntimeException Multi-tenant
     * @throws InvalidArgumentException Resolução inválida / já resolvido
     */
    public function resolver(VisitaItem $item, User $guarda, string $resolucao, ?string $observacoes = null): VisitaItem
    {
        if ($item->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Este item não pertence à empresa do guarda.');
        }

        if (! in_array($resolucao, [VisitaItem::ESTADO_SAIU, VisitaItem::ESTADO_FICOU], true)) {
            throw new InvalidArgumentException('Resolução inválida. Use "saiu" ou "ficou".');
        }

        if (! $item->estaDentro()) {
            throw new InvalidArgumentException('Este item já foi resolvido.');
        }

        $item->update([
            'estado' => $resolucao,
            'resolvido_por' => $guarda->id,
            'resolvido_em' => now(),
            'observacoes' => $observacoes !== null
                ? ($item->observacoes ? $item->observacoes . ' | ' . $observacoes : $observacoes)
                : $item->observacoes,
        ]);

        return $item->fresh();
    }

    /**
     * Remove um item registado por engano (só enquanto estiver 'dentro').
     */
    public function remover(VisitaItem $item, User $guarda): void
    {
        if ($item->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Este item não pertence à empresa do guarda.');
        }

        if (! $item->estaDentro()) {
            throw new InvalidArgumentException('Só é possível remover itens ainda por resolver.');
        }

        $item->delete();
    }

    private function garantirMesmaEmpresa(Visita $visita, User $guarda): void
    {
        if ($visita->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Esta visita não pertence à empresa do guarda.');
        }
    }
}
