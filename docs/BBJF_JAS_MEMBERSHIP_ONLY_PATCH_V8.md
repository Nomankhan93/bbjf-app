# BBJF Patch V8 — JAS-style membership-only portal update

This patch updates BBJF from the current project ZIP by comparing it with the JAS membership portal patterns, while keeping BBJF as a **membership portal only**.

## Scope kept intentionally limited

Included:
- Public landing page
- Signup/login links
- Member registration route
- Member dashboard
- Admin membership console
- Digital membership card route
- Public QR verification flow

Not added:
- Payment flow
- Donation module
- Program modules
- CMS/news/events/gallery modules
- Finance/reporting modules

## Changed files

- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/admin.tsx`
- `src/hooks/useAuthRole.ts`
- `src/config/navigation.tsx`
- `src/config/admin-navigation.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/AccountMenu.tsx`
- `src/components/layout/NavLink.tsx`
- `src/components/layout/NotFoundPage.tsx`
- `src/components/layout/PwaBootstrap.tsx`

## Main improvements

### Root / app shell
- Replaced inline root header with a reusable JAS-style layout header.
- Added viewport-safe metadata and improved app/PWA head tags.
- Added skip-to-content link for accessibility.
- Hides the main header on public verification pages.
- Uses compact header mode on card/admin member preview pages.

### Header / navigation
- Added clean desktop navigation.
- Added mobile drawer navigation.
- Added account menu with dashboard, register, digital card, admin panel and logout actions.
- Added reusable navigation config.
- Added logout helper state through `useAuthRole`.

### Index / landing page
- Rebuilt as a professional BBJF membership landing page.
- Keeps BBJF home slide images.
- Adds membership-only scope section.
- Adds clear calls to action for signup, login, dashboard, card and admin.

### Dashboard
- Rebuilt as a professional member console.
- Adds status hero, member number, submitted date and approved date cards.
- Improves member profile layout and mobile readability.
- Keeps CNIC/mobile masked by default.
- Adds clear next-step actions based on pending/approved/rejected status.

### Admin
- Upgraded admin page hero and dashboard stats.
- Adds clickable stat cards for all/pending/approved/rejected filters.
- Adds Cards Issued count.
- Improves search/filter section and export/refresh actions.
- Keeps admin restricted to `user_roles.role = admin`.

## Validation run

Both commands passed after patch:

```bash
npm run check
npm run build
```

Build only showed existing TanStack warning about `createServerFn().inputValidator()` being deprecated. That warning was already in the project and does not block the build.

## Apply

From project root:

```bash
unzip -o /mnt/c/Users/*/Downloads/bbjf-jas-membership-only-patch-v8.zip -d .
npm run check
npm run build
```

## Commit

```bash
git add src/routes/__root.tsx src/routes/index.tsx src/routes/dashboard.tsx src/routes/admin.tsx src/hooks/useAuthRole.ts src/config/navigation.tsx src/config/admin-navigation.tsx src/components/layout/Header.tsx src/components/layout/AccountMenu.tsx src/components/layout/NavLink.tsx src/components/layout/NotFoundPage.tsx src/components/layout/PwaBootstrap.tsx docs/BBJF_JAS_MEMBERSHIP_ONLY_PATCH_V8.md
git commit -m "Update BBJF membership portal layout and dashboards"
```
