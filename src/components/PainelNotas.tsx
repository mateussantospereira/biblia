import notasTopo from "@/assets/notas-topo.png";
import { ListaDeNotas } from "@/components/ListaDeNotas";
import type { Nota } from "@/lib/biblia";

interface Props {
  notas: Nota[] | null;
  numeros: number[];
}

export function PainelNotas({ notas, numeros }: Props) {
  return (
    <aside className="painel painel--notas">
      <img src={notasTopo} alt="" className="painel__imagem-notas" />
      <section className="painel__secao painel__secao--notas">
        <h2 className="painel__titulo">
          Notas
          {notas && <span className="painel__contagem">{notas.length}</span>}
        </h2>
        <div className="painel__conteudo-notas">
          <ListaDeNotas notas={notas} numeros={numeros} />
        </div>
      </section>
    </aside>
  );
}
