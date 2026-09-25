# Character-card impact: modern-en v2

`othello-characters-modern-en.v2.proposed.json` is the proposed replacement for `editions["modern-en"]` in `app/public/data/characters/othello.v1.json`. It **supersedes** the base package's `othello-characters-modern-en.proposed.json` (`770c3fc3…`), which is keyed to v1 (`012ede1e…`). Codex must not ship that one with v2.

| | Base proposal (v1) | This proposal (v2) |
|---|---|---|
| `sourceSha256` | `012ede1e…` | `ed1e3ebbdbcb7f17cf637f1d04e678f0cccb6ff4ab9916131aaf837a4b7cb3d1` |
| Characters | 55 | 55 |
| Mentions | 1,830 | 1,829 |

## Changes from v1 to v2

- v2 changes **132 paragraphs** of v1 (`CHANGED-PARAGRAPHS.json`, `vsV1`).
- The **246 mentions** in those paragraphs were re-anchored by ordinal text match.
- **One mention was dropped:** `god` at 9.146. Iago's "God be with you" is rendered "Goodbye" in v2 (edit E97, source B2, RC2 accept), so the text no longer names God there.
- **Anchor points:** 34 first-mention, role-visible or snapshot positions changed offset within the same paragraph, following their mention. None changed paragraph.
- Every other mention and point is carried unchanged from the base proposal. The base proposal's own record of the change from the live card is in `books/wip/othello-modern-en/CHARACTER-CARD-IMPACT.md` on branch `claude/cool-galileo-tyen9m`. It covers 1,833 live mentions: 3 dropped and 21 editorially re-anchored.

## Validation

The block was checked with a re-implementation of the reader's `verifyCharacters` rules against the v2 file bytes. There are **no errors**:

- the source hash matches;
- all 1,391 paragraph hashes match;
- every mention's `text` equals its UTF-16 slice;
- every anchor point is in range;
- no snapshot comes before its `firstMention`.

## Release requirements

- Ship this block **in the same release** as `othello-modern-en.v2.candidate.json`, and bump `characterReleases.othello.revision`.
- If Part A or Part B of `structure/PROPOSAL.md` is adopted, use the re-projected blocks recorded in those proposal files, recomputed on the final combined text. Both parts were verified with no mention dropped.
- The `original-en` block is unchanged unless Part A or Part B is adopted.
- `othello-threads.json` holds chapter-level summaries with no offsets, so it is unaffected.
