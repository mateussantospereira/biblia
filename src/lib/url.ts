import { PADRAO, VERSOES } from "./constantes";
import type { Estado, Rota } from "./tipos";

function segmentosDaUrl(): string[] {
  const base = import.meta.env.BASE_URL;
  const caminho = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length)
    : window.location.pathname;

  return caminho.split("/").filter(Boolean);
}

function versaoPorSegmento(segmento?: string) {
  return VERSOES.find((v) => v.url === segmento) ?? VERSOES[0];
}

export function urlDoEstado(estado: Estado): string {
  const versao = versaoPorSegmento(estado.versao) ?? VERSOES.find((v) => v.id === estado.versao) ?? VERSOES[0];
  return `${import.meta.env.BASE_URL}${versao.url}/${estado.livro}/${estado.capitulo}`;
}

export function urlDoSumario(versaoId: string): string {
  const versao = VERSOES.find((v) => v.id === versaoId) ?? VERSOES[0];
  return `${import.meta.env.BASE_URL}${versao.url}/`;
}

export function lerRota(): Rota {
  const [segmentoVersao, livro, segmentoCapitulo] = segmentosDaUrl();
  const versao = versaoPorSegmento(segmentoVersao);

  // /{versao}/ ou / -> sumário
  if (!livro || !segmentoCapitulo) {
    return { pagina: "sumario", versao: versao.id };
  }

  const capitulo = Number(segmentoCapitulo);
  return {
    pagina: "leitura",
    estado: {
      versao: versao.id,
      livro,
      capitulo: Number.isInteger(capitulo) && capitulo > 0 ? capitulo : PADRAO.capitulo,
    },
  };
}

/** Compatibilidade: retorna um estado de leitura (usado onde faz sentido). */
export function lerUrl(): Estado {
  const rota = lerRota();
  if (rota.pagina === "leitura") return rota.estado;
  return { ...PADRAO, versao: rota.versao };
}

/** Navegação do usuário para leitura. */
export function escreverUrl(estado: Estado): void {
  window.history.pushState(null, "", urlDoEstado(estado));
}

/** Navegação do usuário para o sumário. */
export function escreverUrlSumario(versao: string): void {
  window.history.pushState(null, "", urlDoSumario(versao));
}

/** Correção automática da URL de leitura. */
export function sincronizarUrl(estado: Estado): void {
  window.history.replaceState(null, "", urlDoEstado(estado));
}

/** Correção automática da URL do sumário. */
export function sincronizarUrlSumario(versao: string): void {
  window.history.replaceState(null, "", urlDoSumario(versao));
}

