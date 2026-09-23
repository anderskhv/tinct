# b04 verification: chapters 13–14

## Coverage
- Chapter 13: 83 changed paragraphs checked; the tool reports 83.
- Chapter 14: 55 changed paragraphs checked; the tool reports 55.
- Total: 138, which matches the tool's count ("138 changed paragraphs in ch 13-14").
- Accessibility items screened: 9 of 9 (A.json indices 0–8).
- 13.20 is not a changed paragraph, but it was ruled on as requested (see Defects).

I checked all of the roughly 156 contraction (register) edits against the source. None of them alters meaning, and none is ungrammatical. Where emphasis or formality in the source calls for the long form, the long form is kept:
- 13.64: the twice-repeated "I am not reading about the fires".
- 13.153: "What I am most ashamed of".
- 13.155: "'I am ready to do anything to please you'".
- 14.9: "I will pay".
- 14.11: "he is a drunkard".
- 14.87: "I will come again, I will definitely come again".
- 14.113: "My life did not die with that old woman", which is echoed in 14.114.
- 14.130: "'I am not worth his little finger'".

The italic in 14.71 (_that_) and in 13.208 (_wants_) is inherited from the baseline and is defensible. Some changes are in the direction of greater firmness, and all are acceptable in modern English:
- 13.136: "I shall not come" became "I'm not coming".
- 13.30: "I'll go" became "I'm going".
- 13.35: "I'll always be pleased" became "I'd always be happy".

## Defects (2, both non-blocking)
1. **13.20 (typography):** the baseline has a literal line break inside the song, "Oh, my handsome soldier,\nDon't beat me for nothing,". The source runs the song on one line, and this is the only line break in the edition. **Ruling: remove it.** The newline becomes a space, and the comma stays as a pause.
2. **13.153 (invented):** "God, the idiotic ideas that come into one's head." should become "What idiotic ideas come into one's head." The source has no invocation; "God," was inherited from the baseline.

All other 137 changed paragraphs are verified clean.

## Accessibility verdict summary
Accept 6, modify 2, reject 1.

**Accepted (6):**
- 0 (13.108): "He" becomes "Raskolnikov".
- 3 (13.182): "assistant" becomes "assistant superintendent".
- 4 (13.204): "He" becomes "Raskolnikov".
- 5 (14.16): kammerjunker gloss.
- 6 (14.39): "the prince -- the Governor-General --". The source names the Governor-General and then "the prince" in consecutive sentences, and they are the same person.
- 7 (14.63): "chest" becomes "trunk".

**Modified (2):**
- 2 (13.154): use "Closed up, and the door freshly painted." The source's "shut up" means closed, not locked, so the proposed "Locked up" goes too far.
- 8 (14.94, blocking): use "She had reached the bottom of the staircase and stopped short one step above him." The proposal changed the subject to "He", but the source's subject is "She". This wording keeps her as the subject and fixes the comma splice.

**Rejected (1):**
- 1 (13.118): the added "Enough talk!" is redundant, because "Well, that's enough!" already glosses _Assez causé!_

## Validation
- `apply.py check --dry` on the defects: 2 applied, 0 rejected.
- On the defects plus the accepted and modified accessibility items: 10 applied, 0 rejected.
- None of these edits overlap.

## Verdict
CLEAN AFTER CORRECTIONS
