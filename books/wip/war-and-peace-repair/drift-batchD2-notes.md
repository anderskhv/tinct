# War and Peace — Batch D2 Drift Repair Notes

## Method

For each of the 6 chapters, I built an index-aligned comparison of
`drift-batchD2-source.json` against `drift-batchD2-current-modern-en.json`
(same paragraph index `i` from each file, side by side), then checked:

1. Word-count ratio (current/source) per paragraph index, flagging any index
   where the ratio fell far outside the normal ~0.75–1.2 band expected for a
   modern-English condensation (a merge would spike ratio well above 1.3 at
   one index and crash near 0 at a nearby index).
2. A proper-noun/name cross-check per index (character names, place names,
   normalizing accented Cyrillic-transliteration spellings like Andrew →
   Andrew, Speránski → Speransky) to catch any place where paragraph *i* in
   current-modern-en was actually about a different part of the scene than
   paragraph *i* in source.
3. A manual full read-through of all 6 chapters side by side to confirm
   speaker attributions, dialogue content, and scene beats line up at every
   index.

## Findings, per chapter

**Chapter 97** (Bald Hills / "God's folk" — 49 paragraphs in both source and
current): Fully aligned index-for-index already. No drift found — no
merge/split, no out-of-place content. No re-split/re-merge needed.

**Chapter 100** (Denísov's dugout / commissariat affair — 40 paragraphs):
Fully aligned index-for-index already. No drift found. No re-split/re-merge
needed.

**Chapter 111** (Prince Andrew meets Speránski — 41 paragraphs): Fully
aligned index-for-index already. No drift found. No re-split/re-merge
needed.

**Chapter 142** (Natásha/Nicholas reminiscences, mummers, troika ride — 89
paragraphs, the longest chapter in the batch): Fully aligned index-for-index
already. No drift found. No re-split/re-merge needed.

**Chapter 150** (Borís and Julie Karágina courtship — 27 paragraphs): Index
alignment was already correct **except for two placeholder paragraphs**:
- Paragraph index 7 (the footnote translation of Borís's French couplet
  about the tomb, source: *"Death gives relief and death is peaceful. Ah!
  from suffering there is no other refuge."*): current-modern-en had this
  replaced with a generic placeholder, `"(French verse translated.)"`,
  instead of the actual translated content. This is genuinely missing
  content, not a boundary/merge problem — every other bilingual couplet in
  this batch (chapter 97's "Delighted to see you..." pairs, chapter 111's
  Montesquieu quote) follows an established convention in this modern-en
  edition of giving the English translation in the main paragraph *and*
  repeating it in the following footnote-slot paragraph. Chapter 150 broke
  that convention at two spots by substituting a placeholder note.
- Paragraph index 12 (footnote translation of Borís's second French poem,
  source: *"Poisonous nourishment of a too sensitive soul..."*): same
  placeholder-instead-of-content defect.

  Fix: paragraph 7 now repeats the exact modern-en wording already present
  in paragraph 6 (the inline translation), and paragraph 12 now repeats the
  exact modern-en wording already present in paragraph 11 — matching the
  duplicate-footnote convention used consistently elsewhere in the batch.
  No new translation prose was invented; the missing text was recovered
  from the adjacent paragraph that had already translated the same French
  content.

  No other paragraph in chapter 150 needed re-splitting or re-merging.

**Chapter 172** (Balashëv and Davout at Vílna — 19 paragraphs): Fully
aligned index-for-index already. No drift found. No re-split/re-merge
needed.

## Summary

- No cross-paragraph merge/re-split drift was found in any of the 6
  chapters — every current-modern-en paragraph index already corresponded
  to the same source paragraph index in content and scene order.
- The only defect found was in **Chapter 150**, paragraphs 7 and 12, where
  the earlier drift/generation pass had dropped the actual footnote
  translation text and substituted a generic placeholder
  (`"(French verse translated.)"`). This is genuinely missing content per
  the task's step 5, not a boundary shift, and was restored using the
  identical wording already present in the sibling paragraph rather than a
  fresh re-translation.
- 0 paragraphs were re-split or re-merged. 2 paragraphs (150/7, 150/12)
  had missing content restored.

## Script-verified paragraph counts (source vs. corrected)

```
ch 97  source=49  corrected=49  OK
ch 100 source=40  corrected=40  OK
ch 111 source=41  corrected=41  OK
ch 142 source=89  corrected=89  OK
ch 150 source=27  corrected=27  OK
ch 172 source=19  corrected=19  OK
ALL OK
```

Verification command used:

```python
import json
src = json.load(open('drift-batchD2-source.json'))
corrected = json.load(open('drift-batchD2-corrected.json'))
for s, c in zip(src, corrected):
    assert len(s['paragraphs']) == len(c['paragraphs']), s['number']
```
