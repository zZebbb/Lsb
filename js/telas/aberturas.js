// Telas de aberturas: lista, detalhe, estudar uma linha, treinar (repetição espaçada) e explorar.

import { Chess } from '../vendor/chess.js';
import { Tabuleiro } from '../tabuleiro.js';
import { h, som, somDoLance, sanPt, armazenamento } from '../util.js';
import { ABERTURAS, GRUPOS, PRINCIPIOS } from '../../dados/aberturas.js';
import { jogarLinha, ladoDaLinha } from '../linhas.js';

const DIA = 24 * 60 * 60 * 1000;
const INTERVALOS = [0, 1, 3, 7, 16, 35]; // dias até a próxima revisão, por nível
export const NIVEL_DOMINADA = 3;

// ------------------------------------------------------------ progresso (repetição espaçada)

function chave(ab, i) {
  return `${ab.id}:${i}`;
}

export function progressoAberturas() {
  return armazenamento.ler('aberturas', {});
}

export function progressoLinha(ab, i) {
  return progressoAberturas()[chave(ab, i)] || { nivel: 0, proxima: 0, treinos: 0 };
}

function registrarTreino(ab, i, erros) {
  const tudo = progressoAberturas();
  const p = tudo[chave(ab, i)] || { nivel: 0, proxima: 0, treinos: 0 };
  if (erros === 0) p.nivel = Math.min(5, p.nivel + 1);
  else if (erros >= 2) p.nivel = Math.max(0, p.nivel - 1);
  p.treinos++;
  p.ultimo = Date.now();
  p.proxima = Date.now() + INTERVALOS[p.nivel] * DIA;
  tudo[chave(ab, i)] = p;
  armazenamento.gravar('aberturas', tudo);
  return p;
}

export function resumoAbertura(ab) {
  let dominadas = 0;
  let pendentes = 0;
  ab.linhas.forEach((_, i) => {
    const p = progressoLinha(ab, i);
    if (p.nivel >= NIVEL_DOMINADA) dominadas++;
    if (p.treinos && p.proxima <= Date.now()) pendentes++;
  });
  return { dominadas, total: ab.linhas.length, pendentes };
}

export function linhasParaRevisar() {
  const lista = [];
  for (const ab of ABERTURAS) {
    ab.linhas.forEach((_, i) => {
      const p = progressoLinha(ab, i);
      if (p.treinos && p.proxima <= Date.now()) lista.push({ ab, i, p });
    });
  }
  return lista.sort((a, b) => a.p.nivel - b.p.nivel || a.p.proxima - b.p.proxima);
}

function proximaLinhaDaAbertura(ab, excluir = -1) {
  const candidatas = ab.linhas.map((_, i) => ({ i, p: progressoLinha(ab, i) })).filter((c) => c.i !== excluir);
  if (!candidatas.length) return 0;
  const vencidas = candidatas.filter((c) => c.p.proxima <= Date.now());
  const base = vencidas.length ? vencidas : candidatas;
  base.sort((a, b) => a.p.nivel - b.p.nivel || a.p.proxima - b.p.proxima || a.i - b.i);
  return base[0].i;
}

function pontosNivel(nivel) {
  const el = h('span', { class: 'nivel-pontos', title: `Nível ${nivel} de 5`, 'aria-label': `Nível ${nivel} de 5` });
  for (let i = 1; i <= 5; i++) el.append(h('i', { class: i <= nivel ? 'on' : '' }));
  return el;
}

function buscarAbertura(id) {
  return ABERTURAS.find((a) => a.id === id);
}

function peca(cor) {
  return h('img', { src: `img/pecas/${cor}N.svg`, alt: '' });
}

// ------------------------------------------------------------ lista

export function telaListaAberturas(raiz, _params, app) {
  app.titulo('Aberturas');
  const revisar = linhasParaRevisar();
  if (revisar.length) {
    raiz.append(
      h(
        'a',
        { class: 'cartao', href: '#/revisar' },
        h('div', { class: 'cartao-titulo' }, `Revisar ${revisar.length} ${revisar.length === 1 ? 'linha' : 'linhas'}`),
        h('div', { class: 'suave pequeno' }, 'Linhas que você já treinou e estão no dia de revisão.'),
      ),
    );
  }
  raiz.append(
    h(
      'div',
      { class: 'grade-2' },
      h('a', { class: 'cartao', href: '#/principios' }, h('div', { class: 'cartao-titulo' }, 'Princípios'), h('div', { class: 'suave pequeno' }, 'As regras de ouro da abertura')),
      h('a', { class: 'cartao', href: '#/explorar' }, h('div', { class: 'cartao-titulo' }, 'Explorar'), h('div', { class: 'suave pequeno' }, 'Tabuleiro livre com nome das aberturas')),
    ),
  );
  for (const g of GRUPOS) {
    const doGrupo = ABERTURAS.filter((a) => a.grupo === g.id);
    if (!doGrupo.length) continue;
    raiz.append(h('h2', {}, g.nome));
    for (const ab of doGrupo) {
      const r = resumoAbertura(ab);
      raiz.append(
        h(
          'a',
          { class: 'cartao', href: `#/abertura/${ab.id}` },
          h(
            'div',
            { class: 'cartao-linha' },
            h('div', { class: 'icone-grande' }, peca(ab.lado)),
            h(
              'div',
              { class: 'crescer' },
              h('div', { class: 'cartao-titulo' }, ab.nome),
              h('div', { class: 'suave pequeno' }, `${ab.nivel} · ${ab.linhas.length} ${ab.linhas.length === 1 ? 'linha' : 'linhas'}`),
              h('div', { class: 'barra' }, h('span', { style: { width: `${(100 * r.dominadas) / r.total}%` } })),
            ),
          ),
        ),
      );
    }
  }
}

// ------------------------------------------------------------ detalhe

export function telaAbertura(raiz, { id }, app) {
  const ab = buscarAbertura(id);
  if (!ab) return app.ir('#/aberturas');
  app.titulo(ab.nome);
  const r = resumoAbertura(ab);
  raiz.append(
    h('p', {}, ab.resumo),
    h('div', {}, h('span', { class: 'etiqueta' }, ab.lado === 'w' ? 'Você joga de brancas' : 'Você joga de pretas'), h('span', { class: 'etiqueta' }, ab.nivel), h('span', { class: 'etiqueta verde' }, `${r.dominadas}/${r.total} dominadas`)),
    h('h2', {}, 'Ideias principais'),
    h('ul', { class: 'ideias' }, ...ab.ideias.map((i) => h('li', {}, i))),
    h('div', { class: 'botoes' }, h('a', { class: 'botao primario', href: `#/treinar/${ab.id}` }, 'Treinar esta abertura')),
    h('h2', {}, 'Linhas'),
  );
  ab.linhas.forEach((linha, i) => {
    const p = progressoLinha(ab, i);
    const lado = ladoDaLinha(ab, linha);
    const lances = jogarLinha(linha.lances);
    const previa = lances
      .slice(0, 8)
      .map((l, k) => (k % 2 === 0 ? `${k / 2 + 1}.${sanPt(l.san)}` : sanPt(l.san)))
      .join(' ');
    raiz.append(
      h(
        'div',
        { class: 'cartao' },
        h(
          'div',
          { class: 'linha-abertura' },
          h(
            'div',
            { class: 'crescer' },
            h('div', { class: 'cartao-titulo' }, linha.nome),
            h(
              'div',
              { class: 'pequeno suave' },
              linha.tipo === 'armadilha' ? h('span', { class: 'etiqueta' }, 'Armadilha') : null,
              lado !== ab.lado ? h('span', { class: 'etiqueta' }, lado === 'w' ? 'de brancas' : 'de pretas') : null,
              previa + (lances.length > 8 ? '…' : ''),
            ),
          ),
          pontosNivel(p.nivel),
        ),
        h(
          'div',
          { class: 'botoes', style: { marginBottom: '0' } },
          h('a', { class: 'botao pequeno', href: `#/estudar/${ab.id}/${i}` }, 'Estudar'),
          h('a', { class: 'botao pequeno primario', href: `#/treinar/${ab.id}/${i}` }, 'Treinar'),
        ),
      ),
    );
  });
}

// ------------------------------------------------------------ princípios

export function telaPrincipios(raiz, _params, app) {
  app.titulo('Princípios da abertura');
  raiz.append(h('p', { class: 'suave' }, 'Mais importante que decorar lances é entender por que eles são jogados. Quase toda boa abertura segue estas ideias:'));
  PRINCIPIOS.forEach(([titulo, texto], i) => {
    raiz.append(h('div', { class: 'cartao' }, h('div', { class: 'cartao-titulo' }, `${i + 1}. ${titulo}`), h('div', {}, texto)));
  });
  raiz.append(h('div', { class: 'botoes' }, h('a', { class: 'botao primario', href: '#/aberturas' }, 'Ver as aberturas')));
}

// ------------------------------------------------------------ peças compartilhadas pelas telas com tabuleiro

function montarListaLances(lances, aoClicar) {
  const el = h('div', { class: 'lista-lances' });
  const botoes = [];
  lances.forEach((l, i) => {
    if (i % 2 === 0) el.append(h('span', { class: 'num' }, `${i / 2 + 1}.`));
    const b = h('button', { onclick: () => aoClicar(i + 1) }, sanPt(l.san) + (l.anotacao || ''));
    botoes.push(b);
    el.append(b);
  });
  return {
    el,
    atualizar(posicao, mostrarFuturo = true) {
      botoes.forEach((b, i) => {
        b.classList.toggle('atual', i === posicao - 1);
        b.classList.toggle('futuro', i >= posicao);
        b.hidden = !mostrarFuturo && i >= posicao;
      });
      el.querySelectorAll('.num').forEach((n, k) => (n.hidden = !mostrarFuturo && 2 * k >= posicao));
      botoes[posicao - 1]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },
  };
}

function reiEmXeque(jogo) {
  if (!jogo.inCheck()) return null;
  for (const linha of jogo.board()) for (const c of linha) if (c && c.type === 'k' && c.color === jogo.turn()) return c.square;
  return null;
}

function textoComentario(lance, numero) {
  const prefixo = numero % 2 === 1 ? `${(numero + 1) / 2}. ` : `${numero / 2}... `;
  return [h('span', { class: 'lance-atual' }, prefixo + sanPt(lance.san) + (lance.anotacao || '')), lance.comentario || ''];
}

// ------------------------------------------------------------ estudar

export function telaEstudar(raiz, { id, linha }, app) {
  const ab = buscarAbertura(id);
  const l = ab?.linhas[Number(linha)];
  if (!l) return app.ir('#/aberturas');
  app.titulo(l.nome);
  raiz.classList.add('tela-tabuleiro');
  const lances = jogarLinha(l.lances);
  const lado = ladoDaLinha(ab, l);

  const area = h('div', { class: 'area-tabuleiro' });
  const comentario = h('div', { class: 'comentario' });
  const lista = montarListaLances(lances, (i) => ir(i));
  const nav = h(
    'div',
    { class: 'navegacao' },
    h('button', { class: 'botao', 'aria-label': 'Início', onclick: () => ir(0) }, '⏮'),
    h('button', { class: 'botao', 'aria-label': 'Anterior', onclick: () => ir(pos - 1) }, '◀'),
    h('button', { class: 'botao primario', 'aria-label': 'Próximo', onclick: () => ir(pos + 1) }, '▶'),
    h('button', { class: 'botao', 'aria-label': 'Fim', onclick: () => ir(lances.length) }, '⏭'),
  );
  raiz.append(
    h('div', { class: 'barra-info' }, h('span', {}, ab.nome), h('span', { class: 'suave' }, lado === 'w' ? 'Você: brancas' : 'Você: pretas')),
    area,
    comentario,
    nav,
    lista.el,
    h('div', { class: 'botoes' }, h('a', { class: 'botao primario', href: `#/treinar/${ab.id}/${linha}` }, 'Treinar esta linha')),
  );

  const tabuleiro = new Tabuleiro(area, { orientacao: lado });
  let pos = 0;

  function ir(n) {
    n = Math.max(0, Math.min(lances.length, n));
    const avancouUm = n === pos + 1;
    pos = n;
    const fen = n === 0 ? new Chess().fen() : lances[n - 1].fen;
    tabuleiro.setPosicao(fen);
    const jogo = new Chess(fen);
    const ultimo = lances[n - 1];
    tabuleiro.setMarcas({ ultimo: ultimo ? [ultimo.from, ultimo.to] : [], xeque: reiEmXeque(jogo) });
    const prox = lances[n];
    tabuleiro.setSetas(prox ? [{ de: prox.from, para: prox.to, cor: 'verde' }] : []);
    if (avancouUm) somDoLance({ captured: ultimo.san.includes('x') });
    comentario.innerHTML = '';
    if (n === 0) {
      comentario.append(h('strong', {}, l.nome), h('div', { class: 'pequeno suave' }, 'Toque em ▶ para avançar. A seta verde mostra o próximo lance.'));
    } else {
      comentario.append(...textoComentario(ultimo, n));
      if (n === lances.length) comentario.append(h('div', { class: 'pequeno suave', style: { marginTop: '6px' } }, 'Fim da linha. Agora treine para fixar!'));
    }
    lista.atualizar(n);
  }

  const teclas = (e) => {
    if (e.key === 'ArrowRight') ir(pos + 1);
    if (e.key === 'ArrowLeft') ir(pos - 1);
  };
  document.addEventListener('keydown', teclas);
  ir(0);
  return () => document.removeEventListener('keydown', teclas);
}

// ------------------------------------------------------------ treinar

export function telaTreinar(raiz, { id, linha, revisao }, app) {
  let fila = null; // modo revisão: várias aberturas
  let ab;
  let indiceLinha;
  if (revisao) {
    fila = linhasParaRevisar();
    if (!fila.length) {
      app.titulo('Revisão');
      raiz.append(
        h('div', { class: 'cartao' }, h('div', { class: 'cartao-titulo' }, 'Tudo em dia!'), h('p', {}, 'Nenhuma linha precisa de revisão agora. Que tal aprender uma abertura nova?')),
        h('div', { class: 'botoes' }, h('a', { class: 'botao primario', href: '#/aberturas' }, 'Ver aberturas')),
      );
      return;
    }
    ab = fila[0].ab;
    indiceLinha = fila[0].i;
  } else {
    ab = buscarAbertura(id);
    if (!ab) return app.ir('#/aberturas');
    indiceLinha = linha !== undefined ? Number(linha) : proximaLinhaDaAbertura(ab);
  }
  raiz.classList.add('tela-tabuleiro');

  const infoEsq = h('span');
  const infoDir = h('span', { class: 'suave' });
  const area = h('div', { class: 'area-tabuleiro' });
  const status = h('div', { class: 'status vez' });
  const comentario = h('div', { class: 'comentario' });
  const botoes = h('div', { class: 'botoes' });
  raiz.append(h('div', { class: 'barra-info' }, infoEsq, infoDir), area, status, comentario, botoes);

  const tabuleiro = new Tabuleiro(area, { aoMover: (m) => aoMover(m) });
  let l;
  let lances;
  let lado;
  let jogo;
  let pos;
  let erros;
  let errosNoLance;
  let terminado;
  const timers = new Set();

  function esperar(ms) {
    return new Promise((ok) => {
      const t = setTimeout(() => {
        timers.delete(t);
        ok();
      }, ms);
      timers.add(t);
    });
  }

  function setStatus(tipo, texto, sub) {
    status.className = 'status ' + tipo;
    status.innerHTML = '';
    const icone = h('div', { class: 'status-icone' }, { certo: '✓', errado: '✗', fim: '★' }[tipo] || '');
    if (tipo === 'vez') icone.append(h('span', { class: 'peca-vez ' + jogo.turn() }));
    status.append(icone, h('div', { class: 'status-texto' }, texto, sub ? h('small', {}, sub) : null));
  }

  function mostrarComentario(n) {
    comentario.innerHTML = '';
    if (n === 0) {
      comentario.append(
        h('strong', {}, l.nome),
        h('div', { class: 'pequeno suave' }, `Jogue os lances das ${lado === 'w' ? 'brancas' : 'pretas'} desta linha. O app joga o outro lado e explica cada ideia.`),
      );
      return;
    }
    comentario.append(...textoComentario(lances[n - 1], n));
  }

  function montarBotoes() {
    botoes.innerHTML = '';
    if (!terminado) {
      botoes.append(
        h('button', { class: 'botao', onclick: dica }, 'Dica'),
        h('button', { class: 'botao', onclick: () => carregar(indiceLinha) }, 'Recomeçar'),
        h('a', { class: 'botao', href: `#/estudar/${ab.id}/${indiceLinha}` }, 'Estudar'),
      );
      return;
    }
    botoes.append(h('button', { class: 'botao', onclick: () => carregar(indiceLinha) }, 'Repetir'));
    if (fila) {
      fila = linhasParaRevisar();
      if (fila.length) {
        botoes.append(
          h(
            'button',
            {
              class: 'botao primario',
              onclick: () => {
                ab = fila[0].ab;
                carregar(fila[0].i);
              },
            },
            `Próxima (${fila.length})`,
          ),
        );
      } else {
        botoes.append(h('a', { class: 'botao primario', href: '#/aberturas' }, 'Concluir'));
      }
    } else if (ab.linhas.length > 1) {
      botoes.append(h('button', { class: 'botao primario', onclick: () => carregar(proximaLinhaDaAbertura(ab, indiceLinha)) }, 'Próxima linha'));
    } else {
      botoes.append(h('a', { class: 'botao primario', href: `#/abertura/${ab.id}` }, 'Concluir'));
    }
  }

  function atualizarInfo() {
    const p = progressoLinha(ab, indiceLinha);
    infoEsq.textContent = ab.nome;
    infoDir.innerHTML = '';
    infoDir.append(`Erros: ${erros} `, pontosNivel(p.nivel));
  }

  function vezDoAluno() {
    return (pos % 2 === 0 ? 'w' : 'b') === lado;
  }

  async function carregar(i) {
    for (const t of timers) clearTimeout(t);
    timers.clear();
    indiceLinha = i;
    l = ab.linhas[i];
    lances = jogarLinha(l.lances);
    lado = ladoDaLinha(ab, l);
    jogo = new Chess();
    pos = 0;
    erros = 0;
    errosNoLance = 0;
    terminado = false;
    app.titulo(l.nome);
    tabuleiro.setOrientacao(lado);
    tabuleiro.setPosicao(jogo.fen(), { animar: false });
    tabuleiro.setMarcas({});
    tabuleiro.setSetas([]);
    tabuleiro.travar();
    atualizarInfo();
    mostrarComentario(0);
    montarBotoes();
    await seguir();
  }

  async function seguir() {
    while (pos < lances.length && !vezDoAluno()) {
      tabuleiro.travar();
      setStatus('fim', 'O adversário está jogando…');
      await esperar(pos === 0 ? 700 : 550);
      const alvo = lances[pos];
      const m = jogo.move(alvo.san);
      pos++;
      tabuleiro.setPosicao(jogo.fen());
      tabuleiro.setMarcas({ ultimo: [m.from, m.to], xeque: reiEmXeque(jogo) });
      somDoLance(m);
      mostrarComentario(pos);
    }
    if (pos >= lances.length) {
      concluir();
      return;
    }
    errosNoLance = 0;
    tabuleiro.setLegais(jogo.moves({ verbose: true }), jogo.turn());
    setStatus('vez', 'Sua vez: qual é o lance da linha?', l.tipo === 'armadilha' && pos > 0 ? 'Fique atento: o adversário pode ter errado.' : null);
  }

  async function aoMover(lance) {
    if (terminado) return;
    let m;
    try {
      m = jogo.move(lance);
    } catch {
      return;
    }
    const esperado = lances[pos];
    tabuleiro.setPosicao(jogo.fen());
    tabuleiro.setSetas([]);
    if (m.san === esperado.san) {
      pos++;
      somDoLance(m);
      tabuleiro.setMarcas({ ultimo: [m.from, m.to], certo: m.to, xeque: reiEmXeque(jogo) });
      mostrarComentario(pos);
      setStatus('certo', 'Correto!');
      await seguir();
      return;
    }
    erros++;
    errosNoLance++;
    som.erro();
    tabuleiro.setMarcas({ ultimo: [m.from, m.to], errado: m.to });
    tabuleiro.tremer();
    tabuleiro.travar();
    atualizarInfo();
    setStatus('errado', `${sanPt(m.san)} não é o lance da linha.`, errosNoLance >= 2 ? 'Veja a seta: esse é o lance esperado.' : 'Tente de novo.');
    await esperar(700);
    jogo.undo();
    tabuleiro.setPosicao(jogo.fen());
    const anterior = lances[pos - 1];
    tabuleiro.setMarcas({ ultimo: anterior ? [anterior.from, anterior.to] : [], xeque: reiEmXeque(jogo) });
    if (errosNoLance >= 2) tabuleiro.setSetas([{ de: esperado.from, para: esperado.to, cor: 'azul' }]);
    tabuleiro.setLegais(jogo.moves({ verbose: true }), jogo.turn());
  }

  function dica() {
    if (terminado || !vezDoAluno()) return;
    const esperado = lances[pos];
    erros++;
    errosNoLance = Math.max(errosNoLance, 1);
    atualizarInfo();
    tabuleiro.setSetas([{ de: esperado.from, para: esperado.to, cor: 'azul' }]);
    setStatus('vez', 'Faça o lance indicado pela seta.', 'Usar dica conta como um erro.');
  }

  function concluir() {
    terminado = true;
    tabuleiro.travar();
    const p = registrarTreino(ab, indiceLinha, erros);
    atualizarInfo();
    som.fim();
    const proxima = p.nivel >= 5 ? 'Linha dominada!' : `Próxima revisão em ${INTERVALOS[p.nivel]} ${INTERVALOS[p.nivel] === 1 ? 'dia' : 'dias'}.`;
    if (erros === 0) setStatus('certo', 'Linha concluída sem erros!', proxima);
    else setStatus('fim', `Linha concluída com ${erros} ${erros === 1 ? 'erro' : 'erros'}.`, erros >= 2 ? 'Vamos revisar de novo em breve.' : proxima);
    montarBotoes();
  }

  carregar(indiceLinha);
  return () => {
    for (const t of timers) clearTimeout(t);
  };
}

// ------------------------------------------------------------ explorar

let nomesCache = null;

export function carregarNomes() {
  if (!nomesCache) {
    nomesCache = fetch('dados/nomes-aberturas.json').then((r) => r.json());
    nomesCache.catch(() => (nomesCache = null));
  }
  return nomesCache;
}

function epd(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

export function telaExplorar(raiz, _params, app) {
  app.titulo('Explorar');
  raiz.classList.add('tela-tabuleiro');
  const nome = h('div', { class: 'comentario' });
  const area = h('div', { class: 'area-tabuleiro' });
  const lista = h('div', { class: 'lista-lances' });
  const sugestoes = h('div');
  let orientacao = 'w';
  raiz.append(
    area,
    nome,
    h(
      'div',
      { class: 'navegacao' },
      h('button', { class: 'botao', 'aria-label': 'Recomeçar', onclick: () => reiniciar() }, '⏮'),
      h('button', { class: 'botao', 'aria-label': 'Voltar um lance', onclick: () => voltar() }, '◀'),
      h('button', { class: 'botao', 'aria-label': 'Avançar', onclick: () => avancar() }, '▶'),
      h('button', { class: 'botao', 'aria-label': 'Virar tabuleiro', onclick: () => virar() }, '⇅'),
    ),
    lista,
    sugestoes,
  );

  const tabuleiro = new Tabuleiro(area, { aoMover: (m) => jogar(m) });
  const jogo = new Chess();
  let desfeitos = [];
  let nomes = {};
  let ultimoNome = null;
  carregarNomes()
    .then((n) => {
      nomes = n;
      atualizar();
    })
    .catch(() => {});

  // todas as linhas do repertório, para sugerir continuações
  const repertorio = [];
  for (const ab of ABERTURAS) ab.linhas.forEach((l, i) => repertorio.push({ ab, i, l, lances: jogarLinha(l.lances) }));

  function jogar(m, manterDesfeitos = false) {
    let feito;
    try {
      feito = jogo.move(m);
    } catch {
      return;
    }
    if (!manterDesfeitos) desfeitos = [];
    somDoLance(feito);
    atualizar(feito);
  }

  function voltar() {
    const m = jogo.undo();
    if (m) desfeitos.push(m);
    atualizar();
  }

  function avancar() {
    const m = desfeitos.pop();
    if (m) jogar({ from: m.from, to: m.to, promotion: m.promotion }, true);
  }

  function reiniciar() {
    jogo.reset();
    desfeitos = [];
    ultimoNome = null;
    atualizar();
  }

  function virar() {
    orientacao = orientacao === 'w' ? 'b' : 'w';
    tabuleiro.setOrientacao(orientacao);
  }

  function atualizar() {
    const historico = jogo.history({ verbose: true });
    tabuleiro.setPosicao(jogo.fen());
    const ultimo = historico.at(-1);
    tabuleiro.setMarcas({ ultimo: ultimo ? [ultimo.from, ultimo.to] : [], xeque: reiEmXeque(jogo) });
    tabuleiro.setLegais(jogo.moves({ verbose: true }), jogo.turn());

    // nome da abertura: o da posição atual ou o último reconhecido
    if (!historico.length) ultimoNome = null;
    else {
      ultimoNome = null;
      const j = new Chess();
      for (const m of historico) {
        j.move(m.san);
        const n = nomes[epd(j.fen())];
        if (n) ultimoNome = n;
      }
    }
    nome.innerHTML = '';
    if (ultimoNome) {
      const [eco, texto] = ultimoNome.split('|');
      nome.append(h('strong', {}, texto), h('div', { class: 'pequeno suave' }, `Código ECO ${eco}`));
    } else {
      nome.append(h('strong', {}, historico.length ? 'Posição fora do livro de aberturas' : 'Posição inicial'), h('div', { class: 'pequeno suave' }, 'Mova as peças dos dois lados para descobrir o nome da abertura.'));
    }

    lista.innerHTML = '';
    historico.forEach((m, i) => {
      if (i % 2 === 0) lista.append(h('span', { class: 'num' }, `${i / 2 + 1}.`));
      lista.append(h('button', { class: i === historico.length - 1 ? 'atual' : '' }, sanPt(m.san)));
    });
    if (!historico.length) lista.append(h('span', { class: 'suave pequeno' }, 'Nenhum lance ainda.'));

    // continuações do repertório
    const sans = historico.map((m) => m.san);
    const continuacoes = new Map();
    for (const r of repertorio) {
      if (r.lances.length <= sans.length) continue;
      if (!sans.every((s, k) => r.lances[k].san === s)) continue;
      const prox = r.lances[sans.length];
      if (prox.anotacao.includes('?')) continue; // erros das armadilhas não são sugestão
      if (!continuacoes.has(prox.san)) continuacoes.set(prox.san, { lance: prox, linhas: [] });
      continuacoes.get(prox.san).linhas.push(r);
    }
    sugestoes.innerHTML = '';
    if (continuacoes.size) {
      sugestoes.append(h('h3', {}, 'No seu repertório'));
      for (const { lance, linhas } of continuacoes.values()) {
        sugestoes.append(
          h(
            'button',
            { class: 'cartao', onclick: () => jogar({ from: lance.from, to: lance.to, promotion: lance.promotion }) },
            h('div', { class: 'cartao-titulo' }, sanPt(lance.san)),
            h('div', { class: 'pequeno suave' }, [...new Set(linhas.map((r) => `${r.ab.nome}: ${r.l.nome}`))].slice(0, 3).join(' · ')),
          ),
        );
      }
    }
    tabuleiro.setSetas([...continuacoes.values()].slice(0, 4).map(({ lance }) => ({ de: lance.from, para: lance.to, cor: 'verde' })));
  }

  atualizar();
}
