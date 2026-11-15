import { useEffect, useState } from "react";
import type { Indice } from "@/lib/biblia";
import { carregarIndice } from "@/lib/biblia";

export function useIndice(versao: string): Indice | null {
  const [indice, setIndice] = useState<Indice | null>(null);

  useEffect(() => {
    let ativo = true;

    carregarIndice(versao)
      .then((dados) => {
        if (ativo) setIndice(dados);
      })
      .catch(() => {
        if (ativo) setIndice(null);
      });

    return () => {
      ativo = false;
    };
  }, [versao]);

  return indice;
}
