# BBJF Admin Profile Edit + Card Preview Patch v10

## Purpose

This patch brings the BBJF admin member detail workflow closer to the JAS membership portal while keeping BBJF as a membership-only app.

## Added

- Admin can open a member detail page and use **Edit Profile**.
- Admin can update member identity, CNIC, mobile, location, address, date of birth, gender, education, blood group, profession, caste branch and declaration status.
- Admin can replace the member profile photo from the same edit panel.
- Member detail now includes a dedicated **Card Preview** panel.
- Approved members with member number can be opened in the existing admin card preview/export route.
- Updated data is used by admin detail, dashboard, card preview and QR verification.
- Fixes the duplicate `member: Member` prop typing issue in the designation panel.
- Adds a Supabase migration to allow admin-side member photo uploads safely.

## Changed files

- `src/routes/admin/members/$id.tsx`
- `supabase/migrations/20260616190000_bbjf_admin_profile_edit_permissions.sql`
- `docs/BBJF_ADMIN_PROFILE_EDIT_CARD_PREVIEW_PATCH_V10.md`

## Apply

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/*/Downloads/bbjf-admin-profile-edit-card-preview-patch-v10.zip -d .
npm run check
npm run build
```

## Local Supabase

```bash
npx supabase db reset
```

## Production Supabase

Run this SQL in Supabase SQL Editor:

```sql
-- Copy from:
-- supabase/migrations/20260616190000_bbjf_admin_profile_edit_permissions.sql
```

## Test checklist

1. Login as admin.
2. Open `/admin` and then any member detail page.
3. Click **Edit Profile**.
4. Change name/mobile/address or replace photo.
5. Save profile.
6. Confirm member detail reflects updated data.
7. Open card preview for approved member.
8. Confirm front/back card uses updated profile data and designation.
9. Scan/open QR verification and confirm updated member data.

## Commit

```bash
git add \
  'src/routes/admin/members/$id.tsx' \
  supabase/migrations/20260616190000_bbjf_admin_profile_edit_permissions.sql \
  docs/BBJF_ADMIN_PROFILE_EDIT_CARD_PREVIEW_PATCH_V10.md

git commit -m "Add admin profile edit and card preview workflow"
```
