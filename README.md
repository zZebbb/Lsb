# Lance a Lance ♞

App de xadrez para o celular que **funciona sem internet**: puzzles táticos com rating e aulas de abertura comentadas lance a lance, em português.

É um PWA (Progressive Web App): você abre uma vez pelo navegador, instala na tela inicial e, a partir daí, ele abre como um app normal, mesmo no modo avião. Funciona em Android e iPhone. Não tem anúncios, conta, nem coleta de dados: o progresso fica salvo só no seu aparelho.

> Neste repositório também está o **Palácio**, um app de treino de memória feito do mesmo jeito: veja [`palacio/README.md`](palacio/README.md). Ele fica em `https://zzebbb.github.io/Lsb/palacio/`.

## O que tem

**Puzzles**
- 1.000 puzzles gerados com o Stockfish (rating de 400 a 2.600), cada um com solução única verificada pelo motor.
- Rating que se ajusta ao seu nível (começa em 1200 e acompanha seus acertos).
- O adversário faz o lance que cria a tática; você encontra a resposta.
- Dica (mostra a peça, depois a seta), ver solução, rever lance a lance.
- Filtro por tema: mate em 1/2/3, garfo, cravada, espeto, ataque descoberto, xeque duplo, sacrifício, promoção, mate do corredor, finais…

**Aberturas**
- 19 aberturas e armadilhas, 48 linhas, todas comentadas lance a lance:
  - Brancas: Italiana (incl. Gambito Evans, Dois Cavalos, Fígado Frito), Espanhola, Escocesa, Gambito da Dama, Sistema Londres.
  - Pretas contra 1.e4: Siciliana (Najdorf, Dragão, Alapin, Smith-Morra), Francesa, Caro-Kann, Escandinava, Petrov.
  - Pretas contra 1.d4: Eslava, Índia do Rei, Nimzo-Índia.
  - Armadilhas: Mate do Pastor, Mate de Légal, Blackburne-Shilling, Englund, Elefante, Arca de Noé, Siberiana, Mate do Louco.
- **Estudar**: passe pelos lances com setas e a explicação de cada ideia.
- **Treinar**: você joga o seu lado e o app responde; errou, ele avisa e mostra o lance certo.
- **Repetição espaçada**: cada linha tem um nível (0–5) e volta para revisão em 1, 3, 7, 16 e 35 dias.
- **Explorar**: tabuleiro livre que mostra o nome da abertura (base com mais de 3.800 posições) e as continuações do seu repertório.
- Os 8 princípios da abertura.

**Lições de tática**: garfo, cravada, espeto, ataque descoberto, xeque duplo, peças penduradas, mates do corredor e sufocado, sacrifício, promoção, com exemplo animado e treino do tema.

**Progresso**: gráfico do rating, acertos por tema (e o seu ponto fraco), linhas dominadas, backup em arquivo para levar para outro celular.

## Como instalar no celular

### 1. Publicar no GitHub Pages (uma vez só)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em *Build and deployment*, escolha **Deploy from a branch**, selecione o branch com o app e a pasta **/ (root)**, e clique em **Save**.
3. Em um ou dois minutos o app fica disponível em `https://zzebbb.github.io/Lsb/`.

### 2. Instalar

Abra o endereço acima **no celular, com internet, uma vez**. Espere a tela inicial carregar.

- **Android (Chrome)**: toque no botão **Instalar app** que aparece na tela inicial do Lance a Lance, ou no menu ⋮ → **Instalar app** / **Adicionar à tela inicial**.
- **iPhone (Safari)**: toque em **Compartilhar** (o quadrado com a seta) → **Adicionar à Tela de Início**.

Pronto: o ícone do cavalo aparece na tela inicial. A partir daí o app funciona sem internet. Quando houver uma versão nova e você estiver online, ele se atualiza sozinho.

> Dica: o progresso fica salvo no aparelho. Use **Progresso → Ajustes e backup → Exportar** de vez em quando para guardar uma cópia.

### Testar no computador

Precisa de um servidor local (abrir o `index.html` direto não funciona, por segurança dos navegadores):

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Estrutura

```
index.html, manifest.webmanifest, sw.js   app, instalação e modo offline
css/app.css                               estilos (claro/escuro, celular primeiro)
js/app.js                                 rotas e barra superior
js/tabuleiro.js                           tabuleiro com toque, arrastar, setas e promoção
js/telas/                                 puzzles, aberturas, lições, progresso
js/vendor/chess.js                        regras do xadrez (chess.js, BSD-2)
dados/aberturas.js                        repertório comentado
dados/temas.js                            nomes dos temas e lições de tática
dados/puzzles.json                        banco de puzzles
dados/nomes-aberturas.json                nomes das aberturas por posição
ferramentas/                              scripts para gerar e validar os dados
```

Não há etapa de build: é HTML, CSS e JavaScript puro.

## Mexendo no conteúdo

**Depois de qualquer mudança nos arquivos do app**, gere de novo o service worker, senão os celulares continuam com a versão antiga guardada:

```bash
node ferramentas/gerar_sw.mjs
```

### Aberturas

As linhas ficam em `dados/aberturas.js`, em SAN (notação inglesa, como o chess.js entende) com comentários entre chaves:

```js
lances: 'e4 {Ocupa o centro.} e5 Nf3 {Desenvolve atacando e5.} Nc6 Bc4'
```

Valide a legalidade e confira com o Stockfish se nenhum lance da linha principal é um erro e se as armadilhas funcionam:

```bash
node ferramentas/validar_aberturas.mjs
node ferramentas/validar_aberturas.mjs --json | python3 ferramentas/validar_aberturas.py --stockfish /caminho/stockfish
node ferramentas/validar_licoes.mjs
```

### Mais puzzles

Precisa do [Stockfish](https://stockfishchess.org/download/) e do `python-chess` (`pip install chess`).

```bash
cd ferramentas
python3 gerar_puzzles.py --stockfish /caminho/stockfish --partidas 500 --processos 4
python3 montar_puzzles.py        # junta, remove repetidos, calcula ratings -> dados/puzzles.json
cd .. && node ferramentas/gerar_sw.mjs
```

O gerador imita o da Lichess: o Stockfish joga partidas a partir de aberturas reais, o script procura lances que parecem bons numa busca rasa mas perdem para uma tática, e só aceita o puzzle se cada lance da solução for claramente o único bom. Ele pode ser interrompido e retomado (continua os arquivos em `ferramentas/saida-puzzles/`).

O nome das aberturas vem de `ferramentas/lichess-openings/*.tsv`; para regenerar: `node ferramentas/montar_nomes.mjs`.

## Créditos e licenças

- Regras: [chess.js](https://github.com/jhlywa/chess.js), de Jeff Hlywa — BSD-2 (`js/vendor/chess.js.LICENSE`).
- Peças: conjunto *cburnett*, de Colin M.L. Burnett — [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Nomes das aberturas: [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) — CC0.
- Puzzles gerados com o [Stockfish](https://stockfishchess.org/) (GPL-3.0); o motor não é distribuído com o app.
