@component('emails.condomino._layout', ['badge' => 'ENCOMENDA', 'tituloHero' => 'Encomenda entregue'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Caro(a) {{ $nome }},</strong></p>
<p style="margin:0 0 16px;">A sua encomenda foi levantada.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">Descrição</div>
<div style="font-size:18px; font-weight:bold; color:#06b6d4; margin:4px 0;">{{ $descricao }}</div>
<div style="font-size:13px; color:#888; margin-top:12px;">Levantada por <strong style="color:#e5e5e5;">{{ $levantadaPor }}</strong> a {{ $data }}</div>
</td></tr>
</table>
<a href="https://ondaka.ao/login" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver na aplicação</a>
@endcomponent
