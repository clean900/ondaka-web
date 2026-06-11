<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Http\Controllers;

use App\Domains\Integracao\Sms\Models\SmsSenderConfig;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsSenderAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $configs = SmsSenderConfig::query()
            ->with('condominio:id,nome')
            ->orderByRaw("FIELD(estado, 'pendente', 'configurado')")
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (SmsSenderConfig $c) {
                return [
                    'id' => $c->id,
                    'condominio_id' => $c->condominio_id,
                    'condominio_nome' => $c->condominio?->nome ?? '—',
                    'sender_name' => $c->sender_name,
                    'estado' => $c->estado,
                    'tem_key' => ! empty($c->api_key),
                    'actualizado_em' => $c->updated_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Admin/SmsSender/Index', [
            'configs' => $configs,
        ]);
    }

    public function configurar(Request $request, SmsSenderConfig $config): RedirectResponse
    {
        $dados = $request->validate([
            'api_key' => 'required|string|min:8|max:255',
        ]);

        $config->update([
            'api_key' => trim($dados['api_key']),
            'estado' => 'configurado',
        ]);

        return back()->with('success', "Sender ID \"{$config->sender_name}\" configurado com sucesso.");
    }

    public function reverter(Request $request, SmsSenderConfig $config): RedirectResponse
    {
        $config->update([
            'api_key' => null,
            'estado' => 'pendente',
        ]);

        return back()->with('success', "Sender ID \"{$config->sender_name}\" revertido para pendente.");
    }
}
