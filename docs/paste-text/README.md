# Paste any text — test collection

Test corpus for the planned **"+ Add → Paste text"** feature (BACKLOG item 7 on `claude/phone-direction-log`): the reader pastes from the clipboard, Tinct keeps the formatting that matters (headings, lists, emphasis, quotes, links; fixed width only inside pasted preformatted blocks), strips page chrome by rule, prefills title and author, and stores the result as a private own book read in the margin view.

This folder holds no code. It is a collection of realistic clipboard inputs, the exact cleaned output each should produce, and the rules those outputs imply. Use it to write the cleaner test-first and to argue about edge cases before building.

- `RULES.md` — the clean-up rules in pipeline order, the cases that need each one, conflicts between rules, and open questions for the product owner.
- `cases/<id>/expected.md` — expected cleaned output for every case.
- `cases/<id>/notes.md` — what the case tests, by rule id.
- `cases/<id>/input.html | input.txt | input.md` — the clipboard content, for public-domain and synthetic cases only.

39 cases: 11 real third-party pages, 6 public-domain texts, 22 synthetic (written for this collection, modelled on real markup).

## Target output shape

The paste becomes the same structure as a reader's own EPUB today (`app/src/lab/userBook/userEdition.ts`, `UserBookEdition`, format `tinct-user-edition-v1`), produced by a new source next to `'epub' | 'pdf' | 'ocr'`:

```ts
{
  format: 'tinct-user-edition-v1', converter: N, source: 'paste',   // 'paste' is the assumed new source value
  title, subtitle?, author, language,                              // prefilled, editable before saving
  speakers?: true,                                                  // plays (epubEdition.ts sets this for EPUBs)
  chapters: [{                                                      // "sections" in this collection
    number, title,
    paragraphs: string[],                                           // emphasis inline as _…_ (the editions' markup)
    kinds?: ('heading'|'label'|'item'|'subtitle'|'byline'|'line'|null)[],
    links?: [paragraph, fromWord, toWord, href][],                  // http(s) only
    figures?: ChapterFigure[],                                      // a picture is its own paragraph, "￼" + id
  }],
  droppedImages: number,
}
```

Today's converters already give the model for most decisions: `epubEdition.ts` keeps italics as `_…_`, keeps structure beside the text (`kinds`), keeps web links by word range, drops note calls, drops a book's own contents page, sets lines broken by `<br>` as `line` paragraphs, and normalises chapter titles with `app/public/lab/chapter-title.js`.

`expected.md` writes that shape as Markdown so a human can read and diff it:

| expected.md | edition shape |
|---|---|
| YAML front matter `title`, `subtitle`, `author`, `date`, `language`, `speakers` | edition metadata (`date` and `source` are proposed additions) |
| `sections: N`, `words: ~N` | checks: chapter count, word count of the body (third-party excerpts: of the full output) |
| `## Title` | a chapter (section). Text before the first section heading goes in a section named after the document title |
| `### Heading` | paragraph with kind `heading` (all lower levels collapse to this one) |
| one line followed by a blank line | one paragraph (prose is never hard-wrapped in expected output) |
| consecutive lines with no blank line between them | one paragraph per line, kind `line` (verse, addresses, cast lists) |
| `- item`, `1. item`, `a. item`, indented two spaces for nesting | kind `item` (nesting and number labels are proposed — Q15) |
| `☐ ` / `☑ ` at the start of an item | task item, as text |
| `> text`, `> **Label**` first line | quote paragraph (a `quote` kind is proposed; today it would be a plain paragraph) |
| `**Label**` on its own line, `**Lead-in:** text` | kind `label` / bold run-in. Bold inside running text is shown as `**…**`; editions today carry only `_…_` (proposed addition) |
| `_text_` | emphasis |
| `` `code` `` and fenced ```` ``` ```` blocks | inline code / preformatted block — the only fixed-width text (proposed `pre` kind) |
| `[text](https://…)` | `links` entry over the words of `text` |
| `![caption](src "alt")` | a figure paragraph; `caption` and `alt` as in `ChapterFigure` |
| GFM table | a table block (proposed; EPUB conversion today flattens rows to paragraphs) |
| `* * *` | scene break |
| `### Notes` + `[n] text` | footnotes collected at the end of the section that calls them; calls removed from the text |
| `<!-- dir=rtl lang=he -->` before a paragraph | per-paragraph direction/language (proposed — Q14) |
| `\- text` | a paragraph that starts with a dash (Danish direct speech), not a list item |

Front-matter keys ending in `_note`, and `title_from_source_url` / `author_from_source_url`, explain a prefill decision; they are not output fields. `url-only` expects no book at all (`result: not-a-book`).

**Third-party cases** (`source:` is a URL, no `input.*` in the repo): to avoid committing copyrighted articles, `expected.md` holds only the start of the output (at most 40 lines and about a fifth of its words), `…`, the last few lines, and after an HTML comment the **complete list of section headings** in order; the case's `notes.md` adds spot checks where the rule under test falls outside the excerpt. A test should compare the excerpt's head and tail lines and the full heading list.

## Using the collection

1. Inputs. Public-domain and synthetic inputs are next to their expected output. The simulated clipboards for third-party cases were fetched on 2026-10-21 and kept outside the repo in the session scratchpad (`paste-corpus/<id>/input.html`, together with a copy of every repo input so the corpus is complete in one place). To rebuild them: fetch the source URL, take the article region a drag selection would cover (listed in each `notes.md`), make `src`/`href` absolute, drop `script`/`style`/`svg`/`hidden` elements, and wrap the result in `<html><body><!--StartFragment-->…<!--EndFragment--></body></html>` as browsers do.
2. Feed each input to the cleaner the way the paste box would receive it: `input.html` as `text/html` (with the plain-text flavour derived from it), `input.txt` and `input.md` as `text/plain`.
3. Render the result to the Markdown form above and compare with `expected.md`: exact match for synthetic and public-domain cases; head, tail and heading list for third-party cases.
4. When a rule changes an expected output, change `expected.md` in the same commit and say which rule in `notes.md`.

HTML inputs are simulations of a browser copy (selected region plus whatever chrome a careless selection catches), not whole page sources. Google Docs and Word inputs reproduce those apps' clipboard markup by hand.

## Cases

| id | kind | source (retrieved) | what is hard |
|---|---|---|---|
| news-bbc | news article | https://www.bbc.com/news/articles/c30rln4pz58xo (2026-10-21) | video blocks with captions to drop, placeholder images before real ones, byline names without spaces, newsletter promo and tags |
| news-guardian-review | news / review | https://www.theguardian.com/books/2026/oct/20/gilgamesh-by-simon-armitage-review-an-ancient-epic-is-brilliantly-translated-for-our-times (2026-10-21) | drop cap styled bold, verse quoted with `<br>` and per-line italics, caption credits, "Explore more" and comments |
| news-cookie-banner | news article | synthetic | cookie/consent bar, nav, breadcrumbs, share bar, ad slot, "Read more:", newsletter box, related, comments, footer |
| news-dr-danish | news, Danish | https://www.dr.dk/nyheder/indland/ekspert-saadan-kan-hackere-saette-din-data-sammen-fra-forskellige-laek (2026-10-21) | language detection `da`, "- " direct-speech paragraphs that are not lists, bold prefix in title, related card |
| substack-acx | Substack post, ~10.7k words | https://www.astralcodexten.com/p/an-open-letter-to-steven-pinker-on (2026-10-21) | Substack footnotes, embedded tweet card, quoted claims, long paste split into sections |
| substack-subscribe-widgets | Substack post | synthetic | subscribe widgets mid-text, share box, "Leave a comment", footnote anchors, subscribe footer |
| medium-post | Medium post | synthetic (medium.com refuses scripted fetches) | obfuscated classes, controls identified only by text ("7 min read", "1.2K"), pull-quote blockquote, credit-only caption |
| wikipedia-en | encyclopedia | https://en.wikipedia.org/wiki/Bletchley_Park (2026-10-21) | infobox, `[edit]`, citation brackets, hatnotes, 6k words of references to cut, h2/h3/h4 nesting |
| wikipedia-de | encyclopedia, German | https://de.wikipedia.org/wiki/Fahrrad (2026-10-21) | language `de`, German tail-section names, many leading thumbnails |
| arxiv-html | paper (HTML) | https://arxiv.org/html/1706.03762v7 (2026-10-21) | MathML → TeX, citation calls, author block with footnotes, h5 run-in headings, equation tables |
| pdf-academic-paper | paper copied from a PDF viewer | synthetic | no blank lines, hyphenated line ends, ligatures, running heads and page numbers mid-sentence, footnote digit glued to punctuation |
| essay-aeon | long-form essay | https://aeon.co/essays/the-century-long-search-for-the-limits-to-knowledge (2026-10-21) | pull quotes as plain `<p class="pullquote">`, "Listen to this essay", related rail |
| essay-longform-pullquote | long-form essay (magazine) | synthetic | duplicated drop-cap letter (aria-hidden + visually-hidden), exact and paraphrased pull quotes, ornament breaks, bio and print-edition line |
| essay-paulgraham | essay, 1990s markup | https://www.paulgraham.com/hwh.html (2026-10-21) | layout tables, `<br><br>` paragraphs, title only in an image `alt`, bracketed note calls |
| blog-code-jvns | blog post with code | https://jvns.ca/blog/2026/07/17/learning-about-running-sqlite/ (2026-10-21) | select-all copy with site header (a second `h1`), `#` comment lines inside code |
| docs-python-venv | documentation (Sphinx) | https://docs.python.org/3/library/venv.html (2026-10-21) | `a.reference` is not a citation, admonitions, version notes, API definition lists |
| docs-list-heavy | documentation (Docusaurus) | synthetic | nested and lettered lists, Prism code lines, definition list, TOC, edit/feedback/pagination |
| gutenberg-chapter | book chapters, HTML | https://www.gutenberg.org/cache/epub/1342/pg1342-images.html (2026-10-21, public domain) | page numbers mid-sentence, drop caps as text and as image, illustration inside a heading, chapter titles |
| standard-ebooks | book chapter, select-all | https://standardebooks.org/ebooks/jane-austen/persuasion/text/chapter-1 (2026-10-21, CC0) | `<header>` inside a blockquote is content, roman chapter number, no title in selection |
| long-chapter-15k | very long paste | https://www.gutenberg.org/cache/epub/219/pg219-images.html (2026-10-21, public domain) | ≈ 14.3k words in one section, printed contents table, byline div |
| plain-hardwrap-72 | plain text, hard-wrapped | https://www.gutenberg.org/cache/epub/1952/pg1952.txt (2026-10-21, public domain) | unwrapping 72-column lines, CRLF, many one-line paragraphs, title and "By …" from the first lines |
| poem-verse | poem | https://www.gutenberg.org/cache/epub/23684/pg23684-images.html (2026-10-21, public domain) | line breaks must survive, stanza gaps, indentation classes, margin line numbers, page markers |
| play-script | play | https://www.gutenberg.org/cache/epub/844/pg844-images.html (2026-10-21, public domain) | `NAME.<br>speech` speakers, stage directions, cast lists as lines, act headings |
| markdown-obsidian | Markdown (Obsidian) | synthetic | front matter, wikilinks with aliases, callouts, embeds, tags, highlights, comments, tasks, footnotes |
| markdown-notion | Markdown (Notion) | synthetic | property block, `<aside>` callout, `<details>` toggle, notion.so links, mentions |
| markdown-readme | Markdown (GitHub README) | synthetic | inline HTML, badges, TOC of anchors, Markdown inside code fences, alerts |
| email-newsletter-txt | plain-text e-mail newsletter | synthetic | `**` headings between rules, numbered link references, quoted replies, unsubscribe footer |
| gdocs-paste | Google Docs paste | synthetic | outer `<b style="font-weight:normal">`, styles on spans, title by font size, google.com/url redirects, table |
| word-paste | Word paste | synthetic | `mso-` styles, fake bullets in conditional comments, Word footnotes, `<o:p>` |
| reddit-thread | forum thread | synthetic | post vs comments, nested replies, deleted comments, scores and buttons, award edits |
| twitter-thread | X thread (plain text) | synthetic | repeating post headers, bare counters, "2/" numbering, other authors' posts after the thread |
| recipe-page | recipe blog | synthetic | life-story intro, SEO filler sections, recipe card controls, ingredient spans, ratings |
| footnotes-endnotes | footnotes / endnotes | synthetic | three note systems in one paste, a note called twice, Tufte sidenote inline, backlinks |
| images-captions | images and captions | synthetic | lazy `data-src`/`srcset`, credits in captions, emoji images, tracking pixel, gallery, video embed |
| tables-data | tables | synthetic | caption, two-row header with col/rowspan, tfoot, layout table, key/value table |
| rtl-snippet | right-to-left text | synthetic (Genesis 1:1–3 in Hebrew and KJV, public domain) | per-paragraph direction, unmarked Hebrew paragraph, RTL run inside LTR text, verse-number superscripts |
| mojibake-smart-quotes | encoding | synthetic | mixed correct and double-encoded mojibake, U+FFFD repair, BOM, NBSP, soft hyphen, zero-width spaces |
| tiny-paragraph | one sentence | synthetic | title derived from the first clause, no headings |
| url-only | only a URL | synthetic | must not become a book |

Licences: public-domain inputs are from Project Gutenberg (texts in the US public domain; Gutenberg's own header and footer are not included) and Standard Ebooks (CC0). Wikipedia text is CC BY-SA; arXiv, BBC, Guardian, DR, Substack, Aeon, paulgraham.com, jvns.ca and docs.python.org are the publishers' copyright and appear here only as short excerpts of the expected cleaned output.
