# Jane Eyre modern-en: targeted clarity review of 11 source-identical paragraphs

**Date:** 2026-09-24 · **Branch:** `claude/admiring-ritchie-0esb31`, based on `main` `1bd1bfb3`
**Scope:** content review only. No live edition, application file, character card, audio or other package was modified. The accepted cleanup package (`books/wip/featured-source-cleanup/` at `7994156f`) is referenced by commit and is not copied or changed. Its structural corrections stand.

**Result: 10 KEEP, 1 CHANGE.** One narrow patch: `JE-TC-1`, pre-cleanup coordinate 34.140, corrected coordinate 34.139.

## Inputs (pinned, hash-checked)

| Role | Commit | Path | sha256 |
|---|---|---|---|
| Corrected candidate (review target) | `7994156f` (`claude/admiring-brahmagupta-rb9sws`) | `books/wip/featured-source-cleanup/jane-eyre/jane-eyre-modern-en.json` | `bfd5ace3b7803b4d31773148fdaf244ab6da0fd91db329a6077ae88d351a9749` |
| Corrected original-en (fidelity anchor) | `7994156f` | `…/jane-eyre/jane-eyre-original-en.json` | `d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257` |
| Pre-cleanup accepted modern-en (flag coordinates) | `d47d80f8` (`claude/laughing-hypatia-svxsjf`) | `books/wip/green-jane-eyre/candidate.json` | `5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7` |
| Pre-cleanup source | `d47d80f8` | `books/wip/green-jane-eyre/source.json` | `055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96` |

**Coordinate mapping.** Coordinates use `paragraph-map.tsv`: 1-based chapter, 0-based paragraph.
- Chapters 3 and 24 are not in the map, so they map by identity.
- In chapter 34, the caption at 34.114 was deleted. Flags at or below 113 keep their index, and flags above 114 move down by one.

All 11 paragraphs are byte-identical before and after cleanup, and byte-identical to the source.

## Rulings

Full records are in `RULINGS.json`. The baseline hash is the sha256 of the paragraph text, identical in both bases.

| Flag (accepted) | Corrected | Baseline paragraph sha256 | Ruling | Reason |
|---|---|---|---|---|
| 3.26 | 3.26 | `1f1bb22b53d49dbb…` | KEEP | Stanza of Bessie's ballad. Quoted song verses are carried verbatim throughout. Paraphrased correctly. |
| 24.160 | 24.160 | `ad8af4d4215df2cc…` | KEEP | Verse of Rochester's song. The whole song (24.156–24.167) is verbatim apart from quote marks. Clear. |
| 24.163 | 24.163 | `1af35f1bc4cba4d8…` | KEEP | Verse of the same song. Clear. |
| 24.165 | 24.165 | `47237165e4866f19…` | KEEP | Flagged as a risk ("Right, bar approach to me"), but all 3 readers identified Hate, Right and Might correctly. Not demonstrated. |
| 34.86 | 34.86 | `2cfaf2383b2ef204…` | KEEP | "genius of the haunt" was flagged as a risk, but all 3 readers understood it as the spirit of the place. The literary image is kept. |
| 34.93 | 34.93 | `a3f2094c4a779a9b…` | KEEP | Clear. |
| 34.100 | 34.100 | `f9e582b6a6ea2a99…` | KEEP | "helpmeet": St. John's register. It is glossed by "a missionary's wife" at 34.104 and echoed at 34.124. |
| 34.113 | 34.113 | `96701e1642075cc3…` | KEEP | Clear ("swell of heath", later called "the knoll"). |
| 34.138 | 34.137 | `ceb8a4f27e593545…` | KEEP | Clear. |
| **34.140** | **34.139** | `a71bc4bf96a2429b…` | **CHANGE** | "Very well" is read today as assent. Two of three blind readers misread it. |
| 34.144 | 34.143 | `ea6da5f6fc0418fc…` | KEEP | Clear and forceful. |

## The patch: `JE-TC-1`

Details are in `PATCH.json`.

- **Old:** `“Very well,” I said shortly; “under the circumstances, quite as well as if I were either your real sister, or a man and a clergyman like yourself.”`
- **New:** `“We can be together very well,” I said shortly; “under the circumstances, quite as well as if I were either your real sister, or a man and a clergyman like yourself.”`
- **Paragraph sha256:** old `a71bc4bf96a2429babad24cfd99d8cfda2c8ded242df4622bd0bb5df3838d663` → new `ddde74e736378dc212e76a6d20adbac6ca71746f019a6e261d003fed0442d179`.
- **Edit:** at UTF-16 offset 1, `Very` becomes `We can be together very`, a shift of +19 UTF-16 units. Nothing after it changes.

**Reason.** Jane is answering St. John's "How can we be forever together … and unwed?" Her "Very well" means "we can be together very well", and the following "quite as well as if…" depends on that reading. A present-day reader hears a bare "Very well" as a grudging "OK, fine", which reverses her stance at the climax of the proposal scene.

**Evidence.** Two readers who were not told a problem was suspected misread the line. One took it as a concession on the missionary work, the other as "almost like agreement". A third noted the misleading first reading. A fresh reader of the corrected text read it correctly.

**Why this wording.**
- The change supplies only the elided predicate, using the wording of St. John's own question.
- Brontë's "very well" and the "quite as well as" comparison are kept.
- Jane still speaks "shortly", and her assertion stays a firm "can".
- The source's rise to "perfectly well" at the next Jane line (34.141) is preserved.

The rejected drafts were "Perfectly well" (it uses up Jane's 34.141 phrase) and "We could be together very well" (the hypothetical softens her).

**Resulting files** (reproduce with `scripts/apply.py`, check with `scripts/verify.py`):

| Base | Coordinate | Base sha256 | Patched sha256 |
|---|---|---|---|
| Corrected (`bfd5ace3…`; primary) | 34.139 | `bfd5ace3b7803b4d31773148fdaf244ab6da0fd91db329a6077ae88d351a9749` | `0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6` |
| Accepted (`5e270560…`; only if published without cleanup) | 34.140 | `5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7` | `dbf47f1399830208fd1b3e25457ff7f573b1ea1c3b0c47c37924ebbb679b7d61` |

Both apply cleanly. Exactly one paragraph differs. Chapters, titles and paragraph counts are unchanged and still aligned with original-en. The similarity gate (`books/classify-modern-en.py jane-eyre --gate`, run in a scratch tree) passes before and after: REAL 37, LIGHT 1.

## Character-reference impact

Two cards were checked:
- the live card on `main` (`2149c234…`, contentVersion `2026-09-12.1`, pinned to live `bbfe4c30…`)
- the prepared card on `codex/jane-reviewed-release-20260924` (`b3449a6d…`, `2026-09-24.1`, pinned to `5e270560…`)

- **JE-TC-1.** Neither card has a mention or anchor in this paragraph, in either edition. No mention, anchor or offset moves. The new words add no character name.
- **Required with the patch:** recompute the modern-en `paragraphHashes` entry for this paragraph to the new paragraph hash. That entry is chapter `34`, index 140 on today's card layout, or index 139 after the structural re-anchor. Then set the card's modern-en `sourceSha256` to the patched edition hash.
- **KEEP rulings.** No text changes, so there is no impact. Card mentions inside kept paragraphs (St. John at 34.86 @15 and at 34.144 @174) are unaffected by this review. The cleanup package's own map still applies to them: 34.144 moves to 34.143.

Paragraph-indexed user data needs no migration, because the paragraph count and index are unchanged. An annotation offset of 1 or more in this one paragraph would shift by +19.

## Reconciliation: newer versions (checked 2026-09-24)

- `main` (`1bd1bfb3`) still serves the pre-repair modern-en `bbfe4c30…` and original-en `055aad5e…`. Nothing newer is published.
- [PR #160](https://github.com/anderskhv/tinct/pull/160) (`codex/jane-reviewed-release-20260924`, "Hold Jane Eyre release for accepted structural successor") carries the accepted `5e270560…` unchanged. At this paragraph it has the same text as both bases.
- `codex/edition-structure-migration-20260924` (`76568511`) stages the structure map with modern-en `bbfe4c30… → bfd5ace3…`. That is the same corrected candidate reviewed here.
- No other remote branch or open PR has a newer Jane Eyre modern-en. `bfd5ace3…` is the latest accepted target.
- If a newer candidate appears, `apply.py` asserts the base hash and the exact old paragraph text and fails loudly on drift.

## Integration notes for Codex (not done here)

- Apply `JE-TC-1` in the same release as the structural successor: corrected base, 34.139, patched `0488dac5…`. It supersedes `bfd5ace3…` as the modern-en publication hash.
- If PR #160 ships first on the accepted base, use the `accepted` row instead. The paragraph is the same, and the cleanup map carries it from 34.140 to 34.139.
- Update the card's `paragraphHashes` and `sourceSha256` as above.
- Narration for this paragraph becomes stale under exact-text cache identity. Do not generate audio.

## Review trail (`reviews/`)

Every reviewer was a fresh agent and received only its packet.

| # | Review | Input | Outcome |
|---|---|---|---|
| 01 | Blind readability probe of all 11 targets | Corrected candidate excerpts only; no source; not told they were source-identical | 8 CLEAR. Flagged D (24.165), E (34.86) and J (34.139); D and E were paraphrased correctly |
| 02 | Paraphrase-only test (Sonnet and Haiku readers) | D, E and J in context; no hint of a problem | D and E understood by both. J misread by both, so the obstacle is demonstrated |
| 03 | Independent source-fidelity review | Source and modern text for 34.133–34.142, plus the drafts | Source reading confirmed. P1 and P2 found defective. P3 ("We can be together very well") recommended |
| 04 | Blind tests of P1 and P2 | Corrected text only | P1 inconclusive (reader addressed 34.137). P2 understood |
| 05 | Blind readability test of P3 | Corrected text only | Understood correctly: Jane disagrees and says they can be together unmarried |
| 06 | Independent recheck of P3 | Source, old and new text, neighbours | **VERIFIED**: meaning, flow into 34.140–34.141, typography |

Earlier coverage: in the accepted package, R1 fidelity, R2 fidelity and the R2 candidate-only accessibility review read all 11 paragraphs and flagged none.

Readers noted three other paragraphs outside this brief: 34.133 "one of which we may neither think nor talk lightly", 34.134 "warrior-march" and 34.138 "take out with me … unless she be married" (all corrected coordinates). None is a flagged paragraph, and none was acted on.

## Contents

| Path | What |
|---|---|
| `PATCH.json` | The single change: old and new text, paragraph hashes, coordinates for both bases, edit offset, reason, character impact, base and patched file hashes |
| `RULINGS.json` | All 11 rulings with both coordinates, baseline paragraph hashes, reasons, and card mentions in each paragraph |
| `scripts/apply.py` | Applies the patch to a pinned base using `git show` and a hash-checked byte-level replacement |
| `scripts/verify.py` | Independent checks: hash, structure and alignment, only one paragraph differs, and the edit is exactly as recorded |
| `reviews/` | Reviewer packets and reports |

Reproduce from the repo root:
```
python3 books/wip/jane-eyre-targeted-clarity-review/scripts/apply.py --out /tmp/je.json
python3 books/wip/jane-eyre-targeted-clarity-review/scripts/verify.py /tmp/je.json corrected
```
