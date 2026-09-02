@component('emails.b2b._layout', ['titulo' => 'Comissão creditada · ONDAKA'])
<div style="display:inline-block; background:rgba(34,197,94,0.15); color:#22c55e; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">💰 COMISSÃO CREDITADA</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">Ganhou {{ $valor }}</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;"><strong style="color:#fff;">{{ $cliente }}</strong> efectuou um pagamento à ONDAKA: {{ $comissao->descricao }}.</p>
<div style="margin:24px 0; padding:20px; background:#0f1235; border-radius:8px; border-left:3px solid #22c55e;">
<table cellpadding="0" cellspacing="0" style="width:100%;">
<tr><td style="padding:6px 0; color:#888; font-size:12px;">Valor sem imposto (base)</td><td style="padding:6px 0; color:#fff; text-align:right;">{{ $base }}</td></tr>
<tr><td style="padding:6px 0; color:#888; font-size:12px;">Taxa de comissão</td><td style="padding:6px 0; color:#fff; text-align:right;">{{ $taxa }}%</td></tr>
<tr><td style="padding:6px 0; color:#888; font-size:12px; border-top:1px solid #2a2a4a;">Comissão</td><td style="padding:6px 0; color:#22c55e; font-size:20px; font-weight:bold; text-align:right; border-top:1px solid #2a2a4a;">{{ $valor }}</td></tr>
</table>
</div>
<p style="color:#888; font-size:12px; line-height:1.6;">
@if($comissao->estado === 'pendente')
A comissão fica em carência até {{ $comissao->disponivel_em?->format('d/m/Y') }} e passa depois a aprovada. As comissões aprovadas são pagas em lote assim que atingirem o valor mínimo.
@else
A comissão já está aprovada e será incluída no próximo pagamento.
@endif
</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/afiliado/comissoes" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">Ver as minhas comissões →</a>
</td></tr></table>
@endcomponent
