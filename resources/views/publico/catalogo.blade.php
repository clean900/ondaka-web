{{--
    Catálogo público (/catalogo). Era resources/js/pages/Catalogo/Index.tsx;
    passou a Blade para o texto vir no HTML do servidor. Os dados estão em
    App\Support\Publico\CatalogoPublico (só o que está em produção).
    A pesquisa é JavaScript simples; sem ele, a página mostra tudo.
--}}
@extends('publico.layout')
@use('App\Support\Publico\Icones')

@php
    $cores = [
        'blue' => ['caixa' => 'from-blue-500/20 to-blue-700/10 ring-blue-500/30', 'icone' => 'text-blue-400'],
        'purple' => ['caixa' => 'from-purple-500/20 to-purple-700/10 ring-purple-500/30', 'icone' => 'text-purple-400'],
        'cyan' => ['caixa' => 'from-cyan-500/20 to-cyan-700/10 ring-cyan-500/30', 'icone' => 'text-cyan-400'],
        'pink' => ['caixa' => 'from-pink-500/20 to-pink-700/10 ring-pink-500/30', 'icone' => 'text-pink-400'],
    ];
    $minusculas = fn (string $t) => mb_strtolower($t, 'UTF-8');
@endphp

@section('titulo', 'Catálogo de funcionalidades · ONDAKA')
@section('descricao', 'Todas as funcionalidades do ONDAKA já em produção: Taxas de Condomínio, Multicaixa Express, assembleias digitais, Pedidos, portaria com QR, app móvel e conformidade com o DP 141/15.')
@section('caminho', '/catalogo')

@section('conteudo')
    {{-- HERO --}}
    <section class="relative overflow-hidden border-b border-blue-900/30 py-16">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div class="relative w-full px-4 text-center sm:px-6 lg:px-10">
            <h1 class="mb-4 text-4xl font-bold md:text-5xl">
                Catálogo
                <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">completo</span>
            </h1>
            <p class="mb-8 text-zinc-400">
                Tudo o que a plataforma ONDAKA oferece — <span class="font-semibold text-green-300">já em produção</span>.
            </p>

            <div class="inline-grid grid-cols-2 gap-4">
                <div class="rounded-xl border border-green-500/30 bg-green-500/5 px-8 py-4">
                    <div class="text-3xl font-bold text-green-300">{{ $total }}</div>
                    <div class="text-[10px] uppercase tracking-wider text-green-400">Funcionalidades em produção</div>
                </div>
                <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 py-4">
                    <div class="text-3xl font-bold">{{ count($categorias) }}</div>
                    <div class="text-[10px] uppercase tracking-wider text-zinc-500">Categorias</div>
                </div>
            </div>
        </div>
    </section>

    {{-- PESQUISA --}}
    <section class="sticky top-[61px] z-40 border-b border-zinc-800 bg-[#0a0a1a]/95 backdrop-blur-md">
        <div class="w-full px-4 py-4 sm:px-6 lg:px-10">
            <label for="cat-busca" class="sr-only">Pesquisar funcionalidade</label>
            <div class="relative">
                {!! Icones::svg('search', 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500') !!}
                <input id="cat-busca" type="search" placeholder="Pesquisar funcionalidade..." autocomplete="off"
                    class="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none">
            </div>
        </div>
    </section>

    {{-- CATEGORIAS --}}
    <section class="py-12">
        <div class="w-full space-y-12 px-4 sm:px-6 lg:px-10">
            {{-- Vazio no HTML (um leitor sem JS não deve ler «nenhuma encontrada»); o script escreve a mensagem. --}}
            <div id="cat-vazio" class="hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500"></div>

            @foreach ($categorias as $cat)
                @php $cor = $cores[$cat['cor']] ?? $cores['blue']; @endphp
                <div data-categoria id="{{ $cat['id'] }}" class="scroll-mt-32">
                    <div class="mb-6 flex items-center gap-4">
                        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 {{ $cor['caixa'] }}">
                            {!! Icones::svg($cat['icone'], 'h-7 w-7 '.$cor['icone'], 1.5) !!}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold">{{ $cat['titulo'] }}</h2>
                            <p class="text-sm text-zinc-500">{{ $cat['descricao'] }}</p>
                        </div>
                        <span data-contagem class="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400">{{ count($cat['features']) }}</span>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        @foreach ($cat['features'] as $f)
                            <div data-busca="{{ $minusculas($f['nome'].' '.$f['desc']) }}"
                                class="group relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5">
                                <h3 class="mb-2 text-sm font-semibold leading-tight text-zinc-100">{{ $f['nome'] }}</h3>
                                <p class="mb-3 text-xs leading-relaxed text-zinc-400">{{ $f['desc'] }}</p>
                                <span class="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                                    {!! Icones::svg('check-circle', 'h-3 w-3') !!}
                                    Em produção
                                </span>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>
    </section>

    {{-- CTA --}}
    <section class="relative overflow-hidden py-20">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30"></div>
        <div class="relative w-full px-4 text-center sm:px-6 lg:px-10">
            <h2 class="mb-4 text-3xl font-bold md:text-4xl">
                Veja o ONDAKA em
                <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">acção</span>
            </h2>
            <p class="mb-8 text-zinc-400">{{ $trialDias }} dias 100% grátis. Sem compromisso, cancele quando quiser.</p>
            <a href="/registo" class="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500">
                Começar agora →
            </a>
        </div>
    </section>
@endsection

@push('scripts')
    <script>
        (function () {
            var semAcentos = function (t) { return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
            var campo = document.getElementById('cat-busca');
            var vazio = document.getElementById('cat-vazio');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-busca]'));
            cards.forEach(function (c) { c._busca = semAcentos(c.getAttribute('data-busca')); });

            campo.addEventListener('input', function () {
                var q = semAcentos(campo.value.trim());
                var algum = false;
                document.querySelectorAll('[data-categoria]').forEach(function (cat) {
                    var visiveis = 0;
                    cat.querySelectorAll('[data-busca]').forEach(function (c) {
                        var mostra = q === '' || c._busca.indexOf(q) !== -1;
                        c.classList.toggle('hidden', !mostra);
                        if (mostra) visiveis++;
                    });
                    cat.classList.toggle('hidden', visiveis === 0);
                    cat.querySelector('[data-contagem]').textContent = visiveis;
                    if (visiveis) algum = true;
                });
                vazio.textContent = algum ? '' : 'Nenhuma funcionalidade encontrada com esta pesquisa.';
                vazio.classList.toggle('hidden', algum);
            });
        })();
    </script>
@endpush
