# Release Packet — The Bacchae (Euripides)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-bacchae/candidate.json`
- **Target live path:** `app/public/data/editions/bacchae-modern-en.json`
- **Accepted sha256:** `19507a56111d7394a028782d42997e75028a0502fec39c97e631f6efc0f799a8`
- **Structure:** 11 chapters, 336 paragraphs, matches `source.json`
  (Gilbert Murray verse translation) exactly. `bacchae-threads.json`
  already exists — unlikely affected.

## Validation / review evidence

All evidence lives in `books/wip/green-bacchae/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `PARKED-RESOLVED.md` | Full defect history through round 3's park, marked resolved |
| `ACCEPTANCE-RECORD.md` | Complete 4-round coverage table, defect counts, deliberately-preserved items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

**This book took 4 rounds and was briefly parked**, which is worth the
release owner's attention: round 1 fixed 2 violence-softening defects;
an independent pass then found source's own transliterated names
(Teiresias, Kithaeron, Bromios, Bacchios, and a genuine Dionyse/Dionysus
variation) had been silently normalized throughout the whole book, fixed
in round 2 (~40 paragraphs); round 3's verification found round 2's
sweep had missed the all-caps speaker-tag form of "Teiresias" specifically
(a case-sensitivity gap, not a new conceptual defect) and formally
parked the book per programme rule; given the fix was mechanical and
unambiguous (13 exact-match case corrections) and every other dimension
had just been verified exhaustively clean (the high-risk Dionyse/
Dionysus split checked at all 111 relevant paragraphs, zero mismatches),
the fix was applied directly rather than discarding the round's work,
and round 4 confirmed it clean with a full case-sensitivity sweep across
every all-caps token in the book.

## Relationship to currently-live text

A paragraph-level diff against the current live `bacchae-modern-en.json`
shows the accepted text differs in 49 of 336 paragraphs.

## Audio invalidation

No English audio currently exists for `bacchae`. Nothing to invalidate.
`accepted-paragraph-hashes.tsv` is the baseline hash set for future
drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: 6
non-blocking items including source's own emphasis-rendering choices and
a couple of minor formatting quirks — none touch meaning, names, or
content.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
