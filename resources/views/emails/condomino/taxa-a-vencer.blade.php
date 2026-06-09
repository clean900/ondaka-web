@component('emails.condomino._layout', ['badge' => 'TAXA A VENCER', 'tituloHero' => 'Lembrete de taxa de condomínio'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Caro(a) {{ $nome }},</strong></p>
<p style="margin:0 0 16px;">A sua taxa de condomínio de <strong style="color:#fff;">{{ $periodo }}</strong> vence em <strong style="color:#06b6d4;">{{ $dias }} dias</strong>.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">Valor a pagar</div>
<div style="font-size:28px; font-weight:bold; color:#06b6d4; margin:4px 0;">{{ $valor }} Kz</div>
<div style="font-size:13px; color:#888; margin-top:12px;">Vence a <strong style="color:#e5e5e5;">{{ $vencimento }}</strong></div>
</td></tr>
</table>
<p style="margin:0 0 16px;">Pague atempadamente para evitar multas.</p>
<a href="https://ondaka.ao/login" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver na aplicação</a>
@endcomponent
