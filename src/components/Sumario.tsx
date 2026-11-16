import { SecaoTestamento } from "@/components/SecaoTestamento";
import { SeletorVersao } from "@/components/SeletorVersao";
import { TESTAMENTOS, type Estado, type Indice } from "@/lib/biblia";

interface Props {
  versao: string;
  indice: Indice | null;
  irParaLeitura: (mudanca: Partial<Estado>) => void;
  irParaSumario: (versao?: string) => void;
}

export function Sumario({ versao, indice, irParaLeitura, irParaSumario }: Props) {
  if (!indice) {
    return (
      <div className="sumario">
        <p className="leitor__aviso">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="sumario">
      <header className="sumario__cabecalho">
        <div className="sumario__titulo-linha">
          <h1 className="sumario__titulo">Sumário</h1>
          <SeletorVersao valor={versao} aoMudar={(v) => irParaSumario(v)} />
        </div>
      </header>

      {TESTAMENTOS.map((testamento) => (
        <SecaoTestamento
          key={testamento.id}
          titulo={testamento.nome}
          livros={indice.livros.filter((l) => l.testamento === testamento.id)}
          irParaLeitura={irParaLeitura}
        />
      ))}
    </div>
  );
}
