# Niels Lyhne — completed content repair, r6

**COMPLETE — whole-book gate PASS.** This package is staged content; publication and integration are outside this repair.

## Baseline and scope

Repository `anderskhv/tinct`; baseline checked against `origin/main` revision `6dd90ae199a4fff7fc4692c0776158d73cbe171c`. The classifier and both live Niels Lyhne edition files were unchanged from the initial source pin. The requested live per-chapter classification is saved in `gate-before.txt`.

Writes are restricted to `books/wip/modern-en-repair-r6/niels-lyhne/`. `niels-lyhne-original-en.json` and `niels-lyhne-live-modern-en.json` are byte-for-byte live snapshots, rechecked after completion. `niels-lyhne-modern-en.json` is the repaired candidate. No other translation or source was mixed in. No app, registry, live edition, script, configuration, character, or deployment changes; zero Anthropic API calls.

## Changed chapter/paragraph coordinates

Coordinates are one-based. All original LIGHT chapters were rewritten paragraph by paragraph. The exact 842 changed coordinates relative to the live modern snapshot are recorded in `changed-paragraphs.json`. The table expresses the same set: each listed range changed except the stated positions.

| Chapter | Paragraph range | Unchanged positions within range |
|---|---|---|
| 2 | 1–19 | None |
| 3 | 1–103 | 55, 62, 87 |
| 4 | 1–14 | None |
| 5 | 1–42 | 34 |
| 6 | 1–64 | 58 |
| 7 | 1–46 | None |
| 8 | 1–63 | 20 |
| 9 | 1–114 | 65, 73 |
| 10 | 1–60 | 10, 27 |
| 11 | 1–218 | 8, 131, 145, 193, 214, 217 |
| 13 | 1–86 | 9, 26, 46 |
| 14 | 1–32 | None |

REAL chapters 1 and 12 remain exactly as published. Neither contains a source-identical paragraph over 40 words. All 14 chapters and 912 paragraph boundaries remain intact; no paragraphs were merged, split, dropped, or reordered. Chapter metadata is unchanged. Each `chapter-NN.json` matches its corresponding candidate chapter. Superseded working fragments were removed.

The unchanged positions above are section dividers or brief utterances. Embedded quoted verse is retained from the original, including chapter 6 paragraphs 41–42, chapter 9 paragraph 102, chapter 10 paragraphs 54/58/60, and chapter 13 paragraph 40. Restoring source wording in verse may itself count as a change relative to the published modern snapshot.

## Before/after gate

| Metric | Live baseline | Repaired candidate |
|---|---:|---:|
| Weighted similarity | 0.920 | 0.369 |
| LIGHT + MECHANICAL | 12/14 (85.7%) | 0/14 (0.0%) |
| Identical long paragraphs (classifier: ≥80 characters) | 78/713 (10.9%) | 3/713 (0.4%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations flagged | 0 | 0 |
| Whole-book result | FAIL | **PASS** |

Final per-chapter similarities: 1 0.850; 2 0.413; 3 0.405; 4 0.421; 5 0.381; 6 0.368; 7 0.409; 8 0.273; 9 0.290; 10 0.322; 11 0.316; 12 0.808; 13 0.346; 14 0.312. Chapters 1 and 12 are REAL; all twelve rewritten chapters are REAL-HEAVY.

The three identical long paragraphs are intact verse quotations: 6:41, 6:42, and 9:102. None exceeds 40 words. There are **zero** remaining source-identical paragraphs over 40 words anywhere in the candidate.

Final command, using an absolute staged prefix:

```
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/middlemarch-mm-f/books/wip/modern-en-repair-r6/niels-lyhne/niels-lyhne --gate --per-chapter
```

Output: `gate-after.txt`. The earlier passing 2–7 checkpoint remains in `gate-chapters-02-07.txt` as historical evidence. No classifier code or thresholds were changed.

## Structural and editorial verification

`validation.json` records chapter/paragraph counts, unchanged REAL chapters, snapshot parity, chapter-artifact parity, changed coordinates, the word floor, and exclamation preservation. Every candidate paragraph has at least 75% of the corresponding source words; minimum among changed paragraphs is exactly 0.75. Every changed paragraph retains the source count of exclamation marks.

The source and rewritten paragraphs were read during composition. Final targeted spot-reads covered the complete multi-paragraph Helge quotation and its surrounding argument (6:40–43), Hjerrild's full minority/fanaticism argument and the responding atheist argument (9:100–107), the preserved Christmas carol (9:102), and the armour/standing-death ending (14:31–32). The opening and closing quotation marks across 6:40–43 deliberately span the verse paragraphs; this is not a truncated quotation.

Further composition spot-checks covered chapter 2's cradle and parental contrast; chapter 3's place names, Bigum, Edele's rejection and final message; chapter 4's religious distinctions; chapter 5's artists and sacrificial imagery; chapter 7's imagined voyage and critique of idealization; chapter 8's centaur image, poet's development, maternal conversation and Clarens flowers; chapter 9's rocking-chair scene and Boye's social reconciliation; chapter 10's paintings, named furniture imagery and complete ballad; chapter 11's creative paralysis, plaster hand, illness, forest, affair, telegram, denunciation and ice crossing; chapter 13's sisters, religious instruction, Gerda's death and child's illness; and chapter 14's final disagreement and death. Arguments, incidents, examples and direct speech remain in their original paragraph positions.

All rewrites were composed as prose; no regex or dictionary modernization passes and no generated rewrite scripts were used. No independent editorial reviewer is claimed.

## SHA-256

```
5f30145593a20bee6deb22f8a524314193b9bf5319c053c6e0b6afd547872d37  niels-lyhne-original-en.json
88dc925851aae72fa3602b26917ec696e13a8499117c98298e71c6909f87521a  niels-lyhne-live-modern-en.json
93d2ee548c93d558a7c858e31836ddf1c6f4087ffb8776ea28f37ea7eeb352f9  niels-lyhne-modern-en.json

```

The same checksums are saved in `SHA256SUMS`.

## Known issues and integration notes

- No unfinished chapters or known structural failures remain. The classifier's quotation detector is limited; zero flags is accompanied by the editorial readings above, not claimed as an independent semantic proof.
- `books/characters/niels-lyhne/` **exists** and was not edited. A later integration task should check character mention compatibility and exact-text cache identity against the changed coordinates.
- REAL chapters 1 and 12 retain their published text by instruction.
- Commit this package alone after the existing passing A Little Princess commit `6efa6295223e1625fcf4cc1a7c555970653fb059` on `content/modern-en-repair-r6`. Do not include the historical checkout's unrelated branch commits. No deployment or live installation is part of this handoff.
