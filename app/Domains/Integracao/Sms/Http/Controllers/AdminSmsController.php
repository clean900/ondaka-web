<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Http\Controllers;

use App\Domains\Integracao\Sms\Models\SmsLog;
use App\Domains\Integracao\Sms\Services\SmsService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSmsController extends Controller
{
    public function __construct(
        protected SmsService $smsService,
    ) {}

    public function index(Request $request): Response
    {
        $query = SmsLog::query()->with('user:id,name,email');

        if ($estado = $request->string('estado')->toString()) {
            $query->where('estado', $estado);
        }
        if ($categoria = $request->string('categoria')->toString()) {
            $query->where('categoria', $categoria);
        }
        if ($trigger = $request->string('trigger')->toString()) {
            $query->where('trigger', $trigger);
        }
        if ($q = $request->string('q')->toString()) {
            $query->where(function ($qb) use ($q) {
                $qb->where('numero_mascarado', 'like', "%{$q}%")
                    ->orWhere('mensagem', 'like', "%{$q}%")
                    ->orWhere('provider_id', 'like', "%{$q}%")
                    ->orWhere('trigger', 'like', "%{$q}%");
            });
        }
        if ($periodo = $request->string('periodo')->toString()) {
            $dias = match ($periodo) {
                'hoje' => 0,
                '7d' => 7,
                '30d' => 30,
                '90d' => 90,
                default => null,
            };
            if ($dias !== null) {
                $query->where('created_at', '>=', now()->subDays($dias)->startOfDay());
            }
        }

        $logs = $query->orderByDesc('id')->paginate(25)->withQueryString();

        // Contadores
        $hoje = SmsLog::whereDate('created_at', today());
        $ultimas24h = SmsLog::where('created_at', '>=', now()->subDay());

        $enviadosHoje = (clone $hoje)->where('estado', 'enviado')->count();
        $falhasHoje = (clone $hoje)->whereIn('estado', ['falhado', 'rejeitado'])->count();
        $totalHoje = (clone $hoje)->count();
        $taxaSucesso24h = 0;
        $total24h = (clone $ultimas24h)->count();
        if ($total24h > 0) {
            $sucesso24h = (clone $ultimas24h)->where('estado', 'enviado')->count();
            $taxaSucesso24h = round(($sucesso24h / $total24h) * 100, 1);
        }

        // Saldo TelcoSMS
        $saldoProvider = null;
        try {
            $saldoProvider = $this->smsService->saldoProvider();
        } catch (\Throwable) {
            // ignora
        }

        return Inertia::render('Admin/Sms/Index', [
            'logs' => [
                'data' => $logs->items(),
                'links' => $logs->linkCollection(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ],
            'contadores' => [
                'enviados_hoje' => $enviadosHoje,
                'falhas_hoje' => $falhasHoje,
                'total_hoje' => $totalHoje,
                'taxa_sucesso_24h' => $taxaSucesso24h,
                'saldo_provider' => $saldoProvider,
            ],
            'filtros' => [
                'q' => $request->string('q')->toString(),
                'estado' => $request->string('estado')->toString(),
                'categoria' => $request->string('categoria')->toString(),
                'trigger' => $request->string('trigger')->toString(),
                'periodo' => $request->string('periodo')->toString() ?: '7d',
            ],
        ]);
    }

    public function show(SmsLog $smsLog): Response
    {
        $smsLog->load(['user:id,name,email', 'owner', 'featureSubscription', 'ordemCompra:id,numero']);

        return Inertia::render('Admin/Sms/Show', [
            'log' => [
                'id' => $smsLog->id,
                'numero_mascarado' => $smsLog->numero_mascarado,
                'numero_destinatario' => $smsLog->numero_destinatario,
                'mensagem' => $smsLog->mensagem,
                'tamanho_chars' => $smsLog->tamanho_chars,
                'segmentos' => $smsLog->segmentos,
                'categoria' => $smsLog->categoria,
                'categoria_label' => $smsLog->categoria_label,
                'trigger' => $smsLog->trigger,
                'estado' => $smsLog->estado,
                'estado_label' => $smsLog->estado_label,
                'erro_mensagem' => $smsLog->erro_mensagem,
                'provider' => $smsLog->provider,
                'provider_id' => $smsLog->provider_id,
                'saldo_provider_apos' => $smsLog->saldo_provider_apos,
                'tentativas' => $smsLog->tentativas,
                'creditos_consumidos_cliente' => $smsLog->creditos_consumidos_cliente,
                'saldo_devolvido' => $smsLog->saldo_devolvido,
                'enviado_em' => $smsLog->enviado_em?->toIso8601String(),
                'falhado_em' => $smsLog->falhado_em?->toIso8601String(),
                'created_at' => $smsLog->created_at->toIso8601String(),
                'user' => $smsLog->user ? [
                    'id' => $smsLog->user->id,
                    'name' => $smsLog->user->name,
                    'email' => $smsLog->user->email,
                ] : null,
                'owner' => $smsLog->owner ? [
                    'type' => class_basename($smsLog->owner_type),
                    'id' => $smsLog->owner_id,
                    'nome' => $smsLog->owner->nome ?? $smsLog->owner->name ?? '—',
                ] : null,
                'ordem' => $smsLog->ordemCompra ? [
                    'id' => $smsLog->ordemCompra->id,
                    'numero' => $smsLog->ordemCompra->numero,
                ] : null,
                'resposta_bruta' => $smsLog->resposta_bruta,
            ],
        ]);
    }

    /**
     * Reenviar SMS falhado usando a conta sistema (não consome saldo cliente).
     */
    public function reenviar(SmsLog $smsLog): RedirectResponse
    {
        if (! in_array($smsLog->estado, ['falhado', 'rejeitado'])) {
            return back()->with('error', 'Apenas mensagens falhadas podem ser reenviadas.');
        }

        try {
            $this->smsService->enviarSistema(
                $smsLog->numero_destinatario,
                $smsLog->mensagem,
                [
                    'trigger' => 'reenvio_manual',
                    'categoria' => 'manual_admin',
                    'reenvio_de' => $smsLog->id,
                ],
            );

            return back()->with('success', 'SMS reenviado com sucesso.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha ao reenviar: '.$e->getMessage());
        }
    }
}
