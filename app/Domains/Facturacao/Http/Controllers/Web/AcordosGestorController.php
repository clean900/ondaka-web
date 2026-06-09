<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Facturacao\Models\AcordoPagamento;
use App\Domains\Facturacao\Services\AcordoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * UI Inertia para o gestor aprovar/recusar acordos de pagamento.
 * Tenancy por empresa_gestora_id.
 */
class AcordosGestorController extends Controller
{
    public function __construct(protected AcordoService $acordos) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $estado = $request->query('estado', 'aguarda_gestor');

        $query = AcordoPagamento::where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with(['prestacoes', 'propostas'])
            ->latest();

        if ($estado && $estado !== 'todos') {
            $query->where('estado', $estado);
        }

        $acordos = $query->get()->map(function ($a) {
            $condomino = \App\Domains\Condomino\Models\Condomino::find($a->condomino_id);
            $condominio = \App\Domains\Condominio\Models\Condominio::find($a->condominio_id);
            return [
                'id' => $a->id,
                'condomino_nome' => $condomino?->user?->name ?? ('Condómino #' . $a->condomino_id),
                'condominio_nome' => $condominio?->nome ?? ('Condomínio #' . $a->condominio_id),
                'valor_total' => $a->valor_total,
                'valor_com_juro' => $a->valor_com_juro,
                'valor_entrada' => $a->valor_entrada,
                'num_prestacoes' => $a->num_prestacoes,
                'estado' => $a->estado,
                'rondas_condomino' => $a->rondas_condomino,
                'rondas_gestor' => $a->rondas_gestor,
                'observacoes' => $a->observacoes,
                'propostas' => $a->propostas->map(fn ($pr) => ['autor' => $pr->autor, 'ronda' => $pr->ronda, 'num_prestacoes' => $pr->num_prestacoes, 'valor_com_juro' => $pr->valor_com_juro, 'valor_entrada' => $pr->valor_entrada, 'observacoes' => $pr->observacoes, 'created_at' => $pr->created_at?->format('Y-m-d H:i')]),
                'created_at' => $a->created_at?->format('Y-m-d H:i'),
                'prestacoes' => $a->prestacoes->map(fn ($p) => [
                    'numero' => $p->numero,
                    'valor' => $p->valor,
                    'data_vencimento' => $p->data_vencimento?->format('Y-m-d'),
                    'estado' => $p->estado,
                ]),
            ];
        });

        return Inertia::render('Facturacao/Acordos/Index', [
            'acordos' => $acordos,
            'estadoFiltro' => $estado,
        ]);
    }

    public function aprovar(Request $request, AcordoPagamento $acordo): RedirectResponse
    {
        $user = $request->user();
        if ($acordo->empresa_gestora_id !== $user->empresa_gestora_id) {
            abort(403);
        }

        $validated = $request->validate([
            'num_prestacoes' => ['nullable', 'integer', 'min:2', 'max:6'],
        ]);

        try {
            $this->acordos->aceitarDialogo($acordo, $user->id);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['acordo' => $e->getMessage()]);
        }

        return back()->with('flash.success', 'Acordo aprovado e prestações criadas.');
    }

    public function recusar(Request $request, AcordoPagamento $acordo): RedirectResponse
    {
        $user = $request->user();
        if ($acordo->empresa_gestora_id !== $user->empresa_gestora_id) {
            abort(403);
        }

        $validated = $request->validate([
            'motivo' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->acordos->recusarDialogo($acordo, $user->id, $validated['motivo'] ?? null);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['acordo' => $e->getMessage()]);
        }

        return back()->with('flash.success', 'Acordo recusado.');
    }

    public function contrapropor(Request $request, AcordoPagamento $acordo): RedirectResponse
    {
        $user = $request->user();
        if ($acordo->empresa_gestora_id !== $user->empresa_gestora_id) {
            abort(403);
        }
        $validated = $request->validate([
            'num_prestacoes' => ['required', 'integer', 'min:1', 'max:36'],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);
        try {
            $this->acordos->contrapropostaGestor($acordo, $user, $validated['num_prestacoes'], $validated['observacoes'] ?? null);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['acordo' => $e->getMessage()]);
        }
        return back()->with('flash.success', 'Contraproposta enviada ao condomino.');
    }
}
