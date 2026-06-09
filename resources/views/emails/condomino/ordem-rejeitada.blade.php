@component('emails.condomino._layout', ['badge' => 'PAGAMENTO', 'tituloHero' => 'Pagamento não confirmado'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Olá,</strong></p>
<p style="margin:0 0 16px;">A sua ordem <strong style="color:#fff;">{{ $numero }}</strong> foi <strong style="color:#ec4899;">rejeitada</strong>.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">Motivo</div>
<div style="font-size:16px; color:#e5e5e5; margin:4px 0;">{{ $motivo }}</div>
</td></tr>
</table>
<p style="margin:0 0 16px;">Se desejar, pode criar uma nova ordem ou contactar-nos em geral@ondaka.ao.</p>
<a href="{{ $url }}" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver ordem</a>
@endcomponent
