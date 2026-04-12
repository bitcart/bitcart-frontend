#!/usr/bin/env bash
set -euo pipefail

: "${TOKEN:?TOKEN is required}"
: "${API_URL:?API_URL is required}"

curl -sfL "https://raw.githubusercontent.com/bitcart/.github/master/labels.yml" |
  uv run --with pyyaml python3 -c "import sys,json,yaml; json.dump(yaml.safe_load(sys.stdin),sys.stdout)" \
    >labels.json

page=1
existing="[]"
while true; do
  batch=$(curl -sf -H "Authorization: token $TOKEN" "$API_URL?limit=50&page=$page")
  count=$(echo "$batch" | jq length)
  existing=$(echo "$existing $batch" | jq -s 'add')
  [ "$count" -lt 50 ] && break
  page=$((page + 1))
done

total=$(jq length labels.json)
for i in $(seq 0 $((total - 1))); do
  name=$(jq -r ".[$i].name" labels.json)
  color=$(jq -r ".[$i].color" labels.json)
  desc=$(jq -r ".[$i].description" labels.json)

  payload=$(jq -n --arg n "$name" --arg c "#$color" --arg d "$desc" \
    '{name: $n, color: $c, description: $d}')

  label_id=$(echo "$existing" | jq -r --arg n "$name" '.[] | select(.name == $n) | .id')

  if [ -n "$label_id" ]; then
    echo "Updating: $name"
    curl -sf -X PATCH -H "Authorization: token $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$payload" "$API_URL/$label_id" >/dev/null
  else
    echo "Creating: $name"
    curl -sf -X POST -H "Authorization: token $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$payload" "$API_URL" >/dev/null
  fi
done

source_names=$(jq -r '.[].name' labels.json)
echo "$existing" | jq -c '.[]' | while read -r label; do
  name=$(echo "$label" | jq -r '.name')
  id=$(echo "$label" | jq -r '.id')
  if ! echo "$source_names" | grep -qxF "$name"; then
    echo "Deleting: $name"
    curl -sf -X DELETE -H "Authorization: token $TOKEN" "$API_URL/$id" >/dev/null
  fi
done

echo "✓ Synced $total labels"
