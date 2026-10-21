# Paste any text — clean-up rules

Rules derived from the cases in `cases/`, in the order a rule-based cleaner applies them. Each rule names the cases that need it (case ids are folder names). Sub-rules (R14a, R22e, …) are the ones the case `notes.md` files cite.

The target is the shape described in [README.md](README.md#target-output-shape): an own-book edition of chapters (sections) of paragraphs, with per-paragraph kinds, links by word range, figures, emphasis as `_…_`.

General principles, from the cases taken together:

- **Remove, never rewrite.** The cleaner removes chrome and repairs encoding. It does not rephrase, re-case or "smarten" the author's text (mojibake-smart-quotes, gutenberg-chapter).
- **Structure beats text, and text beats nothing.** Prefer tag, role and class signals; fall back to short-text rules only for blocks with no semantic markup (medium-post, twitter-thread). Class rules apply to block containers and `sup`, never to `<a>` (docs-python-venv: Sphinx links have class `reference`).
- **Chrome lives at the edges.** Most chrome sits before the title or after the last body paragraph. Trim from both ends first, then remove the few inline kinds (ads, promos, subscribe boxes, pull quotes). The trim handles in the UI are the user's override for anything the rules get wrong.
- **Never invent metadata.** An unknown title or author stays empty and the field gets focus (gutenberg-chapter, poem-verse, play-script, markdown-readme).

---

## A. Input

**R01 Choose the clipboard flavour.** Read `text/html`, `text/plain` and (if present) `text/uri-list`. Use HTML when it has block structure (`p`, `h1–h6`, `li`, `blockquote`, `pre`, `table`). Use plain text when the HTML is only `div`/`span` soup with the same words (twitter-thread). Detect Markdown inside `text/plain` (≥ 2 signals in the first 40 lines: front matter fence, ATX heading, list marker, table row, `**`, `[[`, fenced code) and parse it as Markdown (markdown-obsidian, markdown-notion, markdown-readme).
Cases: markdown-obsidian, markdown-notion, markdown-readme, twitter-thread, url-only.

**R02 Decode and repair text.** In this order:
- R02a strip BOM; CRLF/CR → LF; use only the CF_HTML `StartFragment…EndFragment` range when markers exist (word-paste, plain-hardwrap-72);
- R02b undo UTF-8-read-as-Windows-1252 mojibake (`â€™` → `’`, `Ã©` → `é`), repeatedly for double encoding, only when the repaired run is valid UTF-8 and contains fewer `Ã â Â` than before;
- R02c the one heuristic: `â€` + U+FFFD → `”` after an open `“`;
- R02d never touch text that is already sensible (second "São Paulo", Hebrew points);
- R02e NBSP → space, remove soft hyphen U+00AD, zero-width space U+200B, word joiner;
- R02f expand ligature code points `ﬁ ﬂ ﬀ ﬃ ﬄ` (pdf-academic-paper); no other NFKC, and no quote/dash smartening.
Cases: mojibake-smart-quotes, pdf-academic-paper, plain-hardwrap-72, word-paste, rtl-snippet.

## B. Chrome removal (HTML)

**R03 Drop structural chrome.** `nav`, page-level `header`/`footer` (not one inside `article` content or a `blockquote` — standard-ebooks; not a `header` that holds the article's `h1` — news-dr-danish), `aside` (except sidenotes, R22e), `form`, `button`, `input`, `select`, `dialog`, `iframe`, `script`, `style`, `noscript`, `svg`, `canvas`; `role=navigation|banner|contentinfo|search|dialog`; `[hidden]`, inline `display:none`; Word's `<head>`, `<style>`, `<!--[if …]>` blocks. Select-all pastes carry the whole site frame (blog-code-jvns, standard-ebooks).
Cases: news-cookie-banner, medium-post, blog-code-jvns, standard-ebooks, word-paste, docs-list-heavy, reddit-thread.

**R04 Drop consent banners.** Containers whose id/class/aria-label match `cookie|consent|gdpr|onetrust|cmp|privacy-banner`, or whose text starts "We value your privacy" / contains "Accept all cookies".
Cases: news-cookie-banner.

**R05 Find the title block.** Title = the `h1` that is not inside site chrome and not a link to `/` (blog-code-jvns has two `h1`s); Docs/Word title styles count (`p.MsoTitle`, a first paragraph ≥ 1.6× body size — gdocs-paste, word-paste). Above it, drop kickers/rubrics/section labels ("Local news", "Review", "Indland", "A Reporter at Large", "Member-only story"). Directly below it, a dek/standfirst/`h2`/`h3` subtitle or an italic-only short line → `subtitle` (a subtitle of only punctuation, "...", is dropped — substack-acx). Bold inside a title is not kept (news-dr-danish).
Cases: news-cookie-banner, news-bbc, news-guardian-review, news-dr-danish, medium-post, substack-acx, substack-subscribe-widgets, essay-aeon, essay-longform-pullquote, arxiv-html, blog-code-jvns, long-chapter-15k, play-script, markdown-readme, word-paste, gdocs-paste.

**R06 Lift bylines and dates into metadata.** "By X", `rel=author`, `.byline`, `.p-author`, author attributes, "Af X" (Danish), "Text and photographs by X" → `author` (job titles dropped; several names joined "A, B and C" even when the spans had no spaces — news-bbc). `<time datetime>`, "Posted on", "Last updated on" → `date`. Relative times ("7 hours ago", "9d ago"), "Updated 09:40", reading time, affiliations and author bios are dropped (arxiv-html, essay-aeon, essay-longform-pullquote).
Cases: news-cookie-banner, news-bbc, news-guardian-review, news-dr-danish, medium-post, substack-acx, essay-aeon, essay-longform-pullquote, arxiv-html, blog-code-jvns, footnotes-endnotes, images-captions, recipe-page, reddit-thread, long-chapter-15k.

**R07 Drop social and engagement controls.** Share/Save/Follow/Listen/Copy link/Email/Print; counts (claps, likes, views, replies, "1.2K", "552 Replies · 344 Reposts"); "7 min read"; icon-only links with only an `aria-label`. Text rule for unmarked blocks: the whole block is one of the known control words, or a number with optional K/M, or a `·`-separated run of those.
Cases: news-cookie-banner, news-bbc, medium-post, substack-acx, substack-subscribe-widgets, essay-longform-pullquote, reddit-thread, twitter-thread.

**R08 Drop ads and sponsored blocks.** Containers matching `ad-slot|adthrive|mediavine|ezoic|dfp|sponsor|promoted` or whose only text is "Advertisement"/"Sponsored"/"Promoted".
Cases: news-cookie-banner, essay-longform-pullquote, recipe-page, reddit-thread.

**R09 Drop inline promos.** A paragraph that is only a link (or a lead-in + one link) to the same site starting "Read more", "Related", "Watch", "Listen", "See also:" (news, not docs), "Jump to recipe"; button-styled single-link paragraphs ("Leave a comment", `p.button-wrapper`); table tool rows (`#` links only).
Cases: news-cookie-banner, news-bbc, essay-longform-pullquote, substack-subscribe-widgets, recipe-page, tables-data.

**R10 Drop subscribe, newsletter and paywall boxes.** Substack `subscription-widget*`, `CaptionedButtonToDOM`, "Thanks for reading X! Subscribe…", newsletter sign-up blocks (even with their own `h3`), "Forwarded this email? Subscribe", "Sign up", "Upgrade to paid".
Cases: news-cookie-banner, news-bbc, substack-subscribe-widgets, email-newsletter-txt, essay-longform-pullquote, reddit-thread.

**R11 Trim trailing chrome.** From the end of the paste backwards, drop: tag/topic lists, "Related stories", "More from …", "Most popular/viewed", comments sections, author bios ("X is a …"), print-edition lines, "Reuse this content", syndication links, pagination, e-mail footers (unsubscribe, address, copyright), credit footers after a final rule. Must run **before** headings are turned into sections ("Written by …", "Responses (38)" are `h2`s — medium-post).
Cases: news-cookie-banner, news-bbc, news-guardian-review, news-dr-danish, medium-post, substack-subscribe-widgets, essay-aeon, essay-longform-pullquote, recipe-page, email-newsletter-txt, markdown-readme, docs-python-venv.

**R12 Drop reference-work and docs apparatus.**
- R12a `[edit]` links; R12b citation calls (`sup.reference`, `sup.mw-ref`, `cite` around `#bib` links, "[citation needed]") with no space left before punctuation;
- R12c infobox, navbox, hatnotes ("Main article:", "Hauptartikel:", "For broader coverage"), coordinates, "From Wikipedia, the free encyclopedia";
- R12d tail sections from the first of "See also / Notes / References / Bibliography / Further reading / External links" (and per-language equivalents: "Siehe auch / Literatur / Weblinks / Einzelnachweise") — open question Q16/Q18;
- R12e printed or generated contents (a heading "Contents"/"Table of contents" followed only by in-page links; Docusaurus/Sphinx TOC; "On this page");
- R12f Project Gutenberg licence header/footer ("*** START OF …" / "*** END OF …");
- docs chrome: breadcrumbs, version badges, "Edit this page", "Was this page helpful?", heading permalinks (`¶`, `#`, `hash-link`).
Cases: wikipedia-en, wikipedia-de, arxiv-html, docs-python-venv, docs-list-heavy, markdown-readme, long-chapter-15k, plain-hardwrap-72.

**R13 Drop print furniture.** R13a page-number markers (`span.pagenum` "{12}", "[107]" links to page scans) inside or between paragraphs, without leaving spaces before punctuation; R13b margin line numbers in verse (`span.linenum`).
Cases: gutenberg-chapter, poem-verse (and pdf-academic-paper for plain text, R27c).

## C. Structure and inline formatting

**R14 Inline formatting.** `i/em/cite` → `_…_`; `b/strong` → `**…**`; `code/kbd/tt` → `` `…` ``; R14a CSS overrides tags (`font-weight:400|normal` cancels `<b>`; `700|bold` on a span is bold; `font-style:italic` is italic) — Google Docs wraps the whole paste in `<b style="font-weight:normal">`; `mso-bidi-*` properties are ignored; R14b unlinked `vertical-align:super` digits after punctuation in Docs = footnote calls with no bodies → dropped; R14c only `http(s)` links are kept, internal `#` links and relative links become text, redirect wrappers (`google.com/url?q=`) are unwrapped; R14d MathML → `$alttext$`. Emphasis never spans a line break, and adjacent emphasis runs merge (`<em>pigeon</em><em>.</em>` → `_pigeon._`) (news-guardian-review verse). A bare URL stays text.
Cases: almost all; specifically gdocs-paste, word-paste, arxiv-html, news-guardian-review, markdown-readme, tables-data, docs-python-venv.

**R15 Quotes and pull quotes.** `blockquote` → quote paragraphs (each `<p>` separately). Pull quotes are dropped: by class (`pullquote`, `pull-quote`, `PullQuote`, Medium's second blockquote style) or by text (≥ 80 % of its words occur in the 3 paragraphs around it). See Q3.
Cases: news-cookie-banner, medium-post, essay-aeon, essay-longform-pullquote, essay-paulgraham, substack-acx, standard-ebooks, rtl-snippet, docs-list-heavy.

**R16 Lists.** `ul/ol/li` → items, `start`/`type="a"` respected, nesting kept to two levels (Q15); `<li><p>` is one item; task items → `☐`/`☑`. R16a Word fake lists (`MsoListParagraph` + `mso-list`, bullet glyph in `<![if !supportLists]>`) → real items, list id decides continuity. `dl` → bold label line + value line (R16d). A `<p>` beginning with "- " is not a list (R26h).
Cases: medium-post, substack-subscribe-widgets, word-paste, gdocs-paste, docs-list-heavy, docs-python-venv, markdown-obsidian, markdown-notion, markdown-readme, blog-code-jvns.

**R17 Headings.** `h1–h6` → section titles or subheadings (R30). Remove anchor buttons, `¶`, `#`, zero-width spaces and `mso-spacerun` runs from heading text. A short bold-only paragraph (≤ 12 words, no end punctuation) is a heading; a bold lead-in followed by normal text is not ("**Thanks** to …", "**Present:** …"). A heading containing a picture is split into heading + figure (gutenberg-chapter).
Cases: substack-subscribe-widgets, word-paste, gdocs-paste, arxiv-html, docs-python-venv, docs-list-heavy, blog-code-jvns, gutenberg-chapter, essay-paulgraham.

**R18 Preformatted text.** `pre`, Markdown fences and Prism `token-line` spans → a preformatted block, content verbatim (newlines, indentation, `#` lines, Markdown inside the block untouched), language from `language-*`/info string. This is the **only** place fixed-width text is allowed. "Copy" buttons and line-number gutters go.
Cases: blog-code-jvns, medium-post, markdown-readme, docs-python-venv, docs-list-heavy.

**R19 Line breaks and verse.** `<br><br>` = paragraph break; a single `<br>` inside a paragraph = line break (`line` kind: verse, addresses, cast lists, sign-offs); `div.stanza`/`span.line|verse|iN` lines → lines, stanza boundaries → blank line; indentation not kept (Q22); newlines in HTML source are spaces; `<br>` between blocks is nothing; scene-break ornaments (`✦ ✦ ✦`, `* * *`, `⁂`, `<hr>` in prose) → one `* * *`.
Cases: poem-verse, news-guardian-review, play-script, essay-paulgraham, essay-longform-pullquote, long-chapter-15k, gdocs-paste, markdown-notion.

**R20 Figures.** `figure`/`img`/`div.thumb`/`div.figcenter` → figure (caption from `figcaption`/`.caption`, plain text; `alt` kept as alt, never promoted to caption). R20a resolve lazy images (`data-src`, `data-srcset`, widest `srcset`, skip placeholders); R20b strip credits from captions ("Photograph:", "Photo:", "Foto:", "Illustration by", "Courtesy", "©", `.credit`); R20c emoji images → their alt character; R20d drop tracking pixels and icons; R20e lone image in a `<p>` = figure; R20f galleries: drop counters/buttons, keep items; R20g drop video/player embeds **with** their captions; R20h drop blanket credit paragraphs; badges (image-only links in a row) dropped. Drop-cap images are not figures (R23).
Cases: images-captions, news-bbc, news-cookie-banner, news-guardian-review, news-dr-danish, medium-post, essay-aeon, essay-longform-pullquote, gutenberg-chapter, substack-acx, wikipedia-en, wikipedia-de, recipe-page, markdown-readme.

**R21 Tables.** Data tables → tables: R21a `caption` becomes a paragraph before the table; R21b multi-row headers flattened ("Length: Words"); R21c `tfoot` kept as last rows, `colspan` padded; R21d layout tables (width 100 %/fixed, one cell or cells holding block content or > 40 words) are unwrapped; R21e key/value tables stay two-column. A table flattened into plain text (PDF) is not rebuilt (R27e).
Cases: tables-data, gdocs-paste, essay-paulgraham, arxiv-html, markdown-obsidian, markdown-notion, pdf-academic-paper.

**R22 Footnotes and endnotes.** R22a remove calls (linked `sup`, `role=doc-noteref`, `a[href^="#fn"]`, Substack `footnote-anchor`, Word `mso-footnote-id`, bracketed `[n]` links) with no stray space; R22b a note called twice appears once; R22c collect bodies (`.footnotes`, `role=doc-endnotes`, `div.footnote`, Word `mso-element:footnote`, a trailing "Notes"/"Endnotes" heading with `[n]` paragraphs) into one `### Notes` at the end of the section that called them, as `[n] text`; R22d drop backlinks (`↩`, `[back]`, "return"); R22e lift Tufte sidenotes out of their paragraph; R22f renumber in call order (Q1); R22g keep multi-paragraph notes and their links; R22h unlinked superscript verse numbers are text.
Cases: footnotes-endnotes, substack-subscribe-widgets, substack-acx, essay-paulgraham, word-paste, markdown-obsidian, pdf-academic-paper, rtl-snippet.

**R23 Drop caps.** A first-letter span (`dropcap`, `letra`, a single letter with a drop-cap style) or image (`alt` = one letter) is merged into its word; when the letter is duplicated for screen readers, keep one copy; a bold style on the drop cap is not emphasis. No case normalisation of the small-caps lead-in (Q20).
Cases: news-guardian-review, essay-longform-pullquote, gutenberg-chapter.

**R24 Play speakers.** `NAME.<br>speech` → "NAME. speech" in one paragraph; mark the edition `speakers: true`; stage directions stay inline.
Cases: play-script.

**R25 Social posts and threads.** Embedded posts → a quote with an attribution line, counts and timestamps dropped (substack-acx). Forum threads: post body as the main text, each top-level comment a subheading with the commenter, replies as quotes with a bold name, deleted comments and award-thanks edits dropped (reddit-thread, Q7). X threads in plain text: recognise the post header, keep one author's consecutive posts, drop counters and "1/6" numbering, stop at another author or "Discover more" (twitter-thread).
Cases: substack-acx, reddit-thread, twitter-thread.

## D. Plain text

**R26 Hard-wrapped plain text and e-mail.** R26a join lines within a blank-line-delimited paragraph with one space, except blocks of short lines (verse, addresses, sign-offs: every line < 60 % of the measure, or the first ends with a comma); R26b `** HEADING` / underlined / ALL-CAPS short lines between rules are headings (sentence-cased); R26c rule lines (`----`, `====`) are not text; R26d masthead → title; R26e `*`/`-` bullets → items, `*word*` → emphasis; R26f `> ` quote blocks kept, `-- Name` → `— Name`; R26g numbered link references `[n] url` resolved into links; R26h a paragraph starting "- " is direct speech in Danish/Swedish/Norwegian news, not a list.
Cases: plain-hardwrap-72, email-newsletter-txt, news-dr-danish.

**R27 Text copied from a PDF viewer.** R27a infer paragraphs without blank lines (line ends in `.?!:”)` and is < 85 % of the median line length, or the next line is a heading); R27b join hyphenated line ends, keeping the hyphen when the hyphenated form occurs elsewhere in the paste or the next fragment starts with a capital/digit; R27c remove running heads/feet and page numbers (lines repeating at page breaks, bare numbers between them) and join the sentence they split; R27d footnote digits glued to punctuation ("2013).1") → call removed, note text from the page foot → Notes; R27e flattened tables/figure captions stay as lines/paragraphs.
Cases: pdf-academic-paper.

**R28 Markdown dialects.** CommonMark + GFM, then: R28a YAML front matter → metadata; R28b `# h1` equal to the title not repeated; R28c `[[wikilinks]]` → text (alias wins); R28d `#tags` dropped; R28e `![[embeds]]` dropped (Q9); R28f callouts/alerts/admonitions (`> [!note]`, `<aside>`, Docusaurus/Sphinx admonitions) → quote with a bold label; R28g `==highlight==` → text (Q8); R28h `%%comments%%` dropped; R28i Notion property block → metadata; R28j `<details>` toggles expanded; R28k links to `notion.so` pages and relative export files → text; R28l `@mentions` → text; R28m inline HTML in Markdown goes through the HTML rules.
Cases: markdown-obsidian, markdown-notion, markdown-readme, docs-list-heavy, docs-python-venv.

## E. Language, sections, metadata, limits

**R29 Language and direction.** Detect the document language from text (stop words + script; `da` vs `no`/`de` needs care) when no `lang` is given; list secondary languages. Give each paragraph `rtl` when its first strong character is Hebrew/Arabic (bidi "first strong", like `dir="auto"`); keep short RTL runs inline; never normalise RTL text.
Cases: news-dr-danish, wikipedia-de, rtl-snippet.

**R30 Sections.** Chapter-like headings (Chapter/Part/Book/Act/Canto, a bare roman or arabic numeral, numbered paper sections "1 Introduction", "Abstract") always start sections. Otherwise, if the cleaned paste is ≥ 2,500 words, split at the highest heading level that occurs at least twice; text before the first such heading becomes a section named after the document title. Below 2,500 words: one section named after the title, every heading a subheading. Heading levels below the section level collapse to one subheading level. Section titles go through `app/public/lab/chapter-title.js` (`normalizeTitleList`) after dropping a trailing full stop.
Cases: every case; decisive in gutenberg-chapter, play-script, poem-verse, pdf-academic-paper, wikipedia-en, substack-acx, arxiv-html, news-bbc.

**R31 Title and author prefill.** Title: R05 title block → Docs/Word title style → title image `alt` (R31c) → Markdown front matter → first heading if it is not chapter-like → masthead (newsletters) → first short line followed by a blank line → first clause of the first sentence (≤ 12 words, R31a) → empty with the field focused. Author: R06 byline → front matter → "By X" line under the title → sign-off name (weak) → empty (R31b). Never take a site name, a commenter, or a footer link as author.
Cases: tiny-paragraph, mojibake-smart-quotes, essay-paulgraham, email-newsletter-txt, twitter-thread, pdf-academic-paper, plain-hardwrap-72, gutenberg-chapter, standard-ebooks, poem-verse, play-script, markdown-readme, word-paste.

**R32 Limits and refusals.** R32a no minimum length (a one-sentence paste is a book of one paragraph; primer/quiz thresholds are Q12); R32b a paste that is only one or more URLs is refused with a pointer to Add a book (no fetching — Q2); R32c very long pastes (≥ 10k words, ≈ 100 kB HTML) must clean in linear time and not be truncated.
Cases: tiny-paragraph, url-only, long-chapter-15k, substack-acx.

**R33 Tidy.** Collapse whitespace; trim paragraphs; remove empty paragraphs and leading/trailing separators; one scene break per run; remove the space a removed call/citation leaves before punctuation; ignore `white-space:pre-wrap` indentation outside `pre`; ignore `Apple-interchange-newline`, `<o:p>`, spell-check spans.
Cases: gdocs-paste, word-paste, markdown-notion, essay-longform-pullquote, play-script, twitter-thread.

**R34 De-duplicate against metadata.** A block equal to the title, subtitle or a figure caption already used is not repeated in the body (the recipe card's name, a repeated standfirst, a heading identical to the title).
Cases: recipe-page, news-guardian-review, markdown-obsidian, essay-longform-pullquote.

**R35 Recipe pages.** Keep the personal intro, real explanatory sections, ingredients and instructions; drop SEO filler sections by heading ("Why you'll love this recipe", "Tips", "FAQ", "Storage", "Variations"), ratings, time chips, nutrition, calls to action. Ingredient spans join into one item each.
Cases: recipe-page.

---

## Where rules conflict

1. **Visually hidden vs `aria-hidden` (drop caps).** "Drop `aria-hidden`" and "drop visually-hidden text" are both sensible chrome rules; applied together they delete the first letter of the article (essay-longform-pullquote). Drop caps must be recognised as a unit before either rule runs.
2. **Style bold vs drop cap.** R14a makes `font-weight:700` bold; the Guardian's drop-cap span carries that style (news-guardian-review). R23 must run first.
3. **`header` element.** Dropping `<header>` removes site chrome (blog-code-jvns) but also a title block (news-dr-danish, where the `h1` is inside `<header>`) and a Baronetage heading inside a blockquote (standard-ebooks).
4. **Class "reference".** Means a citation in Wikipedia (`sup.reference`) and an ordinary link in Sphinx (`a.reference`) — rules by class must be scoped by tag (docs-python-venv).
5. **"See also".** A tail section to drop in Wikipedia, an admonition to keep in Python docs, an inline hatnote to drop mid-article (wikipedia-en vs docs-python-venv).
6. **Pull quotes vs real quotes.** Medium marks quotes and pull quotes both with `<blockquote>` (classes differ only by generated names); Aeon's pull quotes have no blockquote at all. Text-overlap catches exact repeats but not paraphrased pull quotes (essay-longform-pullquote's second one).
7. **Leading dash.** "- " starts a list item in Markdown and plain text, but a line of direct speech in Danish news (news-dr-danish).
8. **Single line breaks.** Hard wraps to remove in e-mail and Gutenberg text (plain-hardwrap-72), meaningful lines in verse, cast lists and sign-offs (poem-verse, play-script, email-newsletter-txt).
9. **Short-paste sectioning vs chapter headings.** "One section below 2,500 words" would merge two short Gutenberg chapters; chapter-like headings override it (gutenberg-chapter, play-script, pdf-academic-paper).
10. **Credits.** "Photograph: …" at the end of a caption is chrome; "Photo by Ana Ruiz on Unsplash" is the whole caption (medium-post → empty caption); an image credit inside alt text ("Facebook Screenshot of …", news-bbc) is not separable by rule.
11. **Footnote calls vs verse numbers vs cross-references.** A superscript or linked number can be a note call (drop), a verse number (keep — rtl-snippet) or a figure/section cross-reference ("Figure 2" in arxiv-html — keep the number).

## Open questions for the product owner

- **Q1 Footnotes.** Calls are removed from the text and notes collected under "Notes" at the section end (as Tinct's EPUB converter already drops note calls). Should calls stay as tappable markers instead, and should notes keep source numbering rather than renumbering? Google Docs does not copy footnote bodies at all — warn?
- **Q2 URL-only pastes.** Refuse and point to Add a book (expected here), or fetch the page server-side? Fetching changes the privacy, copyright and paywall story.
- **Q3 Pull quotes without a class.** Drop only exact repeats (safe) or any short display quote that paraphrases nearby text (risk of losing real epigraphs)?
- **Q4 Images.** Download remote images into the private book at paste time (like EPUB `asset:` figures), keep remote URLs (tracking, link rot, offline), or drop images? And are alt-only pictures worth keeping?
- **Q5 Recipe and other utilitarian pages.** How much of a recipe is "reading"? Expected keeps intro + method; alternative is the card only.
- **Q6 Newsletters and social posts.** Is "Masthead — Issue N" a good title? Is a sign-off name ("Ruth") an author?
- **Q7 Comments and threads.** Keep comments at all? Keep usernames (third-party personal data in a private book)? Keep substantive "Edit:" paragraphs?
- **Q8 Highlights in the source.** Should `==highlight==`, `<mark>` or Kindle-style highlights become Tinct marks on import, or plain text?
- **Q9 Obsidian/Notion embeds** that are not on the clipboard: drop silently or show a placeholder?
- **Q10 Tables without a header row.** The edition shape needs a decision: header row optional?
- **Q11 Flavour choice.** When HTML is div-soup (X, some apps) should plain text win automatically, or always HTML with a "paste as plain text" toggle?
- **Q12 Tiny pastes.** Minimum length for a primer and a quiz?
- **Q13 Typography.** Keep `--`, straight quotes and `...` exactly as pasted (expected here), or normalise to `—`, curly quotes and `…`?
- **Q14 Right-to-left text.** Editions have no per-paragraph direction; is a `dir` per paragraph acceptable in the own-book format, or is mixed-direction text out of scope?
- **Q15 List depth.** Keep two levels, or flatten all lists to one level as the reader's `item` kind does today?
- **Q16 References.** Drop Wikipedia/arXiv reference lists (expected here) or keep them as a final section for papers?
- **Q17 Dense internal links.** Wikipedia links every other noun. Keep all links, keep none, or keep only external ones?
- **Q18 Languages for text rules.** English-first strategy: ship tail-section names and promo phrases for English only, with structural fallbacks elsewhere — or include Danish/German now since the corpus shows them?
- **Q19 Mathematics.** Show TeX source, render it, or keep equations as images like the PDF path?
- **Q20 Drop-cap lead-ins.** "IT is a truth" / "MR. BENNET was" — leave as printed (expected here) or normalise the first word?
- **Q21 Very long sections.** Split a 14k-word section for the margin view (by scene breaks or ~4–5k words), or keep chapters whole like built-in editions?
- **Q22 Verse indentation.** Needed for poems (indented lines carry meaning); the `line` kind has no indent today.
- **Q23 Source URL.** Use the source URL when the browser provides it (CF_HTML `SourceURL`, `text/x-moz-url`) to fill title/author, and store it with the book?

## Answers (Anders, 21 October 2026: "agree to your recc")

| # | Answer |
|---|---|
| Q1 | Keep note calls as small tappable markers that open the note, using the source's numbering, and collect the notes at the end of the section. When a paste has calls but no note bodies (Google Docs), show "Footnotes didn't come along". |
| Q2 | Refuse a link-only paste with "Paste the text itself". No fetching. |
| Q3 | Drop only pull quotes that repeat body text; keep every other short display quote. |
| Q4 | Download images into the private book at paste time, as EPUB figures are, up to about 20 images or 10 MB. Drop pictures that only have alt text. |
| Q5 | Keep the intro and method of a recipe; no special case. |
| Q6 | Title is the issue headline, else the masthead plus the issue number. A sign-off name is not the author unless there is a byline. |
| Q7 | Keep the post and its comments as replies, with usernames. Drop votes, avatars and buttons. Keep "Edit:" paragraphs. |
| Q8 | Highlights in the source arrive as plain text, not Tinct marks. |
| Q9 | Missing embeds become a small "[Embedded note not included]" line. |
| Q10 | The header row of a table is optional. |
| Q11 | Use the HTML flavour by default, falling back to plain text automatically when the HTML has no real structure. Add a "Paste as plain text" switch on the preview. |
| Q12 | No primer and no quiz under about 1,000 words. |
| Q13 | Keep typography exactly as pasted. |
| Q14 | Paragraphs get `dir="auto"` (the browser decides the direction); the format does not change. Nothing more for now. |
| Q15 | Keep two list levels. |
| Q16 | Keep a reference list as a final section for papers. Drop Wikipedia's References, See also and External links. |
| Q17 | Keep links to other sites; drop links within Wikipedia. |
| Q18 | English phrase lists, plus structure-based rules that work in any language. |
| Q19 | Show the TeX source in monospace. Rendering it later needs a new dependency and Anders's approval. |
| Q20 | Normalise a drop-cap lead-in only when the source marks it as a drop cap; otherwise leave it as printed. |
| Q21 | Keep sections whole; the margin reader sizes units for primer and quiz. |
| Q22 | Verse lines get an indent level. |
| Q23 | Use the source URL, when the clipboard has one, to fill in title and author. Store it with the book and show it as "Source". |

Expected results that conflict with these answers (Q1 calls removed, Q7 comments, Q16, Q17) are updated when the paste feature is built. The render check (`RENDER-CHECK.md`) shows which reader changes these need.
