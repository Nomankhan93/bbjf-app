# BBJF Authorized Signature Patch

Adds the authorized signature image and signatory details to the BBJF membership card back side.

## Updated

- `src/components/MembershipCard.tsx`
- `public/bbjf/authorized-signature-taj-muhammad-bhurgai.png`

## Card back side issuing authority

- Signature image displayed inside the Authorized Signature panel.
- Signatory name: Taj Muhammad Bhurgai
- Signatory title: Provincial President, Sindh

## Apply

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/noman/Downloads/bbjf-authorized-signature-patch.zip -d .
npm run check
npm run build
npm run test
```
