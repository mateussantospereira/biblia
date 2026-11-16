import { NavegacaoTopo } from "@/components/NavegacaoTopo";
import { SeletorCapitulo } from "@/components/SeletorCapitulo";
import { SeletorLivro } from "@/components/SeletorLivro";
import type { Estado, Indice } from "@/lib/biblia";

interface Props {
  indice: Indice | null;
  estado: Estado | null;
  versao: string;
  pagina: "sumario" | "leitura";
  ir: (mudanca: Partial<Estado>) => void;
  irParaSumario: (versao?: string) => void;
  escuro: boolean;
  alternarTema: () => void;
}

export function Cabecalho({ indice, estado, versao, pagina, ir, irParaSumario, escuro, alternarTema }: Props) {
  const livro = estado ? indice?.livros.find((l) => l.slug === estado.livro) ?? null : null;

  return (
    <header className="topo">
      <div className="topo__linha">
        <button type="button" className="topo__marca topo__marca--botao" onClick={() => irParaSumario(versao)}>
          Bíblia Sagrada Católica
        </button>

        {pagina === "leitura" && estado && (
          <div className="topo__campos">
            <SeletorLivro indice={indice} valor={estado.livro} ir={ir} />
            <SeletorCapitulo total={livro?.capitulos ?? 0} valor={estado.capitulo} ir={ir} />
          </div>
        )}

        <NavegacaoTopo escuro={escuro} alternarTema={alternarTema} />
      </div>
    </header>
  );
}
