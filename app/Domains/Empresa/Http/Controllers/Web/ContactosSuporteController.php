<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Http\Controllers\Web;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gere os Contactos de Suporte mostrados aos condóminos na app móvel.
 *
 * Apenas super-admin e admin-empresa podem aceder/editar.
 */
class ContactosSuporteController extends Controller
{
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $empresa = EmpresaGestora::find($empresaId);

        $configurado = $empresa && (
            !empty($empresa->whatsapp_suporte)
            || !empty($empresa->email_contacto)
            || !empty($empresa->telefone)
        );

        return Inertia::render('Configuracoes/ContactosSuporte', [
            'empresa' => $empresa ? [
                'id' => $empresa->id,
                'nome' => $empresa->nome,
                'email_contacto' => $empresa->email_contacto,
                'telefone' => $empresa->telefone,
                'whatsapp_suporte' => $empresa->whatsapp_suporte,
                'morada' => $empresa->morada,
                'horario_atendimento' => $empresa->horario_atendimento,
                'logotipo_path' => $empresa->logotipo_path,
                'logotipo_url' => $empresa->logotipo_path
                    ? '/ficheiros/' . $empresa->logotipo_path
                    : null,
            ] : null,
            'configurado' => $configurado,
        ]);
    }

    public function actualizar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_contacto' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:30',
            'whatsapp_suporte' => 'nullable|string|max:30',
            'morada' => 'nullable|string|max:500',
            'horario_atendimento' => 'nullable|string|max:100',
        ]);

        $empresaId = $request->user()->empresa_gestora_id;
        $empresa = EmpresaGestora::findOrFail($empresaId);
        $empresa->update($validated);

        return back()->with('success', 'Contactos de suporte actualizados com sucesso.');
    }
}
