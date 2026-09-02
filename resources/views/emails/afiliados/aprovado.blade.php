@component('emails.b2b._layout', ['titulo' => 'Conta de afiliado activa · ONDAKA'])
<div style="display:inline-block; background:rgba(34,197,94,0.15); color:#22c55e; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🎉 CONTA ACTIVA</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Bem-vindo ao Programa de Afiliados ONDAKA</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">Olá <strong style="color:#fff;">{{ $afiliado->nome }}</strong>, a sua conta de afiliado está activa. A partir de agora, cada empresa gestora ou administrador independente que se registar através do seu link gera-lhe uma comissão em <strong style="color:#fff;">todos os pagamentos</strong> que fizer à ONDAKA (subscrição, add-ons, pacotes SMS), calculada sobre o valor sem imposto.</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #a855f7;">
<div style="color:#888; font-size:12px; margin-bottom:4px;">O SEU CÓDIGO</div>
<div style="color:#c084fc; font-size:28px; font-weight:bold; letter-spacing:2px;">{{ $afiliado->codigo }}</div>
<div style="color:#888; font-size:12px; margin-top:12px;">O SEU LINK</div>
<div style="color:#60a5fa; font-size:14px; word-break:break-all;"><a href="{{ $link }}" style="color:#60a5fa;">{{ $link }}</a></div>
<div style="color:#888; font-size:12px; margin-top:12px;">TAXA ACTUAL</div>
<div style="color:#fff; font-size:18px; font-weight:bold;">{{ rtrim(rtrim(number_format((float) $afiliado->taxa_actual_pct, 2, ',', '.'), '0'), ',') }}% · nível {{ $afiliado->nivel_label }}</div>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/afiliado" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Abrir o meu painel de afiliado →</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">Dica: preencha os seus dados bancários no painel para receber os pagamentos sem atrasos.</p>
@endcomponent
