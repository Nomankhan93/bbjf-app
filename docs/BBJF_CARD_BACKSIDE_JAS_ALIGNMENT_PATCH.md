# BBJF Card Backside JAS Alignment Patch

## Purpose

Align the BBJF membership card backside with the JAS card backside layout while keeping BBJF branding, colors, and verification URL behavior.

## Updated

- Backside header changed to a JAS-style `Cardholder Details` header.
- Content area aligned into structured panels:
  - Residential Address
  - Emergency Contact
  - Member Information
  - Verification Instructions
  - Terms and Conditions
  - Issuing Authority
- Right-side verification column added:
  - Issue No / Version
  - QR code
  - Verification URL
  - Organization
- Caste remains shown as `Caste`, using `member.caste_branch`.
- Emergency contact fields are now selected for member/user and admin card previews.
- English, Urdu, and Sindhi translation keys were added for the new backside labels.

## Validation

```bash
npm run check
npm run build
npm run test
```

All commands passed during patch preparation.
