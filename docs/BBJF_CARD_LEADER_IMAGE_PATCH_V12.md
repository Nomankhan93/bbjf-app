# BBJF Card Leader Image Patch v12

Adds the transparent Bilawal Bhutto leader portrait to the front side of the BBJF digital membership card header, matching the supplied edited reference card.

## Changed files

- `src/components/MembershipCard.tsx`
- `src/routes/card.tsx`
- `public/card-assets/bilawal-bhutto-card-leader.png`

## Notes

- The leader image is loaded as a data URL on the member card page before PNG export so the exported card includes the image reliably.
- The image prop is optional, so admin/card usages continue working even if they do not explicitly pass the data URL.
- Front/back export dimensions remain unchanged.
