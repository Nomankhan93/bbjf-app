# BBJF multilingual register patch

This patch ports safe membership-only pieces from the JAS project into BBJF:

- `src/lib/i18n.tsx` for English, Urdu and Sindhi language switching.
- `src/lib/shared/formatters.ts` for CNIC, mobile, optional text and date helpers.
- `src/routes/register.css` for the advanced multi-step registration design.
- `src/routes/register.tsx` upgraded to the JAS-style multi-step form and adapted for BBJF.
- `src/lib/membership-fee.ts` for manual membership fee/receipt helper constants.
- Root header wrapped in `I18nProvider` and language switcher added.
- Login/signup pages use the i18n provider for key labels/messages.
- `src/router.tsx` and old demo `src/components/Header.tsx` cleaned so `npx tsc --noEmit` can pass.
- Database migration adds missing member fields, designation, emergency contact fields, manual payment records and receipt storage bucket.

Not included intentionally:

- JAS programs modules.
- JAS finance module.
- JAS CMS/news/gallery/committee modules.
- JAS public website routes.

Manual follow-up:

- Replace placeholder BBJF payment account details in `src/lib/membership-fee.ts`.
- Replace `MEMBERSHIP_PAYMENT_QR_IMAGE_PATH` with the real BBJF payment QR image when ready.
