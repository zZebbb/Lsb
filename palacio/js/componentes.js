// Peças de interface usadas em várias telas: opções em "pílulas", interruptor,
// gráfico de barras, confete de blocos e o cabeçalho colorido dos jogos.

import { h, icone, config, salvarConfig } from './util.js';

// Grupo de opções mutuamente exclusivas, salvo na configuração.
export function pilulas(rotulo, chave, opcoes, aoMudar) {
  const atual = config()[chave];
  const botoes = opcoes.map(([valor, texto]) => {
    const b = h('button', { type: 'button', class: 'pilula', 'aria-pressed': String(valor === atual) }, texto);
    b.addEventListener('click', () => {
      salvarConfig({ [chave]: valor });
      botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      aoMudar?.(valor);
    });
    return b;
  });
  return h('div', { class: 'opcao' }, h('span', { class: 'opcao-rotulo' }, rotulo), h('div', { class: 'pilulas', role: 'group', 'aria-label': rotulo }, ...botoes));
}

export function interruptor(rotulo, chave, aoMudar, descricao = null) {
  const input = h('input', { type: 'checkbox', role: 'switch' });
  input.checked = !!config()[chave];
  input.addEventListener('change', () => {
    salvarConfig({ [chave]: input.checked });
    aoMudar?.(input.checked);
  });
  return h(
    'label',
    { class: 'opcao opcao-linha' },
    h('span', { class: 'crescer' }, h('span', { class: 'opcao-rotulo' }, rotulo), descricao && h('span', { class: 'opcao-descricao' }, descricao)),
    h('span', { class: 'interruptor' }, input, h('span')),
  );
}

// Barras dos últimos resultados; a mais alta (recorde) ganha destaque.
export function graficoBarras(valores, { maximo = null, rotulo = '' } = {}) {
  if (!valores.length) return h('p', { class: 'suave pequeno' }, 'Seus resultados vão aparecer aqui.');
  const max = maximo || Math.max(...valores, 1);
  const topo = Math.max(...valores);
  return h(
    'div',
    { class: 'grafico', role: 'img', 'aria-label': `${rotulo}: últimos ${valores.length} resultados, melhor ${topo}` },
    ...valores.map((v, i) =>
      h('span', {
        class: `barra-grafico${v === topo ? ' topo' : ''}`,
        style: { height: `${Math.max(6, (100 * v) / max)}%`, animationDelay: `${i * 25}ms` },
        title: String(v),
      }),
    ),
  );
}

// Chuva de bloquinhos coloridos para comemorar recorde.
export function confete(alvo) {
  const cores = ['var(--coral)', 'var(--lima)', 'var(--violeta)', 'var(--ciano)', 'var(--sol)', 'var(--rosa)'];
  const camada = h('div', { class: 'confete', 'aria-hidden': 'true' });
  for (let i = 0; i < 36; i++) {
    camada.append(
      h('span', {
        style: {
          left: `${Math.random() * 100}%`,
          background: cores[i % cores.length],
          animationDelay: `${Math.random() * 300}ms`,
          animationDuration: `${900 + Math.random() * 700}ms`,
          '--giro': `${Math.random() * 720 - 360}deg`,
          '--desvio': `${Math.random() * 120 - 60}px`,
        },
      }),
    );
  }
  alvo.append(camada);
  setTimeout(() => camada.remove(), 2000);
}

// Bloco grande colorido com ícone, título e uma frase, usado na abertura de cada jogo.
export function cabecalhoJogo(nomeIcone, titulo, texto) {
  return h(
    'div',
    { class: 'cabecalho-jogo' },
    h('span', { class: 'cabecalho-icone' }, icone(nomeIcone, 34)),
    h('h2', {}, titulo),
    h('p', {}, texto),
  );
}

export function numeroDestaque(valor, rotulo) {
  return h('div', { class: 'destaque' }, h('strong', {}, String(valor)), h('span', {}, rotulo));
}

export function media(valores) {
  if (!valores.length) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function formatarDecimal(v, casas = 1) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });
}
