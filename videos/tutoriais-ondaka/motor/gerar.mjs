#!/usr/bin/env node
// ===========================================================================
// ADSA — o motor dos tutoriais em vídeo.
//
// UM SÍTIO SÓ A SABER FAZER VÍDEOS. Cada vídeo é um ficheiro HTML (uma
// composição HyperFrames) escrito por este gerador a partir de três coisas:
//   guioes/<slug>.json      — o que o vídeo diz e para onde aponta (cenas e passos)
//   capturas/indice.json    — os prints reais do portal e o tamanho de cada um
//   capturas/<ecrã>.mapa.json — onde está cada elemento dentro do print
// Ninguém edita filmes/<slug>.html à mão: muda-se o guião, gera-se outra vez.
// É por isso que quarenta vídeos custam o mesmo que um a manter.
//
// O GUIÃO (guioes/<slug>.json):
//   { "numero": 1, "titulo": "…", "subtitulo": "…", "resumo": ["…","…","…"],
//     "cenas": [ { "ecra": "saude", "imagem": "normal|inteiro",
//                  "passos": [ { "titulo": "…", "texto": "…", "dur": 6,
//                                "foco": [x,y,w,h] | {"sel":"#id"} | {"texto":"…","bloco":true},
//                                "cursor": true | {"sel":…} | {"texto":…} } ] } ] }
//   `foco` é a zona para onde a câmara vai; `cursor` onde o ponteiro clica (por
//   omissão, o centro do foco). Sem `foco`, o passo vê o ecrã inteiro.
//
// Uso:  node motor/gerar.mjs [slug ...]      (sem argumentos = todos os guiões)
// ===========================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const GUIOES = join(RAIZ, 'guioes');
const CAPTURAS = join(RAIZ, 'capturas');
const FILMES = join(RAIZ, 'filmes');

// --- A MARCA ---------------------------------------------------------------
// O motor é o mesmo para as três plataformas; o que muda é a marca. Vive num
// `marca.json` à raiz do projeto de vídeos, para que copiar o motor para outro
// produto não obrigue a mexer numa linha de código. Sem ficheiro, valem os
// valores do ADSA, que foi onde isto nasceu.
const CORES_BASE = {
  fundo: '#0a1120', janela: '#0d1728', barra: '#111c32',
  texto: '#e8eef9', texto2: '#93a4c0', texto3: '#d3dcec',
  acento: '#2dd4bf', grad1: '#3b82f6', grad2: '#8b5cf6', kicker: '#a5b4fc',
};
// NÃO HÁ MARCA POR OMISSÃO, de propósito. Em tempos o motor trazia a do ADSA
// como fallback, e os tutoriais do Welwitschia saíram com o número de telefone
// da Academia Digital — um contacto errado que foi parar ao material comercial
// de outro produto. Sem marca.json, isto pára aqui em vez de inventar.
if (!existsSync(join(RAIZ, 'marca.json'))) {
  console.error('Falta marca.json em ' + RAIZ + ' — o motor não adivinha a marca.');
  process.exit(1);
}
const MARCA_BASE = { caminho_base: '/', whatsapp: null, email: null };
const _m = JSON.parse(readFileSync(join(RAIZ, 'marca.json'), 'utf8'));
for (const campo of ['nome', 'sub', 'logo', 'dominio']) {
  if (!_m[campo]) { console.error('marca.json sem «' + campo + '»'); process.exit(1); }
}
// as cores fundem-se campo a campo: um marca.json pode trocar só o acento
const MARCA = { ...MARCA_BASE, ..._m, cores: { ...CORES_BASE, ...(_m.cores ?? {}) } };
const C = MARCA.cores;
const LOGO = 'assets/' + MARCA.logo.split(/[\\/]/).pop();
// O rodapé do resumo: WhatsApp e email, os que houver.
const contactoHtml = () => {
  const p = [];
  if (MARCA.whatsapp) p.push('WhatsApp <b>' + esc(MARCA.whatsapp) + '</b>');
  if (MARCA.email) p.push('<b>' + esc(MARCA.email) + '</b>');
  return p.length ? 'Dúvidas? ' + p.join(' · ') : '';
};
const marcaHtml = (px) =>
  `<div class="marca"><img class="logo" src="${LOGO}" alt="" width="${px}" height="${px}">` +
  `<span class="nome">${esc(MARCA.nome)}</span><span class="sub">${esc(MARCA.sub)}</span></div>`;

// --- a geometria do palco --------------------------------------------------
// 1920×1080. O print vive numa "janela de browser" com margem à volta; o balão
// de cada passo pousa em cima do print, no lado oposto ao da zona em foco.
const PALCO = { w: 1920, h: 1080 };
const JANELA = { x: 96, y: 92, w: 1728, h: 972 };   // 16:9, igual ao print
const BARRA = 44;                                    // a barra de topo do "browser"
const VIEW = { x: JANELA.x, y: JANELA.y + BARRA, w: JANELA.w, h: JANELA.h - BARRA };

// --- tempos (segundos) -----------------------------------------------------
const T = { capa: 5.0, vista: 1.6, passo: 6, mover: 0.9, fundir: 0.6, resumo: 6, cursor: 0.7 };

// O RITMO É O DA NARRAÇÃO, NÃO O DA ANIMAÇÃO. Cada passo dura o tempo de ler o
// texto dele em voz alta, devagar — cerca de 2 palavras por segundo em português
// falado com calma — mais a entrada da câmara e uma pausa no fim. Um guião pode
// pedir mais tempo (`dur`), nunca menos: o vídeo nunca corre à frente da voz.
const PALAVRAS_POR_SEGUNDO = 2.0;
const duracaoLeitura = (texto, minimo = 0) => {
  const n = String(texto ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(minimo, Math.ceil(n / PALAVRAS_POR_SEGUNDO + 3));
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n2 = (x) => Math.round(x * 100) / 100;
// as sombras da marca pedem o acento em componentes, para entrar num rgba()
const rgb = (hex) => {
  const h = String(hex).replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
};

// Toda a saída é um desvanecimento SEGUIDO de um corte seco no mesmo instante.
// O renderizador salta para qualquer frame sem passar pelos anteriores; sem o
// tl.set, um salto para depois do desvanecimento podia apanhar o elemento
// visível (lint: gsap_exit_missing_hard_kill).
const sair = (sel, t, dur) => [
  `tl.to("${sel}", {opacity:0, duration:${n2(dur)}, ease:"power2.in"}, ${n2(t)});`,
  `tl.set("${sel}", {opacity:0}, ${n2(t + dur)});`,
];

// --- resolver o foco: literal, selector ou texto ---------------------------
function carregarMapa(ecra) {
  const f = join(CAPTURAS, `${ecra}.mapa.json`);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : [];
}
function procurar(mapa, ref, ecra) {
  if (Array.isArray(ref)) return { x: ref[0], y: ref[1], w: ref[2], h: ref[3] };
  // `caixa` é o rectângulo escrito à mão, para o que o mapa não apanha — um
  // endereço dentro de uma caixa que não é <input>, por exemplo. Serve também
  // ao `tapar`, que precisa de levar o texto de substituição ao lado.
  if (ref.caixa) return { x: ref.caixa[0], y: ref.caixa[1], w: ref.caixa[2], h: ref.caixa[3] };
  if (ref.sel) {
    const e = mapa.find(m => m.sel === ref.sel) || mapa.find(m => m.sel.startsWith(ref.sel));
    if (!e) throw new Error(`em ${ecra}: não encontrei o selector «${ref.sel}» no mapa`);
    return ref.bloco && e.bloco ? e.bloco : e;
  }
  if (ref.texto) {
    const t = ref.texto.toLowerCase();
    const cands = mapa.filter(m => m.texto && m.texto.toLowerCase().includes(t));
    if (!cands.length) throw new Error(`em ${ecra}: não encontrei nenhum elemento com o texto «${ref.texto}»`);
    // Quando várias coisas têm o texto (um painel e o título dentro dele), fica
    // a mais pequena: é a que aponta ao que se quer, não ao que o contém.
    const e = cands.sort((a, b) => a.w * a.h - b.w * b.h)[ref.n ?? 0] || cands[0];
    return ref.bloco && e.bloco ? e.bloco : e;
  }
  throw new Error(`em ${ecra}: foco sem forma reconhecida: ${JSON.stringify(ref)}`);
}

// --- a câmara: do rectângulo no print à pose do invólucro -----------------
// O invólucro (.camera) tem transform-origin 0 0; a pose é {s, x, y} tal que o
// rectângulo em foco fica centrado na janela, com folga, sem nunca mostrar
// fundo vazio à volta do print. s=1 é um píxel do print por píxel do palco —
// o print é 2× (DSF 2), por isso até aí continua nítido.
function pose(foco, img, folga = 0.14) {
  const s0 = VIEW.w / img.w;                          // vista geral: o print inteiro
  if (!foco) return { s: s0, x: 0, y: 0 };
  // Folga pequena à largura e maior à altura: os blocos do portal são largos e
  // baixos, e com folga igual dos dois lados a câmara quase não se mexia neles.
  const px = Math.max(40, foco.w * 0.05), py = Math.max(60, foco.h * folga);
  let s = Math.min(VIEW.w / (foco.w + 2 * px), VIEW.h / (foco.h + 2 * py), 1.0);
  s = Math.max(s, s0);
  const cx = foco.x + foco.w / 2, cy = foco.y + foco.h / 2;
  let x = VIEW.w / 2 - s * cx, y = VIEW.h / 2 - s * cy;
  x = Math.min(0, Math.max(VIEW.w - s * img.w, x));
  y = Math.min(0, Math.max(VIEW.h - s * img.h, y));
  return { s: n2(s), x: n2(x), y: n2(y) };
}
// Onde pousa o balão: no lado oposto ao da zona em foco, para não a tapar.
function ladoDoBalao(foco, img, p) {
  if (!foco) return 'baixo';
  // Decide-se pelo FUNDO da zona em foco, não pelo centro: um bloco alto fica
  // centrado e o balão (em baixo) tapava-lhe a última linha — foi assim que
  // escondeu o link do Código de Cliente. Se o fundo da zona entra na faixa do
  // balão, o balão vai para cima.
  const fundoPalco = p.y + p.s * (foco.y + foco.h);
  const cyPalco = p.y + p.s * (foco.y + foco.h / 2);
  return (fundoPalco > VIEW.h - 300 || cyPalco > VIEW.h * 0.55) ? 'cima' : 'baixo';
}

// --- gerar um vídeo ---------------------------------------------------------
function gerar(slug) {
  const g = JSON.parse(readFileSync(join(GUIOES, `${slug}.json`), 'utf8'));
  const indice = JSON.parse(readFileSync(join(CAPTURAS, 'indice.json'), 'utf8'));
  const id = `tutorial-${slug}`;
  // Cada vídeo é um projeto HyperFrames completo (index.html + hyperframes.json):
  // o check, o snapshot e o render do CLI trabalham sobre o index.html de uma
  // pasta, por isso um ficheiro por vídeo dentro da mesma pasta não se verifica.
  const PASTA = join(FILMES, slug);
  mkdirSync(join(PASTA, 'assets', 'capturas'), { recursive: true });
  for (const f of ['hyperframes.json', 'package.json']) copyFileSync(join(FILMES, f), join(PASTA, f));
  // O logótipo é o do produto, o mesmo ficheiro que o backend serve — não uma
  // cópia solta que um dia deixa de ser igual à marca.
  copyFileSync(join(RAIZ, MARCA.logo), join(PASTA, LOGO));

  let t = 0;
  const clips = [];      // HTML dos clips
  const audios = [];     // os clips de voz, à raiz (nunca dentro de um clip com tempo)
  const tl = [];         // linhas de GSAP
  const css = [];        // CSS específico (poses iniciais)
  const narracao = [];   // o guião falado, com os tempos — para gravar ou sintetizar a voz

  // A VOZ MANDA NO TEMPO. Se o narrar.mjs já produziu voz.json, cada passo dura
  // pelo menos o que a voz demora a dizê-lo (mais uma pausa); sem voz, vale a
  // estimativa por palavras. Assim o mesmo guião serve mudo ou narrado.
  const voz = existsSync(join(PASTA, 'voz.json')) ? JSON.parse(readFileSync(join(PASTA, 'voz.json'), 'utf8')) : null;
  const vozDe = (passo) => voz?.passos.find(p => String(p.passo) === String(passo)) ?? null;
  const PAUSA_VOZ = 1.0;   // o silêncio depois de cada frase: um segundo, não mais
  let contador = 0;      // numera os passos na mesma ordem do ciclo principal

  // ---- capa ----
  const num = String(g.numero ?? 0).padStart(2, '0');
  const vCapa = vozDe('capa');
  const dCapa = vCapa ? Math.max(4, n2(0.6 + vCapa.dur + PAUSA_VOZ)) : T.capa;
  if (vCapa) audios.push(`  <audio id="${id}-voz-capa" src="${vCapa.ficheiro}" data-start="0.6" data-duration="${n2(vCapa.dur)}" data-track-index="30" data-volume="1"></audio>`);
  clips.push(`
  <section id="${id}-capa" class="clip capa" data-start="0" data-duration="${n2(dCapa + T.fundir)}" data-track-index="1">
    <div class="capa-in">
      ${marcaHtml(112)}
      <div class="kicker">${esc(g.rotulo ?? `Tutorial ${num}`)}</div>
      <h1 class="titulo">${esc(g.titulo)}</h1>
      <p class="subtitulo">${esc(g.subtitulo ?? '')}</p>
    </div>
  </section>`);
  tl.push(`tl.fromTo("#${id}-capa .marca", {opacity:0, y:-18}, {opacity:1, y:0, duration:0.6, ease:"power3.out"}, 0.1);`);
  tl.push(`tl.fromTo("#${id}-capa .kicker", {opacity:0, x:-24}, {opacity:1, x:0, duration:0.5, ease:"power3.out"}, 0.45);`);
  tl.push(`tl.fromTo("#${id}-capa .titulo", {opacity:0, y:36}, {opacity:1, y:0, duration:0.8, ease:"power3.out"}, 0.6);`);
  tl.push(`tl.fromTo("#${id}-capa .subtitulo", {opacity:0, y:20}, {opacity:1, y:0, duration:0.7, ease:"power3.out"}, 0.95);`);
  tl.push(...sair(`#${id}-capa .capa-in`, dCapa, T.fundir));
  t = dCapa;

  // ---- cenas ----
  let nPasso = 0;
  g.cenas.forEach((cena, ci) => {
    const ecra = indice.ecrans.find(e => e.slug === cena.ecra);
    if (!ecra || ecra.erro) throw new Error(`${slug}: o ecrã «${cena.ecra}» não está capturado — corre capturar.mjs`);
    const inteiro = cena.imagem === 'inteiro';
    const ficheiro = inteiro ? `${cena.ecra}-inteiro.png` : `${cena.ecra}.png`;
    copyFileSync(join(CAPTURAS, ficheiro), join(PASTA, 'assets', 'capturas', ficheiro));
    const img = { w: ecra.largura, h: inteiro ? ecra.altura_total : ecra.altura };
    const mapa = carregarMapa(cena.ecra);
    const cid = `${id}-c${ci + 1}`;

    const passos = cena.passos ?? [];
    for (const p of passos) {
      contador += 1;
      p.voz = vozDe(contador);
      // Com voz, a voz É o tempo: a estimativa por palavras só serve ao vídeo mudo.
      // Deixá-la ganhar quando era maior punha segundos de ar morto a seguir a
      // cada frase — foi a primeira coisa que o Bráulio notou.
      p.dur = p.voz
        ? Math.max(3, n2(0.4 + p.voz.dur + PAUSA_VOZ))
        : duracaoLeitura(`${p.titulo ?? ''} ${p.texto ?? ''}`, p.dur ?? T.passo);
    }
    const dur = T.vista + passos.reduce((a, p) => a + p.dur, 0);
    const inicio = n2(t);
    const p0 = pose(null, img);

    // `tapar`: zonas do print que NÃO podem sair num vídeo público — o Código de
    // Cliente, um email, um link com a chave lá dentro. Ficam cobertas por uma
    // placa com o texto de substituição, dentro da câmara (acompanham o zoom).
    const tapas = (cena.tapar ?? []).map((tp, i) => {
      const r = procurar(mapa, tp, cena.ecra);
      // A placa pode ficar debaixo de um balão — é decoração, não texto a ler;
      // sem a marca, o check acusava «texto escondido» de propósito.
      return `<div class="tapa" id="${cid}-t${i + 1}" data-layout-allow-occlusion data-layout-allow-overlap style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;font-size:${Math.max(28, Math.round(r.h * 0.42))}px">${esc(tp.texto_sub ?? '')}</div>`;
    });
    const destaques = [], cursorHtml = `<div class="cursor" id="${cid}-cursor"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M4 2l16 9.5-7 1.3-3.6 6.2z" fill="#fff" stroke="${C.fundo}" stroke-width="1.4" stroke-linejoin="round"/></svg><div class="onda"></div></div>`;
    let temCursor = false, cursorPos = null;

    // Pose inicial da câmara fora da linha do tempo, por gsap.set e NÃO por CSS:
    // um transform inicial em CSS a lutar com um tween de GSAP na mesma
    // propriedade é o erro que o lint apanha primeiro (gsap_css_transform_conflict).
    tl.push(`tl.fromTo("#${cid} .cena-in", {opacity:0}, {opacity:1, duration:${T.fundir}, ease:"power2.out"}, ${inicio});`);
    tl.push(`gsap.set("#${cid} .camera", {x:${p0.x}, y:${p0.y}, scale:${p0.s}, transformOrigin:"0 0"});`);

    let tp = inicio + T.vista;
    passos.forEach((p, pi) => {
      nPasso += 1;
      const d = p.dur;
      narracao.push({ passo: nPasso, inicio: n2(tp), dur: n2(d), titulo: p.titulo ?? '', texto: p.texto ?? '' });
      // A voz começa quando a câmara já assentou e o balão está a aparecer.
      if (p.voz) audios.push(`  <audio id="${id}-voz-${nPasso}" src="${p.voz.ficheiro}" data-start="${n2(tp + 0.4)}" data-duration="${n2(p.voz.dur)}" data-track-index="30" data-volume="1"></audio>`);
      const foco = p.foco ? procurar(mapa, p.foco, cena.ecra) : null;
      const ps = pose(foco, img);
      // O guião pode fixar o lado do balão ("balao": "cima"|"baixo") quando a regra
      // automática tapa o que a voz está a descrever — aconteceu com o cartão EDR.
      const lado = (p.balao === 'cima' || p.balao === 'baixo') ? p.balao : ladoDoBalao(foco, img, ps);
      const did = `${cid}-d${pi + 1}`;

      // câmara
      tl.push(`tl.to("#${cid} .camera", {x:${ps.x}, y:${ps.y}, scale:${ps.s}, duration:${T.mover}, ease:"power2.inOut"}, ${n2(tp)});`);

      // realce da zona (vive dentro da câmara, em píxeis do print)
      if (foco) {
        destaques.push(`<div class="destaque" id="${did}" style="left:${foco.x - 10}px;top:${foco.y - 10}px;width:${foco.w + 20}px;height:${foco.h + 20}px;border-width:${n2(Math.max(3, 4 / ps.s))}px"></div>`);
        tl.push(`tl.fromTo("#${did}", {opacity:0, scale:1.04}, {opacity:1, scale:1, duration:0.45, ease:"power2.out"}, ${n2(tp + T.mover * 0.6)});`);
        tl.push(...sair(`#${did}`, tp + d - 0.35, 0.35));
      }

      // cursor: vai ao sítio e clica
      if (p.cursor) {
        const alvo = p.cursor === true ? foco : procurar(mapa, p.cursor, cena.ecra);
        if (alvo) {
          const cx = alvo.x + alvo.w / 2, cy = alvo.y + alvo.h / 2;
          if (!temCursor) {
            temCursor = true; cursorPos = { x: img.w * 0.78, y: img.h * 0.9 };
            tl.push(`gsap.set("#${cid}-cursor", {x:${n2(cursorPos.x)}, y:${n2(cursorPos.y)}, scale:${n2(1 / p0.s)}, opacity:0, transformOrigin:"0 0"});`);
            tl.push(`tl.to("#${cid}-cursor", {opacity:1, duration:0.3}, ${n2(tp + T.mover * 0.4)});`);
          }
          // o cursor compensa o zoom para ter sempre o mesmo tamanho no palco
          tl.push(`tl.to("#${cid}-cursor", {x:${n2(cx)}, y:${n2(cy)}, scale:${n2(1 / ps.s)}, duration:${T.cursor}, ease:"power2.inOut"}, ${n2(tp + T.mover * 0.5)});`);
          tl.push(`tl.fromTo("#${cid}-cursor .onda", {scale:0.2, opacity:0.9}, {scale:1.8, opacity:0, duration:0.55, ease:"power2.out"}, ${n2(tp + T.mover * 0.5 + T.cursor + 0.1)});`);
          cursorPos = { x: cx, y: cy };
        }
      } else if (temCursor) {
        tl.push(`tl.to("#${cid}-cursor", {scale:${n2(1 / ps.s)}, duration:${T.mover}, ease:"power2.inOut"}, ${n2(tp)});`);
      }

      // balão do passo (no palco, não dentro da câmara)
      // Cada balão na sua pista: o lint acha uma pista com oito clips densa de
      // mais para se ler no Studio, e tem razão — um passo por pista lê-se de alto a baixo.
      const bid = `${id}-p${nPasso}`;
      clips.push(`
  <aside id="${bid}" class="clip balao ${lado}" data-start="${n2(tp)}" data-duration="${n2(d)}" data-track-index="${3 + nPasso}">
    <div class="balao-in">
      <div class="passo-n">Passo ${nPasso}</div>
      <div class="passo-t">${esc(p.titulo ?? '')}</div>
      <div class="passo-x">${esc(p.texto ?? '')}</div>
    </div>
  </aside>`);
      tl.push(`tl.fromTo("#${bid} .balao-in", {opacity:0, y:${lado === 'cima' ? -22 : 22}}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, ${n2(tp + 0.35)});`);
      tl.push(...sair(`#${bid} .balao-in`, tp + d - 0.3, 0.3));
      tp += d;
    });

    clips.push(`
  <section id="${cid}" class="clip cena" data-start="${inicio}" data-duration="${n2(dur + T.fundir)}" data-track-index="2">
    <div class="cena-in">
      <img class="selo" src="${LOGO}" alt="" width="64" height="64">
      <div class="janela">
        <div class="barra"><span class="pt"></span><span class="pt"></span><span class="pt"></span><span class="url" data-layout-allow-overlap>${esc(MARCA.dominio)}${esc(ecra.url ?? MARCA.caminho_base)}</span><span class="rotulo" data-layout-allow-overlap>${esc(ecra.titulo)}</span></div>
        <div class="viewport">
          <div class="camera" data-layout-allow-overflow>
            <img src="assets/capturas/${ficheiro}" width="${img.w}" height="${img.h}" alt="">
            ${tapas.join('\n            ')}
            ${destaques.join('\n            ')}
            ${temCursor ? cursorHtml : ''}
          </div>
        </div>
      </div>
    </div>
  </section>`);
    // As cenas FUNDEM-SE uma na outra (0,6 s em que as duas janelas estão visíveis). O
    // endereço e o rótulo da barra ficam sobrepostos nesse instante — de propósito, e
    // quase sempre são o mesmo texto no mesmo sítio; daí o data-layout-allow-overlap.
    tl.push(...sair(`#${cid} .cena-in`, inicio + dur, T.fundir));
    t = inicio + dur;
  });

  // ---- resumo ----
  const rinicio = n2(t);
  const vResumo = vozDe('resumo');
  const dResumo = vResumo ? Math.max(T.resumo, n2(0.8 + vResumo.dur + PAUSA_VOZ + 0.6)) : duracaoLeitura((g.resumo ?? []).join(' '), T.resumo);
  if (vResumo) audios.push(`  <audio id="${id}-voz-resumo" src="${vResumo.ficheiro}" data-start="${n2(rinicio + 0.8)}" data-duration="${n2(vResumo.dur)}" data-track-index="30" data-volume="1"></audio>`);
  narracao.push({ passo: 'resumo', inicio: rinicio, dur: dResumo, titulo: 'O que viste', texto: (g.resumo ?? []).join('. ') });
  const linhas = (g.resumo ?? []).map((l, i) => `<li id="${id}-r${i + 1}">${esc(l)}</li>`).join('\n        ');
  clips.push(`
  <section id="${id}-resumo" class="clip resumo" data-start="${rinicio}" data-duration="${n2(dResumo)}" data-track-index="1">
    <div class="resumo-in">
      ${marcaHtml(72)}
      <div class="kicker">O que viste</div>
      <h2 class="titulo">${esc(g.titulo)}</h2>
      <ul class="linhas">
        ${linhas}
      </ul>
      <div class="rodape"><span>${contactoHtml()}</span><span>${esc(MARCA.dominio)}</span></div>
    </div>
  </section>`);
  tl.push(`tl.fromTo("#${id}-resumo .resumo-in", {opacity:0}, {opacity:1, duration:${T.fundir}, ease:"power2.out"}, ${rinicio});`);
  tl.push(`tl.fromTo("#${id}-resumo .titulo", {opacity:0, y:24}, {opacity:1, y:0, duration:0.6, ease:"power3.out"}, ${n2(rinicio + 0.3)});`);
  (g.resumo ?? []).forEach((_, i) => {
    tl.push(`tl.fromTo("#${id}-r${i + 1}", {opacity:0, x:-26}, {opacity:1, x:0, duration:0.5, ease:"power3.out"}, ${n2(rinicio + 0.8 + i * 0.35)});`);
  });
  tl.push(`tl.fromTo("#${id}-resumo .rodape", {opacity:0}, {opacity:1, duration:0.5}, ${n2(rinicio + 1.8)});`);
  const total = n2(rinicio + dResumo);

  // O guião falado: o mesmo texto dos balões, com o instante e a duração de cada
  // passo. Serve para gravar a voz (lê-se com o cronómetro) ou para a sintetizar.
  narracao.unshift({ passo: 'capa', inicio: 0, dur: dCapa, titulo: g.rotulo ?? `Tutorial ${num}`, texto: `${g.titulo}. ${g.subtitulo ?? ''}` });
  writeFileSync(join(PASTA, 'narracao.json'), JSON.stringify({ slug, titulo: g.titulo, total, passos: narracao }, null, 2) + '\n');
  writeFileSync(join(PASTA, 'narracao.txt'),
    `${g.titulo} — guião de narração (${total}s)\n\n` +
    narracao.map(n => `[${String(Math.floor(n.inicio / 60)).padStart(2, '0')}:${String(Math.floor(n.inicio % 60)).padStart(2, '0')} · ${n.dur}s] ${n.titulo}\n${n.texto}\n`).join('\n'));

  // barra de progresso ao fundo: um tween só, do princípio ao fim
  tl.push(`tl.fromTo("#${id}-progresso", {scaleX:0}, {scaleX:1, duration:${total}, ease:"none"}, 0);`);

  const html = `<!doctype html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920, height=1080">
<title>${esc(MARCA.nome)} — Tutorial ${num}: ${esc(g.titulo)}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
${estilo()}
${css.join('\n')}
</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${total}" data-width="${PALCO.w}" data-height="${PALCO.h}" data-fps="30">
  <div class="fundo"><div class="brilho a" data-layout-allow-overflow></div><div class="brilho b" data-layout-allow-overflow></div><div class="grelha"></div></div>
${clips.join('\n')}
${audios.join('\n')}
  <div class="progresso-pista"><div id="${id}-progresso" class="progresso"></div></div>
</div>
<script>
// Gerado por motor/gerar.mjs a partir de guioes/${slug}.json — não editar à mão.
const tl = gsap.timeline({ paused: true });
${tl.join('\n')}
window.__timelines["${id}"] = tl;
</script>
</body>
</html>
`;
  writeFileSync(join(PASTA, 'index.html'), html);
  return { slug, total, passos: nPasso, cenas: g.cenas.length };
}

// --- o estilo partilhado --------------------------------------------------
function estilo() {
  return `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${PALCO.w}px;height:${PALCO.h}px;overflow:hidden;background:${C.fundo}}
body{font-family:"Montserrat",sans-serif;color:${C.texto};-webkit-font-smoothing:antialiased}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.fundo{position:absolute;inset:0;background:${C.fundo}}
.brilho{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
.brilho.a{width:1100px;height:520px;left:-180px;top:-260px;background:rgba(59,130,246,.35)}
.brilho.b{width:900px;height:460px;right:-200px;top:-160px;background:rgba(139,92,246,.32)}
.grelha{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:64px 64px}

/* capa e resumo */
.capa-in,.resumo-in{position:absolute;inset:0;padding:150px 180px;display:flex;flex-direction:column;justify-content:center}
.marca{display:flex;align-items:center;gap:18px;margin-bottom:54px}
.marca .logo{display:block;width:112px;height:112px;object-fit:contain;filter:drop-shadow(0 6px 18px rgba(${rgb(C.acento)},.25))}
.resumo .marca{margin-bottom:34px}
.resumo .marca .logo{width:72px;height:72px}
.marca .nome{font-weight:900;font-size:34px;letter-spacing:-.02em}
.selo{position:absolute;right:${PALCO.w - JANELA.x - JANELA.w}px;top:14px;width:64px;height:64px;object-fit:contain;opacity:.95}
.marca .sub{font-family:"IBM Plex Mono",monospace;font-size:15px;letter-spacing:.18em;text-transform:uppercase;color:${C.texto2};margin-left:6px}
.kicker{font-family:"IBM Plex Mono",monospace;font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:${C.kicker};margin-bottom:22px}
.capa .titulo{font-weight:900;font-size:96px;line-height:1.02;letter-spacing:-.03em;max-width:1400px;text-wrap:balance}
.capa .subtitulo{margin-top:30px;font-size:36px;font-weight:400;color:#b7c3d8;max-width:1200px;line-height:1.35}
.resumo .titulo{font-weight:900;font-size:66px;line-height:1.05;letter-spacing:-.03em;max-width:1400px;margin-bottom:46px}
.resumo .linhas{list-style:none;display:flex;flex-direction:column;gap:22px;max-width:1300px}
.resumo .linhas li{font-size:34px;line-height:1.35;color:#dfe7f5;padding-left:54px;position:relative}
.resumo .linhas li::before{content:"";position:absolute;left:0;top:16px;width:28px;height:6px;border-radius:3px;background:linear-gradient(90deg,${C.grad1},${C.grad2})}
.resumo .rodape{position:absolute;left:180px;right:180px;bottom:120px;display:flex;justify-content:space-between;font-family:"IBM Plex Mono",monospace;font-size:22px;color:${C.texto2}}
.resumo .rodape b{color:${C.texto};font-weight:700}

/* a janela de browser com o print lá dentro */
.cena-in{position:absolute;inset:0}
.janela{position:absolute;left:${JANELA.x}px;top:${JANELA.y}px;width:${JANELA.w}px;height:${JANELA.h}px;border-radius:18px;overflow:hidden;background:${C.janela};border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 120px rgba(0,0,0,.55)}
.barra{height:${BARRA}px;display:flex;align-items:center;gap:8px;padding:0 18px;background:${C.barra};border-bottom:1px solid rgba(255,255,255,.1)}
.barra .pt{width:12px;height:12px;border-radius:50%;background:#2a3650}
.barra .pt:nth-child(1){background:#ef5f5f}.barra .pt:nth-child(2){background:#f0b84b}.barra .pt:nth-child(3){background:#45c26b}
.barra .url{margin-left:18px;font-family:"IBM Plex Mono",monospace;font-size:15px;color:${C.texto2};background:${C.fundo};border-radius:8px;padding:5px 14px}
.barra .rotulo{margin-left:auto;font-family:"IBM Plex Mono",monospace;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#a3b1c9}
.viewport{position:absolute;left:0;top:${BARRA}px;width:${VIEW.w}px;height:${VIEW.h}px;overflow:hidden}
.camera{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}
/* ordem de pintura: capa/resumo por baixo, a janela no meio, os balões por cima de tudo */
.capa,.resumo{z-index:1}.cena{z-index:2}.balao{z-index:5}.progresso-pista{z-index:6}
.camera img{display:block}
.tapa{position:absolute;background:${C.janela};border:1px dashed rgba(255,255,255,.25);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:"IBM Plex Mono",monospace;letter-spacing:.12em;color:${C.texto2}}
.destaque{position:absolute;border:4px solid ${C.acento};border-radius:14px;box-shadow:0 0 0 6px rgba(${rgb(C.acento)},.18),0 0 40px rgba(${rgb(C.acento)},.35);opacity:0}
.cursor{position:absolute;left:0;top:0;width:28px;height:28px;opacity:0;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))}
.cursor svg{display:block}
.cursor .onda{position:absolute;left:-14px;top:-14px;width:40px;height:40px;border-radius:50%;border:3px solid ${C.acento};opacity:0}

/* o balão de cada passo */
.balao{pointer-events:none}
/* Tamanhos para telemóvel: estes vídeos chegam por WhatsApp e vêem-se num ecrã
   de 6 polegadas — corpo a 30px é o mínimo que se lê sem aproximar. */
.balao-in{position:absolute;left:${JANELA.x + 36}px;width:820px;background:rgba(10,17,32,.93);border:1px solid rgba(255,255,255,.14);border-left:7px solid ${C.acento};border-radius:18px;padding:28px 36px 32px;backdrop-filter:blur(10px);box-shadow:0 20px 60px rgba(0,0,0,.5)}
.balao.baixo .balao-in{bottom:${PALCO.h - JANELA.y - JANELA.h + 36}px}
.balao.cima .balao-in{top:${JANELA.y + BARRA + 36}px}
.passo-n{font-family:"IBM Plex Mono",monospace;font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:${C.acento};margin-bottom:10px}
.passo-t{font-weight:900;font-size:40px;letter-spacing:-.02em;line-height:1.12;margin-bottom:12px}
.passo-x{font-size:30px;line-height:1.38;color:${C.texto3}}

/* progresso */
.progresso-pista{position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(255,255,255,.08)}
.progresso{width:100%;height:100%;transform-origin:0 50%;background:linear-gradient(90deg,${C.grad1},${C.grad2},${C.acento})}
`;
}

// --- principal --------------------------------------------------------------
const pedidos = process.argv.slice(2);
const slugs = pedidos.length ? pedidos
  : readdirSync(GUIOES).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')).sort();
let maus = 0;
for (const s of slugs) {
  try {
    const r = gerar(s);
    console.log(`✓ filmes/${s}/index.html  ${r.cenas} cena(s) · ${r.passos} passo(s) · ${r.total}s`);
  } catch (e) {
    maus++; console.log(`✗ ${s}: ${e.message}`);
  }
}
if (maus) process.exitCode = 1;
