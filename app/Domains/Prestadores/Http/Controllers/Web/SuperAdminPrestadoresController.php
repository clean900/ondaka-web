<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Http\Controllers\Web;

use App\Domains\Prestadores\Services\PrestadoresService;
use App\Domains\Tickets\Models\EmpresaPrestadora;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminPrestadoresController extends Controller
{
    public function __construct(
        protected PrestadoresService $service,
    ) {}

    /**
     * Lista de prestadores públicos para gestão super-admin.
     */
    public function index(Request $request): Response
    {
        $estado = $request->string('estado')->toString() ?: 'pendente';

        $prestadores = EmpresaPrestadora::tipoPublico()
            ->when($estado !== 'todos', fn ($q) => $q->where('estado_aprovacao', $estado))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Prestadores/SuperAdmin/Index', [
            'prestadores' => $prestadores,
            'estadoActual' => $estado,
            'contadores' => [
                'pendente' => EmpresaPrestadora::tipoPublico()->where('estado_aprovacao', 'pendente')->count(),
                'aprovado' => EmpresaPrestadora::tipoPublico()->where('estado_aprovacao', 'aprovado')->count(),
                'rejeitado' => EmpresaPrestadora::tipoPublico()->where('estado_aprovacao', 'rejeitado')->count(),
            ],
        ]);
    }

    public function aprovar(EmpresaPrestadora $prestadora): RedirectResponse
    {
        $this->service->aprovarPublico($prestadora, true);

        return back()->with('success', "Prestador '{$prestadora->nome}' aprovado e subscrição activada.");
    }

    public function rejeitar(EmpresaPrestadora $prestadora): RedirectResponse
    {
        $this->service->rejeitarPublico($prestadora);

        return back()->with('success', "Prestador '{$prestadora->nome}' rejeitado.");
    }

    public function alternarSubscricao(EmpresaPrestadora $prestadora): RedirectResponse
    {
        $nova = ! $prestadora->subscricao_activa;
        $prestadora->update([
            'subscricao_activa' => $nova,
            'subscricao_expira_em' => $nova ? now()->addMonth()->toDateString() : null,
        ]);

        return back()->with('success', $nova ? 'Subscrição activada.' : 'Subscrição desactivada.');
    }
}
