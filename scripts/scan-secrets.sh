#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

EXCLUDE_DIRS=(
  --exclude-dir=.git
  --exclude-dir=node_modules
  --exclude-dir=.output
  --exclude-dir=dist
  --exclude-dir=dist-ssr
  --exclude-dir=.tanstack
  --exclude-dir=.nitro
  --exclude-dir=.vinxi
  --exclude-dir=supabase/.temp
  --exclude-dir=supabase/.branches
  --exclude-dir=exports
  --exclude-dir=backups
)

EXCLUDE_FILES=(
  --exclude='*.zip'
  --exclude='*.log'
  --exclude='package-lock.json'
  --exclude='.env.local'
)

patterns=(
  'SUPABASE_SERVICE_ROLE_KEY=.*[A-Za-z0-9_-]{20,}'
  'service_role[^[:space:]]*[=:][^[:space:]]*[A-Za-z0-9_-]{20,}'
  'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'
  'sk-[A-Za-z0-9]{20,}'
)

found=0
for pattern in "${patterns[@]}"; do
  matches=$(grep -RInE "${EXCLUDE_DIRS[@]}" "${EXCLUDE_FILES[@]}" "$pattern" . \
    | grep -vE 'your-server-only-service-role-key|your-anon-key|your-project-ref|example|placeholder|REPLACE_ME' \
    || true)
  if [[ -n "$matches" ]]; then
    found=1
    echo "Potential secret pattern found for: $pattern" >&2
    echo "$matches" >&2
  fi
done

if [[ "$found" -ne 0 ]]; then
  echo "❌ Secret scan failed. Remove real secrets before committing or sharing." >&2
  exit 1
fi

echo "✅ Secret scan passed."
