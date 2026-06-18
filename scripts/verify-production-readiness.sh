#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== BBJF Production Readiness Check =="
echo "Root: $ROOT_DIR"
echo "Date: $(date -Is)"

printf "\n== Secret scan ==\n"
bash scripts/scan-secrets.sh

if [[ -f .env.local ]]; then
  printf "\n⚠ .env.local exists locally. This is okay for development, but do not include it in Git or ZIP exports.\n"
fi

printf "\n== TypeScript ==\n"
npm run check

printf "\n== Unit/smoke tests ==\n"
npm test

printf "\n== Production build ==\n"
npm run build

printf "\n== Dependency audit ==\n"
npm run security:audit

printf "\n✅ BBJF production readiness check passed.\n"
