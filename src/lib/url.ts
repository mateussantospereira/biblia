import { PADRAO, VERSOES } from "./constantes";
import type { Estado } from "./tipos";

function segmentosDaUrl(): string[] {
  const base = import.meta.env.BASE_URL;
  const caminho = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length)
    : window.location.pathname;

  return caminho.split("/").filter(Boolean);
}

function urlDoEstado(estado: Estado): string {
  const versao = VERSOES.find((v) => v.id === estado.versao) ?? VERSOES[0];
  return `${import.meta.env.BASE_URL}${versao.url}/${estado.livro}/${estado.capitulo}`;
}

export function lerUrl(): Estado {
  const [segmentoVersao, livro, segmentoCapitulo] = segmentosDaUrl();
  const versao = VERSOES.find((v) => v.url === segmentoVersao) ?? VERSOES[0];
  const capitulo = Number(segmentoCapitulo);

  return {
    versao: versao.id,
    livro: livro ?? PADRAO.livro,
    capitulo: Number.isInteger(capitulo) && capitulo > 0 ? capitulo : PADRAO.capitulo,
  };
}

/** Navegação do usuário: adiciona entrada no histórico. */
export function escreverUrl(estado: Estado): void {
  window.history.pushState(null, "", urlDoEstado(estado));
}

/** Correção automática da URL: não cria entrada no histórico. */
export function sincronizarUrl(estado: Estado): void {
  window.history.replaceState(null, "", urlDoEstado(estado));
}
