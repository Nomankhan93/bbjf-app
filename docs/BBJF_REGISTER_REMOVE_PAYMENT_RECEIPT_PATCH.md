# BBJF Register Remove Payment Receipt Patch

## Purpose
Remove payment method instructions and payment receipt upload from the membership application form submit step.

## Changed file
- `src/routes/register.tsx`

## What changed
- removed payment method/account/QR panel from the register form
- removed receipt upload field from the submit step
- removed receipt-required validation
- removed receipt storage upload during form submit
- removed automatic `membership_payments` upsert during form submit
- removed register-page dependency on `src/lib/membership-fee.ts`

## Notes
This patch does not delete the existing payment table or admin/dashboard payment features. It only removes payment/receipt requirements from membership form submission.
