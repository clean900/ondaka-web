#!/usr/bin/env node
// ===========================================================================
// ADSA — a página que lista os tutoriais.
//
// Escreve filmes/tutoriais.html: um cartão por vídeo renderizado (título, número,
// duração, o que se aprende) com o leitor lá dentro. É a página que se manda ao
// cliente e que o portal pode abrir numa secção «Tutoriais». Os MP4 ficam ao lado
// (mesma pasta no servidor: /data/media/tutoriais/), por isso os links são relativos.
//
// Uso:  node motor/indice.mjs            → filmes/tutoriais.html
// ===========================================================================
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const FILMES = join(RAIZ, 'filmes');
const GUIOES = join(RAIZ, 'guioes');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const videos = readdirSync(GUIOES).filter(f => f.endsWith('.json')).map(f => {
  const slug = f.replace(/\.json$/, '');
  const g = JSON.parse(readFileSync(join(GUIOES, f), 'utf8'));
  const mp4 = join(FILMES, slug, 'renders', `${slug}.mp4`);
  const nar = join(FILMES, slug, 'narracao.json');
  const total = existsSync(nar) ? JSON.parse(readFileSync(nar, 'utf8')).total : null;
  return { slug, numero: g.numero ?? 99, rotulo: g.rotulo ?? null, titulo: g.titulo, subtitulo: g.subtitulo ?? '', resumo: g.resumo ?? [],
           pronto: existsSync(mp4), total };
}).sort((a, b) => a.numero - b.numero);

const cartoes = videos.map(v => `
    <article class="cartao${v.pronto ? '' : ' breve'}" id="${esc(v.slug)}">
      <div class="num">${esc(v.rotulo ?? `Tutorial ${String(v.numero).padStart(2, '0')}`)}${v.total ? ` · ${mmss(v.total)}` : ''}</div>
      <h2>${esc(v.titulo)}</h2>
      <p class="sub">${esc(v.subtitulo)}</p>
      ${v.pronto
        ? `<video controls preload="metadata" playsinline poster="${esc(v.slug)}.jpg" src="${esc(v.slug)}.mp4"></video>
      <a class="desc" href="${esc(v.slug)}.mp4" download>⭳ Descarregar</a>`
        : `<div class="breve-aviso">Em breve</div>`}
      <ul>${v.resumo.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
    </article>`).join('\n');

const html = `<!doctype html><html lang="pt"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tutoriais — ADSA</title>
<meta name="description" content="Como usar o portal ADSA, função a função: vídeos curtos, narrados, com prints reais da consola.">
<style>
:root{--bg:#0a1120;--panel:#111c32;--ink:#e8eef9;--muted:#93a4c0;--line:rgba(255,255,255,.1);--g1:#3b82f6;--g2:#8b5cf6;--teal:#2dd4bf}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif}
.topo{padding:32px 24px 8px;display:flex;align-items:center;gap:16px}
.topo img{width:64px;height:64px}
.topo h1{margin:0;font-size:26px}.topo p{margin:4px 0 0;color:var(--muted)}
/* O ECRÃ TODO: sem coluna centrada estreita (regra do Bráulio, repetida mais do que uma vez).
   Só a margem de 24px; em ecrãs largos entram 4–5 cartões por linha. */
.grelha{padding:16px 24px 60px;display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:20px}
.cartao{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px}
/* quem chega do portal por «▶ Tutorial» aterra no cartão certo, realçado */
.cartao{scroll-margin-top:16px}.cartao:target{border-color:var(--teal);box-shadow:0 0 0 3px rgba(45,212,191,.25)}
.topo .consola{margin-left:auto;color:#a5b4fc;text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:9px 14px;font-size:14px;white-space:nowrap}
.cartao .num{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}
.cartao h2{margin:6px 0 4px;font-size:20px;line-height:1.2}.cartao .sub{margin:0 0 12px;color:var(--muted);font-size:14px}
.cartao video{width:100%;aspect-ratio:16/9;border-radius:10px;background:#000;display:block}
.cartao .desc{display:inline-block;margin:10px 0 4px;color:#a5b4fc;text-decoration:none;font-size:14px}
.cartao ul{margin:8px 0 0;padding-left:18px;color:var(--muted);font-size:13.5px}.cartao li{margin:3px 0}
.cartao.breve{opacity:.55}.breve-aviso{border:1px dashed var(--line);border-radius:10px;padding:40px;text-align:center;color:var(--muted)}
.rodape{padding:0 24px 40px;color:var(--muted);font-size:13px}
</style></head><body>
<div class="topo"><img src="adsa-logo.png" alt=""><div><h1>Tutoriais do ADSA</h1><p>Como usar o portal, função a função. Vídeos curtos, narrados, com a consola a sério.</p></div><a class="consola" href="/entrar">Entrar na consola →</a></div>
<div class="grelha">${cartoes}
</div>
<div class="rodape">Dúvidas? WhatsApp +244 929 167 474 · adsa.academiadigital.ao</div>
</body></html>
`;
writeFileSync(join(FILMES, 'tutoriais.html'), html);
console.log(`✓ filmes/tutoriais.html — ${videos.filter(v => v.pronto).length}/${videos.length} vídeos prontos`);
