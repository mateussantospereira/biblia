import { SecaoTestamento } from "@/components/SecaoTestamento";
import { TESTAMENTOS, VERSOES, type Estado, type Indice } from "@/lib/biblia";

interface Props {
  versao: string;
  indice: Indice | null;
  irParaLeitura: (mudanca: Partial<Estado>) => void;
}

export function Sumario({ versao, indice, irParaLeitura }: Props) {
  const nomeVersao = VERSOES.find((v) => v.id === versao)?.nome ?? versao;

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
        <h1 className="sumario__titulo">Sumário</h1>
        <p className="sumario__versao">{nomeVersao}</p>
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
