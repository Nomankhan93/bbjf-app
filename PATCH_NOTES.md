# BBJF Register Designation Patch

## Scope
- Membership portal only.
- Adds an optional member `designation` / role field.
- Does not add program, finance, welfare, or organization-management modules.

## Updated files
- `src/routes/register.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/admin.tsx`
- `src/routes/admin/members/$id.tsx`
- `src/routes/card.tsx`
- `src/routes/admin/members/$id/card.tsx`
- `src/routes/verify/$memberNo.tsx`
- `src/components/MembershipCard.tsx`
- `src/lib/verify/actions.ts`
- `src/lib/supabase/database.types.ts`
- `supabase/migrations/20260609133500_add_member_designation.sql`

## Notes
- The designation field is optional so old member records continue to work.
- Admin list search now includes designation.
- Dashboard, admin detail, digital card, admin card preview, and public verify page show designation when available.
