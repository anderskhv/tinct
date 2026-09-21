# Montaigne Batch C — Content Fidelity Review Notes

**Scope:** Chapters 23–33 of `mt-batchC-current-modern-en.json`, checked paragraph-by-paragraph
against `mt-batchC-source.json` (locked ground truth, public-domain older-English translation).

**Method:**
1. Automated screening: length-ratio outliers, negation-count deltas, proper-noun/named-entity
   diffing (with spelling-variant tolerance), Latin/classical-quotation marker counts, sentence-count
   deltas. Every flagged paragraph was pulled and read side-by-side against source.
2. Full manual paragraph-by-paragraph read-through of every chapter in the batch (all 11 chapters,
   all paragraphs — this includes every quoted classical/Latin/Italian/Gascon epigraph and its
   bracketed translation), not just the automatically flagged ones. Chapter 25 (155 paragraphs, the
   longest in the batch — "Of the education of children") and Chapter 27 ("Of friendship") received
   the same full-paragraph treatment as the shorter chapters, since they carry the heaviest density
   of classical citation and argument.
3. Cross-checked every classical citation, proper name, date, and number that appeared to differ
   between source and current (e.g. "Jubera" → "Aljubarrota", "Meniceus" → "Menoeceus", "Aristo" →
   "Ariosto", "Poictiers" → "Poitiers", "Beeotia" → "Boeotia") against the actual historical/textual
   referent to confirm these were spelling modernizations/corrections, not misattributions.

## Per-chapter verdict

| Ch. | Title | Paragraphs | Verdict |
|-----|-------|-----------|---------|
| 23 | Various events from the same counsel | 21 | Clean — no defects found |
| 24 | Of pedantry | 64 | Clean — no defects found |
| 25 | Of the education of children | 155 | Clean — no defects found |
| 26 | That it is folly to measure truth and error by our own capacity | 22 | Clean — no defects found |
| 27 | Of friendship | 54 | Clean — no defects found |
| 28 | Nine and twenty sonnets of Estienne de la Boitie (dedicatory front matter only; sonnets themselves not part of this file) | 3 | Clean — no defects found |
| 29 | Of moderation | 19 | Clean — no defects found |
| 30 | Of cannibals | 45 | Clean — no defects found |
| 31 | That a man is soberly to judge of the divine ordinances | 7 | Clean — no defects found |
| 32 | That we are to avoid pleasures, even at the expense of life | 4 | Clean — no defects found |
| 33 | That fortune is oftentimes observed to act by the rule of reason | 12 | Clean — no defects found |

## Defects found

**None.** After a full paragraph-by-paragraph read of all 406 paragraphs across all 11 chapters,
no dropped clauses/sentences, no meaning inversions, no compressed/summarized passages, no dropped
classical citations or anecdotes, and no factual/historical distortions were found in this batch.

Every classical quotation (Latin, Italian, Gascon) and its bracketed prose translation is present,
in the same position, with the same content, in `current` as in `source`. Every named anecdote
(Augustus and Cinna, Alexander and Philip the physician, the Duke of Athens and Matteo di Morozzo,
Eudamidas's will, the Carthaginian Atlantic voyage from pseudo-Aristotle, the Tupinambá cannibalism
account, St. Hilary and his daughter Abra, the Ignatii father-and-son mutual suicide, etc.) is
intact with all of its supporting detail (numbers, names, sequence of events) preserved.

Apparent discrepancies surfaced by the automated screening were checked individually and in every
case turned out to be one of:
- **Paraphrase, not omission** — e.g. rhetorical questions restructured, double negatives resolved
  into positive phrasing, direct address recast (these changed word counts/negation counts but not
  content).
- **Spelling/name modernization, not misattribution** — e.g. "Jubera" → "Aljubarrota" (the real
  1385 battle where John I of Castile was defeated — the source's archaic spelling was expanded to
  the standard modern name, not changed to a different battle); "Aristo" → "Ariosto" (the citation
  is genuinely from Ariosto's *Orlando Furioso* — "Aristo" was simply the period-English
  abbreviation); "Meniceus"/"Demophoon"/"Menoeceus"/"Demophoön", "Beeotia"/"Boeotia",
  "Poictiers"/"Poitiers", "Amyot"/"Amiot" — all standard spelling modernizations of the same
  referent.
- **Legitimate compression of a plural into a collective noun or vice versa** (e.g. "Paulus, that
  Fabius" → "the Paulli, the Fabii" — both refer to the same noble Roman families/consular lines;
  no name substitution).

## Verification

Paragraph counts and chapter numbers in `mt-batchC-corrected.json` were verified programmatically
against `mt-batchC-source.json`: all 11 chapters match in count and number, and every chapter's
paragraph array is the same length as the corresponding source chapter's paragraph array (406
paragraphs total). See the check run:

```python
import json
src = json.load(open('mt-batchC-source.json'))
cor = json.load(open('mt-batchC-corrected.json'))
assert len(src) == len(cor)
for s, c in zip(src, cor):
    assert len(s['paragraphs']) == len(c['paragraphs'])
    assert s['number'] == c['number']
# -> All paragraph counts match: True
```

## Output

Since no content-fidelity defects were found, `mt-batchC-corrected.json` is byte-for-byte identical
to `mt-batchC-current-modern-en.json` (register and content were already faithful; nothing needed
to change). No edits were made to `mt-batchC-current-modern-en.json` itself, per the task
instructions to write the fixed version to `mt-batchC-corrected.json`.
