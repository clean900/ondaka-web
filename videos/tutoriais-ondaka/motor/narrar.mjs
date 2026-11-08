#!/usr/bin/env node
// ===========================================================================
// ADSA — a voz dos tutoriais.
//
// Lê filmes/<slug>/narracao.json (escrito pelo gerar.mjs: um texto por passo) e
// produz um ficheiro de áudio por passo em filmes/<slug>/voz/, mais voz.json com
// a duração real de cada um. O gerar.mjs, quando encontra voz.json, passa a dar
// a cada passo o tempo da voz — o vídeo segue a narração, nunca o contrário.
//
// O MOTOR DE VOZ É UMA FUNÇÃO SÓ (`sintetizar`), para se trocar sem mexer no
// resto: hoje edge-tts (Microsoft, pt-PT, grátis, sem chave); amanhã uma voz
// clonada com sotaque angolano (ElevenLabs) — a chave vai no .env, nunca aqui.
//
//   VOZ_MOTOR=edge   VOZ_NOME=pt-PT-DuarteNeural   VOZ_RITMO=-8%
//   VOZ_MOTOR=elevenlabs  ELEVENLABS_API_KEY=…  VOZ_NOME=<voice_id>
//
// Uso:  node motor/narrar.mjs [slug ...]      (sem argumentos = todos os filmes)
// Precisa de: .venv-voz (python3 -m venv .venv-voz && .venv-voz/bin/pip install edge-tts)
//             ffprobe no PATH (brew install ffmpeg)
// ===========================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const FILMES = join(RAIZ, 'filmes');

// --- ambiente (o .env do projeto, se existir, sem sobrepor o que já está no ambiente)
const envFile = join(RAIZ, '.env');
if (existsSync(envFile)) {
  for (const l of readFileSync(envFile, 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim();
  }
}
const MOTOR = process.env.VOZ_MOTOR ?? 'edge';
const NOME = process.env.VOZ_NOME ?? 'pt-PT-DuarteNeural';
const RITMO = process.env.VOZ_RITMO ?? '-8%';

// --- os motores -------------------------------------------------------------
async function sintetizar(texto, destino) {
  if (MOTOR === 'edge') {
    execFileSync(join(RAIZ, '.venv-voz', 'bin', 'edge-tts'),
      ['--voice', NOME, `--rate=${RITMO}`, '--text', texto, '--write-media', destino], { stdio: 'pipe' });
    return;
  }
  if (MOTOR === 'elevenlabs') {
    const chave = process.env.ELEVENLABS_API_KEY;
    if (!chave) throw new Error('falta ELEVENLABS_API_KEY no .env');
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${NOME}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': chave, 'content-type': 'application/json' },
      body: JSON.stringify({ text: texto, model_id: process.env.VOZ_MODELO ?? 'eleven_multilingual_v2',
                             voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 } }),
    });
    if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 200)}`);
    writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
    return;
  }
  throw new Error(`motor de voz desconhecido: ${MOTOR}`);
}

function duracao(ficheiro) {
  const s = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
                                     '-of', 'default=nw=1:nk=1', ficheiro]).toString().trim();
  return Math.round(parseFloat(s) * 100) / 100;
}

// --- um filme ---------------------------------------------------------------
async function narrar(slug) {
  const pasta = join(FILMES, slug);
  const n = JSON.parse(readFileSync(join(pasta, 'narracao.json'), 'utf8'));
  mkdirSync(join(pasta, 'voz'), { recursive: true });
  const saida = { motor: MOTOR, voz: NOME, ritmo: RITMO, gerado_em: new Date().toISOString(), passos: [] };
  for (const p of n.passos) {
    const nome = `${p.passo}.mp3`;
    const destino = join(pasta, 'voz', nome);
    // Só se sintetiza o que mudou: o texto fica guardado ao lado, e um texto
    // igual com um ficheiro já feito não gasta nem tempo nem créditos.
    const marca = join(pasta, 'voz', `${p.passo}.txt`);
    const textoAnterior = existsSync(marca) ? readFileSync(marca, 'utf8') : null;
    if (!existsSync(destino) || textoAnterior !== p.texto) {
      await sintetizar(p.texto, destino);
      writeFileSync(marca, p.texto);
    }
    saida.passos.push({ passo: p.passo, ficheiro: `voz/${nome}`, dur: duracao(destino) });
  }
  writeFileSync(join(pasta, 'voz.json'), JSON.stringify(saida, null, 2) + '\n');
  const total = saida.passos.reduce((a, p) => a + p.dur, 0);
  return { n: saida.passos.length, total: Math.round(total) };
}

const pedidos = process.argv.slice(2);
const slugs = pedidos.length ? pedidos
  : readdirSync(FILMES).filter(s => existsSync(join(FILMES, s, 'narracao.json'))).sort();
let maus = 0;
for (const s of slugs) {
  try {
    const r = await narrar(s);
    console.log(`✓ ${s.padEnd(24)} ${r.n} clips de voz · ${r.total}s falados`);
  } catch (e) {
    maus++; console.log(`✗ ${s.padEnd(24)} ${e.message}`);
  }
}
if (maus) process.exitCode = 1;
