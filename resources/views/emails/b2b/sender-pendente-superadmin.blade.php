@component('emails.b2b._layout', ['titulo' => 'Sender ID a configurar · ONDAKA'])
<div style="display:inline-block; background:rgba(168,85,247,0.15); color:#a855f7; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">SENDER ID</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Novo remetente a configurar</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
<strong style="color:#fff;">{{ $empresa_nome }}</strong> definiu um nome de remetente personalizado para um condominio. A aguardar configuracao da API key pela equipa ONDAKA.
</p>
<div style="margin:24px 0; padding:16px; background:#0f1235; border-radius:8px; border-left:3px solid #a855f7;">
<div style="color:#bbb; font-size:13px; line-height:1.8;">
<strong style="color:#fff;">Remetente:</strong> {{ $sender_name }}<br>
<strong style="color:#fff;">Condominio:</strong> {{ $condominio_nome }}<br>
<strong style="color:#fff;">Empresa:</strong> {{ $empresa_nome }}
</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/admin/sms" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Configurar</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificacao automatica da plataforma.
</p>
@endcomponent
