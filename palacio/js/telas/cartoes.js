// Cartões de revisão: baralhos, criação e importação de cartões e a sessão de estudo
// com repetição espaçada (ver srs.js).

import { h, icone, som, novoId, registrarAtividade, animar, diaDe, hoje } from '../util.js';
import { confete } from '../componentes.js';
import {
  RESPOSTAS,
  estadoNovo,
  proximoEstado,
  descreverEspera,
  baralhos,
  salvarBaralhos,
  cartoes,
  salvarCartoes,
  cartoesDoBaralho,
  contarNovoEstudado,
  resumo,
  proximoCartao,
  proximaRevisao,
} from '../srs.js';
import { paresDoSistema } from '../sistema.js';

const CORES = ['ciano', 'coral', 'lima', 'violeta', 'sol', 'rosa'];

function acharBaralho(id) {
  return baralhos().find((b) => b.id === id);
}

function criarBaralho(nome, extra = {}) {
  const lista = baralhos();
  const b = { id: novoId(), nome, cor: CORES[lista.length % CORES.length], criado: Date.now(), ...extra };
  salvarBaralhos([...lista, b]);
  return b;
}

function adicionarCartoes(baralho, pares) {
  const todos = cartoes();
  let t = Date.now();
  for (const [frente, verso] of pares) {
    const id = novoId();
    todos[id] = { id, baralho, frente, verso, criado: t++, srs: estadoNovo() };
  }
  salvarCartoes(todos);
}

// Baralho pronto com as 100 palavras do sistema: a frente é o número, o verso é a sua palavra.
function sincronizarBaralhoDoSistema(baralho) {
  const todos = cartoes();
  const existentes = new Map(cartoesDoBaralho(baralho.id, todos).map((c) => [c.frente, c]));
  let t = Date.now();
  for (const [par, palavra] of paresDoSistema()) {
    const c = existentes.get(par);
    if (c) c.verso = palavra || '(sem palavra)';
    else {
      const id = novoId();
      todos[id] = { id, baralho: baralho.id, frente: par, verso: palavra || '(sem palavra)', criado: t++, srs: estadoNovo() };
    }
  }
  salvarCartoes(todos);
}

function contagens(r) {
  return h(
    'div',
    { class: 'contagens' },
    h('span', { class: 'contagem novos', title: 'Novos hoje' }, h('b', {}, String(r.novos)), 'novos'),
    h('span', { class: 'contagem aprendendo', title: 'Aprendendo' }, h('b', {}, String(r.aprendendo)), 'aprendendo'),
    h('span', { class: 'contagem revisar', title: 'Para revisar' }, h('b', {}, String(r.revisar)), 'revisar'),
  );
}

// ------------------------------------------------------------ lista de baralhos

export function telaBaralhos(raiz, _params, app) {
  app.titulo('Cartões');
  const lista = baralhos();
  const todos = cartoes();
  const resumos = lista.map((b) => [b, resumo(b.id, todos)]);
  const pendentes = resumos.reduce((s, [, r]) => s + r.novos + r.aprendendo + r.revisar, 0);

  raiz.append(
    h(
      'div',
      { class: 'bloco cor-ciano cabecalho-secao' },
      h('span', { class: 'cabecalho-icone' }, icone('cartoes', 30)),
      h('div', {}, h('h2', {}, 'Cartões de revisão'), h('p', { class: 'pequeno' }, 'Escreva o que quer lembrar. O app traz cada cartão de volta pouco antes de você esquecer.')),
    ),
  );

  if (lista.length > 1 && pendentes) {
    raiz.append(h('a', { class: 'botao escuro largo grande', href: '#/estudar/todos' }, `Estudar tudo (${pendentes})`));
  }

  for (const [b, r] of resumos) {
    raiz.append(
      h(
        'a',
        { class: `bloco baralho cor-${b.cor}`, href: `#/baralho/${b.id}` },
        h('div', { class: 'baralho-nome' }, b.nome),
        h('div', { class: 'pequeno' }, `${r.total} ${r.total === 1 ? 'cartão' : 'cartões'}`),
        contagens(r),
      ),
    );
  }

  const nome = h('input', { type: 'text', class: 'entrada', placeholder: 'Ex.: Inglês, Capitais', maxlength: '60', enterkeyhint: 'done' });
  const criar = () => {
    const n = nome.value.trim();
    if (!n) return nome.focus();
    const b = criarBaralho(n);
    app.ir(`#/baralho/${b.id}`);
  };
  nome.addEventListener('keydown', (e) => e.key === 'Enter' && criar());
  raiz.append(
    h('h2', {}, 'Novo baralho'),
    h('div', { class: 'bloco' }, nome, h('div', { class: 'botoes' }, h('button', { class: 'botao escuro', onclick: criar }, icone('mais', 22), 'Criar'))),
  );

  if (!lista.some((b) => b.origem === 'sistema')) {
    raiz.append(
      h(
        'div',
        { class: 'bloco cor-violeta' },
        h('h3', {}, 'Baralho do sistema: 00 a 99'),
        h('p', { class: 'pequeno' }, 'Cria 100 cartões com as suas palavras do sistema mnemônico: você vê o número e lembra a palavra.'),
        h(
          'button',
          {
            class: 'botao',
            onclick: () => {
              const b = criarBaralho('Sistema 00–99', { origem: 'sistema', cor: 'violeta' });
              sincronizarBaralhoDoSistema(b);
              app.ir(`#/baralho/${b.id}`);
            },
          },
          'Criar baralho do sistema',
        ),
      ),
    );
  }
}

// ------------------------------------------------------------ um baralho

export function telaBaralho(raiz, { id }, app) {
  const b = acharBaralho(id);
  if (!b) return app.ir('#/cartoes');
  app.titulo(b.nome);
  const todos = cartoes();
  const r = resumo(id, todos);
  const pendentes = r.novos + r.aprendendo + r.revisar;

  raiz.append(
    h(
      'div',
      { class: `bloco cor-${b.cor} cabecalho-baralho` },
      h('h2', {}, b.nome),
      h('p', { class: 'pequeno' }, `${r.total} ${r.total === 1 ? 'cartão' : 'cartões'} · ${r.novosTotal} ainda não estudados`),
      contagens(r),
      pendentes
        ? h('a', { class: 'botao escuro largo grande', href: `#/estudar/${id}` }, `Estudar (${pendentes})`)
        : h('p', { class: 'tudo-em-dia' }, icone('certo', 22), r.total ? 'Tudo em dia por hoje!' : 'Adicione cartões para começar.'),
    ),
    h(
      'div',
      { class: 'botoes' },
      h('a', { class: 'botao', href: `#/baralho/${id}/novo` }, icone('mais', 22), 'Cartão'),
      h('a', { class: 'botao', href: `#/baralho/${id}/importar` }, 'Importar lista'),
    ),
  );

  if (b.origem === 'sistema') {
    raiz.append(
      h(
        'button',
        {
          class: 'botao largo',
          onclick: () => {
            sincronizarBaralhoDoSistema(b);
            app.aviso('Cartões atualizados com suas palavras.');
            app.ir(`#/baralho/${id}`);
          },
        },
        'Atualizar com minhas palavras do sistema',
      ),
    );
  }

  const lista = cartoesDoBaralho(id, todos).sort((a, b2) => a.criado - b2.criado);
  if (lista.length) {
    const busca = h('input', { type: 'search', class: 'entrada', placeholder: 'Procurar cartão', enterkeyhint: 'search' });
    const itens = h('div', { class: 'lista-cartoes' });
    const desenhar = () => {
      const termo = busca.value.trim().toLowerCase();
      itens.replaceChildren(
        ...lista
          .filter((c) => !termo || c.frente.toLowerCase().includes(termo) || c.verso.toLowerCase().includes(termo))
          .slice(0, 300)
          .map((c) =>
            h(
              'a',
              { class: 'item-cartao', href: `#/cartao/${id}/${c.id}` },
              h('span', { class: 'item-frente' }, c.frente),
              h('span', { class: 'item-verso' }, c.verso),
              h('span', { class: 'item-estado' }, situacao(c)),
            ),
          ),
      );
    };
    busca.addEventListener('input', desenhar);
    desenhar();
    raiz.append(h('h2', {}, 'Cartões'), busca, itens);
  }

  raiz.append(
    h('h2', {}, 'Baralho'),
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao',
          onclick: () => {
            const novo = prompt('Novo nome do baralho:', b.nome)?.trim();
            if (!novo) return;
            salvarBaralhos(baralhos().map((x) => (x.id === id ? { ...x, nome: novo } : x)));
            app.ir(`#/baralho/${id}`);
          },
        },
        icone('lapis', 20),
        'Renomear',
      ),
      h(
        'button',
        {
          class: 'botao perigo',
          onclick: () => {
            if (!confirm(`Apagar o baralho "${b.nome}" e todos os ${lista.length} cartões?`)) return;
            const restantes = cartoes();
            for (const c of lista) delete restantes[c.id];
            salvarCartoes(restantes);
            salvarBaralhos(baralhos().filter((x) => x.id !== id));
            app.ir('#/cartoes');
          },
        },
        icone('lixo', 20),
        'Apagar',
      ),
    ),
  );
}

function situacao(c) {
  if (c.srs.fase === 'novo') return 'novo';
  if (c.srs.fase !== 'revisao') return 'aprendendo';
  if (c.srs.vence <= Date.now()) return 'para hoje';
  const dias = Math.round((c.srs.vence - new Date(hoje() + 'T00:00').getTime()) / 864e5);
  return dias === 1 ? 'amanhã' : `em ${dias} d`;
}

// ------------------------------------------------------------ criar e editar

export function telaEditarCartao(raiz, { baralho, id }, app) {
  const b = acharBaralho(baralho);
  if (!b) return app.ir('#/cartoes');
  const todos = cartoes();
  const existente = id ? todos[id] : null;
  if (id && !existente) return app.ir(`#/baralho/${baralho}`);
  app.titulo(existente ? 'Editar cartão' : 'Novo cartão');

  const frente = h('textarea', { class: 'entrada', rows: '3', placeholder: 'Pergunta, palavra, número…' });
  const verso = h('textarea', { class: 'entrada', rows: '3', placeholder: 'Resposta' });
  frente.value = existente?.frente || '';
  verso.value = existente?.verso || '';

  const salvar = (continuar) => {
    const f = frente.value.trim();
    const v = verso.value.trim();
    if (!f || !v) {
      app.aviso('Preencha a frente e o verso.');
      return;
    }
    const atual = cartoes();
    if (existente) atual[id] = { ...atual[id], frente: f, verso: v };
    else {
      const novo = novoId();
      atual[novo] = { id: novo, baralho, frente: f, verso: v, criado: Date.now(), srs: estadoNovo() };
    }
    salvarCartoes(atual);
    if (continuar) {
      app.aviso('Cartão salvo!');
      frente.value = '';
      verso.value = '';
      frente.focus();
    } else app.ir(`#/baralho/${baralho}`);
  };

  raiz.append(
    h('div', { class: `bloco cor-${b.cor} pequeno` }, 'Baralho: ', h('strong', {}, b.nome)),
    h('label', { class: 'rotulo-campo' }, 'Frente', frente),
    h('label', { class: 'rotulo-campo' }, 'Verso', verso),
    h(
      'div',
      { class: 'botoes' },
      h('button', { class: 'botao escuro', onclick: () => salvar(false) }, 'Salvar'),
      !existente && h('button', { class: 'botao', onclick: () => salvar(true) }, 'Salvar e criar outro'),
    ),
  );

  if (existente) {
    raiz.append(
      h('p', { class: 'suave pequeno' }, `Revisado ${existente.srs.revisoes} ${existente.srs.revisoes === 1 ? 'vez' : 'vezes'} · ${existente.srs.lapsos} erros · situação: ${situacao(existente)}`),
      h(
        'div',
        { class: 'botoes' },
        h(
          'button',
          {
            class: 'botao',
            onclick: () => {
              if (!confirm('Recomeçar este cartão do zero (como se fosse novo)?')) return;
              const atual = cartoes();
              atual[id].srs = estadoNovo();
              salvarCartoes(atual);
              app.aviso('Cartão recomeçado.');
            },
          },
          'Recomeçar',
        ),
        h(
          'button',
          {
            class: 'botao perigo',
            onclick: () => {
              if (!confirm('Apagar este cartão?')) return;
              const atual = cartoes();
              delete atual[id];
              salvarCartoes(atual);
              app.ir(`#/baralho/${baralho}`);
            },
          },
          icone('lixo', 20),
          'Apagar',
        ),
      ),
    );
  } else {
    setTimeout(() => frente.focus(), 50);
  }
}

// ------------------------------------------------------------ importar

// Uma linha por cartão: "frente ; verso" (também aceita tabulação, " = " ou " - ").
export function lerLista(texto) {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const m = linha.match(/^(.+?)\s*(?:\t|;|\s=\s|\s-\s|\s–\s)\s*(.+)$/);
      return m ? [m[1].trim(), m[2].trim()] : null;
    })
    .filter(Boolean);
}

export function telaImportar(raiz, { baralho }, app) {
  const b = acharBaralho(baralho);
  if (!b) return app.ir('#/cartoes');
  app.titulo('Importar lista');
  const texto = h('textarea', { class: 'entrada', rows: '10', placeholder: 'dog ; cachorro\ncat ; gato\nCapital da Austrália ; Camberra' });
  const previa = h('p', { class: 'pequeno suave' }, 'Nenhum cartão reconhecido ainda.');
  const botao = h('button', { class: 'botao escuro', disabled: true }, 'Importar');
  texto.addEventListener('input', () => {
    const n = lerLista(texto.value).length;
    previa.textContent = n ? `${n} ${n === 1 ? 'cartão reconhecido' : 'cartões reconhecidos'}.` : 'Nenhum cartão reconhecido ainda.';
    botao.disabled = !n;
  });
  botao.addEventListener('click', () => {
    const pares = lerLista(texto.value);
    if (!pares.length) return;
    adicionarCartoes(baralho, pares);
    app.aviso(`${pares.length} cartões importados.`);
    app.ir(`#/baralho/${baralho}`);
  });
  raiz.append(
    h('div', { class: `bloco cor-${b.cor} pequeno` }, 'Baralho: ', h('strong', {}, b.nome)),
    h(
      'p',
      { class: 'pequeno' },
      'Cole ou digite um cartão por linha, com a frente e o verso separados por ponto e vírgula. Dá para copiar uma tabela do Notas, do Excel ou do Google Planilhas.',
    ),
    texto,
    previa,
    h('div', { class: 'botoes' }, botao),
  );
}

// ------------------------------------------------------------ estudar

export function telaEstudar(raiz, { id }, app) {
  const ids = id === 'todos' ? baralhos().map((b) => b.id) : [id];
  const b = id === 'todos' ? null : acharBaralho(id);
  if (!ids.length || (id !== 'todos' && !b)) return app.ir('#/cartoes');
  app.titulo(b ? b.nome : 'Estudar tudo');
  raiz.classList.add('tela-jogo');

  const placar = h('div', { class: 'placar-estudo' });
  const cartao = h('div', { class: `bloco cartao-estudo cor-${b?.cor || 'ciano'}` });
  const acoes = h('div', { class: 'acoes-estudo' });
  raiz.append(placar, cartao, acoes);

  let atual = null;
  let revelado = false;
  let feitos = 0;
  let ultimo = null;

  const aoTeclar = (e) => {
    if (!atual) return;
    if (!revelado && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      revelar();
    } else if (revelado && /^[1-4]$/.test(e.key)) responder(RESPOSTAS[Number(e.key) - 1][0]);
  };
  document.addEventListener('keydown', aoTeclar);

  function atualizarPlacar() {
    const todos = cartoes();
    const total = ids.reduce(
      (s, bid) => {
        const r = resumo(bid, todos);
        return { novos: s.novos + r.novos, aprendendo: s.aprendendo + r.aprendendo, revisar: s.revisar + r.revisar };
      },
      { novos: 0, aprendendo: 0, revisar: 0 },
    );
    placar.replaceChildren(contagens(total));
  }

  function proximo() {
    atualizarPlacar();
    atual = proximoCartao(ids, cartoes(), Date.now(), ultimo);
    revelado = false;
    if (!atual) return fim();
    cartao.className = `bloco cartao-estudo cor-${(acharBaralho(atual.baralho) || b)?.cor || 'ciano'}`;
    cartao.replaceChildren(
      h('div', { class: 'etiqueta-fase' }, atual.srs.fase === 'novo' ? 'novo' : atual.srs.fase === 'revisao' ? 'revisão' : 'aprendendo'),
      h('div', { class: 'frente' }, atual.frente),
    );
    animar(cartao, 'entrar');
    acoes.replaceChildren(h('button', { class: 'botao escuro largo grande', onclick: revelar }, 'Mostrar resposta'));
  }

  function revelar() {
    if (!atual || revelado) return;
    revelado = true;
    som.virar();
    cartao.append(h('div', { class: 'divisoria' }), h('div', { class: 'verso' }, atual.verso));
    animar(cartao, 'virar');
    const agora = Date.now();
    acoes.replaceChildren(
      h(
        'div',
        { class: 'respostas-srs' },
        ...RESPOSTAS.map(([chave, rotulo]) =>
          h(
            'button',
            { class: `botao resposta-srs ${chave}`, onclick: () => responder(chave) },
            h('span', { class: 'rotulo-resposta' }, rotulo),
            h('span', { class: 'espera' }, descreverEspera(proximoEstado(atual.srs, chave, agora, true), agora)),
          ),
        ),
      ),
    );
  }

  function responder(chave) {
    if (!atual || !revelado) return;
    const todos = cartoes();
    const c = todos[atual.id];
    if (!c) return proximo();
    if (c.srs.fase === 'novo') contarNovoEstudado(c.baralho);
    c.srs = proximoEstado(c.srs, chave);
    salvarCartoes(todos);
    registrarAtividade();
    feitos++;
    if (chave === 'errei') som.erro();
    else som.acerto();
    ultimo = c.id;
    proximo();
  }

  function fim() {
    const quando = proximaRevisao(ids);
    let texto = 'Sem revisões marcadas.';
    if (quando) {
      const dia = diaDe(quando);
      const amanha = diaDe(Date.now() + 864e5);
      texto =
        dia === hoje()
          ? 'Próxima revisão ainda hoje.'
          : dia === amanha
            ? 'Próxima revisão: amanhã.'
            : `Próxima revisão: ${new Date(quando).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}.`;
    }
    cartao.className = 'bloco cartao-estudo cor-lima';
    cartao.replaceChildren(
      h('div', { class: 'frente' }, feitos ? 'Tudo em dia!' : 'Nada para estudar agora'),
      h('p', { class: 'centro' }, feitos ? `${feitos} ${feitos === 1 ? 'resposta' : 'respostas'} nesta sessão. ${texto}` : texto),
    );
    animar(cartao, 'entrar');
    if (feitos) {
      som.fim();
      confete(cartao);
    }
    acoes.replaceChildren(h('a', { class: 'botao largo grande', href: b ? `#/baralho/${id}` : '#/cartoes' }, 'Voltar'));
  }

  proximo();
  return () => document.removeEventListener('keydown', aoTeclar);
}
