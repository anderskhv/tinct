# Tinct — Session State
**Last updated: 2026-04-21**

> This file is a current-state snapshot, not a changelog. Fully overwrite it at the end of each session. Git log has the history.

---

## Deployed
- **Production:** https://tinct.app
- **Dev URL:** https://tinct.ahvelplund.workers.dev
- **Last confirmed working deploy:** 2026-04-21 (mobile selection popup + audio player cleanup)
- All 10 smoke tests passing

## Last session changes (deployed 2026-04-21)
Five mobile/audio fixes live in production:
1. Mobile selection popup now sits close to the text (viewport-clamped) instead of pinned to the bottom of the screen. Native Safari edit menu is suppressed via `selection.removeAllRanges()` on mobile after our popup is captured.
2. Added **Copy** action to the selection popup (between Issue and Share).
3. Removed the duplicate bottom-bar play button — audio controls live only in the top AudioStrip now.
4. Removed the "Now playing · chapter · preview text" block from the AudioStrip (was stealing vertical space).
5. Fixed audio page-follow (mobile + desktop): reader now re-engages auto-follow on every new paragraph instead of staying stuck once the user manually turns a page.

## Current Sprint
**Design refresh** — rebuilding landing page and reader UX to match new design system.
- Design refs: `Design refs/Tinct Landing v2.html` (landing) + `Design refs/Reader Variations.html` (reader)
- Canonical reader layout: Variant D "The Hybrid"
- New palette + fonts to apply globally (see Design Direction in CLAUDE.md)

## What's Built & Deployed
| Feature | Status |
|---|---|
| 33 public books (bookRegistry.ts) | Done |
| 3 editions per book (original-en, modern-en, modern-da) | Done |
| Paginated reader + split pane | Done |
| Side panel: Chat / Feed / Cast | Done |
| Highlights (5 colors), notes, reading journal | Done |
| Audiobook (R2-hosted, paragraph-sync, speed control) | Done |
| Auth (Supabase email + Google OAuth) | Done |
| Billing (Stripe, 30-day trial, Premium $3/mo) | In code as $5/mo — needs update |
| Offline mode (DownloadManager + service worker) | Done |
| Android Capacitor build | In progress (app/android/) |
| Landing page (app/public/landing.html) | Exists, being redesigned |
| Mobile 5-tab nav (Read/Compare/Chat/Feed/Cast) | Done |
| Dark mode, e-ink mode, font/size picker | Done |
| Cross-device sync (Supabase real-time) | Done |
| Proactive AI insights | Done |

## Known Gaps / Open TODOs
- **Pricing code still says $5/mo** — PricingModal.tsx + landing.html both need update to $3/mo
- **Account deletion** not wired backend (UI stub only, TODO in App.tsx)
- **Audio edition preference** callback stubbed (TODO in App.tsx ~line 1193)
- **Stripe keys** not in .env (commented out) — production checkout needs re-verify
- **landing.html** shows 25 books, missing 8 from registry; still uses gold accent (#8b6b3a)
- **Mobile UI changes** from 2026-03-26 were deployed but not committed to git — check git status

## Git State
Last commit: `2cc4c02 Move edition JSONs to public/ for static serving, fix build hang` (2026-03-26)
Mobile UI changes deployed but possibly not committed — run `git -C /Users/andershvelplund/Documents/Projects/Tinct status` to verify.
