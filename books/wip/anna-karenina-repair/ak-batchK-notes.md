# Anna Karenina — Batch K (chapters 219–239) — Content Fidelity Review

Scope: 21 chapters (source chapter numbers 219–239 = Part 7 chs. 30–31, all of
Part 8 chs. 1–19, including the novel's ending — Anna's death and Levin's
closing spiritual epiphany).

## Method

1. Read every paragraph of `ak-batchK-current-modern-en.json` against the
   corresponding paragraph in `ak-batchK-source.json` (Garnett), chapter by
   chapter, in full.
2. Ran a programmatic word-count-ratio check across all 451 paragraphs
   (flagging any paragraph where the modern-en word count was <65% or >160%
   of the source paragraph's word count) as a systematic check for
   compression/summarization or invented material. **Zero paragraphs were
   flagged** — no paragraph in this batch is compressed, padded, or
   substantially rewritten in length.
3. Gave special, sentence-level attention to the Levin epiphany sequence
   (chs. 228–239 / source "Chapter 8" through "Chapter 19" of Part 8), since
   that is the thematically crucial closing material named in the task.
4. Verified paragraph counts programmatically before finishing (see below).

## Verdict by chapter

All 21 chapters pass as faithful, non-compressed, register-appropriate
modern-English renderings. No dropped clauses/sentences, no meaning
inversions, no factual/plot distortions (names, places, relationships all
correct — e.g. Vronsky vs. Karenin both being "Alexey" is preserved
correctly in ch. 224; Princess Sorokina, Countess Lidia Ivanovna, Yashvin,
Fyodor, Agafea Mihalovna, Mihalitch, etc. all consistent with source) were
found. The Levin closing chapters (232/233, "Chapter 12"/"Chapter 13" —
the beetle/grass epiphany and the "church! the church!" passage; and 239,
"Chapter 19" — the stars-and-astronomy passage and final "positive meaning
of goodness" paragraph) are rendered essentially clause-for-clause, with no
summarization of the philosophical argument.

- Ch 219 (source "Chapter 30") — PASS. Faithful; only ordinary
  register-preserving synonym choices (e.g. "triumph of success" →
  "thrill of conquest," "boasted of me" → "showed me off"), no fidelity
  break.
- Ch 220 (source "Chapter 31," Anna's death) — PASS. Faithful throughout,
  including the death paragraph. One trivial, non-fixed stylistic addition
  noted below (not counted as a defect requiring a fix).
- Ch 221–227 (Sergey Ivanovitch's book/Slavonic War thread; Pokrovskoe
  arrival; Kitty and Mitya) — PASS. Faithful.
- Ch 228–230 (Levin's crisis of unbelief; "bubble-organism" passage;
  near-suicide) — PASS. Faithful, no compression of the philosophical
  content.
- Ch 231–233 (Fyodor's remark; the beetle/grass epiphany; "the church! the
  church!") — PASS. Faithful, sentence-for-sentence in the core epiphany
  argument.
- Ch 234–237 (bee-house, Slavonic War argument at the bee-house, the storm
  and lightning-strike scare) — PASS. Faithful, including the full Levin/
  Sergey Ivanovitch/Katavasov/old-prince debate (no compression of the
  political argument).
- Ch 238–239 (Mitya's bath; Levin's closing meditation on the stars,
  astronomy, and "the positive meaning of goodness") — PASS after one fix
  (below). This is the novel's final passage; it was checked clause by
  clause against source.

## Defects found and fixed

### 1. Meaning drift in the closing paragraph of the novel (ch. 239, source "Chapter 19")

- **Paragraph index:** 14 (0-based; final paragraph of the file)
- **Exact source text (the relevant clause):**
  > "I shall go on in the same way, losing my temper with Ivan the coachman,
  > falling into angry discussions, expressing my opinions tactlessly..."
- **Exact defective text (before fix):**
  > "I'll go on the same way — losing my temper with Ivan the coachman,
  > falling into pointless arguments, expressing my opinions tactlessly..."
- **Issue:** "angry discussions" was rendered as "pointless arguments."
  This changes the character trait Levin is confessing to keep — from
  *losing his temper/getting heated* to *arguing for no reason*. It's a
  small but real meaning substitution in the load-bearing final paragraph
  of the entire novel (Levin's list of his own persistent flaws,
  immediately before the book's last sentence about "the positive meaning
  of goodness"), so it was corrected rather than left as a stylistic
  variant.
- **Exact fix applied:**
  > "I'll go on the same way — losing my temper with Ivan the coachman,
  > falling into angry arguments, expressing my opinions tactlessly..."

## Notes / non-issues considered and not changed

- Ch. 220, paragraph index 15 ("She tried to throw herself under the wheels
  of the first carriage..."): the modern-en text reads "a feeling like the
  one she used to have when she was about to take her first plunge in the
  river," where the source says only "the first plunge in bathing" (no
  specific body of water named). This is a very minor added specificity
  (bathing in 19th-century Russia was overwhelmingly done in a river or
  lake), not a factual distortion, and does not affect plot, character, or
  theme. Left as-is — flagged here for visibility rather than "fixed" as a
  defect, since altering it further would not improve fidelity.
- No other paragraph in the batch showed dropped clauses, sentence
  omissions, inverted meanings, compressed argument structure, or
  factual/plot distortions on close reading, and the word-count-ratio
  sweep (method #2 above) confirms this quantitatively — no paragraph in
  the batch falls outside a 0.65x–1.6x length ratio against its source
  counterpart.

## Verification

```
python3 -c "
import json
src=json.load(open('ak-batchK-source.json'))
corr=json.load(open('ak-batchK-corrected.json'))
assert len(src)==len(corr)==21
for s,c in zip(src,corr):
    assert s['number']==c['number']
    assert len(s['paragraphs'])==len(c['paragraphs'])
print('OK')
"
```
Result: OK — 21 chapters, all paragraph counts match source exactly (451
total paragraphs, matching source's 451).

## Files touched

- Read only: `ak-batchK-source.json` (locked ground truth), original
  `ak-batchK-current-modern-en.json` (read for comparison; not modified).
- Written: `ak-batchK-corrected.json` (full corrected chapter array, same
  shape as source/current, with the one fix above applied) and this file,
  `ak-batchK-notes.md`.
