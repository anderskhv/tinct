# Edition-consistency edits: independent verification

**Verdict: VERIFIED CLEAN**

Scope: the 7 edits in `edition-consistency-edits.json`, across 5 successor files. Package: `/home/user/tinct-ody/books/staged-replacements/odyssey/`.

## 1. Structural diff (each from → to)

For each file, the listed replacements were applied to `<from>` and the result was compared with `<to>` as a whole JSON object: keys, `number`, `title` and every paragraph.

| Book | from → to | Old strings unique | `to` = `from` + edits exactly | number / ¶ count |
|---|---|---|---|---|
| 9 | v2 → v3 | yes (title) | yes | 9 / 44 = 44 |
| 11 | v3 → v4 | yes (¶7) | yes | 11 / 54 = 54 |
| 15 | v3 → v4 | yes (¶7 ×2, ¶8) | yes | 15 / 48 = 48 |
| 20 | v3 → v4 | yes (¶21) | yes | 20 / 36 = 36 |
| 22 | v3 → v4 | yes (¶33) | yes | 22 / 52 = 52 |

No other change in any file.

## 2. Per-edit faithfulness

**Book 9 title**: OK.
- Butler's heading at PG lines 3797–3798 reads "ULYSSES DECLARES HIMSELF AND BEGINS HIS STORY—-THE CICONS, LOTOPHAGI, AND CYCLOPES." The stray `—-` is confirmed as PG's slip.
- The new title is "Book 9 — Odysseus declares himself and begins his story—the Cicons, Lotophagi, and Cyclopes".
- Every other title is consistent with it. That covers B01 v4, B02 v6, B03 v3, B04 v6, B05 v3, B06 v3, B07 v2, B08 v2 and B10–B23 candidate-accepted, plus B24 v1 checked as well. None contains "Ulysses". All use one unspaced em dash between segments, after the "Book N — " prefix. None has `—-` or a doubled dash.
- The live `odyssey-modern-en.json` already has "Odysseus" in Book 9 but still has the `—-` slip. The edit fixes that slip.

**Book 11 ¶7**: OK.
- Butler (PG 4878–4879 and source-book11.json) reads "the sheep and cattle belonging to the sun, who sees and gives ear to everything". The phrase is "the sun", not "sun-god", so the added "god" was unfaithful.
- The new text reads "belonging to the sun, who sees and hears everything". It is grammatical.
- Where Butler does write "sun-god" (e.g. PG 5433, 5544 ff.), the edition keeps it. No unhyphenated "sun god" remains in any latest candidate.

**Mixing-bowl edits (B15 ¶7 ×2, B15 ¶8, B20 ¶21, B22 ¶33)**: OK.
- The PUNCTUATION.md §4 table has a "hyphenated" row that lists `mixing bowl` → `mixing-bowl` (line 183). §4 also records it as finding 27.1 at Book 2.
- Butler's text at each spot:
  - B15: open "mixing bowl" (PG 6637, 6646, 6652).
  - B20: Butler's own "mixing-bowls" (PG 9105).
  - B22: open "mixing bowl" (PG 9907).
- These are the silent typographic normalizations the table prescribes. All are grammatical, and the plural in B20 is kept.
- After the edits, no unhyphenated "mixing bowl(s)" remains in the edited files. None remains in any of the 24 latest candidates either.

## 3. Other observations in the edited paragraphs

No defects found. B15 ¶7–8, B20 ¶21 and B22 ¶33 read cleanly and match Butler's sense.
