# Book-task workflow

**Approved by Anders: 2026-09-24.** This is the mandatory entry point for a Claude book-content assignment, from any working directory.

## Activate from the request

“Add [book]”, “prepare [book]”, book translation/modernization/repair, and equivalent content requests enter this workflow automatically. Anders does not need to repeat these instructions in the prompt.

Before writing, read the current versions of:

1. `books/README.md` — adding-book strategy, edition sourcing and reader defaults.
2. `STRATEGY.md` — language scope and edition selection.
3. `AGENTS.md`, `books/AGENTS.md` and `books/CLAUDE.md` — applicable content rules.
4. `docs/workflow-boundaries.md` — ownership and handoff.

Use current remote main instructions or a newer explicitly assigned policy revision. Fetch/read those instructions without merging another agent's unfinished work or replacing your candidate. Record the instruction revision and owned paths in the handoff. If instructions cannot be accessed, report that exact dependency rather than guessing an older workflow.

## Content-only ownership

Claude owns research, source acquisition, edition text, onboarding, character content, editorial QA and the release package. Codex owns parsers/tool changes, application integration, registry edits, generated runtime data, builds and publication.

Work on an isolated branch/checkout. Confirm active assignments and choose one owned staging folder under `books/wip/{assignment}/` (or an already assigned `books/staged-replacements/` folder). Put sources, edition candidates, proposed metadata/taxonomy, onboarding, character material, hashes, review records and integration notes there. Do not write another stream's folder or shared trackers.

During this task:
- Do not create or modify application code, scripts, tests, configuration, dependencies, CI, Worker code or shared pipeline tooling, including code placed inside a content folder.
- Do not edit `app/**`, the live edition/onboarding paths, the registry, production character files or shared repository policy.
- You may run existing read-only parsing/validation tools with outputs confined to your owned staging folder. If a tool needs code changes or writes to protected paths, document the needed change for Codex and continue independent content work.
- Do not merge to main, deploy, publish assets, start narration generation or change production settings. Commit and push your owned content package only. “Push” here means pushing the content branch, never deploying.
- Never stash, reset, clean, overwrite or cherry-pick another agent's work to unblock yourself.
- An unrelated application failure is an integration note, not permission to fix code.

These restrictions override broader path lists, auto-documentation rules, “push means deploy” language and general finish-to-publish instructions for this content assignment.

## Completion and handoff

Complete the authorized content work and independent reviews. Supply source provenance, pinned baselines, accepted candidate hashes, changed paragraph lists, character identity decisions and structural mappings where relevant. Record remaining issues honestly.

Before committing, inspect the diff: every changed file must be a content artifact in the owned staging folder, with no code or shared/runtime files. If unexpected changes exist, preserve them and exclude them from your commit; do not revert someone else's work.

Push the package and give Codex the branch, exact commit, package path, acceptance status and integration requirements. “Content accepted / handed off” and “published” are distinct statuses. Codex performs integration, required app verification and serialized release.

## Explicit coding assignments remain possible

This is not a global ban on Claude coding. If Anders explicitly assigns Claude a coding or release task, follow the normal code/release rules and coordinate with the current deployment owner. Treat that as a separately scoped task/branch. Do not silently turn a book assignment into a coding task to achieve publication.
