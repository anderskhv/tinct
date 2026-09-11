# V2 contents proposal — 8 September 2026

**APPROVED:** Anders approved the final refined design and requested implementation in **Move coding to Codex**. The authoritative handoff is [docs/design/v2-contents-approved/README.md](design/v2-contents-approved/README.md). This supersedes all earlier review-only / pending-approval statements below, which remain as exploration history.

Design only. Based on `codex/lab-convergence` at `3888548d`, on branch `codex/v2-contents-design`. No production component changes or deployment are authorized until Anders chooses a design. V1 and the approved chat “Back to book” action remain unchanged.

## Recommendation

Visual refinement: Anders preferred the fast navigation direction and asked for a more polished, compact appearance with no fluff. Latest presentation is `tinct-contents-refined.html`. It preserves the interactions of `tinct-fast-contents.html`, with a small centered Bible title, a single prominent book heading, compact Jump to control, fine tab indicator, restrained current-chapter accent, simple Lucide icons, inline discussion titles without repeated metadata, italic highlight excerpts, and a one-line reading-location footer. Chapters no longer repeat “Unread”; read checks/current status and accessible labels preserve state. Full chat/highlight views retain source, dates and excerpts. At 390px, the initial view shows chapter 44 and both chats/highlight plus chapters 45–50. Functional browser checks passed, including narrow dark mode at 320px, with no errors or overflow. Screenshots are `refined-contents.png`, `refined-chats.png`, `refined-jump.png`, `refined-search.png`, and `refined-dark.png`. This is still a design proposal; no app source or production changes.

Latest direction: Anders prefers the current contents UI. The concrete problem is the amount of scrolling from late chapters such as Genesis 44 to other chapters/books; he also wants to recognize past discussions, see highlights, and search words. Refine the current hierarchy instead of replacing it. No implementation approval has been given.

Current prototype: `tinct-fast-contents.html` in the visualization directory. It opens on Genesis 44 in a 390px mobile surface with a bounded scrolling body; navigation and the current-location footer remain outside that scroll. This scroll is intentional so the key interaction can be evaluated realistically.

- Keep The Bible header and All / Chats / Highlights filters.
- Pin a book chooser and chapter jump control above the content. Book selection opens a searchable list grouped by Testament. It changes the browsed book without changing the actual reader position.
- Chapter jump offers direct numeric input (explicitly opens that chapter) plus a vertical list of ten-chapter ranges (moves the contents list without changing reader position). No grids. Search also accepts references such as `Genesis 7` or `John 3`.
- On opening, reveal the actual current chapter. Keep “You are reading · Genesis 44 · page 2 of 4” at the bottom; it restores the tree's focus at any time.
- Show a conversation's actual question, date and message count beneath the relevant chapter. Limit inline expansion and provide an explicit additional-conversation action. Chats gathers richer excerpts across the selected book, newest first. Highlights shows quoted text and notes across that book.
- Search is explicitly across The Bible: chapter references, passage text, chat messages, highlight text and notes. Group results by kind and emphasize matched words. The prototype searches sample records only. Inspection of both the branch base and `28dc4daf` confirms current search covers chapter titles, highlight notes, and chat messages; passage/highlight text search is additional implementation work. It needs a retrieval/index strategy, not just a presentation change. Exact passage/verse landing is also not implemented by the sample.
- Preserve the overview scroll/filter/query when returning from a conversation or highlight. The approved Back to book action remains unchanged.

The prototype uses sample progress and discussions, no account access or storage writes. Browser checks covered pinned controls during scrolling, switching from Genesis to John without moving the saved location, range browsing without moving it, direct chapter 7 navigation, exact conversation preview and return, word search, search filters, reference navigation, and narrow dark mode. No JavaScript errors; no horizontal overflow at 320px. Screenshots: `fast-genesis44.png`, `fast-chapter-jump.png`, `fast-chats.png`, `fast-search.png`, `fast-dark-320.png`.

### Earlier exploration

Status update: Anders requested five mobile concepts after rejecting grids and the desktop presentation. No design has been selected. The earlier proposal below is exploratory, not approved. The current comparison is `tinct-five-mobile-concepts.html` in the same visualization directory. It offers Book tree (one expandable hierarchy), Book index (sequential drill-down), Your place (current-location-first), Notebook (inline chapter annotations), and Go to (search with recent places). All use lists and are constrained to phone width. Browser checks passed for each at 390px and 320px, including dark mode and representative navigation, with no JavaScript errors or horizontal overflow. The five concepts use sample state and do not change app code.

Open an opaque paper surface immediately below the desktop chapter pill, aligned with its left edge. Use a subtle shadow and no background blur or full-page scrim. Keep the reader legible around it. On narrow screens, use a full-width contents surface with the same hierarchy.

Keep “You are here · Genesis 3 · page 2 of 4” visible above navigation. This represents the actual reader location, independently of which book the user is browsing. Clicking it restores the contents selection to the current book/chapter without writing a reading position.

Desktop: book index on the left, chapters on the right. Mobile: open directly at the current book's chapters; “All books” replaces the chapter area with a searchable index. Group the index by Testament without forcing navigation through category levels. Include all 66 books; collapse long groups initially, with an explicit expansion action and search across hidden entries.

Use vertical chapter rows only. Anders explicitly rejected grids. Each row shows chapter number/title and a written reading status; the current row has a quiet left rule and paper tint. Conversation and highlight counts sit directly beneath the relevant chapter. Keep the separate overview views for scanning longer conversations and highlights. The prototype shows eight chapter rows initially, with a control to reveal the remaining chapters; production should use a bounded scrollable list that opens at the current chapter.

Separate Chapters, Conversations and Highlights within the selected book. Conversation rows show source chapter, date, a short title, preview and message count. Highlight rows show quoted text and source location. Counts refer to the selected Biblical book, not the complete library or Bible. Selecting another book only browses; selecting a chapter or passage is an explicit reader navigation. Opening a conversation must target that exact stored conversation. Preserve the approved “Back to book” action.

## Prototype

Interactive fragment: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a08045-d8cd-7fe2-9ea7-1d0d250c6270/tinct-contents.html`.

Sample state: Genesis 3, page 2 of 4, two finished chapters, two conversations, three highlights. All interaction stays in memory. Chapter selection demonstrates navigation and closes the surface; it does not load an edition. No real account data or reading position is accessed. The host design controls offer phone sizing.

“Dot-dash” remains unconfirmed; the prototype does not assume a special encoded navigation language. A current-position dash and completion checks are provisional, visible progress marks.

## Integration findings and requirements after approval

- `LabPhoneBibleTree.tsx` currently owns nested hierarchy, annotations and conversation previews. It is shared; introduce a separate V2-only presentation selected by `chromeV2`, preserving the V1 path.
- `labBibleTree.ts` provides structural nodes and chapter mappings; display local chapter numbers but navigate using the existing sequential Bible chapter number.
- `LabApp.tsx` owns the chapter callbacks. Keep `browseToChapter(number, 'start')` while listening and `goToChapter(number, 'start')` otherwise. Highlight navigation must retain its paragraph anchor. This proposal does not edit either callback.
- The inspected base passes `readLabTalkHistory(biblicalBook)` into contents, so cross-book conversation counts require a deliberate book-scoped history adapter. Do not show fabricated zero counts for unloaded history.
- The inspected base's `onOpenConversation` callback discards the selected conversation and simply opens chat. Exact-thread restore must be connected deliberately after approval; do not imply the design alone fixes this.
- `finishedChapters` provides completion, not authoritative partial progress. Show “current” independently from completion; never infer “read” from reaching a later chapter. Only show partial percentages where validated progress exists. Distinguish unavailable progress from unread.
- Preserve pending position tuples and overlay write guards. Browsing contents, switching overview tabs, opening/closing and search must never write reader state. Do not use this design work to alter audio, chat overflow, loading, edition-change or voice behavior.
- Desktop surface: Escape/outside click closes, focus returns to its trigger, no modal focus trap or backdrop over the reader. Mobile surface: modal semantics, contained focus and scroll, Escape/close returns to trigger. Maintain 44px touch targets, current-state labels and visible keyboard focus.
- For ordinary books, omit the Biblical book index and show their existing chapter titles. Library Houses → Shelves → Books remains the library taxonomy.

After implementation approval, run focused navigation and V1-isolation regressions, app tests, build and bundle verification. Deployment remains explicitly deferred until design selection and authorized implementation.

## Prototype verification

Browser verification passed at 1024, 736, 390 and 360px outer widths with no horizontal overflow or JavaScript errors. Inspected desktop, mobile and dark-mode screenshots. Exercised conversation preview/Back to book, book search, all 150 Psalms chapter targets, browsing without moving the current location, and explicit selection of Psalm 119. Screenshots are beside the fragment (`contents-1024.png`, `contents-390.png`, `contents-dark.png`). This verifies the standalone sample interactions, not production reader persistence. No app build or deploy was run because no app code changed.

Revision: grids and the grid/list design control removed at Anders’s request.
