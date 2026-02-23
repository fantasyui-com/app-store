#!/usr/bin/env bash
set -euo pipefail

echo "[build] Installing dependencies..."
npm ci

echo "[build] Building release artifacts with Electron Forge..."
npm run make

echo "[build] Build complete. Upload artifacts from out/make/ to GitHub Releases."
