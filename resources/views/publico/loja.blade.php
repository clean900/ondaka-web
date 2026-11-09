{{--
    Loja pública de add-ons (/loja). Era resources/js/pages/Loja/Index.tsx;
    passou a Blade para o texto vir no HTML do servidor. Os add-ons e os preços
    vêm da tabela features; o imposto vem da plataforma_config.
    A pesquisa e o filtro são JavaScript simples; sem ele, a página mostra tudo.
--}}
@extends('publico.layout')
@use('App\Support\Publico\Icones')
@use('App\Support\Publico\PrecosPublicos')

@php
    $trialDias = $condicoes['trial_dias'];
    $categoriaLabels = [
        'comunicacao' => 'Comunicação',
        'pagamentos' => 'Pagamentos',
        'seguranca' => 'Segurança',
        'gestao' => 'Gestão',
        'personalizacao' => 'Personalização',
        'outros' => 'Outros',
    ];
    $categoriaCores = [
        'comunicacao' => '#00D4FF',
        'pagamentos' => '#10B981',
        'seguranca' => '#EF4444',
        'gestao' => '#A855F7',
        'personalizacao' => '#EC4899',
        'outros' => '#6B7280',
    ];
    $modeloLabels = [
        'subscription' => 'Mensal',
        'one_time' => 'Pagamento único',
        'consumable' => 'Por consumo',
    ];
    $kz2 = fn (float $v) => number_format($v, 2, ',', "\u{00A0}");
    $categorias = array_values(array_unique(array_column($features, 'categoria')));
    $minusculas = fn (?string $t) => mb_strtolower((string) $t, 'UTF-8');
@endphp

@section('titulo', 'Loja de add-ons · ONDAKA')
@section('descricao', 'Funcionalidades adicionais do ONDAKA para empresas gestoras e administradores de condomínios: active apenas o que precisa, quando precisa. Preços em Kwanzas.')
@section('caminho', '/loja')

@section('conteudo')
    <div style="background: radial-gradient(ellipse at top, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.08) 0%, transparent 50%), #0A0A1F">
        <section class="w-full px-4 py-12 sm:px-6 lg:px-10">
            <div class="mb-10 text-center">
                <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {!! Icones::svg('shopping-bag', 'h-3.5 w-3.5 text-[#00D4FF]') !!}
                    <span class="text-xs text-white/70">Loja de Add-ons</span>
                </div>
                <h1 class="gradient-ondaka-text mb-3 text-3xl font-bold md:text-4xl">Estenda a sua plataforma</h1>
                <p class="text-white/60">
                    Funcionalidades adicionais para empresas gestoras e administradores que querem mais.
                    Active apenas o que precisa, quando precisa.
                    @if ($condicoes['imposto_aplicavel'])
                        Aos preços acresce {{ $condicoes['imposto_tipo'] }} {{ PrecosPublicos::pct($condicoes['imposto_taxa_pct']) }}%.
                    @endif
                </p>
            </div>

            {{-- Filtros --}}
            <div class="mb-8 flex flex-col gap-3 md:flex-row">
                <div class="relative flex-1">
                    <label for="loja-busca" class="sr-only">Pesquisar funcionalidade</label>
                    {!! Icones::svg('search', 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40') !!}
                    <input id="loja-busca" type="search" placeholder="Pesquisar funcionalidade..." autocomplete="off"
                        class="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm focus:border-[#00D4FF]/50 focus:outline-none">
                </div>
                <label for="loja-categoria" class="sr-only">Categoria</label>
                <select id="loja-categoria" class="rounded-lg border border-white/10 bg-[#0A0A1F] px-4 py-2.5 text-sm focus:border-[#00D4FF]/50 focus:outline-none md:w-60">
                    <option value="">Todas as categorias</option>
                    @foreach ($categorias as $c)
                        <option value="{{ $c }}">{{ $categoriaLabels[$c] ?? $c }}</option>
                    @endforeach
                </select>
            </div>

            {{-- Com add-ons, a mensagem fica vazia no HTML (um leitor sem JS não a deve ler); o script escreve-a. --}}
            <div id="loja-vazio" class="{{ $features === [] ? '' : 'hidden' }} py-16 text-center text-white/40">{{ $features === [] ? 'De momento não há add-ons disponíveis.' : '' }}</div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                @foreach ($features as $f)
                    @php $cor = $categoriaCores[$f['categoria']] ?? '#6B7280'; @endphp
                    <article data-busca="{{ $minusculas($f['nome'].' '.$f['descricao']) }}" data-categoria="{{ $f['categoria'] }}"
                        class="group rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/15 hover:bg-white/[0.04]">
                        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style="background: {{ $cor }}15; border: 0.5px solid {{ $cor }}30; color: {{ $cor }}">
                            {!! Icones::svg('shopping-bag', 'h-5 w-5') !!}
                        </div>

                        <span class="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style="background: {{ $cor }}10; color: {{ $cor }}">
                            {{ $categoriaLabels[$f['categoria']] ?? $f['categoria'] }}
                        </span>

                        <h2 class="mb-1.5 font-semibold text-white">{{ $f['nome'] }}</h2>
                        <p class="mb-4 min-h-[2.5rem] text-xs leading-relaxed text-white/60">{{ $f['descricao'] ?: '—' }}</p>

                        <div class="border-t border-white/5 pt-3">
                            <div class="mb-3 flex items-end justify-between">
                                <div>
                                    <div class="text-[10px] uppercase tracking-wide text-white/40">{{ $modeloLabels[$f['modelo_cobranca']] ?? '—' }}</div>
                                    <div class="text-lg font-bold text-white">
                                        {{ $f['preco_base'] > 0 ? $kz2($f['preco_base']).' Kz' : 'Sob consulta' }}
                                    </div>
                                </div>
                                @if ($f['preco_activacao'] > 0)
                                    <div class="text-right text-[10px] text-white/50">
                                        Activação:<br>
                                        <strong class="text-white/80">{{ $kz2($f['preco_activacao']) }} Kz</strong>
                                    </div>
                                @endif
                            </div>
                            <a href="/registo" class="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#A855F7] py-2 text-center text-xs font-medium text-white transition hover:opacity-90">
                                Activar {!! Icones::svg('arrow-right', 'h-3.5 w-3.5') !!}
                            </a>
                        </div>
                    </article>
                @endforeach
            </div>
        </section>
    </div>
@endsection

@push('scripts')
    <script>
        (function () {
            var semAcentos = function (t) { return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
            var busca = document.getElementById('loja-busca');
            var categoria = document.getElementById('loja-categoria');
            var vazio = document.getElementById('loja-vazio');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-busca]'));
            cards.forEach(function (c) { c._busca = semAcentos(c.getAttribute('data-busca')); });

            function filtrar() {
                var q = semAcentos(busca.value.trim());
                var cat = categoria.value;
                var visiveis = 0;
                cards.forEach(function (c) {
                    var mostra = (q === '' || c._busca.indexOf(q) !== -1) && (cat === '' || c.getAttribute('data-categoria') === cat);
                    c.classList.toggle('hidden', !mostra);
                    if (mostra) visiveis++;
                });
                vazio.textContent = visiveis > 0 ? '' : 'Nenhuma funcionalidade encontrada.';
                vazio.classList.toggle('hidden', visiveis > 0);
            }
            busca.addEventListener('input', filtrar);
            categoria.addEventListener('change', filtrar);
        })();
    </script>
@endpush
