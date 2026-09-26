# Independent Fidelity/Completeness Review — Macbeth Completeness Repair

**Reviewer:** independent session, working only from the Project Gutenberg source text, the candidate JSON files, and the currently served JSON files. No file describing how the candidate was built or what it claims to fix was read.

**Date:** 2026-09-26

## Source verification

Downloaded `https://www.gutenberg.org/cache/epub/1533/pg1533.txt`.

- SHA-256: `1371a47e68246197f7f57017a83386fed75dbfebfd0ff51b4524921a3b38ff5e` — **matches** the value given in the task.
- Play body located from `ACT I` to the final `[_Flourish. Exeunt._]` (source lines ~126–4198), split into 28 scene files at each `SCENE` heading for line-by-line comparison against each of the 28 JSON chapters.

## Files checked

- `books/wip/macbeth-completeness-repair/editions/macbeth-original-en.json` (candidate)
- `books/wip/macbeth-completeness-repair/editions/macbeth-modern-en.json` (candidate)
- `app/public/data/editions/macbeth-original-en.json` (served, for diffing)
- `app/public/data/editions/macbeth-modern-en.json` (served, for diffing)

## 1. Well-formedness and structural checks

- Both candidate JSON files parse as valid JSON with `json.load`. No syntax errors.
- Both candidate files have 28 chapters, matching the served files and the 28 Gutenberg `SCENE` headings.
- **Per-chapter paragraph counts are equal between candidate original-en and candidate modern-en in all 28 chapters** (verified programmatically — e.g. chapter 5: 20/20, chapter 12: 47/47, chapter 8: 25/25, etc.). Compare-view paragraph alignment should hold.
- Chapter metadata (`number`, `title`, `section`) is byte-identical between served and candidate in both editions — the repair touched only `paragraphs` arrays.
- The `sections` block is byte-identical between served and candidate in both editions.
- No empty, null, non-string, or whitespace-padded paragraph values were found in either candidate file.

## 2. Diff of candidate original-en vs. served original-en

The candidate adds exactly **34 paragraphs** across 16 chapters (scenes), never removes or reorders anything relative to the served file. This matches the audit's claimed defect count. Total added word count (including speaker tags) is **1,320 words**, matching the "~1,300 words" figure in the task description.

Every one of the 34 insertions was independently checked against the Gutenberg source for:
- **Verbatim text** (word-for-word, including all archaic contractions/apostrophes)
- **Correct speaker attribution** (traced back to the last named speaker before the interrupting stage direction, per standard Shakespearean-text convention)
- **Correct placement** (immediately before/after the correct neighboring line or stage direction)

All 34 passed on all three counts. This includes the two named soliloquies:
- **Dagger soliloquy** (Ch. 8 / Act 2 Sc. 1, idx 21): "Is this a dagger which I see before me…" through "…Words to the heat of deeds too cold breath gives." — verbatim, attributed to MACBETH, placed correctly after `[_Exit Servant._]` and before `[A bell rings.]`.
- **"Unsex me here" soliloquy** (Ch. 5 / Act 1 Sc. 5, idx 10): "The raven himself is hoarse…" through "…To cry, 'Hold, hold!'" — verbatim, attributed to LADY MACBETH, placed correctly after `[Exit Messenger.]` and before `[Enter Macbeth.]`.

Full list of the 34 insertions (chapter / scene, speaker, first words):

| Ch | Scene | Speaker | First words | Verdict |
|---|---|---|---|---|
| 2 | 1.2 | DUNCAN | "Who comes here?" | OK |
| 4 | 1.4 | DUNCAN | "O worthiest cousin!…" | OK |
| 5 | 1.5 | LADY MACBETH | "Glamis thou art, and Cawdor…" | OK |
| 5 | 1.5 | LADY MACBETH | "What is your tidings?" | OK |
| 5 | 1.5 | LADY MACBETH | "The raven himself is hoarse…" (unsex me here) | OK |
| 5 | 1.5 | LADY MACBETH | "Great Glamis, worthy Cawdor!…" | OK |
| 7 | 1.7 | MACBETH | "How now! what news?" | OK |
| 8 | 2.1 | BANQUO | "Give me my sword.—Who's there?" | OK |
| 8 | 2.1 | MACBETH | "Is this a dagger…" (dagger soliloquy) | OK |
| 8 | 2.1 | MACBETH | "I go, and it is done…" | OK |
| 10 | 2.3 | MACDUFF | "Our knocking has awak'd him…" | OK |
| 10 | 2.3 | MACDUFF | "Awake, awake!—…" | OK |
| 10 | 2.3 | MACDUFF | "O Banquo, Banquo!…" | OK |
| 10 | 2.3 | BANQUO | "And when we have our naked frailties hid…" | OK |
| 11 | 2.4 | ROSS | "How goes the world, sir, now?" | OK |
| 12 | 3.1 | MACBETH | "Let every man be master of his time…" | OK |
| 12 | 3.1 | MACBETH | "Sirrah, a word with you…" | OK |
| 12 | 3.1 | MACBETH | "To be thus is nothing…" | OK |
| 12 | 3.1 | MACBETH | "Now go to the door…" | OK |
| 12 | 3.1 | MACBETH | "Was it not yesterday we spoke together?" | OK |
| 12 | 3.1 | MACBETH | "It is concluded…" | OK |
| 13 | 3.2 | LADY MACBETH | "How now, my lord, why do you keep alone…" | OK |
| 15 | 3.4 | MACBETH | "Be large in mirth…" | OK |
| 15 | 3.4 | MACBETH | "To all, and him, we thirst…" | OK |
| 15 | 3.4 | MACBETH | "Why, so;—being gone…" | OK |
| 16 | 3.5 | HECATE | "Hark! I am call'd…" | OK |
| 18 | 4.1 | MACBETH | "What is this, That rises…" | OK |
| 19 | 4.2 | FIRST MURDERER | "Young fry of treachery!" | OK |
| 21 | 5.1 | GENTLEWOMAN | "Lo you, here she comes!…" | OK |
| 23 | 5.3 | MACBETH | "The devil damn thee black…" | OK |
| 23 | 5.3 | MACBETH | "Seyton!—I am sick at heart…" | OK |
| 25 | 5.5 | MACBETH | "What is that noise?" | OK |
| 25 | 5.5 | MACBETH | "Wherefore was that cry?" | OK |
| 25 | 5.5 | MACBETH | "Thou com'st to use thy tongue…" | OK |

No misattribution, misplacement, paraphrase, or duplication was found among these 34.

## 3. Full re-scan of candidate original-en for other completeness defects

Beyond the 34 known gap sites, every one of the 28 chapters was independently re-tokenized and diffed word-for-word against its corresponding Gutenberg scene (normalizing curly/straight quotes and whitespace only). Sequence-match ratios were ≥0.94 for every chapter, and manual inspection of every remaining diff opcode showed that **100% of the residual differences are purely cosmetic**:
- Bracket style for stage directions (`[Thunder…]` in the JSON vs. Gutenberg's `[_Thunder…_]` italics markup)
- The `ACT II` / `ACT III` / `ACT IV` / `ACT V` act-division headers, which fall between the source's `SCENE` markers and are correctly not stored as paragraphs (they are structural, not dialogue, and chapter/act structure is carried in chapter titles instead)

No missing text, no extra text, and no reordering was found anywhere in the candidate original-en beyond the above cosmetic formatting artifacts (all pre-existing in the served file's formatting convention too, i.e. not something the candidate introduced or should have changed).

Also checked for accidental duplicate paragraphs (a common sign of a bad insertion — e.g. an insertion applied twice, or applied at the wrong location leaving both old and new copies). Several exact-duplicate paragraph strings do appear within single chapters (e.g. `[Enter Lady Macbeth.]` twice in Ch. 9, `[Exit Servant.]` twice in Ch. 12, the "Double, double, toil and trouble" refrain three times in Ch. 18, `[Descends.]` three times in Ch. 18, `[Ghost disappears.]` twice in Ch. 15). Every one of these was checked against the source and is a **legitimate repeated stage direction or refrain that occurs multiple times in the actual play** (e.g. Lady Macbeth exits and re-enters in 2.2; the cauldron chant is sung three times; three apparitions each "descend"). None of these are artifacts of the repair.

**Conclusion for original-en: no additional completeness defects found.**

## 4. Candidate modern-en check

- Chapter-by-chapter paragraph counts match candidate original-en exactly (verified above, all 28 chapters).
- Diffing candidate modern-en against served modern-en shows only **32** paragraphs classified as pure insertions by a sequence-alignment diff, one less than the 34 in original-en might suggest at first glance — investigated and explained: in two spots (Ch. 5 idx 1-2, and Ch. 15 idx 6-7) the served modern-en had **already** translated the missing content, but had merged it into an adjacent paragraph as one long block (e.g. the letter-reading and the "Glamis thou art…" soliloquy were one merged modern-en paragraph in the served file). The candidate correctly **split** these merged paragraphs into two, to align with the newly-restored paragraph boundaries in original-en, rather than mistakenly re-translating already-present content. No content was lost or duplicated in this process — verified by direct text comparison (the concatenation of the two split candidate paragraphs equals the original merged served paragraph, verbatim). This is a correct and necessary fix, not a defect.

### Spot-checks (14 of the 34 new/changed pairs checked in full, including both required soliloquies)

All of the following were checked side-by-side against the corresponding candidate original-en paragraph:

1. Ch. 2 — "Who comes here?" — faithful.
2. Ch. 4 — Duncan's "O worthiest cousin…" — faithful, complete, no invention.
3. Ch. 5 — "Glamis thou art, and Cawdor…" — faithful, complete.
4. Ch. 5 — "The raven himself is hoarse… unsex me here…" — **checked in full**: every clause of the original is rendered ("croaks the fatal entrance," "top-full of direst cruelty," "stop up th' access and passage to remorse," "take my milk for gall," "pall thee in the dunnest smoke of hell," "Hold, hold!" → "Stop, stop!"). Nothing summarized or dropped.
5. Ch. 7 — "How now! what news?" — faithful.
6. Ch. 8 — Banquo "Give me my sword…" — faithful.
7. Ch. 8 — **Dagger soliloquy, checked in full**: all clauses present ("heat-oppressed brain," "gouts of blood," "Pale Hecate's off'rings," "wither'd murder… the wolf," "Tarquin's ravishing strides," "sure and firm-set earth," "Whiles I threat, he lives"). Complete, faithful, nothing invented.
8. Ch. 10 — Macduff "Awake, awake!…" alarm speech — faithful, complete.
9. Ch. 10 — Banquo "And when we have our naked frailties hid…" — faithful, complete.
10. Ch. 12 — Macbeth's "To be thus is nothing…" soliloquy (the longest of the 34) — faithful and complete; every clause carried across (Mark Antony/Caesar allusion, "fruitless crown," "barren sceptre," "champion me to th' utterance").
11. Ch. 13 — Lady Macbeth "How now, my lord, why do you keep alone…" — faithful.
12. Ch. 15 — Macbeth's three banquet-scene lines — faithful; correctly re-split to match new paragraph boundaries.
13. Ch. 16 — Hecate's couplet — faithful.
14. Ch. 23 — "Seyton!—I am sick at heart… sere, the yellow leaf…" — faithful, complete, all clauses present.

No summarization, omission, or invented content was found in any of the checked new modern-en paragraphs. Register and voice (modern but non-anachronistic) is consistent with the rest of the served modern-en edition.

### One pre-existing, out-of-scope, non-candidate item noted for completeness

The modern-en paragraph at Ch. 15 idx 7 ("Be free and easy, and soon we'll toast a round. **[_Goes to the door._]** There's blood on your face.") contains a bracketed stage direction, "[Goes to the door.]", that does **not** appear in the Gutenberg PG#1533 text at this point. However, this exact stage direction was already present in the *served* (pre-repair) modern-en file, merged into the paragraph the candidate split in two — the candidate did not introduce it, it only carried it forward when splitting the paragraph to match the new boundary. This is a pre-existing minor editorial addition in the modern-en edition, unrelated to the completeness-repair scope, and is flagged here only for completeness, not as a defect of the candidate repair.

## 5. Validation summary

| Check | Result |
|---|---|
| SHA-256 of downloaded source matches spec | Pass |
| Both candidate JSON files well-formed | Pass |
| 28 chapters in both candidate files | Pass |
| Paragraph counts equal, original-en vs modern-en, per chapter (all 28) | Pass |
| All 34 known-gap insertions verbatim | Pass |
| All 34 known-gap insertions correctly attributed | Pass |
| All 34 known-gap insertions correctly placed | Pass |
| No duplicate insertions / double-application | Pass |
| Full independent re-scan of original-en for other completeness defects | No further defects found |
| Modern-en new paragraphs faithful/complete (14 spot-checked, incl. both soliloquies) | Pass |
| Chapter/section metadata unchanged outside `paragraphs` | Pass |

## Verdict

**ACCEPT.**

No defects were found in the candidate repair. The 34 targeted insertions in original-en are all verbatim, correctly attributed, and correctly placed; the independent full re-scan of all 28 chapters found no other missing, extra, or reordered content beyond cosmetic stage-direction bracket-style differences and act-header exclusions that are consistent with the existing served-file convention. The modern-en candidate has matching paragraph structure to original-en in all 28 chapters, and its new/changed paragraphs (including the dagger soliloquy and the "unsex me here" soliloquy) are faithful, complete, non-summarized, non-inventive modern renderings. One cosmetic, pre-existing (not introduced by this repair), out-of-scope item is noted above for completeness only.
