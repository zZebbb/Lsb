// Gera dados/nomes-aberturas.json: posição (EPD) -> "ECO|Nome em português".
// Fonte: lichess-org/chess-openings (CC0), em ferramentas/lichess-openings/*.tsv.
//
// Uso: node ferramentas/montar_nomes.mjs

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from '../js/vendor/chess.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const pasta = join(aqui, 'lichess-openings');

const FAMILIAS = {
  'Sicilian Defense': 'Defesa Siciliana',
  'French Defense': 'Defesa Francesa',
  'Caro-Kann Defense': 'Defesa Caro-Kann',
  'Italian Game': 'Abertura Italiana',
  'Ruy Lopez': 'Ruy López (Espanhola)',
  'Scotch Game': 'Abertura Escocesa',
  "Queen's Gambit Declined": 'Gambito da Dama Recusado',
  "Queen's Gambit Accepted": 'Gambito da Dama Aceito',
  "Queen's Gambit": 'Gambito da Dama',
  'Slav Defense': 'Defesa Eslava',
  'Semi-Slav Defense': 'Defesa Semi-Eslava',
  "King's Indian Defense": 'Índia do Rei',
  "King's Indian Attack": 'Ataque Índio do Rei',
  'Nimzo-Indian Defense': 'Nimzo-Índia',
  "Queen's Indian Defense": 'Índia da Dama',
  'Bogo-Indian Defense': 'Bogo-Índia',
  'Old Indian Defense': 'Índia Antiga',
  'Indian Defense': 'Defesa Índia',
  'Grünfeld Defense': 'Defesa Grünfeld',
  'London System': 'Sistema Londres',
  'English Opening': 'Abertura Inglesa',
  'Scandinavian Defense': 'Defesa Escandinava',
  "Petrov's Defense": 'Defesa Petrov',
  'Russian Game': 'Defesa Petrov',
  'Philidor Defense': 'Defesa Philidor',
  'Pirc Defense': 'Defesa Pirc',
  'Modern Defense': 'Defesa Moderna',
  'Alekhine Defense': 'Defesa Alekhine',
  'Dutch Defense': 'Defesa Holandesa',
  'Benoni Defense': 'Defesa Benoni',
  'Benko Gambit': 'Gambito Benko',
  'Benko Gambit Accepted': 'Gambito Benko Aceito',
  'Benko Gambit Declined': 'Gambito Benko Recusado',
  "King's Gambit": 'Gambito do Rei',
  "King's Gambit Accepted": 'Gambito do Rei Aceito',
  "King's Gambit Declined": 'Gambito do Rei Recusado',
  'Vienna Game': 'Abertura Vienense',
  'Vienna Gambit': 'Gambito Vienense',
  'Four Knights Game': 'Jogo dos Quatro Cavalos',
  'Three Knights Opening': 'Abertura dos Três Cavalos',
  "Bishop's Opening": 'Abertura do Bispo',
  'Center Game': 'Jogo do Centro',
  'Danish Gambit': 'Gambito Dinamarquês',
  'Danish Gambit Accepted': 'Gambito Dinamarquês Aceito',
  'Ponziani Opening': 'Abertura Ponziani',
  'Catalan Opening': 'Abertura Catalã',
  'Réti Opening': 'Abertura Réti',
  'Zukertort Opening': 'Abertura Zukertort',
  'Bird Opening': 'Abertura Bird',
  "Queen's Pawn Game": 'Jogo do Peão da Dama',
  "King's Pawn Game": 'Jogo do Peão do Rei',
  "King's Pawn Opening": 'Abertura do Peão do Rei',
  'Englund Gambit': 'Gambito Englund',
  'Budapest Defense': 'Defesa Budapeste',
  'Trompowsky Attack': 'Ataque Trompowsky',
  'Torre Attack': 'Ataque Torre',
  'Colle System': 'Sistema Colle',
  'Nimzowitsch Defense': 'Defesa Nimzowitsch',
  'Owen Defense': 'Defesa Owen',
  'Polish Opening': 'Abertura Polonesa',
  'Nimzo-Larsen Attack': 'Ataque Nimzo-Larsen',
  'Grob Opening': 'Abertura Grob',
  'Hungarian Opening': 'Abertura Húngara',
  'Elephant Gambit': 'Gambito Elefante',
  'Latvian Gambit': 'Gambito Letão',
  'Latvian Gambit Accepted': 'Gambito Letão Aceito',
  'Rat Defense': 'Defesa Rato',
  'St. George Defense': 'Defesa São Jorge',
  'Blackmar-Diemer Gambit': 'Gambito Blackmar-Diemer',
  'Albin Countergambit': 'Contragambito Albin',
  'Tarrasch Defense': 'Defesa Tarrasch',
  'Semi-Slav Defense Accepted': 'Defesa Semi-Eslava Aceita',
  'Van Geet Opening': 'Abertura Van Geet',
  'Mieses Opening': 'Abertura Mieses',
  'Saragossa Opening': 'Abertura Saragoça',
  'Clemenz Opening': 'Abertura Clemenz',
  'Ware Opening': 'Abertura Ware',
  'Amar Opening': 'Abertura Amar',
  'Anderssen Opening': 'Abertura Anderssen',
  'Barnes Opening': 'Abertura Barnes',
  'Durkin Opening': 'Abertura Durkin',
  'Kadas Opening': 'Abertura Kadas',
  'Sodium Attack': 'Ataque Sódio',
  "Van't Kruijs Opening": "Abertura Van't Kruijs",
  'Lion Defense': 'Defesa Leão',
  'Robatsch (Modern) Defense': 'Defesa Robatsch (Moderna)',
  'Portuguese Opening': 'Abertura Portuguesa',
  'Rapport-Jobava System': 'Sistema Rapport-Jobava',
  'Richter-Veresov Attack': 'Ataque Richter-Veresov',
  'Horwitz Defense': 'Defesa Horwitz',
  'Kangaroo Defense': 'Defesa Canguru',
  'Englund Gambit Declined': 'Gambito Englund Recusado',
  'Greek Gambit': 'Gambito Grego',
  'Gunderam Defense': 'Defesa Gunderam',
  'Duras Gambit': 'Gambito Duras',
  'Goldsmith Defense': 'Defesa Goldsmith',
  'Carr Defense': 'Defesa Carr',
  'Borg Defense': 'Defesa Borg',
  'Czech Defense': 'Defesa Tcheca',
  'Pterodactyl Defense': 'Defesa Pterodáctilo',
  'Hippopotamus Defense': 'Defesa Hipopótamo',
  'Pseudo Queen\'s Indian Defense': 'Pseudo Índia da Dama',
  'Mikenas Defense': 'Defesa Mikenas',
  'Tennison Gambit': 'Gambito Tennison',
};

const FRASES = {
  'Main Line': 'Linha principal',
  'Exchange Variation': 'Variante das Trocas',
  'Advance Variation': 'Variante do Avanço',
  'Closed Variation': 'Variante Fechada',
  'Open Variation': 'Variante Aberta',
  'Classical Variation': 'Variante Clássica',
  'Modern Variation': 'Variante Moderna',
  'Normal Variation': 'Variante Normal',
  'Symmetrical Variation': 'Variante Simétrica',
  'Fianchetto Variation': 'Variante do Fianqueto',
  'Accelerated Dragon': 'Dragão Acelerado',
  'Dragon Variation': 'Variante do Dragão',
  'Yugoslav Attack': 'Ataque Iugoslavo',
  'English Attack': 'Ataque Inglês',
  'Fried Liver Attack': 'Ataque Fígado Frito',
  'Two Knights Defense': 'Defesa dos Dois Cavalos',
  'Berlin Defense': 'Defesa Berlim',
  'Morphy Defense': 'Defesa Morphy',
  'Steinitz Defense': 'Defesa Steinitz',
  'Orthodox Defense': 'Defesa Ortodoxa',
  'Giuoco Piano': 'Giuoco Piano',
  'Giuoco Pianissimo': 'Giuoco Pianissimo',
  'Evans Gambit': 'Gambito Evans',
  'Evans Gambit Accepted': 'Gambito Evans Aceito',
  'Evans Gambit Declined': 'Gambito Evans Recusado',
  'Smith-Morra Gambit': 'Gambito Smith-Morra',
  'Smith-Morra Gambit Accepted': 'Gambito Smith-Morra Aceito',
  'Smith-Morra Gambit Declined': 'Gambito Smith-Morra Recusado',
  'Panov Attack': 'Ataque Panov',
  'Panov-Botvinnik Attack': 'Ataque Panov-Botvinnik',
  'Mar del Plata Variation': 'Variante Mar del Plata',
  'Old Main Line': 'Linha principal antiga',
  'Sämisch Variation': 'Variante Sämisch',
  'Rubinstein Variation': 'Variante Rubinstein',
  'Winawer Variation': 'Variante Winawer',
  'Poisoned Pawn Variation': 'Variante do Peão Envenenado',
  'Tarrasch Variation': 'Variante Tarrasch',
  'Najdorf Variation': 'Variante Najdorf',
  'Alapin Variation': 'Variante Alapin',
  'Four Pawns Attack': 'Ataque dos Quatro Peões',
  'Short Variation': 'Variante Short',
  'Mieses Variation': 'Variante Mieses',
  'Mieses Defense': 'Defesa Mieses',
  'Accepted': 'Aceito',
  'Declined': 'Recusado',
  'Deferred': 'Diferida',
};

const SUBSTANTIVOS = [
  [/^(.+) Gambit Accepted$/, 'Gambito $1 Aceito'],
  [/^(.+) Gambit Declined$/, 'Gambito $1 Recusado'],
  [/^(.+) Countergambit$/, 'Contragambito $1'],
  [/^(.+) Variation$/, 'Variante $1'],
  [/^(.+) Attack$/, 'Ataque $1'],
  [/^(.+) Gambit$/, 'Gambito $1'],
  [/^(.+) Defense$/, 'Defesa $1'],
  [/^(.+) System$/, 'Sistema $1'],
  [/^(.+) Line$/, 'Linha $1'],
  [/^(.+) Trap$/, 'Armadilha $1'],
  [/^(.+) Opening$/, 'Abertura $1'],
  [/^(.+) Formation$/, 'Formação $1'],
  [/^(.+) Game$/, 'Jogo $1'],
];

function traduzirTrecho(t) {
  if (FRASES[t]) return FRASES[t];
  if (FAMILIAS[t]) return FAMILIAS[t];
  for (const [re, sub] of SUBSTANTIVOS) if (re.test(t)) return t.replace(re, sub);
  return t;
}

export function traduzir(nome) {
  const [familia, resto] = nome.split(/:\s*/, 2);
  const f = FAMILIAS[familia] || traduzirTrecho(familia);
  if (!resto) return f;
  return f + ': ' + resto.split(', ').map(traduzirTrecho).join(', ');
}

const nomes = {};
let total = 0;
for (const arquivo of readdirSync(pasta).filter((f) => f.endsWith('.tsv')).sort()) {
  const linhas = readFileSync(join(pasta, arquivo), 'utf8').trim().split('\n').slice(1);
  for (const linha of linhas) {
    const [eco, nome, pgn] = linha.split('\t');
    const jogo = new Chess();
    for (const token of pgn.split(/\s+/)) if (!/^\d+\.$/.test(token)) jogo.move(token);
    const chave = jogo.fen().split(' ').slice(0, 4).join(' ');
    nomes[chave] = `${eco}|${traduzir(nome)}`;
    total++;
  }
}
writeFileSync(join(aqui, '..', 'dados', 'nomes-aberturas.json'), JSON.stringify(nomes));
console.log(`${total} linhas, ${Object.keys(nomes).length} posições`);
