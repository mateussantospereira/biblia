import type { Nota } from "@/lib/biblia";

interface Props {
  nota: Nota;
  numeros: number[];
}

export function ItemNota({ nota, numeros }: Props) {
  const versiculo = numeroDoVersiculo(nota.ref);
  const podeRolar = versiculo !== null && numeros.includes(versiculo);

  return (
    <li className="nota">
      {podeRolar ? (
        <button type="button" className="nota__ref nota__ref--link" onClick={() => rolarParaVersiculo(versiculo)}>
          {nota.ref}
        </button>
      ) : (
        <span className="nota__ref">{nota.ref}</span>
      )}
      {nota.texto}
    </li>
  );
}

function numeroDoVersiculo(ref: string): number | null {
  const m = /^\d+:(\d+)/.exec(ref);
  return m ? Number(m[1]) : null;
}

function rolarParaVersiculo(numero: number) {
  document.getElementById(`v${numero}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}
