@component('emails.condomino._layout', ['badge' => 'TAXA EM ATRASO', 'tituloHero' => 'Taxa de condomínio vencida'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Caro(a) {{ $nome }},</strong></p>
<p style="margin:0 0 16px;">A sua taxa de condomínio referente a <strong style="color:#fff;">{{ $periodo }}</strong> encontra-se em atraso.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">Valor em dívida</div>
<div style="font-size:28px; font-weight:bold; color:#ec4899; margin:4px 0;">{{ $valor }} Kz</div>
<div style="font-size:13px; color:#888; margin-top:12px;">Vencida desde <strong style="color:#e5e5e5;">{{ $vencimento }}</strong></div>
</td></tr>
</table>
<p style="margin:0 0 16px;">Regularize o pagamento o quanto antes para evitar multas adicionais.</p>
<a href="https://ondaka.ao/login" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver na aplicação</a>
@endcomponent
