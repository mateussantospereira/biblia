import type { Estado } from "@/lib/biblia";

interface Props {
  pagina: "sumario" | "leitura";
  anterior: Estado | null;
  proximo: Estado | null;
  ir: (mudanca: Partial<Estado>) => void;
  escuro: boolean;
  alternarTema: () => void;
}

export function NavegacaoTopo({ pagina, anterior, proximo, ir, escuro, alternarTema }: Props) {
  return (
    <div className="topo__acoes">
      {pagina === "leitura" && (
        <nav className="topo__navegacao" aria-label="Capítulos">
          <button type="button" className="topo__botao" disabled={!anterior} onClick={() => anterior && ir(anterior)}>
            ← Anterior
          </button>
          <button type="button" className="topo__botao" disabled={!proximo} onClick={() => proximo && ir(proximo)}>
            Próximo →
          </button>
        </nav>
      )}

      <button type="button" className="topo__botao" aria-label="Alternar tema" onClick={alternarTema}>
        {escuro ? "☀" : "☾"}
      </button>
    </div>
  );
}
