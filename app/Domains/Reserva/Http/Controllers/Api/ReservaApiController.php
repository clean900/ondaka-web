<?php

declare(strict_types=1);

namespace App\Domains\Reserva\Http\Controllers\Api;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Reserva\Models\Reserva;
use App\Domains\Reserva\Models\ReservaEspaco;
use App\Domains\Reserva\Services\ReservaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservaApiController extends Controller
{
    public function __construct(protected ReservaService $service = new ReservaService()) {}

    private function temAcesso($user): bool
    {
        $emp = $user->empresa_gestora_id ?? null;
        if (! $emp) {
            return false;
        }
        $empresa = EmpresaGestora::find($emp);
        return $empresa && FeatureGate::has($empresa, 'reservas_areas_comuns');
    }

    public function espacos(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso', 'espacos' => []], 403);
        }
        $empresaId = $user->empresa_gestora_id;
        $condominioId = $user->condominio_activo_id ?? null;

        $espacos = ReservaEspaco::query()
            ->where('empresa_gestora_id', $empresaId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->when($condominioId, function ($q) use ($condominioId) {
                $q->where(function ($w) use ($condominioId) {
                    $w->where('condominio_id', $condominioId)->orWhereNull('condominio_id');
                });
            })
            ->orderBy('nome')
            ->get([
                'id', 'nome', 'descricao', 'hora_abertura', 'hora_fecho',
                'duracao_min_horas', 'duracao_max_horas',
                'antecedencia_min_horas', 'antecedencia_max_dias',
                'tem_caucao', 'valor_caucao',
            ]);

        return response()->json(['espacos' => $espacos]);
    }

    public function disponibilidade(Request $request, int $espacoId): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso', 'ocupadas' => []], 403);
        }
        $data = $request->input('data');
        if (! $data) {
            return response()->json(['erro' => 'data_obrigatoria'], 422);
        }
        $ocupadas = Reserva::where('espaco_id', $espacoId)
            ->where('data', $data)
            ->whereNotIn('estado', ['recusada', 'cancelada'])
            ->orderBy('hora_inicio')
            ->get(['hora_inicio', 'hora_fim']);

        return response()->json(['ocupadas' => $ocupadas]);
    }

    public function criar(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $v = $request->validate([
            'espaco_id' => 'required|integer',
            'data' => 'required|date_format:Y-m-d',
            'hora_inicio' => 'required',
            'hora_fim' => 'required',
            'motivo' => 'nullable|string|max:255',
        ]);

        $r = $this->service->pedir(
            $user->id,
            $user->condominio_activo_id ?? null,
            (int) $v['espaco_id'],
            $v['data'],
            $v['hora_inicio'],
            $v['hora_fim'],
            $v['motivo'] ?? null,
        );

        if (! $r['ok']) {
            return response()->json(['erro' => $r['erro']], 422);
        }
        return response()->json(['ok' => true, 'reserva_id' => $r['reserva']->id], 201);
    }

    public function comprovativo(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $this->temAcesso($user)) {
            return response()->json(['erro' => 'sem_acesso'], 403);
        }
        $reserva = Reserva::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        if ($reserva->estado !== 'aguarda_caucao') {
            return response()->json(['erro' => 'estado_invalido'], 422);
        }
        $request->validate([
            'ficheiro' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);
        $path = $request->file('ficheiro')->store('comprovativos_caucao', 'public');
        $reserva->update(['comprovativo_caucao' => $path]);
        return response()->json(['ok' => true]);
    }

    public function minhas(Request $request): JsonResponse
    {
        $user = $request->user();
        $reservas = Reserva::where('user_id', $user->id)
            ->with('espaco:id,nome,tem_caucao,valor_caucao')
            ->orderBy('data', 'desc')
            ->orderBy('hora_inicio', 'desc')
            ->limit(50)
            ->get(['id', 'espaco_id', 'data', 'hora_inicio', 'hora_fim', 'estado', 'motivo', 'caucao_paga', 'comprovativo_caucao']);
        return response()->json(['reservas' => $reservas]);
    }
}
