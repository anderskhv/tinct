# Acceptance Record — As You Like It, threads re-keying and onboarding correction

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/as-you-like-it-onboarding-threads-fix/` |
| Branch | `claude/cool-clarke-ngd780` |
| `threads/as-you-like-it-threads.json` sha256 | `e45c53e648d6fc9143886cbbf9284cf5139dbb4d25ec27ce29109a8b2799d85c` |
| `onboarding/as-you-like-it.json` sha256 | `b6f95d6ead2408c755b2c2e3be4aee3c51b46efa4102e2407bd1d621212ccbf0` |
| `onboarding/as-you-like-it.da.json` sha256 | `571bc6e20ce4f356a381cfb49a386af478621cb404371133cc0bd5c1336dcd5e` |
| Independent reviewer | Two rounds: a full independent review (`INDEPENDENT-REVIEW.md`) then a targeted recheck of the 3 fixes it required |
| Review verdicts | Round 1: **DO NOT ACCEPT (as-is)** — 2 real misplacements + 1 gap found. Fixed. Round 2 (recheck): **ACCEPT** |

## Round 1 findings and disposition

Onboarding (both languages) passed cleanly on the first review: label and
opening-text quotations confirmed accurate against the accepted
candidates. The threads file had 2 real misplacements — both pre-existing
bugs in the live file, carried forward unverified by the initial 1:1
re-key (Orlando's and Jaques's entries at two non-split old chapters
described content that actually belonged to a different chapter) — plus
1 genuine gap (the Epilogue's only mention was folded into the
finale-chapter entry rather than given its own chapter-23 entry).

**Fixed:**
1. Orlando: moved the mis-keyed feast content to chapter 10 (merged with
   its existing correct content there); wrote a new, minimal, directly-
   observable entry for chapter 9's actual content (Adam collapsing from
   hunger).
2. Jaques: moved the mis-keyed deer-weeping content to chapter 4; wrote a
   new, minimal entry for chapter 8's actual content (the "Under the
   Greenwood Tree" song scene).
3. Rosalind: split the existing "Delivers the epilogue directly to the
   audience" sentence out of the chapter 22 entry into its own new
   chapter 23 entry — relocating already-present content, not new
   authorship.

## Round 2 (recheck) verdict

All 3 fixes independently confirmed accurate against the actual chapter
text in the accepted `modern-en` candidate; Celia and Touchstone's
entries (unaffected by these fixes) confirmed unchanged; file valid JSON.

## Remaining, not fixed by this package

New chapter 1 (Act 1 Scene 1, wholly restored by the underlying
completeness repair) has zero thread coverage from any of the 5
characters, and there is no existing content anywhere to relocate to
fill it — authoring it would be new content, outside this package's
placement-only brief. Flagged for Anders/Codex as a possible follow-up.

## What "accepted" does not mean

Accepted for integration; not published, not live. This package does not
touch As You Like It's character card (`as-you-like-it.v1.json`) — that
was not named in the relayed content dependency for this book. Codex owns
integration and the serialized release process per
`books/BOOK-TASK-WORKFLOW.md`.
