# Handoff: Danish modern-da, run B (21 Oct 2026)

## Assignment

- Anders reopened Danish for this run on 21 Oct 2026 ("would help a lot on my first groups of users"). STRATEGY.md (Language scope, 2026-09-21) still says Danish is out of scope and has not been updated; this package is the record of the assignment. Integration needs that policy update or an explicit go from Anders.
- Scope: content only. New `modern-da` editions for wuthering-heights, sense-and-sensibility, alice-in-wonderland, translated from the current `modern-en` on origin/main, paragraph for paragraph.
- Branch `claude/danish-1021-b`, sparse worktree. Owned path: `books/wip/danish-2026-10-21-b/` only. No app code, live edition files, registry, merge or deploy.
- Instructions followed: books/BOOK-TASK-WORKFLOW.md (approved 2026-09-24), books/README.md, STRATEGY.md, AGENTS.md, books/AGENTS.md, books/CLAUDE.md, docs/workflow-boundaries.md, as of origin/main `e8b2703325`.
- Zero Anthropic API spend: all Danish written in-conversation. `generate-editions.cjs` not run.

## Deviation: no independent review subagent

The brief asked for parallel translation subagents and an independent EN/DA review subagent per chapter. This agent had no subagent tool, and I did not start separate cloud sessions without explicit authorisation. Translation was done serially by one agent, and the second pass was a self-review (automated pair checks, then side-by-side reading of every flagged pair, then a read of the Danish, puns and verse). Each review log says so. **An independent read is still open** and should happen before publication.

## Status per book

| Book | Source blob (modern-en, origin/main) | Candidate | Gates | Review | Status |
|---|---|---|---|---|---|
| alice-in-wonderland | `f318e93ff68189301a3d245b256892778c96047d` | `alice-in-wonderland-modern-da.json` | all pass (see gates file) | self-review done | content ready, independent review open |

Files per book: `{book}-modern-da.json` (live shape: `chapters[{number,title,paragraphs}]`, `sections`), `{book}-SOURCE-HASH.txt`, `{book}-gates.md`, `{book}-review-log.md`.

Source files verified unchanged between `e8b2703325` and origin/main `a99529b95c` (21 Oct 2026, 13:06 UTC).

## Throughput

| Book | EN words | Translation (wall clock, UTC) | Review and gates | Words per hour (translation) | Words per hour (incl. review) |
|---|---|---|---|---|---|
| alice-in-wonderland | 23,566 | 12:39–13:04 (25 min) | 13:04–13:10 | ~56,000 | ~45,000 |

## Integration requirements (separate, assigned step)

- Policy: STRATEGY.md language scope must be updated, or Anders must confirm, before any Danish edition is registered.
- Copy each accepted `{book}-modern-da.json` to `app/public/data/editions/`, register the edition, and record the source blob so a later modern-en change marks the Danish stale.
- Alignment is 1:1 with modern-en (same chapters, numbering and paragraph counts), so edition switching keeps position.
- `books/danish-lint.py` hardcodes a Mac `EDITIONS_DIR`; it was run here through an import wrapper. Fixing the path is a tooling change for the integration step. Its STRAY-UNDERSCORE check flags intended `_emphasis_` (also in live editions).
- Danish narration and onboarding are not part of this package.
