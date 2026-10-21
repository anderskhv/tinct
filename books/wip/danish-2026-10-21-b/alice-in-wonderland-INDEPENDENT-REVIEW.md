# Independent review: alice-in-wonderland modern-da

Package: `books/wip/danish-2026-10-21-b/`, drafted on branch `claude/danish-1021-b`, reviewed on `claude/danish-1021-b-review`.
Candidate after this review: git blob `ecb81f192b7c1aa61dfc2bf1460ad96b440a3b33` (was `761b83bf977e8541a4a7f24ce44db434ca3cb3c3`).

**Verdict: ready after fixes.** The fixes below are applied in this branch. 0 meaning errors in 191 paragraphs; the Danish reads naturally, the verse rhymes, and the puns work in Danish. Remaining items are taste calls for Anders (open questions).

## Method

- Independent reviewer: a separate Claude session (not the drafter), 21 Oct 2026, reading in-conversation. No Anthropic API spend; no integration, merge or deploy.
- Source: `app/public/data/editions/alice-in-wonderland-modern-en.json` at origin/main; blob verified identical to `alice-in-wonderland-SOURCE-HASH.txt`.
- Read side by side, EN vs DA: the first and last chapter in full, plus a stratified random sample of the other chapters (seed `20261021-alice-in-wonderland`, at least 12% of the book's paragraphs, allocated per chapter in proportion to its length; within a chapter, weighted sampling without replacement, weight 1, +1 dialogue, +2 verse/line breaks, +1 over 120 words). Paragraph indices below are 0-based, as in the JSON.
- Whole-book checks: name and address-form greps for the main characters, quote marks (»…« and ›…‹, no straight or curly quotes), dash style, digits, leftover English, and pattern greps for errors found in the sample (tag-question calques, "I declare", "half a dozen", gender agreement).
- House style was checked against the live Danish editions (`a-little-princess`, `frankenstein`, `great-expectations`, `jane-eyre`, `pride-and-prejudice` modern-da): »…« with the comma inside, ›…‹ for inner quotes, straight `'` for elision and genitive, and a spaced em dash ` — ` (about 63,800 em dashes against 742 spaced en dashes across the live corpus). The candidates used a spaced en dash ` – `; this was normalised to `—` throughout.
- Severity: **meaning** = sense changed, dropped or added; **grammar** = wrong Danish grammar, agreement or address form (De/du) in context; **style** = correct but unidiomatic: calque, anglicism, clumsy word order, inconsistent naming. Rates are per 100 paragraphs read, counted before fixes, one count per distinct error.

## Paragraphs read (191 of 789, 24.2%)

- Chapter 1 in full (24) and chapter 12 in full (71).
- Random sample, 96 paragraphs (12.2% of the book):
  - ch2: 1, 2, 12, 23
  - ch3: 6, 11, 24, 26, 33, 38, 42
  - ch4: 3, 4, 6, 16, 24, 32
  - ch5: 1, 3, 16, 22, 33, 39, 40, 48, 51, 72
  - ch6: 2, 5, 24, 28, 29, 32, 35, 39, 61, 66, 72
  - ch7: 1, 6, 7, 10, 15, 17, 20, 29, 35, 43, 47, 74, 95, 103
  - ch8: 1, 2, 4, 25, 30, 36, 37, 44, 61, 63
  - ch9: 4, 11, 12, 14, 17, 26, 31, 47, 51, 56, 72, 76, 83
  - ch10: 1, 14, 15, 23, 38, 48, 57, 63, 68, 69, 80
  - ch11: 9, 10, 17, 48, 50, 54, 55, 62, 68, 73
- Context only (not counted): 4:15, 5:71, 6:4, 10:10–10:13.

## Error rate in the sample, before fixes

| Severity | Count | Per 100 paragraphs |
|---|---|---|
| Meaning | 0 | 0.0 |
| Grammar | 3 | 1.6 |
| Style | 7 | 3.7 |

- Grammar: 6:5 double negative »at ingen umuligt kan høre dig« (says the opposite of nothing); 12:3 the Lizard is »Firbenet/væsenet« (neuter) but was referred to as »den«; 8:4 »spurgte ham, der« in subject position.
- Style: 1:21 calque »Begge veje« (either way); 3:33 »spild af vor ånd« (wasting our breath); 4:16 »så er det sagt« does not carry the sarcastic "indeed!"; 4:24 English tag question »…, skal han?« and »lader … lader«; 7:47 »Hjerterdronningens« against the book's »Hjerter Dronning«; 12:16 »Jo, du er« (anglicism for »Jo, det er du«); 12:63 ambiguous relative clause (leaves fallen from the face).
- Found by whole-book grep outside the sample and fixed: 5:20 tag question »…, gør du?«; 10:73 »vil du ikke, gamle ven?«.

## Review-log decisions (drafter's log, judged)

- Names (den Hvide Kanin, Dronten, Lorien, Larven, Hertuginden, Cheshire-katten, Martsharen, Hattemageren, Syvsoveren, Hjerter Dronning/Konge/Knægt, Griffen, den Forlorne Skildpadde, Bill/Firbenet): accepted; grep shows them consistent across all 12 chapters after the one fix at 7:47.
- Address: Alice says du to everyone, the Rabbit and courtiers say »Deres Majestæt … De«. Accepted; it is the natural register of a Danish children's classic.
- Puns and verse: accepted as rendered. Strong: tale/tail (»en lang hale efter sig«), mine/mine, porpoise/purpose (»hval/valg«), lessons/lessen, »Han slår tiden ihjel«, the school subjects. Weaker but workable: Tortoise/taught us as »Lærken/lærte os« (the teacher becomes a lark); fit/fit as »anfald/anfægte« (12:55), where »anfægte« carries the sound but not the meaning. Verse keeps stanza and line counts; some rhymes are padded (12:41 »i nat«, 10:68 »med møje«), which suits nonsense verse.
- Units kept (miles, fod, tommer): accepted per the drafter's policy; »en mile« (12:13, 12:15) reads oddly in the singular but is understood.
- Emphasis: two deliberate additions (3:36 `_knude_`, 9:87 `_lettere_`) carry Danish puns; accepted.

## Fixes made

| Ch:p | Before | After |
|---|---|---|
| 1:21 | Begge veje kommer jeg ind i haven | Uanset hvad kommer jeg ind i haven |
| 3:33 | er spild af vor ånd | er spild af vor tid |
| 4:16 | Graver æbler, så er det sagt! | Graver æbler, minsandten! |
| 4:24 | »Åh! Så Bill skal ned gennem skorstenen, skal han?« sagde Alice til sig selv. »Det lader da til, at de lader Bill om det hele! | »Nå! Så Bill skal ned gennem skorstenen?« sagde Alice til sig selv. »Det ser da ud til, at de overlader det hele til Bill! |
| 5:20 | »Så du tror, du er blevet forvandlet, gør du?« | »Så du tror altså, at du er blevet forvandlet?« |
| 6:5 | at ingen umuligt kan høre dig | at ingen overhovedet kan høre dig |
| 7:47 | ved Hjerterdronningens store koncert | ved Hjerter Dronnings store koncert |
| 8:4 | spurgte ham, der havde talt først | spurgte den, der havde talt først |
| 10:73 | vil du ikke, gamle ven? | vil du ikke nok, gamle ven? |
| 12:3 | Hun trak den hurtigt op og vendte den rigtigt. | Hun trak det hurtigt op og vendte det rigtigt. |
| 12:3 | »Den gør sikkert _lige_ så megen nytte i retssagen, hvilken vej den så vender.« | »Det gør sikkert _lige_ så megen nytte i retssagen, hvilken vej det så vender.« |
| 12:16 | »Jo, du er,« | »Jo, det er du,« |
| 12:63 | fjerne nogle visne blade fra Alices ansigt, som var dalet ned fra træerne. | fjerne nogle visne blade, der var dalet ned fra træerne, fra Alices ansigt. |

Whole book: 131 x "–" -> "—" (house style)

## Gates re-run after fixes

- Alignment: 12 chapters, same numbers, 789 paragraphs, per-chapter counts equal to modern-en. PASS.
- Ratio per chapter 1.034–1.134 (window 0.85–1.25). PASS.
- English left: 0 (one heuristic hit, 10:80 »Su—uppe om a—a—aftenen«, is the Danish song). No straight or curly quotes. PASS.
- Emphasis parity: equal to modern-en except the two deliberate pun additions.
- `books/danish-lint.py`, run read-only through an import wrapper that points its hardcoded Mac `EDITIONS_DIR` at a scratch folder of symlinks (all live `*-modern-da.json` plus the three candidates): 26 STRAY-UNDERSCORE (intended `_emphasis_`, as in live editions), 0 on every other check.

## Open questions for Anders

1. Policy: STRATEGY.md (Language scope, 2026-09-21) still says Danish is out of scope. Integration needs that updated or your explicit go.
2. Dash style: I normalised the candidates' spaced en dash ` – ` to the live editions' spaced em dash ` — `. Danish typography normally uses the en dash; if you would rather switch the library to `–`, that is a corpus-wide change, not one for this package.
3. Taste calls on the puns: »Lærken« for Tortoise, »anfægte« for fit. Keep, or try another Danish pun?
4. Units: keep »miles/mile« or use »engelske mil«?

