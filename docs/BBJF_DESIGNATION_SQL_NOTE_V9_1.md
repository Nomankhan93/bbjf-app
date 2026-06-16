# BBJF Designation SQL Note v9.1

This patch includes one safe Supabase migration:

```txt
supabase/migrations/20260616173000_bbjf_admin_assigned_designation_fields.sql
```

It supports the JAS-style designation workflow:

- Member registration does not collect official designation.
- Admin assigns designation after approval.
- Designation prints on membership card and public QR verification.
- Normal members cannot change official designation fields from client-side updates.

## Apply locally

```bash
npx supabase db reset
```

Or, if you do not want to reset local data, copy the SQL file content into Supabase SQL Editor and run it.

## Production Supabase

Run the SQL file once in Supabase Cloud SQL Editor, or push migrations through your normal Supabase migration workflow.

The migration is idempotent and uses `add column if not exists` / `create index if not exists`, so it is safe if older designation columns already exist.
