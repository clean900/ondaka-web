<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Visitor\Models\Visita;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;
use RuntimeException;

/**
 * Service de Visitas em curso / histórico.
 *
 * Responsável por:
 * - Marcar saída de uma visita em curso
 * - Listar visitantes dentro do condomínio agora
 */
class VisitaService
{
    /**
     * Guarda marca saída do visitante.
     *
     * @throws RuntimeException Se guarda não pertence à mesma empresa
     * @throws InvalidArgumentException Se visita já saiu ou não existe
     */
    public function registarSaida(Visita $visita, User $guarda, ?string $observacoes = null): Visita
    {
        // 1. Multi-tenant: guarda só pode marcar saídas da sua empresa
        if ($visita->empresa_gestora_id !== $guarda->empresa_gestora_id) {
            throw new RuntimeException('Esta visita não pertence à empresa do guarda.');
        }

        // 2. Visita tem de estar em curso (ainda dentro)
        if (! $visita->aindaDentro()) {
            throw new InvalidArgumentException(
                'Esta visita já foi encerrada em '
                . $visita->saiu_em->format('d/m/Y H:i')
            );
        }

        // 3. Marcar saída
        $visita->update([
            'saiu_em' => now(),
            'guarda_saida_id' => $guarda->id,
            'observacoes' => $observacoes !== null
                ? ($visita->observacoes ? $visita->observacoes . ' | ' . $observacoes : $observacoes)
                : $visita->observacoes,
        ]);

        return $visita->fresh(['visitante', 'fraccao', 'guardaEntrada', 'guardaSaida']);
    }

    /**
     * Lista visitantes que ainda estão dentro do condomínio (não saíram).
     *
     * Retorna Collection ordenada por hora de entrada descendente
     * (os mais recentes primeiro).
     *
     * @return Collection<Visita>
     */
    public function dentroAgora(int $empresaGestoraId, ?int $fraccaoId = null): Collection
    {
        $query = Visita::with(['visitante', 'fraccao'])
            ->paraEmpresa($empresaGestoraId)
            ->dentroAgora()
            ->orderBy('entrou_em', 'desc');

        if ($fraccaoId !== null) {
            $query->where('fraccao_id', $fraccaoId);
        }

        return $query->get();
    }

    /**
     * Conta quantos visitantes estão dentro agora (performance-friendly).
     */
    public function contarDentroAgora(int $empresaGestoraId, ?int $fraccaoId = null): int
    {
        $query = Visita::paraEmpresa($empresaGestoraId)->dentroAgora();

        if ($fraccaoId !== null) {
            $query->where('fraccao_id', $fraccaoId);
        }

        return $query->count();
    }
}
