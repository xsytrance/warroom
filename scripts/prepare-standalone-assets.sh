#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[prepare] repo root: $ROOT_DIR"

[[ -d .next/static ]] || { echo "[prepare][FAIL] Missing .next/static. Run npm run build first."; exit 1; }
[[ -d public ]] || { echo "[prepare][FAIL] Missing public/ directory."; exit 1; }

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
rm -rf .next/standalone/public

cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "[prepare][PASS] Standalone assets prepared: .next/standalone/.next/static and .next/standalone/public"
