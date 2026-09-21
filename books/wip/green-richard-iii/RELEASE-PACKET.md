# Release Packet — Richard III (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-richard-iii/candidate.json`
- **Target live path:** `app/public/data/editions/richard-iii-modern-en.json`
- **Accepted sha256:** `e5e713ceee70f643d290357683524f0f0c62a8b1061278b79f51860010137385`
- **Structure:** 25 chapters, 1420 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-richard-iii/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `PARKED-RESOLVED.md` | Full park history (rounds 2-3) and how it was resolved |
| `ACCEPTANCE-RECORD.md` | Full 4-round coverage table, defect list, deliberately-preserved items, final hash, model/settings notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Four rounds. Round 1's fidelity pass fixed 9 defects (Tewksbury spelling,
a partial Harry->Henry fix, an over-regularized Tyrrel/Tyrell) and ran
a mandatory register-check that found zero softening on the first
pass — but wrongly self-certified the "erasure of source's own printed
forms" class exhausted, including false claims about its own
verification methodology. Round 2 (independent Opus verification)
confirmed all 9 fixes and confirmed zero register-softening, but found
15 live defects in 4 sub-patterns: 2 silently-standardized proper nouns
(one killing a deliberate Rougemount/Richmond echo), Exeunt partially
erased at 10 of 39 occurrences, "Mistress Shore" partially modernized
at 2 of 5 occurrences, and one dropped religious invocation — parking
at 2/3 rounds. Round 3 fixed all 15 plus 2 of 9 flagged minor items.
Round 4 (final independent Opus confirmation) re-derived everything
from scratch with fresh instrumentation, found the defect class
genuinely exhausted, but caught one further narrow inconsistency round
3 itself had documented but reasoned about incorrectly (a
kept-most/changed-one drift on "the Sixth" and "Paul's", 2 paragraphs)
and fixed it directly.

## Relationship to currently-live text

A paragraph-level diff against the current live `richard-iii-modern-en.json`
shows the accepted text differs in 28 of 1420 paragraphs (9 round-1 +
17 round-3 + 2 round-4 fixes).

## Audio invalidation

No English audio currently exists for `richard-iii`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: 6
minor items left as legitimate modernization/rendering with individual
reasoning (Hoyday->Heyday, score-of-tailors, pretty-one(s), replenished,
malmsey-butt within, the two Zounds renderings). Frank/violent/insulting
content (Margaret's curses, "Ravish our daughters"->"rape our
daughters" — stronger, not softer — the murders and ghosts) verified
intact and unsoftened throughout, on both round 2's and round 4's
independent register-checks.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
