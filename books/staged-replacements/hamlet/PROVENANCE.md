# Hamlet — provenance, source verification, and paragraph format

**Prepared:** 2026-09-11, content-only staging work. Nothing here is
published, merged, registered or deployed. All source texts were fetched
directly and read; nothing below is asserted from memory alone unless marked
as such.

## 1. What the served files are

- `app/public/data/editions/hamlet-original-en.json`
  (sha256 `77f9bf6e33516a710b6e7a747cd0ae3e1518eca29483c0470341f69d8de6e58f`)
  — the served original-language text. 20 chapters (one per scene, grouped
  into 5 acts via a `sections` array: Act 1 = chapters 1–5, Act 2 =
  chapters 6–7, Act 3 = chapters 8–11, Act 4 = chapters 12–18, Act 5 =
  chapters 19–20), 1,391 paragraphs total, ~31,600 words. `bookRegistry.ts`
  labels this edition plainly "Original Text" — no translator/editor is
  claimed, so there is no misattribution issue of the kind found in the
  Meditations audit.
- `app/public/data/editions/hamlet-modern-en.json`
  (sha256 `b355830766b696812decba35f95dee0ee68ff7662e36370194a129bc2147fda5`)
  — the served "modern English" edition, being replaced by this staged
  package, scene by scene, starting with Act 1 Scene 1.

## 2. Source identification: served `original-en` vs Project Gutenberg

Fetched `https://www.gutenberg.org/files/1524/1524-0.txt`
(sha256 `df57d93895266023ea635bdcaadcfae002059b8096a2b44884c0e14a5616eb77`),
Project Gutenberg ebook #1524, "The Tragedy of Hamlet, Prince of Denmark",
by William Shakespeare. Spot-checked the served Act 1 Scene 1 against it
line for line:

| served location | served text | PG #1524 |
|---|---|---|
| Ch1 ¶6 | "FRANCISCO. You come most carefully upon your hour." | "You come most carefully upon your hour." (identical) |
| Ch1 ¶8 | "FRANCISCO. For this relief much thanks. 'Tis bitter cold, And I am sick at heart." | "For this relief much thanks. 'Tis bitter cold, / And I am sick at heart." (identical, verse line break flattened to a space) |
| Ch1 ¶17 | "MARCELLUS. O, farewell, honest soldier, who hath reliev'd you?" | "O, farewell, honest soldier, who hath reliev'd you?" (identical) |

Also checked the scene list at the top of both texts (act/scene titles: "A
platform before the Castle", "A room of state in the Castle", "A room in
Polonius's house", etc.) — identical wording and order to the served file's
chapter titles. The served file's word count for the whole play (~31,600
words across all 20 chapters) is consistent with the PG file's body
(~32,000 words, the difference being PG's contents list, act/scene headers,
and front/back matter, which the served JSON strips).

**Conclusion:** the served `original-en` is the text of Project Gutenberg
ebook #1524, reflowed into one JSON paragraph per speech/direction/heading.
PG #1524 carries no translator or modern editor — it is Shakespeare's text
in a standard, long-public-domain modernized-spelling form (the same family
of edited text used across most public Shakespeare editions: modernized
spelling and punctuation from the original Quarto/Folio readings, no 20th/21st-
century copyrighted editorial apparatus). No specific editor is named in the
PG header or footer.

## 3. Public domain status

Shakespeare's Hamlet (written c. 1600–1601) has been public domain
worldwide for centuries; there is no live authorial copyright question.
The only question is whether the specific edited/modernized-spelling text
used carries a later editor's copyright. PG ebook #1524 is Project
Gutenberg's own long-standing plain-text Hamlet, distributed since the
1990s under Gutenberg's usual public-domain terms (its header calls it "the
Project Gutenberg EBook of Hamlet"), with no separate named living editor or
publisher asserting rights over the specific wording. Public domain in the
US and in Denmark/EU. Project Gutenberg's own header, footer and trademark
are not carried into the served file, so PG's trademark-license terms do
not attach; the text itself is what is reused.

No copyrighted modern paraphrase (e.g. No Fear Shakespeare, or any other
in-copyright modern-English version) was consulted at any point in this
task, per the workflow's hard rule.

## 4. Paragraph format (so the candidate matches exactly)

Inspected the served `original-en` chapter objects directly
(`{"number", "title", "section", "paragraphs": […]}`). Each entry in
`paragraphs` is one of:

- **A stage direction**, in square brackets, exactly as printed:
  `"[Enter Francisco and Barnardo, two sentinels]"`, `"[Exit.]"`,
  `"[Re-enter Ghost]"`, `"[The cock crows.]"`, `"[Exeunt.]"`. These are kept
  byte-for-byte identical in the candidate — they are already plain English
  and are not part of what gets modernized.
- **A speech**, formatted `"SPEAKER. text"` — the speaker's name in capitals
  followed by a period and a space, then the character's full speech as one
  string. Where the original verse ran across multiple lines, the served
  JSON has already joined those lines into one string with the line breaks
  replaced by single spaces; the capital letter that began each verse line
  in print survives mid-string (an artifact of the source layout, not of
  sentence structure). There are no literal `\n` characters inside any
  paragraph (checked programmatically for chapter 1: none found).
  Punctuation and dashes for interrupted lines (`"Marcellus and myself, The
  bell then beating one—"`) are kept as the source has them.
- No paragraph in chapter 1 spans more than one speaker; each speaker turn,
  however many verse lines, is exactly one paragraph.

The candidate keeps this same shape: one candidate string per source
paragraph, in the same order; stage directions copied verbatim; each speech
rendered as one flowing modern-English passage (ordinary sentence-initial
capitalization only, since the mid-string verse capitals are a layout
artifact not reproducible without the original line breaks — see
`GLOSSARY.md`, "Verse capitalization").

## 5. Chapter 1 (Act 1, Scene 1) verification

- Extracted from the served `original-en`, chapter `number: 1`, title
  "Act 1, Scene 1 — Elsinore. A Platform Before the Castle", **71
  paragraphs**, source word count 1,401. Byte-identical to the served file's
  chapter 1 (see `ch01/provenance.json` for the extraction hash).
- Candidate v1 drafted paragraph-for-paragraph against this extraction: 71
  paragraphs, candidate word count 1,406, **overall ratio 1.0036** (no
  expansion). The lowest single-paragraph ratio is C01-P030 (0.769: a
  13-word source line compressed to 10 words with no loss of content —
  Marcellus's "Peace, break thee off. Look where it comes again." →
  "Quiet, stop there. Look, it's coming again."); no paragraph drops below
  0.90 by enough to lose an image or a step of the argument, and every
  compression is recorded in `ch01/continuity.md`.
- Full per-paragraph word counts and ratios are in
  `ch01/provenance.json`.

## 6. What changes downstream if a replacement scene is adopted

Recorded for the coordinator and Anders; none of it is done or decided here.

- The served `modern-en`, its R2 audio, and any saved reading positions key
  on the served paragraph structure. Because this package keeps the exact
  paragraph count and order of the served `original-en` for every scene it
  touches, adopting a scene's candidate replaces only that scene's text in
  `modern-en` — paragraph indices, audio segmentation, and position data do
  not shift, so no regeneration is required by paragraph-count changes
  (unlike the Meditations case, where a corrected original with a different
  paragraph count forced full downstream regeneration).
- Only Act 1 Scene 1 is drafted and frozen in this task. Full-book adoption
  requires all 20 scenes to go through the same eight steps.

## 7. Reproduction

```bash
cd books/staged-replacements/hamlet
sha256sum ../../../app/public/data/editions/hamlet-original-en.json   # 77f9bf6e…
sha256sum ../../../app/public/data/editions/hamlet-modern-en.json    # b3558307…
curl -sS https://www.gutenberg.org/files/1524/1524-0.txt | sha256sum  # df57d938…
sha256sum ch01/source-ch01.json      # 4cce71c4…
sha256sum ch01/candidate-v1.json     # ea6280a7…
sha256sum ch01/manifest.json         # 465077f1…
```
