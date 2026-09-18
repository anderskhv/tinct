# Modern-EN Repair — Audit Status

**Date:** 2026-05-23
**Audit scope:** wealth-of-nations, leviathan, don-quixote, essays-montaigne, anna-karenina

## Classification method

Per-chapter similarity between `*-original-en.json` and `*-modern-en.json`, weighted by paragraph length. Buckets:

- **MECHANICAL** (sim ≥ 0.97) — virtually unchanged. Comma swaps, quote-style normalization, occasional spelling fix.
- **LIGHT** (sim 0.85–0.97) — dictionary lemma replacement (e.g., `onely → only`, `attayned → attained`, `Connexion → Connection`) and quote/apostrophe substitution. Still not a modern rendering.
- **REAL** (sim 0.50–0.85) — genuine sentence-level rewrites, modernized syntax.
- **REAL-HEAVY** (sim < 0.50) — heavy paragraph-by-paragraph modernization.

All 5 books pass structure invariants: chapter count matches and per-chapter paragraph count matches the original exactly. Word-count ratio is 1.00 across the board — the strongest single signal that most "modern" output is the original text with cosmetic tweaks.

## Results

| Book | Total ch | REAL-HEAVY | REAL | LIGHT | MECHANICAL | Needs regen |
|---|---|---|---|---|---|---|
| wealth-of-nations | 32 | 1 (ch1) | 4 (ch2–5) | 5 (ch6–10) | 22 (ch11–32) | **27** |
| leviathan | 49 | 23 (intro, ch1–22) | 0 | remaining mix | remaining mix | **27 (ch23–49)** |
| don-quixote | 126 | 0 | 0 | 3 (ch6, 85, 95) | 123 | **126** |
| essays-montaigne | 107 | 0 | 0 | 0 | 107 | **107** |
| anna-karenina | 239 | 0 | 0 | 11 | 228 | **239** |

**Total chapters needing real modern rendering: 539. Source word count to render: ~1.75M.**

## Concrete evidence

The actual paragraph diffs make the verdict unambiguous (full samples in audit run).

### MECHANICAL examples (verbatim, not modernized)

**Don Quixote ch1 para 5** (155 words) — *identical*:
> "In short, his wits being quite gone, he hit upon the strangest notion that ever madman in this world hit upon, and that was that he fancied it was right and requisite, as well for the support of his own honour as for the service of his country, that he should make a knight-errant of himself..."

(modern-en is the same string, word for word.)

**Montaigne ch1 para 5** (505 words) — *identical*:
> "The Emperor Conrad III. having besieged Guelph, Duke of Bavaria,--[In 1140, in Weinsberg, Upper Bavaria.]--would not be prevailed upon, what mean and unmanly satisfactions soever were tendered to him, to condescend to milder conditions than..."

**Anna Karenina ch1 para 12** (92 words) — *identical*:
> "There happened to him at that instant what does happen to people when they are unexpectedly caught in something very disgraceful. He did not succeed in adapting his face to the position in which he was placed towards his wife..."

### LIGHT examples (lemma-substitution only)

**Leviathan ch5** — `onely → only`, `attayned → attained`, `Connexion → Connection`, `syllogismes → syllogisms`. Sentence structure, vocabulary, archaic phrasing all untouched.

**WoN ch6** — comma swap. That is the only change. ("add to the price of the corn**,** the profits" → "add to the price of the corn the profits").

### REAL-HEAVY example (genuine modernization)

**Leviathan ch12 para 17** — proves what the standard looks like:

> ORIG: "The same authors of the Religion of the Gentiles, observing the second ground for Religion, which is mens Ignorance of causes; and thereby their aptnesse to attribute their fortune to causes, on which there was no dependence at all apparent, took occasion to obtrude on their ignorance, in stead of second causes, a kind of second and ministeriall Gods; ascribing the cause of Foecundity, to Venus..."

> MOD: "The same authors of the religion of the Gentiles, observing the second ground of religion — namely men's ignorance of causes, and their consequent readiness to attribute their fortune to causes on which there was no apparent dependence — took the opportunity to foist on this ignorance, in place of secondary causes, a kind of second-rank, ministering gods: ascribing fertility to Venus..."

That's the bar. Most of the corpus does not meet it.

## What the recent commits actually shipped

- `02f11009` "checkpoint wealth of nations modern english" — checkpoint
- `08895904` "fill WoN modern-en ch11-32 (light-touch modernization)" — the 22 MECHANICAL chapters of WoN
- `76a607fc` "fill Leviathan modern-en ch5-12 + ch18-49 (light modernization)" — most of the LIGHT and MECHANICAL Leviathan chapters
- `45e51394` "fill DQ/Montaigne/AK modern-en + strip DQ image artifacts" — the entirety of DQ, Montaigne, and AK as mechanical/light only
- `d1772afb` "chore: clarify modern edition standards" — the docs update
- `e0cf48fd` "real modern rendering of Leviathan ch4-11" — repaired 8 Leviathan chapters to REAL-HEAVY
- `d8b285d2` "real modern rendering of Leviathan ch17-22" — repaired 6 more Leviathan chapters to REAL-HEAVY

The label "light-touch modernization" was used in commit messages; the result for most chapters is no modernization at all.

## Implication for `modern-da`

The Danish modern-da files were generated from `modern-en`. Where `modern-en` is essentially the source text, `modern-da` was translated from archaic/early-modern English rather than from a real modern reading edition. Danish quality is bounded by English source quality. Re-translation of `modern-da` will be required for every chapter we re-render in `modern-en`.

This was the right call: **do not start modern-da work yet.**

## Scope decision needed

1.75M words of paragraph-by-paragraph modern rendering cannot fit one session. Realistic shapes:
- **A. Priority order.** Pick one book to make fully correct first, then move on. Suggested order based on reader value and apparent gaps: Leviathan (finish what's started) → Don Quixote → Anna Karenina → Montaigne → Wealth of Nations.
- **B. Chapter-by-chapter chunks across all books.** Spread effort, keep all books "in progress." Worst for shipping.
- **C. Triage by reading order.** Render only chapters 1–N for each book first, so a reader landing on any of these has a real opening experience. Backfill later.

No new files committed yet. The 5 modern-en files on disk are the existing (mostly-mechanical) outputs; this report is the only new artifact.

## Files

- This report: `books/MODERN-EN-REPAIR-STATUS.md`
- Audit scripts: `/tmp/classify_modern_en.py`, `/tmp/diff_samples.py` (re-runnable, not committed)

## 2026-05-29 update

Anna Karenina `modern-en` has been fully re-rendered and checked:

- Structure preserved: 239 chapters, 7,442 paragraphs.
- JSON validates.
- `python3 books/audit-truncation.py anna-karenina en`: 0 truncation flags after final patch.
- `python3 books/content-verify.py anna-karenina original-en modern-en`: only two false positives remain, caused by common words being interpreted as proper nouns.
- Identical paragraphs vs `original-en`: 133 / 7,442 (1.8%).
- Average chapter similarity vs `original-en`: 0.284.

Follow-up required: regenerate `modern-da` from the repaired `modern-en`, then generate/upload `anna-karenina/modern-en` Kokoro audio and Danish audio.

---

# 2026-09-18 — Reconciliation and evidence-based queue

Scope: **only books with existing review evidence.** This is not a fresh whole-library audit. Coverage and dates of the evidence are stated per row; books without a row have not been assessed under the current criteria. Procedure: the modern-en repair section of `books/TRANSLATION_PROTOCOL.md` (added 2026-09-18). Similarity numbers below are from `books/classify-modern-en.py --gate` run on the live files at this date.

## What changed since the May audit

The five books audited in May (wealth-of-nations, leviathan, don-quixote, essays-montaigne, anna-karenina) **now pass the similarity gate** (weighted similarity 0.21–0.37). They were re-rendered between May and September; the May "539 chapters need regen" figure is obsolete for them. They have not been through the two-gate procedure and carry no accessibility evidence.

## Queue

### A. Rights, source or structural blockers

| Book | Evidence (date) | Blocker | Action |
|---|---|---|---|
| war-and-peace | edition_checks.py + close-read (2026-09-18) | Source mislabels the final chapter of every Book with the next Book's name (16 chapters); modern-en additionally has duplicate "Book Two — Chapter 1" and "Chapter 5" titles introduced by the repair branch | Structural repair of titles across original-en, modern-en, modern-da together; modern-en titles for ch 28–33 restored to mirror source. Not a drafting task. |
| war-and-peace | CONVENTIONS.md (2026-09-18) | French handling uses three conventions; footnote-slot paragraphs cannot be dropped without touching all editions | DECISION NEEDED (Anders): adopt the proposed single convention, then one scripted pass plus review |
| war-and-peace | CONVENTIONS.md | Cast tab uses Russian name forms, text uses Maude's anglicised forms | DECISION NEEDED: recommend aligning the cast file to the text |

### B. Meaning or completeness repairs (fidelity)

| Book | Evidence (date) | State | Action |
|---|---|---|---|
| confessions | branch b269fb96 repair log; gate FAIL on live file (sim 0.926, 9/13 books identical to source) | 9 books drafted (Sonnet), reviewed (Opus), corrected, verified, accepted with hashes; **never merged into the live file**; Codex spot-check of an earlier version found dense language and one meaning error | Classify as *repaired; verify latest version against the two-gate criteria*. Assemble the 13-book file from the accepted hashes, run Gate A (accessibility, candidate-only) on all 13, re-verify only what it flags plus the Codex-reported error location if supplied. Do not redraft. |
| jane-eyre | branch b269fb96 repair log | Ch 27 tail, 35, 36, 37, 38 accepted after Opus review; live file untouched | Merge the accepted chapters; then Gate A on those chapters |
| war-and-peace | 16-batch close-read (2026-09-17/18) + independent 24-chapter close-read (2026-09-18) | Fidelity certifiable: no MAJOR defects in 24 sampled chapters; residual minor drift (dropped clause, softened word) in about half the chapters; one grammar error ch 203 p38 | Caught by Gate B as chapters pass through the accessibility procedure; no separate fidelity pass |
| the-awakening, jerusalem, vindication-rights-of-woman, brothers-karamazov | gate FAIL (sim 0.87–0.93; 8–37% of long paragraphs identical to source); Codex divergence audit 2026-09-12 | modern-en is largely the source text, so it is "faithful" only trivially | Real rendering needed under the two-gate procedure. Order by reader difficulty: Vindication (33% of sentences over 40 words) first; Karamazov is 349k words and its source is already plain Garnett prose, so scan for hard chapters before committing to a full render |
| walden, jungle-book, heart-of-darkness | gate FAIL (sim 0.95–0.97) | passthrough | Walden has real readability need (21% of sentences over 40 words). Jungle Book and Heart of Darkness read easily already; lowest priority, a light pass may be all they need |
| ulysses | gate FAIL (sim 0.937, 48% identical long paragraphs) | passthrough | DECISION NEEDED: whether modernising Joyce serves the reader at all. Not queued until decided |

### C. Faithful but insufficiently accessible

| Book | Evidence (date) | Where | Action |
|---|---|---|---|
| war-and-peace | sentence and similarity metrics + close-reads (2026-09-18) | Essays ch 338–365 (mean sentence 23.5 words, unchanged from Maude; 164 sentences over 50 words); ch 154–278 largely near-verbatim Maude (22 chapters more than half near-verbatim) | Pilot on ch 274 and 355 (this session, results below), then essays and mid-book first |
| genealogy-of-morals, on-liberty, discourse-on-inequality, leviathan, descartes-meditations, don-quixote, symposium, second-treatise, beyond-good-and-evil, utilitarianism, kant-groundwork, hume-enquiry | library-wide sentence metrics (2026-09-18): 28–38% of sentences over 40 words, mean sentence 30–38 words | whole books | Candidates for the Gate A scan once the procedure is approved; no chapter-level evidence yet |

### D. Editions good enough to retain

| Book | Evidence (date) | Note |
|---|---|---|
| wealth-of-nations, leviathan, don-quixote, essays-montaigne, anna-karenina, jane-eyre | gate PASS (2026-09-18) | Genuinely modernised; no accessibility evidence either way. Leviathan and Don Quixote also appear in C on sentence metrics. |
| Shakespeare plays, frankenstein, gilgamesh, romeo-and-juliet and the other 60-odd books at the bottom of the sentence-metric ranking | library-wide metrics (2026-09-18) | Retain; nothing indicates repair. |

### Danish (kept separate from the modern-en queue)

- odyssey modern-da: April 2026 spot-check PASS 4.2/5, review queue of 5 article-usage items. Not modern-en evidence.
- war-and-peace modern-da: chapters 218, 220, 223, 226, 229, 340, 344, 350 run under 80% of source length (2026-09-18 ratio scan). Danish workstream.
- confessions modern-da: translated from the pre-repair modern-en; re-translate after the modern-en is accepted.

## Pilot results (War and Peace ch 274 and 355)

_Filled at the end of the 2026-09-18 session; see `books/wip/war-and-peace-repair/pilot/`._
