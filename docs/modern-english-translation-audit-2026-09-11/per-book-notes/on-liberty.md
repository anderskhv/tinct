# on-liberty — *On Liberty*, John Stuart Mill (1859)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Original (1859)" | `ce17fe17570e069d` | 5 | 126 | 47,029 |
| modern-en "Modern English" | `12be1b0b5132554b` | 5 | 126 | 47,144 |
| modern-da "Moderne Dansk" | `d6e0ac08b19b7672` | 5 | 126 | 44,797 |

`en_editions_aligned: true`, no paragraph-count mismatches, no truncation or empty-paragraph hits,
`pct_identical_long_paragraphs: 3.2`, `mean_weighted_similarity: 0.9577`.

## Core English text — provenance and completeness

English original; no translator. The text matches the Project Gutenberg *On Liberty*
(ebook #34901) body text. **Mill's own footnotes are absent from every edition in Tinct.**
The Gutenberg source carries ~1,025 words of notes; roughly 990 of those are Mill's own
(the 1858 Government Press Prosecutions / tyrannicide note; the Thomas Pooley, Holyoake,
Truelove and Gleichen cases; the Sepoy-insurrection note on religious toleration; the
Humboldt note in ch. 3). Tinct's `original-en` contains no occurrence of "Pooley",
"Truelove", "Gibson" or any footnote marker. This is a source-ingest gap, so it affects
`original-en`, `modern-en` and `modern-da` equally — but it does mean `modern-en` is
incomplete relative to the work.

Body text itself is complete: 5 chapters, correct titles, dedication and Humboldt epigraph
present, no truncation.

## Phase 1 flags — confirmed / disconfirmed

- **`mean_weighted_similarity: 0.9577` (near the mechanical-failure band) — CONFIRMED, and it
  understates the problem.** The mechanical `pct_identical_long_paragraphs` of 3.2% only counts
  byte-identical paragraphs; because this edition converts `--` to spaced em-dashes and
  Anglicises→Americanises spelling, almost nothing is byte-identical even where nothing was
  translated. Recomputing on normalised word tokens (lowercase, punctuation and dashes
  stripped), **93 of 120 long paragraphs (78%, and 79% of all words) are ≥0.97 identical to
  Mill's 1859 text.**
- Per-chapter median word-level similarity (lower = more modernised):
  `ch1 = 0.93 · ch2 = 0.99 · ch3 = 0.99 · ch4 = 0.99 · ch5 = 0.99`.
  Cosmetic-only paragraph counts: ch1 2/17, ch2 31/43, **ch3 19/19, ch4 19/19, ch5 22/22**.
  Chapters 3, 4 and 5 are, paragraph for paragraph, Mill's original.
- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`,
  `last_chapter_suspiciously_short: false` — all **disconfirmed as problems**; verified by
  reading the chapter-5 tail.

## Samples inspected (8 passages, ~3,100 source words)

### 1. Ch. 1 (Introductory), paras 0–1 — dedication and epigraph. *Genuine modernisation.*
- source: "To the beloved and deplored memory of her who was the inspirer… whose exalted
  sense of truth and right was my strongest incitement, and whose approbation was my chief
  reward… some of the most important portions having been reserved for a more careful
  re-examination, which they are now never destined to receive."
- modern: "To the beloved and lamented memory of her who was the inspirer… whose elevated
  sense of truth and right was my strongest spur, and whose approval was my chief reward…
  Some of the most important sections were held back for a more careful re-examination they
  are now never to receive."
- Finding: faithful, complete, a real readability gain. (Note the modern drops the relative
  pronoun — "re-examination they are now never to receive" — which reads as a small typo.)

### 2. Ch. 1, para 8 (521 words) — society's likings as law. *Genuine modernisation.*
- source: "They preferred endeavouring to alter the feelings of mankind on the particular
  points on which they were themselves heretical, rather than make common cause in defence
  of freedom, with heretics generally."
- modern: "They preferred trying to alter the feelings of mankind on the particular points
  where they were themselves heretical, rather than making common cause with heretics
  generally in defense of freedom."
- Finding: faithful; logical relations and scope intact.

### 3. Ch. 1, para 9 (415 words) — English jealousy of state interference. *Light but real.*
- source: "though the yoke of opinion is perhaps heavier, that of law is lighter"
- modern: "the yoke of opinion is perhaps heavier, but the yoke of law is lighter"
- Finding: faithful. Argument chain ("no recognised principle… people decide according to
  their personal preferences… one side is at present as often wrong as the other") survives
  intact, including the "with about equal frequency" quantifier.

### 4. Ch. 2, para 2 (106 words) — the first of the four arguments from fallibility. *Cosmetic only.*
- source: "First: the opinion which it is attempted to suppress by authority may possibly be
  true… Its condemnation may be allowed to rest on this common argument, not the worse for
  being common."
- modern: "First: the opinion that authority attempts to suppress may possibly be true… Its
  condemnation may rest on this common argument, no worse for being common."
- Finding: a handful of word swaps; not a modern edition of this paragraph.

### 5. Ch. 2, para 9 (579 words) — usefulness vs. truth of an opinion. *Light modernisation.*
- Mechanical outlier: the **lowest** raw character-similarity paragraph in the book (0.014),
  which turns out to be an artefact of `--` → ` — ` normalisation. Word-level similarity is
  0.97. Changes are "practise"→"practice", "extenuation"→"softening", "In point of fact"→"In
  fact". Nothing is lost; nothing is meaningfully modernised. Note "scepticism" is left in
  British spelling inside the quotation (correct) but the surrounding text is Americanised.

### 6. Ch. 3, para 12 (678 words) — mediocrity as the ascendant power. *Verbatim.*
- source: "In sober truth, whatever homage may be professed, or even paid, to real or supposed
  mental superiority, the general tendency of things throughout the world is to render
  mediocrity the ascendant power among mankind."
- modern: identical, word for word, for the whole opening; across the full 678 words the only
  differences are `honour`→`honor`, `vigour`→`vigor`, one comma→em-dash and six deleted
  commas. Word similarity 0.997.
- Finding: **this is the 1859 text presented under a "Modern English" label.**

### 7. Ch. 4, paras 3 and 14 (529 + 225 words). *Verbatim.*
- ch4 p3 diff in full: `doctrine,`→`doctrine`, `good,`→`good`, `for ever`→`forever`,
  `towards`→`toward` (×2), `indirect:`→`indirect;`, `any one`→`anyone`, `himself,`→`himself`,
  one deleted `are`, `warning,`→`warning`. Nothing else, in 529 words.
- ch4 p14 (Spain / married clergy): identical except one capitalised "Or".

### 8. Ch. 5 (Applications), paras 17 and 18 — the ending. *Verbatim.*
- ch5 p17 (99 words): word-similarity **1.000**.
- ch5 p18 (395 words): word-similarity **1.000**; the only change in the whole paragraph is
  `--` → ` — `.
- Finding: the book's closing chapter has not been modernised at all.

## What I did NOT find

No omissions, inventions, chapter-bleed, altered quantifiers, name inconsistencies or
over-glossing anywhere in the eight samples. Where the edition does rewrite (ch. 1, parts of
ch. 2) the rewriting is careful and faithful. The defect is not bad translation; it is **a
modernisation pass that stopped after chapter 1.**

## Phase 3 — human-edition research

Mill's 1859 English is comparatively clear for a thoughtful modern adult — vocabulary is
largely current; the barrier is sentence length and periodic construction, heaviest in ch. 2
and ch. 3. So the first question is whether a modern edition is needed at all, and the answer
is "partly": passages like ch. 3 para 12 are readable as they stand; paragraphs of 500+ words
with three semicolon-joined subordinate chains are not, for a first-read audience.

Candidates for a ready-made accessible English text:

1. **Jonathan Bennett, *Early Modern Texts* — "Liberty" (Mill 1859)**, a complete
   plain-English version. Verified present in the site's catalogue.
   URL: https://www.earlymoderntexts.com/texts
   **Rights: NOT usable.** The site's rights FAQ states: *"Permission is not and will not be
   given for the texts to be put to any commercial use."* Cost-recovery for course copies is
   explicitly allowed; commercial use is explicitly forbidden. Tinct has a paid Premium tier,
   so this is a **noncommercial restriction / permission required**, not a usable licence.
   URL: https://www.earlymoderntexts.com/faqs/rights
2. **Standard Ebooks, *On Liberty*** — https://standardebooks.org/ebooks/john-stuart-mill/on-liberty
   Rights: clean. Standard Ebooks' own production work is dedicated to the public domain via
   CC0 1.0; the underlying Mill text is public domain in the US. But this is *Mill's own text*,
   not a modernisation — it would be an upgrade to `original-en` (proper italics, clean
   typography, footnotes restored), not a replacement for `modern-en`.
3. No complete, rights-clear, human-authored *modern-English* rendering of *On Liberty* was
   found in this search. That is "none found in this search", not "none exists" — but the
   obvious candidate (Bennett) is affirmatively blocked on commercial use.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 3 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 5 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **3.4** — band: **Mixed**.

Fidelity is 3 rather than 5 because ~990 words of Mill's own footnotes are missing from the
edition. Voice is 5 for the trivial reason that four fifths of the book *is* Mill. Clarity is 2
because the edition is advertised as Modern English and, for chapters 2–5, is not.

## Recommendation

**RETRANSLATE** — specifically, run a real modernisation pass over chapters 2–5 (and restore
Mill's footnotes at ingest). Chapter 1 is good work and should be kept as the voice reference.

- Confidence: **high** on the finding (it is a mechanical fact, measured over all 120 long
  paragraphs, not an impression from samples); **medium** on the recommendation, because a
  defensible alternative is to retire the `modern-en` edition for this title and serve
  SOURCE + GLOSSES instead — Mill is the most accessible English original in this batch.
- Correction scope: **substantial** (~37,000 words, chapters 2–5).

## Limitations of this review

Eight passages read closely (~3,100 source words of 47,000). The mechanical similarity
analysis covers 100% of long paragraphs, so the "79% unmodernised" claim is verified for the
whole book; the *quality* claims about the rewritten portions rest on the samples only. I did
not review `modern-da` at all. I did not verify which printing of Mill's text Gutenberg #34901
reproduces (1859 first edition vs. a later lifetime edition) beyond the registry's "Original
(1859)" label. I did not read Bennett's Mill text itself (blocked at the rights step, so
reading it was moot).
