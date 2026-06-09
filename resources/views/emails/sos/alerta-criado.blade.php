@php
    $isCritico = $alerta->gravidade === 'critico';
    $corPrincipal = $isCritico ? '#dc2626' : '#ea580c';
    $corFundo = $isCritico ? '#fef2f2' : '#fff7ed';
@endphp
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>{{ $assunto ?? 'Alerta SOS' }}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background:{{ $corPrincipal }};padding:24px 28px;text-align:left;">
                            <div style="color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;opacity:0.85;margin-bottom:6px;">
                                {{ $gravidadeLabel }} · #{{ $alerta->id }}
                            </div>
                            <div style="color:#fff;font-size:24px;font-weight:700;line-height:1.2;">
                                {{ $isCritico ? '🚨' : '⚠️' }} SOS — {{ $tipoLabel }}
                            </div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:28px;background:#fff;">

                            <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.5;">
                                Olá <strong>{{ $user->name }}</strong>,
                            </p>

                            <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.5;">
                                Foi acionado um alerta SOS no condomínio sob a sua gestão.
                                @if($isCritico)
                                    <strong style="color:#dc2626;">Esta é uma emergência crítica — actue imediatamente.</strong>
                                @endif
                            </p>

                            <!-- Card resumo -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{{ $corFundo }};border-radius:10px;margin:0 0 24px 0;">
                                <tr><td style="padding:16px 20px;">
                                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Condomínio</div>
                                    <div style="font-size:15px;color:#111827;font-weight:600;margin-bottom:14px;">{{ $condominio->nome }}</div>

                                    @if($alerta->localizacao)
                                        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Localização</div>
                                        <div style="font-size:15px;color:#111827;font-weight:500;margin-bottom:14px;">📍 {{ $alerta->localizacao }}</div>
                                    @endif

                                    @if($alerta->user)
                                        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Autor</div>
                                        <div style="font-size:14px;color:#374151;margin-bottom:14px;">👤 {{ $alerta->user->name }}</div>
                                    @endif

                                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Acionado em</div>
                                    <div style="font-size:14px;color:#374151;">🕐 {{ $alerta->created_at->setTimezone('Africa/Luanda')->format('d/m/Y H:i') }} (Luanda)</div>
                                </td></tr>
                            </table>

                            @if($alerta->descricao)
                                <div style="background:#f9fafb;border-left:3px solid {{ $corPrincipal }};padding:12px 16px;margin:0 0 24px 0;border-radius:4px;">
                                    <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Descrição</div>
                                    <div style="font-size:14px;color:#374151;font-style:italic;line-height:1.5;">"{{ $alerta->descricao }}"</div>
                                </div>
                            @endif

                            @if($alerta->fotos && $alerta->fotos->count() > 0)
                                <div style="margin:0 0 24px 0;">
                                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">📷 Fotos anexadas ({{ $alerta->fotos->count() }})</div>
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            @foreach($alerta->fotos as $foto)
                                                <td style="padding-right:8px;">
                                                    <a href="{{ $foto->url }}" target="_blank" style="display:inline-block;">
                                                        <img src="{{ $foto->url }}" alt="Foto #{{ $foto->id }}" width="140" height="140" style="display:block;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;" />
                                                    </a>
                                                </td>
                                            @endforeach
                                        </tr>
                                    </table>
                                </div>
                            @endif

                            <!-- CTA -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr><td align="center" style="padding:8px 0 4px 0;">
                                    <a href="{{ $urlDetalhe }}" style="display:inline-block;background:{{ $corPrincipal }};color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                                        Ver alerta e responder →
                                    </a>
                                </td></tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f9fafb;padding:20px 28px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.5;border-top:1px solid #e5e7eb;">
                            Este email foi enviado automaticamente pelo sistema ONDAKA.<br/>
                            Não responda a este email. Para gerir o alerta, use o link acima.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
