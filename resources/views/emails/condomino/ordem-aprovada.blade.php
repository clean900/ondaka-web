@component('emails.condomino._layout', ['badge' => 'PAGAMENTO', 'tituloHero' => 'Pagamento confirmado'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Olá!</strong></p>
<p style="margin:0 0 16px;">A sua ordem <strong style="color:#fff;">{{ $numero }}</strong> foi <strong style="color:#06b6d4;">aprovada</strong> e a funcionalidade foi activada na sua conta.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">{{ $descricaoItem }}</div>
<div style="font-size:28px; font-weight:bold; color:#06b6d4; margin:4px 0;">{{ $valor }}</div>
@if($facturaNumero)<div style="font-size:13px; color:#888; margin-top:12px;">Factura <strong style="color:#e5e5e5;">{{ $facturaNumero }}</strong>{{ $temAnexo ? ' (em anexo)' : '' }}</div>@endif
</td></tr>
</table>
<a href="{{ $url }}" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver ordem</a>
<p style="margin:16px 0 0; font-size:13px; color:#888;">Obrigado pela sua confiança em ONDAKA.</p>
@endcomponent
