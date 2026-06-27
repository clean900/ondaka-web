<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\VisitaItem;
use App\Domains\Visitor\Notifications\ItemNaoDeclaradoNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;

/**
 * Service do add-on "Controlo de Bens" — itens registados à entrada de uma visita.
 */
class VisitaItemService
{
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

        $item = $visita->itens()->create([
            'empresa_gestora_id' => $visita->empresa_gestora_id,
            'descricao' => $dados['descricao'],
            'quantidade' => $dados['quantidade'] ?? 1,
            'identificador' => $dados['identificador'] ?? null,
            'estado' => VisitaItem::ESTADO_SAIU,
            'registado_na_entrada' => false,
            'registado_por' => $guarda->id,
            'resolvido_por' => $guarda->id,
            'resolvido_em' => now(),
            'observacoes' => $dados['observacoes'] ?? null,
        ]);

        $this->notificarGestores($visita, $item);

        return $item;
    }

    private function notificarGestores(Visita $visita, VisitaItem $item): void
    {
        try {
            $gestores = User::where('empresa_gestora_id', $visita->empresa_gestora_id)
                ->whereHas('roles', fn ($q) => $q->whereIn('name', ['gestor', 'administrador-condominio', 'admin-empresa']))
                ->get();

            $nome = $visita->loadMissing('visitante')->visitante?->nome ?? 'Visitante';

            foreach ($gestores as $gestor) {
                $gestor->notify(new ItemNaoDeclaradoNotification($visita->id, $item->descricao, $nome));
            }
        } catch (\Throwable $e) {
            Log::warning('[VisitaItemService] Falha a notificar gestores de item não declarado: '.$e->getMessage());
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
