<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Acta {{ $assembleia->numero }}</title>
    <style>
        @page { margin: 30px 40px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            color: #1a1a2e;
            line-height: 1.5;
        }

        .header {
            padding-bottom: 12px;
            margin-bottom: 20px;
            border-bottom: 3px solid #00D4FF;
        }
        .header-table {
            width: 100%;
            border: none;
        }
        .header-left {
            width: 60%;
            vertical-align: top;
        }
        .header-right {
            width: 40%;
            text-align: right;
            vertical-align: top;
            font-size: 9pt;
        }
        .brand {
            font-size: 20pt;
            font-weight: bold;
            color: #00D4FF;
            letter-spacing: 1px;
        }
        .brand-sub {
            font-size: 8pt;
            color: #666;
            margin-top: 2px;
        }
        .doc-title {
            font-size: 16pt;
            font-weight: bold;
            color: #1a1a2e;
            margin-top: 10px;
        }
        .doc-number {
            font-size: 11pt;
            color: #666;
            margin-top: 3px;
            font-family: 'DejaVu Sans Mono', monospace;
        }

        .section {
            margin-bottom: 18px;
        }
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #A855F7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e0e0e6;
            margin-bottom: 8px;
        }
        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }
        .info-label {
            display: table-cell;
            width: 35%;
            color: #666;
            font-size: 9pt;
        }
        .info-value {
            display: table-cell;
            width: 65%;
        }

        .ordem-do-dia {
            background: #f5f7fa;
            padding: 12px 15px;
            border-left: 4px solid #00D4FF;
            white-space: pre-line;
            font-size: 10pt;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        table.data-table th {
            background: #1a1a2e;
            color: #fff;
            text-align: left;
            padding: 6px 8px;
            font-size: 9pt;
            font-weight: bold;
        }
        table.data-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #e8e8ec;
            font-size: 9.5pt;
        }
        table.data-table tr:nth-child(even) td {
            background: #fafafa;
        }

        .ponto-votacao {
            margin-bottom: 14px;
            padding: 10px 12px;
            border: 1px solid #e0e0e6;
            border-radius: 4px;
            page-break-inside: avoid;
        }
        .ponto-titulo {
            font-size: 10.5pt;
            font-weight: bold;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .ponto-descricao {
            font-size: 9pt;
            color: #666;
            margin-bottom: 6px;
            font-style: italic;
        }

        .resultado-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .r-aprovado { background: #d1fae5; color: #065f46; }
        .r-rejeitado { background: #fee2e2; color: #991b1b; }
        .r-empate { background: #fef3c7; color: #92400e; }

        .contagem {
            margin-top: 8px;
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }
        .contagem td {
            padding: 4px 8px;
            border: 1px solid #e0e0e6;
        }
        .contagem td.label { width: 30%; color: #666; }
        .contagem td.val { text-align: right; font-family: 'DejaVu Sans Mono', monospace; }

        .quorum-status {
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 10pt;
        }
        .quorum-ok {
            background: #d1fae5;
            color: #065f46;
            border-left: 4px solid #059669;
        }
        .quorum-fail {
            background: #fee2e2;
            color: #991b1b;
            border-left: 4px solid #dc2626;
        }

        .assinatura-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .assinatura-box {
            display: inline-block;
            width: 48%;
            margin-right: 2%;
            text-align: center;
            font-size: 9pt;
            vertical-align: top;
        }
        .assinatura-linha {
            border-bottom: 1px solid #1a1a2e;
            height: 36px;
            margin-bottom: 4px;
        }
        .assinatura-label {
            color: #666;
            font-size: 8.5pt;
        }

        .footer {
            position: fixed;
            bottom: -20px;
            left: 0;
            right: 0;
            text-align: center;
            color: #999;
            font-size: 7.5pt;
            border-top: 1px solid #e0e0e6;
            padding-top: 6px;
        }

        .legal-note {
            background: #f0f4ff;
            border-left: 3px solid #6366f1;
            padding: 8px 12px;
            font-size: 8.5pt;
            color: #4338ca;
            margin-top: 14px;
        }

        .no-print { page-break-after: avoid; }
    </style>
</head>
<body>

<div class="header">
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="brand">ONDAKA</div>
                <div class="brand-sub">Gestão de Condomínios</div>
                <div class="doc-title">Acta da Assembleia</div>
                <div class="doc-number">{{ $assembleia->numero }}</div>
            </td>
            <td class="header-right">
                <strong>{{ $assembleia->condominio->nome ?? '—' }}</strong><br>
                @if($assembleia->condominio->empresaGestora)
                    {{ $assembleia->condominio->empresaGestora->nome ?? '' }}<br>
                @endif
                <span style="color:#888">Emitido em {{ now()->format('d/m/Y H:i') }}</span>
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <div class="section-title">1. Identificação</div>
    <div class="info-row">
        <div class="info-label">Tipo:</div>
        <div class="info-value">{{ $assembleia->tipo_label }}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Título:</div>
        <div class="info-value"><strong>{{ $assembleia->titulo }}</strong></div>
    </div>
    <div class="info-row">
        <div class="info-label">Data agendada:</div>
        <div class="info-value">{{ $assembleia->data_agendada->format('d/m/Y H:i') }}</div>
    </div>
    @if($assembleia->iniciada_em)
    <div class="info-row">
        <div class="info-label">Iniciada em:</div>
        <div class="info-value">{{ $assembleia->iniciada_em->format('d/m/Y H:i') }}</div>
    </div>
    @endif
    @if($assembleia->terminada_em)
    <div class="info-row">
        <div class="info-label">Terminada em:</div>
        <div class="info-value">{{ $assembleia->terminada_em->format('d/m/Y H:i') }}</div>
    </div>
    @endif
    <div class="info-row">
        <div class="info-label">Modo:</div>
        <div class="info-value">{{ ucfirst($assembleia->modo) }} @if($assembleia->modo === 'virtual') · {{ $assembleia->local }} @endif</div>
    </div>
    <div class="info-row">
        <div class="info-label">Convocada por:</div>
        <div class="info-value">{{ $assembleia->criadaPor->name ?? '—' }}</div>
    </div>
</div>

<div class="section">
    <div class="section-title">2. Quórum</div>
    <div class="quorum-status {{ $quorum['tem_quorum'] ? 'quorum-ok' : 'quorum-fail' }}">
        <strong>{{ $quorum['tem_quorum'] ? 'Quórum atingido' : 'Quórum NÃO atingido' }}</strong><br>
        {{ $quorum['fraccoes_presentes'] }} fracções presentes de {{ $quorum['total_fraccoes'] }}
        ({{ number_format($quorum['percent_fraccoes'], 2) }}%) ·
        mínimo exigido: {{ number_format($quorum['quorum_minimo'], 2) }}%
    </div>
    <div class="legal-note">
        Conforme artigo 34.º do Decreto Presidencial n.º 141/15, de 29 de Junho, o quórum deliberativo é calculado
        com base na representação percentual das fracções presentes, não no número de condóminos.
    </div>
</div>

<div class="section">
    <div class="section-title">3. Ordem do dia</div>
    <div class="ordem-do-dia">{{ $assembleia->ordem_do_dia }}</div>
    @if($assembleia->observacoes)
    <div style="margin-top:10px; font-size:9pt; color:#555;">
        <strong>Observações:</strong> {{ $assembleia->observacoes }}
    </div>
    @endif
</div>

<div class="section">
    <div class="section-title">4. Presenças ({{ $presentes->count() }})</div>
    @if($presentes->isEmpty())
        <p style="color:#888; font-style:italic; font-size:9.5pt;">Nenhum participante presente.</p>
    @else
    <table class="data-table">
        <thead>
            <tr>
                <th style="width:45%">Condómino</th>
                <th style="width:15%">Documento</th>
                <th style="width:15%">Fracções</th>
                <th style="width:15%">Permilagem</th>
                <th style="width:10%">Entrou</th>
            </tr>
        </thead>
        <tbody>
        @foreach($presentes as $p)
            <tr>
                <td>{{ $p->nome_snapshot }}</td>
                <td>{{ $p->documento_snapshot ?? '—' }}</td>
                <td>{{ $p->numero_fraccoes }}</td>
                <td>{{ number_format($p->permilagem_total, 3) }}‰</td>
                <td>{{ $p->entrou_em ? $p->entrou_em->format('H:i') : '—' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
    @endif
</div>

@if($ausentes->isNotEmpty())
<div class="section">
    <div class="section-title">5. Ausentes ({{ $ausentes->count() }})</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width:60%">Condómino</th>
                <th style="width:20%">Fracções</th>
                <th style="width:20%">Permilagem</th>
            </tr>
        </thead>
        <tbody>
        @foreach($ausentes as $p)
            <tr>
                <td>{{ $p->nome_snapshot }}</td>
                <td>{{ $p->numero_fraccoes }}</td>
                <td>{{ number_format($p->permilagem_total, 3) }}‰</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endif

@if($pontos->isNotEmpty())
<div class="section">
    <div class="section-title">{{ $ausentes->isNotEmpty() ? '6' : '5' }}. Deliberações e votações</div>
    @foreach($pontos as $p)
    <div class="ponto-votacao">
        <div class="ponto-titulo">Ponto {{ $p->ordem }}: {{ $p->titulo }}</div>
        @if($p->descricao)
            <div class="ponto-descricao">{{ $p->descricao }}</div>
        @endif

        @if($p->estado === 'encerrado' && $p->resultado)
            <div style="margin:8px 0 4px 0;">
                <span class="resultado-badge r-{{ $p->resultado }}">{{ strtoupper($p->resultado) }}</span>
                @if($p->fechada_em)
                    <span style="color:#888; font-size:8.5pt; margin-left:8px;">
                        em {{ $p->fechada_em->format('d/m/Y H:i') }}
                    </span>
                @endif
            </div>
            <table class="contagem">
                <tr>
                    <td class="label">Votos SIM:</td>
                    <td class="val">{{ $p->total_votos_sim }} votos · {{ number_format($p->permilagem_sim, 3) }}‰</td>
                </tr>
                <tr>
                    <td class="label">Votos NÃO:</td>
                    <td class="val">{{ $p->total_votos_nao }} votos · {{ number_format($p->permilagem_nao, 3) }}‰</td>
                </tr>
                <tr>
                    <td class="label">Abstenções:</td>
                    <td class="val">{{ $p->total_votos_abstencao }} votos · {{ number_format($p->permilagem_abstencao, 3) }}‰</td>
                </tr>
            </table>
        @elseif($p->estado === 'pendente')
            <div style="color:#888; font-style:italic; font-size:9pt;">Ponto não colocado a votação.</div>
        @else
            <div style="color:#c2410c; font-style:italic; font-size:9pt;">Votação ficou em aberto.</div>
        @endif
    </div>
    @endforeach
</div>
@endif

<div class="assinatura-section">
    <div class="section-title">Assinaturas</div>
    <div style="margin-top:18px;">
        <div class="assinatura-box">
            <div class="assinatura-linha"></div>
            <div class="assinatura-label">Presidente da Mesa</div>
            <div style="margin-top:2px; font-size:9pt;">
                {{ $assembleia->iniciadaPor->name ?? $assembleia->criadaPor->name ?? '' }}
            </div>
        </div>
        <div class="assinatura-box">
            <div class="assinatura-linha"></div>
            <div class="assinatura-label">Secretário da Mesa</div>
            <div style="margin-top:2px; font-size:9pt;">
                {{ $assembleia->terminadaPor->name ?? '' }}
            </div>
        </div>
    </div>
</div>

<div class="legal-note">
    Esta acta constitui título executivo nos termos do Decreto Presidencial n.º 141/15, de 29 de Junho,
    para cobrança de encargos aprovados pela assembleia dos condóminos.
</div>

<div class="footer">
    ONDAKA · Acta {{ $assembleia->numero }} · gerada em {{ now()->format('d/m/Y H:i') }} · Página 1
</div>

</body>
</html>
