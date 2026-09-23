# b13 R: independent re-verification

Coverage: I checked 5 of 5 paragraphs in full against Garnett (source.json), with one paragraph of context on each side, and against the ledger history (b13-F and b13-AV edits): 39.15, 39.21, 39.50, 40.9, 41.16.

Note: the ledger has no b13-AV edit for 41.15 (only b13-F), and it is not in AV-reverify.json. I read it only as context for 41.16 and found it clean. It is not listed in R.json.

## Verified clean
- 39.21: "crossed the bridge toward the Hay Market" matches the source ("turning out of his way along it went to the Hay Market"; "it" is the bridge). Garnett form "Hay Market" is correct.
- 39.50: "all the pleasures of life are nothing -- _nihil est_ --" is grammatical, keeps the italic Latin and adds nothing new. The rest of the paragraph is faithful to Ilya Petrovitch's voice.
- 41.16: the restored "did not know how to judge", "strange" and "they could not decide whom to blame and whom to acquit" are all correct. The paragraph is complete and grammatical.
- 41.15 (context, not assigned): clean.

## Defects (all non-blocking)
- 39.15: "Raskolnikov remembered and thought of it" drops the source's "looking at it" and says the same thing twice. Replace with "Raskolnikov thought of that as he looked at it". The AV repair "He himself was beginning to feel that" is correct.
- 40.9: "fatal" is dropped from "the fatal day of the confession". Restore it.
- 40.9: the trailing ellipsis in "hopes of his future...." is lost, and it is the only one in the chapter. Restore it as "...". The AV repairs in this paragraph (the comma after the parenthesis, "Dounia" named, "saw that it was hard to deceive her") are correct.

Validation: `apply.py ... check --dry` applied 3 and rejected 0.

## Verdict: DEFECTS FOUND
All 3 defects are non-blocking.
