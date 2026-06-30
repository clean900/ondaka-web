<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #1a1a2e; background: #f4f5f7; margin: 0; padding: 24px; }
        .card { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
        .top { background: linear-gradient(135deg, #00B8D4, #6B21A8); padding: 20px 24px; color: #fff; }
        .top h1 { margin: 0; font-size: 18px; }
        .body { padding: 24px; font-size: 14px; line-height: 1.6; color: #374151; }
        .meta { color: #6b7280; font-size: 12px; margin-top: 12px; }
        .foot { padding: 16px 24px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="card">
        <div class="top"><h1>{{ $agendado->titulo }}</h1></div>
        <div class="body">
            <p>Olá,</p>
            <p>Segue em anexo o relatório financeiro do condomínio gerado automaticamente pela plataforma ONDAKA.</p>
            <div class="meta">
                Período: últimos {{ $agendado->meses }} meses ·
                Frequência: {{ $agendado->frequencia === 'semanal' ? 'semanal' : 'mensal' }}
            </div>
        </div>
        <div class="foot">
            ONDAKA · Soluções Simples, Lda — relatório enviado automaticamente. Para deixar de receber, ajuste o agendamento na plataforma.
        </div>
    </div>
</body>
</html>
