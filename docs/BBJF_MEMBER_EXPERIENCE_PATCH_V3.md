# BBJF Member Experience Patch v3

This patch is intended to be applied after:

1. `bbjf-jas-improvements-patch-v1.zip`
2. `bbjf-admin-console-patch-v2.zip`

## Purpose

Patch v3 improves the member-side experience after the admin console upgrade. It keeps BBJF as a clean membership portal and avoids adding payment, donation, program, or CMS complexity.

## Changes

### Member dashboard

- Adds a clearer status hero for pending, approved, and rejected applications.
- Adds submitted/updated dates in the dashboard header area.
- Adds a step-style application timeline.
- Shows member number prominently when issued.
- Adds public verification link block for approved members.
- Adds copy verification link button.
- Masks CNIC, mobile, and emergency mobile by default.
- Adds a show/hide sensitive information toggle.
- Adds emergency contact information to the member dashboard.
- Adds refresh button.
- Adds clearer rejected-application CTA: update and resubmit.

### Registration polish

- Updates the final registration step text from `Photo, Payment & Declaration` to `Photo & Declaration`.
- Clarifies that no payment receipt is required in this BBJF version.
- Removes unused payment CSS blocks from the registration stylesheet.

### Cleanup helper

- Adds `npm run cleanup:payment`.
- The cleanup script removes the deprecated `src/lib/membership-fee.ts` helper and prints any remaining payment/fee strings for review.

## No database migration

This patch does not add a new SQL migration. It relies on fields already added by the existing BBJF profile-field migration:

- `emergency_contact_name`
- `emergency_contact_relation`
- `emergency_contact_mobile`
- `designation`
- `designation_level`
- `designation_area`

## Verification

Run:

```bash
npm ci
npm run check
npm run build
```

Optional cleanup after successful testing:

```bash
npm run cleanup:payment
npm run check
npm run build
```

## Notes

`npm audit` may still show a critical dependency warning inherited from the current dependency tree. This patch does not change dependency versions.
