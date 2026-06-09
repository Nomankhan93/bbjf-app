# BBJF i18n dashboard/admin/card patch

## Scope

This patch keeps the project as a membership portal only. It extends the existing English / Urdu / Sindhi i18n system beyond login/signup/register.

## Changed

- Added translation keys for common labels, dashboard, admin panel, card pages, membership card labels, and public verification page.
- Connected `/dashboard` to i18n and localized status/profile labels.
- Connected `/card` to i18n and localized card page copy/buttons/errors.
- Connected `/admin` to i18n and localized member list labels/search/filter/statuses.
- Connected `/admin/members/$id` to i18n and localized member detail/review labels.
- Connected `/admin/members/$id/card` to i18n and localized admin card preview page.
- Connected `/verify/$memberNo` to i18n and localized public verification results.
- Localized reusable `MembershipCard` front/back labels and terms.

## Tests

- `npx tsc --noEmit`
- `npm run build`
