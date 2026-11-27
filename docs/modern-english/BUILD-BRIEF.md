# Modern-English page and free reading mode: build brief (2026-11-18)

Anders approved both mockups on 18 Nov 2026. Build them unlisted and **do not launch**: Anders decides when the page goes live and when the ads and Reddit posts start.

## Mockups (in the repo)

- **The page:** `docs/modern-english/poc/`
  - `index.html` is a working proof of concept. Open it in a browser.
  - `build.py` generates it.
  - `books.json` is the book list it was built from.
  - `shots/` holds the reference screenshots: desktop and phone, top of page, full page, and search.
- **The free reading mode:** `docs/modern-english/free-reader/`
  - `p-modern.jpg`, `p-original.jpg`, `p-menu.jpg`: phone.
  - `d-modern.jpg`, `d-both.jpg`: desktop.
  - `index.html` puts them on one sheet.
  
  These are screenshots of the live production reader with the changes applied on the page, so the type, layout and pagination are the real reader's.
- **Background:** `docs/modern-english/CONCEPT.md`, including "Anders's decisions".

## 1. The page: `/modern-english`

A static page served like `/try`. It's free and sells nothing: no sign-in, no Premium, no Tinct pitch.

- **Look:** the library's dark room.
  - **Background:** the Meditations scene, heavily blurred and darkened (`public/lab/library_2/assets/scene-meditations-{wide,phone}.jpg`).
  - **Covers:** `/covers/v2/{id}.webp`.
  - **Fonts:** Playfair Display for headings, EB Garamond for book text, system UI for chrome.
- **No top bar.** The page opens straight on the headline.
- **Headline:** "100+ classics in modern translation. Free."
- **Subline:** "The original, or its classic human translation, is always one tap away."
- **Search:** "Search by title or author". Results drop down as you type, each showing cover, title, author and source. Arrow keys and Enter work.
- **Two rows of pills under the search,** each scrolling sideways on a phone and never wrapping:
  - **Category:** Philosophy · Drama · Fiction · Poetry · Politics.
  - **Period:** Ancient, before 500 · Medieval, 500–1500 · 1500s–1600s · 1700s · 1800s · 1900s.
  - **Behaviour:** pick at most one per row. A pill filters the shelves and scrolls to them; tapping it again clears it.
- **No pile of covers** (Anders, 20 Nov 2026: "the rhs adds nothing"). The headline and the search run across the page; the shelves carry the covers.
- **Shelves:** in the library's house order and names, with covers in rows that scroll sideways. Each card shows the cover, the title, and the source in italics: "from George Long, 1862", or "from the original" for books written in English.
- **One quiet line at the end:** "Made with AI from the original, or from the older translation named under each book. A way in, not a scholarly translation. Free to read, in both versions."
- **Footer:** Privacy · Terms · Credits · About Tinct (the last goes to `/try`).
- **The book list comes from the registry when the page is built,** not hard-coded. It includes every book whose `modern-en` edition is live: not held, not withheld, not local-only. Today that's 103. The source comes from the `original-en` edition's `translator` and `year`.
- **Every book link** goes to the free reading mode at chapter 1 in Modern English: `/reader?book={id}&mode=free&ref=modern-english`. If the reader already has a saved place in that book on this device, open it there instead.
- **Until launch:** `noindex`, not in the sitemap, and nothing links to the page. Signed-in readers may see it.

## 2. Free reading mode (`mode=free`)

The existing reader with everything that asks for something taken away. Reuse what you can of the `/try` demo mode.

**Phone** (`p-modern.jpg`, `p-original.jpg`, `p-menu.jpg`):
- **Top bar:** unchanged. Book picker · chapter chip · T menu.
- **Bottom band** where the page counter sits today: an **Original | Modern** pill in the centre and the page number alone ("40") on the right. The text stops above the band.
- **No Both** on phones.

**Desktop** (`d-modern.jpg`, `d-both.jpg`):
- **Top bar:**
  - **Left:** back arrow, which goes to `/modern-english`.
  - **Centre:** book · chapter, as today.
  - **Right:** **Original · Modern · Both**, then the T menu.
- **Both** is the reader's existing side-by-side view.

**T menu:** ~~Appearance (Aa lives here), Book settings and Library only.~~ Changed 27 Nov 2026 (Anders approved the mockup): Summarize this chapter and Catch me up; a rule; Appearance and Book settings; a rule; the way back to the page the reader came from, named for it ("Modern English classics" for `ref=modern-english`, "Klassikere på nudansk" for `ref=nudansk`, "Shakespeare" for `ref=shakespeare`; "Library", to the full library, when the address names no such page), then Create profile (the sign-up sheet, which returns to the same address). The rows are the normal menu's own, with no counter and no selling line. The two AI rows are each one of the device's 10 free AI actions (a card already made opens again uncounted); once the 10 are used they open the account sheet. The back arrow goes to the same page as the way back.

**Removed in this mode:**
- Play and audio, Notebook, and the Aa button in the bar.
- Primer, Summary, Quiz me, Catch me up, Read with an angle, Chapter note.
- The "Highlight any passage" hint.
- From the T menu: Chat, Talk, Notebook, Audio settings, AI settings, Reading angle, Profile (Catch me up is back since 27 Nov 2026, above).
- ~~Selecting text offers Copy only: no Explain, Simplify, Ask or highlight.~~ Changed 26 Nov 2026 (Anders, "give them 10 free basically?"): selecting text offers what it offers a guest in the normal reader, AI included, on the device's 10 free AI actions (shared with the normal reader); Talk and dictation stay out.
- Sign-in, Premium and "keep your place" prompts, except the account sheet once the 10 free AI actions are used.

**Source line** in the single-edition views, under the chapter heading in small UI type. Example: "Modern English made with AI from George Long's 1862 translation · Report a passage". There's no line in Both, where the column labels already say it. If the reader has no report path today, leave "Report a passage" out and say so in the PR.

**Rules:**
- ~~**No AI requests at all** from this mode.~~ Since 26 Nov 2026 only the guest companion (`/api/lab-chat`) for selection actions; since 27 Nov 2026 also the chapter's summary (`/api/lab-chapter-notes`) and the recap of earlier chapters (`/api/lab-catch-up`) for the T menu's two AI rows, sent with no account attached and metered by the Worker as for any signed-out reader; still no narration.
- A visitor signed in on the device gets the normal reader at the same address without `mode=free` (26 Nov 2026).
- **Keep the reader's place.** Switching edition keeps the place, on the same line. Every reading-position invariant in `AGENTS.md` still applies.
- **The place stays on the device:** saved there so a reload continues where you left off, and never written to an account. If the visitor signs in later, the normal reader takes over as it does today.

## Out of scope for now

The Danish page (`/moderne-dansk`), ads, Reddit, signed-out listening, `freepubs.fyi`.

## Done when

- `/modern-english` and the free mode match the mockups at 1440, 980 and 390 wide. The PR includes screenshots.
- **Search works,** and **the pills work alone and together.**
- **The edition switch** keeps the place, on phone and desktop.
- **A test proves free mode makes no AI or narration requests.**
- **No account writes,** and **no sign-in or Premium prompt appears.**
- **`npm test` and `npm run build` pass.**
- **The PR is open, and nothing is deployed** until Anders says so.
