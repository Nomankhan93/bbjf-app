# BBJF JAS Improvements Patch v1

This patch ports the safest must-have improvements from `jas-app` into the BBJF membership portal without copying JAS-only modules.

## Included

- Safe export workflow: `.zipignore`, `.env.example`, `scripts/safe-export.sh`, `scripts/check-safe-archive.sh`, `scripts/verify-project.sh`.
- Package scripts: `check`, `typecheck`, `safe-export`, `verify:project`, `check-safe-archive`, `lock:sync`.
- Vite production stability: development-only TanStack devtools, path aliases, React/TanStack dedupe, optimized chunks.
- PWA manifest icon path fix: `/icon-192x192.png` and `/icon-512x512.png`.
- Public verify privacy hardening: pending/rejected members no longer return private photo/name/area details.
- Registration TypeScript cleanup: removed unused `savedMemberId` flow.
- Card export system: shared export/QR helpers, fixed card side size, separate front/back/both PNG download buttons, copy verification link.
- Card data split cleanup: front shows the main public identity/designation/status fields; back carries remaining member/contact/area data.
- Header auth UX: admin link is visible only for logged-in admins; public users see login/signup links.
- Database migration: fixes district/gender constraints and revokes access from deprecated payment table if it exists.
- README rewritten for BBJF setup, scope, security, admin setup, and safe export.

## Migration to Run

```sql
supabase/migrations/20260613120000_bbjf_constraints_and_payment_cleanup.sql
```

Run this after applying the patch.

## Security Note

The original shared ZIP contained `.env.local`. This patch adds safe export protections, but it cannot rotate already exposed keys. Rotate the Supabase service role key if that ZIP was shared outside your machine.
