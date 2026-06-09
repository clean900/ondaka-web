<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        * { font-family: DejaVu Sans, sans-serif; }
        body { margin: 0; color: #1a1a2e; font-size: 12px; }

        /* Faixa escura de topo com o logo (identidade ONDAKA) */
        .topbar { background: #0a0a1f; padding: 22px 48px; }
        .topbar img { height: 54px; width: auto; }

        .wrap { padding: 28px 48px 40px; }

        .cond-bar { border-bottom: 3px solid #06b6d4; padding-bottom: 12px; margin-bottom: 22px; }
        .cond-nome { font-size: 15px; font-weight: bold; color: #1a1a2e; }
        .cond-sub { font-size: 10px; color: #64748b; margin-top: 2px; }

        .doc-title { font-size: 18px; font-weight: bold; margin: 4px 0 4px; color: #1a1a2e; }
        .doc-ref { font-size: 11px; color: #64748b; }
        .badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;
                 padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; }
        .grid { width: 100%; margin: 20px 0; }
        .grid td { padding: 6px 0; vertical-align: top; }
        .label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 13px; font-weight: bold; color: #1a1a2e; }
        .section-title { font-size: 12px; font-weight: bold; color: #0e7490; margin: 24px 0 8px;
                         border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        table.itens { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.itens th { background: #f1f5f9; color: #475569; font-size: 10px; text-transform: uppercase;
                         text-align: left; padding: 8px 10px; }
        table.itens td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        table.itens td.valor { text-align: right; font-weight: bold; }
        .total-row td { background: #f8fafc; font-weight: bold; font-size: 13px; padding: 10px; }
        .total-row td.valor { text-align: right; color: #047857; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0;
                  font-size: 9px; color: #94a3b8; line-height: 1.5; }
        .aviso { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;
                 padding: 10px 12px; margin-top: 20px; font-size: 10px; color: #92400e; }
    </style>
</head>
<body>
    <div class="topbar">
        @if($logoBase64)
            <img src="{{ $logoBase64 }}" alt="ONDAKA">
        @else
            <span style="color:#fff; font-size:22px; font-weight:bold; letter-spacing:1px;">ONDAKA</span>
        @endif
    </div>

<div class="wrap">
    <div class="cond-bar">
        <div class="cond-nome">{{ $condominioNome }}</div>
        <div class="cond-sub">Gestão de condomínio</div>
    </div>

    <table style="width:100%;">
        <tr>
            <td style="width:65%;">
                <div class="doc-title">Confirmação de Pagamento</div>
                <div class="doc-ref">N.º {{ $referencia }}</div>
            </td>
            <td style="text-align:right; vertical-align:top;">
                <span class="badge">PAGAMENTO CONFIRMADO</span>
            </td>
        </tr>
    </table>

    <table class="grid">
        <tr>
            <td style="width:50%;">
                <div class="label">Condómino</div>
                <div class="value">{{ $condominoNome }}</div>
            </td>
            <td style="width:50%;">
                <div class="label">Imóvel</div>
                <div class="value">{{ $imovel }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Data do Pagamento</div>
                <div class="value">{{ $dataPagamento }}</div>
            </td>
            <td>
                <div class="label">Método</div>
                <div class="value">{{ $metodo }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Confirmado em</div>
                <div class="value">{{ $confirmadoEm }}</div>
            </td>
            <td>
                <div class="label">Valor Total</div>
                <div class="value" style="color:#047857;">{{ $valorTotal }} Kz</div>
            </td>
        </tr>
    </table>

    @if(count($itens) > 0)
    <div class="section-title">Lançamentos Liquidados</div>
    <table class="itens">
        <thead>
            <tr>
                <th>Descrição</th>
                <th style="text-align:right;">Valor Aplicado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($itens as $item)
            <tr>
                <td>{{ $item['descricao'] }}</td>
                <td class="valor">{{ $item['valor'] }} Kz</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>Total Aplicado</td>
                <td class="valor">{{ $valorTotal }} Kz</td>
            </tr>
        </tbody>
    </table>
    @endif

    <div class="aviso">
        <strong>Aviso:</strong> Este documento é uma confirmação interna de pagamento emitida pela plataforma ONDAKA.
        Não constitui recibo nem factura fiscal nos termos da legislação da AGT (Administração Geral Tributária).
    </div>

    <div class="footer">
        @if($nifEmissor)NIF: {{ $nifEmissor }} &nbsp;·&nbsp; @endif
        {{ $condominioNome }}<br>
        Documento gerado eletronicamente em {{ $geradoEm }} pela plataforma ONDAKA (ondaka.ao).
    </div>
</div>
</body>
</html>
