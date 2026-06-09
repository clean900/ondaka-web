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
<tr><td style="padding:32px; background:linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%);">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="text-align:left; vertical-align:middle;">
<div style="font-size:24px; font-weight:bold; color:#ffffff; letter-spacing:2px;">ONDAKA</div>
</td>
<td style="text-align:right; vertical-align:middle;">
<span style="display:inline-block; background:rgba(255,255,255,0.2); color:#fff; font-size:11px; font-weight:bold; padding:6px 14px; border-radius:20px; letter-spacing:1px;">{{ $badge ?? 'NOTIFICAÇÃO' }}</span>
</td>
</tr></table>
@isset($tituloHero)
<div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:20px;">{{ $tituloHero }}</div>
@endisset
</td></tr>
<tr><td style="padding:32px; color:#e5e5e5; line-height:1.6;">
{!! $slot ?? '' !!}
</td></tr>
<tr><td style="padding:24px 32px; background:#0f0f1f; border-top:1px solid #1f1f2e;">
<div style="font-size:13px; font-weight:bold; color:#fff;">ONDAKA</div>
<div style="font-size:12px; color:#888; margin-top:4px;">Plataforma de gestão de condomínios · ao serviço da <strong style="color:#aaa;">sua administração</strong></div>
<div style="font-size:11px; color:#666; margin-top:12px; border-top:1px solid #1f1f2e; padding-top:12px;">Email automático da plataforma ONDAKA.</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
