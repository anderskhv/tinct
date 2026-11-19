# Modern English repair releases, 2026-10-21

Integration of accepted modern-en repair packages (6 Oct batch, commit `bee1059ff5`, and the 5 Oct branches) into the
served app data. Assigned by Anders on 2026-10-21. Each release is its own PR; nothing here is merged or deployed by
the integrating agent.

Method, per book (same tooling as `release-candidate-5`):

1. Package restored into `books/wip/<book>-modern-en/`; `candidate.json` hash equals the release packet; the package
   baseline equals the live file on `origin/main` byte for byte; chapters, titles, metadata and per-chapter paragraph
   counts equal live (1:1, so no reader place can be lost); the character file's pinned modern-en hash equals live.
2. `app/scripts/prepare-modern-en-repairs.py [--mappings approved-mention-mappings.json] <staged> text-2026-10-21.<n> <before> <books>`:
   candidate replaces the live edition byte for byte, character package re-anchored by exact projection (reveal points,
   snapshots and evidence offsets projected too), `characterReleases` revision bumped in `characterCards.ts`.
3. Re-anchored mentions compared one by one with the package's `character-card-impact.json` proposals; every
   difference or dropped mention gets a ruling, recorded below and in the book's `ACCEPTANCE-RECORD.md`.
4. `app/scripts/build-text-change-migration.py <book> modern-en <before> text-2026-10-21.<n>` writes the coordinate maps
   (`app/public/data/edition-migrations/<book>.{positions,highlights}.json`), and the release is added to
   `CONTENT_RELEASES` in `app/src/data/editionContentRevisions.ts` (before/after hashes), so saved places and
   highlights written against the old wording are carried word-accurately into the changed paragraphs.
5. Chapter shards rebuilt with `app/scripts/split-edition-chapters.cjs` where the edition is sharded.
6. Narration: Grok narration is content-addressed by each paragraph's text hash (`narrationCore.ts`, Worker
   `mapEntryMatches`), so a changed paragraph can never match its old recording or map entry and is re-prepared on the
   next Play; unchanged paragraphs keep theirs. No generation was run. Legacy Kokoro modern-en recordings are not
   selected under the Grok provider. `edition_patches` (public read) is empty for every book in scope (checked
   2026-10-21), so no stored reader correction overrides the new text.
7. Checks: `books/classify-modern-en.py <book> --gate` on the integrated file; paragraph alignment with original-en and
   a changed-paragraph scan (empty, under 20 characters, under 75% of source words, each flagged one read);
   `npm test`; `CI=1 npm run build`; `npm run verify-bundle`; Playwright visual QA of changed chapters in the built
   reader (`/reader?book=&chapter=&paragraph=&edition=modern-en&layout=phone|desktop`, WebKit 390x844 and Chromium
   1440x950, isolated, API mocked, muted), first/middle/last changed paragraph of every changed chapter, screenshots
   spot-read; moved character mentions clicked in both layouts.

modern-da stays as it is (Danish is out of scope); it is not presented as tracking the new English.

## Release 1 (PR 1): Much Ado, Romeo and Juliet, The Republic, Phaedrus

Revision `text-2026-10-21.1`.

| Book | Changed paragraphs | Gate (similarity / identical long) | Card mentions before -> after | Card rulings |
|---|---|---|---|---|
| much-ado-about-nothing | 97 (ch 15-17) | PASS 0.681 / 0.7% | 1647 -> 1647 | none needed: all 50 moves equal the package proposals |
| romeo-and-juliet | 1 (16:4) | PASS 0.446 / 0.2% | 1626 -> 1626 | none |
| the-republic | 218 | PASS 0.628 / 0.0% | 193 -> 193 | none needed: the 1 move equals the proposal |
| phaedrus | 41 (ch 6) | PASS 0.708 / 1.6% | 657 -> 657 | none needed: all 22 moves equal the proposals |

Changed-paragraph scan: Republic 4:159, 5:129, 5:429, 9:294 are under 75% of the source word count; each was read
against the source and is natural compression with nothing dropped. Republic 9:213 is short by nature
("Assuredly." -> "Certainly.").

Visual QA: 37 targets x 2 layouts, 73/74 found the changed paragraph on the opened page; the one miss (Much Ado 15:19,
phone) opens on the right page with the paragraph's speaker label as the last line and its text on the next page.
Character cards opened in both layouts for Margaret (Much Ado 15:1), Theuth and Thamus (Phaedrus 6:2) and the den
(Republic 7:34), with the reading place unchanged. Results: `pr1-visual-qa.json`; integration report:
`pr1-integration-report.json`.

Pre-existing reader issue seen during QA (not caused by these texts; the old wording shows it too): a word that opens
with a straight single quote loses the space before it (`for'lady'`, `call'my own'`).

### Held from release 1: Jekyll and Hyde

The package verifies (candidate hash, baseline = live, 1:1 structure, card pin) and integrates cleanly with two card
rulings (below), but the 2026-09-24 followups release pins the current Jekyll text: `.github/workflows/verify-followups.yml`
runs `verify-reviewed-release.py --config books/wip/reviewed-followups-20260924.json` (asserts the live file is the
2026-09-24 accepted hash `7bcc0ee8...`) and `check-jekyll-narrow-similarity.py` (same pin), on every PR that touches the
Jekyll edition or card and after each deploy. Shipping the repair fails those checks unless the pin is retired or moved
to the new accepted hash, which is a change to a release check and needs Anders's decision.

Card rulings prepared for Jekyll (in `approved-mention-mappings.json`):
- girl-doctor, 1:7: the old "according to the doctor" is now "according to the Sawbones"; "Sawbones" is a reviewed
  spelling for this figure, so the mention maps to it (old occurrence 1 of "doctor" -> occurrence 0 of "Sawbones").
- locksmith, 9:9: the package proposed offset 927 (a third, new "locksmith" that replaces "this last"); the exact
  projection keeps 887 ("the locksmith was close to despair"), which is the sentence the old mention marked. Ruling:
  887, not the proposal.
