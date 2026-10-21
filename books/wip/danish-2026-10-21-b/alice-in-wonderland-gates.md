# Gate results: alice-in-wonderland modern-da

- Source: app/public/data/editions/alice-in-wonderland-modern-en.json at origin/main, git blob `f318e93ff68189301a3d245b256892778c96047d`
- Candidate: books/wip/danish-2026-10-21-b/alice-in-wonderland-modern-da.json, git blob `24289bd6adfc945850727bccd4d0be8080de55e2`

| Ch | EN title | DA title | EN paras | DA paras | EN words | DA words | Ratio | Gate |
|---|---|---|---|---|---|---|---|---|
| 1 | Down the Rabbit-Hole | Ned i kaninhullet | 24 | 24 | 1919 | 2085 | 1.087 | PASS |
| 2 | The Pool of Tears | Tåresøen | 26 | 26 | 1880 | 2011 | 1.070 | PASS |
| 3 | A Caucus-Race and a Long Tale | Et komitéløb og en lang historie | 48 | 48 | 1536 | 1597 | 1.040 | PASS |
| 4 | The Rabbit Sends in a Little Bill | Kaninen sender lille Bill ind | 42 | 42 | 2279 | 2588 | 1.136 | PASS |
| 5 | Advice from a Caterpillar | Gode råd fra en larve | 75 | 75 | 1990 | 2113 | 1.062 | PASS |
| 6 | Pig and Pepper | Gris og peber | 80 | 80 | 2265 | 2470 | 1.091 | PASS |
| 7 | A Mad Tea-Party | Et tosset teselskab | 105 | 105 | 2057 | 2143 | 1.042 | PASS |
| 8 | The Queen’s Croquet-Ground | Dronningens krokethave | 71 | 71 | 2140 | 2310 | 1.079 | PASS |
| 9 | The Mock Turtle’s Story | Den Forlorne Skildpaddes historie | 92 | 92 | 2059 | 2182 | 1.060 | PASS |
| 10 | The Lobster Quadrille | Hummerkvadrillen | 81 | 81 | 1893 | 1956 | 1.033 | PASS |
| 11 | Who Stole the Tarts? | Hvem stjal tærterne? | 74 | 74 | 1647 | 1706 | 1.036 | PASS |
| 12 | Alice’s Evidence | Alices vidneudsagn | 71 | 71 | 1901 | 1969 | 1.036 | PASS |

- Whole book: 23566 EN words, 25130 DA words, ratio 1.066
- 1:1 paragraph alignment and chapter numbering: PASS
- Paragraphs detected as English (function-word heuristic + identical-to-source check): 0

## books/danish-lint.py

Run read-only via an import wrapper that points the script's hardcoded Mac `EDITIONS_DIR` at a scratch folder of symlinks (all live `*-modern-da.json` plus this candidate), so the corpus vocabulary matches a normal run. No repository code was changed.

```
     26 STRAY-UNDERSCORE
```

- BROKEN-COMPOUND, DOUBLE-FILLER, SPACE-BEFORE-PUNCT, BLACKLIST, CORRUPTED-LIST-NUMBER: 0.
- STRAY-UNDERSCORE: every hit is intended `_emphasis_` that mirrors the `_..._` markup in modern-en (the live Danish editions use the same markup, and the lint flags them too, e.g. a-little-princess). Emphasis parity check: underscore count equals the English paragraph's in every paragraph except two deliberate additions that carry a Danish pun (ch3 p36 `_knude_`, ch9 p87 `_lettere_`).
- Four legitimate "det det" constructions were rephrased so DOUBLE-FILLER is 0.
