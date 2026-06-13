# BBJF Header Card / Logout + Password Eye Patch v9

## Purpose

This patch improves member navigation and authentication UX.

## Changes

1. Adds **Digital Membership Card** link to the header for logged-in users.
2. Adds **Logout** button directly in the header so members do not need to open Dashboard just to sign out.
3. Adds mobile header actions for **Card** and **Logout** when logged in.
4. Adds a reusable password field component with show/hide eye toggle.
5. Applies password preview eye toggle on Login and Signup password fields.
6. Adds English, Urdu, and Sindhi translation label for `nav.membershipCard`.
7. Adds CSS for the header logout button and password visibility control.

## Changed files

- `src/routes/__root.tsx`
- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/components/auth/PasswordInput.tsx`
- `src/lib/i18n.tsx`
- `src/styles.css`

## Test commands

```bash
npm ci
npm run check
npm test
npm run build
```

## Notes

The logout action uses Supabase `auth.signOut()` from the global site header and redirects the user to Home.
