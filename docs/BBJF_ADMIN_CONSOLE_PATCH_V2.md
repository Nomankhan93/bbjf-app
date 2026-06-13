# BBJF Admin Console Patch v2

This patch builds on `bbjf-jas-improvements-patch-v1` and focuses on admin-side operations.

## Added

- BBJF-specific admin shell and sidebar.
- Mobile admin drawer navigation.
- Admin overview stat cards.
- Status, district, taluka and submitted-date filters.
- Debounced member search.
- Server-side pagination and exact filtered counts.
- Page size selector.
- Masked CNIC/mobile by default with a toggle to show sensitive values.
- CSV export for the current filtered result set.
- Refresh button.
- Admin member detail page now uses the same admin shell layout.
- Admin card preview now matches the user card export flow:
  - front PNG
  - back PNG
  - front/back PNG
  - copy verification link

## Optional cleanup

The ZIP patch cannot remove old files automatically. After applying and testing, you may run:

```bash
npm run cleanup:starter
npm run check
npm run build
```

This removes unused TanStack starter/demo files and the deprecated membership-fee helper file.

## Verification

Run:

```bash
npm ci
npm run check
npm run build
npm test
```

`npm test` exits successfully because `--passWithNoTests` is enabled. Vitest may still print a Vite close-timeout warning when no test files exist.
