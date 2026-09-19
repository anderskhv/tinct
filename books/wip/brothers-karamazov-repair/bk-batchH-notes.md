# Batch H — Modern English rendering notes

Source: `bk-batchH-source.json` (Garnett original-en, chapters 85–96 — Book XII
"A Judicial Error" chapters VI–XIV, plus the full Epilogue: "Plans for
Mitya's Escape," "For a Moment the Lie Becomes Truth," and "Ilusha's
Funeral. The Speech at the Stone"). This batch covers the prosecutor's and
defense's closing speeches at the trial, the verdict, and the novel's
ending.

Output: `bk-batchH-modern-en.json`, same 12-chapter array shape as the
source (`number`, `title`, `section`, `paragraphs`).

## Paragraph-count verification (programmatic)

Ran a script comparing `len(paragraphs)` per chapter between source and
output, plus an overall JSON-validity check (`python3 -m json.tool`) and a
per-paragraph word-count ratio check (flagging any paragraph ≥15 source
words where the rendering fell under 75% of the source word count).

Result: **all 12 chapters match exactly**, total 426 paragraphs in both
files:

| Chapter | Title | Paragraphs (src = mod) |
|---|---|---|
| 85 | VI. The Prosecutor's Speech. Sketches Of Character | 23 |
| 86 | VII. An Historical Survey | 13 |
| 87 | VIII. A Treatise On Smerdyakov | 24 |
| 88 | IX. The Galloping Troika. The End Of The Prosecutor's Speech. | 73 |
| 89 | X. The Speech For The Defense. An Argument That Cuts Both Ways | 11 |
| 90 | XI. There Was No Money. There Was No Robbery | 17 |
| 91 | XII. And There Was No Murder Either | 18 |
| 92 | XIII. A Corrupter Of Thought | 22 |
| 93 | XIV. The Peasants Stand Firm | 53 |
| 94 | I. Plans For Mitya's Escape | 28 |
| 95 | II. For A Moment The Lie Becomes Truth | 57 |
| 96 | III. Ilusha's Funeral. The Speech At The Stone | 87 |

**Total: 426 / 426.** No paragraphs merged, split, reordered, dropped, or
invented; paragraph *N* in the output begins with content equivalent to
paragraph *N* of the source in every chapter.

Only one paragraph (ch. 96, para. 49 — Kartashov's one-line interjection
about the salmon) fell under the 75%-of-source-word-count guideline (68%);
it's a two-clause dialogue tag with nothing substantive to preserve beyond
what's there, so no content was lost. Every other paragraph in the batch is
at or above source length (average ratios 1.00–1.05 per chapter — the
modern rendering runs slightly longer than Garnett on the whole, which is
expected: Garnett's clipped Victorian syntax often compresses relative
clauses that read more naturally when unpacked in contemporary English).

## Judgment calls

- **Proper-noun spelling convention.** Checked the existing `modern-en`
  edition for how earlier chapters had already rendered names, and matched
  it exactly rather than introducing a new convention: "Fyodor Pavlovitch,"
  "Dmitri Fyodorovitch," "Ivan Fyodorovitch," "Ippolit Kirillovitch,"
  "Fetyukovitch," "Madame Svyetlov," "Nikolay Parfenovitch," "Trifon
  Borissovitch," "Krassotkin," "Hohlakov" — i.e., Garnett's own
  transliterations, kept as proper nouns rather than modernized to "-vich"
  forms. Chapter titles and `section` labels were also left exactly as in
  the source, again matching how the rest of the existing modern-en edition
  handles chapter titles (unmodernized, since they're already plain
  English).
- **Courtroom-speech register.** The bulk of this batch is oral argument
  (the prosecutor's and defense's closing speeches) and needed to read as
  spoken advocacy — periodic sentences, rhetorical questions, direct
  address to the jury — rather than as written prose. I kept the
  paragraph-long single-sentence constructions where Garnett has them
  (e.g., Fetyukovitch's extended hypotheticals) rather than breaking them
  into shorter modern sentences, since breaking them would have changed the
  rhetorical build that's part of the content being preserved. Word choice
  was modernized throughout (e.g., "I venture to suggest" → kept as
  natural modern hedging; archaic connectives like "for" used as
  "because," "indeed," "quite" as intensifier were replaced with
  contemporary equivalents) without shortening the arguments themselves.
- **Nested quotations.** Garnett's speeches quote Mitya's letter, Smerdyakov's
  testimony, Rakitin's remark, Gospel verses, etc., inside the larger
  speech. Kept the same quote-within-quote structure (outer speech in
  curly double quotes, inner quoted material in curly single quotes) to
  preserve who is being quoted and matching the existing edition's
  punctuation convention.
- **Gospel and Latin quotations.** "Fathers, provoke not your children to
  wrath," "vivos voco," "What measure ye mete it shall be measured unto you
  again," and the Good Shepherd passage were kept as direct quotations
  (lightly modernized only where Garnett's own phrasing was archaic, e.g.
  "vivos voco" left in Latin since it's presented as Latin in the source)
  rather than paraphrased, per the instruction to preserve quotations and
  religious content faithfully.
- **Crowd-chatter passages** (end of ch. 88, most of ch. 93) — short,
  choppy, multi-voice courtroom-gallery dialogue. Rendered each line as its
  own paragraph exactly as segmented in the source (confirmed this was
  already the correct segmentation — many "paragraphs" in these chapters
  are a single line of crowd dialogue or a one-word attribution like "In a
  third group:"). Kept the colloquial, gossipy tone rather than smoothing
  it into more formal prose.
- **Chapter 92 footnote-marker paragraph split.** Verified programmatically
  (via direct inspection of the raw JSON) that "Let the son stand before
  his father..." and the parenthetical "(Here the orator was interrupted
  by irrepressible...)" are two separate source paragraphs (15 and 16), not
  one — my first-pass reading of the flowing text had briefly conflated
  them, so I re-checked paragraph boundaries directly against the source
  JSON before finalizing rather than trusting my own paraphrase of the
  text.
- **Chapter 96 footnotes.** The source's translator's footnotes ("[1] In
  Russian, 'silen.'" etc.) are stored as ordinary paragraph entries in the
  same `paragraphs` array as the narrative text (after "THE END" /
  "FOOTNOTES" marker paragraphs). Rendered each footnote in modern English
  as its own paragraph to preserve the 1:1 count, since removing or merging
  them would have broken paragraph alignment with the original-en and
  (eventually) modern-da editions.
- **Crude/theological content preserved as-is.** Fyodor Pavlovitch's
  cynicism, the account of the Finnish infanticide case, Smerdyakov's
  "Everything is lawful" line, the parricide-as-prejudice argument, and the
  Orthodox/"crucified lover of mankind" exchange were all rendered in full,
  without softening, per the instruction not to sanitize theologically
  provocative or uncomfortable content.
- **Character voicing.** Kept Ippolit Kirillovitch's prosecutorial voice
  brittle, overwrought, and a little vain (esp. the troika peroration and
  his flustered second speech); Fetyukovitch cool, precise, and
  rhetorically controlled until his own late swing into pathos; Mitya's
  epilogue dialogue raw, self-interrupting, and emotionally volatile;
  Alyosha's stone-speech register warm, plain, and exhortatory rather than
  literary, since it's addressed to children.

## Scope discipline

Touched only the two files named above
(`bk-batchH-modern-en.json`, `bk-batchH-notes.md`) inside
`books/wip/brothers-karamazov-repair/`. Did not modify
`bk-batchH-source.json`, any file under `app/`, the live
`brothers-karamazov-modern-en.json` edition, `bookRegistry.ts`, or any other
part of the repo, and made no commits.
