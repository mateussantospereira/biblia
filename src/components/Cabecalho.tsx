import { Button } from "@/components/ui/button";
import { TESTAMENTOS, VERSOES, type Estado, type Indice } from "@/lib/biblia";

type Props = {
  indice: Indice | null;
  estado: Estado;
  ir: (mudanca: Partial<Estado>) => void;
  anterior: Estado | null;
  proximo: Estado | null;
  escuro: boolean;
  alternarTema: () => void;
};

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
  const posicao = livro ? `${livro.nome} ${estado.capitulo} de ${livro.capitulos}` : "";

  return (
    <header className="topo">
      <div className="topo__linha">
        <span className="topo__marca">Bíblia</span>

        <select
          className="topo__campo topo__campo--versao"
          aria-label="Versão"
          value={estado.versao}
          onChange={(e) => ir({ versao: e.target.value, capitulo: 1 })}
        >
          {VERSOES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.curto}
            </option>
          ))}
        </select>

        {/* No desktop o painel lateral já navega por livro e capítulo.
            Estes dois campos existem só no celular, onde o painel fica embaixo. */}
        <div className="topo__campos">
          <select
            className="topo__campo topo__campo--livro"
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
            className="topo__campo topo__campo--capitulo"
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
        </div>

        <span className="topo__espaco" />

        <div className="topo__navegacao">
          <Button
            variant="ghost"
            size="sm"
            disabled={!anterior}
            onClick={() => {
              if (anterior) ir(anterior);
            }}
          >
            ← Anterior
          </Button>

          <span className="topo__posicao">{posicao}</span>

          <Button
            variant="ghost"
            size="sm"
            disabled={!proximo}
            onClick={() => {
              if (proximo) ir(proximo);
            }}
          >
            Próximo →
          </Button>
        </div>

        <Button variant="ghost" size="sm" aria-label="Alternar tema" onClick={alternarTema}>
          {escuro ? "☀" : "☾"}
        </Button>
      </div>
    </header>
  );
}
