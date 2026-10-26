// Sequência de números: o número aparece por alguns segundos, some, e você digita.
// Acertou, ganha mais um algarismo; errou, a partida acaba. No resultado, as palavras
// do sistema mnemônico que codificam o número (se a dica estiver ligada).

import { h, icone, som, config, registrarResultado, recorde, resultados, animar } from '../util.js';
import { tecladoNumerico, campoDigitos } from '../teclado.js';
import { pilulas, interruptor, graficoBarras, confete, cabecalhoJogo, numeroDestaque, media, formatarDecimal } from '../componentes.js';
import { palavraDoPar } from '../sistema.js';

// [tempo base, tempo por dígito] em milissegundos
const RITMOS = { rapido: [500, 400], normal: [1000, 600], calmo: [1500, 1200] };

export function tempoParaMemorizar(n, ritmo) {
  const [base, porDigito] = RITMOS[ritmo] || RITMOS.normal;
  return base + porDigito * n;
}

function gerarNumero(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function grupos(numero, tamanho) {
  if (!tamanho) return [numero];
  const g = [];
  for (let i = 0; i < numero.length; i += tamanho) g.push(numero.slice(i, i + tamanho));
  return g;
}

// Números grandes: o tamanho da letra diminui conforme a quantidade de dígitos por linha.
function tamanhoDaFonte(largura, digitosPorLinha) {
  return Math.max(28, Math.min(120, Math.floor(largura / (digitosPorLinha * 0.64))));
}

// Pares do número com a palavra que você usa para cada um (00–99).
export function dicaDoSistema(numero) {
  const pares = numero.match(/\d{1,2}/g) || [];
  const itens = pares.filter((p) => p.length === 2).map((p) => [p, palavraDoPar(p)]);
  if (!itens.length) return null;
  return h(
    'div',
    { class: 'dica-sistema' },
    h('span', { class: 'dica-titulo' }, 'No sistema'),
    h('div', { class: 'dica-itens' }, ...itens.map(([p, palavra]) => h('span', { class: 'dica-par' }, h('b', {}, p), palavra || '—'))),
  );
}

export function telaNumeros(raiz, _params, app) {
  app.titulo('Sequência de números');
  raiz.classList.add('tela-jogo');
  const palco = h('div', { class: 'palco bloco cor-coral' });
  const abaixo = h('div', { class: 'abaixo-palco' });
  raiz.append(palco, abaixo);

  let nivel = 1;
  let maiorAcerto = 0;
  let numero = '';
  let relogio = null;
  let teclado = null;

  function parar() {
    clearTimeout(relogio);
    relogio = null;
    teclado?.desligar();
    teclado = null;
  }

  function trocar(...conteudo) {
    parar();
    const limpo = (lista) => lista.flat().filter((x) => x !== null && x !== undefined && x !== false);
    palco.replaceChildren(...limpo([conteudo[0]]));
    abaixo.replaceChildren(...limpo(conteudo.slice(1)));
  }

  // ------------------------------------------------------------ abertura

  function inicio() {
    app.definirVoltar('#/');
    const hist = resultados('numeros').map((r) => r.v);
    const ultimos = hist.slice(-10);
    trocar(
      [
        cabecalhoJogo('numeros', 'Sequência de números', 'Memorize o número, espere ele sumir e digite. A cada acerto, mais um algarismo.'),
        h(
          'div',
          { class: 'destaques' },
          numeroDestaque(recorde('numeros') || '–', 'recorde (dígitos)'),
          numeroDestaque(ultimos.length ? formatarDecimal(media(ultimos)) : '–', 'média recente'),
          numeroDestaque(hist.length, 'partidas'),
        ),
        h('button', { class: 'botao escuro grande', onclick: () => comecar() }, 'Começar'),
      ],
      h(
        'div',
        { class: 'bloco' },
        pilulas('Ritmo', 'tempoNumeros', [
          ['rapido', 'Rápido'],
          ['normal', 'Normal'],
          ['calmo', 'Calmo'],
        ]),
        pilulas('Começar com', 'inicioNumeros', [
          [1, '1 dígito'],
          [4, '4'],
          [7, '7'],
          [10, '10'],
        ]),
        pilulas('Mostrar em grupos', 'gruposNumeros', [
          [0, 'Não'],
          [2, 'Pares'],
          [3, 'Trios'],
        ]),
        interruptor('Palavras do sistema no resultado', 'dicaSistema', null, 'Mostra a palavra de cada par de dígitos.'),
      ),
      h('div', { class: 'bloco' }, h('h3', {}, 'Últimas partidas'), graficoBarras(hist.slice(-30), { rotulo: 'Dígitos lembrados' })),
    );
  }

  function comecar() {
    nivel = Number(config().inicioNumeros) || 1;
    maiorAcerto = 0;
    app.definirVoltar('#/numeros');
    mostrar();
  }

  // ------------------------------------------------------------ memorizar

  function mostrar() {
    const c = config();
    numero = gerarNumero(nivel);
    const tamanhoGrupo = Number(c.gruposNumeros) || 0;
    const partes = grupos(numero, tamanhoGrupo);
    const exibicao = h('div', { class: 'numero-exibido' }, ...partes.map((p) => h('span', { class: 'grupo-digitos' }, p)));
    const tempo = tempoParaMemorizar(nivel, c.tempoNumeros);
    const barra = h('div', { class: 'tempo' }, h('span', { style: { animationDuration: `${tempo}ms` } }));
    trocar(
      [h('div', { class: 'nivel-rotulo' }, `Nível ${nivel}`), exibicao, barra],
      h('button', { class: 'botao largo', onclick: () => digitar() }, 'Já memorizei'),
    );
    // cabe em no máximo 3 linhas de até 8 dígitos
    const porLinha = Math.min(numero.length, 8) + (tamanhoGrupo ? Math.ceil(Math.min(numero.length, 8) / tamanhoGrupo) * 0.4 : 0);
    exibicao.style.fontSize = `${tamanhoDaFonte(palco.clientWidth - 40, porLinha)}px`;
    animar(exibicao, 'pular');
    relogio = setTimeout(digitar, tempo);
  }

  // ------------------------------------------------------------ digitar

  function digitar() {
    const campo = campoDigitos(nivel);
    const confirmar = () => {
      if (!campo.valor.length) return;
      resultado(campo.valor);
    };
    const novoTeclado = tecladoNumerico({
      aoDigitar: (d) => {
        campo.digitar(d);
        teclado.ok.classList.toggle('pronto', campo.cheio);
      },
      aoApagar: () => {
        campo.apagar();
        teclado.ok.classList.toggle('pronto', campo.cheio);
      },
      aoConfirmar: confirmar,
    });
    trocar([h('div', { class: 'nivel-rotulo' }, `Nível ${nivel}`), h('p', { class: 'pergunta' }, 'Qual era o número?'), campo.el], novoTeclado.el);
    teclado = novoTeclado;
  }

  // ------------------------------------------------------------ resultado

  function comparacao(certo, resposta) {
    const linha = (texto, comparar) =>
      h(
        'div',
        { class: 'linha-digitos' },
        ...[...texto].map((d, i) => h('span', { class: comparar && d !== certo[i] ? 'errado' : '' }, d)),
        ...(comparar && texto.length < certo.length ? Array.from({ length: certo.length - texto.length }, () => h('span', { class: 'errado vazio' }, '·')) : []),
      );
    return h(
      'div',
      { class: 'comparacao' },
      h('span', { class: 'comparacao-rotulo' }, 'Número'),
      linha(certo, false),
      h('span', { class: 'comparacao-rotulo' }, 'Você'),
      linha(resposta, true),
    );
  }

  function resultado(resposta) {
    const acertou = resposta === numero;
    const dica = config().dicaSistema ? dicaDoSistema(numero) : null;
    if (acertou) {
      som.acerto();
      maiorAcerto = nivel;
      const titulo = h('div', { class: 'titulo-resultado' }, 'Acertou!');
      trocar(
        [comparacao(numero, resposta), titulo, h('div', { class: 'nivel-proximo' }, `Próximo: ${nivel + 1} dígitos`), dica],
        h('button', { class: 'botao escuro largo grande', onclick: () => (nivel++, mostrar()) }, 'Próximo'),
      );
      animar(titulo, 'pular');
      return;
    }
    som.erro();
    let mensagem = 'Fim de jogo';
    let novoRecorde = false;
    if (maiorAcerto > 0) ({ novoRecorde } = registrarResultado('numeros', maiorAcerto));
    if (novoRecorde) mensagem = 'Novo recorde!';
    const titulo = h('div', { class: 'titulo-resultado' }, mensagem);
    trocar(
      [
        comparacao(numero, resposta),
        titulo,
        h('div', { class: 'placar-final' }, h('strong', {}, String(maiorAcerto)), h('span', {}, maiorAcerto === 1 ? 'dígito lembrado' : 'dígitos lembrados')),
        dica,
      ],
      h(
        'div',
        { class: 'botoes' },
        h('button', { class: 'botao escuro grande', onclick: () => comecar() }, 'Jogar de novo'),
        h('button', { class: 'botao grande', onclick: () => inicio() }, 'Sair'),
      ),
    );
    animar(titulo, 'pular');
    if (novoRecorde) {
      som.recorde();
      confete(palco);
    }
  }

  inicio();
  return parar;
}
