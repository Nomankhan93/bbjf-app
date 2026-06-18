# BBJF Home Translation and Hero Alignment Patch

## Purpose
Fix the home page so Urdu and Sindhi language selection translates the main home page content instead of leaving English text visible.

## Changes
- Added local home-page copy for English, Urdu, and Sindhi in `src/routes/index.tsx`.
- Connected the home page to `useI18n()`.
- Translated:
  - hero badge
  - Digital Membership System title
  - hero description
  - buttons
  - workflow slider titles/text
  - secure review / QR verified badges
  - step cards
  - feature cards
  - scope section
- Improved hero title alignment by rendering title words as clean block lines instead of mixed inline spans.
- Added RTL-aware arrow rotation and title tracking.

## Changed files
- `src/routes/index.tsx`
- `docs/BBJF_HOME_TRANSLATION_ALIGNMENT_PATCH.md`
