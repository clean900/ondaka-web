<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * ONDAKA — DocumentosController
 *
 * 4 sub-páginas dentro da nova secção "Documentos" da sidebar:
 *   - GET /documentos/contratos          → placeholder "Em breve"
 *   - GET /documentos/regulamentos       → placeholder "Em breve"
 *   - GET /documentos/formulario-registo → serve HTML standalone
 *   - GET /documentos/outros             → placeholder "Em breve"
 *
 * As rotas exigem autenticação (estão dentro do grupo auth no routes/web.php).
 */
class DocumentosController extends Controller
{
    public function contratos(): InertiaResponse
    {
        return Inertia::render('Documentos/Contratos', [
            'titulo' => 'Contratos',
            'descricao' => 'Repositório central de contratos do condomínio.',
        ]);
    }

    public function regulamentos(): InertiaResponse
    {
        return Inertia::render('Documentos/Regulamentos', [
            'titulo' => 'Regulamentos',
            'descricao' => 'Regulamento interno e normas do condomínio.',
        ]);
    }

    /**
     * Devolve o HTML standalone do formulário (sem layout Inertia).
     * O HTML já tem identidade visual ONDAKA própria (gradient, A4, imprimível).
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

    public function outros(): InertiaResponse
    {
        return Inertia::render('Documentos/Outros', [
            'titulo' => 'Outros documentos',
            'descricao' => 'Outros documentos úteis do condomínio.',
        ]);
    }
}
