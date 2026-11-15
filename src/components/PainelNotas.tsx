import type { Nota } from "@/lib/biblia";

type Props = {
  notas: Nota[] | null; // null = ainda carregando
  numeros: number[]; // números de versículo que existem neste capítulo
};

export function PainelNotas({ notas, numeros }: Props) {
  return (
    <aside className="painel painel--notas">
      <section className="painel__secao">
        <h2 className="painel__titulo">
          Notas
          {notas !== null && <span className="painel__contagem">{notas.length}</span>}
        </h2>

        {notas === null ? (
          <p className="painel__vazio">Carregando…</p>
        ) : notas.length === 0 ? (
          <p className="painel__vazio">Este capítulo não tem notas.</p>
        ) : (
          <ol className="notas">
            {notas.map((nota, posicao) => {
              const numero = inicioDoRef(nota.ref);
              const destino = numero !== null && numeros.includes(numero) ? numero : null;

              return (
                // duas notas podem ter a mesma referência (ex.: Salmos 23:6)
                <li className="nota" key={`${nota.ref}-${posicao}`}>
                  {destino !== null ? (
                    <button
                      type="button"
                      className="nota__ref nota__ref--link"
                      onClick={() => irParaVersiculo(destino)}
                    >
                      {nota.ref}
                    </button>
                  ) : (
                    <span className="nota__ref">{nota.ref}</span>
                  )}
                  {nota.texto}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </aside>
  );
}

// "6:31-32" -> 31   |   "147:1" -> 1   |   "1:1-17" -> 1
function inicioDoRef(ref: string): number | null {
  const achado = /^\d+:(\d+)/.exec(ref);
  return achado ? Number(achado[1]) : null;
}

function irParaVersiculo(numero: number) {
  document
    .getElementById(`v${numero}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}
