<?php

declare(strict_types=1);

namespace App\Domains\Nps\Http\Controllers\Web;

use App\Domains\Nps\Models\NpsConfiguracao;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NpsConfiguracaoController extends Controller
{
    /**
     * Super-admin: configura o NPS da PLATAFORMA (global).
     */
    public function plataforma(): Response
    {
        $config = NpsConfiguracao::where('alvo', 'plataforma')->whereNull('empresa_gestora_id')->first();

        return Inertia::render('Admin/Nps/Configuracao', [
            'alvo' => 'plataforma',
            'config' => $config ? [
                'activo' => $config->activo,
                'periodicidade_dias' => $config->periodicidade_dias,
                'pergunta' => $config->pergunta,
                'seguimento' => $config->seguimento,
            ] : NpsConfiguracao::PADRAO['plataforma'],
        ]);
    }

    public function guardarPlataforma(Request $request): RedirectResponse
    {
        $dados = $this->validar($request);

        NpsConfiguracao::updateOrCreate(
            ['alvo' => 'plataforma', 'empresa_gestora_id' => null],
            $dados,
        );

        return back()->with('success', 'Configuração do NPS da plataforma guardada.');
    }

    /**
     * Gestora: configura o NPS do SEU condomínio.
     */
    public function condominio(Request $request): Response
    {
        $gestoraId = $request->user()->empresa_gestora_id;
        $config = NpsConfiguracao::where('alvo', 'condominio')->where('empresa_gestora_id', $gestoraId)->first();

        return Inertia::render('Nps/Configuracao', [
            'alvo' => 'condominio',
            'config' => $config ? [
                'activo' => $config->activo,
                'periodicidade_dias' => $config->periodicidade_dias,
                'pergunta' => $config->pergunta,
                'seguimento' => $config->seguimento,
            ] : NpsConfiguracao::PADRAO['condominio'],
        ]);
    }

    public function guardarCondominio(Request $request): RedirectResponse
    {
        $gestoraId = $request->user()->empresa_gestora_id;
        $dados = $this->validar($request);

        NpsConfiguracao::updateOrCreate(
            ['alvo' => 'condominio', 'empresa_gestora_id' => $gestoraId],
            $dados,
        );

        return back()->with('success', 'Configuração do NPS do condomínio guardada.');
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'activo' => 'required|boolean',
            'periodicidade_dias' => 'required|integer|min:1|max:3650',
            'pergunta' => 'required|string|max:255',
            'seguimento' => 'nullable|string|max:255',
        ]);
    }
}
