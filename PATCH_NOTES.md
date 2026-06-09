# BBJF card admin preview patch

This patch keeps the project as a membership portal only.

## Changes

- Adds reusable `src/components/MembershipCard.tsx`.
- Updates user `/card` page to use the shared front + back card.
- Adds admin card preview route: `/admin/members/$id/card`.
- Adds an `Open Card` button on approved member detail pages.
- Updates generated TanStack route tree for the new admin card route.

## No database migration

This patch does not add tables, columns, programs, finance, welfare, or organization-management modules.
