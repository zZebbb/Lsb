// Desenha o ícone do app (um palácio feito de blocos) e gera os PNGs para o celular.
// Precisa do Playwright com o Chromium: node palacio/ferramentas/gerar_icones.mjs

import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(import.meta.url)('playwright');

// cores da paleta Pastel (a padrão do app)
const TINTA = '#4a4360';

// Fachada: telhado, quatro colunas e a base, cada peça com sombra sólida deslocada.
function desenho() {
  const pecas = [
    `<path d="M256 84 L424 194 H88 Z"/>`,
    `<rect x="104" y="214" width="52" height="166" rx="12"/>`,
    `<rect x="188" y="214" width="52" height="166" rx="12"/>`,
    `<rect x="272" y="214" width="52" height="166" rx="12"/>`,
    `<rect x="356" y="214" width="52" height="166" rx="12"/>`,
    `<rect x="80" y="394" width="352" height="46" rx="14"/>`,
  ];
  const cores = ['#f5db9d', '#f6b4a7', '#cfe5aa', '#b2dbee', '#f2c2d4', '#fffdf8'];
  const sombra = pecas.map((p) => p.replace('/>', ` fill="${TINTA}"/>`)).join('');
  const frente = pecas.map((p, i) => p.replace('/>', ` fill="${cores[i]}"/>`)).join('');
  return `<g stroke="${TINTA}" stroke-width="10" stroke-linejoin="round">
    <g transform="translate(9 9)">${sombra}</g>${frente}
    <circle cx="256" cy="156" r="15" fill="#fffdf8"/>
  </g>`;
}

function svg({ cantos, escala = 1 }) {
  const t = (512 * (1 - escala)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${cantos}" fill="#c8bcf2"/>
  <g transform="translate(${t} ${t - 6 * escala}) scale(${escala})">${desenho()}</g>
</svg>
`;
}

const arredondado = svg({ cantos: 112 });
writeFileSync(join(raiz, 'img/icone.svg'), arredondado);

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
async function png(conteudo, tamanho, arquivo) {
  await pagina.setViewportSize({ width: tamanho, height: tamanho });
  await pagina.setContent(`<html><body style="margin:0;background:transparent">${conteudo.replace('<svg ', `<svg width="${tamanho}" height="${tamanho}" `)}</body></html>`);
  await pagina.screenshot({ path: join(raiz, 'img', arquivo), omitBackground: true, clip: { x: 0, y: 0, width: tamanho, height: tamanho } });
}
// o iPhone arredonda os cantos sozinho: o ícone dele é quadrado
await png(svg({ cantos: 0 }), 180, 'icone-180.png');
await png(arredondado, 192, 'icone-192.png');
await png(arredondado, 512, 'icone-512.png');
// "maskable" (Android): desenho menor, dentro da área segura
await png(svg({ cantos: 0, escala: 0.78 }), 512, 'icone-maskable-512.png');
await navegador.close();
console.log('ícones gerados em palacio/img/');
