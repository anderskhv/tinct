# Release Packet — Coriolanus (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-coriolanus/candidate.json`
- **Target live path:** `app/public/data/editions/coriolanus-modern-en.json`
- **Accepted sha256:** `012fdaaa359726830d58c6745b9e776891360256de19a0aec008f9831abb829c`
- **Structure:** 29 chapters, 1379 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-coriolanus/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `PARKED-RESOLVED.md` | Full park history (rounds 2-3) and how it was resolved |
| `ACCEPTANCE-RECORD.md` | Full 4-round coverage table, defect list, deliberately-preserved items, final hash, model/settings notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Four rounds. Round 1 fixed 1 defect and wrongly self-certified clean.
Round 2 (independent Opus verification) found 12 more defects (~30
occurrences) in the "erasure of source's own printed forms" class —
a Volsces/Volscians form-mixing pattern including an all-caps
speaker-tag blind spot, a silently-normalized source-own spelling
(Pebleians), 5 coinage erasures, and a false-friend meaning error
("cautelous" mistranslated as "cautious," breaking a later plot
payoff) — plus 3 false verification claims in round 1's own report,
parking at 2/3 rounds. Round 3 fixed all of it (35 paragraphs). Round
4 (final independent Opus confirmation) re-derived every fix from
source, ran a third, differently-instrumented sweep methodology (a
lowercase-hapax cross-reference, since prior rounds' methods were
blind to non-capitalized vocabulary) that found zero further instances
of the parked class, and found+fixed 3 narrow defects of the inverse
kind (small interpretive additions, not erasures — a demonym and a
bracketed stage direction added where source has none) — judged
narrow/mechanical, not evidence of an unresolved pattern, and fixed
directly per this batch's established precedent.

## Relationship to currently-live text

A paragraph-level diff against the current live `coriolanus-modern-en.json`
shows the accepted text differs in 38 of 1379 paragraphs (35 round-3
fixes + 3 round-4 fixes; the round-1 fix is included in that 35 since
round-3's diff was measured against the post-round-1 file).

## Audio invalidation

No English audio currently exists for `coriolanus`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: ~35
obsolete words modernized (mammocked->mangled, foxship, undercrest,
godded, etc.) — the licensed core operation of a modern-en edition,
distinguished from the ~15 items across Class A/B that were restored
because the strangeness of the word IS the point (deliberate coinages,
non-standard spellings, or a demonym source itself varies). Class-
contempt and violent content (the belly fable, Coriolanus's plebeian-
contempt speeches, the banishment scene, Volumnia's supplication, the
assassination) verified intact and unsoftened throughout.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
