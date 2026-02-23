#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
APP_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
OUT_DIR="$APP_DIR/out"

mkdir -p "$OUT_DIR"

platform=$(node -p "process.platform")
arch=$(node -p "process.arch")

npx --yes @electron/packager@18 \
  "$APP_DIR" \
  "application-storage" \
  --out "$OUT_DIR" \
  --overwrite \
  --prune=true \
  --platform "$platform" \
  --arch "$arch"

echo "Release package generated under: $OUT_DIR"
