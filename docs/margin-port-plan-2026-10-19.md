# Margin reader for Tinct's own books: preview and port plan (19 Oct 2026)

Anders: "prepare everything to port this experience to the normal desktop and mobile reader — don't do it yet, but give me a /reader link I can test, with the new menu for mobile and margin mode for desktop."

This document covers two things: what the preview does today (branch `claude/margin-preview-books`), and what the real port needs, in phases.

## 1. The preview, as built

**Link:** `/reader?book=<id>&margin=1`, for example `/reader?book=frankenstein&margin=1` or `/reader?book=to-the-lighthouse&margin=1`.

- **Opt-in.** Visiting with `margin=1` stores `tinct:margin-preview=1` on the device.
  - After that, `/reader?book=<id>` opens in the preview, and so does a book opened from the library (the tab's hand-off), until `&margin=0`.
  - `&margin=0` removes the opt-in and opens the normal reader. Sign-out also clears it, through `clearLocalUserData`.
  - Links with their own rules always keep the normal reader: `chapter`, `share`, `heldBook`, `modern`, `session_id` and `userBook`.
  - The Bible is never previewed.
- **Without the flag or opt-in,** `main.tsx` runs exactly as before. `marginPreviewBookForPage` exits after one `localStorage` read and one URL check. Tests in `src/lab/marginPreview/marginPreview.test.ts` cover this.
- **How it renders.** The React app does not mount `LabApp`. It renders `MarginPreview.tsx`, a full-screen, same-origin frame of the margin reader (`/lab/addbook/?tinctBook=<id>`). The address stays `/reader?...`.
- **The text.** The parent page loads the book (`marginPreviewLoad.ts`) and hands it to the frame (`window.TinctMarginPreview.load()`).
  - The text comes from the edition loader (whole file or chapter shards, with patches).
  - The edition is the main edition (option B): the book's saved place's edition, else the reader's main edition, else Modern English.
  - Each edition paragraph becomes one `<p>`. Underscore emphasis is shown as `<em>`, and the word count matches the book reader's tokenizer.
  - `js/tinct-book.js` builds the margin reader's EPUB model from it. `reader.js openRegistered` then opens it as an EPUB with the margin on at every width (`window.TinctEpubMargin`).
- **Desktop (20 Oct):** Tinct paper. The text is set as the book reader's desktop leaf for this reader and window (font, size, line, paragraph gap, alignment, measure: `marginPreviewPaper`), on the theme's paper with no white sheet; it scrolls with the margin column beside it. Aa has a Layout section: Margin, Two-page and Compare, then Back to normal reader.
  - Two-page and Compare open the book reader's deep link at the same chapter, paragraph and word (`/reader?book=&edition=&chapter=&paragraph=&word=&compare=&view=two-page|compare`). `view` and `chapter` are rules of their own, so the preview steps aside for that visit and the opt-in stays; the link's parameters leave the address once read.
  - While the opt-in exists, the book reader's Book editions sheet (desktop) offers Margin, which opens `/reader?book=<id>&margin=1&edition=&chapter=&paragraph=&word=`: the preview at that place, newer than its own; the place leaves the address once read.
  - Only Back to normal reader (`&margin=0`) turns the opt-in off.
- **Desktop:** the full margin layout. That includes cards in the column (marks below 1180 px), the dark selection bar (Ask · Explain · Simplify · … · highlight), More (Define, Fact-check, Related, Counterpoint, Quiz me), the Notebook, margin notes, chapter pills (Primer, Catch me up, Recap, Quiz me, Note), Aa text size and themes, and the contents tree with parts.
- **Phone:** the margin reader's phone UI. That includes the selection bar, bottom-sheet cards, the header pill that opens the chapters, the t menu (Chat, Summarize, Catch me up, Export notes, Library), and Aa.
- **AI.** Requests use the margin routes unchanged (`/api/chat` signed in, `/api/lab-chat` as a guest, the same allowance and guest rules).
  - Each request carries the passage, the chapter around it (`pdf` pages: the chapter before, at and after, up to 9,000 characters each) and the document's part: the current chapter in full plus the contents (`document.part`).
  - It never sends the whole book.
  - No Worker change was needed. The routes take text, not an own-book id.
- **Place.** The preview opens at the book reader's place for that book, read only.
  - The place is the newer of this device's `tinct-lab-position` and a plain `GET /api/lab-position`. Nothing is migrated, merged or written back.
  - From then on the preview keeps its own place in `tinct-addbook:pos:preview:<id>`. The book reader's place wins again only when it is newer.
- **Local only.** The preview's place, highlights (`tinct-addbook:hl:preview:<id>`), notes, cards (`tinct-addbook:cards:preview:<id>`) and primers stay on this device. EPUBs never sync in the margin reader, and the preview key is not an account book.
- **Back to normal reader.** In the Aa panel's Layout section, this replaces "Convert to Tinct book". It opens `/reader?book=<id>&margin=0` in the top window.

**Not in the preview:**
- Listen (narration).
- Talk.
- Cast.
- Compare and the two-page desktop view inside the preview (the Layout switch hands over to the book reader for them).
- The book reader's chat history.
- Reading-year stats.
- Sharing quotes.
- Account sync of anything the preview makes.
- The Notebook on phones (the margin reader shows it on the desktop only).

**Privacy.** No new data category, provider or retention. Registered-book text is not personal data. Questions go through the same chat routes, with the same usage records (counts and cost, no content), so `privacy.html` needs no change. New device-local keys use the existing `tinct-addbook:` prefix, which sign-out already clears.

**Known rough edges:**
- The margin's system prompt still says the document is one "the reader opened from their own files" (`marginContext.ts MARGIN_RULES`). Registered books need their own first line (Phase 2).
- Card labels say "ch. N" by the edition's chapter number. For Frankenstein, "ch. 5" is "Chapter 1".
- The preview draws every chapter in full (`content-visibility: visible`). Without this, estimated heights moved the restored place. Own EPUBs have the same latent race between the first layout's reflow and the place restore. The preview guards against it; own EPUBs still do not.

## 2. Anchors: the mapping plan for shared notes

The two readers already agree on coordinates: chapter number, paragraph index and word index. Word index means the `\S+` words after the `_emphasis_` delimiters are taken out, as in `tokenizeWithEmphasis`.

| Margin reader (preview, EPUB model) | Book reader (`LabHighlight`) |
|---|---|
| `page` (1-based chapter index) | `chapterNumber` = `chapters[page-1].number` |
| paragraph = index in `epubParas(page)` (the chapter's `<p class="tb-p">`, header excluded) | `paragraphIndex` (1:1) |
| character offset in the chapter (`hl.start`/`end`, `card.span`) → `wordSpans(p)` index | `fromWord` / `toWord` (1:1 after conversion) |
| place `pos.para` / `pos.word` | `LabBookPlace.paragraphIndex` / `wordIndex` (1:1) |
| `card` (kind, turns, data) | no counterpart yet: the new "margin card" record |

For the port, the margin reader stores anchors as `{ chapterNumber, paragraphIndex, fromWord, endParagraphIndex, toWord, editionKey }`, not character offsets. Highlights and notes then are `LabHighlight` records, and the same rows (`lab-highlights:{bookId}`) serve both layouts. Cards need one new per-book record keyed the same way. That is a schema decision for Anders: a new synced data category under the existing user-data store, covered by export and deletion.

## Direction (Anders, 20 Oct 2026)

"For mobile it's about building as much as we can on the existing foundation, for desktop it's essentially the same process but here margin reader becomes the default way to read anything with two page and compare mode as the two others."

- **Phone:** the existing React phone reader stays the foundation: its look, typography and tabs. The port adds four things only: the new header menu, the selection bar, bottom-sheet cards (AI answers and notes alike) and the in-text unit pills (Starting … ✧ Primer · ✧ Catch me up; End of … ✧ Recap · ✧ Quiz me · Note). This settles the tabs-vs-t-menu question below: the tabs stay.
- **Desktop:** the margin reader becomes the default layout for every book, Tinct and own. Two-page and Compare are the two other layouts.

## 3. What the real port needs

1. **Shared annotation store and sync.**
   - Highlights and notes: the margin reader writes `LabHighlight` (word anchors) through `useLabHighlights` / `labHighlightSync`, versioned with `commit_user_data` and with tombstones.
   - Cards: a new `margin-cards:{bookId}` user-data row, merged by id with the newer edit winning (the margin reader's `mergeCards` already does this). It must be added to account export and deletion in the same PR.
   - Primers: cached per book and edition from the Worker (`/api/user-books/primers` is own-book only; it needs a registered-book counterpart, or local cache only).
   - One-time import of the preview's local keys, optional.
2. **Position sync.**
   - The margin view writes through `labPositionStore` / `useLabPositionSync` only. It must keep every invariant in AGENTS.md: the coherent tuple, writes suspended while loading or behind overlays, skipping writes on book change, backward writes only after user navigation, and validating against the manifest.
   - The margin view scrolls rather than pages. It needs a `pageIndex` story: derive it from the paragraph, or drop it for margin mode, and leave `readerMode` alone.
   - The dwell and settle rules apply unchanged.
3. **Routing.**
   - `/reader` keeps one entry point. Margin mode is a reader layout choice (desktop: Margin / Two-page / Single; phone: margin menu on or off), stored per device in prefs.
   - It is not a separate page or a frame. The flag and `?margin=` stay for QA.
4. **Integration approach (recommended).** Port the margin modules (`margin.js` placement and HTML, `notebook.js`, the selection bar, `margin-parse.js`) behind a TypeScript facade that the React reader drives, rather than embedding the static page.
   - `LabPassage` renders word spans already, so selection-to-anchor is direct.
   - The column sits in the right-hand panel area on desktop, and bottom sheets replace the phone's Chat tab for passage actions.
5. **Menus.**
   - Desktop: the margin column replaces the side panel's passage answers. Chat, Feed and Cast remain as panels.
   - Phone: the selection bar and bottom-sheet cards replace the current passage popup. The five-tab paradigm (Read, Compare, Chat, Feed, Cast) is a paradigm decision for Anders: keep the tabs and add the bar, or move Chat into the t menu as the margin reader does.
6. **Keep Compare and two-page.** Margin mode is a third desktop layout. Compare and two-page remain, and the margin cards hide or fold while Compare is open.
   - Paragraph sync stays chapter-scoped.
   - Switching layout keeps the place (paragraph and word), per "Reading position is sacred".
7. **Companion.**
   - A registered-book margin context: `bookId` validated against the catalogue, so the margin system prompt names the book and edition.
   - Use the book reader's chapter context (reading trail, angle) where useful.
   - Keep the guest and allowance rules.
8. **Tests.**
   - The position invariant suites run against margin mode.
   - Anchor round-trip tests (character offsets → words → character offsets) per book, including emphasis, verse lines and plays (`-lines.json`).
   - Sync merge tests for cards.
   - Playwright: desktop 1440×900 and 1280×800, phone 390×844 and 360×740, for Frankenstein, To the Lighthouse, Hamlet (verse lines) and the Bible (excluded today), with AI mocked.
   - `margin-check` modes for the reader.
9. **Risks.**
   - Position regressions: the highest risk, given the history.
   - Plays and verse lines: the preview shows them as plain paragraphs; the port must use `-lines.json`.
   - The Bible's size: 1,189 chapters. It needs windowed rendering, not the whole book in the DOM.
   - Performance on long books on phones, because the preview renders every chapter.
   - Two-device conflicts on cards.
   - Prompt cost: chapter-sized parts are fine; never send whole books.
   - The five-tab paradigm change.
   - Merge conflicts with in-flight margin branches: unit marks (`claude/unit-bar`), desktop PDF default (`claude/desktop-pdf-margin`).

## 4. Phased plan

| Phase | Scope | Estimate |
|---|---|---|
| 0 | This preview: flag, frame, local-only, checks | done |
| 1 | Anchor layer: margin reader stores word anchors; adapters both ways; round-trip tests; preview switches to them | 2–3 days |
| 2 | Companion: registered-book margin context (book named in the system frame, validated `bookId`), primer cache for registered books | 1–2 days |
| 3 | Shared store: highlights and notes through `LabHighlight` sync; `margin-cards:{bookId}` row (Anders: schema, export, deletion, privacy check) | 3–4 days |
| 4 | Desktop margin layout inside the React reader (facade over margin modules), layout switch with Compare and two-page kept, position through `labPositionStore` | 5–7 days |
| 5 | Phone: selection bar, bottom-sheet cards, chapter controls in the React phone reader; decision on tabs vs t menu | 4–6 days |
| 6 | Plays and verse lines, the Bible (windowed), performance pass, full Playwright matrix, staged rollout behind the per-device layout choice | 3–5 days |

Total: about 3–4 weeks of focused work, with the Phase 3 and Phase 5 decisions going to Anders before they start.

## 5. Files (preview)

- `app/src/lab/marginPreview/marginPreviewFlag.ts`: the flag and opt-in decision.
- `app/src/lab/marginPreview/marginPreviewModel.ts`: edition to text model, edition choice, place mapping.
- `app/src/lab/marginPreview/marginPreviewLoad.ts`: read-only load.
- `app/src/lab/marginPreview/MarginPreview.tsx`: the frame.
- `app/src/main.tsx`: one hook before the book reader renders.
- `app/public/lab/addbook/js/tinct-book.js` (the mirror in `addbooks/web/src` was removed on 22 Oct 2026).
- Small hooks in `reader.js`, `route.js` and `start.js`, plus `index.html` cache tags.
- `app/scripts/check-margin-preview.mjs`: the Playwright check.
- `app/vite.config.ts`: dev serving of `/lab/addbook/`.
