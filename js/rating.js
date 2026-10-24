// Rating de puzzles: Elo com fator K maior no começo, para achar o nível rápido.

import { armazenamento, hoje } from './util.js';

const RATING_INICIAL = 1200;

export function estadoPuzzles() {
  return {
    rating: RATING_INICIAL,
    jogos: 0,
    acertos: 0,
    sequencia: 0,
    melhorSequencia: 0,
    historico: [],
    resolvidos: {},
    porTema: {},
    porDia: {},
    ...armazenamento.ler('puzzles', {}),
  };
}

export function salvarEstadoPuzzles(estado) {
  armazenamento.gravar('puzzles', estado);
}

export function provisorio(estado) {
  return estado.jogos < 15;
}

export function calcularDelta(estado, ratingPuzzle, acertou) {
  const k = estado.jogos < 10 ? 64 : estado.jogos < 30 ? 40 : 24;
  const esperado = 1 / (1 + 10 ** ((ratingPuzzle - estado.rating) / 400));
  return Math.round(k * ((acertou ? 1 : 0) - esperado));
}

// Registra o resultado de um puzzle e devolve a variação do rating.
export function registrarResultado(puzzle, acertou) {
  const estado = estadoPuzzles();
  const delta = calcularDelta(estado, puzzle.rating, acertou);
  estado.rating = Math.max(400, estado.rating + delta);
  estado.jogos++;
  if (acertou) {
    estado.acertos++;
    estado.sequencia++;
    estado.melhorSequencia = Math.max(estado.melhorSequencia, estado.sequencia);
  } else {
    estado.sequencia = 0;
  }
  estado.resolvidos[puzzle.id] = acertou ? 1 : 0;
  estado.historico.push([Date.now(), estado.rating]);
  if (estado.historico.length > 1000) estado.historico.splice(0, estado.historico.length - 1000);
  for (const tema of puzzle.temas) {
    const t = (estado.porTema[tema] = estado.porTema[tema] || [0, 0]);
    t[0] += acertou ? 1 : 0;
    t[1]++;
  }
  const dia = (estado.porDia[hoje()] = estado.porDia[hoje()] || [0, 0]);
  dia[0] += acertou ? 1 : 0;
  dia[1]++;
  salvarEstadoPuzzles(estado);
  return { delta, estado };
}
