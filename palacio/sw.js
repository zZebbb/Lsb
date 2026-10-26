// Gerado por palacio/ferramentas/gerar_sw.mjs — não edite à mão.
// Guarda todos os arquivos do app no aparelho para funcionar sem internet.

const VERSAO = 'c9317fd4be';
const CACHE = 'palacio-' + VERSAO;
const ARQUIVOS = [
  "./",
  "css/app.css",
  "dados/palavras.js",
  "dados/sistema.js",
  "img/icone-180.png",
  "img/icone-192.png",
  "img/icone-512.png",
  "img/icone-maskable-512.png",
  "img/icone.svg",
  "index.html",
  "js/app.js",
  "js/componentes.js",
  "js/fogo.js",
  "js/sistema.js",
  "js/srs.js",
  "js/teclado.js",
  "js/telas/cartoes.js",
  "js/telas/inicio.js",
  "js/telas/numeros.js",
  "js/telas/palavras.js",
  "js/telas/sistema.js",
  "js/util.js",
  "manifest.webmanifest"
];

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
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('palacio-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// pasta onde o app está publicado (ex.: /Lsb/palacio/)
const ESCOPO = new URL('./', location).pathname;

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // só cuida dos próprios arquivos (outros apps publicados no mesmo site têm o próprio
  // service worker)
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
