<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Services\PasseService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PassesController extends Controller
{
    public const FEATURE_SLUG = 'passe_visitante_branding';

    /** Esquema de cores dos 12 modelos (DomPDF: cores sólidas). */
    private const TEMAS = [
        1 => ['cardBg' => '#0a0a1a', 'cardText' => '#ffffff', 'head' => '#7c3aed', 'headText' => '#ffffff', 'accent' => '#c4b5fd'],
        2 => ['cardBg' => '#ffffff', 'cardText' => '#0f172a', 'head' => '#1e3a8a', 'headText' => '#ffffff', 'accent' => '#1e3a8a'],
        3 => ['cardBg' => '#111111', 'cardText' => '#f5e6c8', 'head' => '#1a1a1a', 'headText' => '#d4af37', 'accent' => '#d4af37'],
        4 => ['cardBg' => '#ffffff', 'cardText' => '#14532d', 'head' => '#166534', 'headText' => '#ffffff', 'accent' => '#166534'],
        5 => ['cardBg' => '#9333ea', 'cardText' => '#ffffff', 'head' => '#db2777', 'headText' => '#ffffff', 'accent' => '#ffffff'],
        6 => ['cardBg' => '#0ea5e9', 'cardText' => '#ffffff', 'head' => '#1e40af', 'headText' => '#ffffff', 'accent' => '#e0f2fe'],
        7 => ['cardBg' => '#1a0c0c', 'cardText' => '#ffffff', 'head' => '#b91c1c', 'headText' => '#ffffff', 'accent' => '#fca5a5'],
        8 => ['cardBg' => '#fafafa', 'cardText' => '#18181b', 'head' => '#18181b', 'headText' => '#ffffff', 'accent' => '#18181b'],
        9 => ['cardBg' => '#ea580c', 'cardText' => '#ffffff', 'head' => '#db2777', 'headText' => '#ffffff', 'accent' => '#ffffff'],
        10 => ['cardBg' => '#0a0f0d', 'cardText' => '#d1fae5', 'head' => '#06120e', 'headText' => '#34d399', 'accent' => '#6ee7b7'],
        11 => ['cardBg' => '#ffffff', 'cardText' => '#0f3d3a', 'head' => '#0d9488', 'headText' => '#ffffff', 'accent' => '#0f766e'],
        12 => ['cardBg' => '#0f172a', 'cardText' => '#e2e8f0', 'head' => '#1e293b', 'headText' => '#fbbf24', 'accent' => '#fcd34d'],
    ];

    /**
     * PDF público do passe (link partilhável pelo condómino). O qr_token é o segredo.
     */
    public function pdfPublico(string $qrToken)
    {
        $passe = PreAprovacao::where('qr_token', $qrToken)
            ->whereIn('tipo_acesso', ['prestador', 'trabalhador', 'outro'])
            ->with(['fraccao:id,identificador,condominio_id', 'condomino:id,nome_completo'])
            ->firstOrFail();

        abort_unless($passe->estado === PreAprovacao::ESTADO_APROVADO, 404);

        $condominio = $passe->fraccao
            ? Condominio::find($passe->fraccao->condominio_id)
            : null;
        $tema = self::TEMAS[$condominio->modelo_passe ?? 1] ?? self::TEMAS[1];
        $qrSvg = base64_encode((string) QrCode::format('svg')->size(280)->margin(0)->generate($qrToken));

        $pdf = Pdf::loadView('passe.cartao', [
            'passe' => $passe,
            'condominio' => $condominio,
            'tema' => $tema,
            'qrSvg' => $qrSvg,
        ])->setPaper([0, 0, 280, 440]);

        return $pdf->stream('passe-' . str_replace(' ', '-', (string) $passe->nome_visitante) . '.pdf');
    }

    public function __construct(protected PasseService $service) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        if (! $empresa || ! FeatureGate::has($empresa, self::FEATURE_SLUG)) {
            return redirect()->route('funcionalidades.show', self::FEATURE_SLUG);
        }

        $empresaId = (int) $request->user()->empresa_gestora_id;

        $passes = PreAprovacao::where('empresa_gestora_id', $empresaId)
            ->whereIn('tipo_acesso', ['prestador', 'trabalhador', 'outro'])
            ->with(['condomino:id,nome_completo', 'fraccao:id,identificador,condominio_id'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (PreAprovacao $p) => [
                'id' => $p->id,
                'tipo_acesso' => $p->tipo_acesso,
                'nome_visitante' => $p->nome_visitante,
                'tipo_documento' => $p->tipo_documento,
                'numero_documento' => $p->numero_documento,
                'documento_anexo' => $p->documento_anexo_path ? '/ficheiros/' . $p->documento_anexo_path : null,
                'condomino' => $p->condomino?->nome_completo,
                'valida_desde' => $p->valida_desde?->format('d/m/Y'),
                'valida_ate' => $p->valida_ate?->format('d/m/Y'),
                'estado' => $p->estado,
            ]);

        $condominios = Condominio::where('empresa_gestora_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome', 'modelo_passe'])
            ->map(fn ($c) => ['id' => $c->id, 'nome' => $c->nome, 'modelo_passe' => $c->modelo_passe ?? 1]);

        return Inertia::render('Visitantes/Passes', [
            'passes' => $passes->values(),
            'condominios' => $condominios->values(),
        ]);
    }

    public function aprovar(Request $request, PreAprovacao $passe, FcmSenderService $fcm): RedirectResponse
    {
        $this->autoriza($request, $passe);
        $this->service->aprovar($passe, (int) $request->user()->id);
        $this->notificarCondomino($passe, $fcm, true);

        return back()->with('success', 'Passe aprovado. O condómino pode agora descarregá-lo.');
    }

    public function recusar(Request $request, PreAprovacao $passe, FcmSenderService $fcm): RedirectResponse
    {
        $this->autoriza($request, $passe);
        $motivo = $request->input('motivo');
        $this->service->recusar($passe, (int) $request->user()->id, $motivo);
        $this->notificarCondomino($passe, $fcm, false);

        return back()->with('success', 'Passe recusado.');
    }

    public function definirModelo(Request $request, Condominio $condominio): RedirectResponse
    {
        abort_if($condominio->empresa_gestora_id !== $request->user()->empresa_gestora_id, 403);
        $request->validate(['modelo_passe' => ['required', 'integer', 'min:1', 'max:12']]);
        $condominio->update(['modelo_passe' => (int) $request->input('modelo_passe')]);

        return back()->with('success', 'Modelo do passe actualizado.');
    }

    private function autoriza(Request $request, PreAprovacao $passe): void
    {
        abort_if($passe->empresa_gestora_id !== $request->user()->empresa_gestora_id, 403);
    }

    private function notificarCondomino(PreAprovacao $passe, FcmSenderService $fcm, bool $aprovado): void
    {
        if (! $passe->condomino_id) {
            return;
        }
        $user = User::whereHas('condomino', fn ($q) => $q->where('id', $passe->condomino_id))->first();
        if (! $user) {
            return;
        }
        $titulo = $aprovado ? '✅ Passe aprovado' : 'Passe recusado';
        $corpo = $aprovado
            ? "O passe de {$passe->nome_visitante} foi aprovado. Já o pode descarregar e enviar."
            : "O passe de {$passe->nome_visitante} foi recusado.";
        $fcm->enviarParaUser($user, $titulo, $corpo, ['tipo' => 'passe', 'passe_id' => (string) $passe->id]);
    }
}
