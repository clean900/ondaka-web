#!/usr/bin/env bash
# ===========================================================================
# ONDAKA — fazer um vídeo (ou todos) do guião ao MP4.
#
#   bash motor/fazer.sh                 # todos os guiões
#   bash motor/fazer.sh alertas loja    # só estes
#
# Para cada um: gerar → narrar (só o que mudou) → gerar ao ritmo da voz → check →
# render. O MP4 novo só substitui o antigo se o render terminar mesmo — um render
# que falha a meio deixa o vídeo anterior no lugar, em vez de um ficheiro partido.
#
# TRÊS COISAS QUE CUSTARAM RENDERS E QUE ESTE SCRIPT JÁ TRAZ:
#  - `caffeinate -i`: o Mac adormece a meio de uma série longa e os renders morrem
#    com «Navigation timeout» sem dizer que a causa foi o sono.
#  - PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS: acima de 4 minutos o HyperFrames
#    deixa de enviar os fotogramas directos ao codificador e escreve-os em disco —
#    vários GB. Com o disco cheio dá ENOSPC. Aqui fica sempre em «streaming».
#  - Node 22: o HyperFrames recusa-se a correr com menos.
# ===========================================================================
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
export PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=1800

limpa() { sed 's/\x1b\[[0-9;]*m//g'; }

fazer() {
  local s="$1"
  echo "=== $s ==="
  node motor/gerar.mjs "$s" | tail -1 && node motor/narrar.mjs "$s" | tail -1 && node motor/gerar.mjs "$s" | tail -1 \
    || { echo "$s: FALHOU a gerar/narrar — fica o vídeo anterior"; return 1; }

  local r; r=$(npx hyperframes check "filmes/$s" 2>&1 | limpa)
  echo "check: $(echo "$r" | grep -E 'Check (passed|failed)' | tail -1) · $(echo "$r" | grep -E '[0-9]+ error\(s\)' | head -1) · $(echo "$r" | grep -E 'text checks' | head -1)"
  echo "$r" | grep -E '^\s*✗' | head -4

  mkdir -p "filmes/$s/renders"
  local tmp="filmes/$s/renders/$s.tmp.mp4" log="filmes/$s/renders/render.log"
  rm -f "$tmp"
  npx hyperframes render "filmes/$s" -o "$tmp" > "$log" 2>&1
  if grep -q "Render complete" "$log" && [ -s "$tmp" ]; then
    mv -f "$tmp" "filmes/$s/renders/$s.mp4"
    echo "render: $(limpa < "$log" | grep -E 'MB ·' | head -1 | sed 's/^ *//')"
  else
    rm -f "$tmp"
    echo "render: FALHOU — fica o vídeo anterior"
    limpa < "$log" | grep -i -E 'ENOSPC|timeout|Render failed' | head -3
    return 1
  fi
}

if [ "$#" -gt 0 ]; then lista=("$@"); else lista=(); for g in guioes/*.json; do lista+=("$(basename "$g" .json)"); done; fi

maus=0
corre() { for s in "${lista[@]}"; do fazer "$s" || maus=$((maus+1)); done; }
if command -v caffeinate >/dev/null; then
  # caffeinate não corre funções de shell: fica a vigiar ESTE processo até ele acabar.
  caffeinate -i -w $$ &
fi
corre
echo "=== FIM: ${#lista[@]} vídeo(s), $maus com problemas ==="
[ "$maus" -eq 0 ]
