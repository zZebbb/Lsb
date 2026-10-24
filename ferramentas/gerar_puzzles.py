#!/usr/bin/env python3
"""Gera puzzles de xadrez a partir de partidas jogadas pelo Stockfish.

Funciona como o gerador da Lichess, em versão simplificada:

1. Joga partidas entre Stockfish com força limitada (que comete erros
   humanos), partindo de linhas reais de abertura (lichess chess-openings, CC0).
2. Avalia cada posição e procura lances que entregam uma tática ao adversário.
3. Para cada erro, extrai a linha da solução exigindo que cada lance de
   quem resolve seja o único que mantém a vantagem.
4. Classifica temas (garfo, cravada, mate no corredor...) e estima a
   dificuldade pelo esforço que o motor precisa para achar cada lance.

Saída: um arquivo JSONL por processo em --saida; rode montar_puzzles.py
depois para juntar, calcular os ratings e gerar dados/puzzles.json.

Uso:
    pip install chess
    python3 gerar_puzzles.py --stockfish /caminho/stockfish --partidas 200 --processos 4
"""

import argparse
import json
import math
import multiprocessing as mp
import os
import random
import time

import chess
import chess.engine

AQUI = os.path.dirname(os.path.abspath(__file__))

VALOR = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}

FAMILIAS_POPULARES = (
    "Sicilian", "French", "Caro-Kann", "Italian", "Ruy Lopez", "Scotch", "Queen's Gambit",
    "Slav", "King's Indian", "Nimzo-Indian", "Queen's Pawn", "English", "London", "Scandinavian",
    "Pirc", "Grünfeld", "Dutch", "Philidor", "Petrov", "Four Knights", "Vienna", "King's Gambit",
    "Catalan", "Bishop's Opening", "Two Knights", "Modern", "Alekhine", "Benoni", "Indian",
    "Zukertort", "Réti", "Semi-Slav", "Evans",
)

NOS_RAPIDO = 25_000      # varredura das posições e dos lances candidatos
NOS_PROFUNDO = 350_000   # validação da linha da solução
NIVEIS_PROFUNDIDADE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16]
PROFUNDIDADES_RASAS = [1, 1, 1, 2, 3]
# o melhor lance precisa ser claramente melhor que o segundo (diferença de chance de vitória)
DIFERENCA_UNICA = 0.5


def chance(score):
    """Chance de vitória da Lichess, em [-1, 1], para um PovScore já relativo."""
    if score.is_mate():
        return 1.0 if score.mate() > 0 else -1.0
    cp = score.score()
    return 2 / (1 + math.exp(-0.00368208 * cp)) - 1


def material(board, cor):
    total = 0
    for tipo, valor in VALOR.items():
        total += valor * (len(board.pieces(tipo, cor)) - len(board.pieces(tipo, not cor)))
    return total


def carregar_aberturas():
    linhas = []
    pasta = os.path.join(AQUI, "lichess-openings")
    for nome in sorted(os.listdir(pasta)):
        if not nome.endswith(".tsv"):
            continue
        with open(os.path.join(pasta, nome), encoding="utf-8") as f:
            next(f)
            for linha in f:
                eco, nome_ab, pgn = linha.rstrip("\n").split("\t")
                peso = 6 if nome_ab.startswith(FAMILIAS_POPULARES) else 1
                linhas.append((peso, eco, nome_ab, pgn))
    return linhas


def lances_pgn(pgn):
    board = chess.Board()
    lances = []
    for token in pgn.split():
        if token.endswith("."):
            continue
        lance = board.parse_san(token)
        lances.append(lance)
        board.push(lance)
    return lances


def jogar_partida(jogador, aberturas, rng):
    pesos = [a[0] for a in aberturas]
    _, eco, nome, pgn = rng.choices(aberturas, weights=pesos, k=1)[0]
    board = chess.Board()
    for lance in lances_pgn(pgn):
        board.push(lance)
    inicio_livre = len(board.move_stack)
    elos = {chess.WHITE: rng.randint(1600, 2600), chess.BLACK: rng.randint(1600, 2600)}
    while not board.is_game_over(claim_draw=True) and len(board.move_stack) < 140:
        if rng.random() < 0.2:
            # lance "plausível" escolhido entre os 5 melhores de uma busca rasa: é assim
            # que surgem os erros táticos sutis, parecidos com os de gente
            infos = jogador.analyse(board, chess.engine.Limit(nodes=3000), multipv=5)
            candidatos = [i["pv"][0] for i in infos if i.get("pv")]
            lance = rng.choice(candidatos)
        else:
            jogador.configure({"UCI_LimitStrength": True, "UCI_Elo": elos[board.turn]})
            lance = jogador.play(board, chess.engine.Limit(time=0.02)).move
        board.push(lance)
    return board, inicio_livre, eco, nome


def melhores(analisador, board, nos, multipv=2):
    infos = analisador.analyse(board, chess.engine.Limit(nodes=nos), multipv=multipv)
    return [(i["pv"][0], i["score"].relative) for i in infos if i.get("pv")]


def lance_valido_solucao(pares):
    """Retorna o lance se ele for o único que mantém a vantagem, senão None."""
    if not pares:
        return None
    lance, melhor = pares[0]
    if melhor.is_mate() and melhor.mate() > 0:
        if len(pares) == 1:
            return lance
        segundo = pares[1][1]
        if segundo.is_mate() and segundo.mate() > 0:
            # duas formas de dar mate: só aceitamos se a alternativa for bem mais longa
            if segundo.mate() - melhor.mate() < 3:
                return None
        return lance
    if chance(melhor) < 0.45:
        return None
    if len(pares) > 1 and chance(melhor) - chance(pares[1][1]) < DIFERENCA_UNICA:
        return None
    return lance


def extrair_solucao(analisador, board):
    """board: posição depois do erro, com quem resolve na vez."""
    cor = board.turn
    b = board.copy()
    mat_inicial = material(b, cor)
    linha = []
    mate = False
    busca_mate = False
    for _ in range(8):
        pares = melhores(analisador, b, NOS_PROFUNDO)
        lance = lance_valido_solucao(pares)
        if lance is None:
            break
        if pares[0][1].is_mate():
            busca_mate = True
        b.push(lance)
        linha.append(lance)
        if b.is_checkmate():
            mate = True
            break
        if b.is_game_over():
            break
        defesa = melhores(analisador, b, NOS_PROFUNDO, multipv=1)
        if not defesa:
            break
        b.push(defesa[0][0])
        linha.append(defesa[0][0])
        # sem mate à vista, a linha termina assim que o ganho material estiver garantido
        if not busca_mate and material(b, cor) - mat_inicial >= 2:
            break
    # a linha precisa terminar num lance de quem resolve
    while linha and len(linha) % 2 == 0:
        linha.pop()
    if not linha:
        return None
    if mate:
        return linha, True
    # sem mate: depois da melhor resposta do adversário o ganho material tem que estar garantido
    fim = board.copy()
    for lance in linha:
        fim.push(lance)
    resposta = melhores(analisador, fim, NOS_PROFUNDO, multipv=1)
    if resposta:
        fim.push(resposta[0][0])
    ganho = material(fim, cor) - mat_inicial
    if ganho < 2:
        return None
    return linha, False


def profundidade_minima(analisador, board, lance_certo):
    """Menor profundidade em que o motor encontra o lance: medida de dificuldade."""
    for indice, profundidade in enumerate(NIVEIS_PROFUNDIDADE):
        # um objeto de jogo novo faz o python-chess mandar ucinewgame (limpa a hash)
        resultado = analisador.play(board, chess.engine.Limit(depth=profundidade), game=object())
        if resultado.move == lance_certo:
            return indice
    return len(NIVEIS_PROFUNDIDADE)


# ---------------------------------------------------------------- temas

def tema_mate_padrao(board):
    """board: posição final, mate já dado. Retorna o nome do padrão de mate, se houver."""
    perdedor = board.turn
    rei = board.king(perdedor)
    atacantes = list(board.checkers())
    if len(atacantes) == 2:
        return "mateXequeDuplo"
    if not atacantes:
        return None
    casa_atacante = atacantes[0]
    peca = board.piece_at(casa_atacante)
    vizinhas = [c for c in chess.SQUARES if chess.square_distance(c, rei) == 1]
    if peca.piece_type == chess.KNIGHT:
        if all(board.piece_at(c) and board.piece_at(c).color == perdedor for c in vizinhas):
            return "mateSufocado"
    fileira_fundo = 0 if perdedor == chess.WHITE else 7
    if (
        peca.piece_type in (chess.ROOK, chess.QUEEN)
        and chess.square_rank(rei) == fileira_fundo
        and chess.square_rank(casa_atacante) == fileira_fundo
    ):
        frente = 1 if perdedor == chess.WHITE else -1
        casas_frente = [
            c for c in vizinhas if chess.square_rank(c) == fileira_fundo + frente
        ]
        if casas_frente and all(
            (board.piece_at(c) and board.piece_at(c).color == perdedor) or board.is_attacked_by(not perdedor, c)
            for c in casas_frente
        ) and any(board.piece_at(c) and board.piece_at(c).color == perdedor for c in casas_frente):
            return "mateCorredor"
    if peca.piece_type == chess.ROOK and chess.square_distance(casa_atacante, rei) == 1:
        for c in board.attackers(not perdedor, casa_atacante):
            if board.piece_at(c).piece_type == chess.KNIGHT:
                cantos = (chess.A1, chess.H1, chess.A8, chess.H8)
                if rei in cantos:
                    return "mateArabe"
    if peca.piece_type == chess.BISHOP:
        bispos = board.pieces(chess.BISHOP, not perdedor)
        if len(bispos) >= 2:
            atacam_vizinhas = 0
            for b in bispos:
                if any(board.is_attacked_by(not perdedor, c) and c in board.attacks(b) for c in vizinhas):
                    atacam_vizinhas += 1
            if atacam_vizinhas >= 2:
                return "mateBoden"
    return None


def classificar(board_inicial, linha, mate):
    """board_inicial: posição depois do erro (quem resolve na vez)."""
    temas = set()
    cor = board_inicial.turn
    lances_solucao = len(linha) // 2 + 1
    if mate:
        temas.add("mate")
        temas.add("mateEm%d" % min(lances_solucao, 5))
    else:
        temas.add("vantagem" if lances_solucao > 1 else "umLance")
    if lances_solucao == 1:
        temas.add("umLance")
    elif lances_solucao == 2:
        temas.add("curto")
    elif lances_solucao == 3:
        temas.add("longo")
    else:
        temas.add("muitoLongo")

    b = board_inicial.copy()
    mat_inicio = material(b, cor)
    capturas_depois = {}
    for i, lance in enumerate(linha):
        if i % 2 == 0 and b.is_capture(lance):
            capturas_depois.setdefault(lance.to_square, i)
        b.push(lance)
    b = board_inicial.copy()
    sacrificio = False
    for i, lance in enumerate(linha):
        de_quem = b.turn
        movida = b.piece_at(lance.from_square)
        if de_quem == cor:
            if lance.promotion:
                temas.add("promocao")
            if i == 0 and b.is_capture(lance):
                alvo = b.piece_at(lance.to_square)
                if alvo and not b.is_attacked_by(not cor, lance.to_square) and lances_solucao <= 2:
                    temas.add("pecaPendurada")
            sliders_antes = {
                c: set(b.attacks(c))
                for c in b.pieces(chess.BISHOP, cor) | b.pieces(chess.ROOK, cor) | b.pieces(chess.QUEEN, cor)
                if c != lance.from_square
            }
            b.push(lance)
            if len(b.checkers()) >= 2:
                temas.add("xequeDuplo")
            # ataque descoberto: outra peça passa a atacar rei ou peça valiosa
            for c, antes in sliders_antes.items():
                novos = set(b.attacks(c)) - antes
                for alvo in novos:
                    p = b.piece_at(alvo)
                    if p and p.color != cor and (p.piece_type == chess.KING or VALOR[p.piece_type] >= 3):
                        if p.piece_type == chess.KING or any(
                            j > i and linha[j].to_square == alvo for j in range(i + 2, len(linha), 2)
                        ):
                            temas.add("ataqueDescoberto")
            # garfo: a peça movida ataca duas peças valiosas e uma delas cai depois
            if i + 2 < len(linha):
                alvos = []
                for alvo in b.attacks(lance.to_square):
                    p = b.piece_at(alvo)
                    if not p or p.color == cor:
                        continue
                    if p.piece_type == chess.KING or VALOR[p.piece_type] > VALOR[movida.piece_type] or (
                        VALOR[p.piece_type] >= 3 and not b.is_attacked_by(not cor, alvo)
                    ):
                        alvos.append(alvo)
                if len(alvos) >= 2 and any(
                    linha[j].to_square in alvos and linha[j].from_square == lance.to_square
                    for j in range(i + 2, len(linha), 2)
                ):
                    temas.add("garfo")
            # cravada: peça adversária cravada no rei pela peça movida e capturada depois
            for alvo in b.attacks(lance.to_square):
                p = b.piece_at(alvo)
                if p and p.color != cor and p.piece_type != chess.KING and b.is_pinned(not cor, alvo):
                    if VALOR[p.piece_type] >= 3 and any(linha[j].to_square == alvo for j in range(i + 2, len(linha), 2)):
                        temas.add("cravada")
            # espeto: xeque/ataque à dama em linha, a peça foge e a de trás cai
            if movida.piece_type in (chess.BISHOP, chess.ROOK, chess.QUEEN) and i + 2 < len(linha):
                fuga = linha[i + 1]
                seguinte = linha[i + 2]
                if (
                    seguinte.from_square == lance.to_square
                    and b.piece_at(fuga.from_square)
                    and VALOR[b.piece_at(fuga.from_square).piece_type] in (0, 9)
                    and fuga.from_square in b.attacks(lance.to_square)
                    and fuga.from_square in chess.SquareSet.between(lance.to_square, seguinte.to_square)
                ):
                    temas.add("espeto")
        else:
            b.push(lance)
            if material(b, cor) - mat_inicio <= -2:
                sacrificio = True
    if sacrificio:
        temas.add("sacrificio")
    if mate:
        padrao = tema_mate_padrao(b)
        if padrao:
            temas.add(padrao)

    pecas = sum(
        VALOR[p.piece_type] for p in board_inicial.piece_map().values() if p.piece_type not in (chess.PAWN, chess.KING)
    )
    if pecas <= 14:
        temas.add("final")
        so_tipo = {
            p.piece_type for p in board_inicial.piece_map().values() if p.piece_type not in (chess.KING, chess.PAWN)
        }
        if not so_tipo:
            temas.add("finalPeoes")
        elif so_tipo == {chess.ROOK}:
            temas.add("finalTorres")
        elif so_tipo == {chess.QUEEN}:
            temas.add("finalDamas")
    elif board_inicial.fullmove_number <= 14:
        temas.add("abertura")
    else:
        temas.add("meioJogo")
    return sorted(temas)


# ---------------------------------------------------------------- trabalho

def trabalhador(args):
    indice, stockfish, partidas, saida, semente = args
    rng = random.Random(semente)
    aberturas = carregar_aberturas()
    jogador = chess.engine.SimpleEngine.popen_uci(stockfish)
    analisador = chess.engine.SimpleEngine.popen_uci(stockfish)
    jogador.configure({"Threads": 1, "Hash": 16})
    analisador.configure({"Threads": 1, "Hash": 64})
    caminho = os.path.join(saida, "puzzles-%02d.jsonl" % indice)
    vistos = set()
    if os.path.exists(caminho):
        with open(caminho, encoding="utf-8") as f:
            for linha in f:
                vistos.add(json.loads(linha)["fen"].rsplit(" ", 2)[0])
    feitos = 0
    with open(caminho, "a", encoding="utf-8") as arquivo:
        for n in range(partidas):
            try:
                final, livre, eco, nome = jogar_partida(jogador, aberturas, rng)
            except chess.engine.EngineError:
                continue
            lances = final.move_stack
            board = chess.Board()
            for lance in lances[:livre]:
                board.push(lance)
            achados = 0
            ultimo = -99
            for i in range(livre, len(lances)):
                pos = board.copy(stack=False)
                jogado = lances[i]
                board.push(jogado)
                if achados >= 6 or i - ultimo < 4 or pos.is_game_over():
                    continue
                chave = pos.fen().rsplit(" ", 2)[0]
                if chave in vistos:
                    continue
                referencia = melhores(analisador, pos, NOS_RAPIDO, multipv=1)
                if not referencia:
                    continue
                # do ponto de vista de quem vai resolver (o adversário de quem erra)
                antes_solver = -chance(referencia[0][1])
                if antes_solver > 0.3:
                    continue
                # erros "humanos": o lance jogado e os lances que parecem bons numa busca rasa
                # (estão perto do melhor lance raso, mas perdem para uma tática mais funda)
                rasa = analisador.analyse(
                    pos, chess.engine.Limit(depth=rng.choice(PROFUNDIDADES_RASAS)), multipv=8, game=object()
                )
                rasa = [(i["pv"][0], i["score"].relative.score(mate_score=100_000)) for i in rasa if i.get("pv")]
                tentativas = [m for m, cp in rasa if cp >= rasa[0][1] - 150] if rasa else []
                if jogado not in tentativas:
                    tentativas.append(jogado)
                rng.shuffle(tentativas)
                for erro in tentativas:
                    depois = pos.copy(stack=False)
                    depois.push(erro)
                    if depois.is_game_over():
                        continue
                    # filtro barato antes da avaliação de verdade
                    previa = melhores(analisador, depois, NOS_RAPIDO // 3, multipv=1)
                    if not previa or chance(previa[0][1]) - antes_solver < 0.45:
                        continue
                    avaliacao = melhores(analisador, depois, NOS_RAPIDO, multipv=1)
                    if not avaliacao:
                        continue
                    depois_solver = chance(avaliacao[0][1])
                    if depois_solver < 0.45 or depois_solver - antes_solver < 0.6:
                        continue
                    resultado = extrair_solucao(analisador, depois)
                    if not resultado:
                        continue
                    linha, mate = resultado
                    # recaptura simples da peça que acabou de capturar: fácil demais, quase sempre descartada
                    if (
                        len(linha) == 1
                        and pos.is_capture(erro)
                        and linha[0].to_square == erro.to_square
                        and rng.random() > 0.15
                    ):
                        continue
                    temas = classificar(depois, linha, mate)
                    # puzzles de um lance óbvio (mate em 1, peça solta) sobram: guardamos só parte deles
                    if len(linha) == 1 and ("mateEm1" in temas or "pecaPendurada" in temas) and rng.random() > 0.4:
                        continue
                    dificuldade = []
                    b = depois.copy()
                    for j, lance in enumerate(linha):
                        if j % 2 == 0:
                            dificuldade.append(profundidade_minima(analisador, b, lance))
                        b.push(lance)
                    registro = {
                        "fen": pos.fen(),
                        "lances": " ".join(m.uci() for m in [erro] + linha),
                        "temas": temas,
                        "dificuldade": dificuldade,
                        "silencioso": not (depois.is_capture(linha[0]) or depois.gives_check(linha[0])),
                        "abertura": nome,
                        "eco": eco,
                    }
                    arquivo.write(json.dumps(registro, ensure_ascii=False) + "\n")
                    arquivo.flush()
                    vistos.add(chave)
                    achados += 1
                    feitos += 1
                    ultimo = i
                    break
            print("[w%d] partida %d/%d: %d puzzles (total %d)" % (indice, n + 1, partidas, achados, feitos), flush=True)
    jogador.quit()
    analisador.quit()
    return feitos


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stockfish", required=True)
    ap.add_argument("--partidas", type=int, default=100, help="partidas por processo")
    ap.add_argument("--processos", type=int, default=os.cpu_count() or 2)
    ap.add_argument("--saida", default=os.path.join(AQUI, "saida-puzzles"))
    ap.add_argument("--semente", type=int, default=int(time.time()))
    args = ap.parse_args()
    os.makedirs(args.saida, exist_ok=True)
    tarefas = [
        (i, args.stockfish, args.partidas, args.saida, args.semente * 100 + i) for i in range(args.processos)
    ]
    with mp.Pool(args.processos) as pool:
        total = sum(pool.map(trabalhador, tarefas))
    print("Puzzles gerados:", total)


if __name__ == "__main__":
    main()
