<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Services\PasseService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API — passes de visitante do CONDÓMINO (solicitar prestador/trabalhador,
 * anexar documento, acompanhar estado e obter o link do PDF quando aprovado).
 */
class PassesApiController extends Controller
{
    public function __construct(protected PasseService $service) {}

    public function index(Request $request): JsonResponse
    {
        $condomino = CondominoResolver::paraUser($request->user());
        abort_unless($condomino, 403, 'Apenas condóminos podem ver passes.');

        $passes = PreAprovacao::where('condomino_id', $condomino->id)
            ->whereIn('tipo_acesso', ['prestador', 'trabalhador', 'outro'])
            ->with('fraccao:id,identificador')
            ->latest()
            ->get()
            ->map(fn (PreAprovacao $p) => [
                'id' => $p->id,
                'tipo_acesso' => $p->tipo_acesso,
                'nome_visitante' => $p->nome_visitante,
                'estado' => $p->estado,
                'valida_desde' => $p->valida_desde?->toIso8601String(),
                'valida_ate' => $p->valida_ate?->toIso8601String(),
                'pdf_url' => $p->estado === PreAprovacao::ESTADO_APROVADO && $p->qr_token
                    ? url('/passe/' . $p->qr_token . '/pdf')
                    : null,
            ]);

        return response()->json(['data' => $passes]);
    }

    public function store(Request $request): JsonResponse
    {
        $condomino = CondominoResolver::paraUser($request->user());
        abort_unless($condomino, 403, 'Apenas condóminos podem solicitar passes.');

        $dados = $request->validate([
            'fraccao_id' => ['required', 'integer'],
            'tipo_acesso' => ['required', 'in:prestador,trabalhador,outro'],
            'nome_visitante' => ['required', 'string', 'max:150'],
            'telefone_visitante' => ['nullable', 'string', 'max:30'],
            'tipo_documento' => ['required', 'in:bi,passaporte,carta_conducao,outro'],
            'numero_documento' => ['nullable', 'string', 'max:60'],
            'valida_desde' => ['required', 'date'],
            'valida_ate' => ['required', 'date', 'after_or_equal:valida_desde'],
            'observacoes' => ['nullable', 'string', 'max:1000'],
            'documento' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:8192'],
            'foto_visitante' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:8192'],
        ]);

        $dados['documento_anexo_path'] = $request->file('documento')->store('passes', 'public');
        $dados['foto_visitante_path'] = $request->file('foto_visitante')->store('passes', 'public');

        $passe = $this->service->solicitar($condomino, $dados);

        return response()->json([
            'message' => 'Passe solicitado. Aguarda aprovação do gestor.',
            'data' => ['id' => $passe->id, 'estado' => $passe->estado],
        ], 201);
    }

    public function estender(Request $request, int $id): JsonResponse
    {
        $condomino = CondominoResolver::paraUser($request->user());
        abort_unless($condomino, 403);

        $passe = PreAprovacao::where('condomino_id', $condomino->id)->findOrFail($id);
        $dados = $request->validate(['valida_ate' => ['required', 'date', 'after:today']]);

        $this->service->estender($passe, $dados['valida_ate']);

        return response()->json(['message' => 'Validade do passe estendida.']);
    }
}
