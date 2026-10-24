// Tabuleiro interativo: toque para selecionar/mover ou arraste a peça.
// Não conhece as regras: quem usa informa os lances legais (setLegais) e recebe
// o lance escolhido em aoMover({ from, to, promotion }).

const COLUNAS = 'abcdefgh';
const NOMES_PECA = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };

export function lerFen(fen) {
  const pos = new Map();
  const linhas = fen.split(' ')[0].split('/');
  linhas.forEach((linha, i) => {
    let c = 0;
    for (const ch of linha) {
      if (/\d/.test(ch)) {
        c += Number(ch);
      } else {
        const cor = ch === ch.toUpperCase() ? 'w' : 'b';
        pos.set(COLUNAS[c] + (8 - i), cor + NOMES_PECA[ch.toLowerCase()]);
        c++;
      }
    }
  });
  return pos;
}

function coord(casa) {
  return [COLUNAS.indexOf(casa[0]), Number(casa[1]) - 1];
}

export class Tabuleiro {
  constructor(raiz, opcoes = {}) {
    this.raiz = raiz;
    this.op = { orientacao: 'w', aoMover: null, ...opcoes };
    this.orientacao = this.op.orientacao;
    this.posicao = new Map();
    this.elementos = new Map();
    this.legais = new Map();
    this.ladoInterativo = null;
    this.selecionada = null;
    this.arraste = null;
    this.marcas = {};
    this.setas = [];
    this.montar();
  }

  montar() {
    this.raiz.innerHTML = '';
    this.raiz.classList.add('tabuleiro');
    this.camadaCasas = document.createElement('div');
    this.camadaCasas.className = 'tab-casas';
    this.camadaPecas = document.createElement('div');
    this.camadaPecas.className = 'tab-pecas';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'tab-setas');
    this.svg.setAttribute('viewBox', '0 0 800 800');
    this.promocao = document.createElement('div');
    this.promocao.className = 'tab-promocao';
    this.promocao.hidden = true;
    this.raiz.append(this.camadaCasas, this.camadaPecas, this.svg, this.promocao);
    this.casasEl = new Map();
    this.desenharCasas();

    this.raiz.addEventListener('pointerdown', (e) => this.aoPressionar(e));
    this.raiz.addEventListener('pointermove', (e) => this.aoArrastar(e));
    this.raiz.addEventListener('pointerup', (e) => this.aoSoltar(e));
    this.raiz.addEventListener('pointercancel', () => this.cancelarArraste());
    this.raiz.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  desenharCasas() {
    this.camadaCasas.innerHTML = '';
    this.casasEl.clear();
    for (let linha = 7; linha >= 0; linha--) {
      for (let col = 0; col < 8; col++) {
        const c = this.orientacao === 'w' ? col : 7 - col;
        const l = this.orientacao === 'w' ? linha : 7 - linha;
        const casa = COLUNAS[c] + (l + 1);
        const el = document.createElement('div');
        el.className = 'casa ' + ((c + l) % 2 === 0 ? 'escura' : 'clara');
        el.dataset.casa = casa;
        if (linha === 0) {
          const s = document.createElement('span');
          s.className = 'coord coord-col';
          s.textContent = COLUNAS[c];
          el.append(s);
        }
        if (col === 0) {
          const s = document.createElement('span');
          s.className = 'coord coord-lin';
          s.textContent = l + 1;
          el.append(s);
        }
        this.camadaCasas.append(el);
        this.casasEl.set(casa, el);
      }
    }
    this.aplicarMarcas();
  }

  // posição na tela (0..7, 0..7 a partir do canto superior esquerdo)
  tela(casa) {
    const [c, l] = coord(casa);
    return this.orientacao === 'w' ? [c, 7 - l] : [7 - c, l];
  }

  setOrientacao(cor) {
    if (cor === this.orientacao) return;
    this.orientacao = cor;
    this.desenharCasas();
    for (const [casa, el] of this.elementos) this.posicionar(el, casa);
    this.desenharSetas();
  }

  posicionar(el, casa) {
    const [x, y] = this.tela(casa);
    el.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
  }

  criarPeca(codigo, casa) {
    const el = document.createElement('div');
    el.className = 'peca';
    el.style.backgroundImage = `url(img/pecas/${codigo}.svg)`;
    el.dataset.peca = codigo;
    this.posicionar(el, casa);
    this.camadaPecas.append(el);
    return el;
  }

  // Atualiza as peças com animação: peças iguais que mudaram de casa deslizam.
  setPosicao(fen, { animar = true } = {}) {
    const nova = lerFen(fen);
    const antiga = this.posicao;
    const sairam = [];
    const entraram = [];
    for (const [casa, p] of antiga) if (nova.get(casa) !== p) sairam.push(casa);
    for (const [casa, p] of nova) if (antiga.get(casa) !== p) entraram.push(casa);
    const elementos = new Map();
    for (const [casa, el] of this.elementos) if (nova.get(casa) === antiga.get(casa)) elementos.set(casa, el);

    this.camadaPecas.classList.toggle('sem-animacao', !animar);
    const livres = new Set(sairam);
    for (const destino of entraram) {
      const codigo = nova.get(destino);
      let melhor = null;
      let dist = 99;
      for (const origem of livres) {
        if (antiga.get(origem) !== codigo) continue;
        const [a, b] = coord(origem);
        const [c, d] = coord(destino);
        const dd = Math.abs(a - c) + Math.abs(b - d);
        if (dd < dist) {
          dist = dd;
          melhor = origem;
        }
      }
      if (melhor) {
        livres.delete(melhor);
        const el = this.elementos.get(melhor);
        this.posicionar(el, destino);
        elementos.set(destino, el);
      } else {
        const el = this.criarPeca(codigo, destino);
        if (animar) {
          el.classList.add('surgindo');
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('surgindo')));
        }
        elementos.set(destino, el);
      }
    }
    for (const origem of livres) {
      const el = this.elementos.get(origem);
      if (!el) continue;
      if (animar) {
        el.classList.add('capturada');
        setTimeout(() => el.remove(), 220);
      } else {
        el.remove();
      }
    }
    this.posicao = nova;
    this.elementos = elementos;
    this.selecionar(null);
  }

  // lances: lista do chess.js (verbose). lado: cor que pode mover, ou null para travar.
  setLegais(lances, lado) {
    this.legais = new Map();
    for (const m of lances || []) {
      if (!this.legais.has(m.from)) this.legais.set(m.from, []);
      this.legais.get(m.from).push(m);
    }
    this.ladoInterativo = lado;
    this.raiz.classList.toggle('interativo', !!lado);
    this.selecionar(null);
  }

  travar() {
    this.setLegais([], null);
  }

  // marcas: { ultimo: [de, para], xeque: casa, dica: casa, certo: casa, errado: casa }
  setMarcas(marcas) {
    this.marcas = { ...marcas };
    this.aplicarMarcas();
  }

  marcar(nome, valor) {
    this.marcas[nome] = valor;
    this.aplicarMarcas();
  }

  aplicarMarcas() {
    for (const el of this.casasEl.values()) {
      el.classList.remove('ultimo', 'xeque', 'dica', 'certo', 'errado', 'selecionada', 'destino', 'alvo');
    }
    const m = this.marcas;
    for (const casa of m.ultimo || []) this.casasEl.get(casa)?.classList.add('ultimo');
    for (const nome of ['xeque', 'dica', 'certo', 'errado']) if (m[nome]) this.casasEl.get(m[nome])?.classList.add(nome);
    if (this.selecionada) {
      this.casasEl.get(this.selecionada)?.classList.add('selecionada');
      for (const lance of this.legais.get(this.selecionada) || []) {
        this.casasEl.get(lance.to)?.classList.add(this.posicao.has(lance.to) ? 'alvo' : 'destino');
      }
    }
  }

  selecionar(casa) {
    this.selecionada = casa;
    this.aplicarMarcas();
  }

  // setas: [{ de: 'e2', para: 'e4', cor: 'verde' | 'azul' | 'vermelha' }]
  setSetas(setas) {
    this.setas = setas || [];
    this.desenharSetas();
  }

  desenharSetas() {
    const ns = 'http://www.w3.org/2000/svg';
    this.svg.innerHTML = '';
    const defs = document.createElementNS(ns, 'defs');
    for (const cor of ['verde', 'azul', 'vermelha', 'amarela']) {
      const marker = document.createElementNS(ns, 'marker');
      marker.setAttribute('id', 'ponta-' + cor);
      marker.setAttribute('markerWidth', '4');
      marker.setAttribute('markerHeight', '4');
      marker.setAttribute('refX', '2.05');
      marker.setAttribute('refY', '2');
      marker.setAttribute('orient', 'auto');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M0,0 V4 L3,2 Z');
      path.setAttribute('class', 'seta-' + cor);
      marker.append(path);
      defs.append(marker);
    }
    this.svg.append(defs);
    for (const s of this.setas) {
      const [x1, y1] = this.tela(s.de);
      const [x2, y2] = this.tela(s.para);
      const cx1 = x1 * 100 + 50;
      const cy1 = y1 * 100 + 50;
      const cx2 = x2 * 100 + 50;
      const cy2 = y2 * 100 + 50;
      const ang = Math.atan2(cy2 - cy1, cx2 - cx1);
      const recuo = 30;
      const linha = document.createElementNS(ns, 'line');
      linha.setAttribute('x1', cx1);
      linha.setAttribute('y1', cy1);
      linha.setAttribute('x2', cx2 - Math.cos(ang) * recuo);
      linha.setAttribute('y2', cy2 - Math.sin(ang) * recuo);
      linha.setAttribute('class', 'seta-' + (s.cor || 'verde'));
      linha.setAttribute('stroke-width', '16');
      linha.setAttribute('stroke-linecap', 'round');
      linha.setAttribute('marker-end', `url(#ponta-${s.cor || 'verde'})`);
      this.svg.append(linha);
    }
  }

  casaNoPonto(e) {
    const r = this.raiz.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * 8);
    const y = Math.floor(((e.clientY - r.top) / r.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    const c = this.orientacao === 'w' ? x : 7 - x;
    const l = this.orientacao === 'w' ? 7 - y : y;
    return COLUNAS[c] + (l + 1);
  }

  podeMoverDe(casa) {
    const p = this.posicao.get(casa);
    return p && this.ladoInterativo && p[0] === this.ladoInterativo && this.legais.has(casa);
  }

  lancesPara(de, para) {
    return (this.legais.get(de) || []).filter((m) => m.to === para);
  }

  aoPressionar(e) {
    if (!this.ladoInterativo || !this.promocao.hidden) return;
    const casa = this.casaNoPonto(e);
    if (!casa) return;
    if (this.selecionada && this.lancesPara(this.selecionada, casa).length) {
      this.tentarLance(this.selecionada, casa);
      return;
    }
    if (this.podeMoverDe(casa)) {
      const jaSelecionada = this.selecionada === casa;
      this.selecionar(casa);
      const el = this.elementos.get(casa);
      const r = this.raiz.getBoundingClientRect();
      this.arraste = { casa, el, x0: e.clientX, y0: e.clientY, movendo: false, tam: r.width / 8, r, jaSelecionada };
      this.raiz.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    } else {
      this.selecionar(null);
    }
  }

  aoArrastar(e) {
    const a = this.arraste;
    if (!a) return;
    const dx = e.clientX - a.x0;
    const dy = e.clientY - a.y0;
    if (!a.movendo && Math.hypot(dx, dy) < a.tam * 0.15) return;
    a.movendo = true;
    a.el.classList.add('arrastando');
    const x = e.clientX - a.r.left - a.tam / 2;
    const y = e.clientY - a.r.top - a.tam / 2;
    a.el.style.transform = `translate(${x}px, ${y}px)`;
    const sobre = this.casaNoPonto(e);
    for (const el of this.casasEl.values()) el.classList.remove('sobre');
    if (sobre && this.lancesPara(a.casa, sobre).length) this.casasEl.get(sobre).classList.add('sobre');
  }

  aoSoltar(e) {
    const a = this.arraste;
    if (!a) return;
    this.arraste = null;
    for (const el of this.casasEl.values()) el.classList.remove('sobre');
    a.el.classList.remove('arrastando');
    const destino = this.casaNoPonto(e);
    if (a.movendo) {
      if (destino && destino !== a.casa && this.lancesPara(a.casa, destino).length) {
        this.camadaPecas.classList.add('sem-animacao');
        this.posicionar(a.el, destino);
        this.tentarLance(a.casa, destino, true);
        return;
      }
      this.posicionar(a.el, a.casa);
    } else if (a.jaSelecionada) {
      this.selecionar(null);
    }
  }

  cancelarArraste() {
    if (!this.arraste) return;
    this.arraste.el.classList.remove('arrastando');
    this.posicionar(this.arraste.el, this.arraste.casa);
    this.arraste = null;
  }

  tentarLance(de, para) {
    const opcoes = this.lancesPara(de, para);
    const promocoes = opcoes.filter((m) => m.promotion);
    if (promocoes.length) {
      this.escolherPromocao(de, para);
      return;
    }
    this.selecionar(null);
    this.op.aoMover?.({ from: de, to: para });
  }

  escolherPromocao(de, para) {
    const cor = this.posicao.get(de)[0];
    // no toque, o mesmo gesto que abre o seletor ainda gera um "click" logo depois: ignoramos
    const aberto = performance.now();
    const cedo = () => performance.now() - aberto < 350;
    const [x, y] = this.tela(para);
    this.promocao.innerHTML = '';
    this.promocao.hidden = false;
    const coluna = document.createElement('div');
    coluna.className = 'promocao-coluna';
    coluna.style.left = x * 12.5 + '%';
    const deCima = y === 0;
    coluna.style.top = deCima ? '0' : 'auto';
    coluna.style.bottom = deCima ? 'auto' : '0';
    for (const p of ['q', 'n', 'r', 'b']) {
      const b = document.createElement('button');
      b.className = 'promocao-peca';
      b.style.backgroundImage = `url(img/pecas/${cor}${NOMES_PECA[p]}.svg)`;
      b.setAttribute('aria-label', { q: 'Dama', n: 'Cavalo', r: 'Torre', b: 'Bispo' }[p]);
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (cedo()) return;
        this.promocao.hidden = true;
        this.selecionar(null);
        this.op.aoMover?.({ from: de, to: para, promotion: p });
      });
      coluna.append(b);
    }
    this.promocao.append(coluna);
    this.promocao.onclick = () => {
      if (cedo()) return;
      this.promocao.hidden = true;
      // devolve a peça que pode ter sido arrastada
      const el = this.elementos.get(de);
      if (el) this.posicionar(el, de);
      this.selecionar(null);
    };
    this.promocao.onpointerdown = (ev) => ev.stopPropagation();
  }

  // Pequeno tremor para indicar lance errado.
  tremer() {
    this.raiz.classList.remove('tremendo');
    void this.raiz.offsetWidth;
    this.raiz.classList.add('tremendo');
  }
}
