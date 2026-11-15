// Tudo que fala com os JSON de public/biblias mora aqui.
// Nenhum componente conhece caminho de arquivo: só chama carregarIndice/carregarCapitulo.

export type Testamento = "AT" | "NT";

export type Livro = {
  ordem: number;
  slug: string;
  nome: string;
  testamento: Testamento;
  capitulos: number;
};

export type Indice = {
  versao: string;
  versaoNome: string;
  total: number;
  livros: Livro[];
};

export type Versiculo = { numero: number; texto: string; nota?: boolean };
export type Nota = { ref: string; texto: string };

export type Capitulo = {
  versao: string;
  versaoNome: string;
  livro: string;
  nome: string;
  testamento: Testamento;
  capitulo: number;
  totalVersiculos: number;
  versiculos: Versiculo[];
  notas: Nota[];
};

// Onde o leitor está. É isso que vai para a URL.
export type Estado = { versao: string; livro: string; capitulo: number };

export const PADRAO: Estado = { versao: "matos-soares-1956", livro: "genesis", capitulo: 1 };

export const VERSOES = [
  { id: "matos-soares-1956", nome: "Matos Soares (1956)" },
  { id: "ave-maria", nome: "Ave Maria" },
] as const;

const RAIZ = `${import.meta.env.BASE_URL}biblias`;

const indices = new Map<string, Promise<Indice>>();
const capitulos = new Map<string, Promise<Capitulo>>();

function buscar<T>(caminho: string): Promise<T> {
  return fetch(`${RAIZ}/${caminho}`).then((resposta) => {
    if (!resposta.ok) throw new Error(`${caminho} (${resposta.status})`);
    return resposta.json() as Promise<T>;
  });
}

export function carregarIndice(versao: string): Promise<Indice> {
  let promessa = indices.get(versao);
  if (!promessa) {
    promessa = buscar<Indice>(`${versao}/indice.json`);
    indices.set(versao, promessa);
  }
  return promessa;
}

export function carregarCapitulo(
  versao: string,
  livro: string,
  capitulo: number,
): Promise<Capitulo> {
  const chave = `${versao}/${livro}/${capitulo}`;
  let promessa = capitulos.get(chave);
  if (!promessa) {
    promessa = buscar<Capitulo>(`${chave}.json`);
    capitulos.set(chave, promessa);
  }
  return promessa;
}

// Capítulo anterior/próximo, atravessando a fronteira entre livros.
export function vizinho(indice: Indice, estado: Estado, passo: 1 | -1): Estado | null {
  const posicao = indice.livros.findIndex((l) => l.slug === estado.livro);
  if (posicao < 0) return null;

  const livro = indice.livros[posicao];
  const capitulo = estado.capitulo + passo;

  if (capitulo >= 1 && capitulo <= livro.capitulos) return { ...estado, capitulo };

  const outro = indice.livros[posicao + passo];
  if (!outro) return null;

  return { ...estado, livro: outro.slug, capitulo: passo === 1 ? 1 : outro.capitulos };
}

// Corrige um estado que não existe na versão escolhida:
// livro inválido, capítulo 0 ou capítulo além do fim (Joel 4 x 3).
export function ajustar(estado: Estado, indice: Indice | null): Estado {
  if (!indice || indice.livros.length === 0) return estado;

  const livro = indice.livros.find((l) => l.slug === estado.livro);
  if (!livro) return { ...estado, livro: indice.livros[0].slug, capitulo: 1 };
  if (estado.capitulo < 1) return { ...estado, capitulo: 1 };
  if (estado.capitulo > livro.capitulos) return { ...estado, capitulo: livro.capitulos };

  return estado;
}

// A URL é a única fonte de verdade: ?v=versao&l=livro&c=capitulo
export function lerUrl(): Estado {
  const params = new URLSearchParams(window.location.search);
  const capitulo = Number(params.get("c"));

  return {
    versao: params.get("v") ?? PADRAO.versao,
    livro: params.get("l") ?? PADRAO.livro,
    capitulo: Number.isInteger(capitulo) && capitulo > 0 ? capitulo : PADRAO.capitulo,
  };
}

export function escreverUrl(estado: Estado) {
  const params = new URLSearchParams({
    v: estado.versao,
    l: estado.livro,
    c: String(estado.capitulo),
  });
  window.history.pushState(null, "", `${import.meta.env.BASE_URL}?${params}`);
}
