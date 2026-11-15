import { useEffect, useState } from "react";
import { carregarCapitulo, type Capitulo, type Estado } from "@/lib/biblia";

interface Carregado {
  chave: string;
  capitulo: Capitulo;
}

interface Falha {
  chave: string;
  mensagem: string;
}

/**
 * Carrega o capítulo atual e preserva o último conteúdo visível enquanto o próximo chega.
 * Isso evita o pisca-pisca de "Carregando…" entre navegações.
 */
export function useCapitulo(estado: Estado) {
  const chave = `${estado.versao}/${estado.livro}/${estado.capitulo}`;
  const [carregado, setCarregado] = useState<Carregado | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);

  useEffect(() => {
    let ativo = true;

    carregarCapitulo(estado.versao, estado.livro, estado.capitulo)
      .then((capitulo) => {
        if (!ativo) return;
        setCarregado({ chave, capitulo });
        document.title = `${capitulo.nome} ${capitulo.capitulo} — ${capitulo.versaoNome}`;
        document.querySelector<HTMLElement>(".leitor")?.scrollTo({ top: 0 });
      })
      .catch((erro) => {
        if (!ativo) return;
        setFalha({ chave, mensagem: String(erro) });
      });

    return () => {
      ativo = false;
    };
  }, [chave, estado.versao, estado.livro, estado.capitulo]);

  return {
    dados: carregado?.capitulo ?? null,
    trocando: carregado !== null && carregado.chave !== chave,
    erro: falha?.chave === chave ? falha.mensagem : null,
  };
}
