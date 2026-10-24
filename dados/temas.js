// Nomes dos temas dos puzzles e as lições de tática.

export const NOMES_TEMAS = {
  mate: 'Mate',
  mateEm1: 'Mate em 1',
  mateEm2: 'Mate em 2',
  mateEm3: 'Mate em 3',
  mateEm4: 'Mate em 4',
  mateEm5: 'Mate em 5+',
  mateCorredor: 'Mate do corredor',
  mateSufocado: 'Mate sufocado',
  mateArabe: 'Mate árabe',
  mateBoden: 'Mate de Boden',
  mateXequeDuplo: 'Mate com xeque duplo',
  garfo: 'Garfo',
  cravada: 'Cravada',
  espeto: 'Espeto',
  ataqueDescoberto: 'Ataque descoberto',
  xequeDuplo: 'Xeque duplo',
  pecaPendurada: 'Peça pendurada',
  sacrificio: 'Sacrifício',
  promocao: 'Promoção',
  vantagem: 'Ganho de material',
  umLance: 'Um lance',
  curto: 'Curto (2 lances)',
  longo: 'Longo (3 lances)',
  muitoLongo: 'Muito longo (4+)',
  abertura: 'Abertura',
  meioJogo: 'Meio-jogo',
  final: 'Final',
  finalPeoes: 'Final de peões',
  finalTorres: 'Final de torres',
  finalDamas: 'Final de damas',
};

// Temas que aparecem como filtro na tela de puzzles, nesta ordem.
export const TEMAS_FILTRO = [
  'mateEm1',
  'mateEm2',
  'mateEm3',
  'garfo',
  'cravada',
  'espeto',
  'ataqueDescoberto',
  'xequeDuplo',
  'pecaPendurada',
  'sacrificio',
  'promocao',
  'mateCorredor',
  'mateSufocado',
  'final',
  'finalPeoes',
  'finalTorres',
  'umLance',
  'curto',
  'longo',
  'muitoLongo',
];

// Cada lição tem uma explicação e um exemplo curto (FEN + lances), validados
// por ferramentas/validar_licoes.mjs.
export const LICOES = [
  {
    tema: 'garfo',
    titulo: 'Garfo',
    texto: [
      'Um garfo é quando uma peça ataca duas (ou mais) peças inimigas ao mesmo tempo. O adversário só consegue salvar uma delas.',
      'O cavalo é o rei dos garfos, porque ataca casas de cores e direções diferentes, e não pode ser bloqueado. Mas peões, damas e até o rei também dão garfos.',
      'Dica: procure casas de onde uma peça sua atacaria o rei e outra peça valiosa ao mesmo tempo.',
    ],
    exemplo: {
      fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
      lances: 'Nc7+ {Xeque no rei e ataque à torre ao mesmo tempo.} Kf7 Nxa8 {O rei saiu do xeque e a torre caiu.}',
    },
  },
  {
    tema: 'cravada',
    titulo: 'Cravada',
    texto: [
      'Uma peça está cravada quando não pode (ou não deve) sair do lugar porque exporia uma peça mais valiosa atrás dela.',
      'Na cravada absoluta, a peça de trás é o rei: mover a peça cravada seria ilegal. Na cravada relativa, a peça de trás é a dama ou uma torre: mover é legal, mas custa caro.',
      'Peças cravadas são ótimos alvos: ataque-as de novo, de preferência com um peão.',
    ],
    exemplo: {
      fen: '4k3/8/8/4n3/8/8/5P2/4R1K1 w - - 0 1',
      lances:
        'f4 {O cavalo está cravado pela torre contra o rei e não pode fugir.} Kf7 {O rei sai da coluna, mas tarde demais.} fxe5 {O peão ganha o cavalo.}',
    },
  },
  {
    tema: 'espeto',
    titulo: 'Espeto',
    texto: [
      'O espeto é uma cravada ao contrário: a peça mais valiosa está na frente. Quando ela foge do ataque, a peça de trás fica exposta.',
      'Funciona com peças de longo alcance: bispos, torres e damas. É muito comum em finais, com xeque no rei e captura da dama ou da torre que estava atrás.',
    ],
    exemplo: {
      fen: '8/8/8/3k3q/8/8/8/R5K1 w - - 0 1',
      lances: 'Ra5+ {Xeque pela quinta fileira, com a dama atrás do rei.} Ke4 Rxh5 {O rei saiu e a dama ficou desprotegida.}',
    },
  },
  {
    tema: 'ataqueDescoberto',
    titulo: 'Ataque descoberto',
    texto: [
      'Quando uma peça sai da frente de outra peça de longo alcance (bispo, torre ou dama), ela "descobre" um ataque. Agora são duas ameaças: a da peça que se moveu e a da que ficou para trás.',
      'Se o ataque descoberto for um xeque (xeque descoberto), a peça que se moveu pode ir para qualquer lugar, até ser capturada: o adversário primeiro precisa cuidar do rei.',
    ],
    exemplo: {
      fen: '3q4/6k1/8/8/3N4/8/8/3Q2K1 w - - 0 1',
      lances:
        'Nf5+ {O cavalo dá xeque e abre a coluna d: agora a dama branca ataca a dama preta.} Kf6 Qxd8+ {As pretas tiveram que cuidar do rei e perderam a dama.}',
    },
  },
  {
    tema: 'xequeDuplo',
    titulo: 'Xeque duplo',
    texto: [
      'É um ataque descoberto em que as DUAS peças dão xeque ao mesmo tempo. É a tática mais forte do xadrez: não dá para bloquear nem capturar duas peças de uma vez, então o rei é obrigado a se mover.',
      'Por isso a peça que deu o xeque direto pode ir para casas atacadas sem medo.',
    ],
    exemplo: {
      fen: '4k3/5q2/8/8/4N3/8/8/4R1K1 w - - 0 1',
      lances:
        'Nd6+ {Xeque duplo: o cavalo e a torre (pela coluna e) dão xeque. O rei precisa fugir.} Kd7 Nxf7 {E o cavalo, que também atacava a dama, a captura.}',
    },
  },
  {
    tema: 'pecaPendurada',
    titulo: 'Peças penduradas',
    texto: [
      'Uma peça "pendurada" está atacada e não tem defesa suficiente. Capturar material de graça é a tática mais simples e mais comum em partidas reais.',
      'Antes de todo lance, faça duas perguntas: "o que o meu adversário deixou desprotegido?" e "o que eu estou deixando desprotegido?".',
    ],
    exemplo: {
      fen: '4k3/8/8/8/3n4/8/8/3QK3 w - - 0 1',
      lances: 'Qxd4 {O cavalo não tinha defesa nenhuma.}',
    },
  },
  {
    tema: 'mateCorredor',
    titulo: 'Mate do corredor',
    texto: [
      'O rei rocado atrás dos seus peões pode ficar preso na primeira (ou última) fileira. Uma torre ou dama que chegue lá dá mate.',
      'Para evitar: abra uma "janela" para o rei com h3 (ou ...h6) quando houver tempo, e mantenha uma peça defendendo a fileira de trás.',
    ],
    exemplo: {
      fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
      lances: 'Rd8# {O rei está preso atrás dos próprios peões.}',
    },
  },
  {
    tema: 'mateSufocado',
    titulo: 'Mate sufocado',
    texto: [
      'O rei está cercado pelas próprias peças e um cavalo dá xeque. Como não há para onde ir e o cavalo não pode ser bloqueado, é mate.',
      'Costuma aparecer com o rei no canto (h8 ou a8), cercado por torre e peões.',
    ],
    exemplo: {
      fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
      lances: 'Nf7# {O rei não tem nenhuma casa livre.}',
    },
  },
  {
    tema: 'sacrificio',
    titulo: 'Sacrifício',
    texto: [
      'Sacrificar é entregar material de propósito para conseguir algo maior: dar mate, ganhar mais material ou promover um peão.',
      'Os sacrifícios mais comuns tiram um defensor do lugar (desvio) ou atraem uma peça para uma casa ruim (atração).',
    ],
    exemplo: {
      fen: '2r3k1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1',
      lances:
        'Qd8+ {A dama se sacrifica para atrair a torre.} Rxd8 {Forçado.} Rxd8# {A torre que defendia o corredor foi desviada. Mate!}',
    },
  },
  {
    tema: 'promocao',
    titulo: 'Promoção',
    texto: [
      'Um peão que chega à última fileira vira dama (ou outra peça). Muitas táticas giram em torno de abrir caminho para um peão passado.',
      'Desviar a peça que vigia a casa de promoção é uma ideia recorrente.',
    ],
    exemplo: {
      fen: '1r4k1/1P3ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',
      lances: 'Rc8+ {Desvia a torre preta da coluna b.} Rxc8 bxc8=Q# {O peão vira dama com xeque-mate: o rei está preso atrás dos próprios peões.}',
    },
  },
  {
    tema: 'mateEm2',
    titulo: 'Como calcular: xeques, capturas e ameaças',
    texto: [
      'Para achar táticas, examine os lances "forçantes" primeiro, nesta ordem: Xeques, Capturas e Ameaças.',
      'Lances forçantes limitam as respostas do adversário, então dá para calcular mais longe. Para cada candidato, pergunte: "qual a melhor resposta dele?".',
      'Nos puzzles de mate em 2 ou 3, quase sempre o primeiro lance é um xeque ou uma ameaça de mate que não pode ser parada.',
    ],
  },
];
