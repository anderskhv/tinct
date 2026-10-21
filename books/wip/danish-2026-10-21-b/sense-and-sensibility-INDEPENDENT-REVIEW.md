# Independent review: sense-and-sensibility modern-da

Package: `books/wip/danish-2026-10-21-b/`, drafted on branch `claude/danish-1021-b`, reviewed on `claude/danish-1021-b-review`.
Candidate after this review: git blob `cd2c5ea7b08ee95b9ba5bab92efe501512f9752a` (was `5576245cd02484f680e63d51a0e2a8b330cb4c54`).

**Verdict: ready after fixes.** The fixes below are applied in this branch. This is the cleanest of the three: no meaning errors in 252 paragraphs, Austen's irony survives, and the address forms are consistent. The errors were small grammar slips and one recurring calque (»Jeg erklærer« for the interjection "I declare"), which was fixed throughout the book.

## Method

- Independent reviewer: a separate Claude session (not the drafter), 21 Oct 2026, reading in-conversation. No Anthropic API spend; no integration, merge or deploy.
- Source: `app/public/data/editions/sense-and-sensibility-modern-en.json` at origin/main; blob verified identical to `sense-and-sensibility-SOURCE-HASH.txt`.
- Read side by side, EN vs DA: the first and last chapter in full, plus a stratified random sample of the other chapters (seed `20261021-sense-and-sensibility`, at least 12% of the book's paragraphs, allocated per chapter in proportion to its length; within a chapter, weighted sampling without replacement, weight 1, +1 dialogue, +2 verse/line breaks, +1 over 120 words). Paragraph indices below are 0-based, as in the JSON.
- Whole-book checks: name and address-form greps for the main characters, quote marks (»…« and ›…‹, no straight or curly quotes), dash style, digits, leftover English, and pattern greps for errors found in the sample (tag-question calques, "I declare", "half a dozen", gender agreement).
- House style was checked against the live Danish editions (`a-little-princess`, `frankenstein`, `great-expectations`, `jane-eyre`, `pride-and-prejudice` modern-da): »…« with the comma inside, ›…‹ for inner quotes, straight `'` for elision and genitive, and a spaced em dash ` — ` (about 63,800 em dashes against 742 spaced en dashes across the live corpus). The candidates used a spaced en dash ` – `; this was normalised to `—` throughout.
- Severity: **meaning** = sense changed, dropped or added; **grammar** = wrong Danish grammar, agreement or address form (De/du) in context; **style** = correct but unidiomatic: calque, anglicism, clumsy word order, inconsistent naming. Rates are per 100 paragraphs read, counted before fixes, one count per distinct error.

## Paragraphs read (252 of 1,806, 14.0%)

- Chapter 1 in full (14) and chapter 50 in full (21).
- Random sample, 217 paragraphs (12.0% of the book):
  - ch2: 5, 13, 21, 26
  - ch3: 10, 13, 19
  - ch4: 0, 3, 13
  - ch5: 6
  - ch6: 7
  - ch7: 8
  - ch8: 7, 8
  - ch9: 6, 10, 12, 29
  - ch10: 9, 12, 26
  - ch11: 11, 16
  - ch12: 3, 13, 23, 28
  - ch13: 3, 17, 45, 48, 54, 56, 59, 62, 66
  - ch14: 0, 7, 20
  - ch15: 19, 33, 36, 39, 40, 42
  - ch16: 8, 10, 14, 17, 35
  - ch17: 8, 33, 36, 40, 42, 43
  - ch18: 0, 1, 23, 25
  - ch19: 1, 5, 11, 24, 30
  - ch20: 1, 14, 36, 44, 49, 57, 62, 63
  - ch21: 8, 16, 29, 34, 38
  - ch22: 6, 38, 39, 41, 46, 51, 53
  - ch23: 0, 9, 16
  - ch24: 14, 16, 22, 25, 33
  - ch25: 1, 2, 4
  - ch26: 0, 6, 19, 23
  - ch27: 8, 22, 24, 26, 37, 43
  - ch28: 3, 16
  - ch29: 8, 13, 14, 31, 35, 38, 49, 50, 62
  - ch30: 10, 14, 27, 31, 32
  - ch31: 5, 25, 35, 39, 41
  - ch32: 18, 23, 25, 31, 38
  - ch33: 8, 23, 25, 42, 43, 47
  - ch34: 0, 6, 9, 17, 33
  - ch35: 14, 18, 23, 33, 39, 41
  - ch36: 5, 11, 24
  - ch37: 2, 6, 12, 26, 38, 56, 58
  - ch38: 15, 17, 21, 27
  - ch39: 4, 11, 21
  - ch40: 2, 8, 22, 29, 43, 48, 54
  - ch41: 1, 5, 10, 11, 30
  - ch42: 1, 16
  - ch43: 4, 7, 13, 14
  - ch44: 5, 12, 16, 18, 21, 44, 49, 51, 65, 81
  - ch45: 8, 9, 14
  - ch46: 8, 20, 23, 33
  - ch47: 3, 8, 14, 31, 35, 41
  - ch48: 8, 15, 22
  - ch49: 15, 26, 32, 39, 41, 46

## Error rate in the sample, before fixes

| Severity | Count | Per 100 paragraphs |
|---|---|---|
| Meaning | 0 | 0.0 |
| Grammar | 6 | 2.4 |
| Style | 9 | 3.6 |

- Grammar: 25:1 »nogen ekstra besvær« (neuter noun); 33:23 »trods ham selv« (should be reflexive: »trods sig selv«); 44:12 »Vi håber, at hun er.« (missing »det«); 47:8 »du være blevet tilladt at« (English passive); 49:46 »efter at have blevet« (wrong auxiliary); 50:14 »for gammel til at gifte sig« (missing »med«).
- Style: »Jeg erklærer, at…« for "I declare" (21:16, 32:25, 37:6); 31:25 »spunghus« (obscure; now »gældsfængsel«); 32:25 »Så, nu« and »ingen tilbeder af mig« (calques); 33:8 emphasis on »_I_« alone, which reads as the pronoun; 43:13 »senere end dette«; 50:17 »Han levede for at…« implies purpose (English "lived to").
- Found by whole-book grep outside the sample and fixed: »Jeg erklærer« at 34:12 and 36:16.

## Review-log decisions (drafter's log, judged)

- Register and address: accepted. De between adults in society; du in the family, between Marianne and Willoughby once intimate, and between Elinor and Edward after the engagement (ch49). A check of Edward's scenes found no De/du mixing within a speech.
- Mrs. Jennings's »min pige«, »frue« for ma'am, »mor« for Mama: accepted; natural.
- Lucy's and Anne Steele's grammar slips (»min søster og mig«, »hun havde forærede os«, »Edward han har«): accepted; they mark the characters without looking like typos.
- Terms (præstekald, præstegård, kapellanstilling, livrente, kavaler, »lægge an på«, »Den ene kile driver den anden ud«, the identical overheard sentence in ch39): accepted.
- Willoughby's curricle is consistently »karet«/»tohjulede karet« (10:27, 13:62, 15:1, 30:9). »Karriol« would be more exact, but the term is consistent and understood, so it is not changed.
- hr./fru/frøken for Mr./Mrs./Miss: accepted, and better Danish. Note that the live `pride-and-prejudice-modern-da` keeps »Mr. Bennet«, so the library is inconsistent here (open question 2).

## Fixes made

| Ch:p | Before | After |
|---|---|---|
| 21:16 | Jeg erklærer, at jeg allerede forguder dem. | Jeg må sige, at jeg allerede forguder dem. |
| 25:1 | gøre mig nogen ekstra besvær | gøre mig noget ekstra besvær |
| 31:25 | i et spunghus | i et gældsfængsel |
| 32:25 | »Så, nu,« sagde frøken Steele | »Nej, hør nu,« sagde frøken Steele |
| 32:25 | Men jeg erklærer, at jeg aldrig | Men jeg forsikrer Dem, at jeg aldrig |
| 32:25 | Doktoren er ingen tilbeder af mig. | Doktoren er ikke min tilbeder. |
| 33:8 | _I_ formiddag havde jeg | _I formiddag_ havde jeg |
| 33:23 | trods ham selv | trods sig selv |
| 34:12 | Jeg erklærer, at jeg knap kan stå på benene. | Jeg må sige, at jeg knap kan stå på benene. |
| 36:16 | Jeg erklærer, at hvis jeg havde | Jeg må sige, at hvis jeg havde |
| 37:6 | Jeg erklærer, at jeg ikke har nogen tålmodighed | Jeg må sige, at jeg ikke har nogen tålmodighed |
| 43:13 | til langt senere end dette. | til langt senere på aftenen. |
| 44:12 | »Vi håber, at hun er.« | »Vi håber, at hun er det.« |
| 47:8 | Måske ville du være blevet tilladt at udøve den, | Måske ville man have tilladt dig at udøve den, |
| 49:46 | efter at have blevet et par nætter | efter at være blevet et par nætter |
| 50:14 | for gammel til at gifte sig, og som | for gammel til at gifte sig med, og som |
| 50:17 | Han levede for at beskæftige sig virksomt og ret tit for at more sig. | Han levede videre, beskæftigede sig virksomt og morede sig ret tit. |

Whole book: 314 x "–" -> "—" (house style)

## Gates re-run after fixes

- Alignment: 50 chapters, same numbers, 1,806 paragraphs, per-chapter counts equal to modern-en. PASS.
- Ratio per chapter 1.019–1.108 (window 0.85–1.25). PASS.
- English left: 0. No straight or curly double quotes. PASS.
- Emphasis parity: equal to modern-en in every paragraph.
- `books/danish-lint.py` (read-only wrapper): 62 STRAY-UNDERSCORE (intended `_emphasis_`), 0 on every other check.

## Open questions for Anders

1. Policy: STRATEGY.md still says Danish is out of scope; integration needs it updated or your explicit go.
2. Titles: this edition (and Wuthering Heights) uses »hr./fru/frøken«, while the live Pride and Prejudice uses »Mr./Mrs.«. Which should be library house style for English novels in Danish?
3. Dash style: normalised to the live editions' spaced em dash (see the Alice review).

