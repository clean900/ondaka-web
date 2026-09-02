<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Http\Controllers;

use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página pública do Programa de Afiliados (/afiliados) + candidatura.
 */
class AfiliadoPublicoController extends Controller
{
    public function __construct(
        protected AfiliadoService $service,
        protected AfiliadoConfigService $config,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Afiliados/Landing', [
            'config' => $this->config->publico(),
            'autenticado' => (bool) $user,
            'ja_afiliado' => (bool) $this->service->doUser($user),
            'exemplo' => $this->exemplo(),
        ]);
    }

    /** Exemplo ilustrativo: cliente com 50 imóveis, 12 meses, sem descontos. */
    private function exemplo(): array
    {
        $preco = (float) (DB::table('plataforma_config')->where('chave', 'preco_base_imovel_mes')->value('valor') ?? 1850);
        $imoveis = 50;
        $meses = 12;
        $base = round($preco * $imoveis * $meses, 2);
        $comissoes = [];
        foreach ($this->config->niveis() as $n) {
            $comissoes[$n['nivel']] = number_format(round($base * ((float) $n['taxa_pct']) / 100, 2), 2, '.', '');
        }

        return [
            'preco_imovel_mes' => number_format($preco, 2, '.', ''),
            'imoveis' => $imoveis,
            'meses' => $meses,
            'base_kz' => number_format($base, 2, '.', ''),
            'comissoes' => $comissoes,
        ];
    }

    public function candidatar(Request $request): RedirectResponse
    {
        if (! $this->config->programaActivo()) {
            return back()->with('error', 'O programa de afiliados não está a aceitar candidaturas de momento.');
        }
        if ($request->user()) {
            return redirect()->route('afiliado.aderir');
        }

        $dados = $request->validate([
            'nome' => 'required|string|min:3|max:150',
            'tipo' => 'required|in:particular,empresa',
            'nif' => 'nullable|string|max:30',
            'email' => 'required|email|max:150|unique:users,email',
            'telefone' => 'required|string|max:30',
            'como_divulga' => 'nullable|string|max:1000',
            'password' => 'required|string|min:8|confirmed',
            'aceita_termos' => 'required|accepted',
        ], [
            'nome.required' => 'Indique o seu nome (ou o da empresa).',
            'email.unique' => 'Já existe uma conta com este email. Entre na plataforma e adira ao programa no menu "Programa de Afiliados".',
            'telefone.required' => 'Indique um telefone de contacto.',
            'password.min' => 'A password deve ter pelo menos 8 caracteres.',
            'password.confirmed' => 'As passwords não coincidem.',
            'aceita_termos.accepted' => 'Deve aceitar as regras do programa.',
        ]);

        $afiliado = $this->service->candidatar($dados);

        Auth::login($afiliado->user);
        $request->session()->regenerate();

        return redirect()->route('afiliado.index')->with('success', $afiliado->estaActivo()
            ? "Conta de afiliado criada e activa! O seu código é {$afiliado->codigo}."
            : 'Candidatura recebida! Vamos analisar e avisamos por email assim que estiver aprovada.');
    }
}
