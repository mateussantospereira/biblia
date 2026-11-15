import type { Estado } from "@/lib/biblia";

interface Props {
  total: number;
  atual: number;
  ir: (mudanca: Partial<Estado>) => void;
}

export function GradeDeCapitulos({ total, atual, ir }: Props) {
  const numeros = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="capitulos">
      {numeros.map((numero) => {
        const selecionado = numero === atual;
        return (
          <button
            key={numero}
            type="button"
            className={selecionado ? "capitulo capitulo--atual" : "capitulo"}
            aria-current={selecionado ? "page" : undefined}
            onClick={() => ir({ capitulo: numero })}
          >
            {numero}
          </button>
        );
      })}
    </div>
  );
}
