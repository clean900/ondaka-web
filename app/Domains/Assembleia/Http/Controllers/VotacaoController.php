<?php

namespace App\Domains\Assembleia\Http\Controllers;

use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Assembleia\Models\AssembleiaParticipante;
use App\Domains\Assembleia\Models\AssembleiaPontoVotacao;
use App\Domains\Assembleia\Services\VotacaoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VotacaoController extends Controller
{
    public function __construct(protected VotacaoService $service) {}

    /**
     * Detectar automaticamente pontos deliberativos na ordem do dia.
     */
    public function detectar(Assembleia $assembleia): RedirectResponse
    {
        $this->autorizar($assembleia);

        try {
            $resultado = $this->service->detectarPontosDeliberativos($assembleia);

            if ($resultado['ja_existiam']) {
                return back()->with('info', 'Pontos de votação já existem para esta assembleia.');
            }

            $msg = "Detectados {$resultado['detectados']} pontos deliberativos automaticamente.";
            if (count($resultado['pontos_ambiguos']) > 0) {
                $msg .= " " . count($resultado['pontos_ambiguos']) . " pontos ambíguos precisam de revisão manual.";
            }

            return back()->with('success', $msg);
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: ' . $e->getMessage());
        }
    }

    /**
     * Criar ponto de votação manualmente.
     */
    public function criarManual(Assembleia $assembleia, Request $request): RedirectResponse
    {
        $this->autorizar($assembleia);

        $validated = $request->validate([
            'titulo' => 'required|string|max:300',
            'descricao' => 'nullable|string|max:2000',
        ]);

        try {
            $this->service->criarPontoManual($assembleia, $validated['titulo'], $validated['descricao'] ?? null);
            return back()->with('success', 'Ponto de votação criado.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: ' . $e->getMessage());
        }
    }

    /**
     * Abrir votação (gestor durante assembleia).
     */
    public function abrir(AssembleiaPontoVotacao $ponto): RedirectResponse
    {
        $this->autorizar($ponto->assembleia);

        try {
            $this->service->abrirVotacao($ponto, Auth::id());
            return back()->with('success', 'Votação aberta. Participantes podem votar agora.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: ' . $e->getMessage());
        }
    }

    /**
     * Votar (participante).
     */
    public function votar(AssembleiaPontoVotacao $ponto, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'opcao' => 'required|in:sim,nao,abstencao',
        ]);

        $userId = Auth::id();
        $assembleia = $ponto->assembleia;

        // Localizar participante do user actual
        $participante = $assembleia->participantes()
            ->whereHas('condomino', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->first();

        if (! $participante) {
            return back()->with('error', 'Não és participante desta assembleia.');
        }

        try {
            $this->service->registarVoto($ponto, $participante, $validated['opcao']);
            return back()->with('success', 'Voto registado.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: ' . $e->getMessage());
        }
    }

    /**
     * Fechar votação.
     */
    public function fechar(AssembleiaPontoVotacao $ponto): RedirectResponse
    {
        $this->autorizar($ponto->assembleia);

        try {
            $ponto = $this->service->fecharVotacao($ponto, Auth::id());
            $resultadoLabel = match ($ponto->resultado) {
                'aprovado' => 'APROVADO',
                'rejeitado' => 'REJEITADO',
                'empate' => 'EMPATE',
                default => strtoupper($ponto->resultado ?? ''),
            };
            return back()->with('success', "Votação encerrada: {$resultadoLabel}.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha: ' . $e->getMessage());
        }
    }

    /**
     * Autorização: apenas gestor da empresa que detém a assembleia.
     */
    protected function autorizar(Assembleia $assembleia): void
    {
        $user = Auth::user();

        if (! $user) {
            abort(401);
        }

        // Super-admin acede a tudo
        if (method_exists($user, 'hasRole') && $user->hasRole('super-admin')) {
            return;
        }

        // Gestor/admin da empresa gestora
        $empresa = $user->empresaGestora;
        if ($empresa && $empresa->id === $assembleia->empresa_gestora_id) {
            return;
        }

        abort(403, 'Sem permissão para gerir votações desta assembleia.');
    }
}
