// Início, lições de tática, progresso, ajustes e sobre.

import { Chess } from '../vendor/chess.js';
import { Tabuleiro } from '../tabuleiro.js';
import { h, armazenamento, config, hoje, sanPt, somDoLance } from '../util.js';
import { estadoPuzzles, provisorio } from '../rating.js';
import { ABERTURAS } from '../../dados/aberturas.js';
import { LICOES, NOMES_TEMAS } from '../../dados/temas.js';
import { lerLinha } from '../linhas.js';
import { linhasParaRevisar, progressoLinha, NIVEL_DOMINADA, resumoAbertura } from './aberturas.js';
import { carregarPuzzles } from './puzzles.js';

// ------------------------------------------------------------ início

export function telaInicio(raiz, _params, app) {
  app.titulo('Lance a Lance');
  const e = estadoPuzzles();
  const dia = e.porDia[hoje()] || [0, 0];
  const revisar = linhasParaRevisar().length;

  raiz.append(
    h(
      'a',
      { class: 'cartao', href: '#/puzzles' },
      h(
        'div',
        { class: 'cartao-linha' },
        h('div', { class: 'icone-grande' }, h('img', { src: 'img/pecas/wN.svg', alt: '' })),
        h(
          'div',
          { class: 'crescer' },
          h('div', { class: 'cartao-titulo' }, 'Resolver puzzles'),
          h('div', { class: 'suave pequeno' }, `Rating ${e.rating}${provisorio(e) ? '?' : ''} · hoje: ${dia[0]}/${dia[1]}`),
        ),
      ),
    ),
    h(
      'a',
      { class: 'cartao', href: revisar ? '#/revisar' : '#/aberturas' },
      h(
        'div',
        { class: 'cartao-linha' },
        h('div', { class: 'icone-grande' }, h('img', { src: 'img/pecas/bB.svg', alt: '' })),
        h(
          'div',
          { class: 'crescer' },
          h('div', { class: 'cartao-titulo' }, revisar ? `Revisar aberturas (${revisar})` : 'Aprender aberturas'),
          h('div', { class: 'suave pequeno' }, revisar ? 'Algumas linhas estão no dia de revisão.' : `${ABERTURAS.length} aberturas e armadilhas comentadas lance a lance`),
        ),
      ),
    ),
    h(
      'a',
      { class: 'cartao', href: '#/licoes' },
      h(
        'div',
        { class: 'cartao-linha' },
        h('div', { class: 'icone-grande' }, h('img', { src: 'img/pecas/wQ.svg', alt: '' })),
        h(
          'div',
          { class: 'crescer' },
          h('div', { class: 'cartao-titulo' }, 'Lições de tática'),
          h('div', { class: 'suave pequeno' }, 'Garfo, cravada, espeto, mates… com exemplos e treino'),
        ),
      ),
    ),
  );

  const instalar = h('div');
  raiz.append(instalar);
  app.mostrarDicaInstalacao(instalar);

  const contagem = h('p', { class: 'suave pequeno', style: { textAlign: 'center', marginTop: '18px' } });
  raiz.append(contagem);
  carregarPuzzles()
    .then((lista) => {
      contagem.textContent = `${lista.length.toLocaleString('pt-BR')} puzzles e ${ABERTURAS.reduce((n, a) => n + a.linhas.length, 0)} linhas de abertura no aparelho. Funciona sem internet.`;
    })
    .catch(() => {});
}

// ------------------------------------------------------------ lições

export function telaLicoes(raiz, _params, app) {
  app.titulo('Lições de tática');
  raiz.append(h('p', { class: 'suave' }, 'Cada lição explica um padrão tático com um exemplo. Depois, pratique com puzzles daquele tema.'));
  const e = estadoPuzzles();
  for (const l of LICOES) {
    const t = e.porTema[l.tema];
    raiz.append(
      h(
        'a',
        { class: 'cartao', href: `#/licao/${l.tema}` },
        h('div', { class: 'cartao-titulo' }, l.titulo),
        h('div', { class: 'suave pequeno' }, t ? `Você acertou ${t[0]} de ${t[1]} puzzles deste tema` : l.texto[0].slice(0, 90) + '…'),
      ),
    );
  }
}

export function telaLicao(raiz, { tema }, app) {
  const l = LICOES.find((x) => x.tema === tema);
  if (!l) return app.ir('#/licoes');
  app.titulo(l.titulo);
  for (const p of l.texto) raiz.append(h('p', {}, p));
  if (l.exemplo) {
    raiz.classList.add('tela-tabuleiro');
    raiz.style.paddingTop = '12px';
    const lances = [];
    const j = new Chess(l.exemplo.fen);
    for (const lance of lerLinha(l.exemplo.lances)) {
      const m = j.move(lance.san);
      lances.push({ ...lance, from: m.from, to: m.to, san: m.san, fen: j.fen(), capturou: !!m.captured });
    }
    const area = h('div', { class: 'area-tabuleiro' });
    const comentario = h('div', { class: 'comentario' });
    raiz.append(
      h('h3', {}, 'Exemplo'),
      area,
      comentario,
      h(
        'div',
        { class: 'navegacao' },
        h('button', { class: 'botao', 'aria-label': 'Início', onclick: () => ir(0) }, '⏮'),
        h('button', { class: 'botao', 'aria-label': 'Anterior', onclick: () => ir(pos - 1) }, '◀'),
        h('button', { class: 'botao primario', 'aria-label': 'Próximo', onclick: () => ir(pos + 1) }, '▶'),
        h('button', { class: 'botao', 'aria-label': 'Fim', onclick: () => ir(lances.length) }, '⏭'),
      ),
    );
    const vez = new Chess(l.exemplo.fen).turn();
    const tabuleiro = new Tabuleiro(area, { orientacao: vez });
    let pos = 0;
    const ir = (n) => {
      n = Math.max(0, Math.min(lances.length, n));
      const avancou = n === pos + 1;
      pos = n;
      tabuleiro.setPosicao(n === 0 ? l.exemplo.fen : lances[n - 1].fen);
      const u = lances[n - 1];
      tabuleiro.setMarcas({ ultimo: u ? [u.from, u.to] : [] });
      const prox = lances[n];
      tabuleiro.setSetas(prox ? [{ de: prox.from, para: prox.to, cor: 'verde' }] : []);
      if (avancou) somDoLance({ captured: u.capturou });
      comentario.innerHTML = '';
      if (n === 0) comentario.append(`${vez === 'w' ? 'Brancas' : 'Pretas'} jogam. Toque em ▶ para ver a ideia.`);
      else comentario.append(h('span', { class: 'lance-atual' }, sanPt(u.san)), u.comentario || '');
    };
    ir(0);
  }
  raiz.append(h('div', { class: 'botoes' }, h('a', { class: 'botao primario', href: `#/puzzles/${l.tema}` }, `Praticar: ${NOMES_TEMAS[l.tema] || l.titulo}`)));
}

// ------------------------------------------------------------ progresso

function grafico(historico) {
  const pontos = historico.slice(-120).map((p) => p[1]);
  if (pontos.length < 2) return h('p', { class: 'suave pequeno' }, 'Resolva alguns puzzles para ver seu gráfico.');
  const min = Math.min(...pontos) - 20;
  const max = Math.max(...pontos) + 20;
  const w = 300;
  const altura = 100;
  const coords = pontos.map((v, i) => [(i / (pontos.length - 1)) * w, altura - ((v - min) / (max - min)) * altura]);
  const linha = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${altura}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'grafico');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Evolução do rating: de ${pontos[0]} para ${pontos.at(-1)}`);
  svg.innerHTML = `<path class="area-grafico" d="${linha} L${w},${altura} L0,${altura} Z"/><path class="linha-grafico" d="${linha}"/>`;
  return svg;
}

export function telaProgresso(raiz, _params, app) {
  app.titulo('Progresso');
  const e = estadoPuzzles();
  const taxa = e.jogos ? Math.round((100 * e.acertos) / e.jogos) : 0;
  raiz.append(
    h('h2', {}, 'Puzzles'),
    h(
      'div',
      { class: 'grade-2' },
      h('div', { class: 'cartao' }, h('div', { class: 'suave pequeno' }, 'Rating'), h('div', { class: 'numero-grande' }, e.rating + (provisorio(e) ? '?' : ''))),
      h('div', { class: 'cartao' }, h('div', { class: 'suave pequeno' }, 'Acertos'), h('div', { class: 'numero-grande' }, `${taxa}%`), h('div', { class: 'suave pequeno' }, `${e.acertos} de ${e.jogos}`)),
      h('div', { class: 'cartao' }, h('div', { class: 'suave pequeno' }, 'Melhor sequência'), h('div', { class: 'numero-grande' }, e.melhorSequencia)),
      h('div', { class: 'cartao' }, h('div', { class: 'suave pequeno' }, 'Hoje'), h('div', { class: 'numero-grande' }, (e.porDia[hoje()] || [0, 0])[1])),
    ),
    h('div', { class: 'cartao' }, h('div', { class: 'suave pequeno' }, 'Evolução do rating'), grafico(e.historico)),
  );
  if (provisorio(e)) raiz.append(h('p', { class: 'suave pequeno' }, 'O "?" indica rating provisório: ele se ajusta rápido nos primeiros 15 puzzles.'));

  const temas = Object.entries(e.porTema)
    .filter(([t, v]) => NOMES_TEMAS[t] && v[1] >= 1 && !['umLance', 'curto', 'longo', 'muitoLongo', 'meioJogo', 'abertura', 'mate', 'vantagem'].includes(t))
    .sort((a, b) => b[1][1] - a[1][1]);
  if (temas.length) {
    const tabela = h('table', { class: 'tabela-temas' });
    for (const [t, [ok, total]] of temas) {
      tabela.append(h('tr', {}, h('td', {}, h('a', { href: `#/puzzles/${t}` }, NOMES_TEMAS[t])), h('td', {}, `${Math.round((100 * ok) / total)}% (${ok}/${total})`)));
    }
    raiz.append(h('h3', {}, 'Por tema'), h('div', { class: 'cartao' }, tabela));
    const fracos = temas.filter(([, [ok, total]]) => total >= 4).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
    if (fracos.length) {
      const [t] = fracos[0];
      raiz.append(h('p', { class: 'pequeno' }, 'Ponto a melhorar: ', h('a', { href: `#/puzzles/${t}` }, NOMES_TEMAS[t])));
    }
  }

  raiz.append(h('h2', {}, 'Aberturas'));
  let dominadas = 0;
  let total = 0;
  let treinadas = 0;
  for (const ab of ABERTURAS) {
    ab.linhas.forEach((_, i) => {
      const p = progressoLinha(ab, i);
      total++;
      if (p.treinos) treinadas++;
      if (p.nivel >= NIVEL_DOMINADA) dominadas++;
    });
  }
  raiz.append(
    h(
      'div',
      { class: 'cartao' },
      h('div', {}, `${dominadas} de ${total} linhas dominadas · ${treinadas} já treinadas`),
      h('div', { class: 'barra' }, h('span', { style: { width: `${(100 * dominadas) / total}%` } })),
    ),
  );
  const lista = h('ul', { class: 'lista' });
  for (const ab of ABERTURAS) {
    const r = resumoAbertura(ab);
    lista.append(h('li', {}, h('a', { href: `#/abertura/${ab.id}` }, ab.nome), h('span', { class: 'suave pequeno' }, ` · ${r.dominadas}/${r.total}`)));
  }
  raiz.append(h('div', { class: 'cartao' }, lista));
  raiz.append(
    h('div', { class: 'botoes' }, h('a', { class: 'botao', href: '#/ajustes' }, 'Ajustes e backup'), h('a', { class: 'botao', href: '#/sobre' }, 'Sobre')),
  );
}

// ------------------------------------------------------------ ajustes

function interruptor(rotulo, chave, aoMudar) {
  const input = h('input', { type: 'checkbox', role: 'switch', 'aria-label': rotulo });
  input.checked = !!config()[chave];
  input.addEventListener('change', () => {
    salvarConfig({ [chave]: input.checked });
    aoMudar?.();
  });
  return h('label', { class: 'campo' }, h('span', {}, rotulo), h('span', { class: 'interruptor' }, input, h('span')));
}

function seletor(rotulo, chave, opcoes, aoMudar) {
  const sel = h('select', { 'aria-label': rotulo }, ...opcoes.map(([v, t]) => h('option', { value: v }, t)));
  sel.value = config()[chave] ?? opcoes[0][0];
  sel.addEventListener('change', () => {
    salvarConfig({ [chave]: sel.value });
    aoMudar?.();
  });
  return h('label', { class: 'campo' }, h('span', {}, rotulo), sel);
}

function salvarConfig(mudanca) {
  armazenamento.gravar('config', { ...armazenamento.ler('config', {}), ...mudanca });
}

export function telaAjustes(raiz, _params, app) {
  app.titulo('Ajustes');
  raiz.append(
    h(
      'div',
      { class: 'cartao' },
      interruptor('Sons', 'som'),
      interruptor('Vibrar ao errar', 'vibrar'),
      interruptor('Coordenadas no tabuleiro', 'coordenadas', app.aplicarConfig),
      seletor('Cores do tabuleiro', 'tema', [['marrom', 'Marrom'], ['verde', 'Verde'], ['azul', 'Azul'], ['cinza', 'Cinza']], app.aplicarConfig),
      seletor('Aparência', 'cores', [['auto', 'Automática'], ['claro', 'Clara'], ['escuro', 'Escura']], app.aplicarConfig),
    ),
    h('h2', {}, 'Backup do progresso'),
    h('p', { class: 'suave pequeno' }, 'Seu progresso fica salvo só neste aparelho. Exporte um arquivo para guardar ou levar para outro celular.'),
  );
  const arquivo = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  arquivo.addEventListener('change', async () => {
    const f = arquivo.files[0];
    if (!f) return;
    try {
      const dados = JSON.parse(await f.text());
      if (!dados || typeof dados !== 'object' || !dados.app || dados.app !== 'lance-a-lance') throw new Error();
      armazenamento.substituirTudo(dados.dados);
      app.aplicarConfig();
      app.aviso('Progresso importado!');
    } catch {
      app.aviso('Arquivo inválido.');
    }
  });
  raiz.append(
    arquivo,
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao',
          onclick: () => {
            const blob = new Blob([JSON.stringify({ app: 'lance-a-lance', versao: 1, data: new Date().toISOString(), dados: armazenamento.tudo() })], {
              type: 'application/json',
            });
            const a = h('a', { href: URL.createObjectURL(blob), download: `lance-a-lance-backup-${hoje()}.json` });
            document.body.append(a);
            a.click();
            a.remove();
          },
        },
        'Exportar',
      ),
      h('button', { class: 'botao', onclick: () => arquivo.click() }, 'Importar'),
    ),
    h('h2', {}, 'Recomeçar'),
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao perigo',
          onclick: () => {
            if (confirm('Apagar o progresso dos puzzles (rating e histórico)?')) {
              armazenamento.gravar('puzzles', {});
              app.aviso('Progresso dos puzzles apagado.');
            }
          },
        },
        'Zerar puzzles',
      ),
      h(
        'button',
        {
          class: 'botao perigo',
          onclick: () => {
            if (confirm('Apagar o progresso das aberturas?')) {
              armazenamento.gravar('aberturas', {});
              app.aviso('Progresso das aberturas apagado.');
            }
          },
        },
        'Zerar aberturas',
      ),
    ),
  );
}

// ------------------------------------------------------------ sobre

export function telaSobre(raiz, _params, app) {
  app.titulo('Sobre');
  raiz.append(
    h('p', {}, h('strong', {}, 'Lance a Lance'), ' é um app de xadrez para treinar táticas e aprender aberturas, feito para funcionar 100% offline depois de instalado.'),
    h('h2', {}, 'Como funciona sem internet'),
    h('p', {}, 'Na primeira visita, o app guarda todos os arquivos (puzzles, aberturas, imagens) no aparelho. Depois disso, abre e funciona normalmente sem conexão. Seu progresso fica salvo apenas no aparelho.'),
    h('h2', {}, 'Os puzzles'),
    h(
      'p',
      {},
      'Foram gerados com o motor Stockfish a partir de milhares de partidas: o programa encontra lances que parecem bons mas perdem para uma tática, e só aceita o puzzle se a solução for única. A dificuldade é estimada pela profundidade de cálculo necessária.',
    ),
    h('h2', {}, 'Créditos e licenças'),
    h(
      'ul',
      { class: 'ideias pequeno' },
      h('li', {}, 'Regras do xadrez: chess.js, de Jeff Hlywa (licença BSD-2).'),
      h('li', {}, 'Peças: conjunto "cburnett", de Colin M.L. Burnett (CC BY-SA 3.0).'),
      h('li', {}, 'Nomes das aberturas: base lichess-org/chess-openings (domínio público, CC0).'),
      h('li', {}, 'Puzzles gerados com o Stockfish (GPL-3.0), que não é distribuído com o app.'),
    ),
    h('p', { class: 'suave pequeno' }, `Versão ${app.versao}`),
  );
}
