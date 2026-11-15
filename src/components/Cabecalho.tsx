import { Button } from "@/components/ui/button";
import { VERSOES, type Estado, type Indice } from "@/lib/biblia";

type Props = {
  indice: Indice | null;
  estado: Estado;
  ir: (mudanca: Partial<Estado>) => void;
  anterior: Estado | null;
  proximo: Estado | null;
  escuro: boolean;
  alternarTema: () => void;
};

const TESTAMENTOS = [
  { id: "AT", nome: "Antigo Testamento" },
  { id: "NT", nome: "Novo Testamento" },
] as const;

export function Cabecalho({
  indice,
  estado,
  ir,
  anterior,
  proximo,
  escuro,
  alternarTema,
}: Props) {
  const livro = indice?.livros.find((l) => l.slug === estado.livro);
  const totalCapitulos = livro?.capitulos ?? 0;

  return (
    <header className="topo">
      <div className="topo__linha">
        <span className="topo__marca">Bíblia</span>

        <select
          className="topo__campo"
          aria-label="Versão"
          value={estado.versao}
          onChange={(e) => ir({ versao: e.target.value, capitulo: 1 })}
        >
          {VERSOES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>

        <select
          className="topo__campo"
          aria-label="Livro"
          value={estado.livro}
          disabled={!indice}
          onChange={(e) => ir({ livro: e.target.value, capitulo: 1 })}
        >
          {TESTAMENTOS.map((testamento) => (
            <optgroup key={testamento.id} label={testamento.nome}>
              {(indice?.livros ?? [])
                .filter((l) => l.testamento === testamento.id)
                .map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.nome}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>

        <select
          className="topo__campo topo__campo--curto"
          aria-label="Capítulo"
          value={estado.capitulo}
          disabled={totalCapitulos === 0}
          onChange={(e) => ir({ capitulo: Number(e.target.value) })}
        >
          {Array.from({ length: totalCapitulos }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <span className="topo__espaco" />

        <Button variant="ghost" size="sm" aria-label="Alternar tema" onClick={alternarTema}>
          {escuro ? "☀" : "☾"}
        </Button>
      </div>

      <div className="topo__linha topo__linha--nav">
        <Button
          variant="outline"
          size="sm"
          disabled={!anterior}
          onClick={() => {
            if (anterior) ir(anterior);
          }}
        >
          ← Anterior
        </Button>

        <span className="topo__posicao">
          {livro ? `${livro.nome} ${estado.capitulo} de ${livro.capitulos}` : ""}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!proximo}
          onClick={() => {
            if (proximo) ir(proximo);
          }}
        >
          Próximo →
        </Button>
      </div>
    </header>
  );
}
