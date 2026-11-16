import { ConteudoDoCapitulo } from "@/components/ConteudoDoCapitulo";
import { PainelNavegacao } from "@/components/PainelNavegacao";
import { PainelNotas } from "@/components/PainelNotas";
import { useCapitulo } from "@/lib/useCapitulo";
import type { Estado, Indice } from "@/lib/biblia";

interface Props {
  estado: Estado;
  indice: Indice | null;
  ir: (mudanca: Partial<Estado>) => void;
}

export function PaginaLeitura({ estado, indice, ir }: Props) {
  const { dados, trocando, erro } = useCapitulo(estado);
  const livroAtual = indice?.livros.find((l) => l.slug === estado.livro) ?? null;

  return (
    <div className="layout">
      <ConteudoDoCapitulo capitulo={dados} trocando={trocando} erro={erro} />

      {livroAtual && indice && (
        <PainelNavegacao
          livros={indice.livros}
          livro={livroAtual}
          capitulo={estado.capitulo}
          versao={estado.versao}
          ir={ir}
        />
      )}

      <PainelNotas
        notas={dados?.notas ?? null}
        numeros={dados?.versiculos.map((v) => v.numero) ?? []}
      />
    </div>
  );
}
