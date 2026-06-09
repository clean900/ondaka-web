<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Services;

use App\Domains\Checklist\Models\ChecklistModelo;
use Illuminate\Support\Facades\DB;

class ChecklistService
{
    /**
     * Cria ou actualiza um modelo com os seus itens (em transacção).
     * $itens = [['texto' => '...', 'ordem' => N, 'obrigatorio' => bool], ...]
     */
    public function guardarModelo(int $empresaGestoraId, ?int $id, array $dados, array $itens): ChecklistModelo
    {
        return DB::transaction(function () use ($empresaGestoraId, $id, $dados, $itens) {
            $payload = [
                'empresa_gestora_id' => $empresaGestoraId,
                'condominio_id' => $dados['condominio_id'] ?? null,
                'nome' => $dados['nome'],
                'descricao' => $dados['descricao'] ?? null,
                'tipo' => $dados['tipo'] ?? 'ronda',
                'activo' => (bool) ($dados['activo'] ?? true),
            ];

            if ($id) {
                $modelo = ChecklistModelo::where('empresa_gestora_id', $empresaGestoraId)->findOrFail($id);
                $modelo->update($payload);
                $modelo->itens()->delete();
            } else {
                $modelo = ChecklistModelo::create($payload);
            }

            foreach (array_values($itens) as $i => $it) {
                $texto = trim((string) ($it['texto'] ?? ''));
                if ($texto === '') {
                    continue;
                }
                $modelo->itens()->create([
                    'texto' => $texto,
                    'ordem' => (int) ($it['ordem'] ?? ($i + 1)),
                    'obrigatorio' => (bool) ($it['obrigatorio'] ?? true),
                ]);
            }

            return $modelo->load('itens');
        });
    }
}
