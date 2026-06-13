# BBJF Mobile Layout Fit Patch v11

This patch fixes the mobile/PWA installed-app layout overflow seen in the shared screenshots.

## Fixes

1. Prevents global horizontal page overflow.
2. Makes the header wrap cleanly on mobile instead of pushing content off-screen.
3. Keeps the BBJF brand pill truncated safely on small screens.
4. Makes the compact language switcher safe inside the mobile header.
5. Keeps Login / Digital Card / Logout buttons inside the mobile viewport.
6. Tightens mobile spacing for home, auth, and dashboard pages.
7. Scales the digital membership card preview to fit mobile screens instead of showing only the left part.
8. Keeps PNG export size unchanged for high-quality front/back downloads.

## Tested

- npm run check
- npm test
- npm run build

All passed.
