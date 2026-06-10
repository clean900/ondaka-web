<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Http\Controllers\Web;

use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Integracao\Sms\Models\SmsSenderConfig;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SmsSenderConfigController extends Controller
{
    /**
     * Pagina de configuracao do Sender ID personalizado.
     * Lista os condominios da empresa gestora com o nome de remetente de cada.
     */
    public function index(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');

        // So acessivel se a feature sms_sender_id estiver activa para a empresa
        $featureActiva = $empresa ? FeatureGate::has($empresa, 'sms_sender_id') : false;

        $condominios = [];
        if ($empresa) {
            $configs = SmsSenderConfig::query()
                ->whereIn('condominio_id', $empresa->condominios()->pluck('id'))
                ->get()
                ->keyBy('condominio_id');

            foreach ($empresa->condominios()->orderBy('nome')->get() as $cond) {
                $cfg = $configs->get($cond->id);
                $condominios[] = [
                    'id' => $cond->id,
                    'nome' => $cond->nome,
                    'sender_name' => $cfg?->sender_name,
                    'estado' => $cfg?->estado ?? 'sem_config',
                ];
            }
        }

        return Inertia::render('Configuracoes/SmsSender', [
            'featureActiva' => $featureActiva,
            'condominios' => $condominios,
        ]);
    }

    /**
     * Guarda o nome de remetente escolhido para um condominio (estado pendente).
     */
    public function guardar(Request $request): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        if (! $empresa) {
            return back()->with('error', 'Empresa nao identificada.');
        }

        $dados = $request->validate([
            'condominio_id' => 'required|integer',
            'sender_name' => 'required|string|max:11|regex:/^[A-Za-z0-9 ]+$/',
        ]);

        // Garantir que o condominio pertence a empresa do gestor (tenancy)
        $pertence = $empresa->condominios()->where('id', $dados['condominio_id'])->exists();
        if (! $pertence) {
            return back()->with('error', 'Condominio invalido.');
        }

        SmsSenderConfig::updateOrCreate(
            ['condominio_id' => $dados['condominio_id']],
            [
                'sender_name' => strtoupper(trim($dados['sender_name'])),
                'estado' => 'pendente',
            ]
        );

        return back()->with('success', 'Nome de remetente guardado. A aguardar configuracao pela equipa ONDAKA.');
    }
}
