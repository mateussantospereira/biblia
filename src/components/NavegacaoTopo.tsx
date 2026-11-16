import type { Estado } from "@/lib/biblia";

interface Props {
  pagina: "sumario" | "leitura";
  anterior: Estado | null;
  proximo: Estado | null;
  posicao: string;
  ir: (mudanca: Partial<Estado>) => void;
  escuro: boolean;
  alternarTema: () => void;
}

export function NavegacaoTopo({ pagina, anterior, proximo, posicao, ir, escuro, alternarTema }: Props) {
  return (
    <>
      {pagina === "leitura" ? (
        <nav className="topo__navegacao" aria-label="Capítulos">
          <button type="button" className="topo__botao" disabled={!anterior} onClick={() => anterior && ir(anterior)}>
            ← Anterior
          </button>
          <span className="topo__posicao">{posicao}</span>
          <button type="button" className="topo__botao" disabled={!proximo} onClick={() => proximo && ir(proximo)}>
            Próximo →
          </button>
        </nav>
      ) : (
        <span className="topo__espaco" />
      )}

      <button type="button" className="topo__botao" aria-label="Alternar tema" onClick={alternarTema}>
        {escuro ? "☀" : "☾"}
      </button>
    </>
  );
}
