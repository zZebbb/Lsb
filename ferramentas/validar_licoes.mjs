// Confere os exemplos das lições de tática (dados/temas.js).
import { Chess } from '../js/vendor/chess.js';
import { LICOES } from '../dados/temas.js';
import { lerLinha } from '../js/linhas.js';

let erros = 0;
for (const l of LICOES) {
  if (!l.exemplo) continue;
  const jogo = new Chess(l.exemplo.fen);
  try {
    for (const m of lerLinha(l.exemplo.lances)) jogo.move(m.san);
    const fim = jogo.isCheckmate() ? 'mate' : jogo.inCheck() ? 'xeque' : '';
    console.log('ok  ', l.titulo.padEnd(22), jogo.history().join(' '), fim);
  } catch (e) {
    erros++;
    console.log('ERRO', l.titulo, e.message);
  }
}
process.exit(erros ? 1 : 0);
