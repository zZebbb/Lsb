// Tela inicial (os blocos de cada treino), progresso (sequência de dias, calendário e
// recordes) e ajustes com backup.

import { h, icone, armazenamento, config, diasSeguidos, recorde, resultados, hoje, diaDe } from '../util.js';
import { pilulas, interruptor, graficoBarras, numeroDestaque } from '../componentes.js';
import { baralhos, cartoes, resumo } from '../srs.js';
import { paresRapidos } from '../sistema.js';

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 5) return 'Boa noite';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function pendentesCartoes() {
  const todos = cartoes();
  return baralhos().reduce((s, b) => {
    const r = resumo(b.id, todos);
    return s + r.novos + r.aprendendo + r.revisar;
  }, 0);
}

// O nome em bloquinhos coloridos, cada letra levemente torta.
function marca() {
  const cores = ['coral', 'sol', 'lima', 'ciano', 'violeta', 'rosa', 'coral'];
  const giros = [-6, 4, -3, 5, -4, 3, -5];
  return h(
    'h2',
    { class: 'marca', 'aria-label': 'Palácio' },
    ...[...'PALÁCIO'].map((letra, i) =>
      h('span', { 'aria-hidden': 'true', class: `cor-${cores[i]}`, style: { '--giro': `${giros[i]}deg`, animationDelay: `${i * 50}ms` } }, letra),
    ),
  );
}

function blocoInicio({ cor, href, nomeIcone, titulo, texto, info, largo = false }) {
  return h(
    'a',
    { class: `bloco bloco-inicio cor-${cor}${largo ? ' largo' : ''}`, href },
    h('span', { class: 'bloco-icone' }, icone(nomeIcone, 30)),
    h('span', { class: 'bloco-titulo' }, titulo),
    texto && h('span', { class: 'bloco-texto' }, texto),
    info && h('span', { class: 'bloco-info' }, info),
  );
}

// ------------------------------------------------------------ início

export function telaInicio(raiz, _params, app) {
  app.titulo('Palácio');
  const sequencia = diasSeguidos();
  const treinouHoje = !!armazenamento.ler('atividade', {})[hoje()];
  const pendentes = pendentesCartoes();
  const rapidos = paresRapidos();

  raiz.append(
    h(
      'div',
      { class: 'boas-vindas' },
      h('div', {}, h('p', { class: 'saudacao' }, `${saudacao()}!`), marca(), h('p', { class: 'suave pequeno' }, 'Treino de memória, sem internet.')),
      h(
        'div',
        { class: `sequencia${treinouHoje ? ' acesa' : ''}`, title: 'Dias seguidos treinando' },
        icone('fogo', 26),
        h('strong', {}, String(sequencia)),
        h('span', {}, sequencia === 1 ? 'dia' : 'dias'),
      ),
    ),
    h(
      'div',
      { class: 'grade-inicio' },
      blocoInicio({
        cor: 'violeta',
        href: '#/sistema',
        nomeIcone: 'palacio',
        titulo: 'Sistema mnemônico',
        texto: 'Números viram palavras: 45 = ROLO.',
        info: `${rapidos}/100 pares rápidos`,
        largo: true,
      }),
      blocoInicio({
        cor: 'coral',
        href: '#/numeros',
        nomeIcone: 'numeros',
        titulo: 'Sequência de números',
        info: recorde('numeros') ? `Recorde: ${recorde('numeros')}` : 'Comece aqui',
      }),
      blocoInicio({
        cor: 'lima',
        href: '#/palavras',
        nomeIcone: 'palavras',
        titulo: 'Já vi ou nova?',
        info: recorde('palavras') ? `Recorde: ${recorde('palavras')}` : 'Palavras',
      }),
      blocoInicio({
        cor: 'ciano',
        href: '#/cartoes',
        nomeIcone: 'cartoes',
        titulo: 'Cartões de revisão',
        info: !baralhos().length ? 'Crie seu primeiro baralho' : pendentes ? `${pendentes} para hoje` : 'Tudo em dia',
      }),
      blocoInicio({
        cor: 'sol',
        href: '#/progresso',
        nomeIcone: 'progresso',
        titulo: 'Progresso',
        info: treinouHoje ? 'Treinou hoje' : 'Ainda não treinou hoje',
      }),
    ),
  );
  const dica = h('div');
  raiz.append(dica);
  app.mostrarDicaInstalacao(dica);
}

// ------------------------------------------------------------ progresso

// Calendário das últimas semanas: um bloquinho por dia, mais forte quanto mais treino.
function calendario(semanas = 15) {
  const atividade = armazenamento.ler('atividade', {});
  const fim = new Date();
  fim.setHours(0, 0, 0, 0);
  const inicio = new Date(fim);
  inicio.setDate(inicio.getDate() - (semanas * 7 - 1));
  // começa num domingo, para as colunas serem semanas
  inicio.setDate(inicio.getDate() - inicio.getDay());
  const dias = [];
  for (const d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) dias.push(diaDe(d));
  const nivel = (n) => (!n ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 40 ? 3 : 4);
  const total = dias.filter((d) => atividade[d]).length;
  return h(
    'div',
    {},
    h(
      'div',
      { class: 'calendario', role: 'img', 'aria-label': `${total} dias com treino nas últimas ${semanas} semanas` },
      ...dias.map((d) => h('span', { class: `dia n${nivel(atividade[d])}${d === hoje() ? ' hoje' : ''}`, title: `${d}: ${atividade[d] || 0}` })),
    ),
    h('p', { class: 'pequeno suave' }, `${total} ${total === 1 ? 'dia' : 'dias'} com treino nas últimas ${semanas} semanas.`),
  );
}

export function telaProgresso(raiz, _params, app) {
  app.titulo('Progresso');
  const sequencia = diasSeguidos();
  const revisoes = Object.values(cartoes()).reduce((s, c) => s + (c.srs.revisoes || 0), 0);

  raiz.append(
    h(
      'div',
      { class: 'bloco cor-sol' },
      h('div', { class: 'destaques' }, numeroDestaque(sequencia, sequencia === 1 ? 'dia seguido' : 'dias seguidos'), numeroDestaque(paresRapidos(), 'pares rápidos'), numeroDestaque(revisoes, 'revisões de cartões')),
    ),
    h('h2', {}, 'Calendário'),
    h('div', { class: 'bloco' }, calendario()),
    h('h2', {}, 'Recordes'),
    h(
      'div',
      { class: 'grade-recordes' },
      ...[
        ['coral', 'Sequência de números', recorde('numeros'), 'dígitos'],
        ['lima', 'Já vi ou nova?', recorde('palavras'), 'pontos'],
        ['violeta', 'Lembrar a palavra', recorde('sistema-lembrar'), 'de 20'],
        ['sol', 'Qual é o número?', recorde('sistema-numero'), 'de 20'],
        ['ciano', 'Decodificar', recorde('sistema-decodificar'), 'de 15'],
        ['rosa', 'Crie uma palavra', recorde('sistema-criar'), 'de 10'],
      ].map(([cor, nome, valor, unidade]) => h('div', { class: `bloco recorde cor-${cor}` }, h('span', {}, nome), h('strong', {}, valor || '–'), valor ? h('small', {}, unidade) : null)),
    ),
    h('h2', {}, 'Sequência de números'),
    h('div', { class: 'bloco' }, graficoBarras(resultados('numeros').slice(-30).map((r) => r.v), { rotulo: 'Dígitos' })),
    h('h2', {}, 'Já vi ou nova?'),
    h('div', { class: 'bloco' }, graficoBarras(resultados('palavras').slice(-30).map((r) => r.v), { rotulo: 'Pontos' })),
    h('div', { class: 'botoes' }, h('a', { class: 'botao', href: '#/ajustes' }, icone('ajustes', 20), 'Ajustes e backup')),
  );
}

// ------------------------------------------------------------ ajustes

export function telaAjustes(raiz, _params, app) {
  app.titulo('Ajustes');
  raiz.append(
    h(
      'div',
      { class: 'bloco' },
      interruptor('Sons', 'som'),
      interruptor('Vibrar ao errar', 'vibrar', null, 'No iPhone o navegador não deixa vibrar.'),
      pilulas(
        'Aparência',
        'cores',
        [
          ['auto', 'Automática'],
          ['claro', 'Clara'],
          ['escuro', 'Escura'],
        ],
        () => app.aplicarConfig(),
      ),
      pilulas('Cartões novos por dia (por baralho)', 'novosPorDia', [
        [10, '10'],
        [20, '20'],
        [30, '30'],
        [50, '50'],
      ]),
    ),
    h('h2', {}, 'Backup'),
    h('p', { class: 'suave pequeno' }, 'Tudo fica salvo só neste aparelho. Exporte um arquivo de vez em quando para guardar (no app Arquivos, por exemplo) ou levar para outro celular.'),
  );

  const arquivo = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  arquivo.addEventListener('change', async () => {
    const f = arquivo.files[0];
    if (!f) return;
    try {
      const dados = JSON.parse(await f.text());
      if (!dados || typeof dados !== 'object' || dados.app !== 'palacio') throw new Error();
      if (!confirm('Substituir tudo o que está neste aparelho pelo backup?')) return;
      armazenamento.substituirTudo(dados.dados);
      app.aplicarConfig();
      app.aviso('Backup importado!');
    } catch {
      app.aviso('Arquivo inválido.');
    }
  });

  raiz.append(
    arquivo,
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao',
          onclick: () => {
            const blob = new Blob([JSON.stringify({ app: 'palacio', versao: 1, data: new Date().toISOString(), dados: armazenamento.tudo() })], {
              type: 'application/json',
            });
            const a = h('a', { href: URL.createObjectURL(blob), download: `palacio-backup-${hoje()}.json` });
            document.body.append(a);
            a.click();
            a.remove();
          },
        },
        'Exportar',
      ),
      h('button', { class: 'botao', onclick: () => arquivo.click() }, 'Importar'),
    ),
    h('h2', {}, 'Recomeçar'),
    h(
      'div',
      { class: 'botoes' },
      h(
        'button',
        {
          class: 'botao perigo',
          onclick: () => {
            if (!confirm('Apagar recordes, histórico das partidas e a sequência de dias? (Cartões e suas palavras do sistema continuam.)')) return;
            armazenamento.gravar('historico', {});
            armazenamento.gravar('atividade', {});
            const sistema = armazenamento.ler('sistema', {});
            armazenamento.gravar('sistema', { ...sistema, estatisticas: {} });
            app.aviso('Resultados apagados.');
          },
        },
        'Zerar resultados',
      ),
    ),
    h('h2', {}, 'Sobre'),
    h(
      'p',
      { class: 'pequeno' },
      h('strong', {}, 'Palácio'),
      ' funciona 100% offline depois de instalado. Não tem anúncios, conta nem coleta de dados. O nome vem do palácio da memória, a técnica de guardar imagens num lugar que você conhece.',
    ),
    h('p', { class: 'suave pequeno' }, `Versão ${app.versao}`),
  );
}
