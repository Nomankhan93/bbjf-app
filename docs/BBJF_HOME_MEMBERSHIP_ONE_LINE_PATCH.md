# BBJF Home Membership One-Line Patch

## Purpose
Fix the home page hero title so the English word `Membership` stays on one line instead of breaking as `Membershi` and `p`.

## Changed files
- `src/routes/index.tsx`

## What changed
- widened the hero title area
- reduced the title font size slightly on large screens
- added `whitespace-nowrap` to each title line

## Result
The title now shows as:

Digital
Membership
System

instead of:

Digital
Membershi
p
System
