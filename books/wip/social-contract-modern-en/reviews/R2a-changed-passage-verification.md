# R2a changed-passage verification

## Scope
50 paragraphs from r2a.json (source vs reviewed vs current candidate.json), checked against FIXLOG-X1..X3 and F-reports. Whole-book identity check: every paragraph not in post-review-changed.json (99 listed) is byte-identical between reviewed and current: 0 unlisted differences. Scripted checks on the 50: footnote markers, italic counts, straight quotes, `--`, double spaces, contractions, length >= 75% of source: no flags.

## Verdicts

| Paragraph | Verdict | Note |
|---|---|---|
| ch1 p0 | CLEAN | finding resolved; no new defect |
| ch2 p2 | CLEAN | finding resolved; no new defect |
| ch2 p7 | CLEAN | finding resolved; no new defect |
| ch3 p2 | CLEAN | brigand question restored as not only/but even if; reads correctly |
| ch4 p0 | CLEAN | finding resolved; no new defect |
| ch4 p7 | CLEAN | force restored; gloss 'relations between things' supported by preceding sentence |
| ch4 p12 | CLEAN | finding resolved; no new defect |
| ch5 p0 | CLEAN | finding resolved; no new defect |
| ch5 p1 | CLEAN | finding resolved; no new defect |
| ch6 p2 | CLEAN | finding resolved; no new defect |
| ch6 p6 | CLEAN | finding resolved; no new defect |
| ch6 p9 | CLEAN | as a body; italics wrap quotes as the reviewer accepted |
| ch6 p10 | CLEAN | finding resolved; no new defect |
| ch7 p6 | CLEAN | finding resolved; no new defect |
| ch7 p7 | CLEAN | finding resolved; no new defect |
| ch9 p0 | CLEAN | both clauses now negated; matches source sense (no softening) |
| ch9 p1 | CLEAN | finding resolved; no new defect |
| ch9 p5 | CLEAN | finding resolved; no new defect |
| ch10 p4 | CLEAN | finding resolved; no new defect |
| ch13 p10 | CLEAN | finding resolved; no new defect |
| ch14 p0 | CLEAN | finding resolved; no new defect |
| ch14 p1 | CLEAN | finding resolved; no new defect |
| ch15 p1 | CLEAN | finding resolved; no new defect |
| ch16 p1 | CLEAN | finding resolved; no new defect |
| ch16 p8 | CLEAN | finding resolved; no new defect |
| ch17 p2 | CLEAN | finding resolved; no new defect |
| ch18 p1 | CLEAN | finding resolved; no new defect |
| ch18 p2 | CLEAN | finding resolved; no new defect |
| ch18 p4 | CLEAN | finding resolved; no new defect |
| ch18 p5 | CLEAN | finding resolved; no new defect |
| ch19 p0 | CLEAN | smallness matches French petitesse |
| ch20 p2 | CLEAN | finding resolved; no new defect |
| ch20 p3 | CLEAN | finding resolved; no new defect |
| ch21 p1 | CLEAN | finding resolved; no new defect |
| ch22 p2 | CLEAN | finding resolved; no new defect |
| ch22 p9 | CLEAN | finding resolved; no new defect |
| ch22 p10 | CLEAN | 'number of people in a nation' resolves size/territory ambiguity |
| ch22 p13 | CLEAN | finding resolved; no new defect |
| ch22 p22 | CLEAN | finding resolved; no new defect |
| ch23 p9 | CLEAN | finding resolved; no new defect |
| ch25 p5 | CLEAN | finding resolved; no new defect |
| ch26 p8 | CLEAN | finding resolved; no new defect |
| ch26 p9 | CLEAN | 'maintains it is' removes ambiguity; no change of claim |
| ch27 p4 | CLEAN | finding resolved; no new defect |
| ch27 p7 | CLEAN | finding resolved; no new defect |
| ch27 p12 | CLEAN | comparison restored; reads clearly |
| ch28 p5 | CLEAN | finding resolved; no new defect |
| ch29 p8 | CLEAN | finding resolved; no new defect |
| ch29 p16 | CLEAN | finding resolved; no new defect |
| ch30 p2 | CLEAN | former/latter map to subjects/citizens; fragment-free |

DEFECT count: 0. No replacement text needed.
