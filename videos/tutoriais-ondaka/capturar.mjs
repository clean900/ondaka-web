#!/usr/bin/env node
// ===========================================================================
// ONDAKA — captura os ecrãs da consola do gestor para os tutoriais em vídeo.
//
// PORQUÊ UM SCRIPT E NÃO PRINTS À MÃO: a consola muda todas as semanas. Prints
// tirados à mão envelhecem em silêncio — o vídeo continua a mostrar um botão
// que já não existe, e quem o segue conclui que o produto está avariado. Isto
// volta a correr em dois minutos e devolve o parque de prints inteiro.
//
// AS CONTAS SÃO DE DEMONSTRAÇÃO. NUNCA o condomínio piloto #1 Torres
// Atlântico nem a conta de um cliente — um tutorial é material público e a
// gestão de um condomínio real não é. Cada ecrã diz em `conta` qual usa
// (ecrans.json); credenciais em ~/.config/ondaka-demo.env:
//
//   gestor    empresa #10 ECG.LDA, condomínio #9 Nova York (homologação)
//             ONDAKA_DEMO_EMAIL / ONDAKA_DEMO_PW
//   afiliado  conta do programa de afiliados criada por
//             `php artisan afiliado:demonstracao` — código DEMO-ONDAKA
//             ONDAKA_AF_EMAIL / ONDAKA_AF_PW
//   publico   sem sessão nenhuma (páginas abertas, como a /afiliados)
//
// Cada conta leva uma SESSÃO SEPARADA (contexto próprio do Chrome): entrar
// com a segunda na mesma sessão deitava fora a primeira, e os ecrãs do gestor
// saíam com a sessão do afiliado.
//
// AS MORADAS SAEM DO `php artisan route:list`, nunca de palpite: a consola
// devolve uma página vazia para uma morada que não existe, sem erro nenhum, e
// o print sai em branco sem ninguém dar por isso.
//
// Escreve, por ecrã:
//   capturas/<slug>.png           o que cabe no ecrã
//   capturas/<slug>-inteiro.png   a página toda, mesmo abaixo da dobra
//   capturas/<slug>.mapa.json     onde está cada elemento, em píxeis do print
//   capturas/indice.json          o catálogo que o motor dos vídeos lê
//
// Uso:  node capturar.mjs [slug ...]      (sem argumentos = todos os ecrãs)
// ===========================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DESTINO = join(AQUI, 'capturas');
const LARGURA = 1600, ALTURA = 900, ESCALA = 2;

// As contas que os ecrãs podem pedir em `conta`. `publico` não entra em sítio
// nenhum. A ordem aqui é a ordem por que as sessões são abertas.
const CONTAS = {
  gestor: {
    rotulo: 'empresa #10 ECG.LDA · condomínio #9 Nova York (homologação)',
    email: 'ONDAKA_DEMO_EMAIL', senha: 'ONDAKA_DEMO_PW',
  },
  afiliado: {
    rotulo: 'afiliado de demonstração DEMO-ONDAKA (php artisan afiliado:demonstracao)',
    email: 'ONDAKA_AF_EMAIL', senha: 'ONDAKA_AF_PW',
  },
  publico: { rotulo: 'sem sessão (páginas abertas)', email: null, senha: null },
};
const CONTA_PADRAO = 'gestor';

const dorme = (ms) => new Promise(r => setTimeout(r, ms));

function ambiente(contas = [CONTA_PADRAO]) {
  const f = join(homedir(), '.config', 'ondaka-demo.env');
  const env = { ...process.env };
  if (existsSync(f)) {
    for (const linha of readFileSync(f, 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
      if (m) env[m[1]] ??= m[2].trim();
    }
  }
  // SÓ as credenciais das contas que esta corrida precisa: exigir as do
  // afiliado para capturar o painel do gestor travava o trabalho de hoje por
  // causa de uma conta que ainda não existe.
  const exigidas = ['ONDAKA_BASE'];
  for (const c of contas) {
    const d = CONTAS[c];
    if (!d) { console.error(`Conta desconhecida em ecrans.json: ${c}`); process.exit(1); }
    if (d.email) exigidas.push(d.email, d.senha);
  }
  for (const k of [...new Set(exigidas)]) {
    if (!env[k]) { console.error(`Falta ${k} em ~/.config/ondaka-demo.env`); process.exit(1); }
  }
  return env;
}

// O Chrome que o HyperFrames já descarregou: não se instala um segundo.
function chrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const raiz = join(homedir(), '.cache', 'puppeteer', 'chrome');
  for (const v of existsSync(raiz) ? readdirSync(raiz).sort().reverse() : []) {
    const p = join(raiz, v, 'chrome-mac-arm64', 'Google Chrome for Testing.app',
                   'Contents', 'MacOS', 'Google Chrome for Testing');
    if (existsSync(p)) return p;
  }
  const sistema = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(sistema)) return sistema;
  console.error('Não encontrei nenhum Chrome. Define CHROME_BIN.');
  process.exit(1);
}

// O MAPA DOS ELEMENTOS é o que permite ao guião dizer «foca o cartão
// "Facturado"» em vez de coordenadas, que mudam a cada redesenho. Corre dentro
// da página; as coordenadas saem em píxeis do print (daí a escala).
async function mapear(page) {
  return page.evaluate((escala) => {
    const SEL = 'h1, h2, h3, h4, button, a[href], table, thead, tbody tr, '
              + '[class*="card"], [class*="Card"], [role="table"], [role="row"], '
              + 'input, select, textarea, label, nav, aside, form, '
              + 'svg[class*="recharts"], [class*="recharts-wrapper"], [data-testid]';
    const BLOCO = '[class*="card"], [class*="Card"], section, form, table, [role="region"]';
    const vis = (el) => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
    };
    const r2 = (r) => ({ x: Math.round(r.left * escala), y: Math.round(r.top * escala),
                         w: Math.round(r.width * escala), h: Math.round(r.height * escala) });
    const saida = [];
    for (const el of document.querySelectorAll(SEL)) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const b = el.closest(BLOCO);
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      saida.push({
        sel: el.id ? '#' + el.id : el.tagName.toLowerCase() + (cls ? '.' + cls : ''),
        tag: el.tagName.toLowerCase(),
        texto: (el.innerText || el.value || el.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        ...r2(r),
        bloco: b && b !== el ? r2(b.getBoundingClientRect()) : null,
      });
      if (saida.length >= 600) break;
    }
    return saida;
  }, ESCALA);
}

// O GUIA DE BOAS-VINDAS (driver.js) abre por cima de tudo e escurece o resto
// do ecrã — os doze primeiros prints saíram todos assim. Fecha-se a cada
// página, e não só depois de entrar: ele volta a abrir em ecrãs que ainda não
// foram vistos, e um «PASSO 1 DE 34» num tutorial comercial é o contrário do
// que se quer mostrar.
async function fecharGuia(page) {
  for (let i = 0; i < 3; i++) {
    const fechou = await page.evaluate(() => {
      const x = document.querySelector('.driver-popover-close-btn, button.driver-popover-close-btn');
      if (x) { x.click(); return true; }
      return false;
    }).catch(() => false);
    if (!fechou) break;
    await dorme(400);
  }
  // cinto de segurança: a tecla Escape fecha-o também, e apanha variantes
  await page.keyboard.press('Escape').catch(() => {});
  await dorme(250);
  // e limpa o que resta da sobreposição, se o fecho deixou a máscara
  await page.evaluate(() => {
    document.querySelectorAll('.driver-overlay, .driver-popover, svg.driver-overlay')
      .forEach(e => e.remove());
    document.documentElement.classList.remove('driver-active', 'driver-fade');
  }).catch(() => {});
}

// Entrar com uma das contas. Devolve a página já com sessão aberta; `publico`
// devolve a página sem entrar em sítio nenhum.
async function entrar(navegador, base, conta, env) {
  // CONTEXTO PRÓPRIO por conta: as cookies de sessão de uma não pisam as da
  // outra, e a ordem dos ecrãs em ecrans.json deixa de importar.
  const ctx = await navegador.createBrowserContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const d = CONTAS[conta];

  if (!d.email) {
    console.log(`  ${conta}: sem sessão (${d.rotulo})`);
    return { ctx, page };
  }

  console.log(`  a entrar em ${base} como ${conta} …`);
  await page.goto(base + '/login', { waitUntil: 'networkidle2' });
  // O ecrã de entrada é Inertia/React: os campos só existem depois de montar.
  await page.waitForSelector('input[type=email], #email', { timeout: 20000 });
  await page.type('input[type=email], #email', env[d.email], { delay: 12 });
  await page.type('input[type=password], #password', env[d.senha], { delay: 12 });
  await Promise.all([
    page.keyboard.press('Enter'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
  ]);
  await dorme(3000);
  if (/\/login/.test(page.url())) {
    console.error(`  ! a sessão de ${conta} não abriu — continua em /login. Confere as credenciais.`);
    await page.screenshot({ path: join(DESTINO, `_falha-login-${conta}.png`) });
    throw new Error(`login falhou (${conta})`);
  }
  // Uma conta sem email verificado fica presa aqui, e os prints saíam todos
  // do ecrã de verificação em vez do painel.
  if (/\/verify-email/.test(page.url())) {
    throw new Error(`a conta ${conta} está presa na verificação de email (/verify-email)`);
  }
  console.log(`  sessão aberta → ${page.url().replace(base, '')}`);
  await fecharGuia(page);
  await rejeitarCookies(page);
  return { ctx, page };
}

// O banner de cookies tapa o canto do ecrã e intercepta cliques. Escolhe-se
// sempre «rejeitar»: é o que respeita quem vê, e é o que sai nos prints.
async function rejeitarCookies(page) {
  const fechou = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button'))
      .find(x => /^(rejeitar|recusar|reject|decline)/i.test((x.innerText || '').trim()));
    if (b) { b.click(); return 'rejeitar'; }
    return null;
  }).catch(() => null);
  if (fechou) console.log(`  banner de cookies: ${fechou}`);
  await dorme(600);
}

async function principal() {
  const cat = JSON.parse(readFileSync(join(AQUI, 'ecrans.json'), 'utf8'));
  const pedidos = process.argv.slice(2);
  const ecrans = pedidos.length ? cat.ecrans.filter(e => pedidos.includes(e.slug)) : cat.ecrans;
  if (!ecrans.length) { console.error('Nenhum ecrã corresponde.'); process.exit(1); }

  // Agrupar por conta: uma sessão por conta, não uma por ecrã.
  const grupos = new Map();
  for (const e of ecrans) {
    const c = e.conta ?? CONTA_PADRAO;
    if (!grupos.has(c)) grupos.set(c, []);
    grupos.get(c).push(e);
  }

  const env = ambiente([...grupos.keys()]);
  const base = env.ONDAKA_BASE.replace(/\/$/, '');

  mkdirSync(DESTINO, { recursive: true });
  const navegador = await puppeteer.launch({
    executablePath: chrome(),
    headless: 'new',
    defaultViewport: { width: LARGURA, height: ALTURA, deviceScaleFactor: ESCALA },
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb'],
  });

  const registos = [], falhas = [];

  for (const [conta, lista] of grupos) {
    let sessao;
    try {
      sessao = await entrar(navegador, base, conta, env);
    } catch (err) {
      // Uma conta que não abre não arrasta as outras: os ecrãs dela ficam a
      // faltar, os restantes são capturados, e no fim diz-se o que falhou.
      for (const e of lista) falhas.push(`${e.slug}: ${err.message}`);
      console.log(`  ✗ conta ${conta}: ${err.message} — ${lista.length} ecrã(s) por capturar`);
      continue;
    }
    const { ctx, page } = sessao;

    for (const e of lista) {
      try {
        await page.goto(base + e.url, { waitUntil: 'networkidle2', timeout: 30000 });
        if (CONTAS[conta].email && /\/login/.test(page.url())) throw new Error('a sessão caiu');
        if (e.esperar) await page.waitForSelector(e.esperar, { timeout: 15000 });
        // As páginas Inertia montam em React: sem esta pausa apanha-se o
        // esqueleto de carregamento em vez do ecrã com dados.
        await dorme(e.espera_ms || 2000);
        await fecharGuia(page);
        await page.evaluate(() => window.scrollTo(0, 0));

        await page.screenshot({ path: join(DESTINO, `${e.slug}.png`) });
        await page.screenshot({ path: join(DESTINO, `${e.slug}-inteiro.png`), fullPage: true });
        const mapa = await mapear(page);

        // GUARDA CONTRA PÁGINA EM BRANCO. Uma morada que não existe não dá
        // erro: devolve o invólucro do ERP sem conteúdo, e o print sai vazio
        // sem ninguém dar por isso. Um ecrã a sério traz dezenas de elementos.
        if (mapa.length < 12) {
          for (const f of [`${e.slug}.png`, `${e.slug}-inteiro.png`]) {
            try { unlinkSync(join(DESTINO, f)); } catch (x) { }
          }
          throw new Error(`página em branco (${mapa.length} elementos) — morada errada?`);
        }
        writeFileSync(join(DESTINO, `${e.slug}.mapa.json`), JSON.stringify(mapa));
        const alturaTotal = await page.evaluate(() => document.body.scrollHeight);

        registos.push({
          slug: e.slug, titulo: e.nome, grupo: e.grupo ?? null, url: e.url,
          conta,
          ficheiro: `capturas/${e.slug}.png`, inteiro: `capturas/${e.slug}-inteiro.png`,
          largura: LARGURA * ESCALA, altura: ALTURA * ESCALA,
          altura_total: alturaTotal * ESCALA, nota: e.nota ?? null,
        });
        console.log(`  ✓ ${e.slug.padEnd(16)} ${e.nome.padEnd(26)} ${mapa.length} elementos`);
      } catch (err) {
        falhas.push(`${e.slug}: ${err.message}`);
        console.log(`  ✗ ${e.slug.padEnd(16)} ${err.message}`);
      }
    }
    await ctx.close().catch(() => {});
  }

  await navegador.close();

  // O índice é o que o motor dos vídeos lê: sem ele, cada composição teria de
  // adivinhar o tamanho do print para calcular os zooms. Um ecrã que falhou
  // AGORA não apaga o registo bom de ontem — o print velho continua a servir.
  const antigo = existsSync(join(DESTINO, 'indice.json'))
    ? JSON.parse(readFileSync(join(DESTINO, 'indice.json'), 'utf8')) : { ecrans: [] };
  const juntos = new Map((antigo.ecrans ?? []).map(x => [x.slug, x]));
  for (const r of registos) juntos.set(r.slug, r);
  const contasUsadas = Object.fromEntries([...grupos.keys()].map(c => [c, CONTAS[c].rotulo]));
  writeFileSync(join(DESTINO, 'indice.json'),
    JSON.stringify({ capturado_em: new Date().toISOString(), base,
                     contas: { ...(antigo.contas ?? {}), ...contasUsadas },
                     ecrans: [...juntos.values()] }, null, 2) + '\n');

  console.log(`\n  ${registos.length}/${ecrans.length} ecrãs capturados em capturas/`);
  if (falhas.length) console.log('  falhas:\n   - ' + falhas.join('\n   - '));
}

principal().catch(e => { console.error(e); process.exit(1); });
