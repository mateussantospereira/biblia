import { NavegacaoTopo } from "@/components/NavegacaoTopo";
import { SeletorCapitulo } from "@/components/SeletorCapitulo";
import { SeletorLivro } from "@/components/SeletorLivro";
import { SeletorVersao } from "@/components/SeletorVersao";
import type { Estado, Indice } from "@/lib/biblia";

interface Props {
  indice: Indice | null;
  estado: Estado;
  ir: (mudanca: Partial<Estado>) => void;
  anterior: Estado | null;
  proximo: Estado | null;
  escuro: boolean;
  alternarTema: () => void;
}

export function Cabecalho({ indice, estado, ir, anterior, proximo, escuro, alternarTema }: Props) {
  const livro = indice?.livros.find((l) => l.slug === estado.livro) ?? null;
  const posicao = livro ? `${livro.nome} ${estado.capitulo} de ${livro.capitulos}` : "";

  return (
    <header className="topo">
      <div className="topo__linha">
        <span className="topo__marca">Bíblia</span>
        <SeletorVersao valor={estado.versao} ir={ir} />

        {/* No celular: livro/capítulo aqui. No desktop: no painel direito. */}
        <div className="topo__campos">
          <SeletorLivro indice={indice} valor={estado.livro} ir={ir} />
          <SeletorCapitulo total={livro?.capitulos ?? 0} valor={estado.capitulo} ir={ir} />
        </div>

        <span className="topo__espaco" />

        <NavegacaoTopo
          anterior={anterior}
          proximo={proximo}
          posicao={posicao}
          ir={ir}
          escuro={escuro}
          alternarTema={alternarTema}
        />
      </div>
    </header>
  );
}
