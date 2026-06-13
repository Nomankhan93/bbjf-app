# BBJF Patch A — Remove payment flow and improve membership card

## Scope

This patch is for `bbjf-app` only. It is separate from `jas-app`.

## Changes

### Payment system removed from registration flow

- Removed membership fee import usage from `/register`.
- Removed payment receipt state and validation.
- Removed payment receipt upload.
- Removed `membership_payments` fetch/upsert from registration submit.
- Removed the payment QR/account panel from the final registration step.
- Final registration step now asks only for photo upload and declaration confirmation.
- Registration submission now creates/updates the member record only.

### Membership card fixed

- Rebuilt `src/components/MembershipCard.tsx` front and back layout.
- Front side now has a cleaner BBJF red/black/green header, photo panel, member number, member profile details, QR block, and verification notice.
- Back side now has organized member information, address, QR verification block, terms, and issuing authority.
- CNIC and mobile formatting added on the card back.
- QR URL display is shortened for better layout.
- Front/back card remains in one exportable card stack.

## Files

- `src/routes/register.tsx`
- `src/components/MembershipCard.tsx`
- `src/lib/i18n.tsx`

## Notes

No database migration is included. Existing `membership_payments` tables/bucket are left untouched to avoid destructive data loss. They are no longer used by the registration frontend after this patch.
