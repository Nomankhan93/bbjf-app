# BBJF Mobile Number + Password Auth Patch v7

## Purpose

This patch adds mobile-number + password signup/login support to the BBJF app without breaking the existing email + password auth flow.

## Changed files

- `src/routes/signup.tsx`
- `src/routes/login.tsx`
- `src/lib/i18n.tsx`
- `supabase/config.toml`

## What changed

### Signup

The signup page now supports two methods:

1. Email + password
2. Mobile number + password

Mobile signup fields:

- Full Name
- Mobile Number
- Password
- Confirm Password

The app normalizes Pakistani mobile numbers before sending them to Supabase Auth:

- `03001234567` -> `+923001234567`
- `923001234567` -> `+923001234567`
- `+923001234567` -> `+923001234567`

### Login

The login page now supports:

1. Email + password
2. Mobile number + password

Mobile login calls:

```ts
supabase.auth.signInWithPassword({
  phone: '+923001234567',
  password,
})
```

### Local Supabase config

`supabase/config.toml` now enables phone signup locally:

```toml
[auth.sms]
enable_signup = true
enable_confirmations = false
```

This supports mobile + password without OTP in local development.

## Supabase Cloud settings required

In Supabase Dashboard, configure:

```txt
Authentication -> Sign In / Providers -> Phone
```

Recommended settings:

```txt
Phone provider: Enabled
Phone signups: Enabled
Phone confirmations: Disabled
```

If phone confirmations remain enabled, Supabase will still require OTP verification.

## Security note

Mobile + password without OTP does not verify phone ownership. For production, BBJF should keep CNIC/mobile manual verification during admin approval. OTP can be re-added later when SMS/WhatsApp setup is approved.

## Test checklist

Run:

```bash
npm install
npm run check
npm run build
npm run dev
```

Manual test:

1. Open `/signup`.
2. Create account using email + password.
3. Create account using mobile number + password.
4. Open `/login`.
5. Login using email + password.
6. Login using mobile number + password.
7. Submit membership form after login.
