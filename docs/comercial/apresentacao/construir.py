#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Constrói a apresentação HTML do ONDAKA num único ficheiro autónomo.

    python3 docs/comercial/apresentacao/construir.py [--cliente "Nome"]

Junta estilo.css + corpo.html + motor.js + logica.js. O resultado abre-se
localmente, sem servidor e sem ficheiros ao lado — é o que vai para o cliente.

ARQUIVO DE VERSÕES: cada construção guarda a anterior em versoes/ antes de
escrever por cima, com data e hora no nome. O ficheiro principal é sempre o
mesmo; o arquivo é só história, para se poder abrir a de ontem ao lado da de hoje.
"""
import argparse
import os
import shutil
import time

BASE = os.path.dirname(os.path.abspath(__file__))
VERSOES = os.path.join(BASE, "versoes")
SAIDA = os.path.join(BASE, "apresentacao-ondaka.html")
# fragmento sem <html>/<head>/<body>, para publicar como Artifact (o publicador
# envolve o conteúdo no seu próprio esqueleto, doctype incluído)
SAIDA_ART = os.path.join(BASE, "apresentacao-ondaka.artifact.html")

CABECA = """<meta charset="utf-8">
<title>ONDAKA — Gestão de Condomínios</title>
<meta name="description" content="Apresentação interativa do ONDAKA: a plataforma angolana de gestão de condomínios da KAYANTEC.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
"""

MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
         "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


def ler(nome):
    with open(os.path.join(BASE, nome), encoding="utf-8") as f:
        return f.read()


def arquivar(destino):
    """Guarda a versão anterior antes de a substituir."""
    if not os.path.exists(destino):
        return None
    os.makedirs(VERSOES, exist_ok=True)
    raiz, ext = os.path.splitext(os.path.basename(destino))
    # uma por hora: construir cinco vezes a seguir não enche a pasta
    alvo = os.path.join(VERSOES, "%s-%s%s" % (raiz, time.strftime("%Y-%m-%d-%H"), ext))
    shutil.copy2(destino, alvo)
    return alvo


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente", default="…")
    args = ap.parse_args()

    hoje = time.localtime()
    data = "%d de %s de %d" % (hoje.tm_mday, MESES[hoje.tm_mon - 1], hoje.tm_year)

    corpo = ler("corpo.html")
    corpo = corpo.replace("{{CLIENTE}}", args.cliente).replace("{{DATA}}", data)

    css = ler("estilo.css")
    js = ler("motor.js") + "\n" + ler("logica.js")

    for alvo, inteiro in ((SAIDA, True), (SAIDA_ART, False)):
        velha = arquivar(alvo)
        pecas = []
        if inteiro:
            pecas.append("<!doctype html>\n<html lang=\"pt-PT\">\n<head>\n" + CABECA + "<style>\n")
        else:
            pecas.append("<style>\n")
        pecas.append(css)
        pecas.append("\n</style>\n")
        if inteiro:
            pecas.append("</head>\n<body>\n")
        pecas.append(corpo)
        pecas.append("\n<script>\n")
        pecas.append(js)
        pecas.append("\n</script>\n")
        if inteiro:
            pecas.append("</body>\n</html>\n")
        html = "".join(pecas)
        with open(alvo, "w", encoding="utf-8") as f:
            f.write(html)
        print("  %-42s %6.0f KB%s" % (os.path.basename(alvo), len(html.encode()) / 1024,
                                      ("  (anterior → %s)" % os.path.basename(velha)) if velha else ""))

    print("\n  cliente: %s · data: %s" % (args.cliente, data))


if __name__ == "__main__":
    main()
