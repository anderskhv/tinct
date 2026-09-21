# Release Packet — Cymbeline (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-cymbeline/candidate.json`
- **Target live path:** `app/public/data/editions/cymbeline-modern-en.json`
- **Accepted sha256:** `37c9f0de37f0e55d906520605ca2794aedbbf7a0f87da2d0ec1c6b1a204cc904`
- **Structure:** 29 chapters, 1133 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-cymbeline/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full coverage table across all 3 rounds, defect counts, deliberately-preserved items, final hash, independent-verification notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Three rounds. Round 1's self-reported "zero defects, full coverage" was
inaccurate — its content-loss tripwire only caught extreme-outlier short
lines, not moderately compressed ordinary-length paragraphs. Independent
round-2 verification found and fixed 3 blocking defects: a dropped
opening clause erasing a referent (ch1 ¶6), a reversed direction of
deference in a verse metaphor (ch15 ¶5), and a silently-imported
scholarly emendation replacing source's own printed line (ch5 ¶45).
Round 3 (independent Opus adversarial re-verification) re-derived all 3
fixes from source, ran its own from-scratch compression sweep (median
ratio 1.00, every outlier paragraph read in full), a per-paragraph
proper-noun/allusion occurrence map (~80 names), an emphasis-markup
audit, and a ~130-paragraph word-for-word spot-check across the wager,
bedchamber, false-proof, rage, cave, vision, and recognition scenes.
Found no further blocking defects.

## Relationship to currently-live text

A paragraph-level diff against the current live `cymbeline-modern-en.json`
shows the accepted text differs from it in the 3 fixed paragraphs (ch1
¶6, ch15 ¶5, ch5 ¶45) plus whatever round-1 drafting already changed
against that live baseline — see `ACCEPTANCE-RECORD.md` for the full
round-by-round history.

## Audio invalidation

No English audio currently exists for `cymbeline`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: a
mid-sentence source break completed one paragraph early (ch2 ¶38/39, no
content lost), "Titan" resolved to "the sun" (ch16 ¶33), a finger/self
referent shift (ch5 ¶44), "resty"→"restless" (ch19 ¶2), the dirge's lost
italic markup (already set off by heading/speaker tags), "Cytherea" left
unglossed, the soothsayer's Latin wordplay kept in Latin (mechanism the
scene depends on), and two inherently dense speeches (ch1 ¶11, ch27 ¶6).

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
