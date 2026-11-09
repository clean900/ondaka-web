{{--
    Layout das páginas públicas de ondaka.ao (landing, catálogo, loja).

    Blade e não Inertia: o texto tem de vir no HTML que o servidor entrega —
    o Google, as pré-visualizações de links (WhatsApp, redes) e a leitura de
    páginas por IA não correm o JavaScript. O cPanel não tem Node, por isso o
    SSR do Inertia não é opção. Só carrega o CSS do Vite; a pouca interacção
    (calculadora, pesquisa) é JavaScript simples dentro de cada página.

    Cada página define: @section('titulo'), @section('descricao'), @section('caminho')
    e recebe $trialDias do controller. Largura total do ecrã (sem coluna centrada).
--}}
@use('App\Support\Publico\Icones')
@php
    $urlBase = rtrim((string) config('app.url', 'https://ondaka.ao'), '/');
    $contactos = config('ondaka.contactos');
    $whatsappDigitos = preg_replace('/\D+/', '', (string) ($contactos['whatsapp'] ?? ''));
    $nav = [
        ['/#features', 'Funcionalidades'],
        ['/catalogo', 'Catálogo'],
        ['/loja', 'Loja'],
        ['/#pricing', 'Preços'],
        ['/afiliados', 'Afiliados'],
        ['/login', 'Entrar'],
    ];
@endphp
<!DOCTYPE html>
<html lang="pt-AO">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('titulo')</title>
    <meta name="description" content="@yield('descricao')">
    <link rel="canonical" href="{{ $urlBase }}@yield('caminho', '/')">
    <meta name="theme-color" content="#0a0a1a">

    <link rel="icon" href="/favicon.ico?v=2" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=2">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">

    {{-- Open Graph / partilha em redes e WhatsApp --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ONDAKA">
    <meta property="og:locale" content="pt_AO">
    <meta property="og:url" content="{{ $urlBase }}@yield('caminho', '/')">
    <meta property="og:title" content="@yield('titulo')">
    <meta property="og:description" content="@yield('descricao')">
    <meta property="og:image" content="{{ $urlBase }}/img/ondaka-og.png">
    <meta property="og:image:width" content="512">
    <meta property="og:image:height" content="512">
    <meta property="og:image:alt" content="Logótipo do ONDAKA">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="@yield('titulo')">
    <meta name="twitter:description" content="@yield('descricao')">
    <meta name="twitter:image" content="{{ $urlBase }}/img/ondaka-og.png">

    <script type="application/ld+json">{!! json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'ONDAKA',
        'url' => $urlBase,
        'logo' => $urlBase.'/img/ondaka-logo.png',
        'email' => $contactos['email'],
        'telephone' => '+'.$whatsappDigitos,
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => 'Urbanização Boa Vida, Centro de Escritórios',
            'addressLocality' => 'Luanda',
            'addressCountry' => 'AO',
        ],
        'sameAs' => [
            'https://play.google.com/store/apps/details?id=ao.ondaka.ondaka_app',
            'https://apps.apple.com/app/id6782891593',
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) !!}</script>
    @stack('head')

    @vite('resources/css/app.css')
</head>
<body class="min-h-screen bg-[#0a0a1a] text-zinc-100 antialiased" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif">
    <a href="#conteudo" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black">Saltar para o conteúdo</a>

    {{-- TOP BAR --}}
    <header class="sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md">
        <div class="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <a href="/" class="flex min-w-0 items-center gap-3">
                <img src="/img/ondaka-logo.png" alt="" width="36" height="36" class="h-9 w-9 rounded">
                <span class="min-w-0">
                    <span class="block text-base font-bold tracking-wide">ONDAKA</span>
                    <span class="hidden text-[10px] text-zinc-500 sm:block">KAYANTEC - Comércio e Serviços, (SU) Lda</span>
                </span>
            </a>
            <nav class="hidden gap-8 text-sm md:flex" aria-label="Principal">
                @foreach ($nav as [$href, $texto])
                    <a href="{{ $href }}" class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">{{ $texto }}</a>
                @endforeach
            </nav>
            <div class="flex shrink-0 items-center gap-2">
                <a href="/registo" class="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500">
                    Trial {{ $trialDias }} dias →
                </a>
                <details class="relative md:hidden">
                    <summary class="flex cursor-pointer list-none items-center rounded-lg border border-zinc-700 p-2 text-zinc-300 [&::-webkit-details-marker]:hidden" aria-label="Menu">
                        {!! Icones::svg('menu', 'h-5 w-5') !!}
                    </summary>
                    <nav class="absolute right-0 mt-2 flex w-56 flex-col rounded-xl border border-blue-900/40 bg-[#0a0a1a] p-2 shadow-2xl shadow-black/50" aria-label="Principal (telemóvel)">
                        @foreach ($nav as [$href, $texto])
                            <a href="{{ $href }}" class="rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/5">{{ $texto }}</a>
                        @endforeach
                    </nav>
                </details>
            </div>
        </div>
    </header>

    <main id="conteudo">
        @yield('conteudo')
    </main>

    {{-- RODAPÉ + CONTACTOS --}}
    <footer id="contactos" class="border-t border-blue-900/30 py-12">
        <div class="grid w-full gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
            <div>
                <div class="mb-3 flex items-center gap-3">
                    <img src="/img/ondaka-logo.png" alt="" width="32" height="32" class="h-8 w-8 rounded">
                    <span class="font-semibold text-zinc-200">ONDAKA</span>
                </div>
                <p class="text-sm text-zinc-500">A plataforma de gestão de condomínios criada para Angola — para empresas gestoras e administradores; os condóminos usam a app grátis.</p>
            </div>

            <div>
                <h2 class="mb-3 text-sm font-semibold text-zinc-300">Contactos</h2>
                <ul class="space-y-2 text-sm text-zinc-400">
                    <li class="flex items-start gap-2">
                        {!! Icones::svg('mail', 'mt-0.5 h-4 w-4 shrink-0 text-blue-400') !!}
                        <a href="mailto:{{ $contactos['email'] }}" class="hover:text-white">{{ $contactos['email'] }}</a>
                    </li>
                    <li class="flex items-start gap-2">
                        {!! Icones::svg('message-circle', 'mt-0.5 h-4 w-4 shrink-0 text-blue-400') !!}
                        <a href="https://wa.me/{{ $whatsappDigitos }}" class="hover:text-white" rel="noopener">WhatsApp {{ $contactos['whatsapp'] }}</a>
                    </li>
                    <li class="flex items-start gap-2">
                        {!! Icones::svg('map-pin', 'mt-0.5 h-4 w-4 shrink-0 text-blue-400') !!}
                        <span>{{ $contactos['morada'] }}</span>
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="mb-3 text-sm font-semibold text-zinc-300">Páginas</h2>
                <ul class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-zinc-400">
                    <li><a href="/#features" class="hover:text-white">Funcionalidades</a></li>
                    <li><a href="/catalogo" class="hover:text-white">Catálogo</a></li>
                    <li><a href="/loja" class="hover:text-white">Loja</a></li>
                    <li><a href="/#pricing" class="hover:text-white">Preços</a></li>
                    <li><a href="/afiliados" class="hover:text-white">Programa de Afiliados</a></li>
                    <li><a href="/app" class="hover:text-white">Descarregar a app</a></li>
                    <li><a href="/termos" class="hover:text-white">Termos</a></li>
                    <li><a href="/privacidade" class="hover:text-white">Privacidade</a></li>
                    <li><a href="/login" class="hover:text-white">Entrar</a></li>
                </ul>
            </div>
        </div>
        <div class="mt-10 w-full border-t border-zinc-800/60 px-4 pt-6 text-xs text-zinc-500 sm:px-6 lg:px-10">
            © {{ date('Y') }} KAYANTEC - Comércio e Serviços, (SU) Lda · Todos os direitos reservados
        </div>
    </footer>

    @stack('scripts')
</body>
</html>
