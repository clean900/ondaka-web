<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Http\Controllers\Api;

use App\Domains\Checklist\Models\ChecklistExecucao;
use App\Domains\Checklist\Models\ChecklistModelo;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;

class ChecklistApiController extends Controller
{
    /** Confirma que a gestora do user tem o add-on checklist activo. */
    private function temAcesso($user): bool
    {
        $emp = $user->empresa_gestora_id ?? null;
        if (! $emp) {
            return false;
        }
        $empresa = EmpresaGestora::find($emp);
        return $empresa && FeatureGate::has($empresa, 'checklist');
    }

    /** Lista as checklists disponíveis para o utilizador (do seu condomínio/gestora). */
    public function disponiveis(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso', 'modelos' => []], 403);
        }
        $empresaGestoraId = $user->empresa_gestora_id;
        $condominioId = $user->condominio_activo_id ?? null;

        $modelos = ChecklistModelo::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->when($condominioId, function ($q) use ($condominioId) {
                // modelos do condomínio do user OU globais (condominio_id null)
                $q->where(function ($w) use ($condominioId) {
                    $w->where('condominio_id', $condominioId)->orWhereNull('condominio_id');
                });
            })
            ->with('itens:id,modelo_id,texto,ordem,obrigatorio')
            ->orderBy('nome')
            ->get(['id', 'nome', 'descricao', 'tipo', 'condominio_id']);

        return response()->json(['modelos' => $modelos]);
    }

    /** Submete uma execução completa (itens respondidos). */
    public function submeter(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $v = $request->validate([
            'modelo_id' => 'required|integer',
            'respostas' => 'required|array',
            'respostas.*.item_id' => 'required|integer',
            'respostas.*.ok' => 'required|boolean',
            'respostas.*.nota' => 'nullable|string|max:500',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        // Confirmar que o modelo pertence à gestora do user
        $modelo = ChecklistModelo::where('empresa_gestora_id', $user->empresa_gestora_id)
            ->where('id', $v['modelo_id'])
            ->firstOrFail();

        // Encontrar turno activo do user (hoje) para associar (opcional)
        $turnoId = DB::table('escala_turnos')
            ->where('user_id', $user->id)
            ->whereDate('data', now()->toDateString())
            ->whereIn('estado', ['agendado', 'em_curso'])
            ->value('id');

        $exec = ChecklistExecucao::create([
            'modelo_id' => $modelo->id,
            'user_id' => $user->id,
            'escala_turno_id' => $turnoId,
            'iniciada_em' => now(),
            'concluida_em' => now(),
            'estado' => 'concluida',
            'respostas' => $v['respostas'],
            'observacoes' => $v['observacoes'] ?? null,
        ]);

        return response()->json(['ok' => true, 'execucao_id' => $exec->id], 201);
    }

    /** Histórico recente de execuções do próprio utilizador. */
    public function minhas(Request $request): JsonResponse
    {
        $user = $request->user();
        $execucoes = ChecklistExecucao::where('user_id', $user->id)
            ->with('modelo:id,nome,tipo')
            ->orderByDesc('iniciada_em')
            ->limit(20)
            ->get(['id', 'modelo_id', 'iniciada_em', 'concluida_em', 'estado']);
        return response()->json(['execucoes' => $execucoes]);
    }
}
