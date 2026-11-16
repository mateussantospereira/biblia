import { VERSOES } from "@/lib/biblia";

interface Props {
  valor: string;
  aoMudar: (versao: string) => void;
}

export function SeletorVersao({ valor, aoMudar }: Props) {
  return (
    <select
      className="topo__campo topo__campo--versao"
      aria-label="Versão"
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
    >
      {VERSOES.map((versao) => (
        <option key={versao.id} value={versao.id}>
          {versao.curto}
        </option>
      ))}
    </select>
  );
}
