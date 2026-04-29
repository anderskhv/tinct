# Tinct — Session State
**Last updated: 2026-04-29**

> This file is a current-state snapshot, not a changelog. Fully overwrite it at the end of each session. Git log has the history.

---

## Deployed
- **Production:** https://tinct.app
- **Dev URL:** https://tinct.ahvelplund.workers.dev
- **Last confirmed working deploy:** 2026-04-29 evening (Book Onboarding v2 — commit f7b8eeb — 14/14 smoke tests passing — version `d1a99346…`)

## Today's session (2026-04-29)

### Shipped to production
- **Feature Tour** — 10-step coachmark walkthrough that fires once on first sign-up. Fires when `user?.id` transitions null → signed-in (800ms after auth state settles, `tinct-tour-seen` flag prevents repeat). Mobile and desktop have separate orderings to match each platform's actual top-bar / bottom-bar layout. Conditional steps fall away when feature isn't available (anonymous: 3 stops; free: 4; premium: 10). Settings → "Show feature tour again →" replays it. Lives in `app/src/components/FeatureTour.tsx` + integration in `App.tsx`.
- **Bible empty-page bug fixed** — `handleBookChange` and the `bookId`-change effect now clear `primaryData`/`splitData` and set `isLoading=true` synchronously, so the Reader shows a spinner instead of the previous book's stale paragraphs during book-switch.
- **Debug overlay removed** — the always-visible 🐛 button and `DebugOverlay` component deleted.
- **Side-panel content fade-in** on tab change — Chat → Feed → Cast transitions are now visually obvious (240ms fade-in via `key={activeTab}` remount).
- **vite.config:** `host: true` for LAN dev access (test on a real phone).
- **CLAUDE.md compressed** — 461 → 227 lines, decisions log pruned to active policy.
- **6 iCloud sync-conflict duplicate files deleted.**

### Book Onboarding v2 — SHIPPED 2026-04-29 evening
- All 60 books updated to new JSON schema (`acclaim`, `whyItMatters`, tightened `about`). Legacy `preReadingChat` dropped.
- BookOnboarding.tsx refactored to 6 steps: About+Acclaim → Why It Matters → Edition → Cast → Reading angles → Account.
- Edition Compare defaults to inverse-of-primary (was empty).
- AngleChat (AI iteration) replaced with simple card-pick of 4 angle cards + "Just start reading."
- AngleChat helper + handleAngleLockIn retained as dead code in BookOnboarding.tsx — can be deleted in a later pass.
- Live at https://tinct.app — verified Niels Lyhne JSON serves with 3 acclaim + 3 whyItMatters.

### Acclaim quote coverage
- 14 books shipped with verified primary-source quotes (Nietzsche, Freud, Walter Scott, T.S. Eliot, Blake, Cicero, Whitehead, D.H. Lawrence, Rilke, Ibsen, Faulkner, Kaufmann, Simone Weil).
- 46 books shipped with **empty** acclaim arrays — better empty than fabricated.
- A research agent was running at end of session to find verified quotes for the remaining 46. If it returned with results, Anders should review/merge before the next deploy. If not, the empty arrays are safe — the About step renders without acclaim when the array is empty.

### In flight (next session)
- **Landing page update** — Anders wants to bring the new onboarding feel/visuals to the front page. Open discussion for next session.
- **Acclaim follow-up** — apply research agent findings (quotes for ~46 books) once verified. Re-deploy.
- **Cleanup** — delete the dead AngleChat code and the unbuilt manifesto HTML at `Design refs/Account Onboarding.html`.

## Voice calibration (locked for content generation)

For Why It Still Matters items:
- 2-4 word title, declarative
- 2-4 sentence body, plain prose
- **Lead with what the book deals with** (book-focused, descriptive verbs: deals with, asks, follows, takes on, traces, casts off)
- **End with ONE brief contemporary line** — short, low-key, not commentary

Avoid: first-person plural commentary ("we", "many of us"), aphorisms, parallelism for rhythm, "Both. Neither." style two-word openers, steelman bothsidesing, heavy contemporary commentary.

For Acclaim:
- Verified primary-source quotes only — no fabrication, no folklore (e.g., the "Joyce learned Danish for Niels Lyhne" story — actually he learned Norwegian for Ibsen; do not ship)
- 1-3 quotes per book
- Source + context (work, year) where available

## What's Built & Deployed

| Feature | Status |
|---|---|
| 60 public books in registry | Done |
| 3 editions per book (original-en, modern-en, modern-da) | Done |
| Paginated reader + opt-in split pane | Done |
| Side panel: Chat / Feed / Cast | Done |
| Highlights (5 colors), notes, reading journal | Done |
| Audiobook (R2-hosted, paragraph-sync, speed control) | Done |
| Auth (Supabase email + Google OAuth) | Done |
| Billing (Stripe, 30-day trial, Premium $3/mo) | Done — code aligned to $3/mo as of 2026-04-21 |
| Offline mode (DownloadManager + service worker) | Done |
| Android Capacitor build | In progress (`app/android/`) |
| Landing page (`app/public/landing.html`) | Exists; needs update to reflect new onboarding feel (next session) |
| Mobile 5-tab nav (Read / Compare / Chat / Feed / Cast) | Done |
| Dark mode, e-ink mode, font/size picker | Done |
| Cross-device sync (Supabase real-time) | Done |
| Proactive AI insights | Done |
| **Feature Tour** (post-signup coachmark walkthrough) | Done (shipped 2026-04-29) |
| **Book Onboarding v1** (3-step: edition / angle / cast) | Done — being replaced by v2 |
| **Book Onboarding v2** (6-step: about+acclaim / why-it-matters / edition / cast / angles / account) | In flight |

## Known Gaps / Open TODOs
- **Account deletion** — UI stub only, backend not wired (TODO in App.tsx)
- **Audio edition preference** — callback stubbed (TODO in App.tsx ~line 1193)
- **AccountDecision.tsx** — unrendered legacy component, can be deleted later
- **Stripe keys** — verify production checkout still works after env restore

## Git State
Last commit: `0201592 Feature tour — first-time coachmark walkthrough` (2026-04-29).
Uncommitted in working tree at end of session: `niels-lyhne.json` (new schema), and any further book content generated overnight.
