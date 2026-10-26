# Palácio 🏛️

App de treino de memória para o celular que **funciona sem internet**, em português.

É um PWA, como o Lance a Lance (o app de xadrez na raiz deste repositório): você abre uma vez pelo navegador, instala na tela inicial e, a partir daí, ele abre como um app normal, mesmo no modo avião. Não tem anúncios, conta nem coleta de dados: tudo fica salvo só no aparelho.

## O que tem

**Sistema mnemônico principal** (Major System): cada algarismo vira um som de consoante e as vogais são livres. Assim 45 vira ROLO, e qualquer número vira uma sequência de imagens.
- A tabela e uma lista de 110 palavras sugeridas (0–9 e 00–99), que você pode trocar. O app confere se cada palavra bate com a tabela.
- **Lembrar a palavra**: aparece o número e você lembra a sua palavra (mede o tempo).
- **Qual é o número?**: aparece a sua palavra e você digita o número.
- **Decodificar**: palavras quaisquer escondem números; descubra qual.
- **Crie uma palavra**: invente uma palavra para um número de 2 a 4 dígitos; o app confere e mostra letra por letra.
- Os pares errados ou lentos aparecem mais vezes. "Pares rápidos" conta quantos você já domina.

**Sequência de números**: o número aparece por alguns segundos, some e você digita. A cada acerto, mais um algarismo. Ritmo (rápido/normal/calmo), nível inicial, agrupamento em pares ou trios e, no resultado, as palavras do sistema para cada par.

**Já vi ou nova?**: palavras aparecem uma a uma e você diz se ela já apareceu. Três vidas. Mais de 900 palavras em português.

**Cartões de revisão**: baralhos com repetição espaçada (no estilo do Anki): Errei / Difícil / Bom / Fácil, com o próximo intervalo em cada botão. Importa listas coladas ("frente ; verso", uma por linha) e cria um baralho pronto com as suas palavras de 00 a 99.

**Progresso**: dias seguidos, calendário das últimas semanas, recordes e gráficos. Ajustes de som, aparência (clara/escura) e backup em arquivo.

## Como instalar no iPhone

1. O app precisa estar publicado no GitHub Pages (veja o README da raiz). Ele fica em `https://zzebbb.github.io/Lsb/palacio/`.
2. Abra esse endereço **no Safari, com internet, uma vez**.
3. Toque em **Compartilhar** → **Adicionar à Tela de Início**.

Pronto: o ícone do palácio aparece na tela inicial e funciona sem internet. Quando houver versão nova e você estiver online, ele se atualiza sozinho.

> Se ao abrir o endereço aparecer o app de xadrez, recarregue a página uma vez (o modo offline antigo do xadrez ainda estava cuidando do endereço).

> Dica: use **Progresso → Ajustes e backup → Exportar** de vez em quando para guardar uma cópia dos seus cartões e palavras.

### Testar no computador

```bash
python3 -m http.server 8080
# abra http://localhost:8080/palacio/
```

## Estrutura

```
index.html, manifest.webmanifest, sw.js   app, instalação e modo offline
css/app.css                               estilos (blocos coloridos, claro/escuro)
js/app.js                                 rotas e barra superior
js/util.js                                armazenamento, sons, recordes, ícones
js/componentes.js, js/teclado.js          peças de interface e teclado numérico
js/sistema.js                             regras do sistema (palavra -> número) e suas palavras
js/srs.js                                 repetição espaçada dos cartões
js/telas/                                 início, números, palavras, cartões, sistema
dados/sistema.js                          tabela e palavras sugeridas de 0 a 99
dados/palavras.js                         palavras do "Já vi ou nova?" e do treino de decodificar
ferramentas/                              gerar o service worker e os ícones
```

Não há etapa de build: é HTML, CSS e JavaScript puro.

**Depois de qualquer mudança nos arquivos do app**, gere de novo o service worker, senão os celulares continuam com a versão antiga guardada:

```bash
node palacio/ferramentas/gerar_sw.mjs
```

Os ícones são desenhados em `ferramentas/gerar_icones.mjs` (precisa do Playwright): `node palacio/ferramentas/gerar_icones.mjs`.
