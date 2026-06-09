<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Domains\Subscription\Models\EscalaoCore;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminSubscricaoConfigController extends Controller
{
    /**
     * Mostra página de configuração de subscrições.
     */
    public function index(): Response
    {
        $config = DB::table('plataforma_config')
            ->orderBy('chave')
            ->get()
            ->keyBy('chave');

        $escaloes = EscalaoCore::orderBy('ordem')->get();

        return Inertia::render('SuperAdmin/Subscricoes/Config', [
            'config' => $config,
            'escaloes' => $escaloes,
        ]);
    }

    /**
     * Actualiza um valor de configuração.
     */
    public function actualizarConfig(Request $request, string $chave): JsonResponse
    {
        $request->validate([
            'valor' => 'required',
        ]);

        $existe = DB::table('plataforma_config')->where('chave', $chave)->exists();
        if (!$existe) {
            return response()->json(['success' => false, 'message' => 'Chave não existe.'], 404);
        }

        DB::table('plataforma_config')
            ->where('chave', $chave)
            ->update([
                'valor' => $request->input('valor'),
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Configuração actualizada.',
        ]);
    }

    /**
     * Cria/actualiza escalão (CRUD).
     */
    public function guardarEscalao(Request $request, ?int $id = null): JsonResponse
    {
        $data = $request->validate([
            'slug' => 'required|string|max:50',
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'min_fraccoes' => 'required|integer|min:1',
            'max_fraccoes' => 'nullable|integer|min:1',
            'desconto_pct' => 'required|numeric|min:0|max:100',
            'cor_badge' => 'nullable|string|max:30',
            'ordem' => 'required|integer|min:0',
            'activo' => 'boolean',
        ]);

        // Calcular preço final com base no desconto e preço base
        $precoBase = (float) DB::table('plataforma_config')
            ->where('chave', 'preco_base_imovel_mes')
            ->value('valor');
        $data['preco_por_fraccao_mensal'] = round($precoBase * (1 - $data['desconto_pct'] / 100), 2);

        if ($id) {
            $escalao = EscalaoCore::findOrFail($id);
            $escalao->update($data);
        } else {
            $escalao = EscalaoCore::create($data);
        }

        return response()->json([
            'success' => true,
            'escalao' => $escalao,
            'message' => $id ? 'Escalão actualizado.' : 'Escalão criado.',
        ]);
    }

    /**
     * Elimina escalão.
     */
    public function eliminarEscalao(int $id): JsonResponse
    {
        $escalao = EscalaoCore::findOrFail($id);
        $escalao->delete();

        return response()->json([
            'success' => true,
            'message' => 'Escalão eliminado.',
        ]);
    }
}
