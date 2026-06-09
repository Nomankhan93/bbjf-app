# BBJF card front/back information split patch

## Scope
Membership portal card layout only.

## Changes
- Front side now highlights only:
  - Member Name
  - Father Name
  - Designation
  - Designation Level
  - Designation Area / Jurisdiction
  - Approved Date
  - Status
- Front side no longer repeats CNIC, mobile, district, taluka, blood group, profession, or wing/category in the main detail grid.
- Back side keeps the remaining member information.
- Back side no longer repeats:
  - Designation
  - Designation Level
  - Designation Area / Jurisdiction
- Status label now uses the actual member status translation instead of hardcoded Approved.

## Changed file
- src/components/MembershipCard.tsx
