import { ItemNota } from "@/components/ItemNota";
import type { Nota } from "@/lib/biblia";

interface Props {
  notas: Nota[] | null;
  numeros: number[];
}

export function ListaDeNotas({ notas, numeros }: Props) {
  if (notas === null) return <p className="painel__vazio">Carregando…</p>;
  if (notas.length === 0) return <p className="painel__vazio">Este capítulo não tem notas.</p>;

  return (
    <ol className="notas">
      {notas.map((nota, i) => (
        <ItemNota key={`${nota.ref}-${i}`} nota={nota} numeros={numeros} />
      ))}
    </ol>
  );
}
