<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Models\Pagamento;
use App\Domains\Payment\Services\PaymentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PagamentoController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
    ) {}

    /**
     * Cliente submete pagamento (com comprovativo) para uma ordem.
     */
    public function submeter(Request $request, OrdemCompra $ordem): RedirectResponse
    {
        $empresa = $this->empresaActual($request);

        if ($ordem->owner_type !== EmpresaGestora::class || $ordem->owner_id !== $empresa->id) {
            abort(403);
        }

        if (in_array($ordem->estado, ['aprovada', 'rejeitada', 'cancelada', 'expirada'])) {
            return back()->with('error', 'Esta ordem está fechada ('.$ordem->estado_label.').');
        }

        $data = $request->validate([
            'metodo' => 'required|in:transferencia_bancaria,deposito_bancario,outro',
            'valor' => 'required|numeric|min:1',
            'data_transacao' => 'required|date|before_or_equal:today',
            'referencia_externa' => 'nullable|string|max:100',
            'banco_origem' => 'nullable|string|max:100',
            'nome_ordenante' => 'nullable|string|max:150',
            'notas' => 'nullable|string|max:500',
            'comprovativo' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:5120',
        ]);

        // Validação extra do ficheiro
        $comprovativo = $request->file('comprovativo');
        $erros = PaymentService::validarComprovativo($comprovativo);
        if (! empty($erros)) {
            return back()->withErrors(['comprovativo' => implode(' ', $erros)]);
        }

        try {
            $pagamento = $this->paymentService->registarPagamento(
                $ordem,
                $data,
                $comprovativo,
                auth()->id(),
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao registar pagamento: '.$e->getMessage());
        }

        return redirect()
            ->route('ordens.show', $ordem->id)
            ->with('success', 'Comprovativo '.$pagamento->referencia.' submetido. Aguarde aprovação do administrador.');
    }

    /**
     * Download do comprovativo (protegido).
     * Apenas dono da ordem ou super-admin pode aceder.
     */
    public function comprovativo(Request $request, Pagamento $pagamento): Response
    {
        $user = $request->user();
        $empresa = $user?->empresaGestora;

        // Super-admin pode ver qualquer
        $isSuperAdmin = $user?->hasRole('super-admin') ?? false;

        if (! $isSuperAdmin) {
            // Cliente só pode ver os seus
            $ordem = $pagamento->ordem;
            if (! $ordem
                || $ordem->owner_type !== EmpresaGestora::class
                || $ordem->owner_id !== ($empresa?->id)
            ) {
                abort(403);
            }
        }

        if (! $pagamento->comprovativo_path || ! Storage::disk('local')->exists($pagamento->comprovativo_path)) {
            abort(404, 'Comprovativo não encontrado.');
        }

        $contents = Storage::disk('local')->get($pagamento->comprovativo_path);
        $mime = $pagamento->comprovativo_mime ?: 'application/octet-stream';
        $filename = $pagamento->comprovativo_original_name ?: basename($pagamento->comprovativo_path);

        return response($contents, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=0',
        ]);
    }

    private function empresaActual(Request $request): EmpresaGestora
    {
        $user = $request->user();
        $empresa = $user?->empresaGestora;

        if (! $empresa) {
            abort(403, 'Sem empresa associada.');
        }

        return $empresa;
    }
}
