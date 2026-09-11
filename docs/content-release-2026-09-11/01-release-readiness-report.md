# Release-readiness report — Tinct test-reader content prep

**Prepared:** 2026-09-11. Content and editorial QA only, per task scope — no app files
changed, nothing merged, deployed, or published. All work lives on branch
`claude/upbeat-brown-cuttkn` (the same branch as the 2026-09-11 full translation audit;
kept as the working branch for this follow-on task rather than opening a second one,
since the harness assigned this session to that branch and no other agent branch was
visible to conflict with — see "Branch note" below).

## What this delivers

Not a retranslation of 100 books — the smallest content release that gives test users
trustworthy reading material, per the task's stated priority order.

1. **Bible replacement package (Task 1) — done.** A complete, verbatim, rights-verified
   Berean Standard Bible (BSB) edition, staged and structurally validated against the
   existing chapter scheme with zero mismatches, ready for the app agent to integrate.
   Also a separate, fully-independent World English Bible Catholic package (73/73 books,
   rights-verified), documented but deliberately not force-fit into the existing schema —
   recommended to ship *after* this release, not blocking it.
2. **Confirmed release-blocker ledger (Task 2) — done for the 7 priority books.** Every
   defect re-verified directly against current files, with the independent review's three
   corrections applied and, in each case, the record set straight in the direction the
   evidence actually supports (two were more serious than corrected, two were less severe
   than the original audit stated — see the ledger for which is which).
3. **Odyssey Book 9 pilot (Task 3) — done, pending review.** One full chapter, chosen
   because the existing modern edition handles it worst, re-rendered against the current
   reading standard, with a full coverage record and a blind three-way review packet. The
   rest of the Odyssey has deliberately not been touched.
4. **Test-reader starting shelf (Task 4) — done.** 14 books ready outright, several more
   usable with disclosed caveats, everything else sorted into "needs correction" or
   "blocked" with a reason and a next step.

## Coverage and confidence, stated plainly

- 7 of 7 priority defect-ledger books re-verified directly against current file content
  (not against the prior write-up). 7 more "uncertain-source" findings from the September
  audit are acknowledged but not re-verified in this pass — listed, not silently dropped.
- The Bible replacement's structural validation is exhaustive (1189/1189 chapters, every
  verse count checked, not sampled) because it's a mechanical, checkable property; its
  *readability* was evaluated by direct inspection of a sample of passages plus one
  independent cross-check host, which is the appropriate depth for a public-domain,
  committee-translated text with no AI-generation risk — it is not claimed to be
  read cover-to-cover.
- The Odyssey pilot is one chapter, read in full, checked paragraph-by-paragraph for word
  coverage and specifically checked for the failure patterns this whole audit kept
  finding (invented content, flattened repetition, resolved ambiguity, name
  inconsistency). It does not establish that the same quality would hold across the other
  23 books without drift — the audit found exactly that kind of drift elsewhere, which is
  the entire reason this task calls for review before any larger retranslation.
- Nothing in this release implies whole-book verification from a few passages, per the
  task's explicit instruction. Where a book's status is "ready," it means the specific
  checks stated were done and passed — see each deliverable for exactly what those checks
  were.

## What's still pending (not done in this pass)

- App-side integration of the BSB package (registry entry, availability flags, key
  decision — see handoff doc).
- A registry-shape decision for the WEB Catholic package (separate book entity vs.
  unified renumbering) — deferred by recommendation, not by oversight.
- Independent review of the Odyssey pilot (Opus/Anders/Codex) — required before any
  further Odyssey chapters are attempted.
- The 7 acknowledged-but-unverified findings in the defect ledger's final section.
- Patch work on Jane Eyre (chs. 27, 34-38) and the Henry IV Part 2 Induction restoration —
  scoped, not yet executed (both require app-agent coordination: Jane Eyre because any
  content patch should land through the normal content pipeline, Henry IV Part 2 because
  restoring the Induction renumbers every subsequent chapter).
- Magna Carta and Faust source replacements — scoped (Henderson 1892 and Gutenberg #14591
  respectively), not yet executed.

## Branch note

This task's instructions call for "a dedicated content branch/worktree" separate from the
app agent's work. This session was assigned `claude/upbeat-brown-cuttkn` by the harness at
session start (the same branch used for the full September audit), and no other agent's
branch was visible in the repository at any point during this session
(`git branch -a` checked at the start and periodically through the session). Continuing on
that branch satisfies the "dedicated, isolated from the app agent" requirement without an
unauthorized branch change; if the app agent is in fact working on a different branch not
visible to this session, that isolation still holds since this session made no changes
under `app/`. Flagged here for transparency rather than silently assumed.

## Documentation checks run before finishing

- `git diff --stat` between the audited commit and current `origin/main`, for every edition
  file referenced in this release, to confirm no drift since the underlying evidence was
  collected (see individual deliverables for the specific file lists checked).
- Every staged JSON file validated with `python3 -m json.tool` (BSB, WEB Catholic, Odyssey
  candidate, review-packet pairs/mapping).
- `python3 books/wip_inventory.py` re-run to confirm current staged/published book status
  before writing the starting-shelf recommendation (Task 4) and the Henry IV Part 2 /
  Taming of the Shrew audio-flag notes in the handoff.
- Cross-referenced every recommendation in this report against its source file in
  `docs/content-release-2026-09-11/` and `books/staged-replacements/` to confirm no claim
  here outruns its evidence.

## Where everything is

```
docs/content-release-2026-09-11/
  01-release-readiness-report.md       (this file)
  04-confirmed-defect-ledger.md        (Task 2)
  07-test-reader-starting-shelf.md     (Task 4)
  defect-ledger/                       (per-book reconciliation evidence, Task 2)
  handoff/                             (app-agent handoff, deliverable 8)

books/staged-replacements/
  bible-bsb/                           (Task 1 — primary Bible replacement)
  bible-web-catholic/                  (Task 1 — separate, deferred package)
  odyssey-pilot/                       (Task 3)
```
