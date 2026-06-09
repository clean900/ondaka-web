<?php

declare(strict_types=1);

namespace App\Domains\Reserva\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Reserva\Models\Reserva;
use App\Domains\Reserva\Models\ReservaEspaco;
use App\Domains\Reserva\Services\ReservaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    private const FEATURE_SLUG = 'reservas_areas_comuns';

    public function __construct(protected ReservaService $service = new ReservaService()) {}

    private function gestoraId(Request $request): ?int
    {
        return $request->user()->empresa_gestora_id ?? null;
    }

    /** Confirma que a gestora tem o add-on activo. */
    private function temAcesso(Request $request): bool
    {
        $emp = $this->gestoraId($request);
        if (! $emp) {
            return false;
        }
        $empresa = EmpresaGestora::find($emp);
        return $empresa && FeatureGate::has($empresa, self::FEATURE_SLUG);
    }

    /** Painel principal: lista espaços + reservas pendentes. */
    public function index(Request $request): Response
    {
        if (! $this->temAcesso($request)) {
            return Inertia::render('Reservas/Upgrade', ['feature_slug' => self::FEATURE_SLUG]);
        }
        $emp = $this->gestoraId($request);

        $espacos = ReservaEspaco::where('empresa_gestora_id', $emp)
            ->orderBy('nome')
            ->withCount('reservas')
            ->get(['id', 'nome', 'condominio_id', 'tem_caucao', 'valor_caucao', 'activo']);

        $reservas = Reserva::query()
            ->whereHas('espaco', fn ($q) => $q->where('empresa_gestora_id', $emp))
            ->with('espaco:id,nome,tem_caucao,valor_caucao')
            ->orderBy('data', 'desc')
            ->limit(50)
            ->get();

        // anexar nomes dos users
        $nomes = \DB::table('users')->whereIn('id', $reservas->pluck('user_id')->unique())->pluck('name', 'id');
        $reservas->each(fn ($r) => $r->user_nome = $nomes[$r->user_id] ?? ('User #' . $r->user_id));

        return Inertia::render('Reservas/Index', ['espacos' => $espacos, 'reservas' => $reservas]);
    }

    // ===== Espaços CRUD =====

    public function novoEspaco(Request $request): Response
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $condominios = Condominio::where('empresa_gestora_id', $emp)->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Reservas/Espaco', ['espaco' => null, 'condominios' => $condominios]);
    }

    public function editarEspaco(Request $request, int $id): Response
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $espaco = ReservaEspaco::where('empresa_gestora_id', $emp)->findOrFail($id);
        $condominios = Condominio::where('empresa_gestora_id', $emp)->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Reservas/Espaco', ['espaco' => $espaco, 'condominios' => $condominios]);
    }

    public function guardarEspaco(Request $request, ?int $id = null): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $v = $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string|max:255',
            'condominio_id' => 'nullable|integer',
            'hora_abertura' => 'required',
            'hora_fecho' => 'required',
            'duracao_min_horas' => 'required|integer|min:1|max:24',
            'duracao_max_horas' => 'required|integer|min:1|max:24',
            'antecedencia_min_horas' => 'required|integer|min:0|max:720',
            'antecedencia_max_dias' => 'required|integer|min:1|max:365',
            'tem_caucao' => 'boolean',
            'valor_caucao' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);
        $v['empresa_gestora_id'] = $emp;

        if ($id) {
            $esp = ReservaEspaco::where('empresa_gestora_id', $emp)->findOrFail($id);
            $esp->update($v);
        } else {
            ReservaEspaco::create($v);
        }
        return redirect('/reservas')->with('success', 'Espaço guardado.');
    }

    public function apagarEspaco(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $emp = $this->gestoraId($request);
        $esp = ReservaEspaco::where('empresa_gestora_id', $emp)->findOrFail($id);
        $esp->delete();
        return redirect('/reservas')->with('success', 'Espaço apagado.');
    }

    // ===== Reservas: aprovar / recusar / confirmar cauçao =====

    private function reservaDaGestora(Request $request, int $id): Reserva
    {
        $emp = $this->gestoraId($request);
        return Reserva::whereHas('espaco', fn ($q) => $q->where('empresa_gestora_id', $emp))
            ->with('espaco')
            ->findOrFail($id);
    }

    public function aprovar(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $r = $this->reservaDaGestora($request, $id);
        $this->service->aprovar($r, $request->user()->id);
        return back()->with('success', 'Reserva aprovada.');
    }

    public function recusar(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $r = $this->reservaDaGestora($request, $id);
        $this->service->recusar($r, $request->user()->id, $request->input('motivo'));
        return back()->with('success', 'Reserva recusada.');
    }

    public function confirmarCaucao(Request $request, int $id): RedirectResponse
    {
        abort_unless($this->temAcesso($request), 403);
        $r = $this->reservaDaGestora($request, $id);
        $this->service->confirmarCaucao($r);
        return back()->with('success', 'Caução confirmada — reserva confirmada.');
    }
}
