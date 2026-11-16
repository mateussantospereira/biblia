import { GradeDeCapitulos } from "@/components/GradeDeCapitulos";
import { TESTAMENTOS, VERSOES, type Estado, type Livro, type Testamento } from "@/lib/biblia";

interface Props {
  livros: Livro[];
  livro: Livro;
  capitulo: number;
  versao: string;
  ir: (mudanca: Partial<Estado>) => void;
  anterior: Estado | null;
  proximo: Estado | null;
}

export function PainelNavegacao({ livros, livro, capitulo, versao, ir, anterior, proximo }: Props) {
  const livrosDoTestamento = livros.filter((item) => item.testamento === livro.testamento);

  function trocarTestamento(novo: Testamento) {
    const primeiro = livros.find((item) => item.testamento === novo);
    if (primeiro) ir({ livro: primeiro.slug, capitulo: 1 });
  }

  return (
    <aside className="painel painel--navegacao">
      <nav className="painel__navegacao-capitulos" aria-label="Capítulos">
        <button type="button" className="topo__botao" disabled={!anterior} onClick={() => anterior && ir(anterior)}>
          ← Anterior
        </button>
        <button type="button" className="topo__botao" disabled={!proximo} onClick={() => proximo && ir(proximo)}>
          Próximo →
        </button>
      </nav>

      <section className="painel__secao">
        <h2 className="painel__titulo">Bíblia</h2>
        <select
          className="painel__campo"
          aria-label="Bíblia"
          value={versao}
          onChange={(e) => ir({ versao: e.target.value })}
        >
          {VERSOES.map((v) => (
            <option key={v.id} value={v.id}>{v.nome}</option>
          ))}
        </select>
      </section>

      <section className="painel__secao">
        <h2 className="painel__titulo">Testamento</h2>
        <select
          className="painel__campo"
          aria-label="Testamento"
          value={livro.testamento}
          onChange={(e) => trocarTestamento(e.target.value as Testamento)}
        >
          {TESTAMENTOS.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
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
          {livrosDoTestamento.map((item) => (
            <option key={item.slug} value={item.slug}>{item.nome}</option>
          ))}
        </select>
      </section>

      <section className="painel__secao">
        <h2 className="painel__titulo">
          Capítulos <span className="painel__contagem">{livro.capitulos}</span>
        </h2>
        <GradeDeCapitulos total={livro.capitulos} atual={capitulo} ir={ir} />
      </section>
    </aside>
  );
}
