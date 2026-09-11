# Progress ledger — 2026-09-11 test-reader content release

Resumable ledger for this task. If interrupted, resume from the first unchecked item.

Builds on `docs/modern-english-translation-audit-2026-09-11/` (the full 101-book audit),
branch `claude/upbeat-brown-cuttkn`. Snapshot commit for "current files":
`origin/main` at the time of this work; re-verified unchanged against the audited commit
`cdb6d8b9` for every edition file this release touches (see each deliverable for the
specific `git diff --stat` check run).

## Setup

- [x] Checked for the 7 "read first" docs named in the task. 5 of 7 do not exist anywhere
  in the repo (`OVERVIEW.md`, `docs/documentation-maintenance.md`,
  `books/TRANSLATION_REVIEW_PIPELINE.md`,
  `docs/bible-open-translation-assessment-2026-09-03.md`,
  `docs/translation-audit-independent-spot-check.md`,
  `docs/approved-translations-independent-check.md` — checked both this branch and
  `origin/main`). `docs/workflow-boundaries.md` exists and was read. The task's "Important
  corrections from independent review" section was treated as authoritative directly from
  the task text, since no backing document was found to read instead.
- [x] Confirmed no edition files or `bookRegistry.ts` changed between the audited commit
  and current `origin/main` — the September audit's hashes and findings remain valid
  without re-verification of file identity.
- [x] Branch decision made and documented (stay on `claude/upbeat-brown-cuttkn` — see
  release-readiness report's "Branch note").

## Task 1 — Bible replacement package

- [x] BSB rights verified against `berean.bible/terms.htm` (fetched directly, saved
  verbatim)
- [x] BSB full text sourced (`bereanbible.com/bsb.txt`, 31,102 verses, 66 books)
- [x] BSB structurally validated against `bible-kjv-en.json` (1189/1189 chapters, exact
  verse-count match every chapter, 0 issues)
- [x] BSB cross-checked against a second independent host (Bible Hub)
- [x] BSB edition metadata, audio-incompatibility note, and registry-key decision flagged
  for app agent
- [x] WEB Catholic rights verified (`ebible.org` copr.htm, fetched directly)
- [x] WEB Catholic full text sourced (USFM, 73/73 books, all 9 deuterocanonical books
  confirmed present)
- [x] WEB Catholic structurally validated (1,328 chapters, 35,384 verses; 20 verse-number
  gaps investigated and confirmed as expected critical-text/versification features, not
  defects)
- [x] WEB Catholic kept fully separate from BSB; integration blockers documented, deferral
  recommended

## Task 2 — Confirmed release-blocker ledger

- [x] Bible (already covered by Task 1 + the September audit's `bible.md`)
- [x] Jane Eyre — reconciled by subagent, confirmed via direct file read
- [x] Moby-Dick — reconciled by subagent, confirmed via direct file read
- [x] Henry IV, Part 2 — reconciled by subagent, confirmed via direct file read
- [x] As You Like It — reconciled by subagent, independent-review correction upheld
- [x] Faust, Part One — reconciled by subagent, independent-review correction upheld
  (partially, precisely — 59% of the opening monologue confirmed present, not "missing
  entirely")
- [x] Magna Carta — reconciled by subagent, independent-review correction upheld in full
  (all 63 clauses present; different, narrower defect identified and precisely diagnosed)
- [x] Master ledger with one action per book assembled
  (`04-confirmed-defect-ledger.md`)
- [x] 7 additional "uncertain-source" findings from the September audit acknowledged (not
  re-verified in this pass — listed explicitly rather than dropped)

## Task 3 — Odyssey pilot

- [x] Chapter selected (Book 9 — chosen because the September audit found it one of the
  weakest existing modern-en chapters, a real test case)
- [x] Full 44-paragraph candidate drafted, matching source paragraph count exactly
- [x] Word-coverage validated programmatically (0 paragraphs under the 0.75 truncation
  floor after one revision)
- [x] Coverage record written (naming decisions, formulaic-repetition handling, the
  Nobody/nobody pun, the curse's conditional logic, glosses used, the one compression
  found and fixed)
- [x] Blind three-way review packet built (10 passages, source / current-modern /
  candidate, neutral labels, separate mapping file, no verdicts)
- [x] Confirmed: rest of the Odyssey NOT touched, no audio generated

## Task 4 — Test-reader starting shelf

- [x] `wip_inventory.py` re-run to confirm current staged/published status
- [x] 14 "Ready" books selected from the September audit's Strong-band pool, spanning
  drama/philosophy/novel
- [x] "Usable with known local issues" bucket built (Bible pending integration, Odyssey
  with disclosed unevenness, Frankenstein, Pride and Prejudice with an edition-specific
  recommendation)
- [x] "Needs correction" and "Blocked" buckets cross-referenced against the Task 2 ledger

## Deliverables

- [x] `01-release-readiness-report.md`
- [x] `00-progress-ledger.md` (this file)
- [x] `04-confirmed-defect-ledger.md`
- [x] `07-test-reader-starting-shelf.md`
- [x] `defect-ledger/*.md` (3 files, per-book evidence)
- [x] `handoff/APP-AGENT-HANDOFF.md`
- [x] `books/staged-replacements/bible-bsb/` (full package)
- [x] `books/staged-replacements/bible-web-catholic/` (full package)
- [x] `books/staged-replacements/odyssey-pilot/` (full package)
- [x] `PIPELINES.md` updated with a dated pointer to this release (additive, historical
  content preserved and marked as historical per the task's instruction)
- [x] Documentation checks run (see release-readiness report's own checklist)
- [ ] Final commit and push of this progress-ledger update (in progress — see git log for
  the actual commit sequence; each major deliverable was committed and pushed
  independently as it completed, not batched to the end)

## Blockers / open questions handed to the app agent

See `handoff/APP-AGENT-HANDOFF.md` section 0 and the per-item notes throughout — none of
these blocked this content-prep task itself, they're decisions the app agent needs to make
before publishing:

1. Bible registry-key shape (reuse `modern-en` vs. new key)
2. WEB Catholic integration approach (separate book entity vs. full renumbering) — content
   work recommends deferring this past the current release
3. Henry IV Part 2 / As You Like It chapter-renumbering coordination (reading position +
   audio index migration)
4. Whether to publish Treasure Island (staged, content-ready) as part of this release
