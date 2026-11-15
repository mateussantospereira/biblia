import type { Estado, Indice } from "./tipos";

/** Retorna o capítulo anterior/próximo, atravessando livros. */
export function vizinho(indice: Indice, estado: Estado, passo: 1 | -1): Estado | null {
  const posicao = indice.livros.findIndex((l) => l.slug === estado.livro);
  if (posicao < 0) return null;

  const livro = indice.livros[posicao];
  const capitulo = estado.capitulo + passo;

  if (capitulo >= 1 && capitulo <= livro.capitulos) {
    return { ...estado, capitulo };
  }

  const outroLivro = indice.livros[posicao + passo];
  if (!outroLivro) return null;

  return {
    ...estado,
    livro: outroLivro.slug,
    capitulo: passo === 1 ? 1 : outroLivro.capitulos,
  };
}

/** Garante que o estado exista na versão atual (ex.: Joel tem 3 caps na Matos e 4 na Ave Maria). */
export function ajustar(estado: Estado, indice: Indice | null): Estado {
  if (!indice || indice.livros.length === 0) return estado;

  const livro = indice.livros.find((l) => l.slug === estado.livro);
  if (!livro) {
    const primeiro = indice.livros[0];
    return { ...estado, livro: primeiro.slug, capitulo: 1 };
  }

  if (estado.capitulo < 1) return { ...estado, capitulo: 1 };
  if (estado.capitulo > livro.capitulos) return { ...estado, capitulo: livro.capitulos };
  return estado;
}
