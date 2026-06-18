# BBJF Card One-Year Validity Patch

## Purpose
Make the BBJF membership card valid for one year from the approval date.

## What changed
- Expiry Date is generated automatically from `approved_at + 1 year`.
- Front side now shows `Expiry Date` next to approval/status information.
- Back side member details also show `Expiry Date`.
- Validity notice now explains that the card is valid for one year from approval date and still requires QR verification.
- English, Urdu, and Sindhi translation keys added.

## Changed files
- `src/components/MembershipCard.tsx`
- `src/lib/i18n.tsx`

## Notes
No database column is required. The expiry date is calculated from the existing `approved_at` value, so if an admin approves a member on 18 June 2026, the card expiry will display as 18 June 2027.
