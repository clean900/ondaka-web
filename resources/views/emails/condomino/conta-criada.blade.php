@component('emails.condomino._layout', ['badge' => 'BEM-VINDO', 'tituloHero' => 'A sua conta foi criada'])
<p style="margin:0 0 16px; font-size:16px; color:#fff;"><strong>Caro(a) {{ $nome }},</strong></p>
<p style="margin:0 0 20px;">Foi criada uma conta para si na <strong style="color:#fff;">ONDAKA</strong>, a plataforma de gestão do seu condomínio. Já pode aceder e acompanhar tudo a partir do telemóvel.</p>

<!-- Dados de acesso -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1f; border-radius:8px; margin:0 0 20px;">
<tr><td style="padding:20px;">
<div style="font-size:12px; color:#06b6d4; font-weight:bold; letter-spacing:1px; margin-bottom:12px;">OS SEUS DADOS DE ACESSO</div>
<div style="font-size:13px; color:#888;">Email</div>
<div style="font-size:16px; font-weight:bold; color:#fff; margin:2px 0 12px;">{{ $email }}</div>
<div style="font-size:13px; color:#888;">Password temporária</div>
<div style="font-size:18px; font-weight:bold; color:#a855f7; font-family:monospace; margin:2px 0;">{{ $password }}</div>
</td></tr>
</table>
<div style="background:rgba(236,72,153,0.1); border-left:3px solid #ec4899; padding:12px 16px; border-radius:4px; margin:0 0 24px;">
<p style="margin:0; font-size:13px; color:#f0a0c0;">⚠️ Por segurança, será pedido que altere esta password no seu primeiro acesso.</p>
</div>

<!-- Quem registou -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="padding:0;">
<div style="font-size:12px; color:#888; letter-spacing:1px; margin-bottom:8px;">REGISTADO POR</div>
@if($condominio)<div style="font-size:14px; color:#e5e5e5;">Condomínio: <strong style="color:#fff;">{{ $condominio }}</strong></div>@endif
<div style="font-size:14px; color:#e5e5e5;">Empresa gestora: <strong style="color:#fff;">{{ $empresa }}</strong></div>
<div style="font-size:14px; color:#e5e5e5;">Gestor: <strong style="color:#fff;">{{ $gestor }}</strong></div>
</td></tr>
</table>

<!-- O que pode fazer -->
<div style="font-size:12px; color:#06b6d4; font-weight:bold; letter-spacing:1px; margin-bottom:12px;">O QUE PODE FAZER NA APP</div>
<p style="margin:0 0 8px;"><strong style="color:#fff;">📘 Conheça a ONDAKA</strong> — comece pela secção "Conheça" para um guia rápido de tudo o que a app oferece.</p>
<p style="margin:0 0 8px;"><strong style="color:#fff;">💬 Assistente (chatbot)</strong> — tire dúvidas a qualquer hora com o assistente integrado.</p>
<p style="margin:0 0 16px;">E ainda: pagar as suas <strong style="color:#e5e5e5;">taxas de condomínio</strong> e consultar <strong style="color:#e5e5e5;">dívidas</strong>, abrir <strong style="color:#e5e5e5;">pedidos</strong> à administração, acompanhar <strong style="color:#e5e5e5;">encomendas</strong> na portaria, participar em <strong style="color:#e5e5e5;">assembleias</strong> e votações, autorizar <strong style="color:#e5e5e5;">visitantes</strong>, e acionar o <strong style="color:#e5e5e5;">SOS</strong> em emergências.</p>

<!-- Apps -->
<div style="font-size:12px; color:#06b6d4; font-weight:bold; letter-spacing:1px; margin:24px 0 12px;">DESCARREGUE A APLICAÇÃO</div>
<p style="margin:0 0 12px; font-size:13px; color:#888;">A app ONDAKA estará brevemente disponível para Android e iOS.</p>
<table cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:10px;"><div style="background:#0f0f1f; border:1px solid #1f1f2e; border-radius:8px; padding:10px 18px; font-size:13px; color:#e5e5e5;">🤖 Android — Google Play</div></td>
<td><div style="background:#0f0f1f; border:1px solid #1f1f2e; border-radius:8px; padding:10px 18px; font-size:13px; color:#e5e5e5;">🍎 iOS — App Store</div></td>
</tr></table>
@endcomponent
