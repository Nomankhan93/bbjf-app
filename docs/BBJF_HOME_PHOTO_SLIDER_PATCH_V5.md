# BBJF Home Photo Slider Patch v5

## Purpose

Adds the uploaded BBJF photos as a professional home-page image slider without changing the membership, admin, card, or database flows.

## Added

- Home hero is now a responsive two-column layout on desktop.
- Right side contains an auto-playing photo slider.
- Manual slide dots are available.
- Slide captions explain the membership platform flow:
  - Digital Membership
  - Public Outreach
  - Admin Review
  - QR Verification
- Slider is mobile-friendly and stacks under the hero text on small screens.

## Changed files

- `src/routes/index.tsx`
- `public/home-slides/bbjf-slide-01.jpg`
- `public/home-slides/bbjf-slide-02.jpg`
- `public/home-slides/bbjf-slide-03.jpg`
- `public/home-slides/bbjf-slide-04.jpg`
- `docs/BBJF_HOME_PHOTO_SLIDER_PATCH_V5.md`

## No SQL migration

This patch is frontend-only.

## Test commands

```bash
npm ci
npm run check
npm test
npm run build
```
