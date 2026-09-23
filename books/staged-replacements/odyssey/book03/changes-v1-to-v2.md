# The Odyssey, Book 3 — changes from `candidate-v1.json` to `candidate-v2.json`

Every substitution the round-1 review produced, listed against the finding it
answers, in the order `../scripts/build_book3_v2.py` applies them. The build
asserts each `old` string is present exactly once before replacing it, so this
list is the script's own table and cannot drift from the file.

| | |
|---|---|
| v1 | `candidate-v1.json`, sha256 `2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa` — frozen, not edited |
| v2 | `candidate-v2.json`, sha256 `7095ef4f9925f284d3a31937d298b39766d619d8d5f2a01b61508c434989b905` |
| Findings applied | **29 paragraph-level** (18 minor, 11 of 12 optional) |
| Findings declined | **none** |
| Substitutions | **32**, in **27** of 38 paragraphs |
| Word ratio | 0.9561 → 0.9559 (0.9959 → 0.9957 excluding B03-P038) |
| Butler token retention | 0.895 → **0.897** |

`37.2` is the twelfth optional finding and the one that **proposes no change**:
it recommends *keeping* `sweetmeats` and recording why, which the build asserts
rather than edits (`37.2: sweetmeats must be KEPT, with the reason recorded`).
That is why 29 findings produce 32 substitutions across 28 numbered entries
below rather than a matching count.

## The substitutions

| # | Paragraph | Finding | From | To |
|---|---|---|---|---|
| 1 | `B03-P001` | 1.1 (minor) | `on mortals and immortals alike, they reached` | `on mortals and immortals, they reached` |
| 2 | `B03-P002` | 2.1 (minor) | `You have made this voyage to find out where` | `You have made this voyage to try to find out where` |
| 3 | `B03-P002` | 2.2 (minor) — Butler's two warranties are NOT identical | `and he will tell you no lies` | `and he will tell no lies` |
| 4 | `B03-P003` | 3.1 (minor) | `I am ashamed to begin by questioning` | `I am ashamed to start questioning` |
| 5 | `B03-P004` | 4.1 (optional, applied) | `heaven will prompt you with the rest` | `heaven will prompt you further` |
| 6 | `B03-P005` | 5.1 (optional, applied) | `while the men around him were busy` | `while his companions around him were busy` |
| 7 | `B03-P006` | 6.1 (optional, applied) | `for a man cannot live without God in the world` | `for man cannot live without God in the world` |
| 8 | `B03-P007` | 7.1 (minor) — Butler's causal 'accordingly' | `to have given it to her first, and she began praying` | `to have given it to her first, so she began praying` |
| 9 | `B03-P008` | 8.1 (optional, applied) — Butler's 'likewise' is manner, not sequence | `he prayed in his turn` | `he prayed in the same way` |
| 10 | `B03-P009` | 9.1 (minor) — 'sir strangers' keeps its noun | `Who are you, then, sirs, and from what port` | `Who are you, then, strangers, and from what port` |
| 11 | `B03-P011` | 11.1 (minor) — the 'honour TO the Achaean name' idiom | `honor of the Achaean name` | `honor to the Achaean name` |
| 12 | `B03-P012` | 12.1 (optional, applied) | `what mortal tongue could tell the whole story?` | `what mortal tongue indeed could tell the whole story?` |
| 13 | `B03-P013` | 13.2 (minor) — Butler's pluperfect 'had dispersed' | `as heaven scattered us` | `as heaven had scattered us` |
| 14 | `B03-P013` | 13.1 (minor) — the 'When ... then' frame keeps its 'then' | `as heaven had scattered us, Zeus saw fit` | `as heaven had scattered us, then Zeus saw fit` |
| 15 | `B03-P015` | 15.1 (optional, applied) | `This we did, and a fair wind` | `This we therefore did, and a fair wind` |
| 16 | `B03-P016` | 16.1 (optional, applied) | `and a fearful reckoning Aegisthus paid for it before long` | `and Aegisthus paid a fearful reckoning for it before long` |
| 17 | `B03-P017` | 17.1 (minor) — with 11.1, and the glossary row with them | `honor of the Achaean name` | `honor to the Achaean name` |
| 18 | `B03-P018` | 18.2 (minor) — D9, American spelling | `ill-disposed towards you` | `ill-disposed toward you` |
| 19 | `B03-P018` | 18.1 (optional, applied) — Butler varies suitors/wooers | `some of these suitors would soon forget their wooing` | `some of these wooers would soon forget their wooing` |
| 20 | `B03-P021` | 24.1 (minor) — Butler's 'counselled', 1 of 3 | `the gods long ago decided on his destruction` | `the gods long ago decreed his destruction` |
| 21 | `B03-P022` | 22.1 (minor) — Butler's 'cajoled' needed no replacing | `worked on Agamemnon’s wife Clytemnestra with unceasing flattery` | `cajoled Agamemnon’s wife Clytemnestra with unceasing flattery` |
| 22 | `B03-P023` | 24.1 (minor) — Butler's 'counselled', 2 of 3 | `when heaven had decided on her destruction` | `when heaven had decreed her destruction` |
| 23 | `B03-P023` | 23.1 (optional, applied) — Butler's 'batten upon' is gorging | `for crows and seagulls to feed on` | `for crows and seagulls to gorge on` |
| 24 | `B03-P024` | 24.1 (minor) — Butler's 'counselled', 3 of 3 | `Zeus planned evil against him` | `Zeus decreed evil against him` |
| 25 | `B03-P024` | 18.2 (minor) — D9, American spelling | `took the one half towards Crete` | `took the one half toward Crete` |
| 26 | `B03-P025` | 25.1 (minor) — 'twelvemonth' is dead; the span is unchanged | `even birds cannot fly that distance in a twelvemonth` | `even birds cannot fly that distance in a year` |
| 27 | `B03-P027` | 27.1 (minor) — first cross-Book typographic drift; Book 1 is accepted | `filled the mixing bowls with wine` | `filled the mixing-bowls with wine` |
| 28 | `B03-P028` | 28.1 (minor) — Butler's corrective 'but', not a cause | `—nor will my sons after me, for they will keep open house as I have done.` | `—nor will my sons after me; they will keep open house as I have done.` |
| 29 | `B03-P029` | 29.1 (optional, applied) | `He shall go back with you and sleep at your house` | `He shall therefore go back with you and sleep at your house` |
| 30 | `B03-P032` | 32.1 (minor) — D9; sceptre/scepter is a US-UK spelling pair | `sceptre in hand` | `scepter in hand` |
| 31 | `B03-P035` | 35.1 (optional, applied) — Butler's 'all in due course' | `They cut out the thigh bones in due order` | `They cut out all the thigh bones in due order` |
| 32 | `B03-P037` | 37.1 (minor) — the Book's only outright error | `and in course of time completed their journey` | `and in the course of time completed their journey` |

## Where the corrections went

**Nineteen of the thirty-two put a word or a form of Butler's back** —
`try and find out` as a hedge, his causal `accordingly`, his `likewise` as
manner, `sir strangers`' noun, the `honour to` idiom twice, `indeed`,
the pluperfect and the `then` that closes his `When … then` frame, `therefore`
twice, `man` the species, `his company`, his corrective `but` (as a
semicolon), `cajoled`, `batten upon` as `gorge`, the `suitors`/`wooers`
variation, `all in due course`'s `all`, and the article in `in the course of
time`. Retention rose, which is the shape a correction round should have.

**Three are standard-level, not Butler-level**: `twelvemonth` → `a year`
(25.1), `towards` → `toward` twice (18.2, D9), `sceptre` → `scepter` (32.1,
D9). The span, the direction and the object are unchanged in all three.

**One is cross-Book** (27.1): `mixing bowls` → `mixing-bowls`, matching
accepted Book 1. The same check found a third member of the drift in accepted
Book 2 and it was settled the same way — `../book02/candidate-v3.json`, a
recorded successor, leaving Book 2's accepted `candidate-v2.json` and its
`ACCEPTANCE.md` byte-unchanged (`../book02/changes-v2-to-v3.md`).

**One flattening is undone** (2.2): Butler writes the "excellent man" warranty
twice and **not identically** — `he will tell no lies` at B03-P002, `he will
tell you no lies` at B03-P025. v1 printed the second form in both places. v2
prints each as Butler wrote it, under the package's own B01-P019 / B03-P016
precedent, and `../GLOSSARY.md` and `continuity.md`, which both asserted the
two were word for word, are corrected (records finding **R1**).

## Findings not applied

**None.** Every numbered paragraph-level finding in `review/findings-v1.md` is
either applied above or is 37.2, which asks for no change and is asserted
unchanged. The "also noted" readings the reviewer considered and deliberately
did **not** raise are asserted still present by the build (fourteen of them),
so a later pass cannot silently "fix" something round 1 decided to leave.
