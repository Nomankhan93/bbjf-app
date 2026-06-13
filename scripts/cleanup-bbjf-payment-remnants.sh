#!/usr/bin/env bash
set -euo pipefail

# BBJF payment system is intentionally disabled. This cleanup removes the old
# helper file that was inherited from earlier JAS/BBJF payment experiments.
rm -f src/lib/membership-fee.ts

echo "Removed deprecated BBJF payment helper file."

if grep -R "from ['\"]../lib/membership-fee\|from ['\"]#/.*/membership-fee\|membership-fee" -n src >/tmp/bbjf-payment-imports.txt 2>/dev/null; then
  echo "Warning: remaining membership-fee references found:"
  cat /tmp/bbjf-payment-imports.txt
  rm -f /tmp/bbjf-payment-imports.txt
  exit 1
fi

rm -f /tmp/bbjf-payment-imports.txt
echo "No active membership-fee imports found."
