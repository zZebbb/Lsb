// Gerado por ferramentas/gerar_sw.mjs — não edite à mão.
// Guarda todos os arquivos do app no aparelho para funcionar sem internet.

const VERSAO = 'd12665bf59';
const CACHE = 'lance-a-lance-' + VERSAO;
const ARQUIVOS = [
  "./",
  "css/app.css",
  "dados/aberturas.js",
  "dados/nomes-aberturas.json",
  "dados/puzzles.json",
  "dados/temas.js",
  "img/icone-180.png",
  "img/icone-192.png",
  "img/icone-512.png",
  "img/icone-maskable-512.png",
  "img/icone.svg",
  "img/pecas/bB.svg",
  "img/pecas/bK.svg",
  "img/pecas/bN.svg",
  "img/pecas/bP.svg",
  "img/pecas/bQ.svg",
  "img/pecas/bR.svg",
  "img/pecas/wB.svg",
  "img/pecas/wK.svg",
  "img/pecas/wN.svg",
  "img/pecas/wP.svg",
  "img/pecas/wQ.svg",
  "img/pecas/wR.svg",
  "index.html",
  "js/app.js",
  "js/linhas.js",
  "js/rating.js",
  "js/tabuleiro.js",
  "js/telas/aberturas.js",
  "js/telas/outras.js",
  "js/telas/puzzles.js",
  "js/util.js",
  "js/vendor/chess.js",
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
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('lance-a-lance-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
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
