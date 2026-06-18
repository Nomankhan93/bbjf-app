# BBJF Designation Dropdown Patch v12

This patch converts the admin designation office title field into a fixed dropdown.

## Changed files

- `src/lib/designation-assignment.ts`
- `src/routes/admin/members/$id.tsx`

## What changed

- Added BBJF office-title options:
  - President
  - Senior Vice President
  - Vice President
  - Vice President-I
  - Vice President-II
  - Vice President-III
  - General Secretary
  - Deputy General Secretary
  - Information Secretary
  - Deputy Information Secretary
  - Finance Secretary
  - Deputy Finance Secretary
  - Record Secretary
  - Social Media Person
  - Social Media Person-I
  - Social Media Person-II
  - Coordinator
  - Coordinator-I
  - Coordinator-II
- Kept the designation level dropdown unchanged.
- Replaced the free text/datalist designation input with a real select dropdown.
- Preserved old custom/current designation values by showing them as a temporary `(current)` option when they do not match the new fixed list.

## SQL

No SQL is required because designation is already stored in the existing `members.designation` text column.

## Apply

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/*/Downloads/bbjf-designation-title-dropdown-patch-v12.zip -d .
npm run check
npm run build
```

## Commit

```bash
git add \
  'src/routes/admin/members/$id.tsx' \
  src/lib/designation-assignment.ts \
  docs/BBJF_DESIGNATION_TITLE_DROPDOWN_PATCH_V12.md

git commit -m "Add BBJF designation title dropdown"
git push origin main
```
