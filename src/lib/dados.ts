import type { Capitulo, Indice } from "./tipos";

const RAIZ = `${import.meta.env.BASE_URL}biblias`;
const cacheIndices = new Map<string, Promise<Indice>>();
const cacheCapitulos = new Map<string, Promise<Capitulo>>();

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${RAIZ}/${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar ${caminho} (${resposta.status})`);
  }
  return (await resposta.json()) as T;
}

export function carregarIndice(versao: string): Promise<Indice> {
  const existente = cacheIndices.get(versao);
  if (existente) return existente;

  const promessa = buscarJson<Indice>(`${versao}/indice.json`);
  cacheIndices.set(versao, promessa);
  return promessa;
}

export function carregarCapitulo(versao: string, livro: string, capitulo: number): Promise<Capitulo> {
  const chave = `${versao}/${livro}/${capitulo}`;
  const existente = cacheCapitulos.get(chave);
  if (existente) return existente;

  const promessa = buscarJson<Capitulo>(`${chave}.json`);
  cacheCapitulos.set(chave, promessa);
  return promessa;
}
