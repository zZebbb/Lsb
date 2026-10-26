// Regras do sistema mnemônico: converte palavras em números (para conferir as palavras que
// você cria) e guarda a sua lista de palavras de 0–9 e 00–99.

import { armazenamento } from './util.js';
import { PALAVRAS_PADRAO } from '../dados/sistema.js';

export const PARES = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
export const UNIDADES = Array.from({ length: 10 }, (_, i) => String(i));

// ------------------------------------------------------------ suas palavras

function minhasPalavras() {
  return armazenamento.ler('sistema', {}).palavras || {};
}

export function palavraDoPar(numero) {
  const suas = minhasPalavras();
  return suas[numero] ?? PALAVRAS_PADRAO[numero] ?? '';
}

export function definirPalavra(numero, palavra) {
  const dados = armazenamento.ler('sistema', {});
  const palavras = { ...(dados.palavras || {}) };
  if (!palavra || palavra === PALAVRAS_PADRAO[numero]) delete palavras[numero];
  else palavras[numero] = palavra;
  armazenamento.gravar('sistema', { ...dados, palavras });
}

export function restaurarPalavras() {
  const dados = armazenamento.ler('sistema', {});
  armazenamento.gravar('sistema', { ...dados, palavras: {} });
}

export function ehPersonalizada(numero) {
  return numero in minhasPalavras();
}

export function paresDoSistema() {
  return PARES.map((p) => [p, palavraDoPar(p)]);
}

// Estatística por número nos treinos (acertos, erros e tempo), para sortear mais os difíceis.
export function estatisticas() {
  return armazenamento.ler('sistema', {}).estatisticas || {};
}

export function registrarTentativa(numero, acertou, ms) {
  const dados = armazenamento.ler('sistema', {});
  const est = { ...(dados.estatisticas || {}) };
  const e = est[numero] || { a: 0, e: 0, ms: 0 };
  if (acertou) e.a++;
  else e.e++;
  // média móvel do tempo de resposta
  e.ms = e.ms ? Math.round(e.ms * 0.7 + ms * 0.3) : ms;
  est[numero] = e;
  armazenamento.gravar('sistema', { ...dados, estatisticas: est });
}

// Pares "rápidos": acertados quase sempre e em menos de 2,5 s, em média.
export function paresRapidos() {
  const est = estatisticas();
  return PARES.filter((p) => {
    const e = est[p];
    return e && e.a >= 3 && e.a / (e.a + e.e) >= 0.8 && e.ms && e.ms < 2500;
  }).length;
}

// Peso para o sorteio: nunca treinado, errado ou lento sai mais vezes.
export function peso(numero) {
  const e = estatisticas()[numero];
  if (!e) return 3;
  const taxaErro = (e.e + 1) / (e.a + e.e + 2);
  const lentidao = Math.min(3, (e.ms || 3000) / 2500);
  return 0.4 + taxaErro * 4 + lentidao;
}

export function sortearPonderado(lista, pesoDe = peso, evitar = null) {
  const candidatos = lista.length > 1 ? lista.filter((x) => x !== evitar) : lista;
  const pesos = candidatos.map(pesoDe);
  let r = Math.random() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidatos.length; i++) {
    r -= pesos[i];
    if (r <= 0) return candidatos[i];
  }
  return candidatos[candidatos.length - 1];
}

// ------------------------------------------------------------ palavra -> número

const VALOR = { s: '0', z: '0', ç: '0', t: '1', d: '1', n: '2', m: '3', r: '4', l: '5', j: '6', k: '7', q: '7', f: '8', v: '8', p: '9', b: '9' };
const VOGAL = /[aeiouy]/;
const SUAVE = /[ei]/;

function normalizar(palavra) {
  return palavra
    .toLowerCase()
    .replace(/ç/g, '§')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/§/g, 'ç');
}

// Divide a palavra em pedaços (letras) e diz quanto vale cada um.
// Cada pedaço tem `valores`: as leituras possíveis (o X pode soar como CH, S, Z ou KS).
export function decompor(palavra) {
  const p = normalizar(palavra);
  const pedacos = [];
  let i = 0;
  const pedaco = (texto, valores = null) => {
    pedacos.push({ texto, valores });
    i += texto.length;
  };
  while (i < p.length) {
    const c = p[i];
    const seg = p[i + 1] || '';
    const terc = p[i + 2] || '';
    if (!/[a-zç]/.test(c)) {
      pedaco(c);
      continue;
    }
    if (VOGAL.test(c) || c === 'h' || c === 'w') pedaco(c);
    else if (c === 'c' && seg === 'h') pedaco('ch', ['6']);
    else if (c === 's' && seg === 'h') pedaco('sh', ['6']); // palavras emprestadas: show, sushi
    else if (c === 'l' && seg === 'h') pedaco('lh', ['5']);
    else if (c === 'n' && seg === 'h') pedaco('nh', ['2']);
    else if (c === 's' && seg === 'c' && SUAVE.test(terc)) pedaco('sc', ['0']);
    else if (c === 'x' && seg === 'c' && SUAVE.test(terc)) pedaco('xc', ['0']);
    else if (c === 's' && seg === 'ç') pedaco('sç', ['0']);
    else if (c === 'c') pedaco(c, [SUAVE.test(seg) ? '0' : '7']);
    else if (c === 'g') pedaco(c, [SUAVE.test(seg) ? '6' : '7']);
    else if (c === 'x') {
      // início de palavra é sempre CH (xícara); no meio pode ser CH, Z, S ou KS
      if (i === 0 || !VOGAL.test(p[i - 1] || '')) pedaco(c, ['6']);
      else pedaco(c, ['6', '0', '70']);
    } else if (c === seg && VALOR[c]) pedaco(c + seg, [VALOR[c]]); // letra dobrada: rr, ss, zz, ll…
    else if (VALOR[c]) pedaco(c, [VALOR[c]]);
    else pedaco(c);
  }
  return pedacos;
}

// Todos os números que a palavra pode representar (normalmente um só).
export function numerosDaPalavra(palavra) {
  let possiveis = [''];
  for (const { valores } of decompor(palavra)) {
    if (!valores) continue;
    possiveis = possiveis.flatMap((p) => valores.map((v) => p + v));
    if (possiveis.length > 16) possiveis = possiveis.slice(0, 16);
  }
  return [...new Set(possiveis)];
}

export function numeroPrincipal(palavra) {
  return numerosDaPalavra(palavra)[0];
}

export function palavraCodifica(palavra, numero) {
  return numerosDaPalavra(palavra).includes(numero);
}

// Palavra sem ambiguidade (sem X no meio), boa para o treino de decodificar.
export function semAmbiguidade(palavra) {
  return numerosDaPalavra(palavra).length === 1;
}
