#!/usr/bin/env bash
# Gera public/biblias/<versao>/indice.json
#
# Por que existe: o livros.json diz o nome e a ordem dos livros, mas não diz
# quantos capítulos cada um tem. Para escolher capítulo e para achar o próximo
# capítulo, o app precisa desse número. E ele MUDA entre versões:
#   Joel        -> 4 na Ave Maria, 3 na Matos
#   Malaquias   -> 3 na Ave Maria, 4 na Matos
# Então contamos os arquivos de cada livro, em vez de fixar uma tabela.

set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ/public/biblias"

for pasta in */; do
  versao="${pasta%/}"
  [ -s "$versao/livros.json" ] || continue

  contagem="$(mktemp)"
  for livro in "$versao"/*/; do
    slug="$(basename "$livro")"
    total="$(find "$livro" -maxdepth 1 -name '*.json' | wc -l | tr -d ' ')"
    printf '%s\t%s\n' "$slug" "$total" >>"$contagem"
  done

  jq --rawfile caps "$contagem" '
    ($caps | split("\n") | map(select(length > 0) | split("\t")
      | {(.[0]): (.[1] | tonumber)}) | add // {}) as $quantos
    | . as $meta
    | {
        versao: $meta.versao,
        versaoNome: $meta.versaoNome,
        total: $meta.total,
        livros: [$meta.livros[] | . + { capitulos: ($quantos[.slug] // 0) }]
      }
  ' "$versao/livros.json" >"$versao/indice.json"

  rm -f "$contagem"
  echo "$versao: $(jq '.livros | length' "$versao/indice.json") livros, $(jq '[.livros[].capitulos] | add' "$versao/indice.json") capítulos"
done
