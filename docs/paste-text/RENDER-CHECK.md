# Render check: would the expected outputs read well in Tinct today?

Date: 2026-10-21. Reader code: production tinct.app (build `mvi1ofzu`). Converter: `app/src/lab/userBook/epubEdition.ts` on `origin/main` @ `23fe79372` (rules 7). No app code was changed; nothing was committed, pushed or deployed.

## Method

1. **17 cases** chosen for hard shapes: news-bbc, essay-longform-pullquote (figure, scene break), substack-subscribe-widgets (footnotes), wikipedia-en (dense links, figures, lists), poem-verse (verse + indentation), play-script, pdf-academic-paper, docs-list-heavy (nested and lettered lists, code block, callout), markdown-obsidian (callouts, table, task list, nested list), email-newsletter-txt, reddit-thread, recipe-page, news-dr-danish, rtl-snippet, long-chapter-15k, tiny-paragraph, tables-data.
2. **EPUB 3 per case**, built from `expected.md` by a small Python builder (`zipfile`, PIL for placeholder pictures). One XHTML per `##` section, nav TOC, title/author/subtitle/language from the front matter. Mapping: `###` → `h2`, prose → `p`, consecutive lines → `p` with `<br/>`, lists → nested `ul`/`ol` (`type="a"` for lettered), `>` → `blockquote` (a bold first line becomes its own `<p><strong>`), fences → `pre><code class="language-…">`, GFM tables → `table/thead/tbody`, `* * *` → `<hr/>`, `![…]` → `figure` with a local placeholder JPEG and `figcaption`, `### Notes` → `section epub:type="footnotes"` with `aside` notes, `<!-- dir=rtl -->` → `dir="rtl" lang="he"`. Poem indentation came from `input.html`'s `i0–i3` classes (`<span class="iN">` per line).
3. **Conversion.** Each EPUB was converted with the real `convertEpub()` from `origin/main`, run unchanged in headless Chromium (types stripped on the fly). The resulting `UserBookEdition` is exactly what the own-book path stores.
4. **Rendering: a deviation from the brief.** The plan was to upload each EPUB with the test account. It could not be done. **`profile3` (and `profile4`) were signed out**: there is no Supabase session, and Add a book redirects to `/sign-in`. I did not have the password and did not touch `profile`/`profile2`. Instead, each converted edition was shown in the **real production readers** by standing it in for a built-in book's edition JSON. This was a Playwright route in a fresh, anonymous scratch profile, for `/data/editions/candide-*.json`, with service workers blocked. It was client-side only: nothing was written to any account, and no own books were created, so there was nothing to delete.
   - Desktop 1440×900: `/reader?book=candide&margin=1`, the **margin view** of an edition (`public/lab/addbook/js/tinct-book.js`). This is how an edition-shaped own book, which a paste will be, reads in the margin view.
   - Phone 390×844, touch: `/reader?book=candide`, the **Tinct reader** (`lab-hearing-line`, which paints `kinds`, links and figures).
   - The header shows the host book's name ("Candide"), and Primer, Recap and Quiz were not exercised, because they would answer about Candide. Section titles, paragraphs, kinds, links and figures are the case's own.
   - **Still unverified:** the desktop margin view of an *uploaded EPUB*. That path renders the EPUB's own XHTML through an allow-list (`public/lab/addbook/js/epub.js buildChapter`), not the edition. Reading that code: it keeps `table`, `pre`, `code`, `blockquote`, nested `ul`/`ol` (with `start`), `strong`, `dl`, figures and links. It drops `ol type="a"` (lettered lists become numbered), `dir`/`lang`, and indentation classes. It marks `poem|verse|stanza|line` classes as `ep-verse` and footnote classes as `ep-note`.
5. Screenshots: first page, the page with the hard element, and the end, on both devices. `checkLayout` (from `layout-check.mjs`) ran on every frame of every shot. Contact sheets are in `render/<case>.jpg`: the top row is the phone (first / hard / end) and below it is the desktop margin view (first / hard).

Look check: both readers paint on paper `#ece7db`. The body face is **Literata** (with EB Garamond as fallback), not EB Garamond. The phone chapter title is Playfair Display. In the margin view the chapter title is a 19px bold serif and the text is about 15px. No monospace leaked anywhere (0 monospace elements, including in code). **`checkLayout`: 0 findings on all 102 shots.** There was no overflow, clipping or off-screen element, because nothing wide survives conversion to overflow.

## Verdicts

good = reads as intended · ok = readable, structure partly lost · broken = wrong, missing or ugly enough to fail.

| case | desktop (margin view of edition) | phone (Tinct reader) |
|---|---|---|
| news-bbc | **broken**: the figure prints as a literal `￼f1` token | good: figure and caption drawn; plain prose reads well |
| essay-longform-pullquote | **broken**: `￼f1` token; subtitle is a plain line; the `* * *` scene break is gone | ok: subtitle in italics, figure good; scene break dropped |
| substack-subscribe-widgets | ok: subheadings, list and "Notes" are plain lines, so the notes look like body text | good: small-caps subheadings, bullets, NOTES block; a one-line note continuation is widowed alone on the last page |
| wikipedia-en | **broken**: `￼f1`/`￼f2` tokens; subheadings are plain lines; all links lost | ok: every one of ~70 links is underlined with `↗` (first page is a thicket, and a lone `↗` wraps onto its own line); lists good |
| poem-verse | ok: lines kept, unjustified, with no stanza gap | ok: lines and hanging indents good; **stanza 2 collapsed into one justified prose paragraph**; indentation lost; stanza numbers are inconsistent (some headings, one plain) |
| play-script | ok: speeches as plain paragraphs; cast lists as lines | ok: cast list and scene subtitle good; **speaker names not set as labels** (plain "ALGERNON."); literal `_._` shows in `[Languidly_._]` |
| pdf-academic-paper | ok: "Notes" sits as a plain line inside §1; table rows run together | ok: numbered sections are chapters; "2.1 Participants" is styled as a *subtitle*; the flattened table ("Type Example item") is unreadable |
| docs-list-heavy | **broken**: nesting, numbers, letters and bullets all gone; the code block is one prose line; the callout label is a plain line; one section is titled "Isbn" | **broken**: nested and lettered list flattened to one bullet level, numbers lost; code is one justified prose paragraph; one chapter titled "Isbn" |
| markdown-obsidian | **broken**: the table is word soup; Books 9–11 sit under a chapter called "Notes" | **broken**: the table header is styled as a heading and rows run together ("Aeolus' bag of winds nobody (yet) 1–79"); wrong chapter titles; task boxes ☑/☐ good |
| email-newsletter-txt | ok: quotes and sign-off lines kept; bullets and links lost | good: each `###` became its own chapter (one-page chapters), quotes as lines, links good |
| reddit-thread | ok | ok: commenter names became chapter titles in title case ("Lamplighter_9", "Ferrous_owl"); the nested reply and its OP label merged into the wrong commenter's chapter; the reply quote is not set off |
| recipe-page | **broken**: `￼f1` token; "Ingredients" sits under a chapter titled "Instructions" | ok: bullets good, but **ordered steps lose their numbers**; Ingredients is under the "Instructions" chapter |
| news-dr-danish | **broken**: `￼f1` token | good: subtitle, figure and Danish text fine |
| rtl-snippet | ok: Hebrew glyphs are in the right order, but each paragraph is left-aligned and LTR | ok: same; RTL paragraphs left-aligned; verse number "1" placed on the wrong side; quote blocks not set off |
| long-chapter-15k | good: 14,258 words in one 74-paragraph chapter, smooth scroll | good: 92 pages, page turns fine |
| tiny-paragraph | good | good: one page, title from the first clause |
| tables-data | **broken**: every table is space-joined word soup | **broken**: header row shown as a small-caps heading, data rows as hanging-indent lines; key/value table header styled as a heading |

Summary: 5 of 17 are good on the phone and 3 of 17 on the desktop. Nothing failed technically (no layout faults, no errors). What breaks is structure: tables, code, nested lists, quotes and RTL text have no shape in the edition. The margin view drops even the shapes the edition does have.

## Gaps the paste feature must handle

Converter means the EPUB → edition path (`epubEdition.ts`). Reader means the phone reader (`lab-hearing-line`) or the margin view of an edition (`tinct-book.js`).

1. **The margin view of an edition ignores `kinds`, `links` and `figures`.** `tinct-book.js paragraphEl` writes only text plus `em`. As a result:
   - a figure paragraph shows as a literal `￼f1`;
   - headings, items, lines and labels are plain lines;
   - links vanish.

   The README says a paste is "read in the margin view". If the paste is stored as an edition, as proposed, this is the first thing to fix, and it applies to every case with a heading, list or picture. (Uploaded EPUBs are not affected, because the margin view renders their XHTML.)
2. **Tables (Q10, R21).** The converter joins a row's cells with spaces. A `th` row becomes `heading` and data rows become `line`. This is unreadable on both readers. The edition needs a table block (a proposed kind or a table structure), and the readers need to draw it with a narrow-screen fallback (scroll or stacked key/value). Until then, a paste should emit `Header: value` lines per row rather than space-joined cells.
3. **Preformatted / code (R18).** `pre` collapses to one justified prose paragraph: newlines are lost and the text is hyphenated. A `pre` kind with verbatim whitespace and fixed width is needed (the only fixed-width text allowed). Inline `code` comes through as plain text, which is acceptable.
4. **List depth and numbering (Q15, R16).** Nesting is flattened to one level. `ol` numbers and `a.` letters are lost because the reader draws a bullet for every `item`. Recipe steps and docs steps lose their order. At minimum, carry an ordinal (and a level 0/1) on `item`.
5. **Quotes and callouts (R15, R28f).** `blockquote` becomes a plain paragraph with no indent. A callout's bold label becomes a `heading`, so it can start a new chapter (see 7). Email and reddit quotes, the Butler quote and the KJV verses are not set off. A `quote` kind is needed.
6. **RTL (Q14, R29).** `dir` and `lang` are dropped everywhere. Hebrew shapes correctly but every paragraph is left-aligned LTR, and a leading verse number lands on the wrong side. A per-paragraph direction (or `dir="auto"` on every paragraph in both readers) is needed.
7. **Sections must be built by the paste, not inferred.** A one-document EPUB with three or more headings goes through `splitAtHeadings`. Pieces under 25 words merge forward, so chapters get the wrong titles: "Isbn" for Column reference, "Notes" for Books 9–11, "Instructions" over Ingredients, reddit commenters as chapters. A paste must emit R30 sections explicitly and keep `###` as `heading` kinds inside a section.
8. **The first subheading becomes a `subtitle`.** The converter's opening-lines rule turns the first deeper heading after a chapter title ("Preparation for War", "2.1 Participants", "SCENE") into an italic subtitle. A paste should mark it as `heading`.
9. **Scene breaks (R19).** `<hr>` produces nothing, so `* * *` disappears. A paste should keep a scene-break paragraph (or kind) and the readers should draw it centred.
10. **Verse (Q22, R19).**
    - Lines survive on the phone with a hanging indent, which looks good.
    - Indentation (`i1–i3`) is lost.
    - Stanza gaps are no bigger than paragraph gaps.
    - The converter's "wrapped print" heuristic (`opensOnName`: "…green, / Dance, and …") turned stanza 2 back into prose.

    A paste must set verse lines explicitly (`line` plus an indent level and a stanza break) and not run them through that heuristic.
11. **Speakers (R24).** The edition carried `speakers: true`, but the phone reader showed "ALGERNON." as plain text in this setup. Check that own-book plays get the speaker label; this setup may differ from a real own book.
12. **Bold (R14).** `**…**` is lost everywhere. Only `_…_` survives, so labels like "**Shortest:**" and "**Nobody**" lose their emphasis. A strong mark would be needed, or bold mapped to `label` only when it stands alone.
13. **Literal underscores.** Emphasis on punctuation alone (`[Languidly_._]`) is shown as raw `_._`. The cleaner should never emit emphasis around punctuation only (R14 "adjacent emphasis runs merge").
14. **Dense links (Q17).** Wikipedia's ~70 links, each underlined with a `↗` glyph, make the first page noisy, and a lone `↗` can wrap onto its own line. This supports dropping internal-wiki links or keeping only external ones. The reader should also keep `↗` attached to the word (non-breaking).
15. **Footnotes (Q1, R22).** "Notes" plus `[n] text` reads acceptably on the phone (small-caps NOTES). In the margin view it looks like body text. The continuation paragraph of a two-paragraph note can be widowed alone on the last page. Consider a `note` kind (smaller text) so notes read as apparatus.
16. **Images (Q4).** Figures with captions look good on the phone. Remote URLs are dropped by the EPUB path (`pictureOf` accepts only files inside the book), so a paste must download them or decide to drop them, as Q4 asks.

Found in the collection itself:

- `cases/poem-verse/expected.md` ends "Do I wake or sleep?80". The margin line number leaked, which goes against R13b, and the reader shows it.
- `cases/play-script/expected.md` has `_._` emphasis on full stops (`[Languidly_._]`, `[Stiffly_._]`, `[**Lane** goes out_._]`), which goes against R14's merge rule.

## Recommendations

1. Before building paste, make the margin view of an edition paint `kinds`, `links` and `figures` (one shared painter with `labParagraphStyle`). Otherwise every pasted article reads as undifferentiated lines on desktop and shows `￼f1` for pictures.
2. Build the paste edition directly with explicit sections. Do not route a paste through an EPUB or `epubEdition.ts`: its book-oriented heuristics (heading split, opening subtitle, verse "wrap" undo) damage short web documents.
3. Extend the edition shape, in this order of impact: `pre`, `quote`, item ordinal and level, table, scene break, per-paragraph `dir`, line indent and stanza break. That answers Q10, Q14, Q15 and Q22 with "yes, carry it". Until a kind exists, choose the readable fallback in the cleaner: rows as `Header: value` lines, code lines as `line` paragraphs, lettered and numbered labels kept in the text.
4. Fix the two expected files above, and add to the cases' notes a check that nothing renders `_` or `￼` literally.
5. Re-run this check with a signed-in `profile3` to cover what could not be checked here: the real upload, the own-book title and primer, and the margin view of an uploaded EPUB. The builder and capture scripts are in the session scratchpad (`rc/md2epub.py`, `rc/conv-*.mjs`, `cmp/rc-render.mjs`, `cmp/rc-cap.mjs`). To repeat them, sign the profile in again (it has no session) and upload the EPUBs in `rc/epub/`.
