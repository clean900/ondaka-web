<?php

declare(strict_types=1);

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Migrations\Migration;

/**
 * Modal comercial (comercial_json) do add-on Passe Visitante com branding.
 */
return new class extends Migration
{
    public function up(): void
    {
        $comercial = [
            'tagline' => 'Prestadores e empregados com acesso autorizado — passe com a marca do condomínio.',
            'problema' => 'Quem tem uma empregada, um jardineiro ou uma obra precisa de dar acesso recorrente a alguém durante semanas ou meses. Fazer uma pré-aprovação a cada entrada é impraticável, e dar a chave ou avisar o guarda de cor não é seguro nem rastreável.',
            'solucao' => 'O condómino solicita um passe (com as datas e o documento do visitante), o gestor aprova, e é gerado um passe com QR e a identidade visual do condomínio. O visitante entra e sai sempre que precisar dentro da validade — o guarda valida por QR e fica tudo registado.',
            'beneficios' => [
                ['icone' => 'credit-card', 'titulo' => 'Passe com branding', 'descricao' => 'Escolha 1 de 12 modelos por condomínio — com logo, cores e QR.'],
                ['icone' => 'clock', 'titulo' => 'Validade configurável', 'descricao' => 'Dias ou meses; ao expirar, o acesso para até o condómino estender.'],
                ['icone' => 'shield-check', 'titulo' => 'Documento registado', 'descricao' => 'BI, passaporte ou carta de condução do visitante ficam na plataforma.'],
                ['icone' => 'check-circle', 'titulo' => 'Entrada/saída por QR', 'descricao' => 'O guarda valida o QR; entra em "quem está dentro" e respeita a Lista Negra.'],
            ],
            'demo_passos' => [
                ['icone' => 'credit-card', 'label_curto' => 'Solicitar', 'label_longo' => 'Condómino pede + anexa o documento'],
                ['icone' => 'check-circle', 'label_curto' => 'Aprovar', 'label_longo' => 'Gestor aprova e o QR é gerado'],
                ['icone' => 'shield-check', 'label_curto' => 'Entrar', 'label_longo' => 'O guarda valida o passe por QR'],
            ],
            'faq' => [
                ['pergunta' => 'O passe serve para várias entradas?', 'resposta' => 'Sim. Dentro da validade, o prestador/empregado entra e sai as vezes que precisar.'],
                ['pergunta' => 'O que acontece quando expira?', 'resposta' => 'O acesso fica bloqueado até o condómino estender a data — sem ter de criar um passe novo.'],
                ['pergunta' => 'Quem escolhe o desenho do passe?', 'resposta' => 'O gestor, por condomínio: pode usar um modelo diferente em cada condomínio que gere.'],
            ],
        ];

        Feature::where('slug', 'passe_visitante_branding')->update([
            'comercial_json' => json_encode($comercial, JSON_UNESCAPED_UNICODE),
            'activa' => true,
            'em_breve' => false,
        ]);
    }

    public function down(): void
    {
        Feature::where('slug', 'passe_visitante_branding')->update(['comercial_json' => null]);
    }
};
