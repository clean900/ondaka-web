<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Dados da empresa emissora (ONDAKA / KAYANTEC - Comércio e Serviços, (SU) Lda)
    |--------------------------------------------------------------------------
    | Aparecem nas facturas e comprovativos legais.
    | Conformes com DP 141/15 de 29 de Junho (Angola).
    */
    'emissor' => [
        'nome' => env('ONDAKA_EMISSOR_NOME', 'KAYANTEC - Comércio e Serviços, (SU) Lda'),
        'nif' => env('ONDAKA_EMISSOR_NIF', '5003315525'),
        'morada' => env('ONDAKA_EMISSOR_MORADA', 'Luanda, Angola'),
        'provincia' => env('ONDAKA_EMISSOR_PROVINCIA', 'Luanda'),
        'telefone' => env('ONDAKA_EMISSOR_TELEFONE', ''),
        'email' => env('ONDAKA_EMISSOR_EMAIL', 'geral@ondaka.ao'),
        'website' => 'https://ondaka.ao',
    ],

    /*
    |--------------------------------------------------------------------------
    | Contactos públicos (site ondaka.ao)
    |--------------------------------------------------------------------------
    | Os mesmos que estão publicados nos Termos e na Política de Privacidade.
    */
    'contactos' => [
        'email' => 'comercial@ondaka.ao',
        'whatsapp' => '+244 922 772 177',
        'morada' => 'Urbanização Boa Vida, Centro de Escritórios, Luanda, Angola',
    ],

    /*
    |--------------------------------------------------------------------------
    | Dados bancários (apresentados ao cliente para pagamento)
    | Conta ÚNICA de recebimento: KayanTec @ BAI (só esta deve estar activa).
    |--------------------------------------------------------------------------
    */
    'banco' => [
        'nome' => env('ONDAKA_BANCO_NOME', 'Banco Angolano de Investimentos (BAI)'),
        'titular' => env('ONDAKA_BANCO_TITULAR', 'KAYANTEC - Comércio e Serviços, (SU) Lda'),
        'nif' => env('ONDAKA_BANCO_NIF', '5003315525'),
        'iban' => env('ONDAKA_IBAN', 'AO06 0040 0000 4040 0546 1015 2'),
        'numero_conta' => env('ONDAKA_BANCO_CONTA', '340400546.10.001'),
        'moeda' => 'AOA',
    ],

    /*
    |--------------------------------------------------------------------------
    | Facturação
    |--------------------------------------------------------------------------
    */
    /*
    |--------------------------------------------------------------------------
    | Programa de Afiliados — apresentação e tutoriais
    |--------------------------------------------------------------------------
    | A apresentação comercial do programa é um documento autónomo (o que o
    | docs/comercial/afiliados/construir.py produz) e vive no servidor dos
    | tutoriais, ao lado dos vídeos que ela toca. O painel do afiliado mostra-a
    | numa moldura, para o afiliado a poder mostrar sem sair do sítio.
    |
    | O endereço sslip.io funciona sem mexer em DNS; tutoriais.ondaka.ao é o
    | destino, e quando o registo A existir basta mudar esta variável.
    */
    'afiliados' => [
        'apresentacao_url' => env(
            'AFILIADOS_APRESENTACAO_URL',
            'https://tutoriais.167.86.114.64.sslip.io/ondaka/apresentacao-afiliados.html'
        ),
    ],

    'factura' => [
        'serie' => env('ONDAKA_FACTURA_SERIE', date('Y')), // "2026"
        'taxa_iva' => 14.00,
        'prazo_vencimento_dias' => 30,
        // Moeda para impressão
        'moeda_simbolo' => 'Kz',
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagamento das subscrições da plataforma
    |--------------------------------------------------------------------------
    | ProxyPay das SUBSCRIÇÕES (não dos condóminos) está DESLIGADO enquanto a
    | conta ProxyPay é da Soluções Simples. Religa-se pondo esta variável a true
    | no .env assim que a KayanTec tiver entidade (PROXYPAY_ENTITY_ID) e chave
    | (PROXYPAY_API_KEY) próprias. Desligado => cliente paga por transferência BAI.
    */
    'pagamento' => [
        'proxypay_subscricoes' => (bool) env('ONDAKA_PROXYPAY_SUBSCRICOES', false),
    ],
];
