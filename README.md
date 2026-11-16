# Leitor da Bíblia

Leitor das traduções **Matos Soares (1956)** e **Ave Maria**, com página inicial em **sumário**, leitura centralizada, navegação por testamento/livro/capítulo e notas.

- **Site:** https://mateussantospereira.github.io/biblia/
- **Stack:** Bun + Vite + React + TypeScript
- **Estilo:** CSS próprio com classes nomeadas (`src/leitura.css`) e tema por variáveis (`src/index.css`)
- **Dados:** JSON estático em `public/biblias/{versao}/{livro}/{capitulo}.json`

## Comandos

```bash
bun install          # instalar dependências
bun run dev          # servidor local (http://localhost:5173)
bun run build        # gera dist/ + dist/404.html (fallback para GitHub Pages)
bun run preview      # serve o build localmente
bun run lint         # checagem (oxlint)
```

Publicar: push na branch `master`/`main`. O workflow `.github/workflows/deploy.yml` faz build e deploy no GitHub Pages.

## Rotas

- **Sumário (página inicial):** `/{base}/{versao}/` (ex.: `/matos-soares-1956/`)
- **Leitura:** `/{base}/{versao}/{livro}/{capitulo}` (ex.: `/matos-soares-1956/genesis/1`)

A marca **“Bíblia”** no topo volta para o sumário da versão atual.

## Onde mexer

| Quero mudar… | Arquivo(s) |
|---|---|
| **Cores** | `src/index.css` → ajuste só `--background` e `--foreground` em `:root` e `.dark` |
| **Fonte, tamanho, espaçamento do texto** | `src/leitura.css` → `.leitor`, `.leitor__texto p`, `--font-leitura` |
| **Layout da leitura (texto central + painéis)** | `src/leitura.css` → `.layout`, `.painel`, media query desktop |
| **Visual do sumário** | `src/leitura.css` → `.sumario*` e `src/components/Sumario.tsx` |
| **Versões e capítulo padrão** | `src/lib/constantes.ts` |
| **Regras de URL/rotas** | `src/lib/url.ts` |
| **Carregamento e cache de dados** | `src/lib/dados.ts` |
| **Navegação entre capítulos e ajustes** | `src/lib/navegacao.ts` |
| **Tipos** | `src/lib/tipos.ts` |
| **Composição da aplicação** | `src/App.tsx` |
| **Topo** | `src/components/Cabecalho.tsx`, `SeletorVersao.tsx`, `SeletorLivro.tsx`, `SeletorCapitulo.tsx`, `NavegacaoTopo.tsx` |
| **Leitura** | `src/components/PaginaLeitura.tsx`, `ConteudoDoCapitulo.tsx`, `src/lib/useCapitulo.ts` |
| **Painel de navegação** | `src/components/PainelNavegacao.tsx`, `GradeDeCapitulos.tsx` |
| **Painel de notas** | `src/components/PainelNotas.tsx`, `ListaDeNotas.tsx`, `ItemNota.tsx` |
| **Sumário** | `src/components/Sumario.tsx`, `SecaoTestamento.tsx`, `CartaoLivro.tsx` |
| **Prefixo do site** | `.github/workflows/deploy.yml` (`VITE_BASE`) e `vite.config.ts` |

## Estrutura

```
public/biblias/
  {versao}/indice.json
  {versao}/{livro}/{capitulo}.json

src/
  lib/
    tipos.ts            # tipos (Estado, Rota, Capitulo, etc.)
    constantes.ts       # versões, testamentos, padrão
    dados.ts            # fetch + cache de índice/capítulo
    navegacao.ts        # anterior/próximo e ajustes
    url.ts              # ler/escrever/sincronizar rotas
    biblia.ts           # reexporta a lib
    useCapitulo.ts      # hook de carregamento do capítulo

  hooks/
    useIndice.ts        # carrega índice da versão
    useTema.ts          # tema claro/escuro

  components/
    Cabecalho.tsx
    NavegacaoTopo.tsx
    SeletorVersao.tsx
    SeletorLivro.tsx
    SeletorCapitulo.tsx
    Sumario.tsx
    SecaoTestamento.tsx
    CartaoLivro.tsx
    PaginaLeitura.tsx
    ConteudoDoCapitulo.tsx
    PainelNavegacao.tsx
    GradeDeCapitulos.tsx
    PainelNotas.tsx
    ListaDeNotas.tsx
    ItemNota.tsx

  App.tsx               # estado de rota e composição
  index.css             # tema
  leitura.css           # estilos
  main.tsx              # entrada

scripts/
  indice.sh
```

## Como funciona

1. `App.tsx` lê a rota (`lerRota`): **sumário** ou **leitura**.
2. O índice da versão é carregado por `useIndice`.
3. Na leitura, `useCapitulo` busca o capítulo, mantém o anterior visível durante a troca e rola apenas a área de texto.
4. No desktop, o layout mantém painéis e texto em colunas com rolagem independente (a leitura rola no componente principal).

## Observações

- No GitHub Pages, URLs internas podem responder HTTP 404 mas renderizam via `404.html` (SPA fallback).
- `src/components/ui/button.tsx` é gerado (shadcn) e não é usado pelos componentes do app; o lint pode acusar aviso nele.
- `dados/` é ignorado pelo git.
