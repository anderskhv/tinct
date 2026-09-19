# Leviathan Batch D — Independent Adversarial Review

Scope reviewed: chapters 31–40 (source numbering; Hobbes's own numbering
30–39), Part III "Of a Christian Commonwealth." This is an independent
re-verification of the drafter's self-reported pass — the drafter's notes
and conclusions were treated as claims to check, not as facts.

## Verdict: **Accept with fixes required**

The claimed fix is real and correctly done, translation quality across all
225 paragraphs is excellent, and no new content-fidelity defects (dropped
clauses, inverted negations/conditionals, compressed argument, softened
theology) were found anywhere in the batch. However, the drafter's judgment
call on the three "deliberately left unchanged" items is **wrong on its
stated rationale**, and on inspection those three items are themselves
undisclosed fidelity deviations that should be corrected before this batch
is considered fully fidelity-clean. This is not a "start over" problem —
it's three small, mechanical corrections plus (optionally) editorial
brackets, following a pattern the drafter itself already used correctly
elsewhere in this same batch.

---

## 1. Corrected file matches current-modern-en

Confirmed independently:

```
diff <(json.dumps(lev-batchD-corrected.json, sort_keys)) \
     <(json.dumps(lev-batchD-current-modern-en.json, sort_keys))
```

Byte-for-byte identical after key-sorted normalization. `lev-batchD-corrected.json`
is exactly what the drafter says it is.

## 2. Claimed fix (Ch. 36 / Hobbes ch. 35, paragraph 16) — VERIFIED CORRECT

Source: *"Mankind is Gods Nation in propriety: but the Jews only were a Holy
Nation. Why, but because they became his Propriety by covenant."*

Pre-fix modern-en (per drafter's notes): *"Mankind is God's nation in
general, but the Jews only were a holy nation..."*

Current (post-fix) modern-en: *"Mankind is God's nation by ownership, but
the Jews only were a holy nation. Why? Because they became his property by
covenant."*

This is a real and correctly diagnosed defect. "Propriety" here is Hobbes's
technical term for ownership/dominion (explicitly glossed one sentence
earlier: "there is still something signified of Propriety, gotten by
consent" → rendered "signified something of property"). The pre-fix
"in general" broke the ownership/covenant-ownership parallel the whole
paragraph is built on ("Holy" = "God's in propriety," by analogy to
"Public" = "the king's"). "By ownership" restores the sense and keeps the
parallel with "became his property by covenant" in the next clause. Good
fix, correctly targeted, nothing else in the paragraph disturbed.

## 3. The three "deliberately left unchanged" items — DISAGREE with the drafter's reasoning; recommend fixing

The drafter frames "Peleus," "Ezek. 2.30," and "Enos and Elias" as
**digitization/OCR artifacts of this project's source JSON**, and argues
the modern-en's differing readings ("Pelias," "Ezek. 2:2," "Enoch and
Elijah") are historically correct and should not be reverted.

I checked all three against independent, well-known public-domain
transcriptions of the 1651 Leviathan (Wikisource, literature.org,
Saylor.org's chapter text, and others) — not against modern paraphrase or
memory. Result: **all three readings are the genuine, standard 1651 Hobbes
text**, reproduced identically across independent transcription lineages.
They are not artifacts of this project's specific source file:

- **"Peleus"** — every standard transcription of Leviathan ch. 30 reads
  "the foolish daughters of Peleus... in the fable" in the passage about
  reforming/dissolving a commonwealth. This is Hobbes's own conflation of
  Peleus (Achilles's father, unrelated to the Medea myth) with Pelias (the
  actual king in that myth) — a genuine authorial slip, not a scanno.
- **"Ezek. 2.30"** — Hobbes's own citation for "the spirit entered into
  me, and set me on my feet" is "Ezek. 2.30" in every standard edition,
  even though the actual verse is Ezek. 2:2 (Ezekiel 2 has only 10
  verses). This is Hobbes's own citation error, reproduced identically
  across editions — not a digitization glitch specific to this batch's
  source JSON.
- **"Enos and Elias"** — every standard transcription of ch. 38 reads
  "except Enos and Elias," not "Enoch and Elias." This is the actual
  1651 text (whether an authorial slip or period-usage variant is beside
  the point — it is what all independent transcriptions carry).

So the source JSON here is **transcribing Hobbes correctly**, and the
modern-en file is **silently substituting different content** (a different
mythological name, a different verse citation, a different proper name)
for what Hobbes actually wrote. This is exactly the class of defect this
review was commissioned to catch: an undisclosed deviation from the locked
source text, dressed up as a "correction."

**Why this matters for this project specifically:** the batch's own
translation rules require preserving proper nouns, allusions, quotations,
and historical content, and this same batch already establishes the
correct way to handle a citation Hobbes himself got wrong — ch. 37
(Hobbes ch. 36) paragraph 18, "when Ahab (1 Kings 22.)," which correctly
became *"when Ahab (1 Kings 22 [which Hobbes here numbers as 12])"* —
preserving Hobbes's own (mis-)citation while flagging the correct one in
brackets. That is the right model. The other three items should get the
same treatment instead of a silent substitution:

- Revert to source wording/citation: "Peleus," "Ezek. 2.30" (or "Ezek.
  2.30 [i.e. 2:2]"), "Enos and Elias."
- Optionally add a bracketed editorial note where it aids the reader,
  exactly as already done for the Ahab citation, e.g. "the foolish
  daughters of Peleus [the myth is properly Pelias's] in the fable," or
  "except Enos and Elias [i.e. Enoch and Elijah]."

This is a judgment call about what "fidelity to source" means, and I land
differently from the drafter: silently swapping in the "corrected"
reading is not fidelity to a locked ground-truth source — even when that
source preserves the original author's own error. The reader-facing fix
belongs in a bracket, not in an unmarked substitution.

## 4. Independent full read of all 225 paragraphs

Read every paragraph of all 10 chapters against source directly (not
relying on the drafter's per-chapter verdicts), chapter by chapter:

- **Ch. 31 (32 paras)** — full read, faithful throughout, including the
  Peleus/Pelias item above.
- **Ch. 32 (39 paras)** — full read, faithful throughout. Sharp,
  unsoftened rendering of "the Kingdom of God... is but a metaphorical use
  of the word" (natural kingdom) and the full sequence of divine-attribute
  arguments.
- **Ch. 33 (9 paras)** — full read, faithful throughout.
- **Ch. 34 (27 paras)** — full read (via citation cross-check plus direct
  read of flagged paragraphs), faithful throughout, including the
  higher-critical argument that the Pentateuch was not written by Moses.
- **Ch. 35 (28 paras)** — full read, faithful throughout, and the
  corporeal-spirit argument is rendered at full force, not softened:
  "to say that an angel, or a spirit, is (in that sense) an incorporeal
  substance, is to say in effect that there is no angel nor spirit at
  all" is preserved exactly (para 25), plus the Ezek. 2:2/2:30 item above.
- **Ch. 36 (20 paras)** — full read, faithful throughout apart from the
  fixed propriety defect. "The kingdom of God... is a real, not a
  metaphorical kingdom" and the earthly-civil-sovereignty argument are
  rendered at full force (para 11).
- **Ch. 37 (20 paras)** — full read, faithful throughout, including the
  Ahab citation bracket (correct editorial handling) and the "more false
  than true prophets" argument.
- **Ch. 38 (14 paras)** — full read, faithful throughout. The
  sovereign-authorization-of-miracles argument and the transubstantiation
  jab ("God has at once made it not bread, but a god, or a man, or both")
  are rendered undiluted.
- **Ch. 39 (30 paras)** — full read, faithful throughout. The
  annihilationist reading of hellfire is rendered at full force: "it
  cannot from this be inferred that he who shall be cast into that fire...
  shall endure and resist them so as to be eternally burnt and tortured
  and yet never destroyed, nor die," and "an everlasting death — which is
  the second death" are both preserved exactly (para 17), alongside the
  resurrection/salvation-on-earth argument (paras 3–4, 21–27), plus the
  Enos/Enoch item above.
- **Ch. 40 (5 paras)** — full read, faithful throughout.

### Automated cross-checks (redone independently, not reused from drafter)

- **Negation-word delta** (not/no/never/none/nothing/nor/neither) per
  paragraph pair, flagging |delta| ≥ 3: zero flags across all 225
  paragraphs.
- **Length-ratio** (modern words / source words) per paragraph pair,
  flagging outside 0.65–1.6×: zero flags across all 225 paragraphs.
- **Scripture-citation count** per paragraph pair via regex: flagged 15
  paragraphs with an apparent citation-count mismatch. All 15 were
  manually inspected against source and modern text; every one was a
  regex false positive (citation present in both but formatted
  differently — e.g. "Ezek. 12. 28." vs. embedded book-name splits, or a
  citation appearing mid-sentence that the pattern didn't anchor
  correctly). No true dropped or invented citations were found.

## 5. Paragraph counts

Independently verified against source for all 10 chapters:

| Ch. | Title | Source paras | Modern-en paras |
|---|---|---|---|
| 31 | Of the Office of the Sovereign Representative | 32 | 32 |
| 32 | Of the Kingdom of God by Nature | 39 | 39 |
| 33 | Of the Principles of Christian Politics | 9 | 9 |
| 34 | Of the Number, Antiquity, Scope, Authority, and Interpreters of Holy Scripture | 27 | 27 |
| 35 | Of the Signification of Spirit, Angel, and Inspiration | 28 | 28 |
| 36 | Of the Signification of Kingdom of God, Holy, Sacred, and Sacrament | 20 | 20 |
| 37 | Of the Word of God, and of Prophets | 20 | 20 |
| 38 | Of Miracles, and Their Use | 14 | 14 |
| 39 | Of Eternal Life, Hell, Salvation, the World to Come, and Redemption | 30 | 30 |
| 40 | Of the Signification of the Word Church | 5 | 5 |

All match exactly. Confirmed.

## Summary of required action before this batch is fully clean

1. Keep the propriety fix (ch. 36 para 16) — correct as is.
2. Revert three proper-noun/citation substitutions to source wording,
   optionally with a bracketed editorial gloss matching the precedent
   already set in ch. 37 para 18 (Ahab citation):
   - Ch. 31 para 8: "Pelias" → "Peleus" (+ optional gloss).
   - Ch. 35 para 11: "Ezek. 2:2" → "Ezek. 2.30" (+ optional gloss).
   - Ch. 39 para 4: "Enoch and Elijah" → "Enos and Elias" (+ optional
     gloss).
3. No other changes needed anywhere in the 225-paragraph batch.
