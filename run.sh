#!/usr/bin/env bash
set -euo pipefail
command -v node >/dev/null 2>&1 || { echo "Node.js not found (need 18+)"; exit 1; }
command -v pnpm >/dev/null 2>&1 || npm install -g pnpm
pnpm install
pnpm migrate:dev
pnpm seed
if command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:3000 || true; fi
if [[ "$OSTYPE" == "darwin"* ]]; then open http://localhost:3000 || true; fi
pnpm dev
