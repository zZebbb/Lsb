// Teclado numérico grande na própria tela (o teclado do sistema cobre metade da tela e
// muda de lugar entre aparelhos) e a fileira de casas que mostra os dígitos digitados.

import { h, icone, som } from './util.js';

export function tecladoNumerico({ aoDigitar, aoApagar, aoConfirmar }) {
  const tecla = (rotulo, acao, classe = '') =>
    h(
      'button',
      {
        type: 'button',
        class: `tecla ${classe}`,
        onclick: () => {
          som.toque();
          acao();
        },
      },
      rotulo,
    );
  const ok = tecla('OK', aoConfirmar, 'tecla-ok');
  const el = h(
    'div',
    { class: 'teclado' },
    ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => tecla(d, () => aoDigitar(d))),
    tecla(icone('apagar', 28), aoApagar, 'tecla-apagar'),
    tecla('0', () => aoDigitar('0')),
    ok,
  );
  el.querySelector('.tecla-apagar').setAttribute('aria-label', 'Apagar');

  // teclado físico (computador ou teclado bluetooth)
  const aoTeclar = (e) => {
    if (e.target.closest?.('input, textarea')) return;
    if (/^\d$/.test(e.key)) aoDigitar(e.key);
    else if (e.key === 'Backspace') aoApagar();
    else if (e.key === 'Enter') aoConfirmar();
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', aoTeclar);
  return {
    el,
    ok,
    desligar: () => document.removeEventListener('keydown', aoTeclar),
  };
}

// Fileira de casas: uma por dígito esperado; as preenchidas "pulam" ao receber o número.
// Com `livre`, as casas vazias ficam escondidas (para não entregar quantos dígitos são).
export function campoDigitos(total, { livre = false } = {}) {
  const casas = Array.from({ length: total }, () => h('span', { class: 'casa-digito' }));
  const el = h('div', { class: `casas-digitos${livre ? ' livre' : ''}`, 'aria-live': 'polite' }, ...casas);
  if (total > 12 && !livre) el.classList.add('muitas');
  let valor = '';
  const desenhar = () => {
    casas.forEach((c, i) => {
      c.textContent = valor[i] || '';
      c.classList.toggle('cheia', i < valor.length);
      c.classList.toggle('atual', i === valor.length);
    });
  };
  desenhar();
  return {
    el,
    get valor() {
      return valor;
    },
    get cheio() {
      return valor.length >= total;
    },
    digitar(d) {
      if (valor.length >= total) return;
      valor += d;
      desenhar();
    },
    apagar() {
      valor = valor.slice(0, -1);
      desenhar();
    },
    limpar() {
      valor = '';
      desenhar();
    },
  };
}
