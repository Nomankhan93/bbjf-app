#!/usr/bin/env bash
set -euo pipefail

# BBJF membership payment is active again.
# This script is intentionally a no-op so old cleanup commands cannot remove
# src/lib/membership-fee.ts or payment UI by mistake.

echo "BBJF payment system is active; nothing to remove."
