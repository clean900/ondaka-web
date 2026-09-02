@component('emails.b2b._layout', ['titulo' => 'Novo cliente indicado · ONDAKA'])
<div style="display:inline-block; background:rgba(96,165,250,0.15); color:#60a5fa; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🏢 NOVO CLIENTE INDICADO</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">{{ $empresa->nome }} registou-se com o seu link</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">Olá <strong style="color:#fff;">{{ $afiliado->nome }}</strong>, boas notícias: <strong style="color:#fff;">{{ $empresa->nome }}</strong> ({{ $empresa->tipo_cliente === 'admin_independente' ? 'Administrador independente' : 'Empresa gestora' }}, {{ $empresa->provincia }}) criou conta na ONDAKA através do seu código <strong style="color:#c084fc;">{{ $afiliado->codigo }}</strong>.</p>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">O cliente tem 30 dias de trial. Quando começar a pagar, cada pagamento gera-lhe uma comissão de <strong style="color:#fff;">{{ rtrim(rtrim(number_format((float) $afiliado->taxa_actual_pct, 2, ',', '.'), '0'), ',') }}%</strong> sobre o valor sem imposto.</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/afiliado/clientes" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver os meus clientes →</a>
</td></tr></table>
@endcomponent
