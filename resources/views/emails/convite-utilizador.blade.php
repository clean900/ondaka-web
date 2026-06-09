@extends('emails.layout')

@section('conteudo')
    <p style="font-size:15px;font-weight:600;color:#1f2733;margin:0 0 14px;">Olá {{ $nome }},</p>
    <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 18px;">
        {{ $convidadoPorNome }} convidou-o(a) a juntar-se ao ONDAKA
        @if(!empty($empresaNome))
            como <strong>{{ $roleNome }}</strong> da empresa <strong>{{ $empresaNome }}</strong>.
        @else
            com a função de <strong>{{ $roleNome }}</strong>.
        @endif
    </p>
    <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">
        Para activar a sua conta e definir uma palavra-passe, clique no botão abaixo:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;"><tr><td align="center">
        <a href="{{ $url }}" target="_blank" style="display:inline-block;background-color:#7c5cff;background-image:linear-gradient(120deg,#22d3ee,#7c5cff);color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:9px;">Activar a minha conta →</a>
    </td></tr></table>
    <p style="font-size:12px;color:#8590a3;margin:0 0 6px;">Ou copie este link no seu browser:</p>
    <p style="margin:0 0 18px;padding:12px;background-color:#f4f7fb;border:1px solid #e1e8f1;border-radius:8px;color:#16458f;font-size:12px;word-break:break-all;font-family:monospace;">{{ $url }}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8ec;border-left:4px solid #f59e0b;border-radius:6px;margin:0 0 14px;"><tr><td style="padding:14px 16px;">
        <p style="margin:0;color:#7a5a1a;font-size:13px;line-height:1.5;">⏱️ Este link é válido durante <strong>{{ $validadeDias }} dias</strong>. Após esse prazo, terá de pedir um novo convite.</p>
    </td></tr></table>
    <p style="margin:0;color:#8590a3;font-size:12px;line-height:1.5;">Se não esperava receber este convite, pode simplesmente ignorá-lo.</p>
@endsection
