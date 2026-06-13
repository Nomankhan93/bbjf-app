# BBJF PWA Install Prompt Patch v6

## Purpose
Adds a proper install prompt experience like the JAS app prompt, with service worker registration and offline fallback.

## Changes
- Adds `InstallAppPrompt` global component.
- Registers `/sw.js` in production.
- Captures the browser `beforeinstallprompt` event.
- Shows a BBJF install card with Install / Not now buttons.
- Adds iOS Safari Add to Home Screen guidance.
- Adds `/offline.html` fallback page.
- Improves manifest metadata, app shortcuts, and icon declarations.
- Adds mobile web app meta tags.

## Notes
The install prompt appears only when the browser considers the app installable. Requirements include HTTPS, a valid manifest, valid icons, and a browser that supports install prompts. If the app is already installed or the user dismisses the prompt, it will not show again for 7 days.
