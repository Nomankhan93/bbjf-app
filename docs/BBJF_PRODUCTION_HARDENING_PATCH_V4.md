# BBJF Production Hardening Patch v4

This patch builds on v1, v2, and v3. It focuses on production readiness, privacy regression protection, dependency audit cleanup, and repeatable verification commands.

## What changed

1. Added npm override for `shell-quote` to resolve the critical dev-dependency audit warning.
2. Added production-readiness verification script.
3. Added secret-scanning script for common service-role/JWT/API-key leaks.
4. Added unit/smoke tests for public verification privacy.
5. Added unit/smoke tests for CNIC/mobile masking, input formatting, and CSV escaping.
6. Refactored public verification payload building into a pure helper so privacy behavior is testable.
7. Kept photo signed URLs restricted to approved members only.

## New commands

```bash
npm run scan:secrets
npm run security:audit
npm run security:audit:prod
npm run verify:production
```

## Recommended check sequence after applying

```bash
npm ci
npm run check
npm test
npm run build
npm run security:audit
npm run verify:production
```

## Privacy rule protected by tests

Public QR verification must not disclose pending/rejected member details. For non-approved members, the public payload should only expose:

```txt
member_no
status
Not disclosed placeholders
```

It must not expose:

```txt
real full name
real district/taluka
real designation details
photo signed URL
approval date
```

## Notes

- `.env.local` can exist locally for development, but must never be committed or shared in project ZIPs.
- If an older ZIP containing `.env.local` was shared, rotate the Supabase service role key.
