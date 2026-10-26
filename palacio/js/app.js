// Ponto de entrada: rotas, barra superior, cores de cada seção e modo offline.

import { config, h } from './util.js';
import { telaInicio, telaProgresso, telaAjustes } from './telas/inicio.js';
import { telaNumeros } from './telas/numeros.js';
import { telaPalavras } from './telas/palavras.js';
import { telaBaralhos, telaBaralho, telaEditarCartao, telaImportar, telaEstudar } from './telas/cartoes.js';
import { telaSistema, telaPalavrasSistema, telaTreinoSistema } from './telas/sistema.js';

const VERSAO = '1.0.0';

// [padrão, tela, cor da seção, rota "pai" para o botão voltar]
const ROTAS = [
  [/^#?\/?$/, telaInicio, 'inicio', null],
  [/^#\/numeros$/, telaNumeros, 'coral', '#/'],
  [/^#\/palavras$/, telaPalavras, 'lima', '#/'],
  [/^#\/cartoes$/, telaBaralhos, 'ciano', '#/'],
  [/^#\/baralho\/(?<id>[\w-]+)$/, telaBaralho, 'ciano', '#/cartoes'],
  [/^#\/baralho\/(?<baralho>[\w-]+)\/novo$/, telaEditarCartao, 'ciano', (p) => `#/baralho/${p.baralho}`],
  [/^#\/baralho\/(?<baralho>[\w-]+)\/importar$/, telaImportar, 'ciano', (p) => `#/baralho/${p.baralho}`],
  [/^#\/cartao\/(?<baralho>[\w-]+)\/(?<id>[\w-]+)$/, telaEditarCartao, 'ciano', (p) => `#/baralho/${p.baralho}`],
  [/^#\/estudar\/(?<id>[\w-]+)$/, telaEstudar, 'ciano', (p) => (p.id === 'todos' ? '#/cartoes' : `#/baralho/${p.id}`)],
  [/^#\/sistema$/, telaSistema, 'violeta', '#/'],
  [/^#\/sistema\/palavras$/, telaPalavrasSistema, 'violeta', '#/sistema'],
  [/^#\/sistema\/treino\/(?<tipo>[\w-]+)$/, telaTreinoSistema, 'violeta', '#/sistema'],
  [/^#\/progresso$/, telaProgresso, 'sol', '#/'],
  [/^#\/ajustes$/, telaAjustes, 'creme', '#/progresso'],
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
    document.title = t === 'Palácio' ? t : `${t} · Palácio`;
  },
  ir(rota) {
    if (location.hash === rota) navegar();
    else location.hash = rota;
  },
  // troca o destino do botão voltar (ex.: durante uma partida, volta para a tela inicial do jogo)
  definirVoltar(rota) {
    pai = rota;
    voltar.hidden = !pai;
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
    if (c.cores === 'claro' || c.cores === 'escuro') raiz.dataset.temaCor = c.cores;
    else delete raiz.dataset.temaCor;
    const escuro = c.cores === 'escuro' || (c.cores !== 'claro' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name=theme-color]').content = escuro ? '#16131f' : '#fff6ea';
  },
  mostrarDicaInstalacao(alvo) {
    const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (instalado) return;
    if (pedidoInstalacao) {
      alvo.append(
        h(
          'div',
          { class: 'bloco aviso-instalar' },
          h('strong', {}, 'Instale no celular'),
          h('p', { class: 'pequeno' }, 'Fica na tela inicial como um app e abre sem internet.'),
          h(
            'button',
            {
              class: 'botao escuro',
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
          { class: 'bloco aviso-instalar pequeno' },
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
  for (const [padrao, render, cor, rotaPai] of ROTAS) {
    const m = hash.match(padrao);
    if (!m) continue;
    const params = { ...(m.groups || {}) };
    for (const k of Object.keys(params)) if (params[k] === undefined) delete params[k];
    document.documentElement.dataset.secao = cor;
    app.definirVoltar(typeof rotaPai === 'function' ? rotaPai(params) : rotaPai);
    window.scrollTo(0, 0);
    try {
      limpar = (await render(tela, params, app)) || null;
    } catch (erro) {
      console.error(erro);
      tela.append(h('div', { class: 'bloco' }, 'Algo deu errado ao abrir esta tela. ', h('a', { href: '#/' }, 'Voltar ao início')));
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
  // pede ao navegador para não apagar os dados salvos (progresso, cartões) quando faltar espaço
  navigator.storage?.persist?.().catch(() => {});
}

navegar();
