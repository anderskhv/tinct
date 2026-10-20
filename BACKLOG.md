# Tinct — Backlog

**Last updated:** 2026-10-20 (cleaned up: April-era sprint notes removed; their history is in git and DECISIONS.md)

Order of sections: what is being built now, what is approved and waiting its turn, concepts waiting for Anders, then later ideas. Live decisions are in DECISIONS.md; product positioning is in STRATEGY.md.

> **Language:** English is the delivery strategy (STRATEGY.md, 21 Sep). Danish is offered book by book through `OFFERED_DANISH_EDITIONS` (6 books on 20 Oct). A full Danish plan is waiting for Anders (below).

---

## Now — margin reader launch (updated 2026-10-20)

In order. Decisions are in DECISIONS.md (20 Oct rows).

1. **Night run 20→21 Oct** — desktop margin view: place writes back to the account; highlights/notes shared with the normal reader and phone; margin cards stored in the existing chat history; Listen in margin view.
2. **Phone launch to everyone** — today's reader + selection bar, chapter pills, cards (#502), on Anders's go after he tests `?margin=1`.
3. **Margin view as the desktop default** — books in progress keep their layout; newly opened books start in Margin. iPad by width (landscape desktop layouts with Margin default, portrait phone reader with cards).
4. **Notebook in the chapter pill** (phone + desktop): Contents · Notebook, book order with a Recent switch, quiz entries show the reader's own answers.
5. **Aa / t port** (approved mockup claude.ai/artifact/5uCBTerCmkccmf7Xbdx6PV): Aa = Layout, Theme, type, Advanced; t = Chat · Talk, Summarize, Catch me up, Reading settings, Profile.
6. **Talk and Cast in margin view.**
7. **Paste any text** — "+ Add → Paste text": keep formatting from clipboard HTML or Markdown (headings, lists, emphasis, quotes, links); strip page chrome by rule with start/end trim handles; title/author prefilled; stored as a private own book read in margin view with sections, marks, primer and quiz. Proposed: fixed-width allowed only inside pasted preformatted blocks; rule-based clean-up first (AI clean-up later if needed). One privacy-notice line. ~1–2 days.
8. **Library card OCR progress** (ownOcrShelf.ts / library_2).
9. **Later / on request** — phone scroll mode (Advanced: Pages / Scroll, ~2–3 days); page flips in margin view (~1 week); latency measurement vs Gloss; one-tap mutual invite link (needs a privacy line).

---

## Next — approved or briefed, waiting their turn

1. **Margin answer quality** — the open items in `docs/margin/FIXES-2026-10-16.md` (lost superscripts in PDF text, table misreads, the search-outage message, leaked pipeline wording, Go to page mapping, fiction Counterpoint template, caption selection, phone Simplify outliers). Retest with `docs/margin/test-battery/` after each release train.
2. **Invite a friend by email** — email, optional book suggestion and note; the friend joins from the email, both follow each other, and lands in the returning-reader library with the book on the table. New profiles default to Followers and the leaderboard on. Brief: `docs/social/INVITE-BY-EMAIL.md`; mockups claude.ai/artifact/WH78ShdjsqfYdxJGmr4uL6. Waiting for Anders's go on the mockups; needs a schema change (invites, opt-out list). Replaces "one-tap mutual invite link" in Later.

## Concepts waiting for Anders

- **Groups** (parked 16 Oct, after Invite a friend) — a Groups row under Leaderboard, shown only when you are in a group; "Start a group" at the foot of the Leaderboard. A group is a name; anyone in it can invite by link or from people they follow, with an optional book suggestion and note. Invitees sign up, join automatically and land on the group page, which ranks members by this week's reading. With no group book, "Choose from the library"; the group book sits on every member's desk. No search, no public groups, no entry from books. Mockups claude.ai/artifact/4nkLtkTZXwCiTaZb4CYEhm. Open: who sets the group book, invites to existing readers as accept/decline.
- **Danish** — plan and options in `docs/danish-plan-2026-10-19.md`: (1) editions only, (2) editions plus a companion that answers in Danish (recommended), (3) plus Danish public-domain books in search (2,520 Danish works are in the catalogue but filtered out: `IMPORT_LANGUAGES = ['en']`), (4) a Danish interface (no i18n system yet; several days of code). 95 books have old Danish on disk; 29 are stale against repaired Modern English, 9 withheld as defective, 15 missing. Needs Anders to reopen the scope in STRATEGY.md.
- **Linked notes folder for Chat and Ask** (parked 20 Oct) — desktop Chrome/Edge, read only, a local Markdown folder with subfolders; the 2–3 most relevant passages go with a Chat or Ask question and are named under the answer. About two days, no schema change. `docs/notes-sync/LINKED-FOLDER.md`. The full two-way Obsidian plugin concept (`docs/notes-sync/CONCEPT.md`, mockups claude.ai/artifact/Q8SPLYDsXaY2oTQGL65xqs) is parked behind it.

## Later

- **Apple sign-in** — Apple Developer Program and Supabase configuration.
- **Android** — Play Store submission (listing drafted in `PLAY-STORE-LISTING.md`); e-ink and physical page-turn buttons.
- **Reading angle iteration** — after picking an angle, a short conversation before reading (logged in CLAUDE.md as future).
- **Flashcards and spaced repetition** from highlights and notes (Premium).
- **Education** — teacher page, classroom pricing, a progress view for teachers.
- **Reading statistics and streak reminders** — beyond This week and the leaderboard.
- **Performance and hosting audit items** (CLAUDE.md "Open Audit Items"): private R2 bound to the Worker, WebP hero images, lazy-loaded panels, minified JSON.

## Dropped

- Book Onboarding v1/v2 sprint notes and the April landing-page update: they belonged to the legacy React reader, deleted on 30 Sep (DECISIONS.md).
- Danish style guide, second-pass Danish proofreading and German as an expansion language: retired on 21 Sep; any language work comes back through the Danish plan above.
- Bionic reading mode and 3+ translation comparison: no current demand.
- "Export highlights/notes as Markdown": shipped as the margin reader's Notebook download (19 Oct); a library-wide export belongs to the notes concepts.
