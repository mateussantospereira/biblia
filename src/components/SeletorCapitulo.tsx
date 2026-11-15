import type { Estado } from "@/lib/biblia";

interface Props {
  total: number;
  valor: number;
  ir: (mudanca: Partial<Estado>) => void;
}

export function SeletorCapitulo({ total, valor, ir }: Props) {
  const opcoes = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <select
      className="topo__campo topo__campo--capitulo"
      aria-label="Capítulo"
      value={valor}
      disabled={total === 0}
      onChange={(e) => ir({ capitulo: Number(e.target.value) })}
    >
      {opcoes.map((numero) => (
        <option key={numero} value={numero}>
          {numero}
        </option>
      ))}
    </select>
  );
}
