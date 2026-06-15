<?php

declare(strict_types=1);

namespace App\Domains\Financas\Http\Controllers;

use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\Despesa;
use App\Domains\Financas\Models\DespesaCategoria;
use App\Domains\Financas\Services\DespesaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DespesaController extends Controller
{
    public function __construct(protected DespesaService $service) {}

    public function index(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa, 403, 'Empresa não identificada.');

        $this->service->garantirCategoriasPadrao($empresa->id);

        $estado = $request->string('estado')->toString() ?: null;
        $tipo = $request->string('tipo')->toString() ?: null;
        $categoriaId = $request->integer('categoria_id') ?: null;
        $condominioId = $request->integer('condominio_id') ?: null;

        $query = Despesa::query()
            ->with(['categoria:id,nome,cor,icone', 'condominio:id,nome', 'contaBancaria:id,nome,banco', 'criadaPor:id,name', 'aprovadaPor:id,name', 'pagaPor:id,name'])
            ->where('empresa_gestora_id', $empresa->id)
            ->orderByDesc('data_despesa')
            ->orderByDesc('id');

        if ($estado) {
            $query->where('estado', $estado);
        }
        if ($tipo) {
            $query->where('tipo', $tipo);
        }
        if ($categoriaId) {
            $query->where('categoria_id', $categoriaId);
        }
        if ($condominioId) {
            $query->where('condominio_id', $condominioId);
        }

        $despesas = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => Despesa::where('empresa_gestora_id', $empresa->id)->count(),
            'pendentes' => Despesa::where('empresa_gestora_id', $empresa->id)->where('estado', 'pendente')->count(),
            'aprovadas' => Despesa::where('empresa_gestora_id', $empresa->id)->where('estado', 'aprovada')->count(),
            'pagas_mes' => Despesa::where('empresa_gestora_id', $empresa->id)
                ->where('estado', 'paga')
                ->whereMonth('paga_em', now()->month)
                ->whereYear('paga_em', now()->year)
                ->sum('valor'),
        ];

        $categorias = DespesaCategoria::where('empresa_gestora_id', $empresa->id)
            ->where('activa', true)
            ->orderBy('ordem')
            ->get(['id', 'nome', 'slug', 'icone', 'cor']);

        // Contas bancárias dos condomínios da empresa actual
        $condominioIds = \App\Domains\Condominio\Models\Condominio::where('empresa_gestora_id', $empresa->id)->pluck('id');
        $contas = ContaBancaria::whereIn('condominio_id', $condominioIds)
            ->where('activa', true)
            ->with('condominio:id,nome')
            ->orderByDesc('principal')
            ->orderBy('nome')
            ->get(['id', 'nome', 'banco', 'moeda', 'saldo_actual', 'principal', 'condominio_id']);

        $condominios = \App\Domains\Condominio\Models\Condominio::where('empresa_gestora_id', $empresa->id)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return Inertia::render('Despesas/Index', [
            'despesas' => $despesas,
            'stats' => $stats,
            'categorias' => $categorias,
            'contas' => $contas,
            'condominios' => $condominios,
            'filtros' => [
                'estado' => $estado,
                'tipo' => $tipo,
                'categoria_id' => $categoriaId,
                'condominio_id' => $condominioId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa, 403);

        $data = $request->validate([
            'tipo' => 'required|in:condominio,empresa',
            'condominio_id' => 'nullable|integer|exists:condominios,id|required_if:tipo,condominio',
            'categoria_id' => 'required|integer|exists:despesa_categorias,id',
            'conta_bancaria_id' => 'required|integer|exists:contas_bancarias,id',
            'data_despesa' => 'required|date',
            'valor' => 'required|numeric|min:0.01',
            'descricao' => 'required|string|max:500',
            'fornecedor' => 'nullable|string|max:200',
            'notas' => 'nullable|string|max:2000',
            'comprovativo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        unset($data['comprovativo']);
        if ($request->hasFile('comprovativo')) {
            $data['comprovativo_path'] = $request->file('comprovativo')->store('despesas', 'public');
        }
        Despesa::create(array_merge($data, [
            'empresa_gestora_id' => $empresa->id,
            'estado' => 'pendente',
            'criada_por_user_id' => auth()->id(),
        ]));

        return back()->with('success', 'Despesa registada com sucesso.');
    }

    public function update(Request $request, Despesa $despesa): RedirectResponse
    {
        $this->autorizarMesmaEmpresa($despesa);
        abort_if($despesa->estado === 'paga', 422, 'Despesa paga não pode ser alterada.');
        abort_if($despesa->estado === 'cancelada', 422, 'Despesa cancelada não pode ser alterada.');

        $data = $request->validate([
            'tipo' => 'required|in:condominio,empresa',
            'condominio_id' => 'nullable|integer|exists:condominios,id|required_if:tipo,condominio',
            'categoria_id' => 'required|integer|exists:despesa_categorias,id',
            'conta_bancaria_id' => 'required|integer|exists:contas_bancarias,id',
            'data_despesa' => 'required|date',
            'valor' => 'required|numeric|min:0.01',
            'descricao' => 'required|string|max:500',
            'fornecedor' => 'nullable|string|max:200',
            'notas' => 'nullable|string|max:2000',
            'comprovativo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        unset($data['comprovativo']);
        if ($request->hasFile('comprovativo')) {
            if ($despesa->comprovativo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($despesa->comprovativo_path);
            }
            $data['comprovativo_path'] = $request->file('comprovativo')->store('despesas', 'public');
        }
        $despesa->update($data);

        return back()->with('success', 'Despesa actualizada.');
    }

    public function aprovar(Despesa $despesa): RedirectResponse
    {
        $this->autorizarMesmaEmpresa($despesa);
        try {
            $this->service->aprovar($despesa, auth()->id());
            return back()->with('success', 'Despesa aprovada.');
        } catch (Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function marcarPaga(Request $request, Despesa $despesa): RedirectResponse
    {
        $this->autorizarMesmaEmpresa($despesa);
        $request->validate([
            'data_pagamento' => 'nullable|date',
            'metodo_pagamento' => 'required|in:transferencia,deposito,numerario',
            'conta_bancaria_id' => 'nullable|integer|exists:contas_bancarias,id',
            'comprovativo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);
        // Se vier uma conta diferente, tem de pertencer a um condomínio da mesma empresa.
        $contaId = $request->input('conta_bancaria_id');
        if ($contaId) {
            $condominioIds = \App\Domains\Condominio\Models\Condominio::where('empresa_gestora_id', $despesa->empresa_gestora_id)->pluck('id');
            $valida = ContaBancaria::where('id', $contaId)->whereIn('condominio_id', $condominioIds)->exists();
            if (! $valida) {
                return back()->with('error', 'Conta bancária inválida para esta despesa.');
            }
        }
        $comprovativoPath = $request->hasFile('comprovativo')
            ? $request->file('comprovativo')->store('despesas/comprovativos', 'public')
            : null;
        try {
            $this->service->marcarPaga($despesa, auth()->id(), $request->input('data_pagamento'), $request->input('metodo_pagamento'), $contaId ? (int) $contaId : null, $comprovativoPath);
            return back()->with('success', 'Despesa marcada como paga. Movimento criado na conta bancária.');
        } catch (Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancelar(Request $request, Despesa $despesa): RedirectResponse
    {
        $this->autorizarMesmaEmpresa($despesa);
        $request->validate(['motivo' => 'nullable|string|max:300']);
        try {
            $this->service->cancelar($despesa, auth()->id(), $request->input('motivo'));
            return back()->with('success', 'Despesa cancelada.');
        } catch (Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Despesa $despesa): RedirectResponse
    {
        $this->autorizarMesmaEmpresa($despesa);
        abort_if($despesa->estado === 'paga', 422, 'Despesa paga não pode ser eliminada. Use cancelar.');
        $despesa->delete();
        return back()->with('success', 'Despesa eliminada.');
    }

    public function verComprovativo(Despesa $despesa)
    {
        $this->autorizarMesmaEmpresa($despesa);
        if (! $despesa->comprovativo_path
            || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($despesa->comprovativo_path)) {
            abort(404, 'Comprovativo nao encontrado.');
        }
        $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($despesa->comprovativo_path);
        $mime = \Illuminate\Support\Facades\File::mimeType($fullPath);
        return response()->file($fullPath, ['Content-Type' => $mime]);
    }

    protected function autorizarMesmaEmpresa(Despesa $despesa): void
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa && $despesa->empresa_gestora_id === $empresa->id, 403);
    }

    // === GESTÃO DE CATEGORIAS ===

    public function categorias(): Response
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa, 403);

        $this->service->garantirCategoriasPadrao($empresa->id);

        $categorias = DespesaCategoria::where('empresa_gestora_id', $empresa->id)
            ->withCount('despesas')
            ->orderBy('ordem')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Despesas/Categorias', [
            'categorias' => $categorias,
        ]);
    }

    public function categoriaStore(Request $request): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa, 403);

        $data = $request->validate([
            'nome' => 'required|string|max:80',
            'icone' => 'nullable|string|max:40',
            'cor' => 'nullable|string|max:20',
            'activa' => 'boolean',
        ]);

        $slug = \Illuminate\Support\Str::slug($data['nome']);
        $ordem = (int) DespesaCategoria::where('empresa_gestora_id', $empresa->id)->max('ordem') + 1;

        DespesaCategoria::create([
            'empresa_gestora_id' => $empresa->id,
            'nome' => $data['nome'],
            'slug' => $slug,
            'icone' => $data['icone'] ?? null,
            'cor' => $data['cor'] ?? '#a855f7',
            'ordem' => $ordem,
            'activa' => $data['activa'] ?? true,
        ]);

        return back()->with('success', 'Categoria criada.');
    }

    public function categoriaUpdate(Request $request, DespesaCategoria $categoria): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa && $categoria->empresa_gestora_id === $empresa->id, 403);

        $data = $request->validate([
            'nome' => 'required|string|max:80',
            'icone' => 'nullable|string|max:40',
            'cor' => 'nullable|string|max:20',
            'activa' => 'boolean',
        ]);

        $categoria->update([
            'nome' => $data['nome'],
            'slug' => \Illuminate\Support\Str::slug($data['nome']),
            'icone' => $data['icone'] ?? null,
            'cor' => $data['cor'] ?? $categoria->cor,
            'activa' => $data['activa'] ?? $categoria->activa,
        ]);

        return back()->with('success', 'Categoria actualizada.');
    }

    public function categoriaDestroy(DespesaCategoria $categoria): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        abort_unless($empresa && $categoria->empresa_gestora_id === $empresa->id, 403);

        if ($categoria->despesas()->count() > 0) {
            return back()->with('error', 'Esta categoria tem despesas associadas. Desactive-a em vez de eliminar.');
        }

        $categoria->delete();
        return back()->with('success', 'Categoria eliminada.');
    }
}
