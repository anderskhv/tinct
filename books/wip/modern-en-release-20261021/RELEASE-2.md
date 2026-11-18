# Modern English repair release text-2026-10-21.2: Jekyll and Hyde

Assigned by Anders on 2026-10-21. The package is the accepted 6 Oct repair (`bee1059ff5`, branch
`claude/inspiring-ritchie-zi00fu`), restored into `books/wip/jekyll-and-hyde-modern-en/` by `0026402e1b` (pushed on
`claude/modern-en-integrate-1b`, which also adds `source.json` and `accepted-paragraph-hashes.tsv`). The method is the same as
release 1 (`RELEASE.md` on `claude/modern-en-integrate-1`, which also covers narration and `edition_patches`). This release
replaces the "Held from release 1: Jekyll and Hyde" note there.

## Approval to move the release pin

Release 1 held Jekyll because the 2026-09-24 followups release pinned its current text (`verify-followups.yml`). Moving
that pin is a change to a release check, so it went to Anders. Asked on 2026-10-21, "Jekyll stays on the current text,
or move the pin so the repaired text ships?", Anders answered:

> why not? is the new not better?

It is better on every measure the gate takes (below), so the pin moves to the accepted repair. The check is moved, not
retired, and is no weaker. Details are under "Release verification".

## Verification against live main (`5f4da80b25`)

| | sha256 | |
|---|---|---|
| Candidate (= packet = `bee1059ff5` = `0026402e1b`) | `640dc4ea5d7d56f4…` | served as `jekyll-and-hyde-modern-en.json` |
| Live pre-image (= packet = package baseline) | `7bcc0ee81b68635f…` | the 2026-09-24 accepted text |
| original-en (= package `source.json`) | `dc134b812fa478e4…` | unchanged |

Structure is 1:1 with live (10 chapters, 339 paragraphs, same titles and metadata). The card file's pinned modern-en
hash equalled live.

## Results

| Changed paragraphs | Gate (similarity / light / identical long) | 24 Sep text | Card mentions before -> after |
|---|---|---|---|
| 236 (ch 1, 2, 5, 7, 8, 9) | **PASS** 0.701 / 0.0% / 0.4% | FAIL 0.755 / 0.0% / 3.5% | 504 -> 504, none dropped |

The integration in `216a3b5e65` was reproduced from `origin/main` with the same tools and the same inputs, and every output was byte-identical:
`prepare-modern-en-repairs.py --mappings release-2-mention-mappings.json` (edition, card file, `characterCards.ts`
revision) and `build-text-change-migration.py` (positions and highlights maps). `CONTENT_RELEASES` carries the
before/after hashes. The edition is not sharded. The changed-paragraph scan found nothing: no paragraphs that are empty,
under 20 characters or under 75% of the source word count. Integration report: `release-2-integration-report.json`.

## Card rulings

Of 232 moved mentions, 228 equal the package proposals. The other 4 were each read in context. In each one, the exact
projection keeps the sentence the old mention marked:

- **girl-doctor 1:7 (old 1475):** "according to the doctor" is now "according to the Sawbones". "Sawbones" is a reviewed
  spelling for this figure, so the mention maps to it (`release-2-mention-mappings.json`, occurrence 1 of "doctor" ->
  occurrence 0 of "Sawbones"; now 1516).
- **girl-doctor 1:7 (old 1972):** "I saw that doctor turn sick" is now "I saw that Sawbones turn sick", so the mention is
  now at 1995. The package proposed 1743, an earlier "doctor" in another sentence.
- **jekyll 2:49 (old 1279):** "Harry's bedside" is now at 1260. The package proposed 1282, which is the next mention ("Poor
  Harry", old 1301 -> 1282).
- **locksmith 9:9:** the package proposed 927, a new third "locksmith" that replaces "this last". The projection keeps
  887 ("the locksmith was close to despair"). Ruling: 887.

Reveal points, snapshots and evidence offsets were projected by the tool. Character prose is unchanged.

## Release verification (moved from the 24 Sep package)

`verify-followups.yml` still verifies Jekyll on every PR that touches its edition, card, package or checks, and after
each deploy. Prince and Julius Caesar keep their 24 Sep checks unchanged.

| Check | Before (24 Sep) | Now (21 Oct) |
|---|---|---|
| `verify-reviewed-release.py` | `reviewed-followups-20260924.json`, baseline `b91d4b8d`: live = `7bcc0ee8`, before = `f2cf24e9` | `release-2-jekyll-and-hyde.json`, baseline `5f4da80b`: live = `640dc4ea`, before = `7bcc0ee8`; candidate, baseline and source byte-equal to the package at `0026402e1b` (sourceRef); all 339 paragraph hashes; changed-paragraph evidence (now `changed-paragraphs.json`: both hashes, counts and the exact 236 coordinates); card hash, paragraph hashes, every mention slice, prose unchanged; plus new: mention count 504 = before, and the 4 rulings above (locksmith 927 asserted absent) |
| 24 Sep Jekyll entry | verified | kept as the record, marked `supersededBy` the 21 Oct config; the script requires that config to hold Jekyll with `before` equal to the 24 Sep accepted hash, then reports it superseded |
| `classify-modern-en.py jekyll-and-hyde` | without `--gate` (the narrow fix could not pass it) | **`--gate`** |
| `check-jekyll-narrow-similarity.py` | no regression `f2cf24e9` -> `7bcc0ee8`; light and identical rates <= 5% | no regression `7bcc0ee8` -> `640dc4ea`; same limits, plus whole-book similarity <= 0.75 |
| `check-reviewed-characters.cjs` (built reader, then production) | Hyde, Lanyon, Poole at 10:23 (unchanged chapter) | same, plus the Sawbones 1:7 and locksmith 9:9 rulings clicked at the ruled occurrence |

`sourceRef` is `0026402e1b` on `claude/modern-en-integrate-1b`, the same pattern as 24 Sep (`c6f3f0ed`, an unmerged
review branch): keep that branch. The baseline `5f4da80b` is on main.

## Checks run

- `verify-reviewed-release.py` for both configs (Prince, Caesar verified; Jekyll superseded -> verified by the 21 Oct
  config with 4 rulings) and for Meditations (same script, unchanged result). Mutation checks: a wrong ruling offset,
  a mention at 927, a wrong mention count, a wrong changed count or a wrong before hash each fail.
- `classify-modern-en.py --gate` for the-prince, julius-caesar and jekyll-and-hyde: PASS. `check-jekyll-narrow-similarity.py`:
  pass. `test-prepare-reviewed-editions.py` and `test-classify-modern-en.py`: OK.
- `npm test`: 6710 passed, 2 failed, both 5 s timeouts in `LabAccountPrompt.test.tsx` under full-suite load; that file
  passes 14/14 on its own. `CI=1 npm run build` and `npm run verify-bundle`: pass.
- `check-reviewed-characters.cjs` for jekyll-and-hyde on the local build (`READER_BUILT=1`): 20/20 scenarios (5 cases,
  both editions, WebKit phone and Chromium desktop). Each card opened with the place unchanged.
- Visual QA on the built reader (Chromium, 390x844 and 1440x950, isolated, API mocked, muted): first, middle and last
  changed paragraph of each changed chapter. 36/36 views showed the changed paragraph on the page that opened.
  Screenshots spot-read. Results: `release-2-visual-qa.json`.

## Open issues

- **9:1 "10_th December_, 18—."** The accepted text keeps the source's underscore italics (STYLE-NOTE: keep `_dines_`,
  `10_th December_`). Whole-word italics such as `_dines_` and `_by the way_` render as italics. The mid-word markers in
  9:1 show as literal underscores, where the 24 Sep modern-en had "10th December". original-en shows the same today. This
  needs a one-paragraph content follow-up or a reader fix for mid-word emphasis. The accepted hash was not edited.
- Carried from the acceptance record: silent source corrections by renderers, and per-batch gating not run. modern-da
  no longer tracks modern-en (Danish is out of scope).
