<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Http\Controllers\Web;

use App\Domains\Avisos\Http\Requests\ComentarAvisoRequest;
use App\Domains\Avisos\Http\Requests\CriarAvisoRequest;
use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoAnexo;
use App\Domains\Avisos\Services\AvisoService;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvisosWebController extends Controller
{
    public function __construct(protected AvisoService $service) {}

    public function index(Request $request): Response
    {
        $query = Aviso::query()
            ->with(['autor:id,name', 'condominio:id,nome'])
            ->withCount(['leituras', 'todosComentarios as comentarios_count'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->string('estado'));
        }
        if ($request->filled('categoria')) {
            $query->where('categoria', $request->string('categoria'));
        }
        if ($request->filled('condominio_id')) {
            $query->where('condominio_id', $request->integer('condominio_id'));
        }
        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('titulo', 'like', "%$q%")
                    ->orWhere('descricao', 'like', "%$q%");
            });
        }

        $avisos = $query->paginate(20)->withQueryString();

        $condominios = Condominio::select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Avisos/Index', [
            'avisos' => $avisos,
            'condominios' => $condominios,
            'filtros' => $request->only(['estado', 'categoria', 'condominio_id', 'q']),
        ]);
    }

    public function show(Aviso $aviso): Response
    {
        $aviso->load([
            'autor:id,name',
            'condominio:id,nome',
            'segmentacoes',
            'anexos',
            'todosComentarios.user:id,name',
            'leituras.user:id,name',
        ]);

        $estatisticas = $this->service->estatisticasLeitura($aviso);

        return Inertia::render('Avisos/Show', [
            'aviso' => $aviso,
            'estatisticas' => $estatisticas,
        ]);
    }

    public function create(): Response
    {
        $condominios = Condominio::select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Avisos/Create', [
            'condominios' => $condominios,
        ]);
    }

    public function store(CriarAvisoRequest $request): RedirectResponse
    {
        $dados = $request->validated();
        $segmentacoes = $dados['segmentacoes'];
        unset($dados['segmentacoes']);
        $condominioIds = $dados['condominio_ids'];
        unset($dados['condominio_ids']);

        $anexos = $request->file('anexos', []);
        unset($dados['anexos']);

        $ultimoAviso = null;
        foreach ($condominioIds as $cid) {
        $dadosAviso = $dados;
        $dadosAviso['condominio_id'] = $cid;
        $aviso = $this->service->criar($dadosAviso, $segmentacoes, $request->user());
        $ultimoAviso = $aviso;

        foreach ($anexos as $file) {
            $path = $file->store('avisos/' . $aviso->id, 'public');
            AvisoAnexo::create([
                'aviso_id' => $aviso->id,
                'uploaded_by_user_id' => $request->user()->id,
                'path' => $path,
                'nome_original' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'tamanho_bytes' => $file->getSize(),
            ]);
        }

        }
        $n = count($condominioIds);
        if ($n === 1 && $ultimoAviso) {
            return redirect()
                ->route('avisos.show', $ultimoAviso)
                ->with('success', 'Aviso criado com sucesso.');
        }
        return redirect()
            ->route('avisos.index')
            ->with('success', "Aviso criado em {$n} condomínios.");
    }

    public function publicar(Aviso $aviso): RedirectResponse
    {
        $this->service->publicar($aviso);
        return back()->with('success', 'Aviso publicado.');
    }

    public function arquivar(Aviso $aviso): RedirectResponse
    {
        $this->service->arquivar($aviso);
        return back()->with('success', 'Aviso arquivado.');
    }

    public function comentar(Aviso $aviso, ComentarAvisoRequest $request): RedirectResponse
    {
        $this->service->comentar(
            $aviso,
            $request->user(),
            $request->validated('mensagem'),
            $request->validated('parent_id'),
        );

        return back()->with('success', 'Comentário adicionado.');
    }
}
