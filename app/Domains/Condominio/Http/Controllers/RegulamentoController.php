<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * F-01: regulamento do condomínio (template DP 141/15), editável pelo gestor e
 * publicável no mobile. O corpo é HTML editável; ver() serve o documento final
 * com a marca ONDAKA (imprimível, aberto também no mobile).
 */
class RegulamentoController extends Controller
{
    public function editar(Request $request, Condominio $condominio): InertiaResponse
    {
        $this->autorizar($request, $condominio);

        return Inertia::render('Condominio/Regulamento', [
            'condominio' => [
                'id' => $condominio->id,
                'nome' => $condominio->nome,
                'regulamento_mobile' => (bool) $condominio->regulamento_mobile,
            ],
            'html' => $condominio->regulamento_html ?: $this->template($condominio),
            'urlVer' => "/condominios/{$condominio->id}/regulamento/ver",
        ]);
    }

    public function guardar(Request $request, Condominio $condominio): RedirectResponse
    {
        $this->autorizar($request, $condominio);

        $dados = $request->validate([
            'html' => 'required|string|max:120000',
            'regulamento_mobile' => 'boolean',
        ]);

        // Segurança mínima: remover <script>.
        $html = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $dados['html']);

        $condominio->update([
            'regulamento_html' => $html,
            'regulamento_mobile' => $request->boolean('regulamento_mobile'),
        ]);

        return back()->with('success', 'Regulamento guardado.');
    }

    /**
     * Página pública do regulamento (imprimível, aberta no browser/mobile).
     */
    public function ver(Condominio $condominio): Response
    {
        $corpo = $condominio->regulamento_html ?: $this->template($condominio);

        $pagina = '<!DOCTYPE html><html lang="pt-PT"><head><meta charset="UTF-8">'
            .'<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            .'<title>Regulamento · '.e($condominio->nome).' · ONDAKA</title><style>'
            .'body{margin:0;background:#0a0a14;color:#1f2937;font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:24px}'
            .'.doc{max-width:820px;margin:0 auto;background:#fff;border-radius:14px;padding:40px 46px;box-shadow:0 10px 40px rgba(0,0,0,.4)}'
            .'.brand{text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:18px;margin-bottom:24px}'
            .'.brand img{height:54px;object-fit:contain}'
            .'.brand .tag{font-size:12px;color:#6b7280;margin-top:6px}'
            .'h1{font-size:24px;text-align:center;margin:14px 0 4px}'
            .'h3{font-size:17px;margin:22px 0 6px;padding-bottom:5px;border-bottom:1px solid #e5e7eb}'
            .'p{font-size:14px;line-height:1.7;color:#374151;margin:6px 0}.art{font-weight:600;color:#111827}'
            .'@media print{body{background:#fff;padding:0}.doc{box-shadow:none;border-radius:0}}'
            .'</style></head><body><div class="doc">'
            .'<div class="brand"><img src="/img/ondaka-logo.png" alt="ONDAKA">'
            .'<div class="tag">Gestão inteligente para o seu condomínio</div></div>'
            .$corpo
            .'</div></body></html>';

        return response($pagina, 200, ['Content-Type' => 'text/html; charset=utf-8']);
    }

    private function autorizar(Request $request, Condominio $condominio): void
    {
        $empresaId = $request->user()->empresa_gestora_id;
        if (! $empresaId || $condominio->empresa_gestora_id !== $empresaId) {
            abort(403);
        }
    }

    /**
     * Template inicial do regulamento, conforme o DP 141/15.
     */
    private function template(Condominio $condominio): string
    {
        $nome = e($condominio->nome);

        return <<<HTML
<h1>Regulamento do condomínio</h1>
<p style="text-align:center;color:#6b7280;font-size:13px">Condomínio <b>{$nome}</b> · Conforme o Decreto Presidencial n.º 141/15</p>

<h3>Capítulo I — Disposições gerais</h3>
<p><span class="art">Art. 1.º (Objeto).</span> O presente regulamento estabelece as normas de funcionamento, uso e conservação das partes comuns e privativas, em conformidade com o Decreto Presidencial n.º 141/15.</p>
<p><span class="art">Art. 2.º (Âmbito).</span> Aplica-se a todos os condóminos, residentes, familiares, visitantes e prestadores de serviço.</p>

<h3>Capítulo II — Órgãos do condomínio</h3>
<p><span class="art">Art. 3.º (Assembleia Geral).</span> Órgão máximo do condomínio, composto por todos os condóminos.</p>
<p><span class="art">Art. 4.º (Administração).</span> A administração/comissão de moradores executa as deliberações e gere o dia-a-dia do condomínio.</p>

<h3>Capítulo III — Direitos dos condóminos</h3>
<p><span class="art">Art. 5.º</span> Participar e votar nas assembleias, realizadas com periodicidade semestral.</p>
<p><span class="art">Art. 6.º</span> Aceder aos relatórios financeiros e à prestação de contas, disponibilizados trimestralmente na app.</p>
<p><span class="art">Art. 7.º</span> Utilizar as partes comuns — piscina, salão de festas e áreas verdes — nos termos deste regulamento.</p>
<p><span class="art">Art. 8.º</span> Reportar avarias e ter os problemas técnicos internos resolvidos dentro do prazo definido no Capítulo VIII.</p>

<h3>Capítulo IV — Deveres dos condóminos</h3>
<p><span class="art">Art. 9.º</span> Pagar pontualmente a taxa de condomínio até ao dia 10 de cada mês.</p>
<p><span class="art">Art. 10.º</span> Conservar a sua fração e contribuir para a conservação e bom uso das partes comuns.</p>
<p><span class="art">Art. 11.º</span> Respeitar o descanso e a convivência, observando o horário de silêncio entre as 22h e as 07h.</p>

<h3>Capítulo V — Gestão de bens comuns</h3>
<p><span class="art">Art. 12.º (Piscina).</span> Horário de utilização 08h–20h; uso sob responsabilidade própria; proibido o uso de objetos de vidro.</p>
<p><span class="art">Art. 13.º (Salão de festas).</span> Reserva prévia pela app; caução de 15 000 Kz; entrega do espaço limpo e em bom estado.</p>

<h3>Capítulo VI — Fundo de reserva</h3>
<p><span class="art">Art. 14.º</span> O condomínio mantém um fundo de reserva de, no mínimo, 10% das contribuições, conforme o Art. 20.º do DP 141/15.</p>

<h3>Capítulo VII — Assembleias</h3>
<p><span class="art">Art. 15.º</span> Assembleia ordinária semestral; extraordinárias quando convocadas. Convocação com 15 dias de antecedência, com ordem de trabalhos.</p>

<h3>Capítulo VIII — Resolução de problemas técnicos (SLA)</h3>
<p><span class="art">Art. 16.º</span> Urgências (água, elevador, segurança): resolução em 24 horas. Não urgentes: 5 dias úteis. Todos os pedidos são registados na app ONDAKA com acompanhamento do estado.</p>

<h3>Capítulo IX — Infrações e sanções</h3>
<p><span class="art">Art. 17.º</span> O incumprimento sujeita o condómino a advertência e a multa, nos montantes e termos deliberados em Assembleia Geral.</p>

<h3>Capítulo X — Disposições finais</h3>
<p><span class="art">Art. 18.º</span> Os casos omissos são resolvidos pela Assembleia Geral e pela legislação aplicável, designadamente o Decreto Presidencial n.º 141/15.</p>
HTML;
    }
}
