// Foguinho: acertos seguidos e rápidos acendem uma chama com a contagem.
// A chama aparece no 3º acerto seguido, cresce a cada novo acerto e explode a cada 5
// (5, 10, 15…). Errar, ou acertar devagar, apaga a chama.

import { h, svg, som, animar } from './util.js';

const PARA_ACENDER = 3;
const MARCO = 5;

function desenhoChama() {
  return svg(
    'svg',
    { viewBox: '0 0 64 80', class: 'chama', 'aria-hidden': 'true' },
    svg('path', {
      class: 'chama-fora',
      d: 'M32 2C36 14 50 22 54 38C58 54 52 72 32 78C12 72 6 56 10 42C12 34 18 30 20 22C24 30 26 34 30 34C28 24 28 12 32 2Z',
    }),
    svg('path', {
      class: 'chama-meio',
      d: 'M32 28C36 38 46 44 46 56C46 68 40 74 32 76C24 74 18 68 18 58C18 50 22 46 24 40C26 46 28 48 31 48C30 42 30 34 32 28Z',
    }),
    svg('path', { class: 'chama-dentro', d: 'M32 48C35 54 40 58 40 64C40 70 36 74 32 74C28 74 24 70 24 65C24 60 29 56 32 48Z' }),
  );
}

// `raiz` é a tela do jogo (a chama fica por cima do palco); `lugar`: 'canto' ou 'topo'.
export function criarFogo(raiz, { lugar = 'canto' } = {}) {
  let seguidos = 0;
  let melhor = 0;
  let apagando = null;
  const numero = h('span', { class: 'fogo-numero' });
  const corpo = h(
    'div',
    { class: 'fogo-corpo' },
    desenhoChama(),
    numero,
    ...Array.from({ length: 5 }, () => h('span', { class: 'brasa' })),
  );
  const el = h('div', { class: `fogo fogo-${lugar}`, role: 'status', hidden: true }, corpo);
  raiz.append(el);

  function apagar() {
    if (seguidos >= PARA_ACENDER && !el.hidden) {
      el.classList.add('apagando');
      clearTimeout(apagando);
      apagando = setTimeout(() => {
        el.hidden = true;
        el.classList.remove('apagando');
      }, 450);
    }
    seguidos = 0;
  }

  function explodir() {
    const palco = raiz.querySelector('.palco, .cartao-estudo');
    const grande = h('div', { class: 'fogo-explosao', 'aria-hidden': 'true' }, desenhoChama(), h('strong', {}, `${seguidos} seguidas!`));
    if (palco) grande.style.top = `${palco.offsetTop + palco.offsetHeight / 2}px`;
    raiz.append(grande);
    som.fogoGrande();
    setTimeout(() => grande.remove(), 1400);
  }

  return {
    get melhor() {
      return melhor;
    },
    // `rapido`: se o acerto foi dentro do tempo; acerto lento também apaga a chama
    acerto(rapido) {
      if (!rapido) return apagar();
      seguidos++;
      melhor = Math.max(melhor, seguidos);
      if (seguidos < PARA_ACENDER) return;
      numero.textContent = String(seguidos);
      el.setAttribute('aria-label', `${seguidos} acertos rápidos seguidos`);
      corpo.style.setProperty('--tamanho', String(Math.min(1.7, 1 + (seguidos - PARA_ACENDER) * 0.07)));
      clearTimeout(apagando);
      el.classList.remove('apagando');
      if (seguidos === PARA_ACENDER) {
        el.hidden = false;
        animar(el, 'acender');
        som.fogo();
      } else animar(el, 'aticar');
      if (seguidos % MARCO === 0) explodir();
    },
    erro: apagar,
    // começo de partida: sem chama e sem recorde da partida anterior
    reiniciar() {
      seguidos = 0;
      melhor = 0;
      clearTimeout(apagando);
      el.hidden = true;
      el.classList.remove('apagando');
    },
  };
}
