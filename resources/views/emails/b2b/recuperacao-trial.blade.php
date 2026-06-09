@component('emails.b2b._layout', ['titulo' => 'Trial a expirar'])
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">⏰ O seu trial expira em {{ $dias_restantes }} {{ $dias_restantes === 1 ? 'dia' : 'dias' }}</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
Olá {{ $user->name }}, o trial da empresa <strong style="color:#fff;">{{ $empresa->nome }}</strong> está a chegar ao fim.
</p>
<div style="margin:24px 0; padding:20px; background:linear-gradient(135deg, rgba(251,191,36,0.1), rgba(239,68,68,0.1)); border-radius:8px; border:1px solid rgba(251,191,36,0.3);">
<div style="color:#fbbf24; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Tempo restante</div>
<div style="color:#fff; font-size:28px; font-weight:bold;">{{ $dias_restantes }} {{ $dias_restantes === 1 ? 'dia' : 'dias' }}</div>
</div>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
Para continuar a usar a ONDAKA sem interrupções, subscreva agora:
</p>
<ul style="color:#bbb; line-height:1.8; padding-left:20px; margin:16px 0;">
<li>Pagamento Multicaixa Express, ATM ou homebanking</li>
<li>Cancele quando quiser, sem compromisso</li>
<li>Mantenha todos os dados e configurações</li>
</ul>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/subscricao" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Subscrever agora →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; margin-top:24px;">Após o fim do trial, o acesso será limitado até confirmar pagamento.</p>
@endcomponent
