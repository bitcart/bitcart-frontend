#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
"$SCRIPT_DIR"/install-tx-client.sh
tx pull -af
just build --outputStyle=stream -p @bitcart/landing
set +e
