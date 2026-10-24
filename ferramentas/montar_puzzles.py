#!/usr/bin/env python3
"""Junta os puzzles gerados (saida-puzzles/*.jsonl), remove repetidos, estima o
rating de cada um e grava dados/puzzles.json no formato compacto que o app lê:

    [id, fen, "lances uci", rating, "temas separados por espaço"]

O primeiro lance da lista é o erro do adversário; a solução começa no segundo.

Dificuldade: combina o tamanho da solução, o tipo do primeiro lance (silencioso,
xeque ou captura), sacrifícios, o número de opções e a profundidade que o Stockfish
precisou para achar cada lance. A pontuação é convertida em rating pela posição
relativa (percentil) numa curva normal.

Uso: python3 montar_puzzles.py
"""

import glob
import hashlib
import json
import os
import random
from statistics import NormalDist

import chess

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "..", "dados", "puzzles.json")
MEDIA, DESVIO = 1400, 400
MINIMO, MAXIMO = 500, 2600


def pontuar(p, board):
    lances = p["lances"].split()
    temas = set(p["temas"])
    jogadas = (len(lances) - 1 + 1) // 2  # lances de quem resolve
    primeiro = chess.Move.from_uci(lances[1])
    s = 1.8 * (jogadas - 1)
    if board.is_capture(primeiro):
        s += 0.0
    elif board.gives_check(primeiro):
        s += 1.0
    else:
        s += 2.2
    if "sacrificio" in temas:
        s += 1.5
    if "mateEm1" in temas:
        s -= 1.5
    if "pecaPendurada" in temas:
        s -= 1.0
    if temas & {"ataqueDescoberto", "xequeDuplo", "espeto", "cravada"}:
        s += 0.5
    d = p["dificuldade"]
    s += 0.6 * d[0] + 0.3 * sum(d[1:])
    s += min(2.0, board.legal_moves.count() / 20)
    return s


def main():
    vistos = set()
    puzzles = []
    for caminho in sorted(glob.glob(os.path.join(AQUI, "saida-puzzles", "*.jsonl"))):
        with open(caminho, encoding="utf-8") as f:
            for linha in f:
                p = json.loads(linha)
                chave = " ".join(p["fen"].split()[:4])
                if chave in vistos:
                    continue
                board = chess.Board(p["fen"])
                try:
                    for uci in p["lances"].split():
                        lance = chess.Move.from_uci(uci)
                        if lance not in board.legal_moves:
                            raise ValueError(uci)
                        board.push(lance)
                except ValueError:
                    continue
                jogadas = len(p["lances"].split()) // 2
                if jogadas > (6 if "mate" in p["temas"] else 5):
                    continue  # longo demais para um puzzle agradável
                vistos.add(chave)
                apos_erro = chess.Board(p["fen"])
                apos_erro.push_uci(p["lances"].split()[0])
                p["pontos"] = pontuar(p, apos_erro) + random.Random(chave).uniform(-0.15, 0.15)
                puzzles.append(p)

    puzzles.sort(key=lambda p: p["pontos"])
    normal = NormalDist(MEDIA, DESVIO)
    n = len(puzzles)
    saida = []
    for i, p in enumerate(puzzles):
        rating = round(normal.inv_cdf((i + 0.5) / n))
        rating = max(MINIMO, min(MAXIMO, rating))
        ident = hashlib.sha1((p["fen"] + p["lances"]).encode()).hexdigest()[:7]
        temas = [t for t in p["temas"]]
        saida.append([ident, p["fen"], p["lances"], rating, " ".join(temas)])
    saida.sort(key=lambda x: x[3])
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in saida) + "\n]\n")
    print("%d puzzles gravados em %s" % (len(saida), os.path.relpath(SAIDA)))
    faixas = {}
    for x in saida:
        faixas[x[3] // 200 * 200] = faixas.get(x[3] // 200 * 200, 0) + 1
    print("por faixa de rating:", dict(sorted(faixas.items())))


if __name__ == "__main__":
    main()
