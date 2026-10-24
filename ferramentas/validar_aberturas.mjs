// Confere se todas as linhas de dados/aberturas.js são legais e imprime as posições
// finais (FEN) para a checagem com o Stockfish em validar_aberturas.py.
import { ABERTURAS } from '../dados/aberturas.js';
import { jogarLinha } from '../js/linhas.js';

let erros = 0;
const saida = [];
for (const ab of ABERTURAS) {
  for (const linha of ab.linhas) {
    try {
      const lances = jogarLinha(linha.lances);
      saida.push({ abertura: ab.id, linha: linha.nome, tipo: linha.tipo || 'normal',
        lado: linha.ladoArmadilha || ab.lado, fens: lances.map(l => l.fen), sans: lances.map(l => l.san + l.anotacao) });
    } catch (e) {
      erros++;
      console.error(`ERRO em ${ab.nome} / ${linha.nome}: ${e.message}`);
    }
  }
}
if (process.argv.includes('--json')) console.log(JSON.stringify(saida));
else console.error(`${saida.length} linhas válidas, ${erros} com erro`);
process.exit(erros ? 1 : 0);
