@component('emails.b2b._layout', ['titulo' => 'Pagamento confirmado'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Pagamento confirmado ✓</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
Olá {{ $user->name }}, o seu pagamento foi processado com sucesso.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f2010; border-radius:8px; margin:24px 0; border:1px solid rgba(34,197,94,0.3);">
<tr><td style="padding:20px;">
<div style="color:#4ade80; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Valor pago</div>
<div style="color:#fff; font-size:28px; font-weight:bold; margin:8px 0;">
{{ number_format((float)$factura['valor_total_kz'], 2, ',', '.') }} Kz
</div>
<div style="color:#888; font-size:13px;">Factura: {{ $factura['numero'] }}</div>
</td></tr></table>
<p style="color:#ccc; line-height:1.6;">A sua subscrição está agora <strong style="color:#4ade80;">activa</strong>.</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/dashboard" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Aceder ao Dashboard →</a>
</td></tr></table>
@endcomponent
