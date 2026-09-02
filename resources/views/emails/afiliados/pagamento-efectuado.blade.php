@component('emails.b2b._layout', ['titulo' => 'Pagamento de comissões · ONDAKA'])
<div style="display:inline-block; background:rgba(34,197,94,0.15); color:#22c55e; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🏦 PAGAMENTO EFECTUADO</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Pagámos as suas comissões</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">O pagamento <strong style="color:#fff;">{{ $pagamento->numero }}</strong> de {{ $pagamento->num_comissoes }} comissão(ões) foi efectuado em {{ $pagamento->pago_em?->format('d/m/Y') }} por {{ $pagamento->metodo_label }}@if($pagamento->iban_destino) para o IBAN {{ $pagamento->iban_destino }}@endif.</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #22c55e;">
<table cellpadding="0" cellspacing="0" style="width:100%;">
<tr><td style="padding:6px 0; color:#888; font-size:12px;">Comissões (bruto)</td><td style="padding:6px 0; color:#fff; text-align:right;">{{ $bruto }}</td></tr>
@if((float) $pagamento->retencao_valor_kz > 0)
<tr><td style="padding:6px 0; color:#888; font-size:12px;">Retenção na fonte ({{ rtrim(rtrim(number_format((float) $pagamento->retencao_pct, 2, ',', '.'), '0'), ',') }}%)</td><td style="padding:6px 0; color:#f87171; text-align:right;">- {{ $retencao }}</td></tr>
@endif
<tr><td style="padding:6px 0; color:#888; font-size:12px; border-top:1px solid #2a2a4a;">Valor líquido pago</td><td style="padding:6px 0; color:#22c55e; font-size:20px; font-weight:bold; text-align:right; border-top:1px solid #2a2a4a;">{{ $liquido }}</td></tr>
@if($pagamento->referencia_bancaria)
<tr><td style="padding:6px 0; color:#888; font-size:12px;">Referência</td><td style="padding:6px 0; color:#fff; text-align:right;">{{ $pagamento->referencia_bancaria }}</td></tr>
@endif
</table>
</div>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/afiliado/pagamentos" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver pagamentos e comprovativo →</a>
</td></tr></table>
@endcomponent
