#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prepara os tutoriais em vídeo para entrarem na apresentação de afiliados.

    python3 docs/comercial/apresentacao/preparar-videos.py

NÃO produz vídeo nenhum: usa os que o `videos/tutoriais-welwitschia` já
produziu, com prints reais da conta de demonstração, câmara, cursor e narração
em pt-PT. Daqui sai apenas o que a apresentação precisa para os mostrar bem:

  · o POSTER de cada vídeo, embutido em base64 — para a moldura mostrar o
    primeiro ecrã mesmo antes de o vídeo carregar, e para a apresentação não
    ficar com seis rectângulos pretos quando é aberta sem internet;
  · as LEGENDAS em WebVTT, montadas a partir da narração e das durações reais
    que o motor de voz mediu (voz.json) — assim o apresentador pode desligar o
    som e o texto continua a acompanhar;
  · a DURAÇÃO real, lida do ficheiro.

O vídeo em si fica onde está: publicado e servido com Accept-Ranges. Um MP4 de
dez megabytes dentro de um HTML que vai por email não é uma apresentação, é um
problema de entrega.

ONDE FICAM OS MP4: ver BASE_PUBLICA, mais abaixo. Enquanto não estiver decidido,
a apresentação mostra o poster embutido de cada tutorial e diz onde o ver — e
não uma moldura preta.
"""
import base64
import json
import os
import subprocess
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(BASE, "..", "..", ".."))
TUT = os.path.join(RAIZ, "videos", "tutoriais-ondaka")
SAIDA = os.path.join(BASE, "videos.json")

# ONDE OS MP4 VÃO VIVER. O ADSA serve os seus do VPS em
# adsa.academiadigital.ao/media/tutoriais/; um tutorial do Welwitschia nesse
# endereço fica mal, por isso leva casa própria. O endereço sslip.io funciona
# sem mexer em DNS — é por onde se começa; tutoriais.welwitschia.ao é o destino,
# e passa a valer mal o registo de DNS aponte ao VPS.
PUBLICO = os.environ.get("TUTORIAIS_BASE",
                         "https://tutoriais.167.86.114.64.sslip.io/ondaka/")

# Os tutoriais que entram na apresentação e onde. A ordem é a da apresentação,
# não a da pasta.
ESCOLHA = [
    ("visao-geral", "O painel do gestor",
     "Quantos condomínios, quantos imóveis e quanto falta cobrar — num ecrã."),
    ("taxas", "Taxas de Condomínio",
     "Geração mensal automática, com o estado de cada taxa à vista."),
    ("pagamentos", "Pagamentos",
     "Do comprovativo que o condómino envia à confirmação do gestor."),
    ("pedidos", "Pedidos",
     "O que o condómino reporta, acompanhado até estar resolvido."),
    ("avisos", "Avisos",
     "Comunicar com o condomínio sem depender de papel na parede."),
    ("loja", "A loja de funcionalidades",
     "A plataforma cresce com o condomínio, não antes dele."),
]


def correr(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duracao(mp4):
    r = correr(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", mp4])
    try:
        return round(float(r.stdout.strip()), 1)
    except ValueError:
        return 0.0


def poster(mp4, segundo=3.0):
    """Um fotograma, reduzido e em JPEG — o poster é decoração, não prova."""
    tmp = os.path.join(BASE, "_poster.jpg")
    r = correr(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(segundo), "-i", mp4,
                "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "6", tmp])
    if r.returncode != 0 or not os.path.exists(tmp):
        return None
    with open(tmp, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode("ascii")
    os.remove(tmp)
    return "data:image/jpeg;base64," + b64


def hhmmss(s):
    h = int(s // 3600); m = int((s % 3600) // 60); seg = s % 60
    return "%02d:%02d:%06.3f" % (h, m, seg)


def legendas(slug):
    """WebVTT a partir de narracao.json, que já traz o início e a duração de
    cada passo medidos pelo motor de voz.

    Sem legendas, desligar o som deixava o espectador sem nada — e é justamente
    com o som desligado que o apresentador fala por cima."""
    fnar = os.path.join(TUT, "filmes", slug, "narracao.json")
    if not os.path.exists(fnar):
        return None
    with open(fnar, encoding="utf-8") as fh:
        nar = json.load(fh)
    linhas = ["WEBVTT", ""]
    for p in nar.get("passos", []):
        txt = (p.get("texto") or "").strip()
        ini = float(p.get("inicio") or 0)
        dur = float(p.get("dur") or 0)
        if not txt or dur <= 0:
            continue
        linhas.append("%s --> %s" % (hhmmss(ini), hhmmss(ini + dur)))
        linhas.append(txt)
        linhas.append("")
    return "\n".join(linhas) if len(linhas) > 2 else None


def main():
    if not os.path.isdir(TUT):
        print("! não encontrei %s" % TUT, file=sys.stderr)
        raise SystemExit(1)
    if correr(["ffmpeg", "-version"]).returncode != 0:
        print("! ffmpeg não disponível — sem posters", file=sys.stderr)

    saida, faltam = [], []
    for slug, titulo, subtitulo in ESCOLHA:
        mp4 = os.path.join(TUT, "filmes", slug, "renders", slug + ".mp4")
        if not os.path.exists(mp4):
            faltam.append(slug)
            continue
        d = duracao(mp4)
        p = poster(mp4)
        v = legendas(slug)
        saida.append({
            "slug": slug, "titulo": titulo, "subtitulo": subtitulo,
            "url": PUBLICO + slug + ".mp4",
            "duracao": d, "poster": p, "vtt": v,
            "tamanho_mb": round(os.path.getsize(mp4) / 1048576, 1),
        })
        print("  %-24s %5.0fs  poster %s  legendas %s" % (
            slug, d, "sim" if p else "não",
            ("%d blocos" % v.count("-->")) if v else "não"))

    if faltam:
        print("  ! sem MP4: %s" % ", ".join(faltam), file=sys.stderr)
    with open(SAIDA, "w", encoding="utf-8") as fh:
        json.dump({"base": PUBLICO, "videos": saida}, fh, ensure_ascii=False, indent=1)
    print("\n  ✓ videos.json — %d tutoriais, %.0f KB" %
          (len(saida), os.path.getsize(SAIDA) / 1024))


if __name__ == "__main__":
    main()
