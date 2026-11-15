import type { Capitulo } from "@/lib/biblia";

interface Props {
  capitulo: Capitulo | null;
  trocando: boolean;
  erro: string | null;
}

export function ConteudoDoCapitulo({ capitulo, trocando, erro }: Props) {
  const classe = trocando ? "leitor leitor--trocando" : "leitor";

  if (erro) {
    return (
      <article className={classe}>
        <p className="leitor__aviso">Não consegui carregar: {erro}</p>
      </article>
    );
  }

  if (!capitulo) {
    return (
      <article className={classe}>
        <p className="leitor__aviso">Carregando…</p>
      </article>
    );
  }

  return (
    <article className={classe}>
      <header>
        <h1 className="leitor__titulo">{capitulo.nome} {capitulo.capitulo}</h1>
        <p className="leitor__fonte">{capitulo.versaoNome}</p>
      </header>

      <div className="leitor__texto">
        {capitulo.versiculos.map((versiculo) => (
          <p className="versiculo" id={`v${versiculo.numero}`} key={versiculo.numero}>
            <sup className="versiculo__numero">{versiculo.numero}</sup>
            {versiculo.texto}
          </p>
        ))}
      </div>
    </article>
  );
}
