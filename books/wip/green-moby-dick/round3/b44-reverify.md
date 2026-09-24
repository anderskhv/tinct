# b44 re-verification (round 3, independent)

Scope: every R2 change in chs 44–47 (fidelity fixes and screened accessibility edits): 44.2, 44.3, 44.4, 44.5, 44.8, 44.9, 45.0, 45.4, 45.8, 45.10, 45.11, 45.19, 46.1, 47.1, 47.12. Each paragraph was read in full against source.json.

| id | verdict | notes |
|---|---|---|
| 44.2 | VERIFIED CLEAN | "not only on this particular night" correctly gives the source's sense ("not this night in particular"). Solitude of the cabin, nightly erasing and substituting, four oceans, and the monomaniac thought are all kept. |
| 44.3 | DEFECT (non-blocking) | The R2 fix is correct: "the most timely day to be on this or that ground in search of his prey" now renders the source in full. The paragraph still has "the ways of whales" where the source has "the ways of the leviathans", which flattens the register (the brief keeps leviathan as used). Fix in JSON. |
| 44.4 | VERIFIED CLEAN | The footnote marker `*` is at the end, as in the source. Herring shoals and swallows, the collated logs and the migratory charts are all present. |
| 44.5 | VERIFIED CLEAN | The footnote text stays in its own paragraph and opens with `*`. Maury, National Observatory, April 16th, 1851, and the 5x5-degree districts, 12 columns and 3 lines are all intact. The quote is only lightly modernized. |
| 44.8 | VERIFIED CLEAN | The only R2 change is the hyphen in "feeding-grounds", which is consistent. The full content is present, including the hedge "perhaps". The gloss "(the Line being the equator)" is accurate. |
| 44.9 | VERIFIED CLEAN | Changing "double" to "round Cape Horn" is accurate. The sixty degrees, the 365 days, the Persian Gulf, Bengal Bay and China Seas, and the list of winds are all kept. |
| 45.0 | VERIFIED CLEAN | The lead's adjusted opening, "As far as this book may have a narrative", keeps the source's hedge without adding dismissiveness. The paragraph is otherwise complete. |
| 45.4 | VERIFIED CLEAN | "Chilean" follows lead decision 7. "Caesar" follows decision 4. All four whales, Cambyses, Marius and Sylla, Ombay, and the Tattoo Land are kept. The apostrophes are modernized and their elevation is intact. |
| 45.8 | VERIFIED CLEAN | "pointedly complimented me on my facetiousness" keeps "significantly". The Moses and plagues line is intact. |
| 45.10 | VERIFIED CLEAN | The footnote marker is at the end. Essex, 1820, Pollard, "ten minutes", the second wreck, Owen Chace, his son, and "within a few miles" are all present. |
| 45.11 | VERIFIED CLEAN | The footnote paragraph opens with `*`. Both Chace extracts are complete. The light modernization ("separate", "maneuvers") does not change their sense. |
| 45.19 | VERIFIED CLEAN | "old chums" is restored. Moving the Wafer clause earlier keeps all the content: the "up and down manly book", "honest wonders", Langsdorff, and the hedge "if one is needed". |
| 46.1 | DEFECT (non-blocking) | The accessibility parse fix is otherwise faithful ("remote and blank object", "however much it promises life and passion"). It added "long" ("kept at a long pursuit"), which the source does not say. Fix in JSON. |
| 47.1 | VERIFIED CLEAN | The loom allegory is complete: warp as necessity, the shuttle as free will, the sword as chance. "Right lines" is correctly rendered "straight lines", "hemmed in by both" renders "prescribed to by both", and "strikes the last, shaping blow" renders "has the last featuring blow". Nothing was lost. |
| 47.12 | VERIFIED CLEAN | The de-inverted closing sentence is accurate. The gloss "sounding (diving deep)" is accurate. Shipkeepers, the samphire baskets, the gunwale and the man-of-war's men are all kept. |

**Overall verdict: PASS with 2 non-blocking defects (44.3, 46.1).** No blocking issues. Minimal full-paragraph fixes are in round3/b44-reverify.json.
