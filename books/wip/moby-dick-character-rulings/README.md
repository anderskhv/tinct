# Moby-Dick — identity rulings for the 23 unresolved character spans

**Status:** content accepted and handed off to the coding agent. Not published.

This package resolves the one content hold on the Moby-Dick body release. It leaves the accepted translation and the structural package untouched.

- **Hold:** `docs/integration-backlog-2026-09-25.md` on main lists "identity rulings for 23 dropped or changed character spans".
- **Accepted body (unchanged, not reopened):** `books/wip/green-moby-dick/candidate.json` on `claude/charming-shannon-mojaef` (package commit `52c720049`; candidate introduced at `3a10dc242`). Its sha256 is `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`.
- **Structural and front-matter package:** `books/wip/moby-dick-structural/` stays separate and follows the body release. Nothing here depends on it or changes it.

## Where the 23 spans come from

The coding agent's preparation run `35979512264` (workflow "Prepare accepted Moby-Dick body repair", branch `codex/moby-reviewed-release-20260924`, commit `d3e1129f`) failed on:

```
assert not report["droppedMentions"]
```

The inputs to that run were:

- the live card `app/public/data/characters/moby-dick.v1.json` (sha256 `dccdb35d…`, still the same on main `1a7d89eb`);
- the live modern-en (`2ab04dd7…`, still served on main);
- the accepted candidate (`1a3f31bb…`).

The run first removed the 7 mentions already ruled "gone" in the accepted package's `character-card-impact.json`. It then called `reanchor(…, allow_alias_changes=False)`, and 23 mentions came back in `droppedMentions`. The run log prints exactly those 23. That is the inventory, and there is no newer one: no branch, PR or record holds successor rulings.

Both this package's lead and its independent reviewer re-ran the same procedure against the pinned inputs with the unchanged `app/scripts/prepare-reviewed-editions.py` (main version, read-only). Each got the same 23 spans in the same order.

## Method

1. **Every span in context.** For each of the 23 spans the lead read three texts:
   - the live paragraph, with the span marked;
   - Melville's paragraph (PG #2701, the served original-en);
   - the full accepted candidate paragraph.
2. **What a map means.** A span is mapped only when the same reference survives: the same clause and referent, named with one of that character's reviewed names. The reviewed names are the distinct `text` values of the character's existing mentions. The final span must not overlap a span already held by a re-anchored mention.
   - Occurrences were never chosen by their order among same-name matches.
   - A string match was never treated as evidence of identity.
3. **What a drop means.** Everything else is dropped with a class and a reason. Typical cases:
   - the candidate uses a pronoun, epithet or descriptor where live had the name;
   - the live sentence was the old edition's own invention or condensation and has no counterpart in Melville or the candidate.

   This release adds no new identity binding (the release scope says so), so an unbound name elsewhere in the paragraph is not a replacement.
4. **Independent review.** A separate reviewer re-derived the inventory and ruled all 23 blind, without seeing the lead's rulings. The two ledgers were then compared field by field, and the reviewer and lead agree on all 23 decisions and exact spans: 3 map (MD-03, MD-11, MD-23) and 20 drop.
5. **One more defect outside the inventory.** The reviewer's all-span overlap check found that the re-anchor tool itself creates a duplicate. At 61.8 it relocates live "Stubb's boat" (Melville: "the smoker's boat") by occurrence order onto a span that a retained mention already holds. The lead confirmed this is the only duplicate or overlap in the re-anchored set. Ledger row MD-24 drops the duplicate.
6. **Expected result.** After the ledger is applied, the modern-en block has **1,751 mentions**. Every span slices exactly and none overlaps. See `resolved-dry-run.json` and `RELEASE-NOTES.md`.

## Files

| Path | What it holds |
|---|---|
| `LEDGER.md` | The 23 rulings in a readable table, with the reasons |
| `ledger/final-mapping.jsonl` | The machine-readable ledger, one JSON object per line in inventory order. It follows the shape of the Crime identity ledger that `app/scripts/prepare-crime-release.py` consumes: `existingMention`, `finalDecision` (`map` or `drop`), `finalSpan`, `rationale`, `evidence` (live and candidate paragraph sha256 of the normalized text), and `independentReview` (`agreesWithLead`) |
| `inventory/dropped-mentions-23.json` | The 23 spans exactly as the unchanged tool reports them |
| `review/reviewer-rulings.json`, `review/REVIEW.md` | The independent reviewer's blind rulings and report, with its observations on retained mentions |
| `review/retained-audit-affected-paragraphs.json` | The reviewer's clause audit of the 54 retained mentions in the affected paragraphs |
| `review/lead-vs-reviewer.md` | The field-by-field comparison: 23/23 agree |
| `resolved-dry-run.json` | Counts and the canonical sha256 of the fully resolved modern-en mention list |
| `RELEASE-NOTES.md` | How the coding agent applies the ledger, the expected counts and the observations |

## Provenance of this package

- **Instruction revision:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5`. The book-task workflow and AGENTS files were last changed at `ec11086e`.
- **Owned path:** `books/wip/moby-dick-character-rulings/` only, on branch `claude/friendly-davinci-9ti52c`.
- **Scripts not committed.** Both the lead and the reviewer used scratchpad scripts: the inventory reproduction, the span checks and the overlap audit. Under the book-task workflow no code is placed in a content folder, so they are not committed. The reviewer's `REVIEW.md` names its scripts only to describe what was checked.
- **Rulings and dry run are pure data.** They can be re-checked against the pinned inputs with the unchanged `app/scripts/prepare-reviewed-editions.py`.
