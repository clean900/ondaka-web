#!/usr/bin/env bash
# ===========================================================================
# Guarda a palavra-passe de uma das contas de demonstração em
# ~/.config/ondaka-demo.env.
#
#   bash videos/tutoriais-ondaka/senha.sh            # conta do gestor (ECG.LDA)
#   bash videos/tutoriais-ondaka/senha.sh afiliado   # conta DEMO-ONDAKA
#
# CORRE NO MAC. Não no servidor — o ficheiro vive no Mac, e no cPanel o
# ~/.config/ondaka-demo.env não existe.
#
# Porquê um script e não um `sed` à mão: o `sed -i ''` do macOS e o do Linux
# levam argumentos diferentes, e colado no terminal errado dá um erro que não
# diz qual é o problema. Isto pergunta, não mostra o que se escreve, e
# SUBSTITUI a linha em vez de acrescentar outra — uma segunda linha com a
# mesma chave não serviria de nada, porque o capturador fica com a primeira.
# ===========================================================================
set -euo pipefail
F="$HOME/.config/ondaka-demo.env"
CONTA="${1:-gestor}"

case "$(uname -s)" in
  Darwin) ;;
  *) echo "Isto corre no Mac. O $F não existe no servidor."; exit 1 ;;
esac

case "$CONTA" in
  gestor)
    CHAVE_EMAIL=ONDAKA_DEMO_EMAIL; CHAVE_PW=ONDAKA_DEMO_PW
    EMAIL_PADRAO=''  # a do gestor já está no ficheiro; não se inventa
    ROTULO='gestor de homologação (empresa #10 ECG.LDA)'
    ;;
  afiliado)
    CHAVE_EMAIL=ONDAKA_AF_EMAIL; CHAVE_PW=ONDAKA_AF_PW
    EMAIL_PADRAO='demo.afiliado@ondaka.ao'   # o que o artisan afiliado:demonstracao cria
    ROTULO='afiliado de demonstração (DEMO-ONDAKA)'
    ;;
  *) echo "Conta desconhecida: $CONTA (use «gestor» ou «afiliado»)"; exit 1 ;;
esac

mkdir -p "$(dirname "$F")"
[ -f "$F" ] || { : > "$F"; chmod 600 "$F"; echo "criei $F"; }

EMAIL="$(grep "^$CHAVE_EMAIL=" "$F" | head -1 | cut -d= -f2- || true)"
if [ -z "$EMAIL" ]; then
  if [ -n "$EMAIL_PADRAO" ]; then
    EMAIL="$EMAIL_PADRAO"
  else
    echo "Falta $CHAVE_EMAIL em $F — acrescente-o primeiro."; exit 1
  fi
fi

echo "Conta: $ROTULO"
printf 'Palavra-passe de %s: ' "$EMAIL"
stty -echo; IFS= read -r SENHA; stty echo; echo

[ -n "$SENHA" ] || { echo "Nada escrito — não mexi no ficheiro."; exit 1; }

# a substituição é feita em python para não depender do sed do sistema, e o
# ficheiro é reescrito com as mesmas permissões restritas
python3 - "$F" "$CHAVE_EMAIL" "$EMAIL" "$CHAVE_PW" "$SENHA" <<'PY'
import io, os, sys
cam = sys.argv[1]
pares = [(sys.argv[2], sys.argv[3]), (sys.argv[4], sys.argv[5])]
linhas = io.open(cam, encoding='utf-8').read().split('\n')
for chave, valor in pares:
    for i, l in enumerate(linhas):
        if l.startswith(chave + '='):
            linhas[i] = chave + '=' + valor
            break
    else:
        linhas.append(chave + '=' + valor)
io.open(cam, 'w', encoding='utf-8').write('\n'.join(linhas))
os.chmod(cam, 0o600)
PY

echo "✓ guardada em $F (só legível por si)"
echo
echo "Agora:"
if [ "$CONTA" = afiliado ]; then
  echo "  cd ~/ondaka-web/videos/tutoriais-ondaka && export PATH=\"/opt/homebrew/opt/node@22/bin:\$PATH\" && node capturar.mjs af-publico af-painel af-clientes af-comissoes af-pagamentos af-dados af-apresentacao"
else
  echo "  cd ~/ondaka-web/videos/tutoriais-ondaka && export PATH=\"/opt/homebrew/opt/node@22/bin:\$PATH\" && node capturar.mjs"
fi
