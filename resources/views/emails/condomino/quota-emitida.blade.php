<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quota emitida — ONDAKA</title>
</head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background: #f4f6f9;">
    <div style="background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #0891b2; margin-top: 0;">Olá {{ $nome }},</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Foi emitida uma nova quota mensal para o seu imóvel <strong>{{ $imovel }}</strong>
            no condomínio <strong>{{ $condominio }}</strong>.
        </p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Período</p>
            <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">{{ $periodo }}</p>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Valor a pagar</p>
            <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 24px; font-weight: 700;">{{ $valor }} Kz</p>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Vencimento</p>
            <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">{{ $vencimento }}</p>
        </div>
        <p style="color: #475569; font-size: 14px;">
            Pode aceder à plataforma para ver o extracto, pagar e consultar todas as suas quotas.
        </p>
        <div style="margin: 24px 0;">
            <a href="https://ondaka.ao/extracto" style="display: inline-block; background: linear-gradient(135deg, #0891b2, #7c3aed); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Ver extracto
            </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            Esta é uma mensagem automática da plataforma ONDAKA. Soluções Simples, Lda.
        </p>
    </div>
</body>
</html>
