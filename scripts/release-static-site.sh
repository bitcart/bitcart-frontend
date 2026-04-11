#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <app-name>" >&2
  echo "Example: $0 landing" >&2
  exit 1
fi

APP_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

"$SCRIPT_DIR"/install-tx-client.sh

cd "$SCRIPT_DIR/../apps/$APP_NAME"
tx pull -af

BITCART_ENV="production" just build --outputStyle=stream -p "@bitcart/$APP_NAME"

set +e
