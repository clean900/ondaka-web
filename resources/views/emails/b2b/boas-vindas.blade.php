@component('emails.b2b._layout', ['titulo' => 'Bem-vindo à ONDAKA'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Bem-vindo, {{ $user->name }}! 🎉</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
A sua conta da empresa <strong style="color:#fff;">{{ $empresa->nome }}</strong> foi criada com sucesso.
</p>
<p style="color:#ccc; line-height:1.6; margin:0 0 24px;">
Tem <strong style="color:#60a5fa;">30 dias de trial gratuito</strong> para experimentar todas as funcionalidades.
Sem compromisso. Cancele quando quiser.
</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/dashboard" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Aceder ao Dashboard →</a>
</td></tr></table>
<div style="margin-top:32px; padding:16px; background:#0f1235; border-radius:8px; border-left:3px solid #60a5fa;">
<div style="color:#60a5fa; font-size:12px; font-weight:bold; margin-bottom:8px;">PRIMEIROS PASSOS</div>
<div style="color:#bbb; font-size:13px; line-height:1.6;">
1. Adicione o seu primeiro condomínio<br>
2. Importe condóminos via Excel<br>
3. Configure cobranças automáticas
</div>
</div>
@endcomponent
