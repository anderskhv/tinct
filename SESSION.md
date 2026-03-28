# Tinct — Session State

## Last session: 2026-03-26 (Wednesday)

### What happened — Build Fix, Deploy Fix, Mobile UI

**1. Fixed hanging build (critical)**
- Build was hanging indefinitely during Rollup rendering phase
- Root cause #1: 3.4GB of audio files (46,016 MP3s) in `public/audio/` — Vite copies all of `public/` to `dist/`
- Root cause #2: 26MB of edition JSONs in `src/data/editions/` being processed by Rollup
- Fix: Moved edition JSONs to `public/data/editions/`, changed `editionLoader.ts` and `useThreads.ts` from `import()` to `fetch()`, moved audio out of `public/`
- Build time: infinite → 1.2 seconds

**2. Fixed deploy (production was serving stale bundle)**
- First deploy appeared successful but production still served old bundle (`index-Bb-wk_yt.js`)
- Old bundle had `/audio` fallback (not R2 URL) → play button was gone
- Second deploy pushed through correctly with R2 URL baked in
- Play button restored

**3. Mobile UI improvements**
- Hamburger menu restructured into 3 grouped sections with headers:
  - **Reading**: Book, Language, Edition, Compare toggle, Table of Contents (new)
  - **Format** (new): Theme, Font size (S/M/L/XL), Font (Garamond/Baskerville/Source)
  - **Account**: Balance, Reading angle (new), Browse books, Sign in/out
- Bottom nav: 4 tabs (Read | Chat | Notes | Cast) — was 3 (Read | Compare | Chat)
  - Compare moved to hamburger toggle
  - Notes and Cast now directly accessible
- Bottom bar trimmed on mobile: shows only percentage, no page count or time remaining
- `useMobile.ts` updated: MobileView now `0|1|2|3` (reader, chat, notes, cast)

**Git:** 1 commit pushed to remote
```
2cc4c02 Move edition JSONs to public/ for static serving, fix build hang
```
Mobile UI changes deployed but not yet committed.

### Known issues
- ~~`tinct/` inner `.git` repo~~ — RESOLVED. Removed inner `.git`, renamed `tinct/` to `app/`.
- The stash test in pre-deploy checklist doesn't work with dual-repo setup.

### What's deployed
- https://tinct.ahvelplund.workers.dev — latest build with all changes
- All 8 smoke tests passing

---

## Previous session: 2026-03-25 (Tuesday)

### What happened — Email, Privacy, Launch Prep, UI Work

**From Group CEO window:**
1. Brevo set up for transactional email (domain verified, DNS auto-configured)
2. Supabase SMTP configured (smtp-relay.brevo.com:587, noreply@tinct.app)
3. 6 branded email templates created with Tinct palette + tagline "A new way to read"
4. Privacy policy generated at `public/privacy-policy.html`
5. Tinct Kids concept doc at `TINCT-KIDS-CONCEPT.md`

**Critical security issues found:**
- `VITE_ANTHROPIC_API_KEY` exposed in client bundle — rename to server-side only, rotate key
- `/api/chat` has no authentication — add Supabase session check
- No server-side rate limiting

---

## Previous session: 2026-03-16 (Monday)

### What happened
- Full strategy conversation → STRATEGY.md + BACKLOG.md created
- Complete Phase 1a architecture built
- Reader, SplitReader, Chat, Notes, Header, ParagraphRenderer all built
- Kindle-style page turning started
- Visual QA: 51 chapter screenshots + 9 interactive tests all pass
