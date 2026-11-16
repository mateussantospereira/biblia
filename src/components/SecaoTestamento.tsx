import { CartaoLivro } from "@/components/CartaoLivro";
import type { Estado, Livro } from "@/lib/biblia";

interface Props {
  titulo: string;
  livros: Livro[];
  irParaLeitura: (mudanca: Partial<Estado>) => void;
}

export function SecaoTestamento({ titulo, livros, irParaLeitura }: Props) {
  if (livros.length === 0) return null;

  return (
    <section className="sumario__secao">
      <h2 className="sumario__testamento">{titulo}</h2>
      <ul className="sumario__lista">
        {livros.map((livro) => (
          <CartaoLivro key={livro.slug} livro={livro} irParaLeitura={irParaLeitura} />
        ))}
      </ul>
    </section>
  );
}
