#!/usr/bin/env bash
#
# conferir.sh - confere os JSONs gerados por baixar.sh.
#
#   ./scripts/conferir.sh             confere tudo
#   ./scripts/conferir.sh sao-joao    confere um livro
#
# Grava dados/conferencia-ave-maria.tsv (livro, capitulo, versiculos),
# mostra um resumo por livro, lista falhas e avisos.
#
# FALHA = problema do download/parse: arquivo faltando, JSON quebrado,
#         capitulo sem versiculos, texto vazio, numero repetido.
# AVISO = a numeracao nao vai de 1 a N. Confirmado na fonte: e o proprio
#         site que numera assim em alguns capitulos (nao perdemos texto).

set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
SAIDA="$RAIZ/public/biblias/ave-maria"
CACHE="$RAIZ/dados/cache"
EXTRAIR="$RAIZ/scripts/extrair.pl"
TSV="$RAIZ/dados/conferencia-ave-maria.tsv"

FILTRO="${1:-}"

[ -s "$SAIDA/livros.json" ] || {
  echo "erro: $SAIDA/livros.json nao existe"
  exit 1
}
[ -f "$EXTRAIR" ] || {
  echo "erro: $EXTRAIR nao existe"
  exit 1
}

mkdir -p "$RAIZ/dados"
: >"$TSV"

FALHAS=()
AVISOS=()
N_LIVROS=0
N_CAP=0
N_VERS=0

falha() { FALHAS+=("$*"); }
aviso() { AVISOS+=("$*"); }

# ---------------------------------------------------------------- utilidades

# Capitulos esperados: vem do HTML do capitulo 1 (tem o <ul class="listChapter">).
# Se o cache nao existir, cai para os JSONs que estao na pasta.
capitulos_do_livro() {
  local slug="$1" f
  if [ -s "$CACHE/$slug/1.html" ]; then
    perl "$EXTRAIR" capitulos <"$CACHE/$slug/1.html" | sort -n
  elif [ -d "$SAIDA/$slug" ]; then
    for f in "$SAIDA/$slug"/*.json; do
      [ -e "$f" ] || continue
      basename "$f" .json
    done | sort -n
  fi
}

# Uma linha por problema: "<FALHA|AVISO>\t<mensagem>". Silencio = tudo certo.
conferir_json() {
  jq -r '
    def listar: map(tostring) | if length > 12
                then (.[0:12] | join(", ")) + " ... (+\(length - 12))"
                else join(", ") end;

    def problemas:
      (.versiculos | length) as $n
      | ([.versiculos[].numero]) as $ns
      | (if $n == 0 then "FALHA\tcapitulo sem versiculos" else empty end),
        (if (.totalVersiculos // -1) != $n
         then "FALHA\ttotalVersiculos diz \(.totalVersiculos), mas ha \($n)"
         else empty end),
        (if ($ns | length) != ($ns | unique | length)
         then "FALHA\tnumero de versiculo repetido"
         else empty end),
        (if ([.versiculos[] | select((.texto // "") == "")] | length) > 0
         then "FALHA\tversiculo com texto vazio"
         else empty end),
        (if ($ns | sort) != [range(1; $n + 1)]
         then "AVISO\tnumeracao fora de 1..\($ns | max); faltam: "
              + ([range(1; ($ns | max) + 1)] - $ns | listar)
         else empty end);
    problemas
  ' "$1"
}

# ---------------------------------------------------------------- conferencia

conferir_livro() {
  local slug="$1" nome="$2"
  local caps n json vers total=0 soma=0 vmin=0 vmax=0 primeiro=1
  local f_cap=0 a_cap=0 tipo msg

  N_LIVROS=$((N_LIVROS + 1))

  caps="$(capitulos_do_livro "$slug")"
  if [ -z "$caps" ]; then
    falha "$nome ($slug): nenhum capitulo encontrado"
    printf '%-22s %4d %7s %5s %5s %5s %5s\n' "$nome" 0 "-" "-" "-" "$f_cap" "-"
    return
  fi

  for n in $caps; do
    total=$((total + 1))
    json="$SAIDA/$slug/$n.json"

    if [ ! -s "$json" ]; then
      falha "$slug/$n: arquivo nao existe"
      f_cap=$((f_cap + 1))
      continue
    fi
    if ! jq -e . "$json" >/dev/null 2>&1; then
      falha "$slug/$n: JSON invalido"
      f_cap=$((f_cap + 1))
      continue
    fi

    vers="$(jq -r '.versiculos | length' "$json")"
    printf '%s\t%s\t%s\n' "$slug" "$n" "$vers" >>"$TSV"

    N_CAP=$((N_CAP + 1))
    N_VERS=$((N_VERS + vers))
    soma=$((soma + vers))
    if [ "$primeiro" -eq 1 ]; then
      vmin=$vers
      vmax=$vers
      primeiro=0
    fi
    [ "$vers" -lt "$vmin" ] && vmin=$vers
    [ "$vers" -gt "$vmax" ] && vmax=$vers

    while IFS=$'\t' read -r tipo msg; do
      case "$tipo" in
      FALHA)
        falha "$slug/$n: $msg"
        f_cap=$((f_cap + 1))
        ;;
      AVISO)
        aviso "$slug/$n: $msg"
        a_cap=$((a_cap + 1))
        ;;
      esac
    done < <(conferir_json "$json")
  done

  # capitulos presentes que nao estao na lista do site
  if [ -s "$CACHE/$slug/1.html" ]; then
    for json in "$SAIDA/$slug"/*.json; do
      [ -e "$json" ] || continue
      n="$(basename "$json" .json)"
      if ! grep -qx "$n" <<<"$caps"; then
        falha "$slug/$n: capitulo fora da lista do site"
        f_cap=$((f_cap + 1))
      fi
    done
  fi

  printf '%-22s %4d %7d %5d %5d %5s %5s\n' \
    "$nome" "$total" "$soma" "$vmin" "$vmax" \
    "$([ "$f_cap" -eq 0 ] && echo ok || echo "$f_cap")" \
    "$([ "$a_cap" -eq 0 ] && echo "-" || echo "$a_cap")"
}

# ------------------------------------------------------------------ principal

echo "conferindo: $SAIDA"
echo
printf '%-22s %4s %7s %5s %5s %5s %5s\n' "Livro" "Cap" "Vers" "Min" "Max" "Falha" "Aviso"
printf '%-22s %4s %7s %5s %5s %5s %5s\n' "----------------------" "----" "-------" "-----" "-----" "-----" "-----"

while IFS=$'\t' read -r slug nome; do
  [ -z "$FILTRO" ] || [ "$slug" = "$FILTRO" ] || continue
  conferir_livro "$slug" "$nome"
done < <(jq -r '.livros[] | [.slug, .nome] | @tsv' "$SAIDA/livros.json")

if [ -n "$FILTRO" ] && [ "$N_LIVROS" -eq 0 ]; then
  echo "erro: livro '$FILTRO' nao existe em livros.json" >&2
  exit 2
fi

echo
pl() { [ "$1" -eq 1 ] && echo "$2" || echo "$3"; }
printf 'total: %d %s, %d %s, %d %s\n' \
  "$N_LIVROS" "$(pl "$N_LIVROS" livro livros)" \
  "$N_CAP" "$(pl "$N_CAP" capitulo capitulos)" \
  "$N_VERS" "$(pl "$N_VERS" versiculo versiculos)"
echo "detalhe por capitulo: $TSV"
echo

if [ "${#AVISOS[@]}" -gt 0 ]; then
  echo "AVISOS (${#AVISOS[@]}): numeracao irregular na propria fonte, texto preservado"
  printf '  %s\n' "${AVISOS[@]}"
  echo
fi

if [ "${#FALHAS[@]}" -eq 0 ]; then
  echo "Nenhuma falha: todos os capitulos baixados e legiveis."
  exit 0
fi

echo "FALHAS (${#FALHAS[@]}):"
printf '  %s\n' "${FALHAS[@]}"
echo
echo "Rode ./scripts/baixar.sh de novo: ele tenta so o que faltou."
