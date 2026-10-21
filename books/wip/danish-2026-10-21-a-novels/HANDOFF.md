# Danish batch a-novels — handoff

**Assignment.** Anders reopened Danish for this run on 21 Oct 2026 (content only): new `modern-da` editions of pride-and-prejudice, jane-eyre, frankenstein and jekyll-and-hyde, translated from the current `modern-en` on origin/main. `STRATEGY.md` (Language scope, 21 Sep 2026) still says Danish is closed; it has not been updated, so this assignment is recorded here. Updating the strategy is Anders's call.

**Status.** Content package complete for all four books. Nothing is integrated, registered or live. The live `*-modern-da.json` files, `app/**` and the registry are untouched.

| Book | Status | Edition | Source blob (modern-en) | Gates |
|---|---|---|---|---|
| jekyll-and-hyde | Content complete, gates pass | `jekyll-and-hyde-modern-da.json` | `6f4786b170aaf7aa94de70aa92d13bfe9b21b600` | all pass |
| pride-and-prejudice | Content complete, gates pass | `pride-and-prejudice-modern-da.json` | `e518b504c7c54d7f1b508ef55efdf5f6afff7d48` | all pass |
| frankenstein | Content complete, gates pass | `frankenstein-modern-da.json` | `11e3c871e84661d118becfb3ca65cef5f9d59b02` | all pass |
| jane-eyre | Content complete, gates pass | `jane-eyre-modern-da.json` | `131080c575426a6beb381597099d094cbc2ccc0c` | all pass |

Source blobs are `git rev-parse origin/main:app/public/data/editions/{book}-modern-en.json` at origin/main `e8b2703325370882e3b8f22915b74839f295fb23`. If modern-en changes after that, the Danish edition is stale for the changed paragraphs.

## Package contents (per book)

- `{book}-modern-da.json` — the edition, same shape as the live files (`{"chapters":[{number,title,paragraphs}]}`), 1:1 with modern-en.
- `{book}-source.txt` — source path, origin/main commit and git blob hash.
- `{book}-gates.json` — gate results: alignment, English left in, per-chapter length ratio, `danish-lint.py`, plus a house-style scan.
- `{book}-review-log.json` — every reviewer fix applied (chapter, paragraph, reason, before, after) and any editor overrides.
- `glossaries/{book}.md` — names, places, terms, forms of address and conventions, extracted from the old `modern-da` (used only as a glossary; no sentences copied).
- `process/TRANSLATE.md`, `process/REVIEW.md` — the exact briefs the translator and reviewer subagents followed.

## Method

1. Glossary pass per book: a subagent compared modern-en with the old modern-da and wrote the glossary, flagging old renderings that were wrong (e.g. English miles as Danish »mil«, capitalised honorifics, mixed du/De).
2. Each chapter (chapters over ~3,600 words split into 2–4 consecutive chunks) was translated by its own subagent from modern-en, paragraph for paragraph, with the glossary, then self-checked with a structural checker.
3. A second, independent subagent saw only the English and the Danish of that chunk, checked every paragraph for meaning, omissions/additions, English left in, stiff phrasing, grammar and punctuation, and wrote full corrected paragraphs. These fixes were applied verbatim and logged.
4. Book assembly re-applies every review, then runs the gates. One mechanical normalisation is applied at assembly: speech-tag comma moved outside the closing quote (`»Ja,« sagde han` → `»Ja«, sagde han`), per Retskrivningsordbogen and the batch convention. Editor overrides (rare) are listed in the review log.

House conventions (all books): »…« for dialogue, ›…‹ nested; lowercase honorifics in running text (mr., mrs., miss, dr., sir, lady); `_emphasis_` kept; spaced en dash; English miles as »engelsk mil«; historical money and units unconverted; no start comma.

## Gates

- **Alignment**: same chapters, same paragraph count per chapter, same order as modern-en.
- **English left in**: no paragraph with an English function-word ratio above 0.12; no paragraph or title identical to the English (names-only lines excepted); no empty paragraphs.
- **Length ratio**: da/en in characters per chapter, 0.85–1.25. Word ratio is reported too.
- **danish-lint.py**: run unchanged (imported, with its editions directory pointed at a temporary folder holding the live DA corpus plus this candidate, since the script hard-codes a Mac path). `STRAY-UNDERSCORE` hits that are paired `_emphasis_` markers are counted as false positives and listed separately; `real_issues` must be 0.

## Book notes

### jekyll-and-hyde
- 10 chapters, 339 paragraphs, 25,260 English words. 13 chunks, 57 reviewer fixes applied.
- Gates: alignment pass; English left in: none; length ratio pass (no chapter outside 0.85–1.25); danish-lint: 0 issues.
- Editor override: 2.14 — the translator added a gloss to the Hyde/Seek pun (»han gemmer sig, jeg leder«) that is not in the English; removed, as the brief forbids additions.
- House-style scan: one false positive (»Skabet mærket E var«).

### pride-and-prejudice
- 61 chapters, 2,053 paragraphs, 114,391 English words. 64 chunks, 465 reviewer fixes applied (stiff 249, meaning 93, grammar 64, punctuation 45, addition 6, omission 5, register 2).
- Gates: alignment pass; English left in: none; length ratio pass (chapters 0.995–1.073, book 1.040); danish-lint: 0 real issues (41 `STRAY-UNDERSCORE` hits are paired `_emphasis_` markers, listed in the gates file).
- Assembly normalisation: 185 speech-tag commas moved outside the closing quote; 8 »allesammen« → »alle sammen«.
- Editor overrides: 8.9 and 32.17 English miles → »engelske mil«; 28.13 »Og er det det hele?« → »Og er det alt?« (correct Danish, but danish-lint flags »det det« as DOUBLE-FILLER, so it was rephrased with the same meaning).
- Forms of address: De between non-intimates; Darcy and Elizabeth switch to du at her acceptance (58.7–58.8), with her old words quoted in De in 58.13.
- Known residual: comma style before subordinate clauses is not fully uniform across chunks (mostly no start comma; a few chunks use it before »at«). Both are accepted Danish; a uniformity pass would be cosmetic.
- House-style scan: 10 hits, all false positives (»Å ja« read as a split word; »Mr.« capitalised at the start of a sentence inside a quote).

### frankenstein
- 28 chapters (Letters 1–4, Chapters 1–24), 764 paragraphs, 65,020 English words. 30 chunks, 173 reviewer fixes applied (stiff 87, meaning 47, grammar 29, punctuation 9, omission 1).
- Gates: alignment pass; English left in: none; length ratio pass (chapters 1.022–1.095, book 1.050); danish-lint: 0 real issues (19 `STRAY-UNDERSCORE` hits are paired `_emphasis_` markers, e.g. the letter address lines).
- Assembly normalisation: 33 speech-tag commas moved outside the closing quote.
- Editor overrides: 4.12 »løjtnanten« → »styrmanden« (Walton's lieutenant is »styrmand« in Letter 2); 9.26 »Er det det hele« → »Er det alt« (same danish-lint DOUBLE-FILLER case as Pride and Prejudice).
- Units: the first Frankenstein glossary told translators to convert to metric; this was corrected to the batch rule before most chunks were written, and the reviewers fixed the early slips (8.6 »otte fod«, 6.12 »tyve alen«). The house-style scan finds no metric units left. Leagues are »mil«, the traditional Danish rendering.
- Creature terms per the glossary: creature »skabning«, monster »uhyre«, fiend »djævel«, daemon »dæmon«, wretch »usling«/»stakkel« (the latter where the creature pities himself).
- House-style scan: 12 hits, all expected (»17—« year blanks in letter datelines; »mil« for leagues).

### jane-eyre
- 38 chapters, 4,034 paragraphs, 178,676 English words. 75 chunks, 552 reviewer fixes applied (stiff 287, meaning 122, grammar 106, omission 13, addition 9, punctuation 8, register 6, english 2).
- Gates: alignment pass; English left in: none; length ratio pass (chapters 1.016–1.080, book 1.052); danish-lint: 0 real issues.
- Editor overrides (19, all in the review log):
  - 18.15 Bridewell: the translator glossed the English charade words (»bride, brud, og well, brønd«), which the English does not do; the gloss was removed, the same policy as the Jekyll and Hyde Seek pun. **For Anders:** both puns now stand unexplained in Danish, as in the English. If you would rather gloss puns for Danish readers, that is a one-line override each.
  - 18.12, 29.14, 29.68, 34.40: capital »De« after a colon meant "they"; lowercased so it cannot read as the polite "you".
  - 22.23, 22.31, 22.32: »stentet« → »stenten« (common gender).
  - 3.52, 21.97, 24.57, 25.23, 26.85, 33.37: correct Danish that danish-lint flags as DOUBLE-FILLER (»det det«, »i i«), rephrased with the same meaning.
  - 1.18, 4.21, 4.43, 21.179: thoughts or a letter line that the English puts in quotation marks were unquoted; »…« added.
- Forms of address follow the glossary: De between non-intimates; Jane says du to Adèle; Jane and St. John switch to du at the cousin reveal (33.107 onwards); Rochester says du to Jane once they are intimate, while she keeps De and »sir«.
- Verse: Rochester's song in 24 is rendered as new Danish ballad verse (ABAB, a few near-rhymes); Bible echoes follow the 1992 Danish Bible wording.
- Known residual: comma style before subordinate and relative clauses is not fully uniform across chunks, as in the other books.
- House-style scan: 6 hits, all false positives (»Å ja«/»Å nej« read as split words; »Mr.« capitalised at the start of a sentence).

## Throughput

| Book | English words | Wall clock | Words per hour |
|---|---|---|---|
| jekyll-and-hyde | 25,260 | 12:41–12:53 UTC (glossary start to gates passing), ~12 min | ~126,000 |
| frankenstein | 65,020 | 13:00–13:13 UTC (first chunk launched to gates passing), ~13 min | ~300,000 |
| pride-and-prejudice | 114,391 | 12:47–13:06 UTC (first chunk launched to gates passing), ~19 min | ~360,000 |
| jane-eyre | 178,676 | 13:08–13:25 UTC (first chunk launched to gates passing), ~17 min | ~630,000 |
| **Batch total** | **383,347** | **12:41–13:25 UTC (glossary start to last gates passing), ~44 min** | **~525,000** |

Wall clock overlaps: from 12:51 Pride and Prejudice chunks ran in parallel on the same subagent pool (limit 20 concurrent), so per-book figures overstate the cost of each book alone; the batch total is the honest figure. All translation and review ran as subagents of this session (at most 20 at once); no script called the Anthropic API.

## Integration requirements (separate, assigned step)

- Replace `app/public/data/editions/{book}-modern-da.json` with the package edition after Anders decides to ship Danish; check that the reader still offers Danish for these books and that edition switching keeps position (paragraph identities are unchanged from modern-en).
- Any cached Danish narration for these books is stale for every paragraph.
- Danish onboarding/threads were not part of this assignment.
