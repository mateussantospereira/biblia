import { useEffect, useState } from "react";
import { PainelNavegacao } from "@/components/PainelNavegacao";
import { PainelNotas } from "@/components/PainelNotas";
import { carregarCapitulo, type Capitulo, type Estado, type Indice } from "@/lib/biblia";

type Props = {
  estado: Estado;
  indice: Indice | null;
  ir: (mudanca: Partial<Estado>) => void;
};

// Guardamos junto com o resultado a chave que o pediu. Assim, ao trocar de
// capítulo, o conteúdo antigo não aparece por um instante no lugar do novo:
// ele simplesmente não combina com a chave atual e mostramos "Carregando…".
type Carregado = { chave: string; capitulo: Capitulo };
type Falha = { chave: string; texto: string };

export function PaginaLeitura({ estado, indice, ir }: Props) {
  const { versao, livro, capitulo } = estado;
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
        window.scrollTo({ top: 0 });
      })
      .catch((erro: unknown) => {
        if (vivo) setFalha({ chave, texto: String(erro) });
      });

    return () => {
      vivo = false;
    };
  }, [versao, livro, capitulo, chave]);

  const dados = carregado?.chave === chave ? carregado.capitulo : null;
  const livroAtual = indice?.livros.find((l) => l.slug === livro);

  return (
    <div className="layout">
      <article className="leitor">
        {falha?.chave === chave ? (
          <p className="leitor__aviso">Não consegui carregar: {falha.texto}</p>
        ) : !dados ? (
          <p className="leitor__aviso">Carregando…</p>
        ) : (
          <>
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
          </>
        )}
      </article>

      {livroAtual && indice && (
        <PainelNavegacao
          livros={indice.livros}
          livro={livroAtual}
          capitulo={capitulo}
          ir={ir}
        />
      )}

      <PainelNotas
        notas={dados ? dados.notas : null}
        numeros={dados ? dados.versiculos.map((v) => v.numero) : []}
      />
    </div>
  );
}
