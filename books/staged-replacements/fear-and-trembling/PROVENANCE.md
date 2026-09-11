# Fear and Trembling — provenance, rights verdict, and source decision

**Prepared:** 2026-09-11, content-only staging work. Nothing here is
published, merged, registered, or deployed. All claims below were verified
against the actual files in this repository (git history, the served JSON,
`bookRegistry.ts`, `books/raw/fear-and-trembling/SOURCE.md`) and against web
searches for the known English translations; nothing is asserted from memory
alone unless marked as such.

## 1. What the served files are

Four editions are registered for `fear-and-trembling` in
`app/src/data/bookRegistry.ts`:

| key | label shown to readers | file |
|---|---|---|
| `original-da` | "Original (1843)" | `fear-and-trembling-original-da.json` |
| `original-en` | "Original (English)" | `fear-and-trembling-original-en.json` |
| `modern-en` | "Modern English" | `fear-and-trembling-modern-en.json` |
| `modern-da` | "Moderne Dansk" | `fear-and-trembling-modern-da.json` |

The registry gives **no translator credit** for `original-en`. Git history
tells the real story, and it is not what the label implies.

### `original-da` — genuinely the 1843 original

Commit `ae1b7cb58` (Anders Hvelplund, 2026-04-25, "Add Kierkegaard's Fear and
Trembling (1843)") added `original-da`, `modern-en`, and `modern-da` together.
Its message states plainly: **"First Tinct book with Danish as the source
language and no PD English translation bridge."** `original-da` is a Google
Books OCR scan (Internet Archive, University of California copy) of the 3rd
edition ("3. Udg.") reprint, in 1843 orthography, per
`books/raw/fear-and-trembling/SOURCE.md`. This is the real Danish original,
public domain (Kierkegaard died 1855).

### `original-en` — added ten days later, and it is not a real historical translation

`original-en` did **not** exist at that first commit — there was, correctly,
"no PD English translation bridge." It was added afterward, in commit
`b76fa5649` (Anders Hvelplund, 2026-05-04, "Add original-en edition for Fear
and Trembling"). The commit message, verbatim:

> Formal/period English translation of Frygt og Bæven, generated from
> the 1843 Danish source in a Lowrie/Hannay-adjacent register. 8 chapters,
> 232 paragraphs, paragraph-aligned with original-da. No PD historical
> translation exists for this work (Lowrie 1941, Hannay 1985, Hong 1983
> all in copyright), so original-en is freshly authored.
>
> Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

So: the file registered and labeled to readers as plain **"Original
(English)"** — with no qualifier — is in fact an AI-authored (Claude Opus)
translation from 2026, written in what its own commit message calls a
**"Lowrie/Hannay-adjacent register"** — i.e., deliberately styled to read
like the two best-known copyrighted 20th-century English translations,
Walter Lowrie's (Princeton, 1941) and Alastair Hannay's (Penguin, 1985).

**Independent check against that self-description, done for this task:**
reading the served `original-en` Preface against web-searchable excerpts of
Lowrie 1941, Hannay 1985 (Penguin), and the Cambridge (Walsh) editions:

- The served text is **not a verbatim match** to any of the three — no
  sustained run of identical wording was found against any searchable
  excerpt.
- But it is **suspiciously close in specific word choices** to Hannay in
  particular: the served text's "Every speculative score-keeper, who
  conscientiously points up the significant progress of recent philosophy"
  echoes a documented Hannay rendering, "every speculative score-keeper who
  conscientiously marks up the momentous march of modern philosophy" —
  same unusual choice of "score-keeper" for Kierkegaard's French loanword
  "Marqueur," and the same clause shape, with only the verb and a couple of
  nouns swapped. That degree of overlap on an unusual, non-obvious word
  choice is exactly the fingerprint of a model that has memorized fragments
  of the copyrighted Hannay text and is reproducing them with light
  paraphrase — which is itself a derivative-work risk distinct from, and in
  some ways worse than, an honest AI translation done from scratch (a
  paraphrase of copyrighted text is not automatically clear of the
  original's copyright).
- Other passages (the Adresseavisen sentence, "paragraph-glutton" for
  "Paragraphsluger," "systematic peeping-Tom" for "systematisk Posekigger")
  did not match any translation found searchable online, and may be the
  model's own invention — which does not resolve the risk, since the same
  file mixes those with the Hannay-adjacent passage above.

**Rights verdict: UNCERTAIN.** The served `original-en` is not a real
historical public-domain translation (it postdates 2026 and was written by an
AI model), so it cannot be staged as "PUBLIC DOMAIN." It is not proven to be
a verbatim copy of a copyrighted work either, so "COPYRIGHTED" is too strong
a claim to make outright. But its own commit message admits it was
deliberately written to sit in the stylistic register of two specific
copyrighted translations, and at least one passage shows the word-level
fingerprint of memorized-and-paraphrased Hannay. That is enough to disqualify
it as a drafting source under this task's instructions, and it is also a
live legal exposure for Tinct independent of this task:

1. It is mislabeled to readers as "Original (English)" with no qualifier,
   which misrepresents a 2026 AI paraphrase as a historical translation.
2. If any passage is closer to Hannay (or Lowrie, or Hong & Hong) than
   fair-use paraphrase allows, the file as currently served is a copyright
   problem for the live product, not just for this drafting task.

**This is a decision for Anders, flagged in `00-progress-ledger.md` and the
final report; it is not resolved here.** Per this task's instructions, since
`original-en` is UNCERTAIN, the modern-English edition is **not** drafted
from it.

### `modern-en` (served) — same category as `original-en`, also not used

The served `modern-en` (sha256 `152776f1…`) was generated in the same
2026-04-25 commit as `original-da`, described in that commit only as "Opus
translation directly from Danish." It was not read for this task (per
`WORKFLOW.md`'s "no other translation consulted for wording" rule, extended
here to cover Tinct's own prior AI-generated `modern-en`, which is exactly
the kind of unreviewed, API-generated content this staged-replacement effort
exists to replace). The new candidate in `ch01/` is drafted fresh, from the
Danish, in this conversation, at zero API spend.

## 2. Source decision: draft from the Danish original

`original-da` (`fear-and-trembling-original-da.json`) is the public-domain
1843 text and is used as the sole source for the modern-English candidate.
No English translation — served `original-en`, served `modern-en`, or any
published translation (Lowrie, Hannay, Hong & Hong, Payne, or any other) —
was read or consulted for phrasing while drafting `ch01/candidate-v1.json`.

## 3. Chapter/paragraph alignment: Danish vs. served English — identical

Checked directly against both served files:

| # | Chapter (Danish) | Chapter (English) | Danish ¶ | English ¶ |
|---|---|---|---|---|
| 1 | Forord | Preface | 5 | 5 |
| 2 | Stemning | Exordium | 13 | 13 |
| 3 | Lovtale over Abraham | Eulogy on Abraham | 17 | 17 |
| 4 | Foreløbig Expectoration | Preliminary Expectoration | 42 | 42 |
| 5 | Problema I | Problema I | 32 | 32 |
| 6 | Problema II | Problema II | 29 | 29 |
| 7 | Problema III | Problema III | 88 | 88 |
| 8 | Epilog | Epilogue | 6 | 6 |
| **Total** | | | **232** | **232** |

Both files have exactly 8 chapters and 232 paragraphs, chapter-by-chapter and
paragraph-by-paragraph identical in count (matches the 2026-04-25 commit
message's "232 paragraphs, paragraph-aligned with original-da" and the
Book Addition Checklist's expectation of paragraph-aligned editions).
**Consequence: no split-view alignment problem.** The modern-English
candidate, though drafted from Danish, keeps the same 8/232 chapter and
paragraph structure as both served files, so split-pane and paragraph-keyed
features (audio, Cast, reading position) are unaffected by the source
switch. This was spot-checked further: paragraph 0 of Danish chapter 1 ends
mid-sentence at "det er en stor" and served English chapter 1 paragraph 0
ends mid-sentence at "it is a great" — the same OCR-page-break artifact
lands at the same paragraph boundary in both files, confirming the alignment
is real and not a coincidence of matching paragraph *counts* only.

## 4. Danish source quality

`books/raw/fear-and-trembling/SOURCE.md` documents known OCR artifacts in the
Danish raw text (page-break hyphenation, running headers, page numbers,
garbled Roman numerals in the Stemning chapter, footnote/Greek OCR garbage,
short mid-sentence page-break fragments under 60 characters). The served
`original-da.json` is the already-cleaned product of that parse; Chapter 1
was read in full for drafting and contains no unresolved OCR garbage other
than the two typographic artifacts documented in `ch01/continuity.md`
(scanned "$" for "§" in the Latin footnotes; stray internal hyphenation in
two Latin words), which are corrected as mechanical normalization of a
quotation, not translated.

## 5. What changes downstream if this replacement is adopted

Nothing yet — this package is entirely staged under
`books/staged-replacements/fear-and-trembling/`. Adoption would require (a) a
decision from Anders on the `original-en` rights question in section 1, since
today's `original-en` is served to every reader with no rights caveat, and
(b) replacing `modern-en` chapter by chapter as each chapter clears
independent review, per `WORKFLOW.md`.
