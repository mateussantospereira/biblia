import { useEffect, useState } from "react";

const CHAVE_TEMA = "tema";

export function useTema() {
  const [escuro, setEscuro] = useState(() => localStorage.getItem(CHAVE_TEMA) === "escuro");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
  }, [escuro]);

  function alternarTema() {
    setEscuro((atual) => !atual);
  }

  return { escuro, alternarTema };
}
