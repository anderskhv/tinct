# Test-reader starting shelf — recommendation

**Prepared:** 2026-09-11. Content recommendation only — this does not redesign the library,
does not change what's actually available in the app, and is not a claim that any book
below is verified cover-to-cover. It's a short, evidence-backed list for the app agent to
act on (or not) when deciding what to point early test users at.

## How to read this list

Every book below was rated in the 2026-09-11 translation audit using a minimum of 5
sampled passages (opening/early/middle/late/outlier), never fewer, and the audit's own
confidence/sampling-coverage caveats still apply — "strong in samples" is not "the whole
book is verified." Nothing here should be read as more certain than that. Four buckets,
per the task's framing:

## Ready (based on the stated checks)

Strong band (4.7+ weighted score), KEEP CURRENT MODERN EDITION or LIGHT EDIT with only
local fixes, no open rights/provenance question, no confirmed severe defect anywhere in
the audit trail.

| Book | Recommendation | Why it clears the bar |
|---|---|---|
| The Comedy of Errors | LIGHT EDIT | Homophonic Early Modern punning preserved intact — a real, well-executed modernization, not just a pass. |
| The Sorrows of Young Werther | KEEP CURRENT MODERN EDITION | Source (Boylan 1854) is archaic and has real translation errors the modern edition corrects. |
| Oedipus Rex | KEEP CURRENT MODERN EDITION | Thorough, evenly-modernized across the whole play; source (Storr 1912) is the most archaic in its batch. |
| Oedipus at Colonus | KEEP CURRENT MODERN EDITION | Same translator/pattern as Oedipus Rex; consistent quality confirmed across both. |
| Twelfth Night | LIGHT EDIT | Puns, the bawdy acrostic, and the M.O.A.I. puzzle all survive the modernization intact. |
| Candide | LIGHT EDIT | Voltaire's ironic tone and running gags preserved; source footnote/italic pollution cleaned up. |
| The Prince | KEEP CURRENT MODERN EDITION | Untangles Marriott's deliberately literal 1908 syntax without losing Machiavelli's specific historical examples. |
| Leviathan | KEEP CURRENT MODERN EDITION | Confirmed comprehensively repaired since a May 2026 near-total-failure state — independently re-verified in this audit. |
| Julius Caesar | LIGHT EDIT | Antony's and Brutus's set-piece rhetoric (the deliberate repetition) preserved, not smoothed away. |
| The Merchant of Venice | LIGHT EDIT | Shylock's moral ambiguity preserved; no editorializing added around the play's antisemitic content. |
| Descartes' Meditations on First Philosophy | KEEP CURRENT MODERN EDITION | Untangles 60-100-word source sentences while preserving the argument's exact logical structure. |
| The Death of Ivan Ilyich | LIGHT EDIT | Maude's long coiled sentences unpacked without losing a clause. |
| Antigone | KEEP CURRENT MODERN EDITION | Same translator/pattern as the other two Sophocles plays; consistently strong. |
| Don Quixote | KEEP CURRENT MODERN EDITION | Confirmed comprehensively repaired since a May 2026 near-total-failure state (independently recomputed across all 126 chapters in this audit) — Sancho/Quixote voice contrast survives. |

That's 14 books spanning drama (Shakespeare comedy and tragedy, Greek tragedy),
philosophy, and the novel — a reasonable range for a small first shelf without leaning on
any single genre's evidence.

## Usable, with known local issues

Good content, but with a specific, disclosed gap a test user might notice — still safe to
show, just not spotless.

- **The Bible (Berean Standard Bible replacement)** — *content-ready, contingent on the
  app agent's integration work.* The BSB package (Task 1) is sourced, rights-verified, and
  structurally validated against the existing `kjv-en`/`web-en` chapter scheme with zero
  mismatches. It is not "Ready" in the same sense as the list above only because it has
  not been wired into the app yet, and it must ship **text-only** — none of the existing
  audio is compatible (see the handoff doc). Once integrated, this fully resolves the
  urgent problem (a copyrighted, partially-broken Bible in production) that made the
  current Bible entry unsuitable for test users at all.
- **The Odyssey** — existing edition, "Good with fixes" per the September audit (20 of 24
  books genuinely modernized well; 4 books — including Book 9, now pilot-tested in Task 3
  — are weak, essentially unmodernized Butler). Usable today with that disclosed
  unevenness; the Book 9 pilot (not yet applied to the live file) shows what a fix would
  look like, pending the independent review the task calls for before doing the rest.
- **Frankenstein** — LIGHT EDIT, "Good with fixes." Shelley's abstract, Latinate prose is
  the hardest in its batch and the modernization delivers real clarity, but carries more
  local rough edges than the "Ready" tier above.
- **Pride and Prejudice** — recommend pointing test readers at the **original edition**,
  not `modern-en`, here specifically. Austen's 1813 prose already meets the reading
  standard on its own; the audit's own recommendation for this book is SOURCE + GLOSSES,
  meaning the modern rewrite's value-add is thin. Both editions are safe to show; the
  original is the better first recommendation.

## Needs correction before recommendation

Not ready as-is, but the fix is scoped and doesn't require full retranslation — flagged so
the app agent can decide whether a fast patch is worth doing before the release, or
whether to exclude for now and revisit.

- **Jane Eyre** — `modern-en` has confirmed hallucinated/reversed content in specific late
  chapters (27, 34–38); `original-en` is clean throughout. Recommend: show `original-en`
  only for now, or hold both editions until chapters 27/34-38 are patched (see defect
  ledger).
- **Henry IV, Part 2** — missing its Induction (Rumour's prologue) in every edition; fix is
  a ~290-word restoration from Project Gutenberg #100, but it's a structural change
  (renumbers every following chapter) that needs to go through the app agent, not a
  content-only patch. Hold until that's scheduled.

## Blocked (provenance, rights, completeness, or audio mismatch)

Do not add to a test-reader shelf yet.

- **Magna Carta** — every edition on file traces to the same encumbered British Library
  Davis-translation lineage; recommend rebuilding from the Henderson (1892) translation,
  confirmed public domain in both the US and Denmark, before this book is shown to anyone.
- **As You Like It** — `original-en` is missing Act 1 Scene 1 and contains 16 paragraphs of
  1990s CD-ROM boilerplate inside the reading text; not a rights block on Shakespeare's own
  words (see reconciliation), but a data-hygiene block until re-ingested from a clean
  source (PG #1523 or Standard Ebooks).
- **Faust, Part One** — `original-en` is a corrupted, mislabeled source (not the credited
  Bayard Taylor translation), missing roughly 40% of Faust's opening monologue and
  containing untranslated raw German in dozens of paragraphs; needs a full source
  replacement before any edition of this book is shown to a reader.
- **Moby-Dick modern edition** — confirmed factual reversal and 44 corrupted find-replace
  tokens concentrated in chapters 134-135; `original-en` (Melville 1851, unambiguously
  complete and correct) has no such issue and can be shown on its own — recommend it as
  the default edition for this book, with `modern-en` withheld until patched.

## What to conclude from this list

A small, real starting shelf exists today without touching anything blocked or
needing-correction: the 14 "Ready" books above, plus Frankenstein and Pride-and-Prejudice
(original edition) from "Usable," is a workable 16-book test shelf on its own. The Bible
becomes a 17th once the BSB package is integrated. The Odyssey is a reasonable 18th with
its unevenness disclosed. Everything in "Needs correction" and "Blocked" is a real, scoped
follow-up — not evidence the wider library is unsound; the September audit rated 60 of 100
published books "Approved" overall, this shelf is a first slice of that pool chosen for
strength and variety, not the ceiling of what's usable.
