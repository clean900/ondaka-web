@component('emails.b2b._layout', ['titulo' => 'Cancelamento da subscrição'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Subscrição cancelada</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
Olá {{ $user->name }}, a subscrição da empresa <strong style="color:#fff;">{{ $empresa->nome }}</strong> foi cancelada.
</p>
@if($motivo)
<div style="margin:24px 0; padding:16px; background:#2a1010; border-radius:8px; border-left:3px solid #ef4444;">
<div style="color:#fca5a5; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Motivo</div>
<div style="color:#ccc; font-size:14px;">{{ $motivo }}</div>
</div>
@endif
<p style="color:#ccc; line-height:1.6;">
A sua subscrição mantém-se <strong style="color:#fbbf24;">activa até ao fim do período pago</strong>. Após essa data, o acesso será limitado.
</p>
<p style="color:#ccc; line-height:1.6;">Mudou de ideias? Pode reactivar a qualquer momento.</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/subscricao" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Reactivar subscrição →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; margin-top:24px;">Lamentamos vê-lo partir. Se tiver feedback, responda a este email.</p>
@endcomponent
