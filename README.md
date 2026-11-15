# Leitor da Bíblia

Leitor das traduções **Matos Soares (1956)** e **Ave Maria**, com texto centralizado, navegação por testamento/livro/capítulo e notas.

- **Site:** https://mateussantospereira.github.io/biblia/
- **Stack:** Bun + Vite + React + TypeScript, com CSS próprio em classes nomeadas (`src/leitura.css`) e tema em variáveis (`src/index.css`).
- **Dados:** capítulos em JSON estático em `public/biblias/{versao}/{livro}/{capitulo}.json` (copiados como estão para o site).

## Comandos

```bash
bun install          # instalar dependências
bun run dev          # servidor local (http://localhost:5173)
bun run build        # gera dist/ + dist/404.html (fallback para GitHub Pages)
bun run preview      # serve o build localmente
bun run lint         # checagem (oxlint)
```

Publicar: dar push na branch `master`/`main`. O workflow `.github/workflows/deploy.yml` faz o build e publica no GitHub Pages.

## Onde mexer (guia rápido)

| Quero mudar… | Arquivo |
|---|---|
| **Cores (fundo/texto)** | `src/index.css` → mude só `--background` e `--foreground` em `:root` (claro) e `.dark` (escuro). O resto é derivado. |
| **Fonte, tamanho, espaçamento, largura do texto** | `src/leitura.css` → `.leitor`, `.leitor__texto p`, `--font-leitura` |
| **Layout (texto central, painéis, topo)** | `src/leitura.css` → `.layout`, `.painel`, `.topo` |
| **Versões, capítulo padrão, nomes na URL** | `src/lib/biblia.ts` → `VERSOES`, `PADRAO` |
| **Formato/roteamento da URL** | `src/lib/biblia.ts` → `lerUrl`, `escreverUrl`, `sincronizarUrl` |
| **Onde ficam os JSON** | `src/lib/biblia.ts` → `RAIZ` (`${BASE_URL}biblias`) |
| **Cabeçalho (versão, anterior/próximo, tema)** | `src/components/Cabecalho.tsx` |
| **Painel direito (testamento, livro, capítulos)** | `src/components/PainelNavegacao.tsx` |
| **Painel esquerdo (notas)** | `src/components/PainelNotas.tsx` |
| **Texto do capítulo** | `src/components/PaginaLeitura.tsx` |
| **Carregamento do capítulo** | `src/lib/useCapitulo.ts` |
| **Composição da tela e navegação** | `src/App.tsx` |
| **Tema e índice da versão** | `src/hooks/useTema.ts`, `src/hooks/useIndice.ts` |
| **Prefixo do site (GitHub Pages)** | `.github/workflows/deploy.yml` → `VITE_BASE: /biblia/` (nome do repositório) e `vite.config.ts` |

## Estrutura

```
public/biblias/
  {versao}/indice.json                 # lista de livros e quantidade de capítulos
  {versao}/{livro}/{capitulo}.json     # versículos e notas
src/
  lib/
    biblia.ts               # tipos, dados (fetch/cache), navegação e URL
    useCapitulo.ts          # hook: carrega o capítulo atual
  hooks/
    useIndice.ts            # hook: carrega o índice da versão
    useTema.ts              # hook: tema claro/escuro
  components/
    Cabecalho.tsx           # topo: versão, navegação, tema
    PaginaLeitura.tsx       # layout e conteúdo do capítulo
    PainelNavegacao.tsx     # direita: testamento, livro, capítulos
    PainelNotas.tsx         # esquerda: notas
  App.tsx                   # compõe estado, hooks e componentes
  index.css                 # tema (cores): só --background/--foreground
  leitura.css               # estilos do leitor (classes com nome)
  main.tsx                  # entrada da aplicação
scripts/
  indice.sh                 # (re)gera indice.json a partir dos capítulos
```

## Como funciona (resumo)

1. A **URL é o estado**: `/{versao}/{livro}/{capitulo}`. `lerUrl` lê, `escreverUrl` grava (`pushState`) e `sincronizarUrl` corrige sem criar histórico.
2. `App.tsx` lê a URL, usa `useIndice` para carregar o catálogo da versão, corrige capítulos inválidos com `ajustar` e centraliza a navegação em `ir()`.
3. `PaginaLeitura` usa `useCapitulo` para buscar o capítulo, mantém o conteúdo anterior visível durante a troca e renderiza texto, navegação e notas.
4. Os dados ficam em cache em memória (`Map` em `src/lib/biblia.ts`), evitando requisições repetidas.

## Dados

- Formato do capítulo: `{ versao, versaoNome, livro, nome, testamento, capitulo, versiculos: [{numero, texto}], notas: [{ref, texto}] }`.
- `scripts/indice.sh` conta os arquivos por livro para gerar `indice.json` (os totais diferem entre versões: Joel/Malaquias).
- Os JSONs são servidos direto de `public/` (sem servidor/API).

## Observações

- No GitHub Pages as URLs internas respondem **HTTP 404** mas renderizam (SPA fallback via `404.html`). Em dev e em hosts com rewrite (ex.: Cloudflare Pages) respondem 200.
- `src/components/ui/button.tsx` é gerado (shadcn); o lint acusa um aviso nele — pode ignorar.
- `dados/` (HTML bruto de scraping) é ignorado pelo git.
