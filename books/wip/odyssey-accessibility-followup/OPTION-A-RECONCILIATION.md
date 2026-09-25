# Books 3/4 join: option A vs B+ — reconciliation of the records

**Result: option A is the recorded decision for this release. The decision is not reopened.**

B+ remains an optional, owner-level typographic decision. This follow-up keeps both options open. A is correct under every option.

## The records, in order

| Date | Record | What it says |
|---|---|---|
| 2026-09-13 | Odyssey ledger A7, `books/staged-replacements/odyssey/00-progress-ledger.md` (branch `claude/odyssey-modern-en-completion`, `0a76d6ce`) | Prepares and hashes four patches to the served original-en: **A** (`0cc76350…6980`), **B** (`e45d6c4d…`), **B+** (`48397979…`) and **C** (`56a2a258…`). A is the 3.37 truncation alone. B adds lower-case "but"/"they" at 3.0/4.0. B+ also ends Book 2 with a comma. C lower-cases only 4.0. The ledger recommends B+ on the evidence of Butler's Preface, but calls it "Anders's call". |
| 2026-09-24 07:57–08:00 | Source-cleanup package `books/wip/featured-source-cleanup/` (`f64c7925`, then `7994156f`), `INTEGRATION-SPEC.md` and `README.md` | "**Odyssey option A is the decision this package records.** It applies the ledger's A3 option A, the truncation alone… B+ … is a typographic-policy decision for Anders, and it is **not** taken here. A is correct under every option." Its original-en output hash `0cc76350…6980` reproduces option A. |
| 2026-09-24 | Codex PR #163 (`codex/odyssey-reviewed-release-20260924`, `454c3209`), `app/scripts/prepare-odyssey-release.py` | Publishes original-en from `7994156f`. It asserts a single original-en change, at 3.37, and output `0cc76350…`, which is option A. It pairs that with modern-en `bd05c7f4…`. |
| 2026-09-25 | `docs/integration-backlog-2026-09-25.md` on main | "There is no disposition record and no A-vs-B+ decision for the Book 3/4 join." |

## Reconciliation

- **The earlier handoff did choose A, as the scope of the release.** Both the cleanup package and the coding agent's release implement A.
- **No record shows Anders choosing B+.** The only B+ record is the ledger's recommendation, which is explicitly left to the owner.
- **A is internally consistent with the accepted modern candidate.** Under A, both editions end Book 3 on Butler's comma ("Now when the sun had set and darkness was over the land," in the original; "…darkness lay over the land," in the modern), and both open 3.0 with "But" and 4.0 with "They". The two columns therefore match; the split-view mismatch that the ledger warns about arises only if one column moves without the other.
- **The backlog's "no A-vs-B+ decision" is therefore answered by the records.** A is decided for the release. B+ is an optional later change, not a blocker.

## What this follow-up does and does not do

- Its accessibility edits do not touch any of the following:
  - 2.35 (Book 2's terminal mark);
  - 3.37 (Butler's half-sentence);
  - the opening words of 3.0 ("But as the sun was rising");
  - the opening words of 4.0 ("They reached the low-lying city").
- Edits elsewhere in 3.0 or 4.0 leave those opening words intact, so B, B+ or C could still be applied later as the one-letter successors the ledger describes.
- This package does not change `odyssey-original-en.json`. The original-en to ship alongside this modern candidate is still option A's `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` from `7994156f`.

## If the owner later chooses B+

These changes must be applied on the same day, as the ledger requires:

1. **Original-en.** Lower-case 3.0 "But", lower-case 4.0 "They", and end 2.35 with a comma instead of a full stop. The ledger's B+ patch is hashed `48397979…` against the pre-A file. Recompute it on top of A.
2. **Modern-en.** The matching one-letter successors: 3.0 "but", 4.0 "they", and 2.35 ending with a comma.
3. **Source pin.** Add a `SOURCE_DIVERGENCES` row for 2.35 in the package's `scripts/pg_source.py` register, quoting the Preface. B+ departs from PG at that one point.

Until then, nothing here needs a decision.
