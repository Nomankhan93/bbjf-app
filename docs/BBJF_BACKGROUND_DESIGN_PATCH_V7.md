# BBJF Background Design Refresh Patch v7

This patch adds a professional background design system for BBJF without using busy photos behind forms.

## Included

- Subtle geometric civic pattern across app pages
- Soft green/cream/gold gradients
- Branded watermark glow on home hero
- Improved dashboard card surfaces
- Improved login/signup background and card styling
- Register form background polish

## Files changed

- `src/styles.css`
- `src/routes/index.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/register.css`

## Test

```bash
npm ci
npm run check
npm test
npm run build
```

## Notes

The design intentionally avoids full photo backgrounds on form pages. This keeps the membership form readable and gives the portal a clean civic/professional appearance.
