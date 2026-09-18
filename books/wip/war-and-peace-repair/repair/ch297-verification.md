Model: opus

# Chapter 297 (Book Thirteen — Chapter 18) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch297-candidate.json` vs `ch297-corrected.json`; every change re-derived from
`ch297-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 2, 3, 4, 5, 6, 7, 8, 9, 10** — 10 paragraphs.
Log entries: **0, 2, 3, 4, 5, 6, 7, 8, 9, 10** — 10 entries.

**Exact match. No unlogged change, no logged change missing.** Every `**Before:**` string is
byte-identical to the candidate paragraph and every `**After:**` string byte-identical to the
corrected paragraph (checked mechanically on all 10).

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 0 | "all of Kutuzov's energy" → "all of Kutuzov's activity"; "maneuvers, and clashes" → "maneuvers, or encounters" | "all Kutúzov's activity was directed toward restraining his troops … from useless attacks, maneuvers, or encounters with the perishing enemy" | OK — "activity" is what the source predicates (energy is an inner quality the source does not claim); the disjunction is restored, so the three are alternatives, not a conjoined programme |
| 2 | "describe his skillful maneuvers" → "describe to us his skillful maneuvers"; "might have happened" → "would have happened"; "managed to reach" → "managed to penetrate into" | "Napoleon's historians describe to us his skilled maneuvers"; "make conjectures as to what would have happened had Napoleon been in time to penetrate into the rich southern provinces" | OK — the narrator's "to us" standpoint restored (it recurs at ¶3 "the historians forget"); the candidate's added modal hedge removed; "penetrate into" restored |
| 3 | "advancing south" → "advancing into those southern provinces"; the Moscow/Smolensk clauses folded back into the single "How could that army—which had … —how could that army recover" construction | "How could that army—which had found abundant supplies in Moscow and had trampled them underfoot instead of keeping them, and on arriving at Smolénsk had looted provisions instead of storing them—how could that army recuperate in Kalúga province…" | OK — the candidate had broken one rhetorical question into three flat statements plus a question, dissolving the repeated "how could that army"; the source's structure and its force are back |
| 4 | "carried within itself the chemical elements of its own dissolution" → "carried within itself, as it were, the chemical elements of dissolution" | "it had borne within itself, as it were, the chemical elements of dissolution" | OK — **MODERATE answered**. The hedge that marks the chemistry as a figure is restored and the added "its own" is gone |
| 5 | "a situation whose hopelessness they all more or less vaguely sensed" → "this position, of the hopelessness of which they were all more or less vaguely conscious" | "from this position, of the hopelessness of which they were all more or less vaguely conscious" | OK — "this position" (the one they are in, deictic) restored, and "conscious" rather than "sensed" |
| 6 | "the plain-spoken soldier Mouton" → "the simple-minded soldier Mouton"; "the only thing to do was get away" → "the one thing needful was to get away" | "the simple-minded soldier Mouton who, speaking last, said what they all felt: that the one thing needful was to get away as quickly as possible" | OK — **MODERATE answered**. The point is that the simple man said what the clever ones could not; "plain-spoken" described his manner instead of his mind. The biblical cadence of "the one thing needful" is back |
| 7 | "it came right on time" → "it came in due time"; "The French called it 'the Emperor's hurrah.'" → "It was what the French called 'the Emperor's hurrah'—le hourra de l'Empereur." | "and this shock came in due time. It was what the French called 'le hourra de l'Empereur.'" | OK — "right on time" had added a note of the fortuitous; the French phrase the source actually prints is restored, with the English kept ahead of it so no reader is stranded |
| 8 | **"What saved Napoleon wasn't the strength of his forces but the very thing that was destroying the French army: the lure of loot." → "If the Cossacks did not capture Napoleon then, what saved him was the very thing that was destroying the French army—the booty on which the Cossacks fell."** | "If the Cossacks did not capture Napoleon then, what saved him was the very thing that was destroying the French army, the booty on which the Cossacks fell." | OK — **MAJOR answered**. The source's conditional is restored and the invented antithesis ("wasn't the strength of his forces") is gone. The resumption "the booty on which the Cossacks fell" is restored in place of the abstracted "lure of loot" |
| 8 | "his marshals and escort" → "his suite of marshals and an escort" | "with his suite of marshals and an escort" | OK |
| 9 | "'the children of the Don'—the Cossacks—" → "les enfants du Don—the children of the Don, the Cossacks—"; "the nearest, most familiar road" → "the nearest, familiar road" | "When les enfants du Don might so easily have taken the Emperor himself"; "along the nearest, familiar road" | OK — the French the source prints is restored with its gloss trailing; the added superlative removed |
| 10 | "doesn't prove that Napoleon caused it to retreat. Rather, the forces …" → "doesn't prove that Napoleon caused it to retreat, but that the forces …" | "does not prove that Napoleon caused it to retreat, but that the forces which influenced the whole army … acted simultaneously on him also" | OK — the "not X **but** Y" construction is one proposition in the source; the candidate's sentence split had made the second half a separate assertion |

No correction introduced new drift. No content present in both source and candidate was
dropped by the correction, and no wording absent from both was introduced (both checked
mechanically at stem level). Paragraph lengths all rose or held; nothing was compressed.

## 3. Readability of changed paragraphs

Re-read as a new reader. All ten remain clear.

- ¶3 is the one paragraph made materially harder: the restored "How could that army—which
  had … —how could that army recover…" is a long suspended question. It is the source's own
  sentence and the repeated "how could that army" carries the reader over the interruption.
  Acceptable; the candidate's flattened version had lost the argument's shape.
- ¶5 "of the hopelessness of which they were all more or less vaguely conscious" is formal
  but unambiguous.
- ¶7 and ¶9 restore French phrases with their English attached in the same breath, so no
  reader is left guessing.

## 4. Structure and punctuation

- Paragraph count 11 = 11 = 11 (source / candidate / corrected). Order unchanged.
- `number` 297 and `title` "Book Thirteen (1812) — Chapter 18" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: **clean across all 11 paragraphs**.
- No paragraph falls below 0.75 of its source word count.
- Quote characters normalised to straight throughout (the candidate mixed curly and straight).
- JSON valid.

## 5. New findings

None blocking.

- **Non-blocking (MINOR, pre-existing):** ¶0 renders "the perishing enemy" as "the dying
  enemy" and "by guile, and by entreaty" as "by cunning, and by pleading". Both are
  defensible modernisations and neither was flagged by the fidelity review; "perishing" does
  lose the echo with ¶4's "dissolution".
- **Non-blocking (MINOR, pre-existing):** ¶2 "the Battle of Borodino" (¶4) and "Battle of
  Austerlitz"-style rank/battle glosses persist elsewhere in the zone; they assert nothing.
- Every paragraph carrying a fidelity finding was edited; no finding sits on an untouched
  paragraph.
- The one MAJOR (¶8 conditional and resumption) and both MODERATE findings (¶4 "as it were",
  ¶6 "simple-minded") are fully answered. **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: 845a2a85826c544d190dc2a05dc17787e520b30f52d42675b9c69b059976b9d8
