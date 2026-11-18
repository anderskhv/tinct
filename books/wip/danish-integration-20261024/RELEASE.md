# Danish integration, 24 October 2026

Assigned source: `claude/inspiring-ritchie-zi00fu` at `959296ff926d6fb2b106455074c6227aa1d09600`. Reconciled with main `eb7cfdf49fcc382bfad3c438ed8ae76798fb26b9`.

## Scope and gates

Twelve Danish editions are prepared for publication. The six existing offered Danish editions remain available. No remaining translation work was started and no Anthropic API was called.

| Book | Result |
| --- | --- |
| pride-and-prejudice | blocked: saved-position compatibility (7 paragraph merges) |
| moby-dick | integrate |
| crime-and-punishment | integrate |
| jekyll-and-hyde | blocked: italics |
| great-expectations | blocked: existing Modern English edition gate fails |
| the-prince | integrate |
| confessions | integrate |
| adventures-of-huckleberry-finn | blocked: no live modern-en, book not published |
| adventures-of-sherlock-holmes | blocked: book not published |
| alice-in-wonderland | integrate |
| arabian-nights | already online, newer published package preserved |
| bacchae | integrate |
| beautiful-stories-from-shakespeare | blocked: no live modern-en, book not published |
| grimms-fairy-tales | already online, newer published package preserved |
| iliad-for-boys-and-girls | blocked: no live modern-en, book not published |
| lincoln-gettysburg-second-inaugural | blocked: no live modern-en, book not published |
| magna-carta | integrate |
| medea | integrate |
| meditations | integrate |
| merry-adventures-of-robin-hood | blocked: no live modern-en, book not published |
| middlemarch | integrate |
| odyssey-for-boys-and-girls | blocked: no live modern-en, book not published |
| sense-and-sensibility | blocked: italics |
| the-art-of-war | integrate |
| wonder-book-and-tanglewood-tales | blocked: no live modern-en, book not published |
| wuthering-heights | integrate |

## Recorded qualifications

- Pride and Prejudice: the preserved live Danish edition has 2,060 paragraphs; the candidate has 2,053. It needs a verified structural saved-position map before replacement.

- Every review was by AI helper agents. No native Danish speaker has read these editions. Reviewer replacements were not independently re-reviewed.
- The packages retain their documented terminology and du/De consistency limitations (including Danish forms of some Greek names in Meditations and the tragedies). This integration does not claim native editorial acceptance.
- Alice: the unchanged English classifier exits 1 only for its 31 preserved verse paragraphs. Its existing accepted verse exemption is documented in `books/wip/alice-in-wonderland/EDITORIAL-FIXES.md`. The English text is unchanged.
- Great Expectations: existing English similarity 0.776 and 5/59 light chapters fail the mandatory gate. No English or Danish runtime text changed for that book.
- Jekyll: 236 English paragraphs changed since the translation baseline, and eight italic-count mismatches remain. Its Danish package is preserved, not published.
- Sense and Sensibility: chapter 44, zero-based paragraph 35 is missing the emphasis corresponding to English `_she_`. No content was repaired in this lane.
- The eight unpublished books cannot pass the live-book integration gate. This release does not register or publish their English packages.
- Grimm and Arabian Nights: current main has later published review fixes. The ten merge conflicts were resolved in favour of those current packages, which equal their live copies. Their older source-branch versions remain in Git history.

## Runtime contract

- Exact reviewed Danish bytes, current-English hashes and source commit are pinned in `app/src/data/danishEditionSources.json`; tests reject subsequent source drift.
- Chapters, per-chapter paragraph counts, line breaks, emphasis-marker counts and numeric footnote markers match current Modern English. All Danish candidate hashes match a handoff manifest.
- Every new Danish edition is explicitly offered and text-only. English primary/default comparison behavior remains unchanged.
- Confessions no longer has a placeholder hold. The obsolete withdrawn-edition successors for Meditations and four rights-rebased Danish editions no longer redirect their new Danish files to English.
- No saved records are rewritten by publication. For rewritten translations, old word indices are approximate; quotation/note text is retained. Historical places predating the source replacement have no newly invented exact correspondence.
- Chapter shards match whole-edition bytes. The synchronous boot table groups common edition suffixes to remain below the existing 8 KB limit; tests exercise every registered identity.

## Verification

- `npm test`: 581 files passed, 1 skipped; 7,246 tests passed, 6 skipped.
- `CI=1 npm run build` and `npm run verify-bundle`: passed, local bundle `index-DsVE8d3M.js`.
- Existing Danish blacklist lint: no findings across the 12 editions.
- `check-edition-holds.cjs`: passed, including all 18 offered Danish editions on phone WebKit and desktop Chromium, plus held-edition recovery.
- Page QA is recorded by `app/scripts/check-danish-integration.cjs`: first/last chapters in full, three pages from up to ten deterministic interior chapters, word coverage and text bounds, Compare, reload, Danish language and no audio requests. Raw screenshots and result files are under `app/artifacts/danish-integration/`. Final results: 24 device cases, 1163 page screenshots, no missing rendered source words in fully traversed chapters and no overflow on the recorded pages; 24 independent painted-Compare/reload cases passed. See `VISUAL-QA.json` and `docs/assets/danish-integration-20261024/`. Confessions used Chromium for its full phone sweep after the known WebKit auth-lock teardown race; its independent short WebKit check passed.

Publication is not claimed by this preparation record. Release/production evidence belongs to the integration PR.

## Reader-ON release continuation

The ordinary push deployment of PR #611 (run 40104624385) stopped before any Worker change: `repair-pending` refuses normal releases. Production remained at accepted source `eb7cfdf49fcc382bfad3c438ed8ae76798fb26b9`, deployment run 40079005559, Worker `e6e885cd-7737-465f-8b9b-675ff37af3b9`, bundle `/assets/index-BrocP6vk.js`. All six acceptance groups passed without rollback. The release predecessor pin is advanced to this verified accepted version, keeping the gated reader-ON repair route, exact approved-source checks, compatible floor and rollback rules intact.

Supplemental QA uses the emitted reader-ON configuration: 24 phone/desktop painted Compare and reload cases, plus all 12 desktop continuous-reader cases. The latter sample scrolling through the first and last chapters and first/middle/last paragraphs in up to ten interior chapters. All pass edition identity, language, hold, text bounds, Compare, reload and no audio request checks. The earlier 1,163 page captures cover the two-page renderer; they are not represented as continuous-reader coverage. See `SHARED-READER-QA.json` and `docs/assets/danish-integration-20261024/shared-reader-on.jpg`.

The clean ON build and `verify-bundle` pass (`index-BC5TbS1J.js`). The expanded offline suite passes 7,258 tests in 582 files, with six tests and one file skipped. The one-time release continuation is separately pinned to its exact reviewed PR, frozen source/tree, accepted predecessor run, Worker and bundle, before the 24 October deadline. It keeps Actions authority to contents-read and actions-write, performs no checkout or provider calls, submits at most once, and requires all six live groups, all 120 speaker cases, the exact new bundle and no rollback. Publication is only accepted after those checks.
