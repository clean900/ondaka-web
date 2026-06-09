@component('emails.b2b._layout', ['titulo' => 'Novo cliente · ONDAKA'])
<div style="display:inline-block; background:rgba(96,165,250,0.15); color:#60a5fa; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🎉 NOVO CLIENTE</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Novo registo na plataforma</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
<strong style="color:#fff;">{{ $empresa->nome }}</strong> ({{ $tipo }}) registou-se e iniciou o trial de 30 dias.
</p>
<div style="margin:24px 0; padding:16px; background:#0f1235; border-radius:8px; border-left:3px solid #60a5fa;">
<div style="color:#bbb; font-size:13px; line-height:1.8;">
<strong style="color:#fff;">Responsável:</strong> {{ $responsavel_nome }} ({{ $responsavel_email }})<br>
<strong style="color:#fff;">Localização:</strong> {{ $localizacao }}<br>
<strong style="color:#fff;">Tipo:</strong> {{ $tipo }}
</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin/clientes" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver cliente →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificação automática da plataforma.
</p>
@endcomponent
