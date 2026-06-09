@component('emails.b2b._layout', ['titulo' => 'Tarefa agendada falhou · ONDAKA'])
<div style="display:inline-block; background:rgba(248,113,113,0.15); color:#f87171; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">⚠ TAREFA FALHOU</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Uma tarefa agendada falhou</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
A tarefa automática <strong style="color:#fff;">{{ $tarefa }}</strong> não concluiu com sucesso. Pode afectar facturação, quotas ou avisos automáticos.
</p>
<div style="margin:24px 0; padding:16px; background:#0f1235; border-radius:8px; border-left:3px solid #f87171;">
<div style="color:#bbb; font-size:13px; line-height:1.8;">
<strong style="color:#fff;">Tarefa:</strong> {{ $tarefa }}<br>
<strong style="color:#fff;">Quando:</strong> {{ $momento }}<br>
<strong style="color:#fff;">Detalhe:</strong> {{ $detalhe }}
</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Abrir painel →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificação automática da plataforma.
</p>
@endcomponent
