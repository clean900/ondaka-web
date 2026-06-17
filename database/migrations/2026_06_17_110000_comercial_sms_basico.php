<?php

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Migrations\Migration;

/**
 * Conteúdo comercial (página rica) do add-on Serviço SMS (sms_basico),
 * à semelhança do Pacote Extra e do Sender ID.
 */
return new class extends Migration
{
    public function up(): void
    {
        $comercial = [
            'tagline' => 'Active o serviço de SMS do condomínio — 200 mensagens por mês com o nome "ONDAKA".',
            'problema' => 'Avisos, lembretes de taxas, convocatórias de assembleia e alertas de emergência só chegam a tempo quando vão por SMS — o canal que o condómino lê na hora. Sem um serviço de SMS activo, a comunicação importante fica dependente de email ou da app, e nem todos abrem.',
            'solucao' => 'Active o Serviço SMS e o condomínio passa a enviar mensagens com o remetente "ONDAKA". Inclui 200 SMS por mês, repostos automaticamente no início de cada mês, e integra-se com avisos, taxas, assembleias e visitantes.',
            'beneficios' => [
                ['icone' => 'message-square', 'titulo' => '200 SMS por mês', 'descricao' => 'Pacote mensal incluído, reposto automaticamente no início de cada mês.'],
                ['icone' => 'check-circle', 'titulo' => 'Remetente ONDAKA', 'descricao' => 'As mensagens chegam com identidade reconhecível, aumentando a taxa de leitura.'],
                ['icone' => 'zap', 'titulo' => 'Integrado com tudo', 'descricao' => 'Usado por avisos, lembretes de taxas, convocatórias e alertas de emergência.'],
                ['icone' => 'package', 'titulo' => 'Sem surpresas', 'descricao' => 'Quando os 200 terminam, o Pacote Extra entra a 25 Kz/SMS — só paga o que usar.'],
                ['icone' => 'chart-bar', 'titulo' => 'Histórico transparente', 'descricao' => 'Consulte SMS enviados, datas e saldo no painel de administração.'],
                ['icone' => 'shield-check', 'titulo' => 'Pagamento seguro', 'descricao' => 'Activação via ProxyPay (Multicaixa Express ou Referência), com factura automática.'],
            ],
            'demo_passos' => [
                ['icone' => 'credit-card', 'label_curto' => 'Activar', 'label_longo' => 'Active o serviço (5.000 Kz/mês)'],
                ['icone' => 'message-square', 'label_curto' => 'Enviar', 'label_longo' => 'Os SMS saem com o nome "ONDAKA"'],
                ['icone' => 'clock', 'label_curto' => 'Renovar', 'label_longo' => '200 SMS repostos todos os meses'],
            ],
            'faq' => [
                ['pergunta' => 'O que acontece quando os 200 SMS do mês terminam?', 'resposta' => 'O envio passa automaticamente para o Pacote Extra (25 Kz por SMS). Só paga as mensagens adicionais que usar.'],
                ['pergunta' => 'Os 200 SMS acumulam para o mês seguinte?', 'resposta' => 'Não — o pacote mensal é reposto a 200 no início de cada mês. Para créditos que não expiram, use o Pacote Extra.'],
                ['pergunta' => 'Posso enviar com o nome do meu condomínio em vez de "ONDAKA"?', 'resposta' => 'Sim. Active também o add-on "Sender ID personalizado" para usar o nome do condomínio como remetente.'],
            ],
        ];

        Feature::where('slug', 'sms_basico')->update(['comercial_json' => json_encode($comercial, JSON_UNESCAPED_UNICODE)]);
    }

    public function down(): void
    {
        Feature::where('slug', 'sms_basico')->update(['comercial_json' => null]);
    }
};
