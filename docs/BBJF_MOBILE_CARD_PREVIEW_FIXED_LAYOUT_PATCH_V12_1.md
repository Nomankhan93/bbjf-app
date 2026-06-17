# BBJF Mobile Card Preview Fixed Layout Patch v12.1

## Problem
On normal Android/iOS mobile view the membership card was using Tailwind breakpoint classes (`sm:` / `md:`). Because mobile viewport width is below those breakpoints, the card switched to a single-column mobile layout **inside a fixed 1016×638 export card**, causing the front/back card content to be clipped. Desktop-site mode looked correct because the desktop media queries were active.

## Fix
- Make `MembershipCard` keep its desktop/export layout at all viewport sizes.
- Replace `sm:` / `md:` responsive grid classes inside the card with fixed grid classes.
- Give the card stack a fixed export preview width (`1016 + 32`) so the external `ResponsiveCardPreview` can scale it accurately on Android and iOS.

## Changed file
- `src/components/MembershipCard.tsx`

## Test
- `npm run check`
- `npm run build`
- Open `/card` on normal mobile view.
- Open `/admin/members/:id/card` on normal mobile view.

The front and back cards should now show complete layout with QR side panels, not cropped single-column content.
