# b54 fidelity review: Chapter 54, The Town-Ho's Story

Reviewed: all 112 paragraphs (54.0–54.111) of the current candidate.json against source.json, clause by clause. All 50 round-1 repairs are present in the candidate, byte for byte. Items: 7 (2 blocking, 5 non-blocking). Everything else passes.

## Summary

The repaired chapter is a faithful, complete modern rendering. I checked the plot steps you asked about against the source:

- **Quarrel:** the leak and the pumps (54.5, 9, 10). Radney's part-ownership jokes (13). The broom-and-shovel order about the pig's mess, and why it was the boys' job (16–18). The refusal and the three lads (19).
- **Blow:** the cooper's club hammer. The single circuit round the windlass. Steelkilt's warning, "if the hammer so much as grazed his cheek". The lower jaw "stove in" and Radney "spouting blood like a whale" (19–22).
- **Barricade and siege:** the backstay and the two Canallers. The captain with his whale-pike. The casks slewed in line with the windlass by the "sea-Parisians" (34). The pistols and the barricade speeches (35–45). The padlock, with ten locked below and twenty-odd neutral (47). Four men give up on day 4 and three on day 5 (49). The two Canallers' treachery: "first of the three, though last of the ten" (53–54).
- **Flogging:** the three men seized up in the mizzen rigging "like three quarters of meat". The captain's "vultures" line (55). The reprimand "in the vernacular" (56). The two traitors flogged (57). The hissed threat, and the captain relenting (59–63). Radney flogs Steelkilt after "You are a coward!", in the correct order (64–66).
- **Steelkilt's plan:** the peace-and-desert pact, and the pact not to sing out for whales (67). Radney resumes his night watch against the captain's advice (68). The dozing posture, the helm trick at 2 a.m. on the third day, the braided "lanyard", the twine from "old Rad", and the netted iron ball (69–77).
- **Radney's death, Moby Dick and the escape:** the Teneriffe man, and "Jesu, what a whale!" (79). The frenzy, the bowsman's duty, the capsized boat, and the whale seizing Radney (85). The cut line, the red woolen shirt, and "all four boats gave chase again" (86). The desertion, the war-canoe, heaving down, and the 500 miles to Tahiti (87–88). The "bubbles and foam" threat and the six-day oath (89–95). The French ships and "legal retribution" (96).
- **Lima frame:** the dons' interruptions are all present in order, with their jokes intact: Lakeman/Buffalo, Canallers, chicha, the friar, Dame Isabella's Inquisition, "Corrupt as Lima", St. Dominic, the christening of whales, the Evangelists, and the Auto-da-Fés.
- **Names as printed:** kept, with two exceptions (below).

## Findings

| id | sev | issue |
|---|---|---|
| 54.3 | blocking (name) | "Galapagos" should be "Gallipagos" as printed. See lead decision 3; the edition already prints "Gallipagos" at 127.20. |
| 54.8 | blocking (name) | "Manila" should be "Manilla" as printed. The edition keeps "Manilla" at 48.0, 60.2 and 116.1. |
| 54.28, 54.32, 54.34, 54.85 | non-blocking (convention) | The opening " is missing, which leaves the paragraph's quotes unbalanced. Add it. |
| 54.110 | non-blocking (convention) | The inner ' is left open inside the closed outer ". Change the ending to `touch it.'"` |

Both name fixes are one-word reversions. They count as blocking only because the category is "changed name".

## Answers to the repair editor's open questions

1. **Quote marks.** The source's pattern: every paragraph of the Lima telling, 54.5 to 54.111, opens with “. The only exception is the "* * * * * *" break at 54.108, which has no marks. No paragraph closes, until the telling ends at 54.111 with ’” (continued-quotation style). Inner speech uses ‘ ’. In the one place a speech crosses a paragraph break (54.110 into 54.111), the source leaves ‘ open and reopens it. The editor's premise is wrong in one respect: the source does *not* drop the opening mark in 54.28, 32, 34 or 85. All four open with “. The candidate alone dropped it.

   **What the candidate should do:** keep the edition's convention of closing each paragraph. The candidate has 807 balanced quoted paragraphs, and the live baseline closes every one, so every quoted paragraph here should both open and close with ". Concretely:
   - add a leading " to 54.28, 54.32, 54.34 and 54.85;
   - end 54.110 with `touch it.'"` (54.111 already reopens with `"'` and ends with `'"`);
   - leave the rest alone: 54.0–4 (unquoted preface), 54.108 (no marks, as in the source), and 54.98, which ends `* * * *"` with the asterisks inside the quote, as in the source.

   After these changes, every paragraph from 54.5 to 54.111 except 54.108 opens and closes with ", and each has an even number of " marks. I checked this by script. The source's structure is kept: the opening marks and the nesting levels match, including 54.31's "Corrupt as Lima" at the third level. Switching the whole chapter to open-only continued quotation would contradict the rest of the edition.

   Outside this batch: 116.3–5 are the only other paragraphs in the candidate that open without closing, so they follow the continued-quotation style. The lead should make those consistent with whichever convention is chosen edition-wide.
2. **54.2, "traveled aft of the Pequod's mainmast":** this is correct and needs no gloss.
3. **54.3, "Galapagos":** revert to "Gallipagos" (lead decision 3; 127.20). The same goes for "Manila" in 54.8, which should be "Manilla". Outside scope: 100.42 also reads "Manila" against the source's "Manilla".
4. **54.5, "hove out":** leaving it unglossed is right. It means the hull is hauled over or careened to reach the leak, which 54.88 later calls "heaving down". A wrong gloss would do more harm than no gloss.
5. **54.67, "ship's run... the narrow afterpart of her hold":** the gloss is accurate and should be kept. The run is the narrowing after part of a ship's bottom, and so the aftermost part of the hold, under the cabin. That is why the traitors, pleading at the cabin door, are stowed there away from the crew. It is brief and used once. The rest of 54.67 is now complete: the resolve made at Steelkilt's instigation, desertion in a body, the pact not to sing out for whales, the manned mastheads and the captain still willing to lower, and Radney's "bandaged mouth" gagging "the vital jaw".
6. **54.103, 107, 109, "Evangelists":** keep the restoration and the one-time gloss "the Holy Evangelists, the Gospels". The "largest sized Evangelists" joke in 54.107 depends on the word.
7. **54.98, "* * * *":** leave it as it is, inside the closing quote, since the source puts it inside the quoted paragraph.

## Minor notes, no change needed

- 54.4, "fine gentlemen" for "fine cavaliers", and 54.32, "softness" for "effeminacy": mild flattening, acceptable.
- 54.6 adds the gloss "a Vineyarder from Martha's Vineyard". It is brief and accurate.
- 54.29 modernizes "plazza" to "plaza", which is acceptable because it is an ordinary word, not a name.

## Verdict

**Pass once the 7 items are applied.** The content is faithful throughout, with no omission, invention, hedge change or sequence error in any of the 112 paragraphs. The remaining fixes are two name reversions and five quote-balance corrections.
