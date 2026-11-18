# Independent review DA-C: modern-da, chapters 19–25

Reviewer: Claude (content-only). Every paragraph of ch. 19–25 (961 paragraphs) was compared with `master-and-margarita-original-ru.json`. Fixes are in `revDA-C.json` (47 entries). Each `old` occurs exactly once in its paragraph, and the entries apply cleanly in file order. No published translation was consulted, and no approved choice (style, glossary, De/du, «kejseren», racial terms, Bezdomnyj, «?..») was reopened.

## Counts

| Ch. | Paragraphs | Major | Minor | Of which glossary «galt» |
|---|---|---|---|---|
| 19 | 142 | 0 | 9 | – |
| 20 | 46 | 0 | 3 | – |
| 21 | 96 | 0 | 20 | 14 |
| 22 | 126 | 0 | 5 | 3 |
| 23 | 119 | 0 | 3 | – |
| 24 | 301 | 0 | 6 | – |
| 25 | 131 | 0 | 1 | – |
| **Total** | **961** | **0** | **47** | **17** |

No omissions, additions of whole clauses, wrong speakers, negation errors or paragraph-alignment problems were found. A length-ratio scan of all paragraphs (DA/RU) turned up no outliers that were not accounted for. The floor numbering (21:3, 21:4, 21:15–16, 21:26, 21:29–30, 22:6, 24:266) is correct, and so are the fixed echoes (19:21, 19:93, 24:301, 25:1, 22:31/22:53, 24:99, 24:166).

## The 5 most serious problems

1. **Nikolai Ivanovich's hog is «svin» in ch. 21–22 but «galt» in 24:227** (glossary: боров = «galten»). Behemoth's certificate, «I parentesen skriver du ›galt‹», is the payoff of Natasha's ride, and in Danish it no longer points back to it. There are 17 entries, with the pronouns det → den. *Alternative:* if Anders prefers «svin», change only 24:227 (›galt‹ → ›svin‹) and amend the glossary.
2. **хрип/хрипеть rendered as «hvæse» (hiss)** in 21:18, 21:70, 22:45 and 23:65. It is worst at 22:45, where Woland's voice "trak ud i en hvæsen". Elsewhere (20:14, 24:7, 25:74) the text correctly uses «hæs».
3. **19:65 wrong sense.** «Как же его может не быть?» ("How could he not be there?") became «Hvordan skulle han kunne lade være?» ("How could he refrain?").
4. **Small wrong-sense slips in ch. 24.** 24:6: the cat «hoppede op på stolen», but he is already sitting and bounces on it. 24:4: лафитный стакан became «vandglas». 24:294: марш лестницы became «trappeafsats» (a landing). 24:147: спохватившись became «kom i tanker om sig selv».
5. **Consistency breaks.** In 22:46 Woland's шпага is «sværd», but it is «kården» in 23:101–115. In 24:216 «hushjælpe» appears once, where the text otherwise always has «husassistent». In 21:25 «tog et let tilløb» (a run-up) is impossible while she hovers outside a window; Russian размахнулась means she swung her arm.

## Systematic patterns

- **хрип → «hvæse»** (see 2). If other reviewers find the same verb in their chapters, fix it throughout.
- **Curly apostrophe** «’» in 19:11, 20:18, 21:17 and 21:62, against the straight «'» used everywhere else (78:13 across the book). HARMONISATION.md §5 says Danish has no curly quotes. A global replace of «’» → «'» in `modern-da` would settle it.
- A handful of Danish grammar slips: definite adjective forms (19:16), the gender of «skrigeri» (19:107), the non-word «nærmende» (19:45), and an unparsed parenthesis (23:117).

Otherwise the Danish is natural and faithful. The irony comes through: Koroviev's «Jeg undskylder», the misspelt «Betalet», the cat's du/De joke. The solemn register of ch. 25 is sustained.

## Verdicts

- Ch. 19: **accept with fixes**
- Ch. 20: **accept with fixes** (3 small ones)
- Ch. 21: **accept with fixes** (mostly the mechanical «galt» change)
- Ch. 22: **accept with fixes**
- Ch. 23: **accept with fixes**
- Ch. 24: **accept with fixes**
- Ch. 25: **accept** (one optional detail fix, 25:13)
