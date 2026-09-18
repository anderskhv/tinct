Model: opus

# Chapter 357 (Second Epilogue — Chapter 4) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch357-candidate.json` vs `ch357-corrected.json`; every content change re-derived from
`ch357-source.json`, not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based), from my own diff — 17 of 32:

`2, 4, 5, 6, 9, 10, 11, 12, 16, 17, 18, 19, 20, 25, 28, 30, 31`

Log entries (¶ column): `2, 4, 5, 6, 9, 10, 11, 12, 16, 17, 18, 19, 20, 25, 28, 30, 31`

**Exact match. No unlogged change, no logged change missing.**

Dash-only (chapter-wide em-dash conversion, logged COSMETIC): ¶5, 6, 9, 10, 12, 18, 28, 31.
Content changes (each also carrying the dash conversion): ¶2, 4, 11, 16, 17, 19, 20, 25, 30.

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source warrant | Verdict |
|---|---|---|---|
| 2 | "simply because Napoleon spoke" → "when Napoleon spoke" | source: "when Napoleon uttered certain words" | CORRECT — causal-plus-intensifier reverted to the source's temporal |
| 4 | "neither Louis XI … nor Metternich" → "neither a Louis XI … nor a Metternich"; "if anything, they were" → "but, on the contrary, they were" | source: "neither a Louis XI nor a Metternich"; "but on the contrary were generally morally weaker" | CORRECT — generalizing article and the assertion (not concession) both restored; accepted glosses kept |
| 11 | drops "after his own failed rising there" | source: "when he was taken prisoner at Boulogne" — no such event named | CORRECT and complete — answers the MODERATE; Pugachev gloss correctly retained |
| 16 | "They assume" → "They seem to consider" | source: "seem to consider that the collective will … is unconditionally transferred" | CORRECT — Tolstoy's hedge restored |
| 17 | "no one but children" → "no one but young children" | source: "can only satisfy young children" | CORRECT |
| 19 | sentence rejoined under "Just as little does this view explain why …, and then, suddenly, … passes to the Convention …"; "delayed reactions" → "reactions"; "not genuine acts of delegation … at all" → "not normal delegations of the people's will"; "these very historians" → "these historians" | source: "Equally little does this view explain why … and then suddenly during a period of fifty years is transferred to …"; "time limit for such reactions"; "not normal delegations of the people's will"; "are presented by these historians" | CORRECT and complete — the MODERATE is fully answered: the ten-ruler succession is again inside the scope of what the view fails to explain, not a free-standing assertion |
| 20 | drops "simply" | source: "are deviations from the theory" | CORRECT |
| 25 | "the men we happen to have noticed" → "the men we have noticed" | source: "the men whom we have noticed" | CORRECT |
| 30 | "suspicious of everyone" → "suspicious"; "went on guillotining each other" → "guillotined one another" | source: "Rousseau was suspicious"; "they guillotined one another" | CORRECT |

No correction overshot: in every case the corrected wording is at or inside the source's
claim, and no new material was introduced.

## 3. Clarity re-read

Each changed paragraph read cold. All remain plain modern English. ¶19 is the one to watch —
it is long — but rejoining the clause makes the argument *easier* to follow, not harder,
because the reader now knows the ruler-list is the thing being called unexplained.
¶16's "They seem to consider" is no less clear than "They assume". ¶4's "neither a Louis XI,
the French king, nor a Metternich, the Austrian statesman" is slightly awkward where the
generalizing article meets the gloss, but it is grammatical and the meaning is the source's.

## 4. Structure and punctuation

- Paragraph count 32 = 32 (source, candidate, corrected). Order unchanged. No empty paragraphs.
- Title unchanged: "Second Epilogue — Chapter 4".
- Question-mark parity with source: **exact, every paragraph**.
- Exclamation-mark parity with source: **exact, every paragraph**.
- No spaced em dashes and no `--` remain anywhere in the file; the chapter-wide conversion is complete.

## 5. Requested spot confirmations

- **Ten-ruler list (¶19):** complete, in source order — Convention, Directory, Napoleon, Alexander, Louis XVIII, Napoleon again, Charles X, Louis Philippe, a Republican government, Napoleon III. ✓
- **Three answers (¶14):** all three present in order with every sub-clause — (1) unconditional transfer → every new power and every struggle a violation; (2) conditional under known conditions → limitations/conflicts/destructions follow from the rulers' failure to observe them; (3) conditional but unknown → rise of rival authorities, struggles and falls follow from greater or lesser fulfilment. ✓
- **Botanist analogy (¶20):** intact — two seed-leaves, palm, mushroom, oak, in order, "are deviations from the theory". ✓
- **Crusades passage (¶28):** intact — Godfreys, Louis-es and their ladies; leaderless west-to-east movement; crowd of wanderers; Peter the Hermit; the halt once Jerusalem was named; popes, kings and knights; "the people did not go"; the Godfreys-and-Minnesingers close. Content identical to the candidate apart from dash conversion. ✓

## 6. New findings

None blocking. Recorded for the record only:

- Residual MINORs from the fidelity review left unfixed and not listed under "unchanged by design": ¶14 "solely" → "simply" (sole cause weakened to mere) and "rival" added to "several authorities"; ¶14's added summary sentence "Three assumptions are possible."; ¶17's dangling "the revolutionary governments that followed"; ¶28's circular "men like the Crusader Godfrey". All were rated MINOR and all are inside the protocol's discretion to leave. ¶14 "solely" is the one I would take in a future pass.

## 7. Verdict

The three MODERATE findings (¶11, ¶16, ¶19) are all fully answered from the source. No MAJOR
finding existed. Log and file agree exactly. Structure and punctuation parity hold.

Verification: ACCEPT
sha256: 8b92710aef8ab5c4fb6ffe899c467416db2978220345f3c054f7113c90070be2
