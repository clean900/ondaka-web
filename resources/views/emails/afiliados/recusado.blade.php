@component('emails.b2b._layout', ['titulo' => 'Candidatura a afiliado · ONDAKA'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Candidatura não aprovada</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">Olá <strong style="color:#fff;">{{ $afiliado->nome }}</strong>, obrigado pelo interesse no Programa de Afiliados ONDAKA. De momento não foi possível aprovar a sua candidatura.</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #ef4444;">
<div style="color:#888; font-size:12px; margin-bottom:4px;">MOTIVO</div>
<div style="color:#fff; font-size:14px; line-height:1.6;">{{ $motivo }}</div>
</div>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">Se acha que houve um engano, responda a este email ou contacte-nos através de ondaka.ao.</p>
@endcomponent
