# BBJF Mobile Password Auth + Current Design Patch v10

## Purpose

This patch merges the older `bbjf-mobile-password-auth-patch-v7` feature into the current BBJF visual design and password-eye/header patches.

It keeps the newer auth card design, password preview eye component, and current translations while adding mobile-number + password signup/login.

## Changed files

- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/lib/i18n.tsx`

## What changed

### Login

The login page now supports:

1. Email + Password
2. Mobile + Password

Mobile login calls Supabase Auth using:

```ts
supabase.auth.signInWithPassword({
  phone: '+923001234567',
  password,
})
```

### Signup

The signup page now supports:

1. Email + Password
2. Mobile + Password

Mobile signup stores `full_name` and `login_method` in auth metadata.

### Phone normalization

The app normalizes Pakistani mobile numbers:

- `03001234567` -> `+923001234567`
- `923001234567` -> `+923001234567`
- `+923001234567` -> `+923001234567`
- `3001234567` -> `+923001234567`

### Design preserved

This patch does not replace the current eye-catching design. It uses:

- `bbjf-auth-page`
- `bbjf-auth-card`
- `bbjf-input`
- `bbjf-auth-button`
- existing `PasswordInput` eye preview component

## Supabase Cloud settings required

In Supabase Dashboard:

```txt
Authentication -> Sign In / Providers -> Phone
```

Recommended for this app flow:

```txt
Phone provider: Enabled
Phone signups: Enabled
Phone confirmations: Disabled
```

If phone confirmations are enabled, Supabase may still require OTP verification.

## Local Supabase optional config

If testing local Supabase and mobile signup does not work, check `supabase/config.toml`:

```toml
[auth.sms]
enable_signup = true
enable_confirmations = false
```

This patch intentionally does not overwrite `supabase/config.toml` to avoid replacing your local Supabase ports/settings.

## Test checklist

Run:

```bash
npm ci
npm run check
npm test
npm run build
```

Manual test:

1. Open `/signup`.
2. Create account using email + password.
3. Create account using mobile + password with `03XXXXXXXXX` format.
4. Open `/login`.
5. Login using email + password.
6. Login using mobile + password.
7. Confirm password eye preview works on login and signup.
8. Confirm current design still looks correct.
