// Leitura das linhas de abertura escritas como "e4 {comentário} e5 Nf3 ..."
// e montagem da árvore de lances usada pelo modo de treino.

import { Chess } from './vendor/chess.js';

const ANOTACAO = /[!?]+$/;

export function lerLinha(texto) {
  const lances = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (c === '{') {
      const fim = texto.indexOf('}', i);
      const comentario = texto.slice(i + 1, fim).trim();
      if (lances.length) lances[lances.length - 1].comentario = comentario;
      i = fim + 1;
    } else if (/\s/.test(c)) {
      i++;
    } else {
      let j = i;
      while (j < texto.length && !/[\s{]/.test(texto[j])) j++;
      const token = texto.slice(i, j);
      i = j;
      if (/^\d+\.+$/.test(token)) continue;
      const anotacao = (token.match(ANOTACAO) || [''])[0];
      lances.push({ san: token.slice(0, token.length - anotacao.length), anotacao, comentario: '' });
    }
  }
  return lances;
}

// Joga a linha num tabuleiro e devolve os lances com from/to/fen; lança erro se algum for ilegal.
export function jogarLinha(texto) {
  const jogo = new Chess();
  return lerLinha(texto).map((lance, indice) => {
    let m;
    try {
      m = jogo.move(lance.san);
    } catch (e) {
      throw new Error(`Lance ilegal "${lance.san}" (meio-lance ${indice + 1})`);
    }
    return { ...lance, san: m.san, from: m.from, to: m.to, promotion: m.promotion, fen: jogo.fen() };
  });
}

// Lado que o aluno joga numa linha (armadilhas podem ser treinadas pelo lado que a arma).
export function ladoDaLinha(abertura, linha) {
  return linha.ladoArmadilha || abertura.lado;
}
