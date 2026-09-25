# Independent fidelity verification — summary

Every changed paragraph was checked by a verifier who neither proposed nor applied the change. Each verifier:

- read BUTLER / BEFORE / AFTER for every paragraph, with neighbouring context, against `VERIFY-BRIEF.md`;
- ran their own Python check that applying the listed edits to `bd05c7f4…` reproduces the successor byte for byte, with no unlisted change and identical structure.

The per-paragraph verdicts are the `*-verify.json` files in this folder. This environment would not let the verifiers write Markdown reports, so the lead condensed their readable reports into this summary.

## Round 1

| Packet | Paragraphs / edits | Verdict | Defects and the lead's disposition |
|---|---|---|---|
| Book 3 | 3 / 5 | **VERIFIED CLEAN** | Optional suggestion: mirror 1.13's "men of a foreign tongue" at 3.23. Adopted ("among people of a foreign tongue") and re-checked in round 2 |
| Book 4 | 11 / 12 | **VERIFIED CLEAN** | None. The verifier confirmed the four "would have" conditionals in 4.14 are Butler's counterfactual (the Greek is unreal throughout; Butler's own "should have run clean out … if a goddess had not" at 4.28). It also confirmed that "felt sure" (4.54, 4.57) is kept apart from the live "make sure" at 4.43 |
| Book 5 | 7 / 9 | **DEFECT (1)** | B05-06 "a sea" → "a wave" is *unnecessary*: the BEFORE was clear, and "a sea" is Butler's own, still-current word. **Reverted.** Rechecked in round 2 |
| Book 6 | 3 / 3 | **VERIFIED CLEAN** | None |
| Book 7 | 4 / 4 | **VERIFIED CLEAN** | None |
| Book 8 | 8 / 11 | **VERIFIED CLEAN** | B08-07's stated reason cited a collision that does not exist. **Reason corrected** in the ledger: "readily enough" is an adverb and cannot follow "She was" |
| Book 17 (consistency) | 1 / 1 | **VERIFIED CLEAN** | None |
| "loved ones" formula (2.23, 4.39, 5.3, 5.8, 9.40) | 5 / 5 | **VERIFIED CLEAN** | Every site is the kin sense of *philoi*. The verifier found one further site of the same formula, **1.4** (Od. 1.49 = 7.152). **Added** as FR-1.4 and checked in round 2. It checked all 93 uses of "friend(s)" in Butler and found no other site |

### Other round-1 observations

None of these was in scope or blocking. They are recorded for a later pass:

- **3.23:** Butler's "the point of Athens" ("point" as headland).
- **5.19:** "adzed" was rendered "trimmed" before this follow-up.
- **16.31:** prints "We were sure" where 4.57 now prints "we had felt sure". Homer and Butler have the same line.
- **4.27:** "new born" stays open.
- **8.3:** "full grown" has no hyphen.
- **19.9:** has "creature" for Butler's "baggage".
- **GLOSSARY:** its "nothing loth" row is stale.

## Round 2 and the final Books

This round used a fresh verifier who had not proposed, screened or applied any edit. It checked the successor `862066e2…`, built from all 63 edits.

**Mechanical checks** (its own scripts, exit 0):
- All 63 edits applied to `bd05c7f4…` reproduce `862066e2…` byte for byte.
- Each `old` occurs exactly once, and no two edits overlap.
- Structure is identical: 24 chapters, 1,027 paragraphs, and the same titles and per-chapter counts.
- Exactly the 55 listed paragraphs differ, and B05-06 is absent.
- The packets match the files.
- The Project Gutenberg #1727 copy matches the pinned anchor `ffbdb29c…`.
- The 16 paragraphs break no convention.

| Packet | Paragraphs / edits | Verdict | Notes |
|---|---|---|---|
| Book 9 | 2 / 2 | **VERIFIED CLEAN** | 9.36: "felt sure" is Butler's own phrase and now matches 4.54 and 4.57. Butler's other five "made sure" already read "was/were sure". 9.40 is the kin sense of the "loved ones" formula |
| Book 10 | 3 / 3 | **VERIFIED CLEAN** | These are Butler's only three uses of "mess", now rendered "brew" throughout. "Brew" does not give away the drug before "but she drugged it" |
| Book 23 | 3 / 4 | **VERIFIED CLEAN** | 23.16: "that room" points back to the bedroom from where Penelope sits by the fire in the gallery. 23.27: "his fill" restores Butler's sense and removes an "enough" that the modernization had added; it does not collide with "filled all my yards". "Get about" is Butler's own phrase at 23.13 |
| Book 24 | 5 / 5 | **VERIFIED CLEAN** | 24.10: "as a contest for us" fixes the prize misreading. It costs the exact echo of 24.6's "to be competed for", which cannot be kept without keeping the misreading. 24.14 matches 4.9. The negation in 24.15 is logically right. "Grain" at 24.20 matches the edition. 24.23 pairs with B08-01 |
| Round-2 recheck: 3.23, 5.23, 1.4 | 3 / 5 | **VERIFIED CLEAN** | 3.23: "people of a foreign tongue" is Butler's 1.13 phrase for the same Greek word. The 5.23 revert is complete, and "yardarm" is Butler's own word at 5.19. 1.4 is the kin sense, the same half-line as 7.152 |

**Round-2 observation outside scope:** 12.26 still read "the corn and wine held out", the edition's last British "corn". The lead adopted it as CR-12.26 (round 3).

The lead also swept the whole successor for the other words this follow-up repaired. The remaining hits outside the ten Books are sound in context:
- "stout" is used of a spear and of ox-hide.
- "couch" is a bed or couch, as in live.
- "no strength or substance" is the physical sense.
- "made sure" at 13.2 means ensured.
- "gain nothing by it" is current English.
- "presently" goes with a past-tense verb.
- The "but had" hits are ordinary clauses.

No further edit was made.

## Round 3: CR-12.26

This round used another fresh verifier, who had not proposed, screened or applied the edit. It checked the final successor `db6bfd23…`.

**Mechanical checks** (its own script, 0 failures):
- All 64 edits applied to `bd05c7f4…` reproduce `db6bfd23…` byte for byte (607,791 bytes).
- Exactly the 56 edit sites differ.
- Against the round-2 successor `862066e2…`, only 12.26 differs, by the one word, and reverting it reproduces `862066e2…` byte for byte.
- 1,011 paragraphs still differ from live, and live reads "As long as grain and wine lasted" at 12.26.
- **Corn census:**
  - Butler has whole-word "corn" at eight sites (3.36, 12.26, 13.7, 13.22, 17.53, 20.16, 20.27, 24.20).
  - The final successor has "grain" at all eight and no whole-word "corn" anywhere.
  - The package's Book 3 ruling is quoted accurately (its continuity sheet, B03-P037), and `GLOSSARY.md` has no corn/grain entry to override.

| Packet | Paragraphs / edits | Verdict | Notes |
|---|---|---|---|
| Book 12 (consistency) | 1 / 1 | **VERIFIED CLEAN** | "Grain" is faithful to Butler's British "corn", Greek *sîtos* (Od. 12.327). Butler's own verb "held out" is kept, and the edit is needed because an American reader takes "corn" as maize. There is no collision: ¶28's "no barley left" names a kind of grain, and ¶25's "meat and drink" is Butler's idiom for food |

## Result

Every changed paragraph was independently verified across rounds 1–3:
- 56 paragraphs and 64 edits in total.
- One defect was found (B05-06, unnecessary) and reverted.
- One stated reason was corrected (B08-07).
- Two edits were added from verifier findings (FR-1.4, CR-12.26), and each was verified in turn.

The final successor `db6bfd23e97e1fe2eb0b2ce9926c36a665a996cfb024796ee0903e935931c9ce` is **VERIFIED CLEAN**.
