// Repetição espaçada dos cartões (no estilo do Anki, algoritmo SM-2):
// - cartão novo ou errado passa por etapas curtas (1 min, 10 min) antes de "formar";
// - depois volta em intervalos que crescem pela facilidade do cartão (começa em 2,5×);
// - "Errei" reduz a facilidade e manda o cartão de volta para as etapas curtas.

import { armazenamento, config, hoje, inicioDoDia, MINUTO, DIA } from './util.js';

const ETAPAS = [1 * MINUTO, 10 * MINUTO];
const FORMATURA = 1; // dias, depois de passar pelas etapas
const FORMATURA_FACIL = 4;
const FACILIDADE_INICIAL = 2.5;
const FACILIDADE_MINIMA = 1.3;
const ADIANTAR = 20 * MINUTO; // sem mais nada para estudar, mostra cartões que venceriam em até 20 min

export const RESPOSTAS = [
  ['errei', 'Errei'],
  ['dificil', 'Difícil'],
  ['bom', 'Bom'],
  ['facil', 'Fácil'],
];

export function estadoNovo() {
  return { fase: 'novo', etapa: 0, intervalo: 0, facilidade: FACILIDADE_INICIAL, vence: 0, lapsos: 0, revisoes: 0 };
}

// Variação de até ±5% para os cartões criados juntos não vencerem sempre no mesmo dia.
function espalhar(dias) {
  if (dias < 3) return dias;
  return Math.round(dias * (0.95 + Math.random() * 0.1));
}

function venceEmDias(dias, agora) {
  return inicioDoDia(agora) + dias * DIA;
}

// Calcula o próximo estado do cartão; com `simular`, não sorteia a variação (para mostrar nos botões).
export function proximoEstado(estado, resposta, agora = Date.now(), simular = false) {
  const e = { ...estadoNovo(), ...estado, revisoes: (estado?.revisoes || 0) + 1 };
  const variar = simular ? (d) => d : espalhar;

  if (e.fase === 'novo' || e.fase === 'aprendendo' || e.fase === 'reaprendendo') {
    const reaprendendo = e.fase === 'reaprendendo';
    if (resposta === 'errei') {
      return { ...e, fase: reaprendendo ? 'reaprendendo' : 'aprendendo', etapa: reaprendendo ? ETAPAS.length - 1 : 0, vence: agora + ETAPAS[0] };
    }
    if (resposta === 'dificil') {
      const espera = e.etapa === 0 ? (ETAPAS[0] + ETAPAS[1]) / 2 : ETAPAS[e.etapa];
      return { ...e, fase: reaprendendo ? 'reaprendendo' : 'aprendendo', vence: agora + espera };
    }
    if (resposta === 'bom' && e.etapa + 1 < ETAPAS.length) {
      return { ...e, fase: reaprendendo ? 'reaprendendo' : 'aprendendo', etapa: e.etapa + 1, vence: agora + ETAPAS[e.etapa + 1] };
    }
    // formou
    const base = reaprendendo ? Math.max(1, e.intervalo) : resposta === 'facil' ? FORMATURA_FACIL : FORMATURA;
    const dias = resposta === 'facil' && reaprendendo ? base + 1 : base;
    return { ...e, fase: 'revisao', etapa: 0, intervalo: dias, vence: venceEmDias(dias, agora) };
  }

  // revisão
  const atraso = Math.max(0, Math.floor((inicioDoDia(agora) - e.vence) / DIA));
  if (resposta === 'errei') {
    // reaprender tem uma etapa só (10 min): acertou de novo, volta para as revisões
    return {
      ...e,
      fase: 'reaprendendo',
      etapa: ETAPAS.length - 1,
      lapsos: e.lapsos + 1,
      facilidade: Math.max(FACILIDADE_MINIMA, e.facilidade - 0.2),
      intervalo: Math.max(1, Math.round(e.intervalo * 0.3)),
      vence: agora + ETAPAS[1],
    };
  }
  let dias;
  let facilidade = e.facilidade;
  if (resposta === 'dificil') {
    dias = Math.max(e.intervalo + 1, Math.round(e.intervalo * 1.2));
    facilidade = Math.max(FACILIDADE_MINIMA, facilidade - 0.15);
  } else if (resposta === 'bom') {
    dias = Math.max(e.intervalo + 1, Math.round((e.intervalo + atraso / 2) * facilidade));
  } else {
    dias = Math.max(e.intervalo + 2, Math.round((e.intervalo + atraso) * facilidade * 1.3));
    facilidade += 0.15;
  }
  dias = Math.min(variar(dias), 3650);
  return { ...e, intervalo: dias, facilidade, vence: venceEmDias(dias, agora) };
}

export function descreverEspera(estado, agora = Date.now()) {
  const ms = estado.vence - agora;
  if (estado.fase !== 'revisao') {
    const min = Math.max(1, Math.round(ms / MINUTO));
    return min < 60 ? `${min} min` : `${Math.round(min / 60)} h`;
  }
  const d = estado.intervalo;
  if (d < 30) return `${d} d`;
  if (d < 365) return `${Math.round(d / 30)} m`;
  return `${(d / 365).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} a`;
}

// ------------------------------------------------------------ dados

export function baralhos() {
  return armazenamento.ler('baralhos', []);
}

export function salvarBaralhos(lista) {
  armazenamento.gravar('baralhos', lista);
}

export function cartoes() {
  return armazenamento.ler('cartoes', {});
}

export function salvarCartoes(todos) {
  armazenamento.gravar('cartoes', todos);
}

export function cartoesDoBaralho(id, todos = cartoes()) {
  return Object.values(todos).filter((c) => c.baralho === id);
}

// Quantos cartões novos já foram estudados hoje em cada baralho (limite diário de novos).
function novosHoje() {
  const n = armazenamento.ler('novosHoje', {});
  return n.dia === hoje() ? n : { dia: hoje(), porBaralho: {} };
}

export function contarNovoEstudado(baralho) {
  const n = novosHoje();
  n.porBaralho[baralho] = (n.porBaralho[baralho] || 0) + 1;
  armazenamento.gravar('novosHoje', n);
}

export function novosRestantes(baralho) {
  return Math.max(0, Number(config().novosPorDia) - (novosHoje().porBaralho[baralho] || 0));
}

// Resumo de um baralho: novos disponíveis hoje, em aprendizado e revisões vencidas.
export function resumo(id, todos = cartoes(), agora = Date.now()) {
  const lista = cartoesDoBaralho(id, todos);
  let novos = 0;
  let aprendendo = 0;
  let revisar = 0;
  for (const c of lista) {
    if (c.srs.fase === 'novo') novos++;
    else if (c.srs.vence <= agora + (c.srs.fase === 'revisao' ? 0 : ADIANTAR)) {
      if (c.srs.fase === 'revisao') revisar++;
      else aprendendo++;
    }
  }
  return { total: lista.length, novos: Math.min(novos, novosRestantes(id)), novosTotal: novos, aprendendo, revisar };
}

// Próximo cartão a estudar: aprendizado vencido, depois revisões, depois novos (dentro do limite).
export function proximoCartao(ids, todos = cartoes(), agora = Date.now(), pular = null) {
  const lista = Object.values(todos).filter((c) => ids.includes(c.baralho) && c.id !== pular);
  const porVencimento = (a, b) => a.srs.vence - b.srs.vence;
  const aprendendo = lista.filter((c) => c.srs.fase !== 'novo' && c.srs.fase !== 'revisao').sort(porVencimento);
  if (aprendendo[0] && aprendendo[0].srs.vence <= agora) return aprendendo[0];
  const revisao = lista.filter((c) => c.srs.fase === 'revisao' && c.srs.vence <= agora).sort(porVencimento);
  if (revisao.length) return revisao[0];
  const novos = lista.filter((c) => c.srs.fase === 'novo' && novosRestantes(c.baralho) > 0).sort((a, b) => a.criado - b.criado);
  if (novos.length) return novos[0];
  if (aprendendo[0] && aprendendo[0].srs.vence <= agora + ADIANTAR) return aprendendo[0];
  // o cartão que acabou de ser respondido, se for o único que sobrou
  if (pular && todos[pular] && ids.includes(todos[pular].baralho)) {
    const c = todos[pular];
    if (c.srs.fase !== 'novo' && c.srs.fase !== 'revisao' && c.srs.vence <= agora + ADIANTAR) return c;
  }
  return null;
}

// Quando vence a próxima revisão de qualquer cartão (para dizer "volte amanhã").
export function proximaRevisao(ids, todos = cartoes()) {
  const futuros = Object.values(todos)
    .filter((c) => ids.includes(c.baralho) && c.srs.fase !== 'novo')
    .map((c) => c.srs.vence);
  return futuros.length ? Math.min(...futuros) : null;
}
