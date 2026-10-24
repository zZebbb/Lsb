// Tela de puzzles: o adversário faz o lance que cria a tática e você encontra a solução.

import { Chess } from '../vendor/chess.js';
import { Tabuleiro } from '../tabuleiro.js';
import { h, som, somDoLance, sanPt, embaralhar } from '../util.js';
import { estadoPuzzles, registrarResultado, provisorio } from '../rating.js';
import { NOMES_TEMAS, TEMAS_FILTRO } from '../../dados/temas.js';

let cache = null;

export function carregarPuzzles() {
  if (!cache) {
    cache = fetch('dados/puzzles.json')
      .then((r) => r.json())
      .then((lista) =>
        lista.map(([id, fen, lances, rating, temas]) => ({
          id,
          fen,
          lances: lances.split(' '),
          rating,
          temas: temas ? temas.split(' ') : [],
        })),
      );
    cache.catch(() => (cache = null));
  }
  return cache;
}

function escolherPuzzle(puzzles, estado, tema, ultimoId) {
  let base = tema ? puzzles.filter((p) => p.temas.includes(tema)) : puzzles;
  let pool = base.filter((p) => !(p.id in estado.resolvidos) && p.id !== ultimoId);
  if (!pool.length) pool = base.filter((p) => p.id !== ultimoId);
  if (!pool.length) pool = base;
  for (const janela of [75, 150, 250, 400, 700]) {
    const perto = pool.filter((p) => Math.abs(p.rating - estado.rating) <= janela);
    if (perto.length >= 3) return embaralhar(perto)[0];
  }
  // ninguém perto do rating: pega o mais próximo
  return [...pool].sort((a, b) => Math.abs(a.rating - estado.rating) - Math.abs(b.rating - estado.rating))[0];
}

function lanceUci(m) {
  return m.from + m.to + (m.promotion || '');
}

function paraObjeto(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

export async function telaPuzzles(raiz, { tema, id } = {}, app) {
  app.titulo(tema ? `Puzzles: ${NOMES_TEMAS[tema] || tema}` : 'Puzzles');
  raiz.classList.add('tela-tabuleiro');

  const infoRating = h('strong');
  const infoSequencia = h('span', { class: 'suave' });
  const barra = h('div', { class: 'barra-info' }, h('span', {}, 'Seu rating: ', infoRating), infoSequencia);
  const area = h('div', { class: 'area-tabuleiro' });
  const status = h('div', { class: 'status vez' });
  const botoes = h('div', { class: 'botoes' });
  const detalhes = h('div');
  const chips = h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Filtrar por tema' });
  raiz.append(barra, area, status, botoes, detalhes, h('h3', { class: 'pequeno suave' }, 'Treinar um tema'), chips);

  let puzzles;
  try {
    puzzles = await carregarPuzzles();
  } catch {
    status.className = 'status errado';
    status.textContent = 'Não foi possível carregar os puzzles.';
    return;
  }

  const contagem = {};
  for (const p of puzzles) for (const t of p.temas) contagem[t] = (contagem[t] || 0) + 1;
  chips.append(
    h('button', { class: 'chip' + (tema ? '' : ' ativo'), onclick: () => app.ir('#/puzzles') }, 'Todos'),
    ...TEMAS_FILTRO.filter((t) => contagem[t] >= 5 || t === tema).map((t) =>
      h('button', { class: 'chip' + (tema === t ? ' ativo' : ''), onclick: () => app.ir('#/puzzles/' + t) }, NOMES_TEMAS[t]),
    ),
  );
  requestAnimationFrame(() => chips.querySelector('.ativo')?.scrollIntoView({ inline: 'center', block: 'nearest' }));

  if (tema && !contagem[tema]) {
    status.className = 'status fim';
    status.textContent = 'Ainda não há puzzles deste tema.';
    return;
  }

  const tabuleiro = new Tabuleiro(area, { aoMover: (m) => aoMover(m) });
  let p = null; // puzzle atual
  let jogo = null;
  let indice = 0; // próximo lance esperado em p.lances
  let errou = false;
  let usouDica = 0;
  let registrado = false;
  let terminado = false;
  let historico = []; // fens para revisão
  let revisando = -1;
  let ultimoId = null;
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

  function atualizarBarra() {
    const e = estadoPuzzles();
    infoRating.textContent = e.rating + (provisorio(e) ? '?' : '');
    infoSequencia.textContent = e.sequencia ? `Sequência: ${e.sequencia}` : `${e.acertos}/${e.jogos} resolvidos`;
  }

  function setStatus(tipo, texto, sub) {
    status.className = 'status ' + tipo;
    const icone = { vez: '', certo: '✓', errado: '✗', fim: '★' }[tipo] || '';
    status.innerHTML = '';
    const iconeEl = h('div', { class: 'status-icone' }, icone);
    if (tipo === 'vez') iconeEl.append(h('span', { class: 'peca-vez ' + jogo.turn() }));
    status.append(iconeEl, h('div', { class: 'status-texto' }, texto, sub ? h('small', {}, sub) : null));
  }

  function nomeCor(cor) {
    return cor === 'w' ? 'brancas' : 'pretas';
  }

  function marcarTabuleiro(ultimo) {
    tabuleiro.setMarcas({
      ultimo: ultimo ? [ultimo.from, ultimo.to] : [],
      xeque: jogo.inCheck() ? encontrarRei(jogo.turn()) : null,
    });
  }

  function encontrarRei(cor) {
    for (const linha of jogo.board()) for (const c of linha) if (c && c.type === 'k' && c.color === cor) return c.square;
    return null;
  }

  function liberar() {
    tabuleiro.setLegais(jogo.moves({ verbose: true }), jogo.turn());
  }

  function montarBotoes() {
    botoes.innerHTML = '';
    if (!terminado) {
      botoes.append(
        h('button', { class: 'botao', onclick: dica }, usouDica ? 'Mostrar lance' : 'Dica'),
        h('button', { class: 'botao', onclick: mostrarSolucao }, 'Ver solução'),
      );
    } else {
      botoes.append(
        h('button', { class: 'botao icone', 'aria-label': 'Lance anterior', onclick: () => rever(-1) }, '◀'),
        h('button', { class: 'botao icone', 'aria-label': 'Próximo lance', onclick: () => rever(1) }, '▶'),
        h('button', { class: 'botao', onclick: () => iniciar(p, true) }, 'Repetir'),
        h('button', { class: 'botao primario', onclick: proximo }, 'Próximo'),
      );
    }
  }

  function mostrarDetalhes() {
    detalhes.innerHTML = '';
    if (!terminado) return;
    detalhes.append(
      h(
        'div',
        { class: 'cartao' },
        h('div', { class: 'pequeno suave' }, `Puzzle de rating ${p.rating}`),
        h('div', {}, ...p.temas.filter((t) => NOMES_TEMAS[t]).map((t) => h('span', { class: 'etiqueta' }, NOMES_TEMAS[t]))),
        h('div', { class: 'pequeno', style: { marginTop: '6px' } }, 'Solução: ', solucaoTexto()),
      ),
    );
  }

  function solucaoTexto() {
    const j = new Chess(p.fen);
    const partes = [];
    p.lances.forEach((uci, i) => {
      const m = j.move(paraObjeto(uci));
      if (i === 0) return;
      const num = j.moveNumber();
      if (m.color === 'w') partes.push(`${num}. ${sanPt(m.san)}`);
      else partes.push((i === 1 ? `${num - 1}... ` : '') + sanPt(m.san));
    });
    return partes.join(' ');
  }

  async function iniciar(puzzle, repeticao = false) {
    for (const t of timers) clearTimeout(t);
    timers.clear();
    p = puzzle;
    ultimoId = p.id;
    jogo = new Chess(p.fen);
    indice = 0;
    errou = false;
    usouDica = 0;
    registrado = repeticao; // repetição não mexe no rating
    terminado = false;
    revisando = -1;
    historico = [p.fen];
    const solver = jogo.turn() === 'w' ? 'b' : 'w';
    tabuleiro.setOrientacao(solver);
    tabuleiro.setPosicao(p.fen, { animar: false });
    tabuleiro.setSetas([]);
    tabuleiro.travar();
    marcarTabuleiro(null);
    atualizarBarra();
    montarBotoes();
    mostrarDetalhes();
    setStatus('fim', 'Observe o lance do adversário…');
    if (!repeticao) app.salvarRota?.(`#/puzzles${tema ? '/' + tema : ''}`);
    await esperar(700);
    jogarAdversario();
    setStatus('vez', `Sua vez: encontre o melhor lance para as ${nomeCor(solver)}.`, repeticao ? 'Repetição (não altera o rating)' : null);
  }

  function jogarAdversario() {
    const m = jogo.move(paraObjeto(p.lances[indice]));
    indice++;
    historico.push(jogo.fen());
    tabuleiro.setPosicao(jogo.fen());
    marcarTabuleiro(m);
    somDoLance(m);
    liberar();
  }

  function registrar(acertou) {
    if (registrado) return null;
    registrado = true;
    const { delta } = registrarResultado(p, acertou);
    atualizarBarra();
    return delta;
  }

  async function aoMover(lance) {
    if (terminado || revisando >= 0) return;
    const esperado = p.lances[indice];
    let m;
    try {
      m = jogo.move(lance);
    } catch {
      return;
    }
    tabuleiro.setSetas([]);
    const certo = lanceUci(m) === esperado || jogo.isCheckmate();
    tabuleiro.setPosicao(jogo.fen());
    marcarTabuleiro(m);
    if (!certo) {
      som.erro();
      tabuleiro.marcar('errado', m.to);
      tabuleiro.tremer();
      tabuleiro.travar();
      if (!errou) {
        errou = true;
        const delta = registrar(false);
        setStatus('errado', 'Não é esse lance. Tente de novo!', delta !== null ? `Rating ${delta >= 0 ? '+' : ''}${delta}` : null);
      } else {
        setStatus('errado', 'Ainda não. Tente outro lance.');
      }
      await esperar(650);
      jogo.undo();
      tabuleiro.setPosicao(jogo.fen());
      marcarTabuleiro(jogo.history({ verbose: true }).at(-1) || ultimoDoHistorico());
      liberar();
      return;
    }
    somDoLance(m);
    tabuleiro.marcar('certo', m.to);
    indice++;
    historico.push(jogo.fen());
    if (indice >= p.lances.length || jogo.isCheckmate()) {
      concluir();
      return;
    }
    tabuleiro.travar();
    setStatus('certo', 'Isso! Continue…');
    await esperar(450);
    jogarAdversario();
    setStatus('vez', 'Boa! E agora, qual o próximo lance?');
  }

  function ultimoDoHistorico() {
    const j = new Chess(p.fen);
    let ultimo = null;
    for (let i = 0; i < indice; i++) ultimo = j.move(paraObjeto(p.lances[i]));
    return ultimo;
  }

  function concluir(viuSolucao = false) {
    terminado = true;
    tabuleiro.travar();
    tabuleiro.setSetas([]);
    const acertou = !errou && !usouDica && !viuSolucao;
    const delta = registrar(acertou);
    const sub = delta !== null ? `Rating ${delta >= 0 ? '+' : ''}${delta}` : null;
    if (acertou) {
      som.fim();
      setStatus('certo', 'Resolvido!', sub);
    } else if (viuSolucao) {
      setStatus('fim', 'Essa era a solução.', sub);
    } else {
      som.acerto();
      setStatus('fim', 'Puzzle concluído.', usouDica ? 'Com dica, não conta como acerto. ' + (sub || '') : sub);
    }
    revisando = -1;
    montarBotoes();
    mostrarDetalhes();
  }

  function dica() {
    if (terminado) return;
    const alvo = paraObjeto(p.lances[indice]);
    usouDica++;
    if (usouDica === 1) {
      tabuleiro.marcar('dica', alvo.from);
      setStatus('vez', 'Dica: a peça destacada é a que deve se mover.');
    } else {
      tabuleiro.setSetas([{ de: alvo.from, para: alvo.to, cor: 'azul' }]);
      setStatus('vez', 'Faça o lance indicado pela seta.');
    }
    montarBotoes();
  }

  async function mostrarSolucao() {
    if (terminado) return;
    tabuleiro.travar();
    terminado = true;
    botoes.innerHTML = '';
    while (indice < p.lances.length) {
      const m = jogo.move(paraObjeto(p.lances[indice]));
      indice++;
      historico.push(jogo.fen());
      tabuleiro.setPosicao(jogo.fen());
      marcarTabuleiro(m);
      somDoLance(m);
      await esperar(800);
    }
    concluir(true);
  }

  function rever(passo) {
    if (!terminado) return;
    if (revisando < 0) revisando = historico.length - 1;
    revisando = Math.min(historico.length - 1, Math.max(0, revisando + passo));
    tabuleiro.setPosicao(historico[revisando]);
    const j = new Chess(p.fen);
    let ultimo = null;
    for (let i = 0; i < revisando; i++) ultimo = j.move(paraObjeto(p.lances[i]));
    tabuleiro.setMarcas({ ultimo: ultimo ? [ultimo.from, ultimo.to] : [] });
  }

  function proximo() {
    const estado = estadoPuzzles();
    iniciar(escolherPuzzle(puzzles, estado, tema, ultimoId));
  }

  const inicial = id ? puzzles.find((x) => x.id === id) : null;
  iniciar(inicial || escolherPuzzle(puzzles, estadoPuzzles(), tema, null));

  return () => {
    for (const t of timers) clearTimeout(t);
  };
}
