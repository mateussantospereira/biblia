import { useEffect, useState } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { PaginaLeitura } from "@/components/PaginaLeitura";
import { useIndice } from "@/hooks/useIndice";
import { useTema } from "@/hooks/useTema";
import { ajustar, escreverUrl, lerUrl, sincronizarUrl, vizinho, type Estado } from "@/lib/biblia";

export default function App() {
  const [estado, setEstado] = useState<Estado>(lerUrl);
  const indice = useIndice(estado.versao);
  const { escuro, alternarTema } = useTema();

  // Corrige livro/capítulo inválidos para a versão atual (ex.: Joel 3 vs 4).
  const atual = ajustar(estado, indice);

  function ir(mudanca: Partial<Estado>) {
    const proximo = { ...atual, ...mudanca };
    escreverUrl(proximo);
    setEstado(proximo);
  }

  // Mantém a barra de endereço alinhada com o estado exibido.
  useEffect(() => {
    sincronizarUrl({ versao: atual.versao, livro: atual.livro, capitulo: atual.capitulo });
  }, [atual.versao, atual.livro, atual.capitulo]);

  // Suporta o botão voltar/avançar do navegador.
  useEffect(() => {
    function aoVoltar() {
      setEstado(lerUrl());
    }
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  return (
    <>
      <Cabecalho
        indice={indice}
        estado={atual}
        ir={ir}
        anterior={indice ? vizinho(indice, atual, -1) : null}
        proximo={indice ? vizinho(indice, atual, 1) : null}
        escuro={escuro}
        alternarTema={alternarTema}
      />
      <main>
        <PaginaLeitura estado={atual} indice={indice} ir={ir} />
      </main>
    </>
  );
}
