#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corrige o subtítulo do logótipo do ONDAKA.

    «Gestáo inteligente / para o seu condominio»
  → «Gestão inteligente / para o seu condomínio»

PORQUÊ ASSIM E NÃO RECOMPOR O TEXTO: a fonte do subtítulo não está neste Mac —
comparei as letras contra todas as fontes instaladas e nenhuma coincide. Compor
as duas linhas noutra fonte parecida mudava todas as letras para corrigir duas,
e isso vê-se. Aqui mexe-se só no que está errado:

  · o ACENTO do «í» de «condomínio» é o acento verdadeiro do «á» de «Gestáo»,
    recortado da própria imagem — mesma fonte, mesmo traço, mesma serrilha.
    Entra reduzido, porque a segunda linha está composta a 88% da primeira
    (medido: o «o» da primeira tem 25 px de largura, o da segunda 22).
  · o TIL do «ã» é a única coisa que se desenha, porque não existe um til em
    lado nenhum do ficheiro. É traçado com o peso do acento que se mediu e
    desenhado a 8× para a serrilha ficar igual à do resto do texto.

Tudo o que fica fora destas duas zonas não é tocado — e o script verifica-o no
fim, pixel a pixel.
"""
import math
import os
import sys
from PIL import Image, ImageDraw

# O ORIGINAL, com os erros. O ficheiro do repositório já está corrigido, por
# isso este script lê-o do git e não do disco: correr outra vez sobre o
# corrigido ia procurar um acento que já lá não está, e os assert apanhavam-no.
#   git show <commit-antes>:public/img/ondaka-logo.png > /tmp/ondaka-logo-antigo.png
ORIG = os.environ.get("LOGO_ORIGINAL", "/tmp/ondaka-logo-antigo.png")

# --- medido na imagem -------------------------------------------------------
ACENTO = (421, 733, 433, 739)        # o acento do «á», inclusive
A_CORPO_X = (413, 434)               # o corpo do «a» por baixo dele (o «o» só começa em 440)
L1_XTOPO, L1_BASE = 743, 768         # x-height da 1.ª linha
L2_XTOPO, L2_BASE = 806, 828         # x-height da 2.ª linha
I_PONTO = (692, 797, 696, 801)       # o ponto do «i» de «condominio»
I_HASTE_X = (692, 695)
FUNDO_Y = 712                        # banda vazia logo acima do subtítulo
SUPER = 8                            # supersampling do til


def medir(im):
    """Confirma na imagem o que o script assume. Se a imagem mudar, pára aqui."""
    px = im.load()
    def lum(x, y):
        r, g, b, a = px[x, y]
        return max(r, g, b)
    def caixa(x0, y0, x1, y1, lim=60):
        xs, ys = [], []
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if lum(x, y) > lim:
                    xs.append(x); ys.append(y)
        return (min(xs), min(ys), max(xs), max(ys)) if xs else None
    assert caixa(412, 728, 440, 742) == ACENTO, "o acento do «á» não está onde era"
    assert caixa(688, 790, 700, 804) == I_PONTO, "o ponto do «i» não está onde era"
    # a banda de fundo tem de estar mesmo vazia
    assert caixa(400, FUNDO_Y - 6, 780, FUNDO_Y + 6) is None, "a banda de fundo não está vazia"


def recorte_fundo(im, x0, y0, x1, y1):
    """Fundo verdadeiro da mesma imagem, da banda vazia por cima do subtítulo.
    Um preto chapado dava uma mancha: o fundo tem grão e um brilho ao centro."""
    larg, alt = x1 - x0 + 1, y1 - y0 + 1
    return im.crop((x0, FUNDO_Y - alt // 2, x0 + larg, FUNDO_Y - alt // 2 + alt))


def til(largura, altura, esp_max, esp_min, amplitude=0.78):
    """Um til traçado: uma onda completa, mais grossa onde o traço corre a
    direito e mais fina nas cristas — que é como a pena o desenha. A amplitude
    fica abaixo de 1 porque um seno cheio sai ondulado de mais: o til de uma
    fonte humanista é mais chato do que a onda que o descreve."""
    L, A = largura * SUPER, altura * SUPER
    img = Image.new("L", (L + 4 * SUPER, A + 4 * SUPER), 0)
    d = ImageDraw.Draw(img)
    mx, my = 2 * SUPER, 2 * SUPER
    amp = (A - esp_max * SUPER) / 2.0 * amplitude
    passos = 400
    for i in range(passos + 1):
        t = i / passos
        x = mx + t * L
        y = my + A / 2.0 - amp * math.sin(2 * math.pi * t)
        # mais grosso nas passagens a direito (t=0, .5, 1), mais fino nas cristas
        w = (esp_min + (esp_max - esp_min) * abs(math.cos(2 * math.pi * t))) * SUPER / 2.0
        d.ellipse((x - w, y - w, x + w, y + w), fill=255)
    return img.resize(((L + 4 * SUPER) // SUPER, (A + 4 * SUPER) // SUPER), Image.LANCZOS)


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else ORIG
    im = Image.open(ORIG).convert("RGBA")
    medir(im)
    escala = (L2_BASE - L2_XTOPO) / float(L1_BASE - L1_XTOPO)   # 2.ª linha é mais pequena

    # ---- 1. guardar o acento verdadeiro, antes de o apagar ----
    ax0, ay0, ax1, ay1 = ACENTO
    acento = im.crop((ax0, ay0, ax1 + 1, ay1 + 1))
    folga_acento = L1_XTOPO - ay1                     # quanto respira acima do «a»

    # as zonas tocadas vão-se registando à medida que se mexe, para a prova do
    # fim não depender de números escritos à mão — que foi como ela falhou
    zonas = []
    def marcar(x, y, larg, alt):
        zonas.append((x, y, x + larg - 1, y + alt - 1))

    # ---- 2. «condominio» → «condomínio» ----
    px0, py0, px1, py1 = I_PONTO
    fundo_i = recorte_fundo(im, px0 - 3, py0 - 3, px1 + 3, py1 + 3)
    im.paste(fundo_i, (px0 - 3, py0 - 3))
    marcar(px0 - 3, py0 - 3, *fundo_i.size)
    na = max(3, int(round((ay1 - ay0 + 1) * escala)))
    nl = max(5, int(round((ax1 - ax0 + 1) * escala)))
    acento_p = acento.resize((nl, na), Image.LANCZOS)
    # o acento do «í» fica onde ficava o do «á», à escala, e um pouco à direita
    # da haste — é aí que esta classe de fontes o põe
    centro_haste = (I_HASTE_X[0] + I_HASTE_X[1]) / 2.0
    desvio = ((ax0 + ax1) / 2.0 - (A_CORPO_X[0] + A_CORPO_X[1]) / 2.0) * escala
    dx = int(round(centro_haste - nl / 2.0 + desvio))
    dy = int(round(L2_XTOPO - folga_acento * escala - na))
    im.paste(acento_p, (dx, dy), acento_p)
    marcar(dx, dy, nl, na)

    # ---- 3. «Gestáo» → «Gestão» ----
    fundo_a = recorte_fundo(im, ax0 - 3, ay0 - 3, ax1 + 3, ay1 + 3)
    im.paste(fundo_a, (ax0 - 3, ay0 - 3))
    marcar(ax0 - 3, ay0 - 3, *fundo_a.size)
    larg_a = A_CORPO_X[1] - A_CORPO_X[0] + 1
    tl, ta = int(round(larg_a * 0.77)), (ay1 - ay0 + 1)
    marca = til(tl, ta, esp_max=4.2, esp_min=2.5)
    cor = Image.new("RGBA", marca.size, (255, 254, 255, 0))
    cor.putalpha(marca)
    tx = int(round((A_CORPO_X[0] + A_CORPO_X[1]) / 2.0 - marca.size[0] / 2.0))
    ty = int(round(L1_XTOPO - folga_acento - marca.size[1] + 1))
    im.alpha_composite(cor, (tx, ty))
    marcar(tx, ty, *marca.size)

    # ---- 4. provar que não se mexeu em mais nada ----
    orig = Image.open(ORIG).convert("RGBA")
    po, pn = orig.load(), im.load()
    difs = 0
    for y in range(orig.size[1]):
        for x in range(orig.size[0]):
            if any(zx0 <= x <= zx1 and zy0 <= y <= zy1 for zx0, zy0, zx1, zy1 in zonas):
                continue
            if po[x, y] != pn[x, y]:
                difs += 1
    assert difs == 0, "mexeu-se em %d pixéis fora das zonas tocadas" % difs

    im.save(destino)
    print("escrito: %s" % destino)
    print("  escala da 2.ª linha: %.3f" % escala)
    print("  acento do «í»: %dx%d em (%d,%d)" % (nl, na, dx, dy))
    print("  til do «ã»:    %dx%d em (%d,%d)" % (marca.size[0], marca.size[1], tx, ty))
    print("  zonas tocadas: %s" % " ".join("%d,%d→%d,%d" % z for z in zonas))
    print("  fora delas: 0 pixéis diferentes")


if __name__ == "__main__":
    main()
