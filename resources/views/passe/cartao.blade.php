<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: DejaVu Sans, sans-serif; }
  body { width: 280px; height: 440px; background: {{ $tema['cardBg'] }}; color: {{ $tema['cardText'] }}; }
  .head { background: {{ $tema['head'] }}; color: {{ $tema['headText'] }}; padding: 14px 16px; }
  .head .cond { font-size: 13px; font-weight: bold; }
  .head .tipo { font-size: 9px; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
  .body { padding: 18px 16px; text-align: center; }
  .titulo-passe { font-size: 9px; letter-spacing: 2px; opacity: .55; margin-bottom: 14px; }
  .nome { font-size: 19px; font-weight: bold; margin-bottom: 4px; }
  .meta { font-size: 10px; line-height: 1.7; opacity: .8; }
  .valid { margin: 14px 16px; padding: 8px; border: 1px solid {{ $tema['accent'] }}; border-radius: 8px; text-align: center; font-size: 10px; color: {{ $tema['accent'] }}; }
  .valid b { font-weight: bold; }
  .qrwrap { text-align: center; padding: 6px 0 10px; }
  .qrbox { display: inline-block; background: #fff; padding: 8px; border-radius: 10px; }
  .qrbox img { width: 110px; height: 110px; }
  .foot { text-align: center; font-size: 8px; opacity: .65; letter-spacing: .5px; padding-bottom: 12px; }
</style>
</head>
<body>
  <div class="head">
    <div class="cond">{{ $condominio->nome ?? 'Condomínio' }}</div>
    <div class="tipo">{{ strtoupper($passe->tipo_acesso) }} · PASSE DE VISITANTE</div>
  </div>

  <div class="body">
    <div class="titulo-passe">ACESSO AUTORIZADO</div>
    <div class="nome">{{ $passe->nome_visitante }}</div>
    <div class="meta">
      {{ strtoupper($passe->tipo_documento ?? 'DOC') }} · {{ $passe->numero_documento ?? '—' }}<br>
      Fracção: {{ $passe->fraccao->identificador ?? '—' }}<br>
      Anfitrião: {{ $passe->condomino->nome_completo ?? '—' }}
    </div>
  </div>

  <div class="valid">
    Válido de <b>{{ optional($passe->valida_desde)->format('d/m/Y') }}</b>
    até <b>{{ optional($passe->valida_ate)->format('d/m/Y') }}</b>
  </div>

  <div class="qrwrap">
    <div class="qrbox">
      <img src="data:image/svg+xml;base64,{{ $qrSvg }}" alt="QR">
    </div>
  </div>

  <div class="foot">Validação na portaria por leitura do QR · ondaka.ao</div>
</body>
</html>
