<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>{{ $factura->numero }}</title>
    <style>
        @page {
            margin: 30px 40px;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            color: #1a1a2e;
            line-height: 1.4;
        }

        /* Header */
        .header {
            padding-bottom: 12px;
            margin-bottom: 18px;
            border-bottom: 3px solid #00D4FF;
        }
        .header-table {
            width: 100%;
            border: none;
        }
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        .brand {
            font-size: 26pt;
            font-weight: bold;
            letter-spacing: -1px;
            color: #0A0A1A;
        }
        .brand-sub {
            font-size: 8pt;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
        }
        .doc-meta {
            text-align: right;
        }
        .doc-type {
            display: inline-block;
            background: #0A0A1A;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .doc-numero {
            font-size: 13pt;
            font-weight: bold;
            margin-top: 6px;
            color: #0A0A1A;
        }
        .doc-data {
            font-size: 9pt;
            color: #666;
            margin-top: 2px;
        }

        /* Partes - emissor / destinatário */
        .partes {
            width: 100%;
            margin-bottom: 18px;
        }
        .partes td {
            width: 50%;
            padding: 10px 14px;
            vertical-align: top;
            background: #F8F9FC;
            border: 1px solid #E5E7EB;
        }
        .partes td.separador {
            background: none;
            border: none;
            width: 10px;
            padding: 0;
        }
        .parte-label {
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #999;
            margin-bottom: 4px;
        }
        .parte-nome {
            font-size: 11pt;
            font-weight: bold;
            color: #0A0A1A;
            margin-bottom: 4px;
        }
        .parte-linha {
            font-size: 9pt;
            color: #444;
            margin-bottom: 1px;
        }
        .parte-linha strong {
            color: #0A0A1A;
        }

        /* Tabela linhas */
        .linhas-table {
            width: 100%;
            margin-bottom: 16px;
            border-collapse: collapse;
        }
        .linhas-table th {
            background: #0A0A1A;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .linhas-table th.right { text-align: right; }
        .linhas-table td {
            padding: 10px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 9pt;
        }
        .linhas-table td.right { text-align: right; }
        .linhas-table tr:last-child td {
            border-bottom: 2px solid #0A0A1A;
        }
        .linha-descricao {
            color: #0A0A1A;
        }
        .linha-muted {
            color: #666;
            font-size: 8pt;
        }

        /* Totais */
        .totais {
            width: 280px;
            float: right;
            margin-bottom: 18px;
        }
        .totais-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totais-table td {
            padding: 5px 10px;
            font-size: 9pt;
        }
        .totais-table td.label {
            color: #666;
        }
        .totais-table td.valor {
            text-align: right;
            color: #0A0A1A;
            font-weight: bold;
        }
        .totais-table tr.final td {
            background: #0A0A1A;
            color: white;
            font-size: 12pt;
            padding: 10px;
        }
        .totais-table tr.final td.label {
            color: #A855F7;
        }
        .totais-table tr.final td.valor {
            color: white;
        }

        .clear { clear: both; }

        /* Observações */
        .observacoes {
            margin-top: 16px;
            padding: 12px 14px;
            background: #F8F9FC;
            border-left: 3px solid #00D4FF;
            font-size: 9pt;
            color: #444;
            white-space: pre-line;
        }
        .observacoes-label {
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #999;
            margin-bottom: 4px;
        }

        /* Rodapé */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
            font-size: 7pt;
            color: #999;
            text-align: center;
        }
        .footer-hash {
            font-family: 'Courier New', monospace;
            font-size: 6pt;
            color: #BBB;
            margin-top: 3px;
        }

        /* Badge Factura-Recibo */
        .paga-stamp {
            position: absolute;
            top: 180px;
            right: 40px;
            transform: rotate(-15deg);
            color: rgba(16, 185, 129, 0.15);
            font-size: 60pt;
            font-weight: bold;
            letter-spacing: 3px;
        }
    </style>
</head>
<body>

    @if($factura->tipo_documento === 'FR')
        <div class="paga-stamp">PAGA</div>
    @endif

    <!-- HEADER -->
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="brand">ONDAKA</div>
                    <div class="brand-sub">Gestão de Condomínios</div>
                </td>
                <td class="doc-meta">
                    <span class="doc-type">{{ $factura->tipo_documento_label }}</span>
                    <div class="doc-numero">{{ $factura->numero }}</div>
                    <div class="doc-data">
                        Emitida em {{ $factura->data_emissao?->format('d/m/Y') }}
                        @if($factura->data_vencimento)
                            <br>Vencimento: {{ $factura->data_vencimento->format('d/m/Y') }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- PARTES -->
    <table class="partes">
        <tr>
            <td>
                <div class="parte-label">Emissor</div>
                <div class="parte-nome">{{ $factura->emissor_nome }}</div>
                <div class="parte-linha"><strong>NIF:</strong> {{ $factura->emissor_nif }}</div>
                @if($factura->emissor_morada)
                    <div class="parte-linha">{{ $factura->emissor_morada }}</div>
                @endif
                <div class="parte-linha">{{ config('ondaka.emissor.email') }}</div>
                <div class="parte-linha">{{ config('ondaka.emissor.website') }}</div>
            </td>
            <td class="separador"></td>
            <td>
                <div class="parte-label">Destinatário</div>
                <div class="parte-nome">{{ $factura->destinatario_nome }}</div>
                @if($factura->destinatario_nif)
                    <div class="parte-linha"><strong>NIF:</strong> {{ $factura->destinatario_nif }}</div>
                @endif
                @if($factura->destinatario_morada)
                    <div class="parte-linha">{{ $factura->destinatario_morada }}</div>
                @endif
                @if($factura->destinatario_municipio || $factura->destinatario_provincia)
                    <div class="parte-linha">
                        {{ collect([$factura->destinatario_municipio, $factura->destinatario_provincia])->filter()->join(', ') }}
                    </div>
                @endif
                @if($factura->destinatario_email)
                    <div class="parte-linha">{{ $factura->destinatario_email }}</div>
                @endif
            </td>
        </tr>
    </table>

    <!-- LINHAS -->
    <table class="linhas-table">
        <thead>
            <tr>
                <th style="width: 55%">Descrição</th>
                <th class="right" style="width: 10%">Qtd</th>
                <th class="right" style="width: 17%">Preço unit.</th>
                <th class="right" style="width: 18%">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($factura->linhas as $linha)
                <tr>
                    <td>
                        <div class="linha-descricao">{{ $linha['descricao'] }}</div>
                        @if(!empty($linha['taxa_iva']))
                            <div class="linha-muted">IVA {{ number_format((float) $linha['taxa_iva'], 0) }}%</div>
                        @endif
                    </td>
                    <td class="right">{{ $linha['quantidade'] }} {{ $linha['unidade'] ?? '' }}</td>
                    <td class="right">{{ number_format((float) $linha['preco_unitario'], 2, ',', '.') }} Kz</td>
                    <td class="right">{{ number_format((float) $linha['subtotal'], 2, ',', '.') }} Kz</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTAIS -->
    <div class="totais">
        <table class="totais-table">
            <tr>
                <td class="label">Valor base</td>
                <td class="valor">{{ number_format((float) $factura->valor_base, 2, ',', '.') }} Kz</td>
            </tr>
            @if((float) $factura->valor_desconto > 0)
                <tr>
                    <td class="label">Desconto</td>
                    <td class="valor">-{{ number_format((float) $factura->valor_desconto, 2, ',', '.') }} Kz</td>
                </tr>
            @endif
            <tr>
                <td class="label">IVA ({{ number_format((float) $factura->taxa_iva, 0) }}%)</td>
                <td class="valor">{{ number_format((float) $factura->valor_iva, 2, ',', '.') }} Kz</td>
            </tr>
            <tr class="final">
                <td class="label">TOTAL</td>
                <td class="valor">{{ number_format((float) $factura->valor_total, 2, ',', '.') }} Kz</td>
            </tr>
            @if((float) $factura->valor_pago > 0)
                <tr>
                    <td class="label" style="color:#10b981">Pago</td>
                    <td class="valor" style="color:#10b981">{{ number_format((float) $factura->valor_pago, 2, ',', '.') }} Kz</td>
                </tr>
            @endif
        </table>
    </div>
    <div class="clear"></div>

    <!-- OBSERVAÇÕES -->
    @if($factura->observacoes)
        <div class="observacoes">
            <div class="observacoes-label">Observações</div>
            {{ $factura->observacoes }}
        </div>
    @endif

    <!-- RODAPÉ -->
    <div class="footer">
        Documento processado por ONDAKA · {{ $factura->emissor_nome }} · NIF {{ $factura->emissor_nif }}
        <div class="footer-hash">
            Hash: {{ substr($factura->hash_integridade ?? '—', 0, 32) }}...
        </div>
    </div>

</body>
</html>
