<?php
declare(strict_types=1);

namespace App\Domains\Comunicados\Http\Controllers;

use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoSegmentacao;
use App\Domains\Avisos\Services\AvisoNotificationService;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminComunicadosController extends Controller
{
    public function index(Request $request): Response
    {
        $condominios = Condominio::query()
            ->orderBy('nome')
            ->get(['id', 'nome', 'empresa_gestora_id'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'empresa_gestora_id' => $c->empresa_gestora_id,
            ]);

        return Inertia::render('SuperAdmin/Comunicados/Index', [
            'condominios' => $condominios,
        ]);
    }

    public function enviar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'min:3', 'max:120'],
            'mensagem' => ['required', 'string', 'min:5', 'max:2000'],
            'condominio_ids' => ['required', 'array', 'min:1'],
            'condominio_ids.*' => ['integer', 'exists:condominios,id'],
        ]);

        $autor = $request->user();
        $notificationService = app(AvisoNotificationService::class);
        $criados = 0;

        foreach ($validated['condominio_ids'] as $cid) {
            $condominio = Condominio::find($cid);
            if (! $condominio) {
                continue;
            }

            try {
                $aviso = DB::transaction(function () use ($validated, $condominio, $autor) {
                    $aviso = Aviso::create([
                        'empresa_gestora_id' => $condominio->empresa_gestora_id,
                        'condominio_id' => $condominio->id,
                        'autor_user_id' => $autor->id,
                        'titulo' => $validated['titulo'],
                        'descricao' => $validated['mensagem'],
                        'categoria' => 'geral',
                        'prioridade' => 'media',
                        'estado' => 'publicado',
                        'publicado_em' => now(),
                        'permite_comentarios' => false,
                        'requer_confirmacao' => false,
                        'notificar_push' => true,
                        'notificar_email' => true,
                        'notificar_sms' => false,
                    ]);

                    AvisoSegmentacao::create([
                        'aviso_id' => $aviso->id,
                        'tipo' => 'todos',
                        'alvo_id' => null,
                        'valor_texto' => null,
                    ]);

                    return $aviso;
                });

                try {
                    $notificationService->avisoPublicado($aviso);
                } catch (\Throwable $e) {
                    Log::warning("[Comunicado] notificar falhou aviso {$aviso->id}: " . $e->getMessage());
                }

                $criados++;
            } catch (\Throwable $e) {
                Log::error("[Comunicado] criar aviso falhou condominio {$cid}: " . $e->getMessage());
            }
        }

        return redirect()
            ->route('admin.comunicados.index')
            ->with('success', "Comunicado publicado em {$criados} condomínio(s).");
    }
}
