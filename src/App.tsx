import { useEffect, useState } from "react";
import bannerLeitura from "@/assets/banner-leitura.png";
import capaSumario from "@/assets/sumario-capa.png";
import { Cabecalho } from "@/components/Cabecalho";
import { PaginaLeitura } from "@/components/PaginaLeitura";
import { Sumario } from "@/components/Sumario";
import { useIndice } from "@/hooks/useIndice";
import { useTema } from "@/hooks/useTema";
import {
  ajustar,
  escreverUrl,
  escreverUrlSumario,
  lerRota,
  sincronizarUrl,
  sincronizarUrlSumario,
  vizinho,
  type Estado,
  type Rota,
} from "@/lib/biblia";

export default function App() {
  const [rota, setRota] = useState<Rota>(lerRota);
  const versao = rota.pagina === "leitura" ? rota.estado.versao : rota.versao;
  const indice = useIndice(versao);
  const { escuro, alternarTema } = useTema();

  const estadoLeitura = rota.pagina === "leitura" ? ajustar(rota.estado, indice) : null;

  function irParaSumario(novaVersao = versao) {
    escreverUrlSumario(novaVersao);
    setRota({ pagina: "sumario", versao: novaVersao });
  }

  function irParaLeitura(mudanca: Partial<Estado>) {
    const base: Estado = estadoLeitura ?? { versao, livro: "genesis", capitulo: 1 };
    const proximo = { ...base, ...mudanca };
    escreverUrl(proximo);
    setRota({ pagina: "leitura", estado: proximo });
  }

  // Mantém a barra de endereço alinhada com a rota exibida.
  useEffect(() => {
    if (rota.pagina === "leitura" && estadoLeitura) {
      sincronizarUrl(estadoLeitura);
    } else {
      sincronizarUrlSumario(versao);
    }
  }, [rota.pagina, versao, estadoLeitura]);

  // Suporta o botão voltar/avançar do navegador.
  useEffect(() => {
    function aoVoltar() {
      setRota(lerRota());
    }
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const anterior = indice && estadoLeitura ? vizinho(indice, estadoLeitura, -1) : null;
  const proximo = indice && estadoLeitura ? vizinho(indice, estadoLeitura, 1) : null;

  return (
    <>
      {rota.pagina === "sumario" && <img src={capaSumario} alt="" className="sumario__capa-topo" />}
      {rota.pagina === "leitura" && (
        <img src={bannerLeitura} alt="" className="sumario__capa-topo sumario__capa-topo--leitura" />
      )}
      <Cabecalho
        indice={indice}
        estado={estadoLeitura}
        versao={versao}
        pagina={rota.pagina}
        ir={irParaLeitura}
        irParaSumario={irParaSumario}
        anterior={anterior}
        proximo={proximo}
        escuro={escuro}
        alternarTema={alternarTema}
      />
      <main>
        {rota.pagina === "leitura" && estadoLeitura ? (
          <PaginaLeitura estado={estadoLeitura} indice={indice} ir={irParaLeitura} />
        ) : (
          <Sumario
            versao={versao}
            indice={indice}
            irParaLeitura={irParaLeitura}
            irParaSumario={irParaSumario}
          />
        )}
      </main>
    </>
  );
}
