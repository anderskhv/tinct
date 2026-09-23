# b10 R — independent re-verification

Coverage: 30.134, 31.11, 31.70, 31.77. I compared each paragraph in full against Garnett, with one paragraph of context on each side, and read the ledger entries from rounds b10-F and b10-AV.

| Coord | Result |
|---|---|
| 30.134 | DEFECT (blocking) |
| 31.11 | clean |
| 31.70 | clean |
| 31.77 | clean |

## 30.134
- The "human being / louse" sentence is correct. The candidate's "if I asked myself whether a human being is a louse, it proved that for me a human being wasn't one, though it might be for someone who would go straight to his goal" matches Garnett ("it proved that it wasn't so for me, though it might be for a man who...") in meaning and certainty. It keeps the general "a human being" and adds no hedge. The candidate's "I obviously didn't have it" keeps the certainty of "I certainly hadn't the right".
- The closing "trembling creature / have the _right_" clause is correct: present tense, with the emphasis kept.
- **Defect:** the candidate has "Whether I dared to stoop down and pick up **power**". Garnett's "whether I dare stoop to pick up or not" names no object, so "power" is invented. Also, "could"/"dared" are past tense, but "am"/"have" in the same series are present, and the source is present throughout. The fix is "Whether I can step over the line or not. Whether I dare to stoop down and pick it up, or not."
- The rest of the paragraph is faithful: the restored repetitions, "the devil leading me", Napoleon, the spider image and the "something else" passage.

## 31.11 / 31.70 / 31.77
- 31.11: "knocking … hammering..." matches the source, and the "nails" invention is gone. Everything else is faithful.
- 31.70: "nearly a pint of blood" is Garnett's own phrase. No anachronism, and nothing is invented.
- 31.77: "She looked at Sonia with a face of suffering" is correct. Katerina is the one looking.

The defect passes `apply.py check --dry`: 1 applied, 0 rejected.

**Verdict: DEFECTS FOUND** (1 blocking, in 30.134).
