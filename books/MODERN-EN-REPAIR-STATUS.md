# Modern-EN Repair — Audit Status

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](../STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

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

The Danish modern-da files were generated from `modern-en`. Where `modern-en` is essentially the source text, `modern-da` was translated from archaic/early-modern English rather than from a real modern reading edition. Danish quality is bounded by English source quality. If Danish is explicitly reopened in future, its source-version dependencies will need review before reuse; this is not a current regeneration requirement.

**Current decision (2026-09-21): Danish is outside the strategy.** Do not restart Danish work when English repairs finish.

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

The May follow-up requiring Danish regeneration and Danish audio is superseded. English audio follow-up belongs to the current audio work plan; no Danish dependency blocks it. The historical observations above have not been rerun.
