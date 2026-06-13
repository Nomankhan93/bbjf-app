#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

section() { echo -e "\n${BLUE}== $1 ==${NC}"; }
pass() { PASS_COUNT=$((PASS_COUNT + 1)); echo -e "${GREEN}✓${NC} $1"; }
warn() { WARN_COUNT=$((WARN_COUNT + 1)); echo -e "${YELLOW}⚠${NC} $1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo -e "${RED}✗${NC} $1"; }
require_file() { [[ -f "$1" ]] && pass "Found $1" || fail "Missing $1"; }
require_dir() { [[ -d "$1" ]] && pass "Found $1/" || fail "Missing $1/"; }

section "BBJF Project Verification"
echo "Root: $ROOT_DIR"
echo "Date: $(date -Is)"

section "Required files"
require_file package.json
require_file package-lock.json
require_file README.md
require_file .env.example
require_file .gitignore
require_file .zipignore
require_file vite.config.ts
require_dir src/routes
require_dir supabase/migrations

section "Repository hygiene"
if [[ -f .env.local ]]; then
  warn ".env.local exists locally. Use it only locally; never share it in ZIP/Git. Rotate the service role key if it was shared."
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  tracked_forbidden=$(git ls-files | grep -E '(^\.env$|^\.env\.local$|^node_modules/|^\.output/|^supabase/\.temp/|^supabase/snippets/|\.zip$)' || true)
  if [[ -n "$tracked_forbidden" ]]; then
    fail "Forbidden files are tracked by Git:"
    echo "$tracked_forbidden"
  else
    pass "No forbidden files tracked by Git"
  fi
else
  warn "Not inside a Git repository; skipped tracked-file hygiene check"
fi

section "Client secret scan"
if grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.output --exclude='*.zip' "SUPABASE_SERVICE_ROLE_KEY" src | grep -v "src/lib/supabase/admin.ts"; then
  fail "SUPABASE_SERVICE_ROLE_KEY appears in client/app source outside server admin helper"
else
  pass "No service-role key usage outside server admin helper"
fi

section "TypeScript and build"
if npm run check; then pass "npm run check passed"; else fail "npm run check failed"; fi
if npm run build; then pass "npm run build passed"; else fail "npm run build failed"; fi

section "Summary"
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo -e "${RED}Failures:${NC} $FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo -e "${RED}Project verification failed.${NC}"
  exit 1
fi

echo -e "${GREEN}Project verification completed.${NC}"
