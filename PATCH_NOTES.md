# BBJF Membership Profile Fields Patch

Scope: membership portal only.

## What this patch adds

- Adds membership profile columns through a Supabase migration:
  - taluka
  - address
  - date_of_birth
  - gender
  - education
  - blood_group
  - declaration_accepted
- Updates member registration form to collect these fields.
- Updates dashboard to show the full membership profile.
- Updates admin list and admin detail pages to show taluka/contact/profile fields.
- Updates user and admin card preview to include taluka, address and blood group.
- Updates public verification page to show taluka/town with district.
- Adds the missing `.input` CSS class used by forms and admin filters.

## Important

Run the Supabase migration before testing the updated app, otherwise the UI will query columns that do not exist yet.
