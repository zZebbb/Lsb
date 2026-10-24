// Ponto de entrada: rotas, barra superior, ajustes visuais e modo offline.

import { config, h } from './util.js';
import { telaPuzzles } from './telas/puzzles.js';
import { telaListaAberturas, telaAbertura, telaEstudar, telaTreinar, telaExplorar, telaPrincipios } from './telas/aberturas.js';
import { telaInicio, telaLicoes, telaLicao, telaProgresso, telaAjustes, telaSobre } from './telas/outras.js';

const VERSAO = '1.0.0';

// [padrão, tela, aba ativa, rota "pai" para o botão voltar]
const ROTAS = [
  [/^#?\/?$/, telaInicio, 'inicio', null],
  [/^#\/puzzles(?:\/(?<tema>\w+))?$/, telaPuzzles, 'puzzles', null],
  [/^#\/puzzle\/(?<id>\w+)$/, telaPuzzles, 'puzzles', '#/puzzles'],
  [/^#\/aberturas$/, telaListaAberturas, 'aberturas', null],
  [/^#\/abertura\/(?<id>[\w-]+)$/, telaAbertura, 'aberturas', '#/aberturas'],
  [/^#\/estudar\/(?<id>[\w-]+)\/(?<linha>\d+)$/, telaEstudar, 'aberturas', (p) => `#/abertura/${p.id}`],
  [/^#\/treinar\/(?<id>[\w-]+)(?:\/(?<linha>\d+))?$/, telaTreinar, 'aberturas', (p) => `#/abertura/${p.id}`],
  [/^#\/revisar$/, (raiz, p, app) => telaTreinar(raiz, { revisao: true }, app), 'aberturas', '#/aberturas'],
  [/^#\/explorar$/, telaExplorar, 'aberturas', '#/aberturas'],
  [/^#\/principios$/, telaPrincipios, 'aberturas', '#/aberturas'],
  [/^#\/licoes$/, telaLicoes, 'inicio', '#/'],
  [/^#\/licao\/(?<tema>\w+)$/, telaLicao, 'inicio', '#/licoes'],
  [/^#\/progresso$/, telaProgresso, 'progresso', null],
  [/^#\/ajustes$/, telaAjustes, 'progresso', '#/progresso'],
  [/^#\/sobre$/, telaSobre, 'progresso', '#/progresso'],
];

const tela = document.getElementById('tela');
const titulo = document.getElementById('titulo');
const voltar = document.getElementById('voltar');
let limpar = null;
let pai = null;
let pedidoInstalacao = null;

const app = {
  versao: VERSAO,
  titulo(t) {
    titulo.textContent = t;
    document.title = t === 'Lance a Lance' ? t : `${t} · Lance a Lance`;
  },
  ir(rota) {
    if (location.hash === rota) navegar();
    else location.hash = rota;
  },
  aviso(texto) {
    document.querySelector('.toast')?.remove();
    const t = h('div', { class: 'toast', role: 'status' }, texto);
    document.body.append(t);
    setTimeout(() => t.remove(), 2600);
  },
  aplicarConfig() {
    const c = config();
    const raiz = document.documentElement;
    raiz.dataset.tabuleiro = c.tema;
    raiz.dataset.coordenadas = c.coordenadas ? 'sim' : 'nao';
    if (c.cores === 'claro' || c.cores === 'escuro') raiz.dataset.temaCor = c.cores;
    else delete raiz.dataset.temaCor;
    const escuro = c.cores === 'escuro' || (c.cores !== 'claro' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name=theme-color]').content = escuro ? '#262421' : '#ffffff';
  },
  mostrarDicaInstalacao(alvo) {
    const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (instalado) return;
    if (pedidoInstalacao) {
      alvo.append(
        h(
          'div',
          { class: 'aviso-caixa' },
          h('strong', {}, 'Instale no celular'),
          h('p', { class: 'pequeno' }, 'Fica na tela inicial como um app e abre sem internet.'),
          h(
            'button',
            {
              class: 'botao primario',
              onclick: async () => {
                pedidoInstalacao.prompt();
                await pedidoInstalacao.userChoice;
                pedidoInstalacao = null;
                alvo.innerHTML = '';
              },
            },
            'Instalar app',
          ),
        ),
      );
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      alvo.append(
        h(
          'div',
          { class: 'aviso-caixa pequeno' },
          h('strong', {}, 'Para instalar no iPhone: '),
          'toque em Compartilhar e depois em "Adicionar à Tela de Início".',
        ),
      );
    }
  },
};

async function navegar() {
  const hash = location.hash || '#/';
  limpar?.();
  limpar = null;
  tela.innerHTML = '';
  tela.className = 'tela';
  tela.removeAttribute('style');
  for (const [padrao, render, aba, rotaPai] of ROTAS) {
    const m = hash.match(padrao);
    if (!m) continue;
    const params = { ...(m.groups || {}) };
    for (const k of Object.keys(params)) if (params[k] === undefined) delete params[k];
    pai = typeof rotaPai === 'function' ? rotaPai(params) : rotaPai;
    voltar.hidden = !pai;
    document.querySelectorAll('.abas a').forEach((a) => a.classList.toggle('ativa', a.dataset.aba === aba));
    window.scrollTo(0, 0);
    try {
      limpar = (await render(tela, params, app)) || null;
    } catch (erro) {
      console.error(erro);
      tela.append(h('div', { class: 'aviso-caixa' }, 'Algo deu errado ao abrir esta tela. ', h('a', { href: '#/' }, 'Voltar ao início')));
    }
    return;
  }
  app.ir('#/');
}

voltar.addEventListener('click', () => {
  if (pai) app.ir(pai);
});

window.addEventListener('hashchange', navegar);

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pedidoInstalacao = e;
  if ((location.hash || '#/') === '#/') navegar();
});

function atualizarOffline() {
  document.getElementById('offline').hidden = navigator.onLine;
}
window.addEventListener('online', atualizarOffline);
window.addEventListener('offline', atualizarOffline);
atualizarOffline();

matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => app.aplicarConfig());
app.aplicarConfig();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  // pede ao navegador para não apagar os dados salvos (progresso) quando faltar espaço
  navigator.storage?.persist?.().catch(() => {});
}

navegar();
