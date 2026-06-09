<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Http\Controllers\Web;

use App\Domains\Checklist\Models\ChecklistExecucao;
use App\Domains\Checklist\Models\ChecklistModelo;
use App\Domains\Checklist\Services\ChecklistService;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistController extends Controller
{
    public function __construct(protected ChecklistService $service = new ChecklistService()) {}

    private const FEATURE_SLUG = 'checklist';

    /** Confirma que a gestora do user tem o add-on activo. */
    private function temAcesso(Request $request): bool
    {
        $emp = $request->user()->empresa_gestora_id ?? null;
        if (! $emp) {
            return false;
        }
        $empresa = EmpresaGestora::find($emp);
        return $empresa && FeatureGate::has($empresa, self::FEATURE_SLUG);
    }

    /** Resolve empresa_gestora_id do user, ou null. */
    private function gestoraId(Request $request): ?int
    {
        return $request->user()->empresa_gestora_id ?? null;
    }

    public function index(Request $request): Response
    {
        if (! $this->temAcesso($request)) {
            return Inertia::render('Checklist/Upgrade', ['feature_slug' => self::FEATURE_SLUG]);
        }
        $emp = $this->gestoraId($request);
        $modelos = ChecklistModelo::query()
            ->where('empresa_gestora_id', $emp)
            ->orderBy('nome')
            ->withCount('itens')
            ->get(['id', 'nome', 'tipo', 'condominio_id', 'activo']);
        return Inertia::render('Checklist/Index', ['modelos' => $modelos]);
    }

    public function create(Request $request): Response
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $condominios = Condominio::where('empresa_gestora_id', $emp)->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Checklist/Form', ['modelo' => null, 'condominios' => $condominios]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $v = $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string|max:255',
            'tipo' => 'required|in:ronda,inspeccao,limpeza,manutencao,outro',
            'condominio_id' => 'nullable|integer',
            'activo' => 'boolean',
            'itens' => 'array',
        ]);
        $this->service->guardarModelo($emp, null, $v, $request->input('itens', []));
        return redirect('/checklist')->with('success', 'Modelo criado.');
    }

    public function edit(Request $request, int $id): Response
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $modelo = ChecklistModelo::where('empresa_gestora_id', $emp)->with('itens')->findOrFail($id);
        $condominios = Condominio::where('empresa_gestora_id', $emp)->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Checklist/Form', ['modelo' => $modelo, 'condominios' => $condominios]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $v = $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string|max:255',
            'tipo' => 'required|in:ronda,inspeccao,limpeza,manutencao,outro',
            'condominio_id' => 'nullable|integer',
            'activo' => 'boolean',
            'itens' => 'array',
        ]);
        $this->service->guardarModelo($emp, $id, $v, $request->input('itens', []));
        return redirect('/checklist')->with('success', 'Modelo actualizado.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $modelo = ChecklistModelo::where('empresa_gestora_id', $emp)->findOrFail($id);
        $modelo->delete();
        return redirect('/checklist')->with('success', 'Modelo apagado.');
    }

    public function execucoes(Request $request): Response
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $execucoes = ChecklistExecucao::query()
            ->whereHas('modelo', fn ($q) => $q->where('empresa_gestora_id', $emp))
            ->with(['modelo:id,nome,tipo'])
            ->orderByDesc('iniciada_em')
            ->limit(50)
            ->get(['id', 'modelo_id', 'user_id', 'iniciada_em', 'concluida_em', 'estado']);
        // Resolver nomes dos users
        $nomes = \DB::table('users')->whereIn('id', $execucoes->pluck('user_id')->unique())->pluck('name', 'id');
        $execucoes->each(fn ($e) => $e->user_nome = $nomes[$e->user_id] ?? ('User #' . $e->user_id));
        return Inertia::render('Checklist/Execucoes', ['execucoes' => $execucoes]);
    }
}
