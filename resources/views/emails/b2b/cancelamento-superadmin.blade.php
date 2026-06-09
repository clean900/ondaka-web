@component('emails.b2b._layout', ['titulo' => 'Cancelamento de subscrição · ONDAKA'])
<div style="display:inline-block; background:rgba(248,113,113,0.15); color:#f87171; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🔻 SUBSCRIÇÃO CANCELADA</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Cliente cancelou a subscrição</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
<strong style="color:#fff;">{{ $empresa->nome }}</strong> cancelou a subscrição (self-service).
</p>
<div style="margin:24px 0; padding:16px; background:#0f1235; border-radius:8px; border-left:3px solid #f87171;">
<div style="color:#bbb; font-size:13px; line-height:1.8;">
<strong style="color:#fff;">Motivo:</strong> {{ $motivo }}<br>
<strong style="color:#fff;">Acesso mantém-se até:</strong> {{ $acesso_ate }}
</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin/clientes" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver cliente →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificação automática da plataforma.
</p>
@endcomponent
