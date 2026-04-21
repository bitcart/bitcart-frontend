#!/usr/bin/env sh
set -eu

if command -v fnm >/dev/null 2>&1; then
  exec fnm exec -- "$@"
else
  exec "$@"
fi
