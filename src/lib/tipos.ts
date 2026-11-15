export type Testamento = "AT" | "NT";

export interface Livro {
  ordem: number;
  slug: string;
  nome: string;
  testamento: Testamento;
  capitulos: number;
}

export interface Indice {
  versao: string;
  versaoNome: string;
  total: number;
  livros: Livro[];
}

export interface Versiculo {
  numero: number;
  texto: string;
  nota?: boolean;
}

export interface Nota {
  ref: string;
  texto: string;
}

export interface Capitulo {
  versao: string;
  versaoNome: string;
  livro: string;
  nome: string;
  testamento: Testamento;
  capitulo: number;
  totalVersiculos: number;
  versiculos: Versiculo[];
  notas: Nota[];
}

/** Posição atual do leitor (também refletida na URL). */
export interface Estado {
  versao: string;
  livro: string;
  capitulo: number;
}
