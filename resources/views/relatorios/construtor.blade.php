<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1a1a2e; font-size: 12px; margin: 0; padding: 0; }
        .cabecalho { border-bottom: 3px solid #00B8D4; padding-bottom: 12px; margin-bottom: 20px; }
        .cabecalho h1 { margin: 0 0 4px; font-size: 20px; color: #6B21A8; }
        .cabecalho .sub { color: #666; font-size: 11px; }
        .seccao { margin-bottom: 20px; }
        .seccao h2 { font-size: 14px; color: #0891B2; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 10px; }
        .bloco-titulo { font-size: 16px; color: #6B21A8; font-weight: bold; margin: 18px 0 8px; border-left: 4px solid #00B8D4; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 5px 8px; text-align: left; }
        th { background: #f3f4f6; font-size: 11px; }
        .num { text-align: right; }
        .cartoes td { width: 33%; vertical-align: top; padding: 8px; }
        .cartao { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
        .cartao .lbl { font-size: 10px; color: #666; }
        .cartao .val { font-size: 16px; font-weight: bold; margin-top: 3px; }
        .verde { color: #059669; } .vermelho { color: #DC2626; } .azul { color: #0891B2; } .ambar { color: #D97706; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
        .badge.ok { background: #D1FAE5; color: #059669; } .badge.nok { background: #FEE2E2; color: #DC2626; }
        .rodape { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 6px; }
    </style>
</head>
<body>
    @php $kz = fn ($v) => number_format((float) $v, 0, ',', '.') . ' Kz'; @endphp

    <div class="cabecalho">
        <h1>{{ $tituloGeral }}</h1>
        <div class="sub">
            {{ $empresa->nome ?? 'Empresa Gestora' }}
            @if($condominioNome) &middot; {{ $condominioNome }} @else &middot; Todos os condomínios @endif
            <br>Período: últimos {{ $meses }} meses &middot; Gerado em {{ $dataGeracao }}
        </div>
    </div>

    @foreach($blocos as $b)
        @switch($b['tipo'])

            @case('titulo')
                <div class="bloco-titulo">{{ $b['titulo'] ?? 'Secção' }}</div>
                @break

            @case('financeiro')
                @if($receitas)
                <div class="seccao">
                    <h2>Receitas vs Despesas ({{ $meses }} meses)</h2>
                    <table class="cartoes"><tr>
                        <td><div class="cartao"><div class="lbl">Receita total</div><div class="val verde">{{ $kz($receitas['totais']['receita']) }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Despesa total</div><div class="val vermelho">{{ $kz($receitas['totais']['despesa']) }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Saldo</div><div class="val azul">{{ $kz($receitas['totais']['saldo']) }}</div></div></td>
                    </tr></table>
                </div>
                @endif
                @break

            @case('cobranca')
                @if($cobranca)
                <div class="seccao">
                    <h2>Cobrança</h2>
                    <table class="cartoes"><tr>
                        <td><div class="cartao"><div class="lbl">Taxa de cobrança</div><div class="val ambar">{{ $cobranca['taxa_cobranca'] }}%</div></div></td>
                        <td><div class="cartao"><div class="lbl">Dívida total</div><div class="val vermelho">{{ $kz($cobranca['divida_total']) }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">DSO</div><div class="val azul">{{ $cobranca['dso'] === null ? 'n/d' : ($cobranca['dso'] < 0 ? abs($cobranca['dso']).'d adiant.' : $cobranca['dso'].'d') }}</div></div></td>
                    </tr></table>
                </div>
                @endif
                @break

            @case('devedores')
                @if($cobranca && count($cobranca['devedores']))
                <div class="seccao">
                    <h2>Top devedores</h2>
                    <table>
                        <tr><th>Devedor</th><th class="num">Dívida</th></tr>
                        @foreach($cobranca['devedores'] as $i => $dev)
                        <tr><td>{{ $i+1 }}. {{ $dev['nome'] }}</td><td class="num">{{ $kz($dev['divida']) }}</td></tr>
                        @endforeach
                    </table>
                </div>
                @endif
                @break

            @case('despesas')
                @if($despesas)
                <div class="seccao">
                    <h2>Despesas por categoria</h2>
                    @if(count($despesas['por_categoria']))
                    <table>
                        <tr><th>Categoria</th><th class="num">Total</th></tr>
                        @foreach($despesas['por_categoria'] as $cat)
                        <tr><td>{{ $cat['categoria'] }}</td><td class="num">{{ $kz($cat['total']) }}</td></tr>
                        @endforeach
                        <tr><td><strong>TOTAL</strong></td><td class="num"><strong>{{ $kz($despesas['total']) }}</strong></td></tr>
                    </table>
                    @else
                    <p style="color:#999;">Sem despesas pagas no período.</p>
                    @endif
                </div>
                @endif
                @break

            @case('saude')
                @if($saude)
                <div class="seccao">
                    <h2>Saúde financeira</h2>
                    <p>
                        Fundo de reserva: <strong>{{ $saude['fundo_reserva']['pct'] }}%</strong>
                        (mínimo legal {{ $saude['fundo_reserva']['min_legal'] }}% &middot; DP 141/15)
                        <span class="badge {{ $saude['fundo_reserva']['cumpre'] ? 'ok' : 'nok' }}">
                            {{ $saude['fundo_reserva']['cumpre'] ? 'Cumpre' : 'Abaixo do mínimo' }}
                        </span>
                    </p>
                    <table class="cartoes"><tr>
                        <td><div class="cartao"><div class="lbl">Saldo disponível</div><div class="val azul">{{ $kz($saude['liquidez']['saldo_disponivel']) }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Dívida em aberto</div><div class="val vermelho">{{ $kz($saude['liquidez']['divida_aberto']) }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Cobertura</div><div class="val azul">{{ $saude['liquidez']['cobertura'] === null ? 'n/d' : $saude['liquidez']['cobertura'].'x' }}</div></div></td>
                    </tr></table>
                </div>
                @endif
                @break

            @case('operacional')
                @if($operacional)
                <div class="seccao">
                    <h2>Operacional (pedidos)</h2>
                    <table class="cartoes"><tr>
                        <td><div class="cartao"><div class="lbl">Total de pedidos</div><div class="val azul">{{ $operacional['total'] }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Tempo médio resolução</div><div class="val ambar">{{ ($operacional['tempo_resolucao']['disponivel'] ?? false) ? $operacional['tempo_resolucao']['dias_medio'].' dias' : 'n/d' }}</div></div></td>
                        <td><div class="cartao"><div class="lbl">Resolvidos</div><div class="val verde">{{ $operacional['tempo_resolucao']['resolvidos'] ?? 0 }}</div></div></td>
                    </tr></table>
                    @if(count($operacional['por_categoria'] ?? []))
                    <table style="margin-top:10px;">
                        <tr><th>Categoria</th><th class="num">Pedidos</th></tr>
                        @foreach($operacional['por_categoria'] as $cat)
                        <tr><td>{{ $cat['categoria'] ?: 'Sem categoria' }}</td><td class="num">{{ $cat['n'] }}</td></tr>
                        @endforeach
                    </table>
                    @endif
                </div>
                @endif
                @break

        @endswitch
    @endforeach

    <div class="rodape">
        ONDAKA &middot; {{ $empresa->nome ?? '' }} @if(!empty($empresa->nif)) &middot; NIF {{ $empresa->nif }} @endif &middot; Relatório personalizado
    </div>
</body>
</html>
