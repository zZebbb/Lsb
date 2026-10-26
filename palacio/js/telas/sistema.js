// Sistema mnemônico: a tabela, a sua lista de palavras (0–9 e 00–99) e os treinos
// (lembrar a palavra, achar o número, decodificar palavras e criar palavras novas).

import { h, icone, som, config, registrarResultado, recorde, sortear, embaralhar, animar } from '../util.js';
import { pilulas, confete, numeroDestaque, formatarDecimal, media } from '../componentes.js';
import { tecladoNumerico, campoDigitos } from '../teclado.js';
import { TABELA, PALAVRAS_PADRAO } from '../../dados/sistema.js';
import { PALAVRAS } from '../../dados/palavras.js';
import {
  PARES,
  UNIDADES,
  palavraDoPar,
  definirPalavra,
  restaurarPalavras,
  ehPersonalizada,
  paresRapidos,
  registrarTentativa,
  sortearPonderado,
  decompor,
  numerosDaPalavra,
  numeroPrincipal,
  palavraCodifica,
  semAmbiguidade,
} from '../sistema.js';

const CORES_DIGITOS = ['coral', 'lima', 'violeta', 'ciano', 'sol', 'rosa', 'coral', 'lima', 'violeta', 'ciano'];

const TREINOS = {
  lembrar: {
    titulo: 'Lembrar a palavra',
    texto: 'Aparece um número de 00 a 99. Lembre a sua palavra para ele e confira.',
    icone: 'relogio',
    rodadas: 20,
  },
  numero: {
    titulo: 'Qual é o número?',
    texto: 'Aparece uma das suas palavras. Digite o número que ela representa, o mais rápido que puder.',
    icone: 'numeros',
    rodadas: 20,
  },
  decodificar: {
    titulo: 'Decodificar',
    texto: 'Palavras quaisquer escondem números. Descubra qual, só pelas consoantes.',
    icone: 'olho',
    rodadas: 15,
  },
  criar: {
    titulo: 'Crie uma palavra',
    texto: 'Invente uma palavra para o número. O app confere se as consoantes batem.',
    icone: 'lapis',
    rodadas: 10,
  },
};

// Faixas de números para treinar aos poucos.
const FAIXAS = [
  ['todos', 'Todos'],
  ['0', '00–24'],
  ['1', '25–49'],
  ['2', '50–74'],
  ['3', '75–99'],
];

function paresDaFaixa() {
  const f = config().faixaSistema;
  if (f === undefined || f === 'todos') return PARES;
  const ini = Number(f) * 25;
  return PARES.slice(ini, ini + 25);
}

// Palavra com cada letra e o número embaixo (vogais ficam apagadas).
export function decomposicao(palavra) {
  return h(
    'div',
    { class: 'decomposicao', 'aria-label': `${palavra}: ${numerosDaPalavra(palavra).join(' ou ')}` },
    ...decompor(palavra).map(({ texto, valores }) =>
      h(
        'span',
        { class: valores ? 'letra conta' : 'letra' },
        h('b', {}, texto.toUpperCase()),
        h('small', {}, valores ? valores.join('/') : '·'),
      ),
    ),
  );
}

// ------------------------------------------------------------ tela principal

export function telaSistema(raiz, _params, app) {
  app.titulo('Sistema mnemônico');
  const rapidos = paresRapidos();
  raiz.append(
    h(
      'div',
      { class: 'bloco cor-violeta cabecalho-secao' },
      h('span', { class: 'cabecalho-icone' }, icone('palacio', 30)),
      h(
        'div',
        {},
        h('h2', {}, 'Sistema mnemônico principal'),
        h('p', { class: 'pequeno' }, 'Cada algarismo vira um som de consoante e as vogais são livres. Assim, 45 vira ROLO, e 4545 vira "rolo, rolo".'),
      ),
    ),
    h('h2', {}, 'A tabela'),
    h(
      'div',
      { class: 'tabela-sistema' },
      ...TABELA.map((t, i) =>
        h(
          'div',
          { class: `bloco ficha-digito cor-${CORES_DIGITOS[i]}` },
          h('span', { class: 'ficha-numero' }, t.digito),
          h('span', { class: 'ficha-letras' }, t.letras),
          t.nota && h('span', { class: 'ficha-nota' }, t.nota),
          h('span', { class: 'ficha-exemplo' }, t.exemplo),
        ),
      ),
    ),
    h('p', { class: 'pequeno suave' }, 'Vogais, H, W e Y não valem nada. Letras dobradas (RR, SS) contam uma vez só.'),
    h('h2', {}, 'Treinos'),
    h(
      'div',
      { class: 'progresso-pares bloco' },
      h('div', { class: 'linha-entre' }, h('strong', {}, 'Pares rápidos'), h('span', {}, `${rapidos} de 100`)),
      h('div', { class: 'barra' }, h('span', { style: { width: `${rapidos}%` } })),
      h('p', { class: 'pequeno suave' }, 'Um par fica rápido quando você acerta quase sempre e em menos de 2,5 segundos.'),
    ),
    ...Object.entries(TREINOS).map(([tipo, t], i) =>
      h(
        'a',
        { class: `bloco treino cor-${['lima', 'sol', 'ciano', 'rosa'][i]}`, href: `#/sistema/treino/${tipo}` },
        h('span', { class: 'treino-icone' }, icone(t.icone, 28)),
        h('span', { class: 'crescer' }, h('strong', {}, t.titulo), h('span', { class: 'pequeno' }, t.texto)),
        recorde(`sistema-${tipo}`) ? h('span', { class: 'treino-recorde' }, `${recorde(`sistema-${tipo}`)}/${t.rodadas}`) : null,
      ),
    ),
    h(
      'a',
      { class: 'bloco treino cor-coral', href: '#/numeros' },
      h('span', { class: 'treino-icone' }, icone('raio', 28)),
      h('span', { class: 'crescer' }, h('strong', {}, 'Números longos'), h('span', { class: 'pequeno' }, 'Use o sistema na sequência de números. Dica: ligue "Mostrar em grupos: Pares".')),
    ),
    h('h2', {}, 'Suas palavras'),
    h(
      'a',
      { class: 'bloco treino', href: '#/sistema/palavras' },
      h('span', { class: 'treino-icone' }, icone('tabela', 28)),
      h('span', { class: 'crescer' }, h('strong', {}, 'Palavras de 0 a 99'), h('span', { class: 'pequeno' }, 'Veja e troque a palavra de cada número.')),
    ),
  );
}

// ------------------------------------------------------------ lista 0–9 e 00–99

export function telaPalavrasSistema(raiz, _params, app) {
  app.titulo('Suas palavras');
  const grade = h('div', { class: 'grade-pares' });

  function desenhar() {
    grade.replaceChildren(
      h('h3', { class: 'grade-titulo' }, 'Um dígito'),
      ...UNIDADES.map(ficha),
      h('h3', { class: 'grade-titulo' }, 'Dois dígitos'),
      ...PARES.map(ficha),
    );
  }

  function ficha(numero) {
    const palavra = palavraDoPar(numero);
    const confere = palavra && palavraCodifica(palavra, numero);
    return h(
      'button',
      {
        class: `ficha-par${ehPersonalizada(numero) ? ' sua' : ''}${palavra && !confere ? ' nao-confere' : ''}`,
        style: { '--cor': `var(--${CORES_DIGITOS[Number(numero[0])]})` },
        onclick: () => editar(numero),
      },
      h('b', {}, numero),
      h('span', {}, palavra || '—'),
    );
  }

  function editar(numero) {
    const entrada = h('input', { type: 'text', class: 'entrada', value: palavraDoPar(numero), autocapitalize: 'none', autocomplete: 'off', enterkeyhint: 'done' });
    const conferencia = h('div', { class: 'conferencia' });
    const conferir = () => {
      const p = entrada.value.trim();
      if (!p) return conferencia.replaceChildren();
      const ok = palavraCodifica(p, numero);
      conferencia.replaceChildren(
        decomposicao(p),
        h('p', { class: ok ? 'ok' : 'alerta' }, ok ? `Confere: ${numero}` : `Essa palavra dá ${numerosDaPalavra(p).join(' ou ')}, não ${numero}.`),
      );
    };
    entrada.addEventListener('input', conferir);
    conferir();
    const salvar = () => {
      definirPalavra(numero, entrada.value.trim());
      fechar();
      desenhar();
    };
    entrada.addEventListener('keydown', (e) => e.key === 'Enter' && salvar());
    const fechar = abrirFolha(
      h('div', { class: 'folha-numero' }, numero),
      h('label', { class: 'rotulo-campo' }, 'Sua palavra', entrada),
      conferencia,
      h('p', { class: 'pequeno suave' }, `Sugestão: ${PALAVRAS_PADRAO[numero]}`),
      h(
        'div',
        { class: 'botoes' },
        h('button', { class: 'botao escuro', onclick: salvar }, 'Salvar'),
        h(
          'button',
          {
            class: 'botao',
            onclick: () => {
              entrada.value = PALAVRAS_PADRAO[numero];
              conferir();
            },
          },
          'Usar sugestão',
        ),
      ),
    );
    setTimeout(() => entrada.focus(), 80);
  }

  raiz.append(
    h(
      'p',
      { class: 'pequeno' },
      'Toque num número para trocar a palavra. Prefira coisas concretas e fáceis de imaginar. As suas ficam com borda grossa; as que não batem com a tabela ficam riscadas.',
    ),
    grade,
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao perigo',
          onclick: () => {
            if (!confirm('Voltar todas as palavras para as sugestões do app?')) return;
            restaurarPalavras();
            desenhar();
            app.aviso('Sugestões restauradas.');
          },
        },
        'Restaurar sugestões',
      ),
    ),
  );
  desenhar();
}

// Painel que sobe da parte de baixo da tela; devolve a função que fecha.
function abrirFolha(...conteudo) {
  const fundo = h('div', { class: 'folha-fundo' });
  const folha = h('div', { class: 'folha bloco', role: 'dialog', 'aria-modal': 'true' }, ...conteudo);
  const fechar = () => {
    fundo.remove();
    folha.remove();
    document.removeEventListener('keydown', aoTeclar);
  };
  const aoTeclar = (e) => e.key === 'Escape' && fechar();
  fundo.addEventListener('click', fechar);
  folha.prepend(h('button', { class: 'folha-fechar', 'aria-label': 'Fechar', onclick: fechar }, '×'));
  document.addEventListener('keydown', aoTeclar);
  document.body.append(fundo, folha);
  return fechar;
}

// ------------------------------------------------------------ treinos

export function telaTreinoSistema(raiz, { tipo }, app) {
  const treino = TREINOS[tipo];
  if (!treino) return app.ir('#/sistema');
  app.titulo(treino.titulo);
  raiz.classList.add('tela-jogo');
  const palco = h('div', { class: 'palco bloco cor-violeta' });
  const abaixo = h('div', { class: 'abaixo-palco' });
  raiz.append(palco, abaixo);

  let teclado = null;
  let relogio = null;
  let rodada = 0;
  let acertos = 0;
  let tempos = [];
  let erros = [];
  let anterior = null;

  function parar() {
    clearTimeout(relogio);
    teclado?.desligar();
    teclado = null;
  }

  function trocar(conteudoPalco, ...conteudoAbaixo) {
    parar();
    const limpo = (lista) => lista.flat().filter((x) => x !== null && x !== undefined && x !== false);
    palco.replaceChildren(...limpo([conteudoPalco]));
    abaixo.replaceChildren(...limpo(conteudoAbaixo));
  }

  const contador = () => h('div', { class: 'nivel-rotulo' }, `${rodada + 1} de ${treino.rodadas}`);

  // ---------------------------------------------- abertura

  function inicio() {
    app.definirVoltar('#/sistema');
    const opcoes =
      tipo === 'lembrar' || tipo === 'numero'
        ? pilulas('Números', 'faixaSistema', FAIXAS)
        : tipo === 'criar'
          ? pilulas('Tamanho', 'digitosCriar', [
              [2, '2 dígitos'],
              [3, '3'],
              [4, '4'],
            ])
          : null;
    trocar(
      [
        h('div', { class: 'cabecalho-jogo' }, h('span', { class: 'cabecalho-icone' }, icone(treino.icone, 34)), h('h2', {}, treino.titulo), h('p', {}, treino.texto)),
        h('div', { class: 'destaques' }, numeroDestaque(recorde(`sistema-${tipo}`) ? `${recorde(`sistema-${tipo}`)}/${treino.rodadas}` : '–', 'recorde')),
        h('button', { class: 'botao escuro grande', onclick: comecar }, 'Começar'),
      ],
      opcoes && h('div', { class: 'bloco' }, opcoes),
      h('div', { class: 'bloco' }, h('h3', {}, 'Tabela'), miniTabela()),
    );
  }

  function comecar() {
    app.definirVoltar(`#/sistema/treino/${tipo}`);
    rodada = 0;
    acertos = 0;
    tempos = [];
    erros = [];
    anterior = null;
    proxima();
  }

  function proxima() {
    if (rodada >= treino.rodadas) return fim();
    if (tipo === 'lembrar') rodadaLembrar();
    else if (tipo === 'numero') rodadaNumero();
    else if (tipo === 'decodificar') rodadaDecodificar();
    else rodadaCriar();
  }

  function marcar(acertou, item, extra = null) {
    if (acertou) acertos++;
    else erros.push([item, extra]);
    rodada++;
  }

  // ---------------------------------------------- número -> sua palavra (autoavaliação)

  function rodadaLembrar() {
    const par = sortearPonderado(paresDaFaixa(), undefined, anterior);
    anterior = par;
    const inicioMs = performance.now();
    const numero = h('div', { class: 'numero-exibido' }, par);
    numero.style.fontSize = '112px';
    const mostrar = () => {
      const ms = Math.round(performance.now() - inicioMs);
      som.virar();
      const palavra = palavraDoPar(par);
      trocar(
        [contador(), h('div', { class: 'numero-pequeno' }, par), h('div', { class: 'palavra-exibida pular' }, palavra || '—'), palavra && decomposicao(palavra), h('div', { class: 'tempo-resposta' }, `${formatarDecimal(ms / 1000)} s`)],
        h(
          'div',
          { class: 'respostas' },
          h(
            'button',
            {
              class: 'botao resposta cor-lima',
              onclick: () => {
                som.acerto();
                registrarTentativa(par, true, ms);
                tempos.push(ms);
                marcar(true, par);
                proxima();
              },
            },
            icone('certo', 28),
            'Lembrei',
          ),
          h(
            'button',
            {
              class: 'botao resposta cor-coral',
              onclick: () => {
                som.erro();
                registrarTentativa(par, false, ms);
                marcar(false, par, palavra);
                proxima();
              },
            },
            icone('fechar', 28),
            'Não lembrei',
          ),
        ),
      );
    };
    trocar([contador(), numero, h('p', { class: 'pergunta' }, 'Qual é a sua palavra?')], h('button', { class: 'botao escuro largo grande', onclick: mostrar }, 'Mostrar palavra'));
    animar(numero, 'pular');
    const aoTeclar = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        document.removeEventListener('keydown', aoTeclar);
        mostrar();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    teclado = { desligar: () => document.removeEventListener('keydown', aoTeclar) };
  }

  // ---------------------------------------------- sua palavra -> número (digitar)

  function rodadaNumero() {
    const par = sortearPonderado(
      paresDaFaixa().filter((p) => palavraDoPar(p)),
      undefined,
      anterior,
    );
    anterior = par;
    const palavra = palavraDoPar(par);
    const inicioMs = performance.now();
    const campo = campoDigitos(2);
    const exibida = h('div', { class: 'palavra-exibida' }, palavra);
    const conferir = () => {
      if (!campo.cheio) return;
      const ms = Math.round(performance.now() - inicioMs);
      const acertou = campo.valor === par;
      registrarTentativa(par, acertou, ms);
      if (acertou) {
        som.acerto();
        tempos.push(ms);
        marcar(true, par);
        animar(palco, 'brilho');
        relogio = setTimeout(proxima, 350);
      } else {
        som.erro();
        marcar(false, par, palavra);
        animar(palco, 'tremer');
        trocar([contador(), h('div', { class: 'palavra-exibida' }, palavra), decomposicao(palavra), h('p', { class: 'pergunta' }, `Era ${par}`)], h('button', { class: 'botao escuro largo grande', onclick: proxima }, 'Continuar'));
      }
    };
    const novo = tecladoNumerico({
      aoDigitar: (d) => {
        campo.digitar(d);
        conferir();
      },
      aoApagar: () => campo.apagar(),
      aoConfirmar: conferir,
    });
    trocar([contador(), exibida, campo.el], novo.el);
    teclado = novo;
    animar(exibida, 'pular');
  }

  // ---------------------------------------------- palavra qualquer -> número

  let fila = [];
  function palavraParaDecodificar() {
    if (!fila.length) {
      fila = embaralhar(PALAVRAS.filter((p) => !p.includes('-') && semAmbiguidade(p) && numeroPrincipal(p).length >= 2 && numeroPrincipal(p).length <= 5));
    }
    return fila.pop();
  }

  function rodadaDecodificar() {
    const palavra = palavraParaDecodificar();
    const certo = numeroPrincipal(palavra);
    const campo = campoDigitos(8, { livre: true });
    const exibida = h('div', { class: 'palavra-exibida' }, palavra);
    const conferir = () => {
      if (!campo.valor) return;
      const acertou = palavraCodifica(palavra, campo.valor);
      if (acertou) {
        som.acerto();
        marcar(true, palavra);
      } else {
        som.erro();
        marcar(false, palavra, certo);
      }
      trocar(
        [contador(), h('div', { class: 'palavra-exibida' }, palavra), decomposicao(palavra), h('p', { class: `pergunta ${acertou ? 'ok' : 'alerta'}` }, acertou ? `Isso: ${certo}` : `Você digitou ${campo.valor}. Era ${certo}.`)],
        h('button', { class: 'botao escuro largo grande', onclick: proxima }, 'Continuar'),
      );
      animar(palco, acertou ? 'brilho' : 'tremer');
    };
    const novo = tecladoNumerico({
      aoDigitar: (d) => campo.digitar(d),
      aoApagar: () => campo.apagar(),
      aoConfirmar: conferir,
    });
    trocar([contador(), exibida, h('p', { class: 'pergunta' }, 'Que número ela esconde?'), campo.el], novo.el);
    teclado = novo;
    animar(exibida, 'pular');
  }

  // ---------------------------------------------- número -> palavra nova

  function rodadaCriar() {
    const tamanho = Number(config().digitosCriar) || 2;
    let numero = '';
    for (let i = 0; i < tamanho; i++) numero += Math.floor(Math.random() * 10);
    const entrada = h('input', { type: 'text', class: 'entrada grande', placeholder: 'Sua palavra', autocapitalize: 'none', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'go' });
    const exibido = h('div', { class: 'numero-exibido' }, numero);
    exibido.style.fontSize = '96px';
    const conferir = () => {
      const p = entrada.value.trim();
      if (!p) return entrada.focus();
      const acertou = palavraCodifica(p, numero);
      if (acertou) {
        som.acerto();
        marcar(true, numero);
      } else {
        som.erro();
        marcar(false, numero, p);
      }
      const usar =
        acertou && tamanho === 2 && p.toLowerCase() !== palavraDoPar(numero).toLowerCase()
          ? h(
              'button',
              {
                class: 'botao',
                onclick: (e) => {
                  definirPalavra(numero, p);
                  e.currentTarget.replaceWith(h('p', { class: 'pequeno centro' }, `Agora "${p}" é a sua palavra para ${numero}.`));
                },
              },
              `Usar como minha palavra para ${numero}`,
            )
          : null;
      trocar(
        [
          contador(),
          h('div', { class: 'numero-pequeno' }, numero),
          decomposicao(p),
          h('p', { class: `pergunta ${acertou ? 'ok' : 'alerta'}` }, acertou ? 'Confere!' : `"${p}" dá ${numerosDaPalavra(p).join(' ou ') || 'nada'}, não ${numero}.`),
          tamanho === 2 && h('p', { class: 'pequeno centro' }, `Sua palavra para ${numero}: ${palavraDoPar(numero) || '—'}`),
        ],
        usar,
        h('button', { class: 'botao escuro largo grande', onclick: proxima }, 'Continuar'),
      );
      animar(palco, acertou ? 'brilho' : 'tremer');
    };
    entrada.addEventListener('keydown', (e) => e.key === 'Enter' && conferir());
    trocar([contador(), exibido, h('p', { class: 'pergunta' }, 'Invente uma palavra para este número')], entrada, h('button', { class: 'botao escuro largo grande', onclick: conferir }, 'Conferir'), h('div', { class: 'bloco' }, miniTabela()));
    animar(exibido, 'pular');
    setTimeout(() => entrada.focus(), 60);
  }

  // ---------------------------------------------- fim

  function fim() {
    const { novoRecorde } = registrarResultado(`sistema-${tipo}`, acertos);
    const titulo = h('div', { class: 'titulo-resultado' }, novoRecorde ? 'Novo recorde!' : 'Treino concluído');
    const tempoMedio = tempos.length ? formatarDecimal(media(tempos) / 1000) : null;
    som.fim();
    trocar(
      [
        titulo,
        h('div', { class: 'placar-final' }, h('strong', {}, `${acertos}/${treino.rodadas}`), h('span', {}, 'acertos')),
        tempoMedio && (tipo === 'lembrar' || tipo === 'numero') ? h('p', { class: 'centro' }, `Tempo médio nos acertos: ${tempoMedio} s`) : null,
      ],
      erros.length
        ? h(
            'div',
            { class: 'bloco' },
            h('h3', {}, 'Para revisar'),
            h(
              'div',
              { class: 'lista-erros' },
              ...erros.map(([item, extra]) => h('span', { class: 'dica-par' }, h('b', {}, item), extra ?? '')),
            ),
          )
        : null,
      h(
        'div',
        { class: 'botoes' },
        h('button', { class: 'botao escuro grande', onclick: comecar }, 'De novo'),
        h('button', { class: 'botao grande', onclick: () => app.ir('#/sistema') }, 'Sair'),
      ),
    );
    animar(titulo, 'pular');
    if (novoRecorde || acertos === treino.rodadas) confete(palco);
  }

  inicio();
  return parar;
}

function miniTabela() {
  return h(
    'div',
    { class: 'mini-tabela' },
    ...TABELA.map((t, i) => h('span', { style: { '--cor': `var(--${CORES_DIGITOS[i]})` } }, h('b', {}, t.digito), t.letras)),
  );
}
