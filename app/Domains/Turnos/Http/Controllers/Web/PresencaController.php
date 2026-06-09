<?php

namespace App\Domains\Turnos\Http\Controllers\Web;

use App\Domains\Turnos\Models\EscalaTurno;
use App\Domains\Turnos\Models\RegistoPresenca;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PresencaController extends Controller
{
    /**
     * Página do funcionário: ver estado actual e botão checkin/checkout.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        // Presença em curso (checkout_em NULL)
        $emCurso = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->with(['escala.turnoModelo', 'escala.condominio'])
            ->latest()
            ->first();

        // Escalas do dia
        $hoje = now()->toDateString();
        $escalasHoje = EscalaTurno::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->where('data', $hoje)
            ->with(['turnoModelo:id,nome,cor_hex,hora_inicio,hora_fim', 'condominio:id,nome'])
            ->orderBy('inicio_previsto')
            ->get();

        // Histórico recente (10 últimos)
        $historico = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->whereNotNull('checkout_em')
            ->with(['escala.turnoModelo:id,nome', 'condominio:id,nome'])
            ->latest('checkin_em')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'checkin_em' => $r->checkin_em->toIso8601String(),
                    'checkout_em' => $r->checkout_em?->toIso8601String(),
                    'data_label' => $r->checkin_em->translatedFormat('d M Y'),
                    'hora_checkin' => $r->checkin_em->format('H:i'),
                    'hora_checkout' => $r->checkout_em?->format('H:i'),
                    'horas_trabalhadas' => (float) $r->horas_trabalhadas,
                    'turno_nome' => $r->escala?->turnoModelo?->nome,
                    'condominio_nome' => $r->condominio?->nome,
                ];
            });

        return Inertia::render('Turnos/Presenca', [
            'em_curso' => $emCurso ? [
                'id' => $emCurso->id,
                'checkin_em' => $emCurso->checkin_em->toIso8601String(),
                'turno_nome' => $emCurso->escala?->turnoModelo?->nome,
                'condominio_nome' => $emCurso->escala?->condominio?->nome,
            ] : null,
            'escalas_hoje' => $escalasHoje->map(fn ($e) => [
                'id' => $e->id,
                'turno' => $e->turnoModelo ? ['nome' => $e->turnoModelo->nome, 'cor_hex' => $e->turnoModelo->cor_hex] : null,
                'inicio_previsto' => $e->inicio_previsto->toIso8601String(),
                'fim_previsto' => $e->fim_previsto->toIso8601String(),
                'hora_inicio' => $e->inicio_previsto->format('H:i'),
                'hora_fim' => $e->fim_previsto->format('H:i'),
                'estado' => $e->estado,
                'condominio_nome' => $e->condominio?->nome,
            ]),
            'historico' => $historico,
        ]);
    }

    public function checkin(Request $request): RedirectResponse
    {
        $request->validate([
            'escala_turno_id' => 'nullable|exists:escala_turnos,id',
            'observacoes' => 'nullable|string',
        ]);

        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        // Verificar se já há check-in em curso
        $emCurso = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->exists();

        if ($emCurso) {
            return back()->with('error', 'Já tem um check-in em curso. Faça check-out primeiro.');
        }

        $escala = null;
        $condominioId = null;
        if ($request->escala_turno_id) {
            $escala = EscalaTurno::paraEmpresa($empresaId)
                ->where('user_id', $user->id)
                ->where('id', $request->escala_turno_id)
                ->first();
            if ($escala) {
                $condominioId = $escala->condominio_id;
                $escala->update(['estado' => 'em_curso']);
            }
        }

        RegistoPresenca::create([
            'empresa_gestora_id' => $empresaId,
            'escala_turno_id' => $escala?->id,
            'user_id' => $user->id,
            'condominio_id' => $condominioId,
            'checkin_em' => now(),
            'observacoes_checkin' => $request->observacoes,
            'ip_checkin' => $request->ip(),
        ]);

        return back()->with('success', 'Check-in registado.');
    }

    public function checkout(Request $request): RedirectResponse
    {
        $request->validate([
            'observacoes' => 'nullable|string',
        ]);

        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        $r = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->latest('checkin_em')
            ->first();

        if (!$r) {
            return back()->with('error', 'Sem check-in em curso.');
        }

        $agora = now();
        $minutos = $r->checkin_em->diffInMinutes($agora);
        $horas = round($minutos / 60, 2);

        $r->update([
            'checkout_em' => $agora,
            'horas_trabalhadas' => $horas,
            'observacoes_checkout' => $request->observacoes,
            'ip_checkout' => $request->ip(),
        ]);

        if ($r->escala_turno_id) {
            $escala = EscalaTurno::find($r->escala_turno_id);
            if ($escala) {
                $escala->update(['estado' => 'concluido']);
            }
        }

        return back()->with('success', "Check-out registado. Horas trabalhadas: {$horas}h.");
    }

    /**
     * Relatório de horas (admin vê tudo, funcionário vê só os seus).
     */
    public function relatorio(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $role = $user->getRoleNames()->first();
        $isAdmin = in_array($role, ['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio']);

        $mes = $request->input('mes', now()->format('Y-m'));
        try {
            $inicioMes = Carbon::createFromFormat('Y-m', $mes)->startOfMonth();
        } catch (\Exception $e) {
            $inicioMes = now()->startOfMonth();
        }
        $fimMes = $inicioMes->copy()->endOfMonth();

        $query = RegistoPresenca::paraEmpresa($empresaId)
            ->whereNotNull('checkout_em')
            ->whereBetween('checkin_em', [$inicioMes, $fimMes])
            ->with(['user:id,name', 'condominio:id,nome']);

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        $registos = $query->latest('checkin_em')->get();

        // Sumário por user
        $porUser = $registos->groupBy('user_id')->map(function ($grupo) {
            $totalHoras = $grupo->sum('horas_trabalhadas');
            $primeiro = $grupo->first();
            return [
                'user_id' => $primeiro->user_id,
                'user_nome' => $primeiro->user?->name ?? '—',
                'total_horas' => round((float) $totalHoras, 2),
                'total_registos' => $grupo->count(),
            ];
        })->values();

        return Inertia::render('Turnos/Relatorio', [
            'registos' => $registos->map(fn ($r) => [
                'id' => $r->id,
                'user_nome' => $r->user?->name ?? '—',
                'data' => $r->checkin_em->toDateString(),
                'data_label' => $r->checkin_em->translatedFormat('d M'),
                'hora_checkin' => $r->checkin_em->format('H:i'),
                'hora_checkout' => $r->checkout_em?->format('H:i'),
                'horas_trabalhadas' => (float) $r->horas_trabalhadas,
                'condominio_nome' => $r->condominio?->nome,
            ]),
            'por_user' => $porUser,
            'mes' => $inicioMes->format('Y-m'),
            'is_admin' => $isAdmin,
        ]);
    }
    /**
     * GET /api/turnos/presenca
     */
    public function apiIndex(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $emCurso = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->with(['escala.turnoModelo', 'escala.condominio'])
            ->latest()
            ->first();
        $hoje = now()->toDateString();
        $escalasHoje = EscalaTurno::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->where('data', $hoje)
            ->with(['turnoModelo:id,nome,cor_hex,hora_inicio,hora_fim', 'condominio:id,nome'])
            ->orderBy('inicio_previsto')
            ->get();
        $historico = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->whereNotNull('checkout_em')
            ->with(['escala.turnoModelo:id,nome', 'condominio:id,nome'])
            ->latest('checkin_em')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'checkin_em' => $r->checkin_em->toIso8601String(),
                    'checkout_em' => $r->checkout_em?->toIso8601String(),
                    'data_label' => $r->checkin_em->translatedFormat('d M Y'),
                    'hora_checkin' => $r->checkin_em->format('H:i'),
                    'hora_checkout' => $r->checkout_em?->format('H:i'),
                    'horas_trabalhadas' => (float) $r->horas_trabalhadas,
                    'turno_nome' => $r->escala?->turnoModelo?->nome,
                    'condominio_nome' => $r->condominio?->nome,
                ];
            });
        return response()->json([
            'em_curso' => $emCurso ? [
                'id' => $emCurso->id,
                'checkin_em' => $emCurso->checkin_em->toIso8601String(),
                'turno_nome' => $emCurso->escala?->turnoModelo?->nome,
                'condominio_nome' => $emCurso->escala?->condominio?->nome,
            ] : null,
            'escalas_hoje' => $escalasHoje->map(fn ($e) => [
                'id' => $e->id,
                'turno' => $e->turnoModelo ? ['nome' => $e->turnoModelo->nome, 'cor_hex' => $e->turnoModelo->cor_hex] : null,
                'inicio_previsto' => $e->inicio_previsto->toIso8601String(),
                'fim_previsto' => $e->fim_previsto->toIso8601String(),
                'hora_inicio' => $e->inicio_previsto->format('H:i'),
                'hora_fim' => $e->fim_previsto->format('H:i'),
                'estado' => $e->estado,
                'condominio_nome' => $e->condominio?->nome,
            ])->values(),
            'historico' => $historico,
        ]);
    }
    /**
     * POST /api/turnos/presenca/checkin
     */
    public function apiCheckin(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'escala_turno_id' => 'nullable|exists:escala_turnos,id',
            'observacoes' => 'nullable|string',
        ]);
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $emCurso = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->exists();
        if ($emCurso) {
            return response()->json(['message' => 'Ja tem um check-in em curso. Faca check-out primeiro.'], 422);
        }
        $escala = null;
        $condominioId = null;
        if ($request->escala_turno_id) {
            $escala = EscalaTurno::paraEmpresa($empresaId)
                ->where('user_id', $user->id)
                ->where('id', $request->escala_turno_id)
                ->first();
            if ($escala) {
                $condominioId = $escala->condominio_id;
                $escala->update(['estado' => 'em_curso']);
            }
        }
        $r = RegistoPresenca::create([
            'empresa_gestora_id' => $empresaId,
            'escala_turno_id' => $escala?->id,
            'user_id' => $user->id,
            'condominio_id' => $condominioId,
            'checkin_em' => now(),
            'observacoes_checkin' => $request->observacoes,
            'ip_checkin' => $request->ip(),
        ]);
        return response()->json([
            'message' => 'Check-in registado.',
            'data' => [
                'id' => $r->id,
                'checkin_em' => $r->checkin_em->toIso8601String(),
            ],
        ], 201);
    }
    /**
     * POST /api/turnos/presenca/checkout
     */
    public function apiCheckout(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'observacoes' => 'nullable|string',
        ]);
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $r = RegistoPresenca::paraEmpresa($empresaId)
            ->where('user_id', $user->id)
            ->emCurso()
            ->latest('checkin_em')
            ->first();
        if (! $r) {
            return response()->json(['message' => 'Sem check-in em curso.'], 422);
        }
        $agora = now();
        $minutos = $r->checkin_em->diffInMinutes($agora);
        $horas = round($minutos / 60, 2);
        $r->update([
            'checkout_em' => $agora,
            'horas_trabalhadas' => $horas,
            'observacoes_checkout' => $request->observacoes,
            'ip_checkout' => $request->ip(),
        ]);
        if ($r->escala_turno_id) {
            $escala = EscalaTurno::find($r->escala_turno_id);
            if ($escala) {
                $escala->update(['estado' => 'concluido']);
            }
        }
        return response()->json([
            'message' => 'Check-out registado.',
            'data' => [
                'id' => $r->id,
                'horas_trabalhadas' => $horas,
                'checkout_em' => $agora->toIso8601String(),
            ],
        ]);
    }
    /**
     * GET /api/turnos/relatorio
     */
    public function apiRelatorio(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;
        $role = $user->getRoleNames()->first();
        $isAdmin = in_array($role, ['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio']);
        $mes = $request->input('mes', now()->format('Y-m'));
        try {
            $inicioMes = Carbon::createFromFormat('Y-m', $mes)->startOfMonth();
        } catch (\Exception $e) {
            $inicioMes = now()->startOfMonth();
        }
        $fimMes = $inicioMes->copy()->endOfMonth();
        $query = RegistoPresenca::paraEmpresa($empresaId)
            ->whereNotNull('checkout_em')
            ->whereBetween('checkin_em', [$inicioMes, $fimMes])
            ->with(['user:id,name', 'condominio:id,nome']);
        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        }
        $registos = $query->latest('checkin_em')->get();
        $porUser = $registos->groupBy('user_id')->map(function ($grupo) {
            $totalHoras = $grupo->sum('horas_trabalhadas');
            $primeiro = $grupo->first();
            return [
                'user_id' => $primeiro->user_id,
                'user_nome' => $primeiro->user?->name ?? '—',
                'total_horas' => round((float) $totalHoras, 2),
                'total_registos' => $grupo->count(),
            ];
        })->values();
        return response()->json([
            'registos' => $registos->map(fn ($r) => [
                'id' => $r->id,
                'user_nome' => $r->user?->name ?? '—',
                'data' => $r->checkin_em->toDateString(),
                'data_label' => $r->checkin_em->translatedFormat('d M'),
                'hora_checkin' => $r->checkin_em->format('H:i'),
                'hora_checkout' => $r->checkout_em?->format('H:i'),
                'horas_trabalhadas' => (float) $r->horas_trabalhadas,
                'condominio_nome' => $r->condominio?->nome,
            ]),
            'por_user' => $porUser,
            'mes' => $inicioMes->format('Y-m'),
            'is_admin' => $isAdmin,
        ]);
    }
}
