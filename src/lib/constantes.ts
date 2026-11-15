import type { Estado } from "./tipos";

export const VERSOES = [
  { id: "matos-soares-1956", url: "matos-soares-1956", nome: "Matos Soares (1956)", curto: "Matos Soares" },
  { id: "ave-maria", url: "ave-maria", nome: "Ave Maria", curto: "Ave Maria" },
] as const;

export const TESTAMENTOS = [
  { id: "AT", nome: "Antigo Testamento" },
  { id: "NT", nome: "Novo Testamento" },
] as const;

export const PADRAO: Estado = {
  versao: "matos-soares-1956",
  livro: "genesis",
  capitulo: 1,
};
