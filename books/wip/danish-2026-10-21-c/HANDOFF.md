# Handoff — Danish translation run danish-2026-10-21-c

## Assignment
Anders reopened Danish on 21 Oct 2026 ("would help a lot on my first groups of users"). **STRATEGY.md has not been updated.** It still says Danish is optional, not a launch requirement, so whoever integrates should update it or log the decision in DECISIONS.md.

This run was content only:
- Followed books/BOOK-TASK-WORKFLOW.md at instruction revision origin/main e8b2703325.
- Zero Anthropic API spend: all translation was done in the conversation.
- generate-editions.cjs was not run.
- No app/**, live edition or registry files were touched.
- No merge, no deploy.

## Branch and owned paths
- Branch: `claude/danish-1021-c`, from origin/main e8b2703325, pushed after every few chapters.
- Worktree: /home/user/wt-da-c (sparse).
- Owned path: `books/wip/danish-2026-10-21-c/` only.
- Commits are all "content: Danish … (danish-2026-10-21-c)".

## Deliverables
Each book has an edition JSON, a per-book folder of `chapters/NNN.txt` (source of truth), `meta.json`, `SOURCE-HASH.txt`, `GATES.txt` and `REVIEW-LOG.md`, plus a GLOSSARY.md where one exists.

| Book | Edition JSON | EN source blob (origin/main e8b2703325) | Chapters | Paragraphs | DA words | Ratio range | danish-lint |
|---|---|---|---|---|---|---|---|
| Notes from Underground | notes-from-underground-modern-da.json | 64f9f5dc65cd569eb6f3bcefd7291ef3482e5e0d | 21/21 | 1:1 | ~41,900 | 0.972–1.106 | 6 STRAY-UNDERSCORE false positives (italics copied from EN) |
| Crime and Punishment | crime-and-punishment-modern-da.json | 914f64f98e773404302b0fcd911303bdca8f92ff | 41/41 | 3,904 | ~200,500 | 0.992–1.062 | 39 STRAY-UNDERSCORE false positives (same pattern as the live DA file) |
| Moby-Dick | moby-dick-modern-da.json | be7c38ad6dc2ff0c4ff775b7bdd12099f8dea29a | 136/136 | 2,432 | ~208,100 | 0.937–1.101 | 0 |

All three books pass the gates: 1:1 paragraph alignment, zero paragraphs left in English, and every chapter inside the 0.85–1.25 ratio.

The three EN source blobs are unchanged at origin/main cc159cabd2 (21 Oct, 18:00Z). The last change to them was a8faf45112.

## Throughput
- The run took 12:35Z to 18:05Z, about 5.5 h, for about 442,000 EN source words. That is about 80,000 EN words per hour, or about 81,000 DA words per hour.
- Moby-Dick alone: 212,000 EN words in about 2 h 45 min, about 77,000 per hour.

This speed makes single-pass drafting errors likely. Treat the output as a strong first draft.

## Status
**These are content candidates. They are not accepted or published.**
- **The independent subagent review is outstanding for all three books.** No Agent tool was available in this session, so the second pass was self-review plus the automated gates (method in each REVIEW-LOG.md).
- Visual page-by-page QA in the reader has not been done. It is required before shipping.
- The open reviewer flags are listed in each REVIEW-LOG.md. They include:
  - C&P du/De switch points
  - the metric-unit policy in Moby-Dick
  - the »Fryd« gloss in Moby-Dick ch131
  - the lowering-term variation in Moby-Dick
  - source-faithful passages kept unsoftened in C&P part 6

## Integration notes
Integration is a separate assigned step.
- Copy each `<book>-modern-da.json` over the live `app/public/data/editions/<book>-modern-da.json`. The shape matches modern-en: `chapters[]` with title and paragraphs. Moby-Dick and NFU have no sections; C&P has parts.
- Rerun the edition and registry checks and verify-bundle.
- Check the reading-position invariants, especially the EN↔DA switch keeping paragraph index. Paragraph indices are 1:1 with the current modern-en, so position maps directly.

## Incident: writes into wt-da-b
Early in the run, the shared-scratchpad symlinks pointed into /home/user/wt-da-b. This sent some batch-B writes into that worktree.
- **Fix:** the scratchpad tooling now writes only to /home/user/wt-da-c and a private lint directory.
- I reported this to the coordinator. The coordinator said it would handle any revert in wt-da-b, so I made no changes there.
- Since the fix, all writes have stayed inside `books/wip/danish-2026-10-21-c/`.
