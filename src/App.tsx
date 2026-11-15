import { useEffect, useState } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { PaginaLeitura } from "@/components/PaginaLeitura";
import {
  ajustar,
  carregarIndice,
  escreverUrl,
  lerUrl,
  sincronizarUrl,
  vizinho,
  type Estado,
  type Indice,
} from "@/lib/biblia";

export default function App() {
  // `estado` é o que está na URL. `atual` é o mesmo estado já corrigido
  // para a versão carregada (ver ajustar() em lib/biblia.ts).
  const [estado, setEstado] = useState<Estado>(() => lerUrl());
  const [indice, setIndice] = useState<Indice | null>(null);
  const [escuro, setEscuro] = useState(() => localStorage.getItem("tema") === "escuro");

  const atual = ajustar(estado, indice);

  function ir(mudanca: Partial<Estado>) {
    const novo = { ...atual, ...mudanca };
    escreverUrl(novo);
    setEstado(novo);
  }

  // tema claro/escuro
  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem("tema", escuro ? "escuro" : "claro");
  }, [escuro]);

  // mantém a barra de endereço igual ao que está na tela
  useEffect(() => {
    sincronizarUrl(atual);
  }, [atual.versao, atual.livro, atual.capitulo]);

  // botão "voltar" do navegador
  useEffect(() => {
    const aoVoltar = () => setEstado(lerUrl());
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  // catálogo dos livros da versão escolhida
  useEffect(() => {
    let vivo = true;
    carregarIndice(atual.versao)
      .then((carregado) => {
        if (vivo) setIndice(carregado);
      })
      .catch(() => {
        if (vivo) setIndice(null);
      });
    return () => {
      vivo = false;
    };
  }, [atual.versao]);

  return (
    <>
      <Cabecalho
        indice={indice}
        estado={atual}
        ir={ir}
        anterior={indice ? vizinho(indice, atual, -1) : null}
        proximo={indice ? vizinho(indice, atual, 1) : null}
        escuro={escuro}
        alternarTema={() => setEscuro((valor) => !valor)}
      />
      <main>
        <PaginaLeitura versao={atual.versao} livro={atual.livro} capitulo={atual.capitulo} />
      </main>
    </>
  );
}
