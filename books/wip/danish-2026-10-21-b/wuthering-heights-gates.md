# Gate results: wuthering-heights modern-da

- Source: app/public/data/editions/wuthering-heights-modern-en.json at origin/main, git blob `bebdbfa87ba6b859f49403b158ff2ef47f5ff0e3`
- Candidate: books/wip/danish-2026-10-21-b/wuthering-heights-modern-da.json, git blob `5ca7c60872188b3e9924fbcc17b4c4f494bfaa2a`

| Ch | EN title | DA title | EN paras | DA paras | EN words | DA words | Ratio | Gate |
|---|---|---|---|---|---|---|---|---|
| 1 | Chapter I | Kapitel I | 27 | 27 | 1931 | 2036 | 1.054 | PASS |
| 2 | Chapter II | Kapitel II | 91 | 91 | 3273 | 3556 | 1.086 | PASS |
| 3 | Chapter III | Kapitel III | 64 | 64 | 4600 | 5016 | 1.090 | PASS |
| 4 | Chapter IV | Kapitel IV | 43 | 43 | 2529 | 2785 | 1.101 | PASS |
| 5 | Chapter V | Kapitel V | 8 | 8 | 1315 | 1459 | 1.110 | PASS |
| 6 | Chapter VI | Kapitel VI | 14 | 14 | 2414 | 2627 | 1.088 | PASS |
| 7 | Chapter VII | Kapitel VII | 59 | 59 | 3695 | 4134 | 1.119 | PASS |
| 8 | Chapter VIII | Kapitel VIII | 69 | 69 | 3120 | 3535 | 1.133 | PASS |
| 9 | Chapter IX | Kapitel IX | 127 | 127 | 5558 | 6244 | 1.123 | PASS |
| 10 | Chapter X | Kapitel X | 101 | 101 | 5671 | 6386 | 1.126 | PASS |
| 11 | Chapter XI | Kapitel XI | 71 | 71 | 3761 | 4214 | 1.120 | PASS |
| 12 | Chapter XII | Kapitel XII | 84 | 84 | 4888 | 5304 | 1.085 | PASS |
| 13 | Chapter XIII | Kapitel XIII | 66 | 66 | 4145 | 4392 | 1.060 | PASS |
| 14 | Chapter XIV | Kapitel XIV | 35 | 35 | 3191 | 3551 | 1.113 | PASS |
| 15 | Chapter XV | Kapitel XV | 49 | 49 | 3027 | 3290 | 1.087 | PASS |
| 16 | Chapter XVI | Kapitel XVI | 20 | 20 | 1721 | 1802 | 1.047 | PASS |
| 17 | Chapter XVII | Kapitel XVII | 92 | 92 | 6408 | 7000 | 1.092 | PASS |
| 18 | Chapter XVIII | Kapitel XVIII | 55 | 55 | 3291 | 3597 | 1.093 | PASS |
| 19 | Chapter XIX | Kapitel XIX | 31 | 31 | 1502 | 1594 | 1.061 | PASS |
| 20 | Chapter XX | Kapitel XX | 50 | 50 | 2043 | 2259 | 1.106 | PASS |
| 21 | Chapter XXI | Kapitel XXI | 118 | 118 | 5829 | 6481 | 1.112 | PASS |
| 22 | Chapter XXII | Kapitel XXII | 34 | 34 | 2165 | 2391 | 1.104 | PASS |
| 23 | Chapter XXIII | Kapitel XXIII | 78 | 78 | 2716 | 3084 | 1.135 | PASS |
| 24 | Chapter XXIV | Kapitel XXIV | 51 | 51 | 3763 | 4152 | 1.103 | PASS |
| 25 | Chapter XXV | Kapitel XXV | 15 | 15 | 1413 | 1604 | 1.135 | PASS |
| 26 | Chapter XXVI | Kapitel XXVI | 35 | 35 | 1442 | 1624 | 1.126 | PASS |
| 27 | Chapter XXVII | Kapitel XXVII | 81 | 81 | 4357 | 4893 | 1.123 | PASS |
| 28 | Chapter XXVIII | Kapitel XXVIII | 37 | 37 | 2535 | 2767 | 1.092 | PASS |
| 29 | Chapter XXIX | Kapitel XXIX | 22 | 22 | 2193 | 2395 | 1.092 | PASS |
| 30 | Chapter XXX | Kapitel XXX | 40 | 40 | 2284 | 2550 | 1.116 | PASS |
| 31 | Chapter XXXI | Kapitel XXXI | 40 | 40 | 1991 | 2176 | 1.093 | PASS |
| 32 | Chapter XXXII | Kapitel XXXII | 86 | 86 | 3808 | 4142 | 1.088 | PASS |
| 33 | Chapter XXXIII | Kapitel XXXIII | 54 | 54 | 2953 | 3264 | 1.105 | PASS |
| 34 | Chapter XXXIV | Kapitel XXXIV | 84 | 84 | 4115 | 4428 | 1.076 | PASS |

- Whole book: 109647 EN words, 120732 DA words, ratio 1.101
- 1:1 paragraph alignment and chapter numbering: PASS
- Paragraphs detected as English (function-word heuristic + identical-to-source check): 0

## books/danish-lint.py

Run read-only via the same import wrapper as Alice (hardcoded Mac `EDITIONS_DIR` pointed at a scratch folder of symlinks to all live `*-modern-da.json` plus the candidates). No repository code was changed.

```
     56 STRAY-UNDERSCORE
```

- BROKEN-COMPOUND, DOUBLE-FILLER, SPACE-BEFORE-PUNCT, BLACKLIST, CORRUPTED-LIST-NUMBER: 0.
- STRAY-UNDERSCORE: every hit is intended `_emphasis_` mirroring modern-en's `_..._` markup (the lint flags emphasis on a capitalised word; live editions are flagged the same way). Emphasis parity check: underscore count equals the English paragraph's in every paragraph (0 mismatches).
- Fixed to reach 0 on the other checks: four DOUBLE-FILLER ("det det" ch2 p41 and ch33 p45, "i i" ch13 p60, "til til" ch34 p19) rephrased; one BROKEN-COMPOUND false positive ("helt ør", ch8 p10) rephrased to "i et sprudlende humør".
- The blacklist bans "halvfjerdsindstyve" as a whole word; ch3 uses "Halvfjerds gange syv" and the ordinal "den Enoghalvfjerdsindstyvende", which the lint accepts.
