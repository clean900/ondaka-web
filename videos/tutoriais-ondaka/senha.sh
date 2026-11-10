#!/usr/bin/env bash
# ===========================================================================
# Guarda a palavra-passe da conta de homologação em ~/.config/ondaka-demo.env.
#
# CORRE NO MAC. Não no servidor — o ficheiro vive no Mac, e no cPanel o
# ~/.config/ondaka-demo.env não existe.
#
# Porquê um script e não um `sed` à mão: o `sed -i ''` do macOS e o do Linux
# levam argumentos diferentes, e colado no terminal errado dá um erro que não
# diz qual é o problema. Isto pergunta, não mostra o que se escreve, e
# SUBSTITUI a linha em vez de acrescentar outra — uma segunda linha
# ONDAKA_DEMO_PW não serviria de nada, porque o capturador fica com a primeira.
#
#   bash videos/tutoriais-ondaka/senha.sh
# ===========================================================================
set -euo pipefail
F="$HOME/.config/ondaka-demo.env"

[ -f "$F" ] || { echo "Não existe $F"; exit 1; }
case "$(uname -s)" in
  Darwin) ;;
  *) echo "Isto corre no Mac. O $F não existe no servidor."; exit 1 ;;
esac

printf 'Palavra-passe de %s: ' "$(grep '^ONDAKA_DEMO_EMAIL=' "$F" | cut -d= -f2-)"
stty -echo; IFS= read -r SENHA; stty echo; echo

[ -n "$SENHA" ] || { echo "Nada escrito — não mexi no ficheiro."; exit 1; }

# a substituição é feita em python para não depender do sed do sistema, e o
# ficheiro é reescrito com as mesmas permissões restritas
python3 - "$F" "$SENHA" <<'PY'
import io, os, sys
cam, senha = sys.argv[1], sys.argv[2]
linhas = io.open(cam, encoding='utf-8').read().split('\n')
achou = False
for i, l in enumerate(linhas):
    if l.startswith('ONDAKA_DEMO_PW='):
        linhas[i] = 'ONDAKA_DEMO_PW=' + senha
        achou = True
        break
if not achou:
    linhas.append('ONDAKA_DEMO_PW=' + senha)
io.open(cam, 'w', encoding='utf-8').write('\n'.join(linhas))
os.chmod(cam, 0o600)
PY

echo "✓ guardada em $F (só legível por si)"
echo
echo "Agora:"
echo "  cd ~/ondaka-web/videos/tutoriais-ondaka && export PATH=\"/opt/homebrew/opt/node@22/bin:\$PATH\" && node capturar.mjs"
