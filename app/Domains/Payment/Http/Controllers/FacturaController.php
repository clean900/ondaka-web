<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\Factura;
use App\Domains\Payment\Services\FacturaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FacturaController extends Controller
{
    public function __construct(
        protected FacturaService $facturaService,
    ) {}

    /**
     * Download/visualização de PDF da factura.
     * Acessível a: dono da ordem OU super-admin.
     */
    public function download(Request $request, Factura $factura, string $modo = 'inline'): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('super-admin') ?? false;

        if (! $isSuperAdmin) {
            $ordem = $factura->ordem;
            $empresa = $user?->empresaGestora;

            if (! $ordem
                || $ordem->owner_type !== EmpresaGestora::class
                || $ordem->owner_id !== ($empresa?->id)
            ) {
                abort(403);
            }
        }

        $pdfBytes = $this->facturaService->obterPdf($factura);

        if (! $pdfBytes) {
            abort(500, 'Não foi possível gerar o PDF da factura.');
        }

        $filename = str_replace(['/', ' '], ['_', '_'], $factura->numero).'.pdf';
        $disposition = $modo === 'download' ? 'attachment' : 'inline';

        return response($pdfBytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=0',
        ]);
    }
}
