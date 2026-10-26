// Utilidades gerais: armazenamento local, sons, histórico de resultados, datas e DOM.

const PREFIXO = 'palacio:';

export const armazenamento = {
  ler(chave, padrao) {
    try {
      const v = localStorage.getItem(PREFIXO + chave);
      return v === null ? padrao : JSON.parse(v);
    } catch {
      return padrao;
    }
  },
  gravar(chave, valor) {
    try {
      localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    } catch {
      // sem armazenamento (modo privado, cota cheia): o app segue funcionando sem salvar
    }
  },
  tudo() {
    const dados = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(PREFIXO)) dados[k.slice(PREFIXO.length)] = JSON.parse(localStorage.getItem(k));
      }
    } catch {
      // idem
    }
    return dados;
  },
  substituirTudo(dados) {
    try {
      for (const k of Object.keys(this.tudo())) localStorage.removeItem(PREFIXO + k);
      for (const [k, v] of Object.entries(dados)) localStorage.setItem(PREFIXO + k, JSON.stringify(v));
    } catch {
      // idem
    }
  },
};

const CONFIG_PADRAO = {
  som: true,
  vibrar: true,
  cores: 'auto',
  paleta: 'pastel',
  // sequência de números
  tempoNumeros: 'normal',
  inicioNumeros: 1,
  gruposNumeros: 0,
  dicaSistema: true,
  // sistema mnemônico
  faixaSistema: 'todos',
  digitosCriar: 2,
  // cartões
  novosPorDia: 20,
};

export function config() {
  return { ...CONFIG_PADRAO, ...armazenamento.ler('config', {}) };
}

export function salvarConfig(mudanca) {
  armazenamento.gravar('config', { ...armazenamento.ler('config', {}), ...mudanca });
}

// ------------------------------------------------------------------ sons

let audio = null;

function tom(freq, duracao, { tipo = 'sine', volume = 0.15, atraso = 0, ate = null } = {}) {
  if (!config().som) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime + atraso;
    const osc = audio.createOscillator();
    const ganho = audio.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t + duracao);
    ganho.gain.setValueAtTime(volume, t);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    osc.connect(ganho).connect(audio.destination);
    osc.start(t);
    osc.stop(t + duracao);
  } catch {
    // sem áudio: tudo bem
  }
}

function vibrar(ms) {
  if (config().vibrar) navigator.vibrate?.(ms);
}

export const som = {
  toque: () => tom(520, 0.05, { tipo: 'triangle', volume: 0.12 }),
  virar: () => tom(300, 0.12, { tipo: 'triangle', volume: 0.1, ate: 600 }),
  acerto: () => {
    tom(660, 0.1, { volume: 0.12 });
    tom(990, 0.16, { volume: 0.12, atraso: 0.08 });
  },
  erro: () => {
    tom(220, 0.2, { tipo: 'sawtooth', volume: 0.06, ate: 140 });
    vibrar(90);
  },
  fim: () => {
    tom(523, 0.12, { volume: 0.12 });
    tom(659, 0.12, { volume: 0.12, atraso: 0.1 });
    tom(784, 0.25, { volume: 0.12, atraso: 0.2 });
  },
  recorde: () => {
    [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.18, { tipo: 'triangle', volume: 0.14, atraso: i * 0.09 }));
    vibrar([40, 40, 80]);
  },
};

// ------------------------------------------------------------------ datas

export function diaDe(data) {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function hoje() {
  return diaDe(Date.now());
}

export function inicioDoDia(data = Date.now()) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const MINUTO = 60 * 1000;
export const DIA = 24 * 60 * MINUTO;

// ------------------------------------------------------------------ atividade e recordes

// Conta quantas coisas foram feitas em cada dia (partidas, revisões), para a sequência de dias e o calendário.
export function registrarAtividade(quantidade = 1) {
  const atividade = armazenamento.ler('atividade', {});
  const d = hoje();
  atividade[d] = (atividade[d] || 0) + quantidade;
  armazenamento.gravar('atividade', atividade);
}

export function diasSeguidos() {
  const atividade = armazenamento.ler('atividade', {});
  let n = 0;
  let dia = new Date();
  // se ainda não treinou hoje, a sequência de ontem continua valendo
  if (!atividade[diaDe(dia)]) dia.setDate(dia.getDate() - 1);
  while (atividade[diaDe(dia)]) {
    n++;
    dia.setDate(dia.getDate() - 1);
  }
  return n;
}

// Guarda o resultado de uma partida e diz se foi recorde.
export function registrarResultado(jogo, valor) {
  const historico = armazenamento.ler('historico', {});
  const lista = historico[jogo] || [];
  const recordeAntes = lista.reduce((m, r) => Math.max(m, r.v), 0);
  lista.push({ t: Date.now(), v: valor });
  historico[jogo] = lista.slice(-300);
  armazenamento.gravar('historico', historico);
  registrarAtividade();
  return { recorde: Math.max(recordeAntes, valor), novoRecorde: valor > recordeAntes && recordeAntes > 0 };
}

export function resultados(jogo) {
  return armazenamento.ler('historico', {})[jogo] || [];
}

export function recorde(jogo) {
  return resultados(jogo).reduce((m, r) => Math.max(m, r.v), 0);
}

// ------------------------------------------------------------------ DOM

export function h(tag, props = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [p, valor] of Object.entries(v)) {
        if (p.startsWith('--')) el.style.setProperty(p, valor);
        else el.style[p] = valor;
      }
    } else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

const SVG = 'http://www.w3.org/2000/svg';

export function svg(tag, props = {}, ...filhos) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(props)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  for (const f of filhos.flat()) if (f) el.append(f);
  return el;
}

// Ícones desenhados à mão (traço grosso, cantos redondos), usados nos blocos.
const ICONES = {
  palacio: 'M3 10l9-6 9 6M5 10v9M9.7 10v9M14.3 10v9M19 10v9M3 20h18',
  numeros: 'M5 8l3-2v12M12 9a2.5 2.5 0 015 0c0 2-5 4.5-5 9h5.5',
  palavras: 'M4 19L9 5l5 14M6 14h6M15 19h5M15 15h5M15 11h5',
  cartoes: 'M7 4h11a2 2 0 012 2v11M4 8h11a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2z',
  progresso: 'M4 20V12M10 20V6M16 20v-9M22 20H2',
  ajustes: 'M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  voltar: 'M15 5l-7 7 7 7',
  coracao: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  fogo: 'M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 1-5.5 1-7.5z',
  raio: 'M13 2L4 14h7l-1 8 9-12h-7z',
  mais: 'M12 5v14M5 12h14',
  fechar: 'M6 6l12 12M18 6L6 18',
  apagar: 'M9 6h11v12H9l-6-6zM12.5 9.5l5 5M17.5 9.5l-5 5',
  certo: 'M5 12.5l4.5 4.5L19 7.5',
  lapis: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  lixo: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  olho: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  tabela: 'M3 5h18v14H3zM3 10h18M3 14.5h18M9 5v14',
  setas: 'M7 7h12l-3-3M17 17H5l3 3',
  relogio: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
};

export function icone(nome, tamanho = 24) {
  return svg(
    'svg',
    { viewBox: '0 0 24 24', width: tamanho, height: tamanho, 'aria-hidden': 'true', class: 'icone' },
    svg('path', { d: ICONES[nome], fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  );
}

export function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

export function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Reinicia uma animação CSS no elemento (para "pular" de novo a cada troca de conteúdo).
export function animar(el, classe) {
  el.classList.remove(classe);
  void el.offsetWidth;
  el.classList.add(classe);
}

export function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
