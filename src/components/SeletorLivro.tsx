import { TESTAMENTOS, type Estado, type Indice } from "@/lib/biblia";

interface Props {
  indice: Indice | null;
  valor: string;
  ir: (mudanca: Partial<Estado>) => void;
}

export function SeletorLivro({ indice, valor, ir }: Props) {
  return (
    <select
      className="topo__campo topo__campo--livro"
      aria-label="Livro"
      value={valor}
      disabled={!indice}
      onChange={(e) => ir({ livro: e.target.value, capitulo: 1 })}
    >
      {TESTAMENTOS.map((testamento) => (
        <optgroup key={testamento.id} label={testamento.nome}>
          {(indice?.livros ?? [])
            .filter((livro) => livro.testamento === testamento.id)
            .map((livro) => (
              <option key={livro.slug} value={livro.slug}>
                {livro.nome}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
