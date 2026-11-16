import type { Estado, Livro } from "@/lib/biblia";

interface Props {
  livro: Livro;
  irParaLeitura: (mudanca: Partial<Estado>) => void;
}

export function CartaoLivro({ livro, irParaLeitura }: Props) {
  return (
    <li className="sumario__item">
      <button
        type="button"
        className="sumario__livro"
        onClick={() => irParaLeitura({ livro: livro.slug, capitulo: 1 })}
      >
        {livro.nome}
      </button>
    </li>
  );
}
