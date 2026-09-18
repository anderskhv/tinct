Model: opus

# Chapter 288 — Book Thirteen (1812), Chapter 9 — round-two independent verification

Files verified: `ch288-corrected.json` (pre-round-two), `ch288-corrected-r2.json`, `ch288-corrections-log-r2.md`, `ch288-source.json`. `ch288-verification.md` read for the two blocking round-one findings; every verdict below was re-derived from the source, not from the log.

Continuity check: sha256 of `ch288-corrected.json` is `fb7c938e7497757b161ce78143ef4501fcc32dd82878f4e756ecc83a05e89e93`, identical to the hash recorded in the round-one verification. Round two was applied to exactly the file that was sent back.

## 1. Diff vs log

Programmatic paragraph-by-paragraph diff of `ch288-corrected.json` vs `ch288-corrected-r2.json` (0-based):

| ¶ | Changed | Logged |
|---|---|---|
| 7 | yes | yes |
| all others (0–6, 8–17) | byte-identical | not logged (correct) |

Exactly one paragraph changed; exactly one log entry exists. The log's `Before:` line is byte-for-byte identical to ¶7 of the pre-round-two file, and its `After:` line is byte-for-byte identical to ¶7 of the round-two file. `number` (288) and `title` ("Book Thirteen (1812) — Chapter 9") are unchanged across source, pre-round-two and round-two. **No mismatch, no unlogged edit, no claimed edit that was not made.**

## 2. The two round-one findings

**(a) Dangling "in them" — resolved.**
Source ¶7: "Your fellow citizens are returning every day **to their homes** and orders have been given that they should find **in them** the help and protection due to their misfortunes." Round two: "Your fellow citizens are returning daily **to their homes**, and orders have been given that they shall find **in them** the help and protection due to their misfortunes." The antecedent is restored three words ahead of the pronoun, exactly as in the source, so "them" resolves to "their homes" on first reading. The logged MODERATE it originally answered ("the help and protection due to their misfortunes") is still served. No meaning added, dropped or sharpened. **Correct, complete, no new drift.**

**(b) Subjectless "should entertain the hope" — resolved.**
Source runs the whole series on "it is necessary that you should add your efforts and should, if possible, forget… **should entertain the hope of a less cruel fate**, should be certain…". The corrected file had recast the series as a colon plus imperatives, into which the source's modal clause did not fit. Round two: "…forget, if possible, the misfortunes you've suffered; **hope for a less cruel fate**; be certain that inevitable, shameful death awaits anyone…; and you should not doubt that these will be safeguarded…". "hope for a less cruel fate" is an imperative matching the frame's first and third items, and it keeps the source's tentativeness (hope, not confidence) — which is the MINOR the round-one correction was reaching for. Proposition preserved; nothing added or removed. This is the in-frame fix the round-one verification named. **Correct, complete, no new drift.**

The fourth item ("and you should not doubt that these will be safeguarded") is unchanged, as round one said it could be: it is grammatical and "these" resolves to "your persons or your remaining property" in the preceding item.

## 3. Reader check

Read cold, ¶7 is now clear throughout. The proclamation's ledger register survives; the middle series reads as four parallel instructions ending in a slightly heavier fourth clause, which is unremarkable in this register; "in them" lands on a visible antecedent; no sentence requires a re-read. **Grammatical modern English.**

## 4. Nothing else regressed

Because ¶7 is the only paragraph that moved, every round-one verdict on ¶0, ¶1, ¶3, ¶4, ¶5, ¶6, ¶8, ¶10, ¶11, ¶13, ¶14, ¶16 and ¶17 stands byte-for-byte. Re-checked directly against the source in the round-two file:

- Both MAJOR findings (¶13 inversion, ¶13 "Respond, therefore") remain resolved.
- All MODERATE findings remain resolved, including the chapter-level anaphora: the nine source openers are intact and exact — seven "With regard to" (¶0, 1, 3, 4, 8, 10, 11), "In regard to" (¶16), "With reference to" (¶17).
- The two round-one blocking findings are the only ones that were outstanding, and both are now closed. **Nothing from the round-one verification remains at MODERATE or above.**
- Non-blocking, pre-existing and unchanged (declined on the record): "General Sebastiani" vs Maude's "Sabastiani" pending a conventions decision, the ¶1 gloss "Rostopchin, the governor of Moscow", and COSMETIC items at ¶2, ¶9, ¶14, ¶16.

## 5. Structure and punctuation

- Paragraph count 18 in source and round-two file; order unchanged; no empty paragraphs.
- Per-paragraph question-mark and exclamation-mark counts match the source in all eighteen paragraphs (checked programmatically). ¶7 keeps its single closing exclamation.
- JSON valid; `number` and `title` unchanged.

Verification: ACCEPT
sha256: d2d9c2ca59e406a1a75e8763b1967176faec3dbd29552c7322cf687e5ae39574
