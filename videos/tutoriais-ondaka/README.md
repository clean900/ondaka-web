# Tutoriais em vídeo do ONDAKA

Um vídeo curto por módulo da consola do gestor, feito de **prints reais**, com
câmara, realces, cursor e narração em português de Portugal. É o mesmo motor dos
tutoriais do ADSA (`~/academiadigital/videos/tutoriais-adsa`) e do Welwitschia —
o que muda de produto para produto é o `marca.json`.

## Do print ao MP4

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # o HyperFrames exige Node 22
npm install                                         # uma vez
python3 -m venv .venv-voz && .venv-voz/bin/pip install edge-tts   # uma vez

node capturar.mjs            # 1. prints + mapa dos elementos de cada ecrã
bash motor/fazer.sh          # 2. todos os vídeos: gerar → narrar → check → render
bash motor/fazer.sh avisos   #    …ou só alguns
```

**Falta a palavra-passe.** O `~/.config/ondaka-demo.env` tem a base e o email da
conta de homologação, mas `ONDAKA_DEMO_PW` está vazio. Sem ela o capturador pára
logo no primeiro passo e não escreve nada.

## A conta

Empresa **#10 ECG.LDA**, condomínio **#9 Nova York**, dados fictícios.
**Nunca** o condomínio piloto **#1 Torres Atlântico**, nem a conta de um cliente:
um tutorial é material público e a gestão de um condomínio real não é.

## As moradas não se inventam

Saem do `php artisan route:list`, não de palpite. Uma morada que não existe não dá
erro visível: devolve uma página vazia, e o print sai em branco sem ninguém dar
por isso. Daí a guarda no `capturar.mjs` — um ecrã com menos de doze elementos no
mapa é recusado e os ficheiros apagados.

## O que é fonte e o que se refaz

| Fica em git | Refaz-se (ignorado) |
|---|---|
| `ecrans.json` — os ecrãs a capturar | `capturas/` — prints + mapas |
| `guioes/<slug>.json` — o guião de cada vídeo | `filmes/<slug>/` — HTML, voz, MP4 |
| `marca.json` + `marca/` — a marca dos vídeos | |
| `motor/`, `capturar.mjs` | |

## Regras que não se quebram

- **O glossário manda na narração:** Taxas de Condomínio (nunca quotas), Pedidos
  (nunca tickets), Imóvel (nunca fracção), Quota proporcional (nunca permilagem),
  Acréscimo e Crédito (nunca pro-rata). O SMS é «Serviço SMS ONDAKA» — a
  TelcoSMS não aparece em lado nenhum.
- **Nem nomes nem contactos de pessoas a sério.** O guião tem `tapar` para cobrir
  zonas do print.
- **Só se ensina o que está no ecrã.**
- **Nenhum guião cita contagens que mudam** («aqui estão vinte imóveis»): os dados
  de homologação mudam e o vídeo passa a dizer um número que o ecrã desmente.

## O logótipo

Os vídeos usam `marca/ondaka-simbolo.png` — o ícone quadrado, **sem texto**.
O logótipo com palavras (`public/img/ondaka-logo.png`) está escrito «Gestáo» e
«condominio», sem os acentos certos; enquanto não for refeito não entra em
material que vai a um cliente.
