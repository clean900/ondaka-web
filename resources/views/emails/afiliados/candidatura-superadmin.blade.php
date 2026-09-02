@component('emails.b2b._layout', ['titulo' => ($auto ? 'Novo afiliado' : 'Candidatura a afiliado') . ' · ONDAKA'])
<div style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; font-size:11px; font-weight:bold; letter-spacing:1px; padding:6px 12px; border-radius:12px; margin-bottom:16px;">🤝 PROGRAMA DE AFILIADOS</div>
<h1 style="color:#fff; font-size:24px; margin:0 0 16px;">{{ $auto ? 'Novo afiliado activo' : 'Nova candidatura a afiliado' }}</h1>
<p style="color:#ccc; line-height:1.6; margin:0 0 16px;">
<strong style="color:#fff;">{{ $afiliado->nome }}</strong>
@if($auto) aderiu ao programa de afiliados e já está activo. @else candidatou-se ao programa de afiliados e aguarda a sua aprovação. @endif
</p>
<table cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; background:#0f1235; border-radius:8px;">
<tr><td style="padding:10px 16px; color:#888; font-size:12px;">Código</td><td style="padding:10px 16px; color:#fff; font-weight:bold;">{{ $afiliado->codigo }}</td></tr>
<tr><td style="padding:10px 16px; color:#888; font-size:12px;">Tipo</td><td style="padding:10px 16px; color:#fff;">{{ $afiliado->tipo === 'empresa' ? 'Empresa' : 'Particular' }}</td></tr>
<tr><td style="padding:10px 16px; color:#888; font-size:12px;">Email</td><td style="padding:10px 16px; color:#fff;">{{ $afiliado->email }}</td></tr>
<tr><td style="padding:10px 16px; color:#888; font-size:12px;">Telefone</td><td style="padding:10px 16px; color:#fff;">{{ $afiliado->telefone ?: '—' }}</td></tr>
<tr><td style="padding:10px 16px; color:#888; font-size:12px;">NIF</td><td style="padding:10px 16px; color:#fff;">{{ $afiliado->nif ?: '—' }}</td></tr>
@if($afiliado->como_divulga)
<tr><td style="padding:10px 16px; color:#888; font-size:12px; vertical-align:top;">Como vai divulgar</td><td style="padding:10px 16px; color:#ddd; font-size:13px; line-height:1.5;">{{ $afiliado->como_divulga }}</td></tr>
@endif
</table>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg, #3b82f6, #a855f7); border-radius:8px;">
<a href="https://ondaka.ao/super-admin/afiliados/{{ $afiliado->id }}" style="display:block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:bold;">{{ $auto ? 'Ver afiliado →' : 'Analisar candidatura →' }}</a>
</td></tr></table>
<p style="color:#888; font-size:12px; line-height:1.6; margin:24px 0 0;">Notificação automática da plataforma.</p>
@endcomponent
