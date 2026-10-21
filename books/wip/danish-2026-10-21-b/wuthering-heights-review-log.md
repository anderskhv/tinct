# Review log: wuthering-heights modern-da

Source: `app/public/data/editions/wuthering-heights-modern-en.json`, origin/main blob `bebdbfa87ba6b859f49403b158ff2ef47f5ff0e3` (34 chapters, 1,931 paragraphs, 109,647 words). No earlier `wuthering-heights-modern-da.json` exists on main or in reachable history, so there was no glossary to follow; names and terms were set fresh (below).

## Review method (read this first)

As with Alice, **no subagent tool was available**, so the second pass was a self-review by the translator, not an independent one:

1. Automated EN/DA pair checks after each chapter: paragraph count, per-chapter length ratio, line breaks, emphasis-marker parity, English-word heuristic, straight quotes, and every 15+ word paragraph under 85% of the English length or with two or more fewer sentences. Each flagged pair was read side by side.
2. Quote check: every paragraph that opens with “ in the English (including continuation paragraphs of a long speech, e.g. Nelly's and Isabella's narrations) opens with » in the Danish.
3. A read of the Danish for stiffness, anglicisms, register and address forms.

Status: **self-reviewed, not independently reviewed.** An independent EN/DA read remains open.

## Register, address and dialect

- Two narrators kept distinct: Lockwood's slightly pompous, self-ironic first person; Nelly's plain, lively storytelling voice.
- Address: De/Dem between gentlefolk and from Nelly to her employers and to Lockwood; du within the family, between the children, and from Heathcliff downward. Nelly says "hr. Lockwood", "hr. Edgar", "min herre"/"herren"; servants say "herren"/"fruen". Mr./Mrs./Miss = hr./fru/frøken.
- Joseph's Yorkshire is rendered as light Jutland-flavoured speech ("æ" for I/t', "I" for ye, "ka'", "sku'", "ingenting"), kept readable rather than phonetic. Zillah and the Grange housekeeper get it lightly; Hareton gets it lightly in his rough early scenes (ch32–34 lines included) and less as he learns.
- Units are not converted (miles, fod, tommer, alen).

## Names and recurring terms

- Kept in English: Wuthering Heights, Thrushcross Grange (often "Grange"), Gimmerton, Penistone Crags ("Crags"), Gimmerton Sough; all personal names (Nelly/Ellen Dean = fru Dean).
- Fairy Cave = Feernes Hule. Dogs keep their names (Juno, Gnasher, Wolf, Skulker, Throttler, Charlie, Phoenix); Isabella's dog is Fanny.
- Jabes Branderham's sermon: "Halvfjerds gange syv" and "den Første af den Enoghalvfjerdsindstyvende"; "Thou art the Man!" = »Du er manden!«.
- "dree" (Lockwood's dialect word) = _drøj_. Slough of Despond = Modløshedens Sump. cockatrice = basilisk. Milo = Milons skæbne. "Fairy Annie's Wedding" = ›Fe-Annies bryllup‹.

## Fixes applied in the second pass (selection)

- Ch1: "uværdig til et" and "den indre helligdom" (stiff renderings smoothed).
- Ch2: "lige i tide", "et anstrøg", "eget dørtrin"; ch2 p41 "Er det det, De mener?" -> "Er det, hvad De mener?" (lint).
- Ch3: "Lidelsesfæller", "denne vældige tumult".
- Ch4: "Lok". Ch5: "legende tyranni". Ch6: "på den!". Ch7: "uartige dreng". Ch8: one sentence restructured; p10 "helt ør af godt humør" -> "i et sprudlende humør" (lint false positive).
- Ch9: "græd mine øjne ud", "Den her hjemsøgelse".
- Ch13 p60: "at ligge i i hele huset" -> "i hele huset at ligge i" (lint).
- Ch14, ch15, ch23, ch30, ch31: wording polish after side-by-side reading.
- Ch21: "Dit gnavne skrog!"; p115 an added emphasis (_vil_) removed to match the English.
- Ch29: "lille kniv".
- Ch32: "She spoke at him" rendered as "Hun sendte ham stikpiller".
- Ch33: "et par kvadratmeter" -> "et par alen" (no metric conversion); p45 "er det det mindste" -> "betyder det mindst" (lint).
- Ch34 p19: "af og til til syne" reordered (lint).
- Quotes: 54 missing continuation » added across ch3, ch17 and others, plus 31 in ch30.

## Flagged pairs checked and accepted

Short dialogue lines (e.g. ch34 p73 »Ja,« svarede fru Dean, »så snart de er gift, og det bliver nytårsdag.«) fall under the ratio threshold because Danish compresses "which will be on". Read and accepted; no content is missing.
