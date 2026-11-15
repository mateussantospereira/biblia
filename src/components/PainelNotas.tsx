import { ListaDeNotas } from "@/components/ListaDeNotas";
import type { Nota } from "@/lib/biblia";

interface Props {
  notas: Nota[] | null;
  numeros: number[];
}

export function PainelNotas({ notas, numeros }: Props) {
  return (
    <aside className="painel painel--notas">
      <section className="painel__secao">
        <h2 className="painel__titulo">
          Notas
          {notas && <span className="painel__contagem">{notas.length}</span>}
        </h2>
        <ListaDeNotas notas={notas} numeros={numeros} />
      </section>
    </aside>
  );
}
