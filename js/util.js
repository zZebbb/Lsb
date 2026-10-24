// Utilidades gerais: armazenamento local, sons, notação em português e DOM.

const PREFIXO = 'lance-a-lance:';

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

export function config() {
  return { som: true, vibrar: true, coordenadas: true, tema: 'marrom', ...armazenamento.ler('config', {}) };
}

// ------------------------------------------------------------------ sons

let audio = null;

function tom(freq, duracao, { tipo = 'sine', volume = 0.15, atraso = 0 } = {}) {
  if (!config().som) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime + atraso;
    const osc = audio.createOscillator();
    const ganho = audio.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    ganho.gain.setValueAtTime(volume, t);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    osc.connect(ganho).connect(audio.destination);
    osc.start(t);
    osc.stop(t + duracao);
  } catch {
    // sem áudio: tudo bem
  }
}

export const som = {
  lance: () => tom(420, 0.07, { tipo: 'triangle', volume: 0.2 }),
  captura: () => {
    tom(300, 0.09, { tipo: 'triangle', volume: 0.25 });
    tom(180, 0.08, { tipo: 'square', volume: 0.05, atraso: 0.02 });
  },
  acerto: () => {
    tom(660, 0.12, { volume: 0.12 });
    tom(880, 0.18, { volume: 0.12, atraso: 0.1 });
  },
  erro: () => {
    tom(200, 0.18, { tipo: 'sawtooth', volume: 0.06 });
    if (config().vibrar) navigator.vibrate?.(90);
  },
  fim: () => {
    tom(523, 0.12, { volume: 0.12 });
    tom(659, 0.12, { volume: 0.12, atraso: 0.1 });
    tom(784, 0.25, { volume: 0.12, atraso: 0.2 });
  },
};

export function somDoLance(m) {
  if (m.captured || (m.flags && m.flags.includes('e'))) som.captura();
  else som.lance();
}

// ------------------------------------------------------------------ notação

const PECA_PT = { K: 'R', Q: 'D', R: 'T', B: 'B', N: 'C' };

// "Nbd2" -> "Cbd2", "exd8=Q+" -> "exd8=D+"
export function sanPt(san) {
  if (!san) return '';
  let s = san;
  if (PECA_PT[s[0]]) s = PECA_PT[s[0]] + s.slice(1);
  return s.replace(/=([QRBN])/, (_, p) => '=' + PECA_PT[p]);
}

// Lista "1. e4 e5 2. Cf3" a partir de SANs e do número do primeiro lance.
export function numerarLances(sans, primeiroBranco = true, numeroInicial = 1) {
  const partes = [];
  let n = numeroInicial;
  let branco = primeiroBranco;
  sans.forEach((san, i) => {
    if (branco) partes.push({ numero: `${n}.`, san, indice: i });
    else partes.push({ numero: i === 0 ? `${n}...` : '', san, indice: i });
    if (!branco) n++;
    branco = !branco;
  });
  return partes;
}

// ------------------------------------------------------------------ DOM

export function h(tag, props = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

export function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
