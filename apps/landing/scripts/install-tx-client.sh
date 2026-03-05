#!/usr/bin/env bash

set -e

echoerr() { echo "$@" 1>&2; }

# Check if tx is already installed
if command -v tx >/dev/null 2>&1; then
  echo "Transifex CLI is already installed:"
  tx -v
  echo ""
  if [[ "$*" == *"--force"* ]]; then
    echo "Force flag detected, proceeding with reinstallation..."
  else
    echo "To reinstall, run this script with --force flag:"
    echo "$0 --force"
    exit 0
  fi
fi

if [ "$EUID" -eq 0 ]; then
  INSTALL_DIR="/usr/local/bin"
  echo "Installing Transifex CLI system-wide to $INSTALL_DIR"
else
  INSTALL_DIR="$HOME/.local/bin"
  echo "Installing Transifex CLI to user directory $INSTALL_DIR"
  mkdir -p "$INSTALL_DIR"
fi

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH="$(uname -m)"
case $ARCH in
x86_64) ARCH="amd64" ;;
x86) ARCH="386" ;;
i686) ARCH="386" ;;
i386) ARCH="386" ;;
aarch64) ARCH="arm64" ;;
armv5*) ARCH="arm" ;;
armv6*) ARCH="arm" ;;
armv7*) ARCH="arm" ;;
esac

URL="https://github.com/transifex/cli/releases/latest/download/tx-$OS-$ARCH.tar.gz"

echo "Downloading Transifex CLI from $URL"

TEMP_DIR=$(mktemp -d)
# shellcheck disable=SC2064
trap "rm -rf $TEMP_DIR" EXIT

cd "$TEMP_DIR"
if tar --version | grep -q 'gnu'; then
  curl -L "$URL" | tar xz --skip-old-files
else
  curl -L "$URL" | tar kxz
fi

if [ ! -f "tx" ]; then
  echoerr "Error: tx binary not found after extraction"
  exit 1
fi

chmod +x tx
cp tx "$INSTALL_DIR/tx"
echo "Transifex CLI installed to $INSTALL_DIR/tx"

echo "Verifying installation..."
if command -v tx >/dev/null 2>&1; then
  echo "✓ Transifex CLI installed successfully!"
  tx -v
elif [ -f "$INSTALL_DIR/tx" ]; then
  echo "✓ Transifex CLI binary installed to $INSTALL_DIR/tx"
  echo "You may need to restart your terminal or update your PATH to use 'tx' command"
  "$INSTALL_DIR/tx" -v
else
  echoerr "✗ Installation failed"
  exit 1
fi

set +e
