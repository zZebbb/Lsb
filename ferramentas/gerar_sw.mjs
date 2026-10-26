// Gera sw.js com a lista de arquivos do app e uma versão calculada pelo conteúdo.
// Rode sempre que mudar qualquer arquivo do app: node ferramentas/gerar_sw.mjs
// (assim o celular baixa a atualização na próxima vez que abrir o app com internet).

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTAS = ['css', 'js', 'dados', 'img'];
const SOLTOS = ['index.html', 'manifest.webmanifest'];
const IGNORAR = /(\.LICENSE|\.map|\.md)$/;

function listar(pasta) {
  return readdirSync(join(raiz, pasta)).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(join(raiz, caminho)).isDirectory() ? listar(caminho) : [caminho];
  });
}

const arquivos = [...SOLTOS, ...PASTAS.flatMap(listar)].filter((a) => !IGNORAR.test(a)).sort();
const hash = createHash('sha256');
for (const a of arquivos) hash.update(a).update(readFileSync(join(raiz, a)));
const versao = hash.digest('hex').slice(0, 10);

const sw = `// Gerado por ferramentas/gerar_sw.mjs — não edite à mão.
// Guarda todos os arquivos do app no aparelho para funcionar sem internet.

const VERSAO = '${versao}';
const CACHE = 'lance-a-lance-' + VERSAO;
const ARQUIVOS = ${JSON.stringify(['./', ...arquivos], null, 2)};

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS.map((a) => new Request(a, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('lance-a-lance-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// pasta onde o app está publicado (ex.: /Lsb/)
const ESCOPO = new URL('./', location).pathname;

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // só cuida dos próprios arquivos: outros apps publicados no mesmo site (como o Palácio,
  // em palacio/) têm o próprio service worker
  const caminho = url.pathname.slice(ESCOPO.length);
  if (req.mode === 'navigate' ? !['', 'index.html'].includes(caminho) : !ARQUIVOS.includes(caminho)) return;
  evento.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // páginas: sempre o index.html guardado (o app usa rotas com #)
      if (req.mode === 'navigate') {
        return (await cache.match('index.html')) || fetch(req);
      }
      const guardado = await cache.match(req, { ignoreSearch: true });
      if (guardado) return guardado;
      const resposta = await fetch(req);
      if (resposta.ok) cache.put(req, resposta.clone());
      return resposta;
    }),
  );
});
`;
writeFileSync(join(raiz, 'sw.js'), sw);
console.log(`sw.js: versão ${versao}, ${arquivos.length + 1} arquivos`);
