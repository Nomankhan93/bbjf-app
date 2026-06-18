# BBJF Signature Free Placement Patch

Updates the BBJF membership card backside issuing-authority panel so the authorized signature image is placed freely over the signature line instead of being contained inside a rounded box.

## Changed

- Removed the boxed/ring wrapper around the signature image.
- Enlarged the signature image.
- Positioned the signature image so it overlaps the horizontal signature line like a natural handwritten signature.
- Kept the signatory text:
  - Taj Muhammad Bhurgai
  - Provincial President, Sindh

## Apply

```bash
cd ~/projects/bbjf-app
unzip -o /mnt/c/Users/noman/Downloads/bbjf-signature-free-placement-patch.zip -d .
npm run check
npm run build
npm run test
```
