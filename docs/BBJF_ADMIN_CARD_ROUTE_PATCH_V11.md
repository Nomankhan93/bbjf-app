# BBJF Admin Card Route Patch v11

Purpose: ensure BBJF has the same admin member card preview route pattern as JAS:

- Route: `/admin/members/$id/card`
- File: `src/routes/admin/members/$id/card.tsx`
- Admin role check: `admin`, `super_admin`, `membership_admin`
- Fetch approved member profile and card fields
- Generate public QR verification URL
- Load signed member photo from `member-photos`
- Preview BBJF front/back membership card
- Download front, back, or both sides as PNG

This patch only adds/replaces the card route file. It does not overwrite the admin member detail page, so the Edit Profile hotfix remains safe.

Apply:

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/*/Downloads/bbjf-admin-card-route-patch-v11.zip -d .
npm run check
npm run build
```

Verify route exists:

```bash
ls -la 'src/routes/admin/members/$id/card.tsx'
grep -n "createFileRoute('/admin/members/\$id/card')" 'src/routes/admin/members/$id/card.tsx'
grep -n "admin/members/\$id/card" src/routeTree.gen.ts
```

If `routeTree.gen.ts` does not include the route, run:

```bash
npm run build
git status
```

Then commit any generated `src/routeTree.gen.ts` change too.
