#!/usr/bin/env bash
set -euo pipefail

echo "[build] Installing workspace dependencies..."
npm ci

echo "[build] Building application-storage release package..."
npm run make

echo "[build] Done. Upload artifacts from apps/application-storage/out/ to GitHub Releases."
