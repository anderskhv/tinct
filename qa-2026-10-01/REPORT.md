# Tinct QA pass, 1 October 2026 (production, https://tinct.app)

**Tester setup**
- Browser: Chromium 141 (Playwright 1.56). WebKit is not installed in this sandbox, so every result below is from Chromium.
- Display: run headed, but under a virtual X display (Xvfb) in a cloud container, so you could not watch it live.
- Viewports: desktop 1440×900 and iPhone 13 (390×664, touch, mobile UA).
- Accounts:
  - signed-out guest (fresh profiles on desktop and phone)
  - new test account `ahvelplund+qa20261001@fastmail.com`, signed in on both viewports
  - your own account was not used.
- Audio: Chromium ran with `--mute-audio`. For the Talk retest, Chromium also used a fake microphone.
- Network: all traffic went through the sandbox's HTTPS proxy, which adds a little latency. Slow network was simulated as 400 ms RTT and 400 kbit/s with the browser cache disabled. Offline was simulated with Playwright `setOffline`.
- Screenshots are in this folder. Desktop file names end in `-desktop`; phone file names start with `phone-`.

## Summary

| # | Severity | Issue | Viewport / user | Screenshot(s) |
|---|---|---|---|---|
| 1 | **Blocker** | Opening Chat, Summarize, Primer or Talk jumps the reader to the **start of the next chapter**, and that wrong place is saved | Desktop + phone, guest + signed-in | `summarize-before/after-desktop`, `primer-1/2-*`, `reader-chat-open-desktop`, `phone-chat-jump-1..3`, `qa-talk-*` |
| 2 | Major | After a deep link (`/reader?book=…&chapter=N`), the `chapter` parameter stays in the URL. Reloading later jumps back to that chapter and overwrites the saved place. | Desktop, signed-in | `stale-url-1/2-desktop` |
| 3 | Major | Guest only: each reopen from the library (Continue or desk cover) moves the place **one page forward** | Desktop, guest | `drift-1..3-desktop` |
| 4 | Major | Offline: reloading the reader gives a blank cream page, and the library shows Chrome's "No internet" page | Desktop, signed-in | `offline-reload-desktop`, `offline-library-desktop` |
| 5 | Major | Browser/OS **Back** from a library category, Image credits or a book introduction leaves Tinct entirely, because no history entry is pushed | Phone (also desktop) | `phone-category-drama`, `phone-image-credits` |
| 6 | Major (needs real-device check) | Talk fails: WebSocket to `wss://api.x.ai/v1/realtime` returns HTTP 400. The only feedback is "Voice connection lost. Reconnect to continue.", with no reconnect control and no Talk UI. | Desktop, signed-in | `qa-talk-2-open-desktop` |
| 7 | Major | "+ Add note" does not focus the note box. Typing straight away fires the single-letter shortcuts (Commands palette, chat, play…) and the note text is lost. | Desktop | `reader-note-editor-desktop`, `note-typing-opens-commands-desktop` |
| 8 | Minor | Book introduction: the "Compare with" choice is ignored. The reader opens single-edition, and you must use Menu → Book editions → Show compare. | Desktop, guest | `intro-edition-compare-chosen-desktop`, `reader-frankenstein-compare-desktop` |
| 9 | Minor | Desk card shows stale or contradictory progress ("Chapter 3 · <1%" + "You're in the middle of Letter 1") | Desktop, guest | `reader-after-back-desktop` |
| 10 | Minor | "~7.5 hours left" at <1% read, while the same book says "~6.5 hours to read" (Odyssey: 11 h left vs 10.5 h) | Desktop | `library-desk-hours-desktop`, `qa-add-to-shelf-desktop` |
| 11 | Minor | Contents → Introduction leaves the reader for the library. Its "← Back" and Esc land on the library, not back in the book. | Desktop | `reader-toc-introduction-desktop`, `intro-back-from-reader-desktop` |
| 12 | Minor | Continue from the desk turns off Compare mode (a reload keeps it) | Desktop, guest | `reader-continue-desktop` |
| 13 | Minor | Chapter links count from the first section of the book. `/read/frankenstein/chapter-3` is labelled "Chapter 3" but shows **Letter 3**. `?chapter=8` opens Chapter 4. | Desktop | `deeplink-read-frankenstein-ch3-desktop`, `deeplink-seo-cta-landing-desktop` |
| 14 | Minor | CSP blocks a `data:audio/wav` clip (media-src) on Summarize, Catch me up and Talk. Console error; may break iOS audio unlock. | Both | console only |
| 15 | Minor | Phone typography: very large default text, justified with wide gaps, no hyphenation | Phone | `phone-reader-before-chat`, `phone-compare-on` |
| 16 | Minor | Empty sign-in submit calls Supabase and shows the raw message "missing email or phone" | Desktop | `auth-signin-empty-desktop` |
| 17 | Minor | Footnote popup opens at the top-left of the left page, far from its marker on the right page, and spills outside the page card | Desktop | `qa-fat-footnote-open-desktop` |
| 18 | Minor | Slow 3G: the library hero is an empty dark panel for 10+ s with no placeholder or spinner | Desktop | `slow3g-library-desktop` |
| 19 | Minor | Bad deep links fail silently: `/reader?book=nosuchbook` opens the last book, and `/library?book=moby-dick` does not open the Moby-Dick introduction | Desktop / phone | `deeplink-bad-book-desktop`, `deeplink-library-book-moby-desktop` |
| 20 | Minor | Talk with no microphone shows a raw "Requested device not found" toast | Desktop | `qa-talk-open-desktop` |
| 21 | Minor | Phone: Back with Contents open exits the reader instead of closing the panel | Phone, signed-in | `phone-back-from-reader` |
| 22 | Minor | CSP blocks the Cloudflare Insights beacon on every page (analytics not collected, console error) | Both | console only |
| 23 | Polish | Guest Play shows "Create a free account to **keep** listening" before anything has played; a 401 from `/api/narration/ensure` is logged | Desktop, guest | `reader-audio-playing-desktop` |
| 24 | Polish | Page numbers and page totals change for the same text (54/55 → 56/57; "of 2,887" → "of 3,052") | Both | `phone-reader-*` |
| 25 | Polish | Phone: Play/Menu disappear after the first page turn; the only way back is tapping the book title | Phone | `phone-chrome-hidden`, `phone-tap-title` |
| 26 | Polish | Phone: the librarian orb overlaps the introduction text | Phone | `phone-intro-page2` |
| 27 | Polish | Hamlet: a speaker label is left alone at the foot of a page ("FRANCISCO." on p. 2, his speech on p. 3) | Desktop | `qa-hamlet-reader-desktop` |
| 28 | Polish | Compare footer reads "Original · Original (1831)" | Desktop | `reader-compare-next-desktop` |
| 29 | Polish | Title is "Moby Dick" (no hyphen) in search, cards and the reader | Both | `search-moby-desktop`, `phone-reader-mobydick` |
| 30 | Polish | Desktop introduction: the middle "page" is a large blank panel | Desktop | `intro-frankenstein-desktop-settled` |
| 31 | Polish | Bible: every chapter logs a 404 for `/api/audio-manifest?path=bible/bsb-en/chN/manifest.json` before narration falls back (console noise) | Desktop | console only |
| 32 | Polish | Search empty state "Try another title or author." wraps into a narrow two-line column | Desktop | `search-noresult-desktop` |

---

## Details

### 1. Blocker — Chat, Summarize, Primer and Talk move the reader to the next chapter
- **URL:** https://tinct.app/reader
- **Where:** desktop 1440×900 and iPhone 13; Chromium; guest and signed-in.

**Steps (Primer):**
1. Open Frankenstein.
2. Contents → Chapter 2. You land on p. 42, "We were brought up together…".
3. Click ✧ Primer.

**Steps (Summarize):**
1. Open Chapter 3 and turn two pages (p. 60).
2. Menu → Summarize.

**Steps (Chat):**
1. On Chapter 3 p. 58, open Menu → Chat.

**Steps (phone, fresh guest profile with no chat history):**
1. Open Moby Dick, Chapter 1 p. 7.
2. Menu → Chat.
3. Tap "← Back to book".

**Steps (Talk, signed-in):**
1. Open the Bible, Genesis 1 or Genesis 2.
2. Menu → Talk.

**Expected:** the page does not move. The panel opens over the current page, and closing it returns to the same page.

**Actual:**
- Within about 1 s the reader jumps to the **first page of the next chapter**:
  - Primer at Ch 2 p. 42 → Ch 3 p. 54
  - Summarize at Ch 3 p. 60 → Ch 4 p. 71
  - Chat at Ch 3 p. 58 → Ch 4 p. 72
  - phone Chat at Ch 1 p. 7 → Ch 2 p. 31
  - Talk at Genesis 1 → Genesis 2, and at Genesis 2 → Genesis 3
- The jump is saved: reloading and reopening from the library both open the new chapter.
- The AI answer is still about the previous chapter, so it also covers pages the reader has not read yet.
- Catch me up then lists the new chapter as "YOU ARE HERE".

**Why Blocker:** these are the headline AI features, every use moves the reader's place, and the move is silent and saved. The project's own rule calls losing a reader's place the worst UX failure.

**Console:** `Refused to load media from 'data:audio/wav;base64,…' (media-src)` (see #14). Nothing else is related.

**Code pointer for whoever fixes it:** the menu calls `handleChapterChat('discuss')` (`app/src/lab/LabApp.tsx:4169`). Plain Chat (`handleChat`) jumps too, so the cause is more likely in opening the ask/companion panel than in the chapter request itself.

### 2. Major — The deep-link chapter stays in the URL, and a reload throws the reader back
- **URL:** https://tinct.app/reader?book=odyssey&chapter=2
- **Where:** desktop, Chromium, signed-in.

**Steps:**
1. Open the deep link. Book 2 shows correctly.
2. Turn pages, then use Contents → Book 5 and turn a page (p. 114). The URL still ends in `&chapter=2`.
3. Reload.

**Expected:** you come back to Book 5 p. 114. The URL should be rewritten to `/reader` (or to the current chapter) after the first load.

**Actual:**
- You are back at the start of Book 2.
- The Book 5 position is overwritten: the library desk and plain `/reader` both now open Book 2.

**Console:** none.

### 3. Major — Guest place moves forward one page on every reopen
- **URL:** https://tinct.app/library → Continue
- **Where:** desktop, Chromium, guest. Not reproduced for the signed-in account: three reopens at p. 61–62 stayed put.

**Steps:**
1. As a guest, read Frankenstein to Ch 3 p. 61–62.
2. Go to the library and click Continue (or the desk cover).
3. Repeat step 2.

**Expected:** p. 61–62 every time.

**Actual:**
- The place moves one page per reopen: 61–62 → 62–63 → 63–64 → 64–65.
- The spread also loses its odd/even pairing.
- A plain reload is stable (three reloads, all p. 61–62).
- Likely cause: the right-hand page is saved, then restored as the left-hand page.

**Console:** none.

### 4. Major — Reader blank after an offline reload
- **URL:** https://tinct.app/reader?book=frankenstein&chapter=8
- **Where:** desktop, Chromium, signed-in.

**Steps:**
1. Load a chapter online.
2. Go offline.
3. Turn pages and jump to Contents → Chapter 20. This works.
4. Reload.

**Expected:** the cached reader and book reopen.

**Actual:**
- A blank cream page; no text after 22 s.
- Navigating to `/library` shows Chrome's "No internet" page.
- Back online, the place (Chapter 20) is intact.

**Console:** `net::ERR_INTERNET_DISCONNECTED` for many resources, and "Error while trying to use the following icon from the Manifest: …/icon-192.png".

### 5. Major — Back button leaves the site from library views (phone)
- **URL:** https://tinct.app/ (the URL never changes)
- **Where:** iPhone 13 (same code on desktop), Chromium, guest.

**Steps:**
1. Arrive at tinct.app from another page.
2. Open the menu and pick Drama (or Image credits, or open a book introduction from search).
3. Press Back.

**Expected:** return to the library home, or close the introduction.

**Actual:**
- The browser leaves Tinct and returns to the previous site (`about:blank` in the test).
- Categories also have no URL of their own, so they cannot be shared or bookmarked.

### 6. Major (verify on a real device) — Talk cannot connect
- **URL:** https://tinct.app/reader (the Bible)
- **Where:** desktop, Chromium with a fake microphone, signed-in.

**Steps:**
1. Menu → Talk.

**Expected:** the Talk UI opens and connects.

**Actual:**
- `WebSocket connection to 'wss://api.x.ai/v1/realtime?model=grok-voice-latest' failed: Error during WebSocket handshake: Unexpected response code: 400` (twice).
- A toast says "Voice connection lost. Reconnect to continue.", but there is no reconnect button and no Talk panel appears.
- Talk also triggered the chapter jump in #1.

**Caveat:** traffic went through the sandbox proxy. A plain curl through the same proxy reached x.ai and got 401 (expected without a token), so the proxy does not block the host. Still, please confirm on a phone.

**Without a fake microphone** the toast is the raw "Requested device not found" (#20).

### 7. Major — The note box is not focused, so typing runs shortcuts
- **URL:** https://tinct.app/reader
- **Where:** desktop, Chromium, guest.

**Steps:**
1. Select a phrase.
2. Click Highlight.
3. Click "+" (Add note).
4. Start typing right away.

**Expected:** the text goes into the "Add a note…" box.

**Actual:**
- Focus stays on `<body>`, so the letters act as reader shortcuts.
- Typing "QA note: does this persist?" opened Commands & themes over the note editor.
- Other letters map to Chat, Talk, Play, Next page and so on.
- If you click into the box first, the note saves and persists (it appears under Contents → Highlights after reload).
- Minor extra: the note popup covers the page number.

### 8. Minor — The introduction's "Compare with" choice is not applied
- **Where:** desktop, guest, Frankenstein.

**Steps:**
1. Open the introduction → Pick edition.
2. Set Reading edition = Original (1831) and Compare with = Modern English.
3. Click Begin reading.

**Expected:** the side-by-side compare view.

**Actual:**
- Single-edition Original. The compare edition is remembered, but you must still use Menu → Book editions → Show compare.
- Compare itself works well once it is on.

### 9. Minor — Desk card progress is stale
**Steps:**
1. As a guest, read Frankenstein to Chapter 3. The reader shows 13%.
2. Press Back to the library.

**Expected:** the card shows Chapter 3, about 13%, and "where you left off: Chapter 3".

**Actual:** "Chapter 3 · <1%" next to "You're in the middle of Letter 1."

### 10. Minor — Time-left estimate is larger than the book's total
**Actual:**
- The Frankenstein desk card says "~7.5 hours left" at <1% read; the cover tile and introduction say "~6.5 hours to read".
- The Odyssey shows "~11 hours left" against "~10.5h".
- The two figures are probably based on different editions.

### 11. Minor — Contents → Introduction exits the reader
**Steps:**
1. In the reader, open Contents → Introduction.

**Actual:**
- You are taken to `/library?book=frankenstein&edition=original-en` with the introduction on top.
- "← Back" and Esc both land on the library home, not back on the reading page.
- During the transition a dimmed library briefly shows two tiny white squares in the top-left corner.

### 12. Minor — Continue turns Compare off
**Actual:** with Compare on, a reload keeps it, but library → Continue reopens in single-edition mode.

### 13. Minor — Chapter numbers in links count every section
**Actual:**
- `/read/frankenstein/chapter-3` is an SEO page whose breadcrumb says "CHAPTER 3" but whose content is "Letter 3 of 28 — under sail at last".
- Its "Read this chapter free →" button opens `/reader?book=frankenstein&edition=modern-en&chapter=3`, which is Letter 3.
- `/reader?book=frankenstein&chapter=8` opens Chapter 4.
- Books without prefatory sections are fine: `/reader?book=odyssey&chapter=2` opens Book 2.
- Out-of-range `/read/frankenstein/chapter-999` correctly shows the 404 page.

### 14. Minor — CSP blocks the silent audio clip
**Actual:** on Summarize, Catch me up, Chat and Talk the console logs `Refused to load media from 'data:audio/wav;base64,…' because it violates … "media-src 'self' blob: mediastream`.
This looks like an audio-unlock clip, which matters most on iOS Safari. That browser was not tested here.

### 15. Minor — Phone reading typography
**Actual:** at the default size (1.3) on a 390 px screen, lines hold 3–5 words. Justification leaves large gaps ("There's      nothing") and there is no hyphenation.

### 16. Minor — Sign-in error copy
**Actual:**
- Submitting empty fields sends a request and shows the raw Supabase text "missing email or phone" (the product has no phone sign-in).
- The error appears at the bottom of the card, far from the fields.
- A wrong password shows "Invalid login credentials" and a weak sign-up password shows "Password should be at least 6 characters."; both are fine.

### 17. Minor — Footnote popup placement
**Book:** Fear and Trembling, Preliminary Expectoration, p. 40–41.
**Actual:** the popup for footnote 1 (marker on the right page) opens at the top-left of the left page, covering text and extending past the page edge.

### 18. Minor — Slow 3G library
**Actual:**
- DOMContentLoaded and the controls arrive at about 9.3 s; the full load event at about 19.6 s.
- Until the images arrive, the hero is an empty dark area with no title, Continue button or loading hint.

### 19. Minor — Bad or partial deep links fail silently
**Actual:**
- `/reader?book=nosuchbook` opens the last book read, with no message.
- `/library?book=moby-dick` (no edition) shows the library home instead of the Moby-Dick introduction. `/frankenstein` and `/read/frankenstein` do open the introduction.

### 20–32. Minor and polish items
See the summary table. Each row names its screenshot.

---

## Timings (rough, through the sandbox proxy)

| Step | Desktop | Phone |
|---|---|---|
| Landing → hero interactive | ~1.8 s (network idle 4–6 s) | ~1.7 s |
| Library → book introduction open | <1 s | ~2.1 s |
| Begin reading → text (Frankenstein / Moby Dick) | ~2.3 s | ~2.0 s |
| Begin reading → text (Bible / Hamlet / Fear and Trembling) | ~3.5–3.8 s (slowest) | — |
| Library Continue → text | ~1.7 s | — |
| Reload mid-chapter → text | ~1.6–3.3 s | ~3.8 s |
| Contents → another chapter | ~2.5 s | — |
| Deep link `/reader?book=odyssey&chapter=2` | ~2.9 s | — |
| Explain (AI) | <2.5 s | — |
| Summarize (AI) | ~3 s | — |
| Chat reply | <8 s | — |
| Catch me up (summaries visible) | ~1 s for skeleton, then a few seconds | — |
| Image credits | ~3.3 s | ~3.3 s |
| Play → audio audible (Bible, signed-in) | ~4 s | — |
| Sign-in submit → library | — | ~7 s |
| Slow 3G: library interactive / fully loaded | ~9.3 s / ~19.6 s | — |
| Slow 3G: Continue → text, chapter switch | ~1.3 s, ~1.7 s (served from offline cache) | — |

## What worked
- **Landing:**
  - hero scenes switch via the dots
  - menu with categories and time periods, plus Image credits
  - search by title and by author, with an empty state
  - Featured and category rows
  - "+" adds to shelf; My shelf shows "Currently reading" and "Saved for later"
- **Book introduction:** Preface, Characters (with full gallery) and Pick edition dropdowns all work.
- **Reader paging:**
  - keyboard and arrows on desktop; tap and swipe on phone
  - reload keeps the page, including after theme and font-size changes
  - Contents with read state; Highlights list
- **Selection tools:**
  - Define on a single word (long-press on phone)
  - Explain and Ask
  - five highlight colours; the note saves once the box is focused
  - character card when selecting a name ("Elizabeth Lavenza")
- **Compare:** desktop side-by-side; phone swaps the page to the other edition.
- **Settings:** theme (Book / Light / Dark) and text size, both persist.
- **Signed-in audio:** plays with word highlighting, speed, −15 s and +30 s controls.
- **Guest gating:** Play and Talk show a clear account prompt.
- **Books:**
  - Bible chapters and verses render well
  - Hamlet renders as a script
  - Fear and Trembling footnotes open
  - Moby Dick and Odyssey render
- **Library desk:** recent books show as spines, and Continue works.
- **Cross-device sync:** the phone opens Frankenstein Chapter 3 where desktop left off, about one phone page later.
- **404 page:** bad chapter URLs show the styled page.
