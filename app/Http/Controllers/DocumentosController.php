<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ModeloDocumento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * ONDAKA — DocumentosController
 *
 * Secção "Documentos": modelos (templates) de documentação por categoria
 * (contratos, regulamentos, outros) + formulário de registo standalone.
 * As rotas exigem autenticação (grupo auth no routes/web.php).
 */
class DocumentosController extends Controller
{
    public function contratos(): InertiaResponse
    {
        return Inertia::render('Documentos/Contratos', [
            'titulo' => 'Contratos',
            'descricao' => 'Modelos de contratos do condomínio (administração, serviços, fornecedores).',
            'categoria' => 'contrato',
            'modelos' => $this->modelos('contrato'),
        ]);
    }

    public function regulamentos(): InertiaResponse
    {
        return Inertia::render('Documentos/Regulamentos', [
            'titulo' => 'Regulamentos',
            'descricao' => 'Modelos de regulamento interno e normas do condomínio.',
            'categoria' => 'regulamento',
            'modelos' => $this->modelos('regulamento'),
        ]);
    }

    public function outros(): InertiaResponse
    {
        return Inertia::render('Documentos/Outros', [
            'titulo' => 'Outros documentos',
            'descricao' => 'Outros modelos de documentos úteis do condomínio.',
            'categoria' => 'outro',
            'modelos' => $this->modelos('outro'),
        ]);
    }

    /**
     * Devolve o HTML standalone do formulário de registo (sem layout Inertia).
     */
    public function formularioRegisto(): Response
    {
        $path = public_path('formularios/registo-condomino.html');

        if (! file_exists($path)) {
            abort(404, 'Formulário não encontrado.');
        }

        return response(file_get_contents($path), 200, [
            'Content-Type' => 'text/html; charset=utf-8',
        ]);
    }

    public function guardarModelo(Request $request): RedirectResponse
    {
        $request->validate([
            'categoria' => 'required|in:contrato,regulamento,outro',
            'nome' => 'required|string|max:150',
            'descricao' => 'nullable|string|max:300',
            'ficheiro' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:8192',
        ]);

        ModeloDocumento::create([
            'empresa_gestora_id' => $request->user()->empresa_gestora_id,
            'categoria' => $request->categoria,
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'ficheiro_path' => $request->file('ficheiro')->store('modelos-documentos', 'public'),
            'criado_por_user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Modelo adicionado.');
    }

    public function apagarModelo(Request $request, ModeloDocumento $modelo): RedirectResponse
    {
        if ($modelo->empresa_gestora_id !== $request->user()->empresa_gestora_id) {
            abort(403);
        }

        Storage::disk('public')->delete($modelo->ficheiro_path);
        $modelo->delete();

        return back()->with('success', 'Modelo removido.');
    }

    /**
     * Liga/desliga a visibilidade de um modelo no mobile dos condóminos.
     */
    public function toggleVisibilidade(Request $request, ModeloDocumento $modelo): RedirectResponse
    {
        if ($modelo->empresa_gestora_id !== $request->user()->empresa_gestora_id) {
            abort(403);
        }

        $modelo->update(['visivel_mobile' => ! $modelo->visivel_mobile]);

        return back()->with('success', $modelo->visivel_mobile ? 'Modelo visível no mobile.' : 'Modelo escondido do mobile.');
    }

    private function modelos(string $categoria): array
    {
        $empresaId = request()->user()->empresa_gestora_id;

        return ModeloDocumento::where('empresa_gestora_id', $empresaId)
            ->where('categoria', $categoria)
            ->latest()
            ->get()
            ->map(fn (ModeloDocumento $m) => [
                'id' => $m->id,
                'nome' => $m->nome,
                'descricao' => $m->descricao,
                'url' => '/ficheiros/' . $m->ficheiro_path,
                'visivel_mobile' => (bool) $m->visivel_mobile,
                'criado_em' => $m->created_at?->toDateString(),
            ])
            ->all();
    }
}
