<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class FicheirosController extends Controller
{
    /**
     * Serve um ficheiro do disco "public" via Laravel,
     * para contornar a limitação do LiteSpeed em servir /storage/ directamente.
     *
     * GET /ficheiros/{path}  (path = subcaminho dentro de storage/app/public/)
     */
    public function show(Request $request, string $path): Response
    {
        // Segurança: bloquear path traversal
        if (str_contains($path, '..') || str_contains($path, '\\')) {
            abort(404);
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($path)) {
            abort(404);
        }

        // Servir directamente (Laravel detecta mime; usamos response inline)
        $absoluto = $disk->path($path);
        $mime = mime_content_type($absoluto) ?: 'application/octet-stream';

        return response()->file($absoluto, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
