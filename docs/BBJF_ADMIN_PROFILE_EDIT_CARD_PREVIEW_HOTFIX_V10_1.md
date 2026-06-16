# BBJF Admin Profile Edit + Card Preview Hotfix v10.1

Purpose: ensure the JAS-style admin profile edit controls are visible on the BBJF member detail page and make the admin card preview open with a direct URL.

## What this hotfix changes

- Keeps BBJF as membership portal only.
- Ensures **Edit Profile** appears in the member detail header and member details panel.
- Adds profile edit form for admin corrections.
- Adds card preview panel for approved members.
- Uses direct `/admin/members/<id>/card` URLs for card preview buttons to avoid route-link click issues in deployed builds.
- Keeps the SQL permission migration from v10 for admin profile/photo updates.

## Files changed

- `src/routes/admin/members/$id.tsx`
- `supabase/migrations/20260616190000_bbjf_admin_profile_edit_permissions.sql`
- `docs/BBJF_ADMIN_PROFILE_EDIT_CARD_PREVIEW_HOTFIX_V10_1.md`

## Apply

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/*/Downloads/bbjf-admin-profile-edit-card-preview-hotfix-v10-1.zip -d .
npm run check
npm run build
```

## Production

After committing, push to GitHub so Vercel deploys the new build:

```bash
git add 'src/routes/admin/members/$id.tsx' \
  supabase/migrations/20260616190000_bbjf_admin_profile_edit_permissions.sql \
  docs/BBJF_ADMIN_PROFILE_EDIT_CARD_PREVIEW_HOTFIX_V10_1.md

git commit -m "Fix admin profile edit and card preview actions"
git push origin main
```

If production still shows the old page, Vercel is serving an old deployment. Redeploy the latest commit from Vercel.
