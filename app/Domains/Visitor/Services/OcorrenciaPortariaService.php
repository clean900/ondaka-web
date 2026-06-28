<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Visitor\Models\OcorrenciaPortaria;
use App\Domains\Visitor\Models\PassagemTurno;
use App\Domains\Visitor\Models\Visita;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;
use RuntimeException;

/**
 * Service do add-on "Livro de Ocorrências + Passagem de Turno".
 */
class OcorrenciaPortariaService
{
    /** @return Collection<OcorrenciaPortaria> */
    public function listar(User $user, ?bool $abertas = null): Collection
    {
        $q = OcorrenciaPortaria::with(['guarda:id,name', 'resolvidaPor:id,name'])
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->latest('id');

        if ($abertas === true) {
            $q->whereNull('resolvida_em');
        } elseif ($abertas === false) {
            $q->whereNotNull('resolvida_em');
        }

        return $q->limit(200)->get();
    }

    public function criar(User $guarda, array $dados): OcorrenciaPortaria
    {
        $tipo = $dados['tipo'] ?? 'observacao';
        if (! in_array($tipo, OcorrenciaPortaria::TIPOS, true)) {
            throw new InvalidArgumentException('Tipo de ocorrência inválido.');
        }

        return OcorrenciaPortaria::create([
            'empresa_gestora_id' => $guarda->empresa_gestora_id,
            'condominio_id' => $guarda->condominio_activo_id,
            'guarda_id' => $guarda->id,
            'tipo' => $tipo,
            'descricao' => $dados['descricao'],
            'foto_path' => $dados['foto_path'] ?? null,
            'latitude' => $dados['latitude'] ?? null,
            'longitude' => $dados['longitude'] ?? null,
        ]);
    }

    public function resolver(OcorrenciaPortaria $oc, User $user, ?string $notas = null): OcorrenciaPortaria
    {
        if ($oc->empresa_gestora_id !== $user->empresa_gestora_id) {
            throw new RuntimeException('Esta ocorrência não pertence à empresa do utilizador.');
        }
        if (! $oc->estaAberta()) {
            throw new InvalidArgumentException('Esta ocorrência já está resolvida.');
        }
        $oc->update([
            'resolvida_em' => now(),
            'resolvida_por' => $user->id,
            'notas_resolucao' => $notas,
        ]);

        return $oc->fresh(['guarda:id,name', 'resolvidaPor:id,name']);
    }

    public function criarPassagem(User $guarda, string $resumo): PassagemTurno
    {
        $dentro = Visita::paraEmpresa($guarda->empresa_gestora_id)->dentroAgora()->count();
        $abertas = OcorrenciaPortaria::where('empresa_gestora_id', $guarda->empresa_gestora_id)
            ->whereNull('resolvida_em')->count();

        return PassagemTurno::create([
            'empresa_gestora_id' => $guarda->empresa_gestora_id,
            'condominio_id' => $guarda->condominio_activo_id,
            'guarda_id' => $guarda->id,
            'resumo' => $resumo,
            'total_dentro' => $dentro,
            'ocorrencias_abertas' => $abertas,
        ]);
    }

    /** @return Collection<PassagemTurno> */
    public function listarPassagens(User $user): Collection
    {
        return PassagemTurno::with(['guarda:id,name'])
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->latest('id')
            ->limit(50)
            ->get();
    }
}
