// "Já vi ou nova?": as palavras aparecem uma a uma e você diz se ela já apareceu nesta
// partida. Três vidas; cada acerto vale um ponto.

import { h, icone, som, registrarResultado, recorde, resultados, embaralhar, sortear, animar } from '../util.js';
import { graficoBarras, confete, cabecalhoJogo, numeroDestaque, media, formatarDecimal } from '../componentes.js';
import { criarFogo } from '../fogo.js';
import { PALAVRAS } from '../../dados/palavras.js';

const VIDAS = 3;
const RAPIDO = 2000; // ms: resposta rápida o bastante para manter o foguinho aceso

// Chance de repetir uma palavra já vista: começa baixa e sobe até metade das rodadas.
function chanceDeRepetir(vistas) {
  if (vistas < 3) return 0.12 * vistas;
  return Math.min(0.5, 0.3 + vistas * 0.01);
}

export function telaPalavras(raiz, _params, app) {
  app.titulo('Já vi ou nova?');
  raiz.classList.add('tela-jogo');
  const palco = h('div', { class: 'palco bloco cor-lima' });
  const abaixo = h('div', { class: 'abaixo-palco' });
  raiz.append(palco, abaixo);
  const fogo = criarFogo(raiz, { lugar: 'topo' });
  let aoTeclar = null;

  function trocar(conteudoPalco, ...conteudoAbaixo) {
    if (aoTeclar) document.removeEventListener('keydown', aoTeclar);
    aoTeclar = null;
    const limpo = (lista) => lista.flat().filter((x) => x !== null && x !== undefined && x !== false);
    palco.replaceChildren(...limpo([conteudoPalco]));
    abaixo.replaceChildren(...limpo(conteudoAbaixo));
  }

  function inicio() {
    app.definirVoltar('#/');
    fogo.reiniciar();
    const hist = resultados('palavras').map((r) => r.v);
    const ultimos = hist.slice(-10);
    trocar(
      [
        cabecalhoJogo('palavras', 'Já vi ou nova?', 'As palavras vão aparecendo. Diga se cada uma já apareceu nesta partida. Você tem 3 vidas, e respostas rápidas seguidas acendem o foguinho.'),
        h(
          'div',
          { class: 'destaques' },
          numeroDestaque(recorde('palavras') || '–', 'recorde'),
          numeroDestaque(ultimos.length ? formatarDecimal(media(ultimos)) : '–', 'média recente'),
          numeroDestaque(hist.length, 'partidas'),
        ),
        h('button', { class: 'botao escuro grande', onclick: () => jogar() }, 'Começar'),
      ],
      h(
        'div',
        { class: 'bloco' },
        h('h3', {}, 'Dica'),
        h(
          'p',
          { class: 'pequeno' },
          'Transforme cada palavra numa imagem rápida e exagerada, e coloque as imagens num caminho que você conhece (sua casa, o trajeto do trabalho). Na dúvida, "passeie" pelo caminho.',
        ),
      ),
      h('div', { class: 'bloco' }, h('h3', {}, 'Últimas partidas'), graficoBarras(hist.slice(-30), { rotulo: 'Pontos' })),
    );
  }

  function jogar() {
    app.definirVoltar('#/palavras');
    const novas = embaralhar(PALAVRAS);
    const vistas = [];
    const jaVistas = new Set();
    let proximaNova = 0;
    let vidas = VIDAS;
    let pontos = 0;
    let atual = null;
    let mostradaEm = 0;
    let travado = false;
    fogo.reiniciar();

    const coracoes = h('div', { class: 'vidas', 'aria-label': `${VIDAS} vidas` }, ...Array.from({ length: VIDAS }, () => h('span', { class: 'vida' }, icone('coracao', 26))));
    const placar = h('div', { class: 'placar' }, h('span', {}, 'Pontos'), h('strong', {}, '0'));
    const palavra = h('div', { class: 'palavra-exibida' });
    const retorno = h('div', { class: 'retorno', 'aria-live': 'polite' });
    const botaoVi = h('button', { class: 'botao resposta cor-sol', onclick: () => responder(true) }, icone('olho', 28), 'Já vi');
    const botaoNova = h('button', { class: 'botao resposta', onclick: () => responder(false) }, icone('mais', 28), 'Nova');

    trocar([h('div', { class: 'barra-jogo' }, coracoes, placar), palavra, retorno], h('div', { class: 'respostas' }, botaoVi, botaoNova));
    aoTeclar = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'v') responder(true);
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') responder(false);
    };
    document.addEventListener('keydown', aoTeclar);

    function sortearPalavra() {
      if (Math.random() < chanceDeRepetir(vistas.length)) {
        const candidatas = vistas.length > 1 ? vistas.filter((p) => p !== atual) : vistas;
        return sortear(candidatas);
      }
      if (proximaNova >= novas.length) return sortear(vistas);
      return novas[proximaNova++];
    }

    function mostrarProxima() {
      atual = sortearPalavra();
      palavra.textContent = atual;
      palavra.style.fontSize = `${Math.max(34, Math.min(76, Math.floor((palco.clientWidth - 40) / (atual.length * 0.6))))}px`;
      animar(palavra, 'pular');
      mostradaEm = performance.now();
      travado = false;
    }

    function responder(disseVi) {
      if (travado) return;
      travado = true;
      const eraVista = jaVistas.has(atual);
      if (!eraVista) {
        jaVistas.add(atual);
        vistas.push(atual);
      }
      if (disseVi === eraVista) {
        som.acerto();
        fogo.acerto(performance.now() - mostradaEm <= RAPIDO);
        pontos++;
        placar.querySelector('strong').textContent = String(pontos);
        animar(placar, 'pular');
        retorno.textContent = '';
        animar(palco, 'brilho');
        setTimeout(mostrarProxima, 160);
        return;
      }
      som.erro();
      fogo.erro();
      vidas--;
      const perdida = coracoes.children[vidas];
      perdida.classList.add('perdida');
      coracoes.setAttribute('aria-label', `${vidas} vidas`);
      retorno.textContent = eraVista ? 'Essa já tinha aparecido!' : 'Essa era nova!';
      animar(retorno, 'pular');
      animar(palco, 'tremer');
      if (vidas <= 0) {
        setTimeout(() => fim(pontos, vistas.length, fogo.melhor), 900);
        return;
      }
      setTimeout(mostrarProxima, 750);
    }

    mostrarProxima();
  }

  function fim(pontos, total, maiorFogo) {
    fogo.reiniciar();
    som.fim();
    const { novoRecorde } = registrarResultado('palavras', pontos);
    const titulo = h('div', { class: 'titulo-resultado' }, novoRecorde ? 'Novo recorde!' : 'Fim de jogo');
    trocar(
      [
        titulo,
        h('div', { class: 'placar-final' }, h('strong', {}, String(pontos)), h('span', {}, pontos === 1 ? 'ponto' : 'pontos')),
        h('p', { class: 'pequeno centro' }, `${total} palavras diferentes apareceram nesta partida.`),
        maiorFogo >= 3 ? h('p', { class: 'centro fogo-resumo' }, icone('fogo', 22), `${maiorFogo} acertos rápidos seguidos`) : null,
      ],
      h(
        'div',
        { class: 'botoes' },
        h('button', { class: 'botao escuro grande', onclick: () => jogar() }, 'Jogar de novo'),
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
  return () => {
    if (aoTeclar) document.removeEventListener('keydown', aoTeclar);
  };
}
