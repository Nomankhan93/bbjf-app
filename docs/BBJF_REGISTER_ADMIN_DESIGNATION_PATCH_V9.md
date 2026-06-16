# BBJF Register + Admin Designation Assignment Patch v9

## Purpose

This patch aligns BBJF membership flow with the JAS membership portal designation workflow while keeping BBJF as a membership-only portal.

## What changed

1. `src/routes/register.tsx`
   - Removed designation, designation level and designation area from the public/member registration form.
   - Registration now collects member identity, location, optional profile details, emergency contact, photo and declaration only.
   - Member edits/resubmissions no longer overwrite admin-assigned designation fields.
   - Profile and emergency fields now follow the JAS-style optional profile approach.

2. `src/routes/admin/members/$id.tsx`
   - Added an admin-only “Assign designation to membership card” panel.
   - Designation assignment unlocks after the member is approved.
   - Admin can set designation title, level and area/jurisdiction.
   - Saved designation appears through the existing card, dashboard and QR verification fields.
   - Admin can clear designation when needed.

3. `src/lib/designation-assignment.ts`
   - Added BBJF designation levels and recommended designation titles.
   - Levels: UC, City, Taluka, District, Divisional, Provincial.

4. `src/config/admin-navigation.tsx`
   - Added “Assign Designations” helper item under Membership Tools.

5. `src/routes/index.tsx`
   - Updated landing text to clarify that official designations are assigned by admin after approval.

## Database note

This patch uses BBJF `members` table columns:

- `designation`
- `designation_level`
- `designation_area`

A safe idempotent migration is included:

```txt
supabase/migrations/20260616173000_bbjf_admin_assigned_designation_fields.sql
```

It adds the columns/indexes if missing and updates the `app_private.protect_member_update()` trigger function so normal members cannot change official designation fields from the client. Admin users and service-role actions can still assign/clear designations.

No new table is required. No payment/program/committee/finance module was added.

## Test checklist

1. Login as normal member.
2. Open `/register`.
3. Confirm designation fields are not shown.
4. Submit membership application.
5. Login as admin.
6. Open `/admin` and select a member.
7. Approve the member.
8. Use the new designation panel to assign:
   - Designation
   - Level
   - Area/Jurisdiction
9. Open digital membership card.
10. Confirm designation appears on card and QR verification page.

## Commands

```bash
npm run check
npm run build
```
