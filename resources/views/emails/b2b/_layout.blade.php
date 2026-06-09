<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $titulo ?? 'ONDAKA' }}</title>
</head>
<body style="margin:0; padding:0; background:#0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1a2e; border-radius:12px; overflow:hidden;">
<tr><td style="padding:24px 32px; background-color:#7c5cff; background-image:linear-gradient(120deg,#22d3ee 0%,#7c5cff 55%,#ec4899 100%);">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;"><img src="https://ondaka.ao/img/ondaka_app_icon_40x40.png" alt="ONDAKA" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.45);"></td>
<td style="padding-left:10px;vertical-align:middle;"><div style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">ONDAKA</div><div style="font-size:11px;color:rgba(255,255,255,0.85);">Soluções Simples, Lda</div></td>
</tr></table>
</td></tr>
<tr><td style="padding:32px; color:#e5e5e5;">
{!! $slot ?? '' !!}
</td></tr>
<tr><td style="padding:24px 32px; background:#0f0f1f; border-top:1px solid #1f1f2e; text-align:center;">
<div style="font-size:11px; color:#888;">© {{ date('Y') }} Soluções Simples, Lda · ondaka.ao</div>
<div style="font-size:11px; color:#666; margin-top:8px;">
<a href="https://ondaka.ao" style="color:#60a5fa; text-decoration:none;">Site</a> ·
<a href="https://ondaka.ao/login" style="color:#60a5fa; text-decoration:none;">Aceder à plataforma</a>
</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
