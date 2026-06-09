@component('emails.condomino._layout', ['badge' => 'ACTA', 'tituloHero' => 'Acta disponível'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Caro(a) {{ $nome }},</strong></p>
<p style="margin:0 0 16px;">A acta da assembleia <strong style="color:#fff;">{{ $assembleia }}</strong> já está disponível para consulta.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:20px 0;">
<tr><td style="padding:20px;">
<div style="font-size:13px; color:#888;">Assembleia de</div>
<div style="font-size:18px; font-weight:bold; color:#06b6d4; margin:4px 0;">{{ $data }}</div>
</td></tr>
</table>
<a href="https://ondaka.ao/login" style="display:inline-block; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Ver a acta</a>
@endcomponent
