@component('emails.b2b._layout', ['titulo' => ($eh_conversao ? 'Subscrição activada' : 'Pagamento recebido') . ' · ONDAKA'])
@php
    $badge = $eh_conversao ? '💰 SUBSCRIÇÃO ACTIVADA' : '🔄 PAGAMENTO RECEBIDO';
    $h1 = $eh_conversao ? 'Novo cliente pagante!' : 'Pagamento confirmado';
@endphp
<div style="display:inline-block; background:rgba(96,165,250,0.15); color:#60a5fa; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">{{ $badge }}</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">{{ $h1 }}</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
@if($eh_conversao)
<strong style="color:#fff;">{{ $empresa->nome }}</strong> pagou e <strong style="color:#60a5fa;">activou a subscrição</strong>. Trial convertido em cliente pagante.
@else
<strong style="color:#fff;">{{ $empresa->nome }}</strong> efectuou o pagamento da subscrição.
@endif
</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #22c55e; text-align:center;">
<div style="color:#888; font-size:12px; margin-bottom:4px;">VALOR RECEBIDO</div>
<div style="color:#22c55e; font-size:28px; font-weight:bold;">{{ $valor }}</div>
<div style="color:#888; font-size:12px; margin-top:8px;">Factura {{ $factura_numero }}</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin/facturas-plataforma" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver facturas →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">
Notificação automática da plataforma.
</p>
@endcomponent
