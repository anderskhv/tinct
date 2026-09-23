# b06 re-verification (R)

**Verdict: DEFECTS FOUND.** 2 blocking hedge/certainty drops in Raskolnikov's reasoning. The previous corrections introduced no errors.

## Coverage

I checked each paragraph in full against Garnett, with one paragraph of context on either side. I also read every ledger entry for these coordinates (P0-names, b06-F, b06-AV).

| Coord | Result | Notes |
|---|---|---|
| 19.74 | clean | Every correction is correct: the italics, "an object of suspicion", and "phalanstery, one of their socialist communal houses". Minor: "indeed" and "your" are dropped before "human nature". "Seductively clear—and you don't even have to think!" is closer to the Russian than to Garnett's "musn't think about it", and the next sentence keeps "you mustn't think". |
| 19.82 | clean | "pretender" is plain and fits Porfiry's staged hoaxes. |
| 19.100 | **defect** | The corrections are all correct: "if you like", "right... that is, not an official right", "overstep... certain obstacles", "sometimes, perhaps", "duty-bound... to _eliminate_", "all... well", "it's hard for them", "some new word", the italics, the Mahomet form and the gloss. The dash pairing is now sound. **Remaining blocking item:** "so to say" is dropped before "material" (the source reads "that is, so to say, material"). Minor: "breaches of morals" became "crimes", which matches Porfiry's own phrasing in 19.94/19.97. "punish them or hang them" became "punish and hang". |
| 19.118 | **defect** | The corrections are correct: "_new_", "perhaps one person", and "roughly, approximately" with the right gradation. **Remaining blocking item:** "One thing only is clear" became "One thing is clear", which drops the limiting "only". Minor: "In fact I have not peeped into the retort" became "In short..."; the Russian 'Наконец' means "finally", but the meaning is unaffected. |
| 19.159 | clean | The corrections are correct and consistent within the paragraph ("flat" in both places, "as quickly as possible... not to overlook anything", "I remember... I remember it clearly", "anywhere"). Minor: "I remember now" lost "now". Outside scope: 19.158 has "open apartment" and 20.12 has "at the apartment", while 19.159 uses "flat". |
| 20.11 | clean | "At last he sees through him!" matches the source exactly. The b06-AV revert of "Zametov" is right. |
| 20.58 | clean | This monologue is no more coherent or certain than the source. The fragmented ellipses are restored ("illness... overstep... this side... capable of that..."), along with "I was only capable of killing", "_I felt beforehand_" and "what shows". The brick sentence is unquoted, and "happiness of all" is repeated consistently. Minor: "better not live at all" lost "better". "no more nor less" became "nothing more". The quotation marks around 'trembling' are dropped. "I too want— Ugh" uses a dash where the source has an ellipsis. |

## Defects (in R.json)
1. **19.100:** "is material" becomes "is, so to speak, material". This restores his hedge "so to say".
2. **19.118:** "One thing is clear:" becomes "Only one thing is clear:". This restores the limiting "only".

`apply.py ... check --dry`: applied 2, rejected 0.
