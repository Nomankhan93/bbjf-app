# BBJF Card Backside Layout Cleanup Patch

## Purpose
Clean up the BBJF membership card backside layout by:

- removing the right-side stacked blocks for Issue No / Version, QR, Verification URL, and Organization
- aligning the backside more like the cleaner two-column reference layout
- expanding the main content area so member details are more visible
- keeping the updated signature placement and issuing authority details

## Changed file
- `src/components/MembershipCard.tsx`

## Result
The backside now uses a full-width two-column grid:
- Residential Address
- Emergency Contact
- Member Information
- Verification Instructions
- Terms & Conditions
- Issuing Authority

The member information section gets more space, and the extra right-side sidebar blocks are removed.
