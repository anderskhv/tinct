# Release Packet — Othello (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-othello/candidate.json`
- **Target live path:** `app/public/data/editions/othello-modern-en.json`
- **Accepted sha256:** `f1795c6e18574a9ffa59bb666366d8810653aa659e86723fdacb4e9eecc4fbb6`
- **Structure:** 15 chapters, 1391 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-othello/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full coverage table across both rounds, defect list, deliberately-preserved items, final hash, independent-verification notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Two rounds. Round 1 (Sonnet) found and fixed 2 defects: an inconsistent
partial name-form "correction" (source's affectionate short form "sweet
Desdemon" silently normalized to "Desdemona" in one of its two
occurrences, missing its sibling) and a reversed-meaning antonym
substitution (Iago's "remorse," meaning pity, flipped to
"remorseless"). Round 2 (independent Opus adversarial re-verification)
re-derived both fixes, ran a location-matched case-sensitive sweep on
30+ proper nouns (zero mismatches), its own from-scratch compression
sweep across all 1391 paragraphs (zero moderate-compression outliers
in this book), a full non-sampled word-for-word read of the entire
book including the Senate scene, all of Act 3 Sc.3, the willow song,
Emilia's closing speech, and the murder/final-speech sequence, and
confirmed the "Judean" textual crux matches source exactly (no
imported "Indian" emendation). Found and fixed one further narrow
defect: a dropped verb and collapsed contrastive relation in the First
Senator's strategic argument (ch3 ¶13), restoring "in order to rouse
and wage a profitless danger" to match source's "to wake and wage a
danger profitless."

## Relationship to currently-live text

A paragraph-level diff against the current live `othello-modern-en.json`
shows the accepted text differs in 3 of 1391 paragraphs (the 2 round-1
fixes plus the round-2 fix).

## Audio invalidation

No English audio currently exists for `othello`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: 4
pronoun-to-name disambiguations judged legitimate prose clarification
(each referent already named moments earlier in the same speech), the
consistent "ancient"→"ensign", "napkin"→"handkerchief",
"Ottomite"→"Ottoman" period-vocabulary modernizations (identical
referents, not meaningful spelling variants), and one contested gloss
("subdu'd eyes"→"hardened eyes") recorded rather than resolved, since
the line's substance is carried by its following clause either way.
Frank/violent/racially-charged content preserved at full force
throughout — specifically checked and confirmed unsoftened.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
