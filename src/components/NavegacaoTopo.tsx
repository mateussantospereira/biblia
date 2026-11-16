interface Props {
  escuro: boolean;
  alternarTema: () => void;
}

export function NavegacaoTopo({ escuro, alternarTema }: Props) {
  return (
    <div className="topo__acoes">
      <button type="button" className="topo__botao" aria-label="Alternar tema" onClick={alternarTema}>
        {escuro ? "☀" : "☾"}
      </button>
    </div>
  );
}
