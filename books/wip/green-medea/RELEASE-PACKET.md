# Release Packet — Medea (Euripides)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes. This packet
is everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-medea/candidate.json`
- **Target live path:** `app/public/data/editions/medea-modern-en.json`
- **Accepted sha256:** `8aafd12a4c3fab2c24dd6776b00ba42da12c3bc2bf2a10ebe01e348dda699381`
- **Structure:** 7 chapters, 241 paragraphs, matches `source.json`
  (Gilbert Murray verse translation) exactly. `medea-threads.json`
  already exists — unlikely affected (all changes are wording-level).

## Validation / review evidence

All evidence lives in `books/wip/green-medea/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full 3-round coverage table, defect counts, deliberately-preserved items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

**This book took 3 rounds, and that history matters for release-owner
trust:** round 1 (single-model drafting + self-review) claimed full
coverage but miscounted the book's own paragraphs (said 235, actual
241); an independent verification pass caught a silent "Iolcos"→"Iolcus"
name correction and a dropped word ("blue" in "blue Symplegades") round
1 missed; a full independent Opus pass then found 5 further blocking
defects (a negation inversion, a misattributed epithet, a dropped
condition with a person-swap, an invented causal claim, and a
cross-chapter terminology break — "wise-woman" replaced with "witch,"
breaking a callback Medea makes to the term later) plus 8 minor issues.
All fixed and re-verified. The round-1 coverage failure is a useful
signal: single-pass, single-model review claims should not be trusted at
face value in this programme going forward.

## Relationship to currently-live text

A paragraph-level diff against the current live `medea-modern-en.json`
shows the accepted text differs in 16 of 241 paragraphs.

## Audio invalidation

No English audio currently exists for `medea`. Nothing to invalidate.
`accepted-paragraph-hashes.tsv` is the baseline hash set for future drift
detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`:
Medea's brother and Creon's daughter stay unnamed throughout (matches
source, verified at every occurrence); source's own non-standard
spellings (Iolcos, Trozen, Skylla) preserved as printed; one genuinely
ambiguous archaic clause left as-is; the inherited Creon stage-direction
sequencing (source's own structure, not a candidate defect).

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
