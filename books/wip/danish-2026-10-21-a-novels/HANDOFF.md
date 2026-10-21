# Danish batch a-novels — handoff

**Assignment.** Anders reopened Danish for this run on 21 Oct 2026 (content only): new `modern-da` editions of pride-and-prejudice, jane-eyre, frankenstein and jekyll-and-hyde, translated from the current `modern-en` on origin/main. `STRATEGY.md` (Language scope, 21 Sep 2026) still says Danish is closed; it has not been updated, so this assignment is recorded here. Updating the strategy is Anders's call.

**Status.** Content package in progress. Nothing is integrated, registered or live. The live `*-modern-da.json` files, `app/**` and the registry are untouched.

| Book | Status | Edition | Source blob (modern-en) | Gates |
|---|---|---|---|---|
| jekyll-and-hyde | Content complete, gates pass | `jekyll-and-hyde-modern-da.json` | `6f4786b170aaf7aa94de70aa92d13bfe9b21b600` | all pass |
| pride-and-prejudice | In progress | | `e518b504c7c54d7f1b508ef55efdf5f6afff7d48` | |
| frankenstein | Not started | | `11e3c871e84661d118becfb3ca65cef5f9d59b02` | |
| jane-eyre | Not started | | `131080c575426a6beb381597099d094cbc2ccc0c` | |

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

## Throughput

| Book | English words | Wall clock | Words per hour |
|---|---|---|---|
| jekyll-and-hyde | 25,260 | 12:41–12:53 UTC (glossary start to gates passing), ~12 min | ~126,000 |

Wall clock overlaps: from 12:51 Pride and Prejudice chunks ran in parallel on the same subagent pool (limit 20 concurrent), so per-book figures overstate the cost of each book alone. The batch total is given at the end.

## Integration requirements (separate, assigned step)

- Replace `app/public/data/editions/{book}-modern-da.json` with the package edition after Anders decides to ship Danish; check that the reader still offers Danish for these books and that edition switching keeps position (paragraph identities are unchanged from modern-en).
- Any cached Danish narration for these books is stale for every paragraph.
- Danish onboarding/threads were not part of this assignment.
