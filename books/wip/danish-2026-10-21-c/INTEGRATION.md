# Integration: Danish run C (22 Oct 2026)

Branch `claude/danish-1022-intc`, from origin/main `0c0dd48677`. Policy: Danish is work in progress, with a library-wide rollout (Anders, 22 Oct 2026; STRATEGY.md, Language scope, PR "Danish: work in progress …"). House style: `books/DANISH-STYLE.md` (same PR).

## Published texts

| Book | Reviewed candidate (blob) | Published (blob) | modern-en source (blob, unchanged on main) |
|---|---|---|---|
| notes-from-underground | 781099ad89 | df377804c9 | 64f9f5dc65 |
| crime-and-punishment | d6b9d2a4f9 | 687ab2136a | 914f64f98e |
| moby-dick | 492ddebc28 | 39103348b2 | be7c38ad6d |

The published files equal the package JSONs byte for byte, and `chapters/*.txt` were regenerated to match. Full hashes are in `app/src/data/danishEditionSources/<book>.json`, which `danishEditionSources.test.ts` checks: a later modern-en change fails the test until the Danish is updated or marked stale.

## Integration fixes (`INTEGRATION-FIXES.json`)

- **Dash:** every en dash (–) is now the em dash (—), the house style of the offered Danish editions and run B. That is 195 in NFU, 2,513 in C&P and 2,268 in Moby-Dick, paragraphs only. One chapter title keeps its en dash: Moby-Dick 135, "Jagten – tredje dag".
- **C&P:** added the missing opening » in 7 paragraphs where modern-en opens a quotation: 4:1, 4:4, 4:49, 5:60, 14:114, 16:59 and 16:60.
- **Titles:** hr./fru/frøken was already house style, with lower case mid-sentence and no Mr./Mrs./Miss. "Madame" stays where the English keeps it.
- **Leagues:** every league in Moby-Dick is "mil". The live edition's "sømil" for leagues (41:12, 45:20, 54:8) is gone. Miles at sea stay "sømil" as the reviewer chose; miles are an open question in the style guide.

## Registration

- **Registry:** `modern-da` now has `hasAudio: false`, and the three identities are in `OFFERED_DANISH_EDITIONS` and `TEXT_ONLY_EDITIONS`.
- **Shards:** regenerated for the two sharded editions (C&P, Moby-Dick).
- **Acceptance scripts:** `check-edition-holds*.cjs` now read the offered list from `editionAvailability.ts` (`scripts/lib/offeredDanish.cjs`).

## Saved places and highlights

Chapter numbers and per-chapter paragraph counts are identical in the withdrawn live Danish text, the new text and modern-en. A saved place or highlight in `modern-da` therefore keeps its chapter and paragraph, and word indices land in the same paragraph of the new wording (it is a different translation, so not on the same word).

This is the same treatment as the 2026-10-19 Danish rewrites (#475), which shipped without a coordinate map. No `edition-migrations` map or `CONTENT_RELEASES` entry is added. Adding one would mean bumping the existing modern-en releases of Moby-Dick and NFU, and re-validating their English maps.

## Verification

- `npm test`: 530 files pass. One reader-paint timing test (`LabPassage.test.tsx`, unrelated) timed out under load and passes on rerun.
- `CI=1 npm run build` and `npm run verify-bundle` pass.
- `scripts/check-edition-holds.cjs` passes against the built dist on a local port. All 9 offered Danish editions open at 390 and 1440, the withdrawn ones stay held, and no Danish appears in the hub, sitemap or book pages. A first run hit an unrelated WebKit "Lock was stolen" page error on jungle-book; the rerun passed.
- Visual QA: see `VISUAL-QA.json`. Every page of the first and last chapter, plus 30 sample pages from 10 chapters, at both 390x844 and 1440x950. No issues. Danish hyphenation is active (`lang="da"`). A few pattern breaks look odd and come from the hyphenation library, not the text: fl|intesten, ub|arberede, gennembløde|nde, oms|pændt.
