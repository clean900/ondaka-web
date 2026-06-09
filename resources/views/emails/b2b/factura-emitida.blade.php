@component('emails.b2b._layout', ['titulo' => 'Factura emitida'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Factura {{ $factura['numero'] }}</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
Olá {{ $user->name }}, foi emitida uma factura para a sua subscrição.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1235; border-radius:8px; margin:24px 0;">
<tr><td style="padding:20px;">
<div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Valor a pagar</div>
<div style="color:#fff; font-size:32px; font-weight:bold; margin:8px 0; background:linear-gradient(135deg, #60a5fa, #a855f7); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;">
{{ number_format((float)$factura['valor_total_kz'], 2, ',', '.') }} Kz
</div>
<div style="color:#888; font-size:13px;">Factura: {{ $factura['numero'] }}</div>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/subscricao" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Pagar agora →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; margin-top:24px;">Pagamento via Multicaixa Express, ATM ou homebanking.</p>
@endcomponent
