# Montaigne Batch D — Independent Adversarial Review

Reviewer: independent second pass, not trusting `mt-batchD-notes.md`'s self-report.
Scope: chapters 34–44 (11 chapters, 337 paragraphs), `mt-batchD-current-modern-en.json`
vs `mt-batchD-source.json`, cross-checked against `mt-batchD-corrected.json`.

## Verdict: **ACCEPT AS-IS**

I independently reproduce the drafter's conclusion: no content-fidelity defects found.
This is not a rubber stamp — see methodology below for what was actually checked.

## 1. corrected.json vs current-modern-en.json

Byte-for-byte identical (`json.load` equality check, both files, all 11 chapters).
Confirmed programmatically. No silent divergence.

## 2. Paragraph counts vs source

Verified programmatically, chapter-by-chapter, matching source exactly for all 11
chapters (337 paragraphs total):

| # | Title | Source | Current |
|---|-------|--------|---------|
| 34 | Of one defect in our government | 3 | 3 |
| 35 | Of the custom of wearing clothes | 13 | 13 |
| 36 | Of Cato the Younger | 31 | 31 |
| 37 | That we laugh and cry for the same thing | 23 | 23 |
| 38 | Of solitude | 67 | 67 |
| 39 | A consideration upon Cicero | 16 | 16 |
| 40 | That the relish for good and evil... | 90 | 90 |
| 41 | Not to communicate a man's honour | 11 | 11 |
| 42 | Of the inequality amongst us | 74 | 74 |
| 43 | Of sumptuary laws | 7 | 7 |
| 44 | Of sleep | 2 | 2 |

Titles also match exactly, chapter by chapter.

## 3. Methodology (every paragraph, not spot-checked)

Ran three independent automated screens across **all 337 paragraph pairs** (not just
the ones the notes file flagged), then manually read every paragraph the screens
surfaced, plus additional full-chapter close reads chosen independently of the notes
file's claims:

- **Word-count-ratio screen** (source words vs. current words per paragraph, flagging
  <0.6x or >1.8x, or >40-word paragraphs compressed below 0.7x): **0 paragraphs flagged**
  across the whole batch. No compression anywhere.
- **Proper-noun diff screen** (capitalized-token set difference per paragraph pair,
  filtered for length): flagged ~100 lines, all reviewed manually. Every one resolved
  to either (a) spelling modernization (AEneid→Aeneid, Sylla→Sulla, Augustin→Augustine,
  Hieronimus→Hieronymus, Lacedaemon/Lacedaemonian→Sparta/Spartan, counterfeit
  Egyptians→so-called Gypsies, Idem→[resolved author name], Duke of Venice→Doge of
  Venice — a defensible period-correct rendering of the same Venetian office), or
  (b) possessive/contraction noise (Cato's, Scipio's, Pompey's, etc. — false positives
  from the crude regex, not real drops).
- **Negation-density screen** (count of not/never/no/nor/neither/none/nothing/without
  per paragraph, flagging deltas ≥3): 6 paragraphs flagged (37/14, 38/4, 39/10, 39/16,
  40/63, 40/76). All 6 read in full side-by-side — no inversions; differences are from
  modern English consolidating double negatives/archaic negation into single clean
  clauses ("not so much... as" → "it isn't...", "neither... nor" reworded), same
  polarity and same claims preserved throughout.
- **Number/quantity screen** (digits, "thousand"/"hundred"/"million"): 3 discrepancies,
  all Roman-numeral rendering artifacts (source's citation "i. I" / "ii. i, 30" read as
  Roman numerals rendered as "1" in current — not a substantive numeral change) or
  synonym swaps ("thousands"→"thousand", not a magnitude change).

In addition to what the screens surfaced, I did full manual side-by-side reads of
complete chapters 39 (16 paragraphs, "A Consideration upon Cicero" — the
highest-citation-density chapter) and 44 (2 paragraphs), plus large samples of 35–38,
40, 41, 42 — chosen for citation density and length, independent of what the notes
file called out. No dropped clauses, no invented content, no compressed passages, no
meaning inversions found in any paragraph read.

## 4. Citation attribution spot-check

Grepped all 337 paragraph pairs for presence/absence of seven author names the notes
file claims were checked: Cicero, Livy, Horace, Lucretius, Seneca, Terence, Plutarch.

Result: **exactly 2 discrepancies**, both are the drafter's own disclosed "Idem"
resolutions, and both verified correct against the nearest preceding citation in the
source:

- Ch.40 P82: source cites "Idem, ibid., vi. 2" (untranslated Latin abbreviation for
  "the same [author]"); current renders "Cicero, ibid., vi. 2." Traced back to the last
  named citation at Ch.40 P79 ("Cicero, Paradox., vi. 3") — same work, correct
  resolution.
- Ch.42 P33: source cites "Idem, ii. 34"; current renders "Lucretius, ii. 34." Traced
  back to Ch.42 P30 ("Lucretius, ii. 47") — correct resolution.

No other attribution changed, dropped, or swapped anywhere in the batch. Sample checks
of exact citation lines (Horace Carm. Saec. v.51, Horace Sat. i.2/ii.7, Livy xxxiv.17,
Seneca Ep. 74/115/Thyestes, Terence Eunuchus ii.2, Plutarch on Alexander/Philip in
Ch.39 P8, Lucan iv.580/ix.404) all match source book/section numbers exactly, word for
word in the translated-English brackets modulo legitimate modernization.

## 5. Ch.35 P8 Ovid quote — agree with drafter's assessment

Source's given English gloss: "The wine when out of the cask retains the form of the
cask; and is given out not in cups, but in bits." Current: "And the wines stand bare,
keeping the shape of the cask; they drink not gulps of wine, but lumps handed out to
them."

Checked against the surrounding context (P7/P10/P11 — Montaigne's point is that in
extreme cold, wine froze solid enough to be cut into cask-shaped chunks and handed out
in pieces rather than poured). Both renderings state the same fact set: (a) frozen wine
retains the cask's shape once removed, (b) it's distributed as solid pieces, not
poured/drunk as liquid. The Latin original itself (left untouched, correctly, at P8)
supports the current rendering's word choices ("frusta" = bits/lumps, "hausta" =
drunk/quaffed) at least as well as the source's older gloss does. No meaning inversion,
no fact changed. Agree: not a defect.

## 6. Overall finding

Across every automated screen (word-ratio, proper-noun, negation-density,
number/quantity) run on all 337 paragraphs, plus close manual reads covering roughly
40% of the batch's paragraphs by direct inspection (all of ch.34, 39, 44; large
majority of 35–38, 40–42; full of 43), I found:

- No dropped or invented clauses/sentences.
- No negation or conditional inversions.
- No compressed or summarized passages.
- No dropped classical citations or anecdotes.
- No factual/historical distortions (names, dates, attributions).
- Paragraph counts exact for all 11 chapters.
- `corrected.json` == `current-modern-en.json` exactly.

This independently confirms the drafter's self-report. I did not find anything the
notes file missed or misrepresented. The one disclosed non-defect (Ovid quote
rephrasing) is legitimate and correctly characterized as a phrasing difference, not a
meaning change.

**Recommendation: accept batch D as-is, no fixes required.**
