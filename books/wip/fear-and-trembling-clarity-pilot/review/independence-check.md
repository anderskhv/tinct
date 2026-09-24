# Independence check against copyrighted English translations

## Why this check exists

The provenance research (see `PROVENANCE.md`) found no public-domain English
translation of the complete work. It also found that the served `original-en`
and `modern-en` carry word choices and long clauses from the copyrighted Lowrie
(1941, renewed 1969) and Hong (1983) translations. A model drafting from the
Danish can reproduce memorized phrasing without meaning to. So the pilot was
measured against those translations as well.

## Method

- Reference texts:
  - Lowrie 1941 (Anchor 1954 printing): Problem I start to Problem III start.
  - Hong & Hong 1983: Problema I start to Problema III start.
  - Both come from archive.org OCR, fetched during the provenance research. They
    are held only in the session scratchpad and are **not committed**, because
    they are in copyright.
- Neither text was read while drafting. They were used only as detection
  references after each draft.
- Metric: share of the candidate's words that fall inside a word sequence of
  length *n* that also occurs in Lowrie or Hong (the union of the two).
  Tokens are lowercased and punctuation is dropped.
- Masking: fixed technical formulas are masked in every text before comparison,
  so they neither count nor bridge runs. The masked formulas are "single
  individual", "spiritual trial", "teleological suspension of the ethical",
  "absolute relation to the absolute", "higher than the universal", "by virtue of
  the absurd", "knight of faith", "tragic hero", and the Boileau quotation.
- Calibration: Lowrie measured against Hong. This is how much two independent
  human translations of the same Danish converge.

## Results (Problema I + II, masked)

| Text | 8-word runs | 12-word runs | 16-word runs |
|---|---|---|---|
| *Calibration: Lowrie vs Hong (single reference)* | *12.6%* | *3.8%* | *1.4%* |
| Served `original-en` (AI-authored, 2026) | 26.1% | 11.1% | 4.6% |
| Served `modern-en` (the baseline) | 35.1% | 17.1% | 7.8% |
| Candidate v2 (before independence revision) | 34.5% | 17.6% | 7.6% |
| Candidate v3 (after independence revision) | 19.9% | 4.2% | 0.0% |
| **Candidate v4 (final, after fidelity fixes)** | **21.0%** | **4.3%** | **0.0%** |

Unmasked, and against Hong alone, v2 had shared 31.7% of its words in 8-word
runs, against 16% between Lowrie and Hong.

## What was done

v2 had the same memorization fingerprint as the served editions. The v3
revision re-rendered from the Danish about 70 sentences that contained runs of
14 or more shared words. The meaning was kept and the phrasing was independent.
The v2→v3 changes are listed in `comparison/v2-to-v3-diff.md`. They were
re-verified against the Danish by a fresh reviewer (`reverification-v3.md`). That review found two places where the rewording had blurred a distinction and several lost echoes. v4 fixes them without reintroducing any shared run of 16 or more words (`comparison/v3-to-v4-diff.md`).

After revision:

- No run of 16 or more words is shared with either translation.
- At 12 words, overlap is at the level of two independent human translations.
- The runs of 12–15 words that remain are close renderings of short Danish
  sentences that any literal translation converges on. Examples: "Behold, I am
  the handmaid of the Lord"; "the ethical is the universal, and as such it is
  also the divine".

The 8-word figure is measured against the union of two references. The
calibration uses a single reference, so the 8-word figure is not directly
comparable with it.

## Consequence for the rest of the book

The same fingerprint appears in the served `modern-en` and `original-en`
across the book. Any extension of this pilot must run this check on every
section before review. Drafting from the Danish is not enough by itself to
guarantee independence.
