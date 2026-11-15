import { TESTAMENTOS, type Estado, type Livro, type Testamento } from "@/lib/biblia";

type Props = {
  livros: Livro[];
  livro: Livro;
  capitulo: number;
  ir: (mudanca: Partial<Estado>) => void;
};

export function PainelNavegacao({ livros, livro, capitulo, ir }: Props) {
  const livrosDoTestamento = livros.filter((l) => l.testamento === livro.testamento);

  function trocarTestamento(novo: Testamento) {
    const primeiro = livros.find((l) => l.testamento === novo);
    if (primeiro) ir({ livro: primeiro.slug, capitulo: 1 });
  }

  return (
    <aside className="painel painel--navegacao">
      <section className="painel__secao">
        <h2 className="painel__titulo">Testamento</h2>
        <select
          className="painel__campo"
          aria-label="Testamento"
          value={livro.testamento}
          onChange={(e) => trocarTestamento(e.target.value as Testamento)}
        >
          {TESTAMENTOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </section>

      <section className="painel__secao">
        <h2 className="painel__titulo">Livro</h2>
        <select
          className="painel__campo"
          aria-label="Livro"
          value={livro.slug}
          onChange={(e) => ir({ livro: e.target.value, capitulo: 1 })}
        >
          {livrosDoTestamento.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.nome}
            </option>
          ))}
        </select>
      </section>

      <section className="painel__secao">
        <h2 className="painel__titulo">
          Capítulos <span className="painel__contagem">{livro.capitulos}</span>
        </h2>

        <div className="capitulos">
          {Array.from({ length: livro.capitulos }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === capitulo ? "capitulo capitulo--atual" : "capitulo"}
              aria-current={n === capitulo ? "page" : undefined}
              onClick={() => ir({ capitulo: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
