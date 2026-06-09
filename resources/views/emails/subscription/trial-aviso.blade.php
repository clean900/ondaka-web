@extends('emails.layout')

@section('conteudo')
    @if ($tipo === 'trial_7_dias_restantes')
        <h2 style="font-size:19px;margin:0 0 14px;color:#1f2733;">Faltam {{ $diasTrial }} dias para o fim do seu período de teste</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">Olá{{ $empresa?->nome ? ', '.$empresa->nome : '' }},</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">Esperamos que esteja a tirar proveito do ONDAKA. Restam <strong>{{ $diasTrial }} dias</strong> do seu período de teste gratuito.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Para continuar a usar o sistema sem interrupções, converta já a sua subscrição.</p>
    @elseif ($tipo === 'trial_3_dias_restantes')
        <h2 style="font-size:19px;margin:0 0 14px;color:#1f2733;">Apenas 3 dias restantes</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">O seu período de teste termina em breve. Para evitar qualquer interrupção, prepare o pagamento da primeira mensalidade.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Depois do teste, terá ainda <strong>7 dias de graça</strong> para regularizar. Ainda assim, recomendamos agir já.</p>
    @elseif ($tipo === 'trial_expira_hoje')
        <h2 style="font-size:19px;margin:0 0 14px;color:#c2410c;">O seu período de teste termina hoje</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">A partir de amanhã, entra no <strong>período de graça de 7 dias</strong>. O sistema continuará acessível, mas com aviso permanente.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Converta agora para continuar sem limitações.</p>
    @elseif ($tipo === 'grace_dia_1')
        <h2 style="font-size:19px;margin:0 0 14px;color:#c2410c;">Período de graça iniciado</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">O seu período de teste terminou. Tem <strong>7 dias</strong> adicionais para efectuar o pagamento e manter a conta activa.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Após este prazo, a conta será suspensa automaticamente. Os seus dados permanecem em segurança por 90 dias.</p>
    @elseif ($tipo === 'grace_dia_3')
        <h2 style="font-size:19px;margin:0 0 14px;color:#c2410c;">Faltam {{ $diasGrace }} dias antes da suspensão</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Ainda pode evitar a suspensão da sua conta pagando nos próximos <strong>{{ $diasGrace }} dias</strong>.</p>
    @elseif ($tipo === 'grace_dia_7')
        <h2 style="font-size:19px;margin:0 0 14px;color:#dc2626;">ÚLTIMO AVISO — suspensão amanhã</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">Se não efectuar o pagamento hoje, a sua conta será <strong>suspensa amanhã</strong> e o acesso será bloqueado.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Os seus dados ficam preservados por 90 dias para eventual reactivação.</p>
    @elseif ($tipo === 'trial_boas_vindas')
        <h2 style="font-size:19px;margin:0 0 14px;color:#1f2733;">Bem-vindo ao ONDAKA!</h2>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 14px;">O seu período de teste de <strong>30 dias gratuitos</strong> começa agora.</p>
        <p style="font-size:14px;line-height:1.65;color:#3a4658;margin:0 0 8px;">Explore todas as funcionalidades, cadastre os seus condomínios, condóminos e imóveis. Enviaremos lembretes antes do fim do teste para que possa decidir sem pressa.</p>
    @endif

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 6px;"><tr><td align="center">
        <a href="{{ config('app.url') }}/subscricao" style="display:inline-block;background-color:#7c5cff;background-image:linear-gradient(120deg,#22d3ee,#7c5cff);color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:9px;">Gerir subscrição</a>
    </td></tr></table>
    <p style="font-size:12px;line-height:1.6;margin:18px 0 0;color:#8590a3;text-align:center;">Precisa de ajuda? Responda a este email ou contacte <a href="mailto:suporte@ondaka.ao" style="color:#16458f;text-decoration:none;">suporte@ondaka.ao</a></p>
@endsection
