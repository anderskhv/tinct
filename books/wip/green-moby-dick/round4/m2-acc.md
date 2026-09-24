# m2 accessibility review (round 4, candidate only)

Scope: the 75 target ids in M-TARGETS.json batches.m2 (45.23 to 64.8), each read in full in candidate.json alongside the paragraphs on either side. I did not open source.json, the baseline or original-en.

## Verdict

**Pass, with 5 non-blocking smoothing proposals.** The re-rendered paragraphs read as real modern English. A mechanical scan found no archaic pronouns or -eth/-est verbs, no curly quotes, no underscores, no doubled words, no stray spacing before punctuation and no unbalanced quotes. Tone and terms fit the neighbouring paragraphs. For example, "cut down" at 54.66 is set up by "cut him down" and "the three men in the rigging" in 54.57 and 54.63.

## Proposals (see m2-acc.json)

| id | fix |
|---|---|
| 48.49 | "like ropes and yards whose sound..." becomes "like the sound of ropes and yards that..." |
| 53.8 | "high times indeed" becomes "a fine state of affairs indeed", and "gay cords" becomes "bright cords" |
| 54.3 | The footnote now starts "*Town-ho is the old whale-cry...", so a listener knows what it glosses |
| 54.89 | "He steered away" has no referent. Swapped with "The captain" in the third sentence |
| 59.10 | "more than twenty and thirty feet" becomes "more than twenty, even thirty, feet" |

## Questions for the fidelity check

- **59.4:** "the drifting company of that one still, solitary jet" is obscure to a first-time reader. I could not propose a safe wording without the source. Please check what "company" renders there.
- **64.8:** "in gayer and more jovial spirits" is left as is, because the context makes the sense clear. If the lead wants 53.8 and 64.8 handled the same way, "merrier" would work.
- **62.2:** "boatheader" sits next to "headsman" in the same paragraph. I assume both are Melville's terms and left it. If the edition standardizes, use "headsman".
