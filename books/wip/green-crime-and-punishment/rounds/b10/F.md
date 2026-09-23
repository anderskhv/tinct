# b10 fidelity and repair review: Ch 30–31 (Part 5, Chapters 4–5)

## Coverage
- Ch 30: 30.0–30.169 (170)
- Ch 31: 31.0–31.109 (110)
- **Total: 280 paragraphs**, matching the batch spec (170 + 110). Every source/candidate pair was read in order, in slices of 22–36 paragraphs, with the neighbouring paragraphs in view. No content crosses a paragraph boundary, and there is no duplication across paragraphs.

## Findings summary
There are 71 proposals, 14 of them blocking.

| Category | Count |
|---|---|
| emphasis | 24 |
| meaning | 14 |
| omission | 13 |
| hesitation | 9 |
| invented | 4 |
| certainty | 2 |
| period | 2 |
| register / syntax / other | 1 each |

The most important findings:
- **The confession's hesitations are restored (F4).**
  - 30.59: "he... killed her by accident"
  - 30.85: "Oh, well — to rob her", his first, throwaway false motive
  - 30.95: "Then why... why" (a known loss)
  - 30.115: "and... and sinful" (a known loss)
  - 30.119: the faltering "Well... that's all... Well, of course..." had been cut down to a clean admission
  - 30.22, 30.90 and 31.61: trailing-off and self-interruption were restored.
- **Places where the modern text made him more certain or more reasoned:**
  - 30.0: "he knew he couldn't help telling her". The source says he *felt* this.
  - 30.128: "I wouldn't, on principle!" gave his sulking a rationale. The source has "on purpose, from sulkiness".
  - 30.126: "I know she wasn't a louse" lost the concessive "I too know".
  - 30.115: the candidate invented "for a terribly long time".
- **Invented content:**
  - 30.142: "to all four sides", from the Russian and not in Garnett.
  - 31.53: "on Meshchanskaya Street", same source.
  - 31.11: "banging nails".
- **Religious and loaded language:**
  - 30.145: "expiate your sin" had become "redeem yourself".
  - 30.130: "one thing, one thing needful" (the Luke 10:42 echo) had become "only one thing needed".
- **31.21, Dounia:**
  - "I don't think so either" reversed her disagreement with Razumihin.
  - Her offer of "all my life" was dropped.
- **Emphasis restored:** 30.0 _had_ / _felt_, 30.34 _that_ moment, 30.54 _it_, 30.93 _that_ money, 30.98 _happy_, 30.102 _where_, 30.130 _to have that courage_, 30.134 the _right_, 30.136 _try_, 31.31 _say goodbye_ / _to tell_, 31.33 _she_. The French and German fragments in Katerina Ivanovna's scenes (31.44–31.86) are italicized again, as in the source; the candidate already italicizes foreign phrases elsewhere, for example 2.20 _drap de dames_.
- **Katerina Ivanovna's voice:**
  - 31.46: her feverish repetitions ("I've taught it to you, I've taught it to you", "nothing but 'My Village'") are restored.
  - 31.78: "The party's over" is back to "The ball is over."
  - 31.80: "then so be it" is back to "I don't care!"
  - 31.94: "vindictive despair" is restored.

## Considered and rejected
- **30.36:** the dropped quotation marks around "he must not lose another minute". The meaning is intact.
- **30.104:** the candidate puts "'You suffer too, and I'll feel better!'" in quotes. This is an acceptable rendering of his mock-reasoning.
- **30.12, 30.28:** "It's always the same with you" and "God's will" for "Divine Providence" are faithful modernizations. "Providence" is kept in 30.32.
- **30.119:** "recited it as though from memory" for "repeated it as though it were a lesson" is faithful.
- **30.128:** "base" became "petty". This is borderline, but the tone is kept, so I left it.
- **30.134:** "pick up power" adds an object, but the source established "power" in 30.130. Left as is.
- **30.148:** "go to the authorities" is a helpful clarification of "them", not an invention.
- **31.10:** "snapped out of his monologue" for "woke up with a start" is an interpretive gloss, but harmless.
- **31.42, 31.43:** Lebeziatnikov's "frantic" muddle is preserved. "Truly deranged" for "really frantic" is acceptable.
- **31.70:** "half a liter" for "a pint" is a unit modernization, not a defect.
- I left out these minor omissions because they are too small to matter:
  - 30.40: "Ach"
  - 30.109: "Ach"
  - 31.40: the second "Only fancy"
  - 31.58: the repeated "calm yourself"

## Checker
`apply.py rounds/b10/F.json check --dry`: **applied 71, rejected 0**.

## Verdict
After these repairs, Ch 30–31 are faithful. The confession keeps its shifting, contradictory motives with their original uncertainty:
- hunger and his mother (30.87–88)
- "to rob" (30.85)
- Napoleon (30.112–115)
- the family's poverty (30.119)
- "a louse" (30.124–126)
- "to dare" (30.130)
- "to find out whether I was a louse or a man" (30.134)
- "I murdered myself" (30.138)

The candidate already preserves all of these. The repairs restore the stammers and "felt"/"on purpose" qualifications that had made him sound more coherent. No passage is left unresolved.
