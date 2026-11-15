import type { Estado } from "@/lib/biblia";
import { VERSOES } from "@/lib/biblia";

interface Props {
  valor: string;
  ir: (mudanca: Partial<Estado>) => void;
}

export function SeletorVersao({ valor, ir }: Props) {
  return (
    <select
      className="topo__campo topo__campo--versao"
      aria-label="Versão"
      value={valor}
      onChange={(e) => ir({ versao: e.target.value, capitulo: 1 })}
    >
      {VERSOES.map((versao) => (
        <option key={versao.id} value={versao.id}>
          {versao.curto}
        </option>
      ))}
    </select>
  );
}
