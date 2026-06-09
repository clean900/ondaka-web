<?php

namespace App\Domains\Turnos\Http\Controllers\Web;

use App\Domains\Turnos\Models\EscalaTurno;
use App\Domains\Turnos\Models\TurnoModelo;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EscalaController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $role = $user->getRoleNames()->first();
        $isAdmin = in_array($role, ['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio']);

        // Filtro de data (semana actual por defeito)
        $semanaInicio = $request->input('semana')
            ? Carbon::parse($request->semana)->startOfWeek()
            : now()->startOfWeek();
        $semanaFim = $semanaInicio->copy()->endOfWeek();

        $query = EscalaTurno::paraEmpresa($empresaId)
            ->with(['turnoModelo:id,nome,cor_hex', 'user:id,name', 'condominio:id,nome'])
            ->whereBetween('data', [$semanaInicio->toDateString(), $semanaFim->toDateString()])
            ->orderBy('data')
            ->orderBy('inicio_previsto');

        // Funcionário só vê os seus
        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        $escalas = $query->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'data' => $e->data->toDateString(),
                'data_label' => $e->data->translatedFormat('D, d M'),
                'inicio_previsto' => $e->inicio_previsto->toIso8601String(),
                'fim_previsto' => $e->fim_previsto->toIso8601String(),
                'hora_inicio' => $e->inicio_previsto->format('H:i'),
                'hora_fim' => $e->fim_previsto->format('H:i'),
                'estado' => $e->estado,
                'turno' => $e->turnoModelo ? ['id' => $e->turnoModelo->id, 'nome' => $e->turnoModelo->nome, 'cor_hex' => $e->turnoModelo->cor_hex] : null,
                'user' => $e->user ? ['id' => $e->user->id, 'name' => $e->user->name] : null,
                'condominio' => $e->condominio ? ['id' => $e->condominio->id, 'nome' => $e->condominio->nome] : null,
                'observacoes' => $e->observacoes,
            ];
        });

        // Dados auxiliares (turnos modelo + users escaláveis)
        $turnosModelo = TurnoModelo::paraEmpresa($empresaId)->ativos()->orderBy('ordem')->get(['id', 'nome', 'hora_inicio', 'hora_fim', 'cor_hex']);

        $usersEscalaveis = collect();
        if ($isAdmin) {
            $rolesEscalaveis = ['admin-empresa', 'gestor', 'administrador-condominio', 'funcionario', 'guarda'];
            $usersEscalaveis = User::where('empresa_gestora_id', $empresaId)
                ->whereHas('roles', fn ($q) => $q->whereIn('name', $rolesEscalaveis))
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Inertia::render('Turnos/Escala', [
            'escalas' => $escalas,
            'turnos_modelo' => $turnosModelo,
            'users_escalaveis' => $usersEscalaveis,
            'semana_inicio' => $semanaInicio->toDateString(),
            'semana_fim' => $semanaFim->toDateString(),
            'is_admin' => $isAdmin,
        ]);
    }

    public function criar(Request $request): RedirectResponse
    {
        $request->validate([
            'turno_modelo_id' => 'required|exists:turnos_modelo,id',
            'user_id' => 'required|exists:users,id',
            'condominio_id' => 'nullable|exists:condominios,id',
            'datas' => 'required|array|min:1',
            'datas.*' => 'date',
            'observacoes' => 'nullable|string',
        ]);

        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $turno = TurnoModelo::where('id', $request->turno_modelo_id)->where('empresa_gestora_id', $empresaId)->firstOrFail();

        $criadas = 0;
        foreach ($request->datas as $dataStr) {
            $data = Carbon::parse($dataStr);
            $inicio = $data->copy()->setTimeFromTimeString($turno->hora_inicio);
            $fim = $data->copy()->setTimeFromTimeString($turno->hora_fim);
            if ($turno->atravessa_meia_noite) {
                $fim->addDay();
            }

            EscalaTurno::create([
                'empresa_gestora_id' => $empresaId,
                'condominio_id' => $request->condominio_id,
                'turno_modelo_id' => $turno->id,
                'user_id' => $request->user_id,
                'data' => $data->toDateString(),
                'inicio_previsto' => $inicio,
                'fim_previsto' => $fim,
                'estado' => 'agendado',
                'criado_por_user_id' => $user->id,
                'observacoes' => $request->observacoes,
            ]);
            $criadas++;
        }

        return back()->with('success', "{$criadas} " . ($criadas === 1 ? 'escala criada' : 'escalas criadas') . '.');
    }

    public function eliminar(Request $request, int $id): RedirectResponse
    {
        $e = EscalaTurno::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();
        $e->delete();
        return back()->with('success', 'Escala removida.');
    }
}
