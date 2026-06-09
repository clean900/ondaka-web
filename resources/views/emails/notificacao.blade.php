@extends('emails.layout')

@section('conteudo')
    @if(!empty($saudacao))
    <p style="font-size:15px;font-weight:600;color:#1f2733;margin:0 0 14px;">{{ $saudacao }}</p>
    @endif
    <div style="font-size:14px;line-height:1.65;color:#3a4658;">{!! nl2br(e($corpo)) !!}</div>

    @if(!empty($botaoUrl))
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;"><tr><td align="center">
      <a href="{{ $botaoUrl }}" style="display:inline-block;background-color:#7c5cff;background-image:linear-gradient(120deg,#22d3ee,#7c5cff);color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:9px;">{{ $botaoTexto ?? 'Abrir na app ONDAKA' }}</a>
    </td></tr></table>
    @endif

    @if(!empty($nota))
    <p style="font-size:12px;color:#8590a3;line-height:1.55;margin:16px 0 0;">{{ $nota }}</p>
    @endif
@endsection
