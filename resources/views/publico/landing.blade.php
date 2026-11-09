{{--
    Landing de ondaka.ao. Era resources/js/pages/Landing/Index.tsx (Inertia, só
    renderizada no browser); passou a Blade com o mesmo conteúdo e estilo para o
    texto vir no HTML do servidor. Os preços vêm da BD (PrecosPublicos).
    A calculadora funciona sem JavaScript no estado inicial (1 imóvel, mensal);
    o script no fim só a torna interactiva.
--}}
@extends('publico.layout')
@use('App\Support\Publico\Icones')
@use('App\Support\Publico\PrecosPublicos')

@php
    $escaloes = $pricing['escaloes'];
    $config = $pricing['config'];
    $trialDias = $config['trial_dias'];

    // Estado inicial da calculadora (igual ao da página React): 1 imóvel, mensal.
    $numImoveis = 1;
    $aplicavel = collect($escaloes)->first(fn ($e) => $numImoveis >= $e['imoveis_min'] && $numImoveis <= ($e['imoveis_max'] ?? PHP_INT_MAX)) ?? ($escaloes[0] ?? null);
    $precoUnit = $aplicavel['preco_unit_mensal_kz'] ?? 0;
    $subtotal = $precoUnit * $numImoveis;
    $total = $config['imposto_aplicavel'] ? $subtotal * (1 + $config['imposto_taxa_pct'] / 100) : $subtotal;
    $faixa = fn ($e) => $e['imoveis_min'].($e['imoveis_max'] ? '-'.$e['imoveis_max'] : '+');

    $heroBenefits = [
        ['pie-chart', 'Dashboard completo'],
        ['file-text', 'Controlo financeiro elevado'],
        ['users', 'Comunicação integrada'],
        ['shield-check', 'Segurança e conformidade'],
        ['smartphone', 'Acesso fácil e mobile'],
    ];
    $moreFeatures = [
        ['credit-card', 'Multicaixa Express'],
        ['message-square', 'Chatbot inteligente'],
        ['door-open', 'Visitantes & QR'],
        ['trending-up', 'Analytics'],
        ['wrench', 'Manutenção'],
        ['file-text', 'Documentos'],
        ['bell', 'Notificações'],
        ['globe', 'Glossário PT-AO'],
    ];
    $features = [
        ['pie-chart', 'Dashboard completo', 'Visão clara de receitas, despesas e indicadores em tempo real.'],
        ['file-text', 'Controlo financeiro', 'Pagamentos por Multicaixa Express, Taxas de Condomínio, multas e fundo de reserva.'],
        ['users', 'Comunicação integrada', 'Avisos, assembleias digitais, chamadas de voz na app e chatbot inteligente.'],
        ['shield-check', 'Segurança e conformidade', 'Verificação em dois passos por SMS, dados encriptados, protecção de dados e DP 141/15.'],
        ['smartphone', 'Acesso fácil e mobile', 'App iOS e Android para condóminos e gestores. Tudo na palma da mão.'],
        ['globe', 'Feito para Angola', 'Kwanzas, IVA/IPC configurável, glossário PT-AO, 100% local.'],
    ];
    $paraQuem = [
        ['Empresas gestoras', 'Vários condomínios numa só conta, com a equipa de gestão, as Taxas de Condomínio e os Pedidos de cada um.'],
        ['Administradores independentes', 'Tudo o que um administrador precisa para gerir os seus condomínios sem folhas de cálculo.'],
        ['Condóminos', 'Usam a app grátis: pagam as Taxas de Condomínio, abrem Pedidos e autorizam visitantes.'],
    ];

    $precosMensais = array_column($escaloes, 'preco_unit_mensal_kz');
@endphp

@section('titulo', 'ONDAKA · Gestão de condomínios em Angola')
@section('descricao', 'Gestão de condomínios feita para Angola: Taxas de Condomínio com Multicaixa Express, assembleias digitais, Pedidos, portaria com QR e app para condóminos.')
@section('caminho', '/')

@push('head')
    <script type="application/ld+json">{!! json_encode(array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'SoftwareApplication',
        'name' => 'ONDAKA',
        'url' => rtrim((string) config('app.url', 'https://ondaka.ao'), '/'),
        'applicationCategory' => 'BusinessApplication',
        'operatingSystem' => 'Web, Android, iOS',
        'inLanguage' => 'pt-AO',
        'description' => 'Plataforma de gestão de condomínios para empresas gestoras e administradores em Angola. Os condóminos usam a app grátis.',
        'offers' => $precosMensais ? [
            '@type' => 'AggregateOffer',
            'priceCurrency' => 'AOA',
            'lowPrice' => min($precosMensais),
            'highPrice' => max($precosMensais),
            'offerCount' => count($precosMensais),
            'description' => 'Preço por imóvel/mês, conforme o escalão. Trial de '.$trialDias.' dias grátis.',
        ] : null,
    ]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) !!}</script>
@endpush

@section('conteudo')
    {{-- HERO — IMAGEM FULL BACKGROUND --}}
    <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('/img/ondaka-hero-bg.png')"></div>
        {{-- Overlay subtil à DIREITA para legibilidade do texto --}}
        <div class="absolute inset-0 bg-gradient-to-l from-[#0a0a1a]/85 via-[#0a0a1a]/40 to-transparent"></div>
        <div class="absolute inset-0 -z-10 bg-[#0a0a1a]"></div>

        <div class="relative w-full px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
            <div class="ml-auto max-w-2xl text-right">
                <div class="mb-6 flex items-center justify-end gap-3">
                    <span class="text-4xl font-bold tracking-wider text-white drop-shadow-2xl">ONDAKA</span>
                    <img src="/img/ondaka-logo.png" alt="" width="56" height="56" class="h-14 w-14 rounded-lg shadow-lg shadow-blue-500/40">
                </div>

                <h1 class="mb-5 text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl md:text-6xl">
                    Gestão
                    <span class="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">inteligente</span>
                    <br>
                    para o seu condomínio
                </h1>

                <p class="mb-6 text-lg text-zinc-100 drop-shadow-lg md:text-xl">
                    Mais eficiência, transparência e controlo<br>na palma da sua mão.
                </p>

                <div class="mb-8 ml-auto h-1 w-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <div class="flex flex-wrap justify-end gap-3">
                    <a href="#features" class="rounded-lg border border-blue-500/40 bg-blue-500/10 px-7 py-3.5 font-semibold backdrop-blur-sm transition hover:border-blue-400 hover:bg-blue-500/20">
                        Ver funcionalidades
                    </a>
                    <a href="/registo" class="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500">
                        Trial de {{ $trialDias }} dias →
                    </a>
                </div>
            </div>
        </div>

        {{-- 5 ÍCONES — sobre o final da imagem --}}
        <div class="relative border-t border-blue-900/30 bg-[#0a0a1a]/80 backdrop-blur-md">
            <ul class="grid w-full grid-cols-2 gap-y-6 px-4 py-10 sm:px-6 md:grid-cols-5 md:divide-x md:divide-blue-900/30 lg:px-10">
                @foreach ($heroBenefits as [$icone, $label])
                    <li class="flex flex-col items-center px-4 text-center">
                        {!! Icones::svg($icone, 'mb-3 h-9 w-9 text-blue-400', 1.3) !!}
                        <span class="text-sm font-medium leading-tight text-zinc-200">{{ $label }}</span>
                    </li>
                @endforeach
            </ul>
        </div>

        {{-- Funcionalidades secundárias --}}
        <div class="relative border-t border-blue-900/30 bg-[#0a0a1a]/60 backdrop-blur">
            <ul class="grid w-full grid-cols-4 gap-x-3 gap-y-5 px-4 py-8 sm:px-6 md:grid-cols-8 lg:px-10">
                @foreach ($moreFeatures as [$icone, $label])
                    <li class="group flex flex-col items-center text-center">
                        <span class="mb-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 ring-1 ring-blue-500/20 transition group-hover:from-blue-500/20 group-hover:to-purple-500/20">
                            {!! Icones::svg($icone, 'h-4 w-4 text-blue-400', 1.5) !!}
                        </span>
                        <span class="text-[10px] font-medium leading-tight text-zinc-400">{{ $label }}</span>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

    {{-- FUNCIONALIDADES --}}
    <section id="features" class="scroll-mt-16 border-y border-zinc-800 bg-zinc-900/30 py-20">
        <div class="w-full px-4 sm:px-6 lg:px-10">
            <div class="mb-12 text-center">
                <h2 class="mb-3 text-3xl font-bold md:text-4xl">Tudo o que precisa para gerir condomínios</h2>
                <p class="text-zinc-400">Da primeira Taxa de Condomínio cobrada à última acta assinada</p>
            </div>

            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                @foreach ($features as [$icone, $titulo, $desc])
                    <div class="group relative rounded-xl border border-blue-900/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
                        <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/20">
                            {!! Icones::svg($icone, 'h-6 w-6 text-blue-400', 1.5) !!}
                        </div>
                        <h3 class="mb-2 font-semibold">{{ $titulo }}</h3>
                        <p class="text-sm text-zinc-400">{{ $desc }}</p>
                    </div>
                @endforeach
            </div>

            {{-- Para quem é --}}
            <div class="mt-12 grid gap-4 md:grid-cols-3">
                @foreach ($paraQuem as [$quem, $texto])
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
                        <h3 class="mb-1 text-sm font-semibold text-blue-300">{{ $quem }}</h3>
                        <p class="text-sm text-zinc-400">{{ $texto }}</p>
                    </div>
                @endforeach
            </div>

            <div class="mt-12 text-center">
                <a href="/catalogo" class="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-6 py-3 font-semibold transition hover:border-blue-400 hover:bg-blue-500/10">
                    Ver catálogo completo
                    <span class="text-blue-400">→</span>
                </a>
                <p class="mt-3 text-xs text-zinc-500">{{ $totalCatalogo }} funcionalidades já em produção</p>
            </div>
        </div>
    </section>

    {{-- PREÇOS + CALCULADORA --}}
    <section id="pricing" class="scroll-mt-16 border-b border-zinc-800 py-20">
        <div class="w-full px-4 sm:px-6 lg:px-10">
            <div class="mb-12 text-center">
                <h2 class="mb-3 text-3xl font-bold md:text-4xl">Calcule a sua subscrição</h2>
                <p class="text-zinc-400">Diga-nos quantos imóveis gere e qual o período. Veja o preço em tempo real.</p>
            </div>

            @if ($aplicavel)
                <div class="mb-10 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 md:p-8">
                    <div class="grid gap-8 md:grid-cols-2">
                        <div>
                            <div class="mb-4">
                                <label for="calc-imoveis" class="mb-2 block text-sm font-semibold text-zinc-300">Quantos imóveis gere?</label>
                                <div class="flex items-center gap-3">
                                    <input id="calc-imoveis" type="number" min="1" max="2000" value="{{ $numImoveis }}" inputmode="numeric"
                                        class="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-2xl font-bold text-white focus:border-blue-500 focus:outline-none">
                                    <span class="text-zinc-500">imóveis</span>
                                </div>
                            </div>
                            <input id="calc-slider" type="range" min="1" max="1000" value="{{ $numImoveis }}" aria-label="Número de imóveis" class="mb-3 w-full accent-blue-500">
                            <div class="mb-6 flex justify-between text-[10px] text-zinc-500" aria-hidden="true">
                                <span>1</span><span>250</span><span>500</span><span>750</span><span>1000+</span>
                            </div>

                            <span class="mb-2 block text-sm font-semibold text-zinc-300">Período de pagamento</span>
                            <div class="flex gap-1 rounded-lg bg-zinc-900 p-1 ring-1 ring-zinc-800" role="group" aria-label="Período de pagamento">
                                @foreach (['mensal' => 'Mensal', 'semestral' => 'Semestral', 'anual' => 'Anual'] as $p => $rotulo)
                                    <button type="button" data-periodo="{{ $p }}" aria-pressed="{{ $p === 'mensal' ? 'true' : 'false' }}"
                                        class="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition {{ $p === 'mensal' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white' }}">
                                        {{ $rotulo }}
                                        @if ($p === 'semestral' && $config['desconto_semestral_pct'] > 0)
                                            <span class="ml-1 text-[10px]">-{{ PrecosPublicos::pct($config['desconto_semestral_pct']) }}%</span>
                                        @elseif ($p === 'anual' && $config['desconto_anual_pct'] > 0)
                                            <span class="ml-1 text-[10px]">-{{ PrecosPublicos::pct($config['desconto_anual_pct']) }}%</span>
                                        @endif
                                    </button>
                                @endforeach
                            </div>
                        </div>

                        <div class="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 ring-1 ring-blue-500/20" aria-live="polite">
                            <div class="mb-1 text-[10px] uppercase tracking-widest text-zinc-500">Escalão aplicável</div>
                            <div class="mb-1 flex items-center gap-2">
                                <span id="calc-escalao" class="text-lg font-bold text-blue-300">{{ $aplicavel['nome'] }}</span>
                                <span id="calc-desc-qtd" class="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 {{ $aplicavel['desconto_qtd_pct'] > 0 ? '' : 'hidden' }}">-{{ PrecosPublicos::pct($aplicavel['desconto_qtd_pct']) }}% qtd</span>
                            </div>
                            <div id="calc-info" class="mb-5 text-xs text-zinc-500">
                                {{ $faixa($aplicavel) }} imóveis · {{ PrecosPublicos::kz($precoUnit) }} Kz por imóvel/mês
                            </div>

                            <div id="calc-total-rotulo" class="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Total mensal (1 mês)</div>
                            <div id="calc-total" class="mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                                {{ PrecosPublicos::kz($total) }} Kz
                            </div>
                            @if ($config['imposto_aplicavel'])
                                <div id="calc-subtotal" class="text-xs text-zinc-500">
                                    Subtotal: {{ PrecosPublicos::kz($subtotal) }} Kz · {{ $config['imposto_tipo'] }} {{ PrecosPublicos::pct($config['imposto_taxa_pct']) }}%: {{ PrecosPublicos::kz($total - $subtotal) }} Kz
                                </div>
                            @endif
                            <a href="/registo" class="mt-5 block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-center font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500">
                                Começar trial de {{ $trialDias }} dias →
                            </a>
                        </div>
                    </div>
                </div>

                <div class="mb-6 text-center">
                    <h3 class="text-lg font-semibold text-zinc-300">Todos os escalões disponíveis</h3>
                    <p class="text-xs text-zinc-500">Preço por imóvel/mês · Período <span id="calc-periodo">mensal</span></p>
                </div>
                <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    @foreach ($escaloes as $i => $e)
                        @php $activo = $aplicavel['slug'] === $e['slug']; @endphp
                        <div data-escalao="{{ $i }}"
                            class="relative rounded-2xl border p-5 transition {{ $activo ? 'border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/40' : ($e['destaque'] ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5' : 'border-zinc-800 bg-zinc-900/50') }}">
                            <div data-selo="activo" class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white {{ $activo ? '' : 'hidden' }}">
                                ✓ O seu plano
                            </div>
                            @if ($e['destaque'])
                                <div data-selo="popular" class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 {{ $activo ? 'hidden' : '' }}">
                                    ⭐ Popular
                                </div>
                            @endif
                            <h4 class="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{{ $e['nome'] }}</h4>
                            <div class="mb-3 text-xs text-zinc-500">{{ $faixa($e) }} imóveis</div>
                            <div class="text-xl font-bold">
                                <span data-preco>{{ PrecosPublicos::kz($e['preco_unit_mensal_kz']) }}</span> <span class="text-xs text-zinc-500">Kz</span>
                            </div>
                            <div class="text-[10px] text-zinc-500">por imóvel/mês</div>
                            @if ($e['desconto_qtd_pct'] > 0)
                                <div class="mt-1 text-[10px] text-blue-400">-{{ PrecosPublicos::pct($e['desconto_qtd_pct']) }}% qtd</div>
                            @endif
                            @if ($e['descricao'] !== '')
                                <p class="mt-3 text-[11px] leading-snug text-zinc-500">{{ $e['descricao'] }}</p>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif

            <div class="mt-8 text-center text-xs text-zinc-500">
                Trial de {{ $trialDias }} dias 100% grátis
                @if ($config['imposto_aplicavel'])
                    · {{ $config['imposto_tipo'] }} {{ PrecosPublicos::pct($config['imposto_taxa_pct']) }}% aplicável
                @endif
            </div>
        </div>
    </section>

    {{-- CTA FINAL --}}
    <section class="relative overflow-hidden py-24">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30"></div>
        <div class="relative w-full px-4 text-center sm:px-6 lg:px-10">
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
                Pronto para simplificar a sua
                <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">gestão?</span>
            </h2>
            <p class="mb-8 text-zinc-400">{{ $trialDias }} dias 100% grátis. Sem compromisso, cancele quando quiser.</p>
            <a href="/registo" class="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500">
                Começar agora →
            </a>
        </div>
    </section>

    {{-- DESCARREGAR APP --}}
    <section id="app" class="border-t border-blue-900/30 py-16">
        <div class="w-full px-4 text-center sm:px-6 lg:px-10">
            <h2 class="mb-3 text-2xl font-bold md:text-3xl">
                Descarregue a <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">app móvel</span>
            </h2>
            <p class="mb-8 text-zinc-400">Condóminos, guardas e prestadores: leve o ONDAKA no bolso.</p>
            <div class="flex flex-wrap items-center justify-center gap-4">
                <a href="https://play.google.com/store/apps/details?id=ao.ondaka.ondaka_app" target="_blank" rel="noopener noreferrer"
                   class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
                    <svg viewBox="0 0 24 24" class="h-7 w-7" fill="#fff" aria-hidden="true"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>
                    <span class="text-left leading-tight">
                        <span class="block text-[10px] uppercase tracking-wide text-zinc-400">Disponível no</span>
                        <span class="block text-sm font-semibold text-white">Google Play</span>
                    </span>
                </a>
                <a href="https://apps.apple.com/app/id6782891593" target="_blank" rel="noopener noreferrer"
                   class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
                    <svg viewBox="0 0 24 24" class="h-7 w-7" fill="#fff" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.036-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
                    <span class="text-left leading-tight">
                        <span class="block text-[10px] uppercase tracking-wide text-zinc-400">Descarregar na</span>
                        <span class="block text-sm font-semibold text-white">App Store</span>
                    </span>
                </a>
            </div>
        </div>
    </section>
@endsection

@push('scripts')
    @if ($aplicavel)
        <script type="application/json" id="calc-dados">{!! json_encode([
            'escaloes' => array_map(fn ($e) => [
                'nome' => $e['nome'],
                'min' => $e['imoveis_min'],
                'max' => $e['imoveis_max'],
                'qtd' => $e['desconto_qtd_pct'],
                'mensal' => $e['preco_unit_mensal_kz'],
                'semestral' => $e['preco_unit_semestral_kz'],
                'anual' => $e['preco_unit_anual_kz'],
                'destaque' => $e['destaque'],
            ], $escaloes),
            'imposto' => $config['imposto_aplicavel'] ? ['tipo' => $config['imposto_tipo'], 'taxa' => $config['imposto_taxa_pct']] : null,
        ], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        <script>
            (function () {
                var dados = JSON.parse(document.getElementById('calc-dados').textContent);
                var escaloes = dados.escaloes;
                var MESES = { mensal: 1, semestral: 6, anual: 12 };
                // As mesmas classes que o Blade põe no servidor (o Tailwind lê-as daqui).
                var CARD = {
                    activo: 'border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/40',
                    destaque: 'border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5',
                    normal: 'border-zinc-800 bg-zinc-900/50'
                };
                var BOTAO = {
                    on: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
                    off: 'text-zinc-400 hover:text-white'
                };
                var estado = { n: 1, periodo: 'mensal' };
                var $ = function (id) { return document.getElementById(id); };

                // Igual a PrecosPublicos::kz(): até 2 casas, espaço nos milhares, vírgula decimal.
                function kz(v) {
                    var partes = (Math.round(v * 100) / 100).toFixed(2).split('.');
                    var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                    var dec = partes[1].replace(/0+$/, '');
                    return dec ? inteiro + ',' + dec : inteiro;
                }
                function trocar(el, sai, entra) {
                    sai.split(' ').forEach(function (c) { if (c) el.classList.remove(c); });
                    entra.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
                }
                function aplicavel(n) {
                    for (var i = 0; i < escaloes.length; i++) {
                        var e = escaloes[i];
                        if (n >= e.min && n <= (e.max === null ? Infinity : e.max)) return i;
                    }
                    return 0;
                }

                function render() {
                    var idx = aplicavel(estado.n);
                    var e = escaloes[idx];
                    var unit = e[estado.periodo];
                    var meses = MESES[estado.periodo];
                    var subtotal = unit * estado.n * meses;
                    var total = dados.imposto ? subtotal * (1 + dados.imposto.taxa / 100) : subtotal;

                    $('calc-escalao').textContent = e.nome;
                    $('calc-desc-qtd').textContent = '-' + kz(e.qtd) + '% qtd';
                    $('calc-desc-qtd').classList.toggle('hidden', !(e.qtd > 0));
                    $('calc-info').textContent = e.min + (e.max ? '-' + e.max : '+') + ' imóveis · ' + kz(unit) + ' Kz por imóvel/mês';
                    $('calc-total-rotulo').textContent = 'Total ' + estado.periodo + ' (' + meses + ' ' + (meses === 1 ? 'mês' : 'meses') + ')';
                    $('calc-total').textContent = kz(total) + ' Kz';
                    if (dados.imposto && $('calc-subtotal')) {
                        $('calc-subtotal').textContent = 'Subtotal: ' + kz(subtotal) + ' Kz · ' + dados.imposto.tipo + ' ' + kz(dados.imposto.taxa) + '%: ' + kz(total - subtotal) + ' Kz';
                    }
                    $('calc-periodo').textContent = estado.periodo;

                    document.querySelectorAll('[data-escalao]').forEach(function (card) {
                        var i = parseInt(card.getAttribute('data-escalao'), 10);
                        var esc = escaloes[i];
                        var activo = i === idx;
                        trocar(card, CARD.activo + ' ' + CARD.destaque + ' ' + CARD.normal, activo ? CARD.activo : (esc.destaque ? CARD.destaque : CARD.normal));
                        card.querySelector('[data-preco]').textContent = kz(esc[estado.periodo]);
                        var seloActivo = card.querySelector('[data-selo="activo"]');
                        var seloPopular = card.querySelector('[data-selo="popular"]');
                        if (seloActivo) seloActivo.classList.toggle('hidden', !activo);
                        if (seloPopular) seloPopular.classList.toggle('hidden', activo);
                    });
                    document.querySelectorAll('[data-periodo]').forEach(function (b) {
                        var on = b.getAttribute('data-periodo') === estado.periodo;
                        b.setAttribute('aria-pressed', on ? 'true' : 'false');
                        trocar(b, BOTAO.on + ' ' + BOTAO.off, on ? BOTAO.on : BOTAO.off);
                    });
                }

                $('calc-imoveis').addEventListener('input', function (ev) {
                    var v = parseInt(ev.target.value, 10) || 1;
                    estado.n = Math.max(1, Math.min(2000, v));
                    $('calc-slider').value = Math.min(estado.n, 1000);
                    render();
                });
                $('calc-slider').addEventListener('input', function (ev) {
                    estado.n = parseInt(ev.target.value, 10) || 1;
                    $('calc-imoveis').value = estado.n;
                    render();
                });
                document.querySelectorAll('[data-periodo]').forEach(function (b) {
                    b.addEventListener('click', function () {
                        estado.periodo = b.getAttribute('data-periodo');
                        render();
                    });
                });
            })();
        </script>
    @endif
@endpush
