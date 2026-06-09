@component('emails.b2b._layout', ['titulo' => 'Saldo SMS baixo · ONDAKA'])
<div style="display:inline-block; background:rgba(251,191,36,0.15); color:#fbbf24; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">⚠ SALDO SMS BAIXO</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Recarregue o saldo de SMS</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
O saldo do Serviço SMS ONDAKA está abaixo do limite definido. Sem saldo, o <strong style="color:#fff;">2FA</strong> e os <strong style="color:#fff;">avisos por SMS</strong> deixam de funcionar.
</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #fbbf24; text-align:center;">
<div style="color:#888; font-size:12px; margin-bottom:4px;">SALDO ACTUAL</div>
<div style="color:#fbbf24; font-size:32px; font-weight:bold;">{{ $saldo }} SMS</div>
<div style="color:#888; font-size:12px; margin-top:8px;">Limite mínimo: {{ $limite }} SMS</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/admin/sms" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver SMS →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificação automática da plataforma.
</p>
@endcomponent
