// Repertório de aberturas. Cada linha é uma sequência de lances em SAN (inglês,
// como o chess.js entende) com comentários entre chaves, no estilo PGN.
// Nos comentários usamos a notação brasileira: R rei, D dama, T torre, B bispo, C cavalo.
//
// lado: 'w' quando quem estuda joga de brancas, 'b' quando joga de pretas.
// tipo 'armadilha': a linha mostra um erro comum do adversário e como puni-lo.

export const GRUPOS = [
  { id: 'brancas-e4', nome: 'Brancas com 1.e4' },
  { id: 'brancas-d4', nome: 'Brancas com 1.d4' },
  { id: 'pretas-e4', nome: 'Pretas contra 1.e4' },
  { id: 'pretas-d4', nome: 'Pretas contra 1.d4' },
  { id: 'armadilhas', nome: 'Armadilhas clássicas' },
];

export const ABERTURAS = [
  {
    id: 'italiana',
    nome: 'Abertura Italiana',
    grupo: 'brancas-e4',
    lado: 'w',
    nivel: 'Iniciante',
    resumo:
      'Uma das aberturas mais antigas e naturais: as brancas desenvolvem rápido, rocam cedo e miram o ponto f7. Ótima para aprender os princípios.',
    ideias: [
      'O bispo em c4 mira f7, a casa mais fraca das pretas no começo da partida.',
      'Com c3 e d4 as brancas sonham com um centro de peões em e4 e d4.',
      'Na versão moderna (com d3), o jogo é de manobras: Cbd2–f1–g3, h3 e só depois d4.',
      'Cuidado com ataques prematuros: Cg5 sem preparo costuma perder tempo.',
    ],
    linhas: [
      {
        nome: 'Giuoco Pianissimo (moderna, com d3)',
        lances:
          'e4 {Ocupa o centro e abre caminho para a dama e o bispo de casas brancas.} ' +
          'e5 {As pretas disputam o centro do mesmo jeito.} ' +
          'Nf3 {Desenvolve atacando o peão de e5: desenvolvimento com ameaça.} ' +
          'Nc6 {Defende e5 desenvolvendo uma peça.} ' +
          'Bc4 {A Italiana: o bispo mira f7, defendido apenas pelo rei.} ' +
          'Bc5 {Giuoco Piano, o "jogo tranquilo": o bispo preto também mira f2.} ' +
          'c3 {Prepara d4 para montar um centro forte.} ' +
          'Nf6 {Desenvolve e ataca e4.} ' +
          'd3 {Defende e4 com calma. É a abordagem moderna: sem pressa, manobrando.} ' +
          'd6 {Apoia e5 e abre a diagonal do bispo de c8.} ' +
          'O-O {Rei em segurança e torre a caminho do centro.} ' +
          'O-O {As pretas também rocam.} ' +
          'Re1 {A torre reforça e4 e apoia uma futura ruptura d4.} ' +
          'a6 {Abre a casa a7 para o bispo fugir de b4 ou d4 sem perder tempo.} ' +
          'Bb3 {Recua antes que ...Ca5 ou ...d5 incomode o bispo.} ' +
          'Ba7 {O bispo continua mirando f2, agora fora de alcance.} ' +
          'h3 {Impede ...Bg4, que cravaria o cavalo. O plano agora é Cbd2–f1–g3 e só depois d4.}',
      },
      {
        nome: 'Giuoco Piano clássico (c3 e d4)',
        lances:
          'e4 e5 Nf3 Nc6 Bc4 Bc5 ' +
          'c3 {Prepara o avanço central d4.} ' +
          'Nf6 {Contra-ataca e4.} ' +
          'd4 {O ataque central mais direto: as brancas querem peões em e4 e d4.} ' +
          'exd4 {Necessário: se as pretas não trocarem, d4xe5 ou d5 ganha muito espaço.} ' +
          'cxd4 {O centro ideal com peões em e4 e d4!} ' +
          'Bb4+ {O xeque alivia a pressão e prepara a troca de bispos.} ' +
          'Bd2 {Interpõe e oferece a troca. (Cc3 é o Ataque Møller, um gambito bem afiado.)} ' +
          'Bxd2+ {Troca de bispos.} ' +
          'Nbxd2 {O cavalo recaptura e passa a defender e4.} ' +
          'd5 {Golpe central típico: atacar e4 já, antes que e5 expulse o cavalo de f6.} ' +
          'exd5 {As brancas trocam e ficam com um peão isolado em d4.} ' +
          'Nxd5 {Cavalo centralizado.} ' +
          'Qb3 {Pressiona d5 e b7 ao mesmo tempo.} ' +
          'Nce7 {Reforça o cavalo de d5.} ' +
          'O-O O-O ' +
          'Rfe1 {Torre na coluna semiaberta, apontando para e7.} ' +
          'c6 {Posição equilibrada: peão isolado das brancas compensado pelas peças ativas.}',
      },
      {
        nome: 'Gambito Evans',
        lances:
          'e4 e5 Nf3 Nc6 Bc4 Bc5 ' +
          'b4 {O Gambito Evans! As brancas entregam um peão para ganhar tempo com c3 e d4.} ' +
          'Bxb4 {Aceitar é o mais natural.} ' +
          'c3 {Ataca o bispo e prepara d4, com ganho de tempo.} ' +
          'Ba5 {O bispo recua mantendo a cravada em c3.} ' +
          'd4 {Abre o centro enquanto o rei preto ainda não rocou.} ' +
          'exd4 {As pretas aceitam mais material.} ' +
          'O-O {Rocar primeiro: as brancas estão muito à frente no desenvolvimento. As pretas precisam devolver material com ...d6 ou ...Cge7 e jogar com precisão.}',
      },
      {
        nome: 'Dois Cavalos: 4.Cg5 (linha principal)',
        lances:
          'e4 e5 Nf3 Nc6 Bc4 ' +
          'Nf6 {Defesa dos Dois Cavalos: as pretas contra-atacam e4 em vez de copiar ...Bc5.} ' +
          'Ng5 {Ataque direto a f7 com cavalo e bispo. Ameaça Cxf7, garfando dama e torre.} ' +
          'd5 {A defesa correta: fecha a diagonal do bispo.} ' +
          'exd5 {Ganha um peão e volta a abrir a diagonal.} ' +
          'Na5 {O melhor! Ataca o bispo. (5...Cxd5?! permite o perigoso Ataque Fígado Frito, 6.Cxf7.)} ' +
          'Bb5+ {O bispo sai com xeque.} ' +
          'c6 {Bloqueia e ataca o bispo.} ' +
          'dxc6 {As brancas seguem com o peão a mais.} ' +
          'bxc6 {As pretas têm desenvolvimento e ritmo em troca do peão.} ' +
          'Be2 {Recuo seguro.} ' +
          'h6 {Expulsa o cavalo de g5.} ' +
          'Nf3 {Volta para casa.} ' +
          'e4 {Ganha mais um tempo atacando o cavalo.} ' +
          'Ne5 {O cavalo acha uma boa casa central. Peão a mais para as brancas, iniciativa para as pretas: é um gambito respeitado.}',
      },
      {
        nome: 'Ataque Fígado Frito (se as pretas erram com 5...Cxd5)',
        lances:
          'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 ' +
          'Nxd5?! {Natural, mas imprudente: deixa f7 vulnerável.} ' +
          'Nxf7! {O sacrifício do Fígado Frito: o cavalo cai em f7 para arrancar o rei do roque.} ' +
          'Kxf7 {Praticamente forçado: o cavalo atacava dama e torre.} ' +
          'Qf3+ {Xeque atacando também o cavalo cravado em d5.} ' +
          'Ke6 {O rei precisa defender o cavalo e vai para o meio do tabuleiro.} ' +
          'Nc3 {Mais uma peça contra o cavalo cravado. O rei preto no centro sofre muito; na prática é dificílimo defender. (6.d4 é ainda mais forte, mas o Fígado Frito é o golpe clássico.)}',
      },
    ],
  },

  {
    id: 'espanhola',
    nome: 'Ruy López (Espanhola)',
    grupo: 'brancas-e4',
    lado: 'w',
    nivel: 'Intermediário',
    resumo:
      'A abertura mais estudada da história. As brancas pressionam indiretamente o peão de e5 atacando seu defensor, o cavalo de c6, e buscam uma vantagem duradoura.',
    ideias: [
      'O bispo em b5 ataca o defensor de e5: a pressão é indireta e de longo prazo.',
      'As brancas preparam c3 e d4 para dominar o centro.',
      'O bispo costuma recuar para a4, b3 e às vezes c2, mirando o roque preto.',
      'Na Variante das Trocas, as brancas buscam um final com maioria de peões na ala do rei.',
    ],
    linhas: [
      {
        nome: 'Espanhola Fechada',
        lances:
          'e4 e5 Nf3 Nc6 ' +
          'Bb5 {A Espanhola: ataca o cavalo que defende e5.} ' +
          'a6 {Defesa Morphy: pergunta ao bispo o que ele quer.} ' +
          'Ba4 {Mantém a pressão. (Bxc6 é a Variante das Trocas.)} ' +
          'Nf6 {Desenvolve e ataca e4.} ' +
          'O-O {As brancas não defendem e4: se 5...Cxe4, 6.d4 abre o centro com o rei preto ainda no meio (Variante Aberta).} ' +
          'Be7 {Espanhola Fechada: desenvolvimento sólido, preparando o roque.} ' +
          'Re1 {Defende e4. Agora Bxc6 seguido de Cxe5 virou ameaça de verdade.} ' +
          'b5 {Afasta o bispo e acaba com a ameaça.} ' +
          'Bb3 {O bispo continua mirando f7.} ' +
          'd6 {Reforça e5 e abre o bispo de c8.} ' +
          'c3 {Prepara d4 e cria a casa c2 para o bispo se esconder de ...Ca5.} ' +
          'O-O {Rei seguro.} ' +
          'h3 {Impede ...Bg4. Esta é a posição-base da Espanhola Fechada; o plano é d4 e Cbd2–f1–g3.}',
      },
      {
        nome: 'Variante das Trocas',
        lances:
          'e4 e5 Nf3 Nc6 Bb5 a6 ' +
          'Bxc6 {Entrega o par de bispos para estragar a estrutura das pretas.} ' +
          'dxc6 {Recapturar em direção ao centro abre as linhas para os bispos pretos.} ' +
          'O-O {A ideia de Fischer. Atenção: 5.Cxe5? permite 5...Dd4!, garfo que recupera o peão.} ' +
          'f6 {Defende e5 de forma sólida.} ' +
          'd4 {Abre o centro.} ' +
          'exd4 {Troca no centro.} ' +
          'Nxd4 {Cavalo centralizado.} ' +
          'c5 {Expulsa o cavalo.} ' +
          'Nb3 {Recuo que ataca c5.} ' +
          'Qxd1 {As pretas trocam as damas.} ' +
          'Rxd1 {Final típico: as pretas têm o par de bispos; as brancas, 4 contra 3 peões na ala do rei, que podem gerar um peão passado.}',
      },
      {
        nome: 'Defesa Berlim',
        lances:
          'e4 e5 Nf3 Nc6 Bb5 ' +
          'Nf6 {A Berlim: contra-ataque imediato em e4.} ' +
          'O-O {De novo e4 fica "pendurado" de propósito.} ' +
          'Nxe4 {As pretas pegam o peão.} ' +
          'd4 {Abre o centro para atacar o rei preto.} ' +
          'Nd6 {O cavalo ataca o bispo e cobre a coluna e.} ' +
          'Bxc6 {Troca antes de recuar.} ' +
          'dxc6 {Recaptura abrindo os bispos.} ' +
          'dxe5 {Recupera o peão.} ' +
          'Nf5 {O cavalo vai para uma boa casa.} ' +
          'Qxd8+ {Troca de damas: chegamos ao famoso "Final da Berlim".} ' +
          'Kxd8 {O rei preto perde o roque, mas sem damas isso pesa pouco. A "Muralha de Berlim" que Kramnik usou contra Kasparov em 2000.}',
      },
      {
        nome: 'Armadilha da Arca de Noé (cuidado!)',
        tipo: 'armadilha',
        ladoArmadilha: 'b',
        lances:
          'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 ' +
          'd6 {Defesa Steinitz Diferida.} ' +
          'd4 {Ataca o centro.} ' +
          'b5 {Afasta o bispo.} ' +
          'Bb3 {O bispo recua para b3...} ' +
          'Nxd4 {As pretas trocam cavalos.} ' +
          'Nxd4 exd4 ' +
          'Qxd4?? {O erro: parece só recuperar um peão.} ' +
          'c5! {Ataca a dama e prepara ...c4.} ' +
          'Qd5 {A dama foge mirando a8.} ' +
          'Be6 {Interpõe com ganho de tempo.} ' +
          'Qc6+ Bd7 Qd5 ' +
          'c4! {O bispo de b3 está preso numa "arca" de peões e vai ser capturado. Lição: veja sempre a casa de fuga das suas peças.}',
      },
    ],
  },

  {
    id: 'escocesa',
    nome: 'Abertura Escocesa',
    grupo: 'brancas-e4',
    lado: 'w',
    nivel: 'Iniciante',
    resumo:
      'As brancas abrem o centro logo no 3º lance. Jogo aberto e direto, com menos teoria que a Espanhola. Kasparov a usou em matches de campeonato mundial.',
    ideias: [
      'Trocar o peão de e5 cedo libera o jogo das brancas e cria um cavalo forte em d4.',
      'As brancas ficam com mais espaço central (peão em e4 contra nenhum peão preto no centro).',
      'É preciso cuidado com o peão de e4, que costuma ser alvo das pretas.',
    ],
    linhas: [
      {
        nome: 'Clássica: 4...Bc5 5.Be3',
        lances:
          'e4 e5 Nf3 Nc6 ' +
          'd4 {A Escocesa: ataque imediato ao centro.} ' +
          'exd4 {A resposta normal.} ' +
          'Nxd4 {Recupera o peão com um cavalo centralizado.} ' +
          'Bc5 {Ataca o cavalo de d4.} ' +
          'Be3 {Defende o cavalo desenvolvendo.} ' +
          'Qf6 {Aumenta a pressão em d4.} ' +
          'c3 {Reforça d4 com peão.} ' +
          'Nge7 {Desenvolve sem bloquear a dama em f6.} ' +
          'Bc4 {Desenvolvimento ativo, mirando f7.} ' +
          'O-O ' +
          'O-O {Posição rica, com jogo de peças para os dois lados.}',
      },
      {
        nome: 'Mieses: 4...Cf6 5.Cxc6',
        lances:
          'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 ' +
          'Nf6 {Ataca e4 imediatamente.} ' +
          'Nxc6 {Troca antes de defender e4.} ' +
          'bxc6 {Recapturar em direção ao centro.} ' +
          'e5 {Ganha espaço e expulsa o cavalo de f6.} ' +
          'Qe7 {Ataca e5 e crava o peão contra o rei: ele não pode tomar o cavalo de f6.} ' +
          'Qe2 {Defende e5 e desfaz a cravada na coluna e.} ' +
          'Nd5 {O cavalo pula para o centro.} ' +
          'c4 {Expulsa o cavalo...} ' +
          'Ba6 {...e o bispo crava o peão de c4 contra a dama de e2.} ' +
          'b3 {Reforça c4. Posição complexa e muito teórica.}',
      },
    ],
  },

  {
    id: 'gambito-dama',
    nome: 'Gambito da Dama',
    grupo: 'brancas-d4',
    lado: 'w',
    nivel: 'Iniciante',
    resumo:
      'O clássico de 1.d4. O "gambito" não é bem um gambito: se as pretas pegam c4, as brancas recuperam o peão com facilidade e ficam com um ótimo centro.',
    ideias: [
      'c4 ataca d5, o pilar central das pretas, por um flanco.',
      'Se as pretas tomam em c4 e tentam segurar o peão, quase sempre se dão mal.',
      'Contra o Gambito Recusado, o bispo vai para g5 cravar o cavalo de f6.',
      'Plano típico: ataque de minoria na ala da dama (b4–b5) ou ruptura central e4.',
    ],
    linhas: [
      {
        nome: 'Gambito da Dama Recusado (Ortodoxa)',
        lances:
          'd4 {Ocupa o centro; o peão já é defendido pela dama.} ' +
          'd5 {As pretas bloqueiam.} ' +
          'c4 {O Gambito da Dama: ataca d5 com um peão de flanco.} ' +
          'e6 {Recusado: d5 fica bem defendido, mas o bispo de c8 fica preso.} ' +
          'Nc3 {Mais pressão sobre d5.} ' +
          'Nf6 {Defende d5.} ' +
          'Bg5 {Crava o cavalo que defende d5.} ' +
          'Be7 {Desfaz a cravada.} ' +
          'e3 {Abre o bispo de f1.} ' +
          'O-O {Rei seguro.} ' +
          'Nf3 {Desenvolve.} ' +
          'Nbd7 {Prepara ...c6 e ...dxc4.} ' +
          'Rc1 {Torre na coluna c, que vai abrir.} ' +
          'c6 {Sólido.} ' +
          'Bd3 {O bispo mira h7.} ' +
          'dxc4 {Agora sim: o bispo das brancas gasta um tempo para recapturar.} ' +
          'Bxc4 {Recaptura.} ' +
          'Nd5 {A manobra libertadora de Capablanca: trocar peças para aliviar o espaço.} ' +
          'Bxe7 Qxe7 O-O Nxc3 Rxc3 ' +
          'e5 {As pretas finalmente libertam o bispo de c8. Igualdade quase total.}',
      },
      {
        nome: 'Gambito da Dama Aceito',
        lances:
          'd4 d5 c4 ' +
          'dxc4 {Aceito! O plano não é ficar com o peão, e sim jogar ...e6 e ...c5 livremente.} ' +
          'Nf3 {Impede ...e5 e desenvolve.} ' +
          'Nf6 {Desenvolve.} ' +
          'e3 {Abre o bispo para recuperar c4.} ' +
          'e6 {Libera o bispo de f8.} ' +
          'Bxc4 {Peão recuperado com desenvolvimento.} ' +
          'c5 {O golpe típico contra d4.} ' +
          'O-O {Rei seguro.} ' +
          'a6 {Prepara ...b5 com ganho de tempo sobre o bispo. Jogo equilibrado.}',
      },
      {
        nome: 'Armadilha: tentar segurar o peão de c4',
        tipo: 'armadilha',
        lances:
          'd4 d5 c4 dxc4 ' +
          'e3 {Abre a diagonal do bispo para recuperar c4.} ' +
          'b5? {Tenta segurar o peão a mais. Ganancioso.} ' +
          'a4 {Ataca a base da corrente.} ' +
          'c6 {Reforça b5.} ' +
          'axb5 ' +
          'cxb5?! {Natural, mas abre a grande diagonal a8–h1.} ' +
          'Qf3! {Garfo: a dama ataca a torre de a8 pela grande diagonal, e o cavalo de b8 não pode ajudar. As brancas ganham material.}',
      },
    ],
  },

  {
    id: 'londres',
    nome: 'Sistema Londres',
    grupo: 'brancas-d4',
    lado: 'w',
    nivel: 'Iniciante',
    resumo:
      'Um sistema: as brancas montam quase sempre a mesma estrutura (d4, Bf4, e3, Cf3, c3, Cbd2, Bd3), não importa o que as pretas façam. Pouca teoria, muito plano.',
    ideias: [
      'O bispo sai para f4 ANTES de e3, para não ficar preso atrás dos peões.',
      'A pirâmide c3–d4–e3 é muito sólida.',
      'Se as pretas jogam ...Bd6 para trocar, recue para g3: se ...Bxg3, hxg3 abre a coluna h.',
      'Cuidado com ...Db6 atacando b2: tenha uma resposta pronta (Db3 ou Dc1).',
    ],
    linhas: [
      {
        nome: 'Contra ...d5 e ...c5',
        lances:
          'd4 d5 ' +
          'Bf4 {A marca do Londres: bispo fora antes de e3.} ' +
          'Nf6 e3 e6 Nf3 ' +
          'c5 {As pretas atacam d4, como na Defesa Francesa.} ' +
          'c3 {A pirâmide c3–d4–e3.} ' +
          'Nc6 Nbd2 ' +
          'Bd6 {As pretas oferecem a troca do bom bispo das brancas.} ' +
          'Bg3 {Mantém o bispo. Se ...Bxg3, hxg3 e a torre de h1 ganha vida.} ' +
          'O-O ' +
          'Bd3 {Bispo mirando h7. Plano: Ce5, f4 e às vezes um ataque na ala do rei.}',
      },
      {
        nome: 'Contra a estrutura Índia do Rei',
        lances:
          'd4 Nf6 Bf4 ' +
          'g6 {As pretas preparam o fianqueto.} ' +
          'e3 Bg7 Nf3 O-O ' +
          'Be2 {Desenvolvimento modesto e sólido.} ' +
          'd6 ' +
          'h3 {Dá ao bispo a casa h2, a salvo de ...Ch5.} ' +
          'c5 ' +
          'c3 {Mantém a estrutura. Plano: O-O, Cbd2 e a4 ou e4 no momento certo.}',
      },
      {
        nome: 'Cuidado com ...Db6',
        lances:
          'd4 d5 Bf4 ' +
          'c5 {Ataque imediato.} ' +
          'e3 Nc6 c3 ' +
          'Qb6 {A dama ataca b2, que o bispo de f4 deixou de defender.} ' +
          'Qb3 {A resposta mais simples: oferece a troca e defende b2. Se ...Dxb3, axb3 abre a coluna a para a torre.}',
      },
    ],
  },

  {
    id: 'siciliana',
    nome: 'Defesa Siciliana',
    grupo: 'pretas-e4',
    lado: 'b',
    nivel: 'Intermediário',
    resumo:
      'A resposta mais popular e combativa contra 1.e4. As pretas criam um jogo desequilibrado: trocam um peão de flanco (c5) pelo peão central d4 das brancas.',
    ideias: [
      'Depois de ...cxd4, as pretas ficam com a coluna c semiaberta para atacar.',
      'As brancas costumam ter mais espaço e chances de ataque na ala do rei.',
      'Na Najdorf, ...a6 é flexível: controla b5 e prepara ...e5 ou ...b5.',
      'No Dragão, o bispo em g7 é a alma da posição: proteja-o.',
    ],
    linhas: [
      {
        nome: 'Najdorf (Ataque Inglês)',
        lances:
          'e4 ' +
          'c5 {A Siciliana: controla d4 com um peão de flanco.} ' +
          'Nf3 ' +
          'd6 {Prepara ...Cf6 sem permitir e5.} ' +
          'd4 {As brancas abrem o centro.} ' +
          'cxd4 {Troca de peão de flanco por peão central: a base da Siciliana.} ' +
          'Nxd4 ' +
          'Nf6 {Ataca e4 e força Cc3.} ' +
          'Nc3 ' +
          'a6 {A Najdorf, favorita de Fischer e Kasparov. Tira b5 das peças brancas.} ' +
          'Be3 {Ataque Inglês: Be3, f3, Dd2 e roque grande.} ' +
          'e5 {Ganha espaço e expulsa o cavalo. A casa d5 enfraquece, mas as peças pretas ganham vida.} ' +
          'Nb3 ' +
          'Be6 {Controla d5, a casa-chave.} ' +
          'f3 {Protege e4 e prepara g4–g5.} ' +
          'Be7 ' +
          'Qd2 O-O ' +
          'O-O-O {Roques opostos: as brancas atacam na ala do rei.} ' +
          'Nbd7 {As pretas preparam ...b5–b4 contra o rei branco. Corrida de ataques!}',
      },
      {
        nome: 'Dragão (Ataque Iugoslavo)',
        lances:
          'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 ' +
          'g6 {O Dragão: o fianqueto lembra o desenho de um dragão.} ' +
          'Be3 Bg7 ' +
          'f3 {Ataque Iugoslavo, a resposta mais agressiva.} ' +
          'O-O ' +
          'Qd2 {Prepara Bh6 para trocar o "dragão" de g7.} ' +
          'Nc6 ' +
          'Bc4 {Impede ...d5.} ' +
          'Bd7 ' +
          'O-O-O {Roques opostos: as brancas jogam h4–h5; as pretas, na coluna c com ...Tc8, ...Ce5 e ...Cc4.}',
      },
      {
        nome: 'Contra a Alapin (2.c3)',
        lances:
          'e4 c5 ' +
          'c3 {Alapin: as brancas querem d4 e recapturar com peão.} ' +
          'd5 {Ataque direto: com o peão em c3, as brancas não têm Cc3 para incomodar a dama.} ' +
          'exd5 Qxd5 ' +
          'd4 Nf6 Nf3 ' +
          'e6 {Estrutura sólida. Se as brancas trocarem em c5, a dama recaptura.} ' +
          'Be2 Be7 O-O ' +
          'O-O {Jogo equilibrado. Plano: ...Cc6, ...cxd4 e ...Td8 contra o peão d4.}',
      },
      {
        nome: 'Contra o Gambito Smith-Morra',
        lances:
          'e4 c5 ' +
          'd4 cxd4 ' +
          'c3 {Smith-Morra: as brancas oferecem um peão por desenvolvimento rápido.} ' +
          'dxc3 {Aceitar é o mais testado.} ' +
          'Nxc3 Nc6 Nf3 ' +
          'd6 {Controla e5 e c5 com calma.} ' +
          'Bc4 ' +
          'e6 {Fecha a diagonal do bispo que mira f7.} ' +
          'O-O Nf6 ' +
          'Qe2 Be7 ' +
          'Rd1 {Torre na coluna d aberta, pressionando d6.} ' +
          'e5 {Fecha o centro e neutraliza o ataque. Com um peão a mais, as pretas estão bem.}',
      },
      {
        nome: 'Armadilha Siberiana (no Smith-Morra)',
        tipo: 'armadilha',
        lances:
          'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 ' +
          'e6 Bc4 ' +
          'Qc7 {A dama vigia c4 e a diagonal b8–h2.} ' +
          'O-O Nf6 ' +
          'Qe2 ' +
          'Ng4 {Mira h2, junto com a dama.} ' +
          'h3?? {Parece expulsar o cavalo...} ' +
          'Nd4! {...mas agora o cavalo de f3 é desviado. Se 10.Cxd4, Dh2# é mate! As brancas perdem a dama ou levam mate.}',
      },
    ],
  },

  {
    id: 'francesa',
    nome: 'Defesa Francesa',
    grupo: 'pretas-e4',
    lado: 'b',
    nivel: 'Intermediário',
    resumo:
      'Sólida e estratégica. As pretas aceitam um pouco menos de espaço, mas contra-atacam a cadeia de peões das brancas com ...c5 e ...f6.',
    ideias: [
      'Depois de e5, ataque a base da cadeia de peões (d4) com ...c5.',
      'A ruptura ...f6 ataca a ponta da cadeia (e5).',
      'O bispo de c8 é o "bispo ruim" da Francesa: troque-o ou ative-o com ...b6/...Ba6.',
      'A dama costuma ir para b6, pressionando d4 e b2.',
    ],
    linhas: [
      {
        nome: 'Variante do Avanço',
        lances:
          'e4 ' +
          'e6 {A Francesa: prepara ...d5 com apoio.} ' +
          'd4 d5 ' +
          'e5 {Avanço: as brancas ganham espaço e travam o centro.} ' +
          'c5 {Ataque imediato à base da cadeia, d4.} ' +
          'c3 {Reforça d4.} ' +
          'Nc6 {Mais pressão em d4.} ' +
          'Nf3 ' +
          'Qb6 {A dama ataca d4 e b2 ao mesmo tempo.} ' +
          'a3 {Prepara b4 para ganhar espaço.} ' +
          'c4 {Fecha a ala da dama antes de b4. Plano: ...Ca5–b3 e ...Bd7.} ' +
          'Nbd2 ' +
          'Na5 {O cavalo vai para b3, aproveitando a casa fraca.}',
      },
      {
        nome: 'Variante das Trocas',
        lances:
          'e4 e6 d4 d5 ' +
          'exd5 {As brancas simplificam.} ' +
          'exd5 {Estrutura simétrica: o bispo de c8 fica livre!} ' +
          'Bd3 Nc6 ' +
          'c3 Bd6 ' +
          'Nf3 Nge7 {O cavalo vai para e7 para não ser cravado por Bg5.} ' +
          'O-O ' +
          'Bg4 {Bispo ativo. As pretas igualaram com facilidade.}',
      },
      {
        nome: 'Winawer: peão envenenado',
        lances:
          'e4 e6 d4 d5 Nc3 ' +
          'Bb4 {A Winawer: crava o cavalo que defende e4.} ' +
          'e5 c5 ' +
          'a3 {Pergunta ao bispo.} ' +
          'Bxc3+ {As pretas entregam o par de bispos para dobrar os peões brancos.} ' +
          'bxc3 Ne7 ' +
          'Qg4 {Ataca g7, enfraquecido sem o bispo de f8.} ' +
          'Qc7 {Contra-ataque: as pretas deixam g7 cair em troca de jogo no centro e em c3.} ' +
          'Qxg7 Rg8 Qxh7 ' +
          'cxd4 {O centro branco começa a ruir.} ' +
          'Ne2 Nbc6 ' +
          'f4 {Posição extremamente afiada: as brancas têm um peão passado em h; as pretas, ataque no centro.}',
      },
      {
        nome: 'Clássica: 3.Cc3 Cf6 4.Bg5',
        lances:
          'e4 e6 d4 d5 Nc3 ' +
          'Nf6 {Ataca e4 de novo.} ' +
          'Bg5 {Crava o cavalo.} ' +
          'Be7 {Desfaz a cravada.} ' +
          'e5 Nfd7 ' +
          'Bxe7 Qxe7 ' +
          'f4 {Reforça e5.} ' +
          'O-O Nf3 ' +
          'c5 {O golpe típico na base da cadeia. Plano: ...Cc6, ...cxd4 e ...f6.}',
      },
      {
        nome: 'Tarrasch: 3.Cd2 c5',
        lances:
          'e4 e6 d4 d5 ' +
          'Nd2 {Tarrasch: o cavalo não fica cravado por ...Bb4.} ' +
          'c5 {Ataque ao centro.} ' +
          'exd5 Qxd5 ' +
          'Ngf3 cxd4 ' +
          'Bc4 {Desenvolvimento com ganho de tempo sobre a dama.} ' +
          'Qd6 ' +
          'O-O Nf6 ' +
          'Nb3 Nc6 ' +
          'Nbxd4 Nxd4 Nxd4 ' +
          'a6 {Posição aberta e equilibrada: as pretas têm a estrutura sólida, as brancas um pouco mais de atividade.}',
      },
    ],
  },

  {
    id: 'caro-kann',
    nome: 'Defesa Caro-Kann',
    grupo: 'pretas-e4',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'Uma das defesas mais sólidas contra 1.e4. Parecida com a Francesa, mas o bispo de c8 sai antes de ...e6, então não fica preso.',
    ideias: [
      '...c6 prepara ...d5 com apoio, sem bloquear o bispo de c8.',
      'O bispo sai para f5 (ou g4) antes de ...e6.',
      'Estrutura muito sólida: poucas fraquezas, finais confortáveis.',
      'Contra o Avanço, as pretas atacam com ...c5 depois de desenvolver o bispo.',
    ],
    linhas: [
      {
        nome: 'Clássica: 4...Bf5',
        lances:
          'e4 ' +
          'c6 {A Caro-Kann: prepara ...d5.} ' +
          'd4 d5 ' +
          'Nc3 dxe4 Nxe4 ' +
          'Bf5 {O bispo sai antes de ...e6, atacando o cavalo.} ' +
          'Ng3 Bg6 ' +
          'h4 {Ameaça h5, prendendo o bispo.} ' +
          'h6 {Dá uma casa de fuga ao bispo.} ' +
          'Nf3 Nd7 ' +
          'h5 Bh7 ' +
          'Bd3 {Oferece a troca do bispo bom das pretas.} ' +
          'Bxd3 Qxd3 ' +
          'e6 ' +
          'Bd2 Ngf6 ' +
          'O-O-O ' +
          'Be7 {Estrutura sólida. As pretas rocam pequeno e jogam ...c5 no momento certo.}',
      },
      {
        nome: 'Variante do Avanço',
        lances:
          'e4 c6 d4 d5 ' +
          'e5 {Avanço: ganha espaço.} ' +
          'Bf5 {O bispo sai ANTES de ...e6: essa é a vantagem da Caro-Kann sobre a Francesa.} ' +
          'Nf3 e6 ' +
          'Be2 ' +
          'Nd7 {Prepara ...Ce7 e ...c5.} ' +
          'O-O Ne7 ' +
          'Nbd2 ' +
          'h6 {Abre uma casa de fuga para o bispo (h7) e evita Ch4 incômodo. Plano: ...c5.}',
      },
      {
        nome: 'Variante das Trocas',
        lances:
          'e4 c6 d4 d5 ' +
          'exd5 cxd5 ' +
          'Bd3 Nc6 ' +
          'c3 Nf6 ' +
          'Bf4 ' +
          'Bg4 {Bispo ativo fora da cadeia de peões.} ' +
          'Qb3 {Ataca b7.} ' +
          'Qd7 {Defende b7 com tranquilidade.} ' +
          'Nd2 ' +
          'e6 {Estrutura sólida. Plano: ...Bd6, ...O-O e ataque de minoria com ...b5–b4.}',
      },
      {
        nome: 'Ataque Panov',
        lances:
          'e4 c6 d4 d5 exd5 cxd5 ' +
          'c4 {Panov: as brancas aceitam um peão isolado em troca de jogo ativo.} ' +
          'Nf6 Nc3 e6 ' +
          'Nf3 Be7 ' +
          'cxd5 Nxd5 ' +
          'Bd3 Nc6 ' +
          'O-O ' +
          'O-O {Posição de peão isolado (d4): as pretas querem trocar peças e bloquear em d5.}',
      },
    ],
  },

  {
    id: 'escandinava',
    nome: 'Defesa Escandinava',
    grupo: 'pretas-e4',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'Direto ao ponto: as pretas atacam e4 no primeiro lance. A dama sai cedo, mas encontra uma casa segura. Ótima para quem quer pouca teoria.',
    ideias: [
      'A dama sai cedo, mas vai para a5 ou d6, de onde é difícil atacá-la.',
      'Estrutura parecida com a Caro-Kann: ...c6, ...e6 e bispo em f5 ou g4.',
      'Evite perder mais tempo com a dama depois de ela se instalar.',
    ],
    linhas: [
      {
        nome: '3...Da5 (principal)',
        lances:
          'e4 ' +
          'd5 {A Escandinava: ataque imediato a e4.} ' +
          'exd5 Qxd5 ' +
          'Nc3 {Desenvolve com ganho de tempo sobre a dama.} ' +
          'Qa5 {A dama sai da linha e crava o cavalo de c3.} ' +
          'd4 Nf6 Nf3 ' +
          'Bf5 {O bispo sai antes de ...e6.} ' +
          'Bc4 e6 ' +
          'Bd2 ' +
          'c6 {A dama ganha a casa c7 se precisar recuar. Estrutura sólida e fácil de jogar.}',
      },
      {
        nome: '3...Dd6 (moderna)',
        lances:
          'e4 d5 exd5 Qxd5 Nc3 ' +
          'Qd6 {Dama no centro, longe de ataques de Cb5 e de Bf4 por enquanto.} ' +
          'd4 Nf6 Nf3 ' +
          'a6 {Tira b5 das peças brancas (evita Cb5 atacando a dama).} ' +
          'g3 ' +
          'Bg4 {Bispo ativo.} ' +
          'Bg2 ' +
          'Nc6 {Pressão em d4. Plano: ...O-O-O em algumas linhas.}',
      },
    ],
  },

  {
    id: 'petrov',
    nome: 'Defesa Petrov',
    grupo: 'pretas-e4',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'Contra 1.e4 e5 2.Cf3, as pretas contra-atacam e4 em vez de defender e5. Extremamente sólida; é preciso conhecer uma armadilha importante.',
    ideias: [
      'Depois de 3.Cxe5, NÃO capture e4 de imediato: primeiro 3...d6!',
      'A estrutura simétrica dá poucas chances de ataque ao adversário.',
      'Muito usada em alto nível como arma de empate com as pretas.',
    ],
    linhas: [
      {
        nome: 'Linha principal',
        lances:
          'e4 e5 Nf3 ' +
          'Nf6 {A Petrov: contra-ataque em e4.} ' +
          'Nxe5 ' +
          'd6 {O mais importante: expulsar o cavalo ANTES de pegar e4.} ' +
          'Nf3 ' +
          'Nxe4 {Agora sim o peão é recuperado.} ' +
          'd4 d5 ' +
          'Bd3 Nc6 ' +
          'O-O Be7 ' +
          'c4 ' +
          'Nb4 {Ataca o bispo de d3.} ' +
          'Be2 ' +
          'O-O {Posição sólida e equilibrada.}',
      },
      {
        nome: 'Armadilha: 3...Cxe4? 4.De2',
        tipo: 'armadilha',
        ladoArmadilha: 'w',
        lances:
          'e4 e5 Nf3 Nf6 Nxe5 ' +
          'Nxe4? {Copiar o adversário não funciona aqui.} ' +
          'Qe2 {A dama ataca o cavalo de e4, cravado na coluna e.} ' +
          'Nf6?? {Recua o cavalo, mas abre a coluna e...} ' +
          'Nc6+ {Ataque descoberto! A dama dá xeque em e8 e o cavalo ataca a dama de d8. As brancas ganham a dama.}',
      },
    ],
  },

  {
    id: 'eslava',
    nome: 'Defesa Eslava',
    grupo: 'pretas-d4',
    lado: 'b',
    nivel: 'Intermediário',
    resumo:
      'Contra o Gambito da Dama, as pretas defendem d5 com ...c6, sem trancar o bispo de c8. Sólida como a Caro-Kann, sua "prima" contra 1.e4.',
    ideias: [
      '...c6 defende d5 e mantém aberta a diagonal do bispo de c8.',
      'O bispo sai para f5 ou g4 antes de ...e6.',
      'Se as pretas tomam em c4, as brancas costumam jogar a4 para impedir ...b5.',
    ],
    linhas: [
      {
        nome: 'Eslava principal: 4...dxc4 5.a4 Bf5',
        lances:
          'd4 d5 c4 ' +
          'c6 {A Eslava: defende d5 sem bloquear o bispo.} ' +
          'Nf3 Nf6 Nc3 ' +
          'dxc4 {Agora que Cc3 foi jogado, as pretas tomam o peão.} ' +
          'a4 {Impede ...b5, que seguraria o peão.} ' +
          'Bf5 {O bispo sai antes de ...e6.} ' +
          'e3 e6 ' +
          'Bxc4 {As brancas recuperam o peão.} ' +
          'Bb4 {Crava o cavalo e controla e4.} ' +
          'O-O Nbd7 ' +
          'Qe2 ' +
          'O-O {Posição sólida; as brancas querem e4, as pretas lutam para impedi-lo.}',
      },
      {
        nome: 'Contra a Variante das Trocas',
        lances:
          'd4 d5 c4 c6 ' +
          'cxd5 {Troca: estrutura simétrica.} ' +
          'cxd5 ' +
          'Nc3 Nf6 ' +
          'Bf4 Nc6 ' +
          'e3 ' +
          'Bf5 {Simetria total: as pretas igualaram. Cuidado com Db3 atacando b7.}',
      },
    ],
  },

  {
    id: 'india-rei',
    nome: 'Índia do Rei',
    grupo: 'pretas-d4',
    lado: 'b',
    nivel: 'Avançado',
    resumo:
      'As pretas deixam as brancas montarem um grande centro para depois atacá-lo. Leva a partidas ricas e agressivas, com ataques em alas opostas.',
    ideias: [
      'O bispo em g7 é a peça mais importante: mira o centro e a grande diagonal.',
      'A ruptura ...e5 (ou ...c5) desafia o centro branco.',
      'Com o centro fechado (d5), as pretas atacam com ...f5 na ala do rei; as brancas, com c5 na ala da dama.',
    ],
    linhas: [
      {
        nome: 'Clássica (Mar del Plata)',
        lances:
          'd4 Nf6 c4 ' +
          'g6 {Prepara o fianqueto.} ' +
          'Nc3 Bg7 ' +
          'e4 {As brancas montam o grande centro.} ' +
          'd6 {Controla e5 e prepara ...e5.} ' +
          'Nf3 O-O ' +
          'Be2 ' +
          'e5 {A ruptura clássica.} ' +
          'O-O Nc6 ' +
          'd5 {Fecha o centro, ganhando tempo sobre o cavalo.} ' +
          'Ne7 {O cavalo vai para a ala do rei, onde será útil no ataque.} ' +
          'Ne1 {Prepara f3 e c5.} ' +
          'Nd7 {Abre caminho para ...f5.} ' +
          'Nd3 ' +
          'f5 {Ataque na ala do rei! As brancas responderão na ala da dama. Corrida de ataques.}',
      },
      {
        nome: 'Contra a Sämisch (5.f3)',
        lances:
          'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 ' +
          'f3 {Sämisch: reforça e4 e prepara Be3, Dd2 e às vezes g4.} ' +
          'O-O Be3 ' +
          'e5 {Ruptura central.} ' +
          'd5 ' +
          'Nh5 {Prepara ...f5.} ' +
          'Qd2 ' +
          'f5 {Contra-ataque imediato no centro e na ala do rei.}',
      },
    ],
  },

  {
    id: 'nimzo',
    nome: 'Nimzo-Índia',
    grupo: 'pretas-d4',
    lado: 'b',
    nivel: 'Avançado',
    resumo:
      'Uma das defesas mais respeitadas contra 1.d4. O bispo em b4 crava o cavalo e luta pela casa e4. As pretas aceitam dar o par de bispos em troca de estrutura.',
    ideias: [
      'O bispo em b4 crava o cavalo de c3 e impede e4.',
      'Trocar em c3 deixa as brancas com peões dobrados: alvo de longo prazo.',
      'As pretas jogam com ...c5, ...d5 ou ...b6/...Bb7 controlando as casas brancas.',
    ],
    linhas: [
      {
        nome: 'Rubinstein (4.e3)',
        lances:
          'd4 Nf6 c4 e6 Nc3 ' +
          'Bb4 {A Nimzo-Índia: crava o cavalo e controla e4.} ' +
          'e3 {Rubinstein: desenvolvimento sólido.} ' +
          'O-O Bd3 d5 Nf3 ' +
          'c5 {Pressão no centro.} ' +
          'O-O Nc6 ' +
          'a3 {Pergunta ao bispo.} ' +
          'Bxc3 bxc3 ' +
          'dxc4 Bxc4 ' +
          'Qc7 {Prepara ...e5. Posição clássica: centro branco contra peças pretas ágeis.}',
      },
      {
        nome: 'Clássica (4.Dc2)',
        lances:
          'd4 Nf6 c4 e6 Nc3 Bb4 ' +
          'Qc2 {Recaptura em c3 com a dama, sem peões dobrados.} ' +
          'O-O a3 ' +
          'Bxc3+ Qxc3 ' +
          'b6 {Fianqueto para controlar e4.} ' +
          'Bg5 Bb7 ' +
          'f3 ' +
          'h6 Bh4 ' +
          'd5 {Luta direta pelo centro. As pretas têm desenvolvimento, as brancas o par de bispos.}',
      },
    ],
  },

  // ------------------------------------------------------------ armadilhas
  {
    id: 'mate-pastor',
    nome: 'Mate do Pastor (e como se defender)',
    grupo: 'armadilhas',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'O mate mais famoso dos iniciantes: dama e bispo atacam f7. Saber se defender é essencial, e a defesa ainda deixa a dama branca fora de lugar.',
    ideias: [
      'O alvo é f7, defendido só pelo rei.',
      '...g6 ou ...De7 defendem; o cavalo em f6 só pode vir depois de bloquear a dama.',
      'Depois de se defender, as pretas ganham tempo atacando a dama exposta.',
    ],
    linhas: [
      {
        nome: 'O mate (se as pretas não se defendem)',
        tipo: 'armadilha',
        ladoArmadilha: 'w',
        lances:
          'e4 e5 ' +
          'Bc4 {O bispo mira f7.} ' +
          'Nc6 ' +
          'Qh5 {A dama também mira f7 (e ataca e5).} ' +
          'Nf6?? {Desenvolve e ataca a dama... mas esquece f7.} ' +
          'Qxf7# {Mate do Pastor! Dama protegida pelo bispo, rei sem saída.}',
      },
      {
        nome: 'A defesa correta',
        lances:
          'e4 e5 Bc4 Nc6 ' +
          'Qh5 {Ameaça Dxf7#.} ' +
          'g6! {Bloqueia a dama.} ' +
          'Qf3 {Insiste em f7.} ' +
          'Nf6 {Agora sim: o cavalo defende f7 bloqueando a dama.} ' +
          'Ne2 ' +
          'Bg7 {Desenvolvimento natural. As pretas estão ótimas e vão ganhar tempo com ...Cd4 ou ...d6.}',
      },
    ],
  },
  {
    id: 'mate-legal',
    nome: 'Mate de Légal',
    grupo: 'armadilhas',
    lado: 'w',
    nivel: 'Iniciante',
    resumo:
      'Uma armadilha de 1750: as brancas "entregam" a dama para dar mate com peças menores. Ensina que cravadas nem sempre são absolutas.',
    ideias: [
      'O cavalo de f3 está cravado só contra a DAMA, não contra o rei: ele pode se mover.',
      'Bispo e cavalos coordenados dão mate no rei preso no centro.',
    ],
    linhas: [
      {
        nome: 'A armadilha',
        tipo: 'armadilha',
        lances:
          'e4 e5 Nf3 d6 Bc4 ' +
          'Bg4 {Crava o cavalo contra a dama.} ' +
          'Nc3 ' +
          'g6? {Lance lento. As pretas acham que o cavalo não pode se mexer.} ' +
          'Nxe5! {A cravada é relativa: o cavalo sai e oferece a dama.} ' +
          'Bxd1?? {Ganancioso: pegar a dama perde.} ' +
          'Bxf7+ {Xeque, e o rei só tem uma casa.} ' +
          'Ke7 ' +
          'Nd5# {Mate de Légal: bispo e dois cavalos contra o rei sem saída.}',
      },
    ],
  },
  {
    id: 'blackburne',
    nome: 'Armadilha Blackburne-Shilling',
    grupo: 'armadilhas',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'Um "gambito" duvidoso, mas com uma armadilha cruel: se as brancas pegarem o peão de e5 de forma gananciosa, levam mate rápido.',
    ideias: [
      'O cavalo em d4 parece ignorar e5, mas prepara ...Dg5 atacando g2.',
      'Contra jogadores atentos, a armadilha não funciona (4.Cxd4 ou 4.O-O são bons para as brancas).',
    ],
    linhas: [
      {
        nome: 'A armadilha',
        tipo: 'armadilha',
        lances:
          'e4 e5 Nf3 Nc6 Bc4 ' +
          'Nd4?! {Deixa e5 sem defesa, de propósito. Objetivamente é um lance ruim.} ' +
          'Nxe5? {Parece ganhar um peão e atacar f7.} ' +
          'Qg5! {Ataca o cavalo de e5 e o peão g2.} ' +
          'Nxf7?? {Garfo em dama e torre... mas é tarde demais.} ' +
          'Qxg2 {Ataca a torre de h1.} ' +
          'Rf1 ' +
          'Qxe4+ {Xeque, e o rei não tem boas casas.} ' +
          'Be2 ' +
          'Nf3# {Mate sufocado! O rei está cercado pelas próprias peças.}',
      },
    ],
  },
  {
    id: 'englund',
    nome: 'Armadilha do Gambito Englund',
    grupo: 'armadilhas',
    lado: 'b',
    nivel: 'Iniciante',
    resumo:
      'Contra 1.d4, o Gambito Englund (1...e5) é duvidoso, mas esconde uma armadilha famosa que termina em mate em c1.',
    ideias: [
      'A dama preta ataca b2 e depois a torre de a1.',
      'O bispo das brancas em c3 parece defender tudo, mas pode ser trocado.',
    ],
    linhas: [
      {
        nome: 'A armadilha',
        tipo: 'armadilha',
        lances:
          'd4 ' +
          'e5?! {Gambito Englund: entrega um peão sem compensação clara.} ' +
          'dxe5 Nc6 Nf3 ' +
          'Qe7 {Ataca e5 de novo.} ' +
          'Bf4? {Defende e5, mas tira o bispo da defesa de b2.} ' +
          'Qb4+ {Xeque que também ataca o peão de b2.} ' +
          'Bd2 ' +
          'Qxb2 {Ataca a torre de a1.} ' +
          'Bc3?? {Parece defender tudo...} ' +
          'Bb4! {Crava o bispo de c3.} ' +
          'Qd2 ' +
          'Bxc3 Qxc3 ' +
          'Qc1# {Mate! O rei branco não tem como escapar.}',
      },
    ],
  },
  {
    id: 'elefante',
    nome: 'Armadilha do Elefante',
    grupo: 'armadilhas',
    lado: 'b',
    nivel: 'Intermediário',
    resumo:
      'No Gambito da Dama Recusado, o cavalo de f6 parece cravado. Se as brancas tentam ganhar o peão de d5, perdem uma peça.',
    ideias: [
      'O cavalo de f6 está cravado só contra a DAMA: ele pode se mover se houver algo melhor.',
      'Depois de ...Cxd5, se Bxd8, o xeque ...Bb4+ recupera a dama com lucro.',
    ],
    linhas: [
      {
        nome: 'A armadilha',
        tipo: 'armadilha',
        lances:
          'd4 d5 c4 e6 Nc3 Nf6 Bg5 ' +
          'Nbd7 {Parece deixar d5 fraco...} ' +
          'cxd5 exd5 ' +
          'Nxd5?? {As brancas acham que o cavalo de f6 está cravado.} ' +
          'Nxd5! {Entrega a dama!} ' +
          'Bxd8 ' +
          'Bb4+ {Xeque intermediário.} ' +
          'Qd2 ' +
          'Bxd2+ ' +
          'Kxd2 ' +
          'Kxd8 {Saldo: as pretas ganharam uma peça (um cavalo).}',
      },
    ],
  },
  {
    id: 'mate-louco',
    nome: 'Mate do Louco',
    grupo: 'armadilhas',
    lado: 'b',
    nivel: 'Iniciante',
    resumo: 'O mate mais rápido possível: em apenas dois lances. Mostra o perigo de enfraquecer a diagonal do rei.',
    ideias: ['f3 e g4 abrem a diagonal e1–h4.', 'Nunca enfraqueça os peões na frente do rei sem motivo.'],
    linhas: [
      {
        nome: 'O mate',
        tipo: 'armadilha',
        lances:
          'f3? {Enfraquece a diagonal do rei.} ' +
          'e5 {Abre a diagonal da dama.} ' +
          'g4?? {Agora a diagonal e1–h4 está escancarada.} ' +
          'Qh4# {Mate do Louco!}',
      },
    ],
  },
];

export const PRINCIPIOS = [
  ['Controle o centro', 'Os peões de e e d (e as peças que miram e4, d4, e5, d5) dão espaço e mobilidade.'],
  ['Desenvolva as peças', 'Cavalos e bispos para fora nos primeiros lances. Cada lance deve colocar uma peça nova em jogo.'],
  ['Roque cedo', 'O rei fica seguro e a torre vai para o centro.'],
  ['Não mexa a mesma peça duas vezes', 'A não ser que haja um bom motivo (ganhar material, fugir de ataque).'],
  ['Não tire a dama cedo demais', 'Ela vira alvo e você perde tempo fugindo de ataques.'],
  ['Conecte as torres', 'Quando as peças menores saírem e o rei rocar, as torres se protegem e vão para colunas abertas.'],
  ['Pense no f7 / f2', 'É a casa mais fraca no começo: defendida apenas pelo rei.'],
  ['Pergunte sempre: o que meu adversário ameaça?', 'Antes de cada lance, olhe o último lance dele.'],
];
