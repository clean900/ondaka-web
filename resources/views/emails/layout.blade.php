<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>{{ $assunto ?? 'ONDAKA' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#e9edf3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9edf3;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;font-family:Segoe UI,Arial,sans-serif;">

        <!-- CABEÇALHO co-branded -->
        <tr>
          <td style="background-color:#7c5cff;background-image:linear-gradient(120deg,#22d3ee 0%,#7c5cff 55%,#ec4899 100%);padding:26px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:middle;"><img src="https://ondaka.ao/img/ondaka_app_icon_40x40.png" alt="ONDAKA" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.45);"></td>
                    <td style="padding-left:10px;color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px;vertical-align:middle;">ONDAKA</td>
                  </tr></table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;font-size:11px;color:#ffffff;background-color:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.35);border-radius:8px;padding:7px 11px;line-height:1.35;text-align:right;">
                    <strong style="display:block;font-size:12px;">{{ $empresaNome ?? 'Empresa Gestora' }}</strong>Gestão de Condomínios
                  </span>
                </td>
              </tr>
            </table>
            @if(!empty($badge))
            <div style="margin-top:18px;"><span style="display:inline-block;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#ffffff;background-color:rgba(255,255,255,0.2);padding:4px 11px;border-radius:20px;">{{ $badge }}</span></div>
            @endif
            <div style="margin-top:10px;color:#ffffff;font-size:23px;font-weight:bold;line-height:1.25;">{{ $titulo ?? ($assunto ?? '') }}</div>
            @if(!empty($condominioNome))
            <div style="margin-top:6px;color:#ffffff;font-size:13px;opacity:0.95;">{{ $condominioNome }}</div>
            @endif
          </td>
        </tr>

        <!-- CORPO (cada email preenche aqui) -->
        <tr>
          <td style="padding:28px;">
            @yield('conteudo')
          </td>
        </tr>

        <!-- RODAPÉ -->
        <tr>
          <td style="background-color:#16203a;padding:22px 28px;font-size:12px;line-height:1.6;color:#aeb9cc;">
            <div style="color:#ffffff;font-weight:bold;font-size:14px;margin-bottom:4px;">ONDAKA</div>
            Plataforma de gestão de condomínios &middot; ao serviço da <strong>{{ $empresaNome ?? 'sua administração' }}</strong>
            <div style="border-top:1px solid #2a3654;margin:14px 0;"></div>
            <div style="color:#6b7688;font-size:11px;">
              @if(!empty($condominioNome))
                Email automático relativo ao {{ $condominioNome }}.
              @else
                Email automático da plataforma ONDAKA.
              @endif
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
