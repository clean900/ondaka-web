@component('emails.b2b._layout', ['titulo' => 'Comissões de afiliados a pagar · ONDAKA'])
<div style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🏦 AFILIADOS · A PAGAR</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">{{ count($linhas) }} afiliado(s) com comissões a pagar</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">Comissões aprovadas que já atingiram o valor mínimo de pagamento. Total: <strong style="color:#22c55e;">{{ $total }}</strong>.</p>
<table cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; background:#0f1235; border-radius:8px; font-size:13px;">
<tr style="color:#888; font-size:11px;"><td style="padding:10px 12px;">AFILIADO</td><td style="padding:10px 12px;">CÓDIGO</td><td style="padding:10px 12px; text-align:right;">Nº</td><td style="padding:10px 12px; text-align:right;">A PAGAR</td><td style="padding:10px 12px;">IBAN</td></tr>
@foreach($linhas as $l)
<tr style="border-top:1px solid #1f1f3a;"><td style="padding:10px 12px; color:#fff;">{{ $l['nome'] }}</td><td style="padding:10px 12px; color:#c084fc;">{{ $l['codigo'] }}</td><td style="padding:10px 12px; color:#ddd; text-align:right;">{{ $l['n'] }}</td><td style="padding:10px 12px; color:#22c55e; text-align:right; font-weight:bold;">{{ number_format((float) $l['total_kz'], 2, ',', '.') }} Kz</td><td style="padding:10px 12px; color:#ddd;">{{ $l['iban'] ?: '— (sem IBAN)' }}</td></tr>
@endforeach
</table>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin/afiliados" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Registar pagamentos →</a>
</td></tr></table>
@endcomponent
