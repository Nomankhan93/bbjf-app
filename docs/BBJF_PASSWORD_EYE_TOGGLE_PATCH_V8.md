# BBJF Password Eye Toggle Patch v8

## Purpose

Adds a password preview/show-hide eye button to all password inputs in the BBJF auth screens, without changing the existing email/password or mobile-number/password auth logic.

## Updated screens

- `/signup`
  - Password field
  - Confirm password field
- `/login`
  - Password field

## Notes

- The eye button is `type="button"`, so it does not submit the form.
- Password values remain in React state exactly as before.
- The input switches between `type="password"` and `type="text"` only when the user taps the eye icon.
- Email and mobile login/signup flows are unchanged.

## Recommended tests

```bash
npm run check
npm run build
npm run dev
```

Manual test checklist:

1. Open `/signup`.
2. Test Email signup password and confirm password eye buttons.
3. Switch to Mobile signup and test password and confirm password eye buttons.
4. Open `/login`.
5. Test Email login password eye button.
6. Switch to Mobile login and test password eye button.
7. Confirm login/signup submit buttons still work normally.
