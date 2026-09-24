# Independent review: Pride and Prejudice and Odyssey source cleanup

Reviewer: independent verifier subagent, 2026-09-24. Only this file was written, and nothing was committed.

## Method

- I extracted every pinned input with `git show` into a scratch directory and re-hashed it. All match the stated sha256 values: P&P source `5a4402…`, P&P candidate `5ba867…` and Odyssey served original `da03f6…`. The Odyssey accepted modern candidate is `bd05c7f4…`.
- **P&P:** I rebuilt the expected output from scratch by applying `head + " " + tail` at the seven claimed pairs to deep copies of the inputs, then compared the result structurally with the package outputs. I also compared the word multisets and the whitespace-stripped character streams.
- **P&P completeness, two scans:**
  - (a) A scan of both input editions for adjacent paragraphs where the first lacks terminal punctuation or the second starts lower-case.
  - (b) A scan of all 162 `[Illustration` blocks in `raw.txt`, checking the text lines on either side of each block.
- **P&P raw text:** I checked each seam against `raw.txt` (3 words on each side of the illustration, found in the merged paragraph exactly once).
- **P&P paragraph map:** I checked every row of `paragraph-map.tsv` by locating the old paragraph at the stated shift inside the new paragraph, using UTF-16 units. I also recomputed each merge-tail shift independently.
- **P&P CHANGES.json:** I checked every `before` and `after` record against the inputs and outputs.
- **Odyssey:** I did a paragraph-by-paragraph diff of the served original against the output. For the removed tail, I compared n-grams and computed the longest common word run against PG #1727 Book III (the text from the `BOOK III` heading to the `BOOK IV` heading, lines 1117–1544) and against the served 3.36. I also compared it with the served `odyssey-modern-en.json` 3.37 at b91d4b8d. The ledger was read from `books/staged-replacements/odyssey/00-progress-ledger.md` at 0a76d6ce. The brief's path under `edition/` does not exist.
- **Serialization:** For each input and output, I checked that `json.dumps(json.loads(b), indent=2, ensure_ascii=False).encode() == b` and that the file has no trailing newline.

## A. Pride and Prejudice

| Claim | Result | Evidence |
|---|---|---|
| All seven pairs are mid-sentence splits caused by illustrations | PASS | Each pair sits at an illustration in `raw.txt`: lines 999, 3251, 5207, 6854, 8061, 10410 and 11130. In each case the head ends without punctuation (`his`, `him`, `ever`, `have`, `told`, `his`, `your`) and the tail continues the sentence. Each seam's six words appear exactly once in the merged original. |
| The set is complete | PASS | Scan (b) finds no other illustration that falls inside a sentence. The only other hit is at line 6433 (28.10/28.11, `cried out,--` followed by `“Oh, my dear Eliza!`). That is the house convention: `raw.txt` has about 100 places without illustrations where `,--`/`:--` is followed by a blank line and a speech paragraph. So leaving 28.10/28.11 alone is correct. Scan (a) finds only these seven plus letter salutations and signatures (7.16, 13.13, 47.61, …), which are legitimate breaks. |
| Rejoined with exactly one space in both editions | PASS | No leading or trailing whitespace at any seam. The rebuilt `head+" "+tail` output equals the package output for both editions. |
| Nothing else changed; order preserved; 35.4 untouched | PASS | The whole rebuilt structure equals the output. Chapter 35 is identical in both editions (35.4 is 14,071 characters in the original and 12,997 in the modern). Top-level and chapter keys are unchanged. |
| No words lost, duplicated or invented | PASS | Word multisets and whitespace-stripped character streams are equal between input and output in both editions. |
| Editions stay aligned | PASS | 61/61 chapters, paragraph counts equal chapter by chapter. Total 2060 → 2053 in each edition. |
| Merge-tail offset = UTF-16 length of the old head + 1, per edition | PASS | All 14 recomputed shifts match: 664/625, 161/163, 388/378, 162/164, 479/458, 169/165, 881/843. All 153 map rows locate the old text at the stated position. Every paragraph of the seven affected chapters is covered. |
| CHANGES.json | PASS | 14 merge records (7 per edition). All `before` and `after` values match the inputs and outputs. |
| Serialization | PASS | Both outputs re-serialize byte-identically with indent=2 and ensure_ascii=False, and have no trailing newline. The inputs follow the same convention. |

## B. Odyssey

| Claim | Result | Evidence |
|---|---|---|
| B03-P038 / "Book 3 ¶38" is 1-based, i.e. chapter 3 index 37 | PASS | Chapter 3 has 38 paragraphs, so index 37 is the last one. The ledger says the served paragraph "already opens with these fifty-six characters", which fits only index 37. |
| The served 3.37 splices non-Butler prose after Butler's final clause | PASS | The served paragraph is 208 words, starting with Butler's 12-word clause (the clause appears exactly once in PG #1727). The removed tail is the verbatim suffix of the served `modern-en` 3.37 at b91d4b8d. |
| Output truncates it to exactly `Now when the sun had set and darkness was over the land,` | PASS | Exact string match. It matches PG line 1539; the ledger's A3 cites "PG line 1541", which is a minor ledger slip. |
| The removed tail contains no Butler text | PASS, with a wording caveat | The tail is not Butler's text. It is modern-en prose: an invented Nestor speech (`getting late`, `go home to rest` and `libations` do not appear anywhere in PG #1727), followed by a modernized retelling of 3.36. It does share Butler's wording in places. Its longest common run with PG Book III is 15 words (`princes then telemachus got into the chariot while pisistratus gathered up the reins and took`), and 53 of its 189 5-grams occur in Book III. All 53 of those 5-grams also occur in the served 3.36, and 0 occur only in Book III. So removing the tail deletes no Butler text that is missing elsewhere in the file. It is not literally free of Butler phrasing. |
| Nothing else changed; paragraph counts unchanged | PASS | Only 3.37 differs. 24 chapters, 1027 paragraphs, per-chapter counts equal, chapter metadata equal. 637,591 → 636,440 bytes. |
| Package modern-en is byte-identical to the accepted candidate; its 3.37 renders Butler's clause | PASS | `cmp` shows the files are identical (sha256 `bd05c7f4…`). Its 3.37 is `Now when the sun had set and darkness lay over the land,`. |
| Output sha256 `0cc76350…` matches the ledger's "A3 as prepared" | PASS | The output hashes to `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980`, which is option A in the ledger's A7 table and the A3 "after" row. |
| Serialization | PASS | Both outputs round-trip byte-identically with indent=2 and ensure_ascii=False, and have no trailing newline. |

## Other defects and observations

1. **Odyssey scope decision (not a defect in the package itself).** The package applies ledger option **A**, the truncation alone. Ledger A7 (2026-09-13) later widened A3 and recommends **B+**: the truncation, plus lower-casing `But` at 3.0 and `They` at 4.0, plus a terminal comma at the end of Book II. The ledger argues that A on its own "would restore the half-sentence and leave the capital that made it look broken". In the output, 3.0 still starts `But`, 4.0 still starts `They`, and 2.last still ends `dawn.`. Choosing A over B+ should be an explicit, recorded decision.
2. `odyssey/CHANGES.md` summarizes the tail as "an invented Nestor speech and a modern paraphrase of 3.36". That is accurate. Any wording that says "no Butler text" should be read as "no Butler text that is not already in 3.36" (see the caveat above).
3. The brief's ledger path `books/staged-replacements/odyssey/edition/00-progress-ledger.md` does not exist at 0a76d6ce. The file is at `books/staged-replacements/odyssey/00-progress-ledger.md`.

P&P VERDICT: VERIFIED — the seven illustration splits are the complete set, rejoined with one space in both editions; nothing else changed; the offsets and alignment are correct.
ODYSSEY VERDICT: VERIFIED — only 3.37 is truncated, to exactly Butler's clause; the hash matches the ledger's "A3 as prepared"; the modern file is identical to the candidate. Caveats: the removed tail shares phrasing with Butler, but only phrasing already in 3.36, and the package implements option A rather than the ledger's later B+ recommendation.
