#!/usr/bin/env python3
"""Checa as linhas de abertura com o Stockfish.

- Em linhas normais, avisa se algum lance perde muito (provável erro de digitação ou de teoria).
- Em armadilhas, confirma que a posição final é vencedora para quem arma a armadilha.

Uso: node validar_aberturas.mjs --json | python3 validar_aberturas.py --stockfish /caminho/stockfish
"""
import argparse
import json
import sys

import chess
import chess.engine

ap = argparse.ArgumentParser()
ap.add_argument("--stockfish", required=True)
ap.add_argument("--nos", type=int, default=400_000)
args = ap.parse_args()

linhas = json.load(sys.stdin)
motor = chess.engine.SimpleEngine.popen_uci(args.stockfish)
motor.configure({"Threads": 1, "Hash": 64})


def avaliar(fen):
    board = chess.Board(fen)
    if board.is_checkmate():
        return -100_000  # do ponto de vista de quem está na vez (levou mate)
    info = motor.analyse(board, chess.engine.Limit(nodes=args.nos))
    return info["score"].relative.score(mate_score=100_000)


problemas = 0
for l in linhas:
    fens = [chess.STARTING_FEN] + l["fens"]
    notas = [avaliar(f) for f in fens]
    avisos = []
    errou = set()  # depois que um lado erra (?, ??), seus lances forçados não contam
    for i, san in enumerate(l["sans"]):
        lado = i % 2
        if lado in errou:
            continue
        if san.endswith("?") or san.endswith("??"):
            errou.add(lado)
        # perda do ponto de vista de quem jogou o lance i
        antes = notas[i]
        depois = -notas[i + 1]
        perda = antes - depois
        marcado = "?" in san
        if not marcado and perda > 90 and abs(antes) < 50_000:
            avisos.append("%d.%s %s perde %d cp (%d -> %d)" % (i // 2 + 1, "" if i % 2 == 0 else "..", san, perda, antes, depois))
    final = notas[-1]
    vez_branca = chess.Board(fens[-1]).turn == chess.WHITE
    final_brancas = final if vez_branca else -final
    if l["tipo"] == "armadilha":
        para_lado = final_brancas if l["lado"] == "w" else -final_brancas
        if para_lado < 250:
            avisos.append("armadilha termina só com %+d cp para quem arma" % para_lado)
    status = "OK " if not avisos else "!! "
    problemas += bool(avisos)
    print("%s%-14s %-48s final %+6d (brancas)" % (status, l["abertura"], l["linha"][:48], final_brancas))
    for a in avisos:
        print("      ", a)
motor.quit()
print("\nLinhas com avisos:", problemas)
