# BBJF Payment Rs. 500 Patch

This patch ports the JAS manual membership-payment workflow into the BBJF membership portal.

## What changed

- Sets BBJF membership fee to **Rs. 500** in `src/lib/membership-fee.ts`.
- Adds payment summary, manual account/QR instructions, and required receipt upload to `/register`.
- Shows payment status and receipt/account details on `/dashboard`.
- Adds admin payment receipt review, receipt upload/replace, admin notes, and status controls on `/admin/members/$id`.
- Adds migration `20260618150000_bbjf_membership_payment_rs500.sql` to re-enable `membership_payments`, storage bucket access, and RLS policies.
- Keeps donations/program finance modules out of BBJF. This is only for the membership fee.

## Production setup required

Update the placeholder payment details in `src/lib/membership-fee.ts` before going live:

- Bank/account title
- Account number or wallet number
- IBAN if applicable
- Till ID if applicable
- Real payment QR image path

## Apply database migration

```bash
npx supabase db reset
# or apply this migration in Supabase Cloud SQL editor:
# supabase/migrations/20260618150000_bbjf_membership_payment_rs500.sql
```

## Verify

```bash
npm install
npm run check
npm run build
```
