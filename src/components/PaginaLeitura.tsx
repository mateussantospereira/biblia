import { useEffect, useState } from "react";
import { carregarCapitulo, type Capitulo, type Nota } from "@/lib/biblia";

type Props = { versao: string; livro: string; capitulo: number };

// Guardamos junto com o resultado a chave que o pediu. Assim, ao trocar de
// capítulo, o conteúdo antigo não aparece por um instante no lugar do novo:
// ele simplesmente não combina com a chave atual e mostramos "Carregando…".
type Carregado = { chave: string; capitulo: Capitulo };
type Falha = { chave: string; texto: string };

export function PaginaLeitura({ versao, livro, capitulo }: Props) {
  const chave = `${versao}/${livro}/${capitulo}`;
  const [carregado, setCarregado] = useState<Carregado | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);

  useEffect(() => {
    let vivo = true;

    carregarCapitulo(versao, livro, capitulo)
      .then((capituloCarregado) => {
        if (!vivo) return;
        setCarregado({ chave, capitulo: capituloCarregado });
        document.title = `${capituloCarregado.nome} ${capituloCarregado.capitulo} — ${capituloCarregado.versaoNome}`;
      })
      .catch((erro: unknown) => {
        if (vivo) setFalha({ chave, texto: String(erro) });
      });

    return () => {
      vivo = false;
    };
  }, [versao, livro, capitulo, chave]);

  const dados = carregado?.chave === chave ? carregado.capitulo : null;

  if (falha?.chave === chave) return <p className="leitor__aviso">Não consegui carregar: {falha.texto}</p>;
  if (!dados) return <p className="leitor__aviso">Carregando…</p>;

  return (
    <article className="leitor">
      <header>
        <h1 className="leitor__titulo">
          {dados.nome} {dados.capitulo}
        </h1>
        <p className="leitor__fonte">{dados.versaoNome}</p>
      </header>

      <div className="leitor__texto">
        {dados.versiculos.map((versiculo) => (
          <p className="versiculo" id={`v${versiculo.numero}`} key={versiculo.numero}>
            <sup className="versiculo__numero">{versiculo.numero}</sup>
            {versiculo.texto}
          </p>
        ))}
      </div>

      {dados.notas.length > 0 && <Notas notas={dados.notas} />}
    </article>
  );
}

function Notas({ notas }: { notas: Nota[] }) {
  return (
    <section className="notas">
      <h2 className="notas__titulo">Notas</h2>
      <ol className="notas__lista">
        {notas.map((nota) => (
          <li className="notas__item" key={nota.ref}>
            <span className="notas__ref">{nota.ref}</span>
            {nota.texto}
          </li>
        ))}
      </ol>
    </section>
  );
}
