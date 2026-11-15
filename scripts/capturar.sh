#!/usr/bin/env bash
#
# capturar.sh - baixa a Biblia Catolica Online e gera JSON por capitulo.
#
# O site fica atras de um desafio do Cloudflare que recusa curl/wget.
# Por isso o download e feito pelo Chrome em modo headless, que executa
# o JavaScript do desafio. O resto (parse e JSON) e bash + perl + jq.

set -euo pipefail

RAIZ="${RAIZ:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
EXTRAIR="$RAIZ/scripts/extrair.pl"
BASE="https://www.bibliacatolica.com.br"

VERSAO_URL="${VERSAO_URL:-biblia-matos-soares-1956}"
FORCAR=0
PAUSA="${PAUSA:-0.5}"
TENTATIVAS="${TENTATIVAS:-3}"
UA="${UA:-Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36}"

CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)}"

morrer() {
  echo "erro: $*" >&2
  exit 1
}

uso() {
  cat <<'TXT'
uso: scripts/capturar.sh <comando> [opcoes]

comandos:
  livros                     baixa o sumario e gera livros.json (73 livros)
  capitulos <livro>          lista os capitulos de um livro
  capitulo  <livro> <n>      gera o JSON de um capitulo
  livro     <livro>          gera o JSON de todos os capitulos de um livro
  tudo                       gera tudo (retoma de onde parou)

opcoes:
  --versao <slug>            versao do site (padrao: biblia-ave-maria)
  --forcar                   ignora o cache e baixa de novo

exemplos:
  scripts/capturar.sh livros
  scripts/capturar.sh capitulos sao-joao
  scripts/capturar.sh capitulo sao-joao 1
  scripts/capturar.sh tudo
  scripts/capturar.sh tudo --versao biblia-matos-soares-1956
TXT
}

data_iso() { date -Iseconds; }

nome_versao() {
  case "$1" in
  ave-maria) echo "Bíblia Ave Maria" ;;
  matos-soares-1956) echo "Bíblia Matos Soares (1956)" ;;
  jerusalem) echo "Bíblia de Jerusalém" ;;
  *) echo "$1" ;;
  esac
}

# ---------------------------------------------------------------- download

# Uma pagina valida nunca contem as marcas do desafio do Cloudflare.
pagina_ok() {
  local f="$1"
  [ -s "$f" ] || return 1
  if grep -qE 'Verifying you are human|Security Check|_cf_chl_opt|<title>Um momento' "$f"; then
    return 1
  fi
  return 0
}

baixar() {
  local url="$1" destino="$2"

  if [ "$FORCAR" -eq 0 ] && pagina_ok "$destino"; then
    return 0
  fi

  mkdir -p "$(dirname "$destino")"
  local tmp="$destino.tmp" i
  for i in $(seq 1 "$TENTATIVAS"); do
    if timeout 120 "$CHROME" --headless=new --disable-gpu --no-first-run \
      --no-default-browser-check --user-data-dir="$PERFIL" \
      --user-agent="$UA" --dump-dom "$url" >"$tmp" 2>/dev/null &&
      pagina_ok "$tmp"; then
      mv "$tmp" "$destino"
      sleep "$PAUSA"
      return 0
    fi
    rm -f "$tmp"
    echo "   ... falhou ($i/$TENTATIVAS): $url" >&2
    sleep $((i * 2))
  done
  return 1
}

# ---------------------------------------------------------------- comandos

cmd_livros() {
  local html="$CACHE/_indice.html"
  baixar "$BASE/$VERSAO_URL/" "$html" || morrer "nao consegui baixar o sumario"

  local tmp total
  tmp="$(mktemp)"
  perl "$EXTRAIR" livros <"$html" >"$tmp"
  total="$(grep -c . "$tmp" || true)"

  mkdir -p "$SAIDA"
  jq -R -n \
    --arg versao "$VERSAO" \
    --arg nomeVersao "$(nome_versao "$VERSAO")" \
    --arg fonte "$BASE/$VERSAO_URL/" \
    --arg quando "$(data_iso)" '
      [ inputs | select(length > 0) | split("\u001f")
        | { testamento: .[0], slug: .[1], nome: .[2] } ]
      | to_entries
      | map({ ordem: (.key + 1) } + .value)
      | { versao: $versao, versaoNome: $nomeVersao, fonte: $fonte,
          capturadoEm: $quando, total: length, livros: . }
    ' <"$tmp" >"$SAIDA/livros.json"
  rm -f "$tmp"

  echo "$total livros -> $SAIDA/livros.json"
  if [ "$total" -ne 73 ]; then
    echo "AVISO: esperava 73 livros. Confira se o sumario mudou." >&2
  fi
}

cmd_capitulos() {
  local slug="$1"
  local html="$CACHE/$slug/1.html"
  baixar "$BASE/$VERSAO_URL/$slug/1/" "$html" || return 1
  perl "$EXTRAIR" capitulos <"$html"
}

cmd_capitulo() {
  local slug="$1" n="$2"
  local html="$CACHE/$slug/$n.html"
  local json="$SAIDA/$slug/$n.json"

  if [ "$FORCAR" -eq 0 ] && [ -s "$json" ] && jq -e . "$json" >/dev/null 2>&1; then
    return 0
  fi

  baixar "$BASE/$VERSAO_URL/$slug/$n/" "$html" || return 1

  if ! grep -q 'class="bibleChapter"' "$html"; then
    echo "   ... pagina sem conteudo: $slug/$n" >&2
    return 1
  fi

  local nome testamento linha
  linha="$(jq -r --arg s "$slug" \
    '.livros[] | select(.slug == $s) | [.nome, .testamento] | @tsv' \
    "$SAIDA/livros.json")"
  nome="${linha%%$'\t'*}"
  testamento="${linha##*$'\t'}"
  [ -n "$nome" ] || {
    echo "   ... livro desconhecido: $slug" >&2
    return 1
  }

  local tmpv tmpn
  tmpv="$(mktemp)"
  tmpn="$(mktemp)"
  perl "$EXTRAIR" versiculos <"$html" >"$tmpv"
  perl "$EXTRAIR" notas <"$html" >"$tmpn"

  mkdir -p "$SAIDA/$slug"
  if jq -R -n \
    --arg versao "$VERSAO" \
    --arg nomeVersao "$(nome_versao "$VERSAO")" \
    --arg livro "$slug" --arg nome "$nome" --arg testamento "$testamento" \
    --argjson capitulo "$n" \
    --arg fonte "$BASE/$VERSAO_URL/$slug/$n/" \
    --arg quando "$(data_iso)" \
    --rawfile notas "$tmpn" '
        def registros: split("\n") | map(select(length > 0) | split("\u001f"));

        ($notas | registros | map({ ref: .[0], texto: .[1] })) as $N
        | [ inputs | select(length > 0) | split("\u001f")
            | { numero: (.[0] | tonumber), texto: .[1] }
              + (if .[2] == "1" then { nota: true } else {} end) ] as $V
        | ($V | length) as $total
        | { versao: $versao, versaoNome: $nomeVersao, livro: $livro,
            nome: $nome, testamento: $testamento, capitulo: $capitulo,
            totalVersiculos: $total, fonte: $fonte, capturadoEm: $quando,
            versiculos: $V, notas: $N }
        | if $total == 0 then error("capitulo sem versiculos") else . end
      ' <"$tmpv" >"$json.tmp"; then
    mv "$json.tmp" "$json"
    rm -f "$tmpv" "$tmpn"

    if ! jq -e '([.versiculos[].numero] == [range(1; (.versiculos | length) + 1)])' \
      "$json" >/dev/null 2>&1; then
      echo "$slug/$n numeracao incompleta" >>"$AVISOS"
    fi
    return 0
  fi

  rm -f "$json.tmp" "$tmpv" "$tmpn"
  echo "   ... JSON invalido: $slug/$n" >&2
  return 1
}

cmd_livro() {
  local slug="$1"
  local caps total ok=0 falhas=0 n

  caps="$(cmd_capitulos "$slug")" || {
    echo "   ... falhou ao listar capitulos" >&2
    return 1
  }
  if [ -z "$caps" ]; then
    echo "   ... livro sem capitulos: $slug" >&2
    return 1
  fi

  total="$(printf '%s\n' "$caps" | grep -c .)"
  while IFS= read -r n; do
    if cmd_capitulo "$slug" "$n"; then
      ok=$((ok + 1))
    else
      falhas=$((falhas + 1))
      echo "$slug/$n" >>"$RELATORIO"
    fi
  done <<<"$caps"

  printf '%-22s %3d capitulos | %d ok | %d falhas\n' "$slug" "$total" "$ok" "$falhas"
  [ "$falhas" -eq 0 ]
}

cmd_tudo() {
  cmd_livros

  : >"$RELATORIO"
  : >"$AVISOS"
  local slugs=() s i=0
  mapfile -t slugs < <(jq -r '.livros[].slug' "$SAIDA/livros.json")

  for s in "${slugs[@]}"; do
    i=$((i + 1))
    printf '[%2d/%d] ' "$i" "${#slugs[@]}"
    cmd_livro "$s" || true
  done

  echo
  local json_total
  json_total="$(find "$SAIDA" -name '*.json' | wc -l)"
  echo "arquivos JSON gerados: $json_total"

  if [ -s "$AVISOS" ]; then
    echo
    echo "AVISOS ($(grep -c . "$AVISOS")): gravados, mas com numeracao irregular na fonte"
    head -40 "$AVISOS" | sed "s/^/  /"
  fi

  if [ -s "$RELATORIO" ]; then
    echo
    echo "FALHAS ($(grep -c . "$RELATORIO")):"
    cat "$RELATORIO"
    echo
    echo "Rode de novo o mesmo comando: ele retoma do cache e tenta so o que faltou."
    return 1
  fi
  echo "captura concluida sem falhas."
}

# ---------------------------------------------------------------- principal

COMANDO="${1:-}"
[ $# -gt 0 ] && shift

ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
  --versao)
    VERSAO_URL="$2"
    shift 2
    ;;
  --forcar)
    FORCAR=1
    shift
    ;;
  -h | --help)
    uso
    exit 0
    ;;
  *)
    ARGS+=("$1")
    shift
    ;;
  esac
done

VERSAO="${VERSAO_URL#biblia-}"
CACHE="$RAIZ/dados/cache/$VERSAO"
SAIDA="$RAIZ/public/biblias/$VERSAO"
PERFIL="${PERFIL_CHROME:-$RAIZ/dados/perfil-chrome}"
RELATORIO="$RAIZ/dados/relatorio-falhas-$VERSAO.txt"
AVISOS="$RAIZ/dados/avisos-$VERSAO.txt"

case "$COMANDO" in
livros | capitulos | capitulo | livro | tudo) ;;
"" | -h | --help)
  uso
  exit 0
  ;;
*) morrer "comando desconhecido: $COMANDO (use -h)" ;;
esac

[ -n "$CHROME" ] || morrer "nao encontrei google-chrome/chromium. Defina CHROME=/caminho"
command -v jq >/dev/null || morrer "jq nao instalado"
command -v perl >/dev/null || morrer "perl nao instalado"
[ -f "$EXTRAIR" ] || morrer "nao encontrei $EXTRAIR"

mkdir -p "$CACHE" "$SAIDA" "$PERFIL" "$(dirname "$RELATORIO")"

case "$COMANDO" in
livros) cmd_livros ;;
capitulos) cmd_capitulos "${ARGS[0]:?informe o livro}" ;;
capitulo) cmd_capitulo "${ARGS[0]:?informe o livro}" "${ARGS[1]:?informe o capitulo}" ;;
livro) cmd_livro "${ARGS[0]:?informe o livro}" ;;
tudo) cmd_tudo ;;
esac
