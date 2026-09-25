# Blind comprehension review: scenes, ratings and triage

## Reviewers and scenes

The blind readers read only the Modern English candidate (v1, `012ede1e…`). They had no access to the original, the source, the render guide or any other packet. The reports are in this folder as `blind-B1.md`, `blind-B2.md` and `blind-B3.md`.

| Reader | Complete scenes | Rating by ear (v1) | Unclear points logged |
|---|---|---|---|
| B1 | Act 1 Scene 1 (ch 1), Act 1 Scene 3 (ch 3) | 4/5, 4/5 | about 70 |
| B2 | Act 3 Scene 3 (ch 9) | 4/5; 3/5 if the bracketed speeches are read as directions | 69 |
| B3 | Act 4 Scene 3 (ch 13), Act 5 Scene 2 (ch 15) | 4/5, 3/5 | about 80 |

These scenes cover:

- the exposition, with its bawdy and racial abuse (1.1);
- public oratory, with Othello's defence (1.3);
- the central temptation (3.3);
- the intimate willow scene (4.3);
- the catastrophe (5.2).

## How each point was handled

The editor triaged every high- and medium-severity point against the original. Low-severity points were taken up where the fix was clear and local. **49 edits in v2 come from the blind reviews**: B1 11, B2 21 and B3 17. Each is listed in `../CHANGES-v1-to-v2.json` with its source and reason. Each was independently re-checked by RC1 or RC2 (`recheck-RC1.json`, `recheck-RC2.json`).

| Class of problem | Examples | Disposition |
|---|---|---|
| Spoken lines printed as bracketed stage directions | 3.4, 3.28, 3.43, 9.109, 9.130, 9.132, 13.26–13.33, 15.4, 15.66, 15.146 | This was the top obstacle for **all three** readers. It is a structural defect in both editions, so it is not fixed in v2's text. It is covered by the source-verified proposal `../structure/part-a-brackets.proposed.json`. |
| Missing stage business | the kneeling in 9.171–9.172; Iago going and returning in 9.94–9.96; Emilia outside the locked door in 5.2; asides | The parser stripped 34 inline directions from both editions. They are covered by `../structure/part-b-inline-directions.proposed.json`. Where speech alone can carry the point, v2 does so: 3.24 and 3.33 name the person addressed, and 15.56 and 15.58 "Are you there?". |
| Pronouns and addressees the ear cannot sort out | 1.4 "his own eyes"; 9.67 "your friend"; 9.146 Iago's self-address; 15.61 "She's dead. She's…"; 15.151 | Fixed in v2. The editor chose the wording, and re-checker RC2 revised 9.67. |
| Modern idioms that give the wrong meaning or tone | "hats off to him"; "Your Honor"; "Ha! Ha!"; "I have a thing for you"; "Hello there!"; "There, there"; "tramp"; "the slave"; "What's up" | Fixed in v2. |
| Word order copied from the original line order | 9.7, 9.74, 9.164, 3.43, 3.45, 3.52 and others | Fixed in v2. Many of these were also raised by the alignment validators. |
| Opaque images that need a few words | the cuckold's horns (9.100, feeding 9.105); "charm your tongue" (15.118); "the bloody law book" (3.30); "abused" (3.29); "at this hint" (3.45) | Fixed in v2. Each gloss is folded into the sentence, because blind reader B1 found appended "— gloss —" asides sound like an editor talking. For the same reason v2 **removes** the late 1.33 gloss "— having sex". |
| Context the original also withholds | "this", "him" and "her father" in 1.1 (the scene opens mid-conversation); who Lodovico is; the willow as the emblem of forsaken love; Othello's race when a scene is read out of context | Not changed. The original withholds these deliberately, or they are established elsewhere in the play. The standard does not allow adding exposition. |
| Deliberate ambiguity and cruxes | "heaven had made her such a man" (3.45); "Were I the Moor, I would not be Iago" (1.8); "I'll have the work ta'en out" (9.112) | Kept open, under standard rule 7. |
| House-style questions | "Exeunt"; stage directions kept verbatim | Recorded for Anders. Stage directions stay byte-identical to the live edition under the Hamlet and Macbeth convention. Modernizing them would be a house-wide decision for all plays. |

## Effect

- v2 fixes the text-caused obstacles the readers found in all five scenes.
- The two largest remaining obstacles, speech shown as directions and missing stage business, are structural. They are fully specified in the Part A and Part B proposals, and both need Anders's approval before Codex can apply them to both editions.
- **No second blind read of v2 was run.** The v2 fixes were verified by independent fidelity re-checkers, not by a fresh blind reader. A post-integration blind read is recommended if Parts A and B are adopted.
