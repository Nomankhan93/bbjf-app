#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

rm -f \
  src/components/Header.tsx \
  src/components/Footer.tsx \
  src/components/ThemeToggle.tsx \
  src/components/demo.FormComponents.tsx \
  src/data/demo-table-data.ts \
  src/hooks/demo.form-context.ts \
  src/hooks/demo.form.ts \
  src/lib/membership-fee.ts

echo "Removed unused TanStack starter/demo and deprecated payment helper files."
