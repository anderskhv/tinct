# Leviathan Batch 3 — Chapter Selection

Three chapters chosen from the unrepaired backlog (43 of 49 chapters remain
after batch 2's ch10/ch14/ch27), verified directly against the live edition
files before drafting — number, title, and opening text checked, not
assumed from array position. All three already pass the mechanical
modernization gate (REAL), so this is accessibility/fidelity repair work on
an existing rewrite, same as every prior chapter in this pilot.

## Selected

| | Edition ch | Hobbes ch | Title | Paragraphs | Words | Why |
|---|---|---|---|---|---|---|
| Short (calibration) | 2 | 1 | "Of Sense" | 5 | 683 | The second-shortest unrepaired chapter in the book — a fast, low-risk round-trip, and the first substantive chapter after the Introduction, opening Hobbes's account of human cognition from the ground up. |
| Long (scale test) | 16 | 15 | "Of Other Laws of Nature" | 43 | 5,008 | Substantial without being the book's extreme outlier — edition ch43 (Hobbes's own ch42, "Of Power Ecclesiasticall," 138 paragraphs / 29,242 words) remains explicitly excluded from ordinary batches and reserved for its own dedicated multi-batch project (see note below on a tracker mislabeling this session found and fixed). Continues the enumerated-natural-laws argument begun in ch15 (edition), a different rhetorical mode than any chapter done so far (a long list of numbered maxims with worked examples, rather than continuous argument). |
| Different difficulty | 13 | 12 | "Of Religion" | 32 | 4,553 | An anthropological/psychological argument about the origin of religion in human fear and ignorance — different subject matter than anything in batches 1-2 (no law, no scripture-citation apparatus, no state-of-nature argument). A genuine test case for the editorial-transparency requirement: Hobbes makes sweeping claims about "primitive" religious belief that a modern reader may want flagged as his own inference/period view rather than settled anthropology, similar in kind to ch14's America passage but in a different register. |

## Confirmed before drafting (per chapter)

- Title and opening text read directly from
  `app/public/data/editions/leviathan-original-en.json` and matched
  against `leviathan-modern-en.json`.
- Paragraph counts match between original-en and modern-en for all three
  (5/5, 43/43, 32/32).
- Gate classification (informational only, not a pass/fail gate): ch2 sim
  0.569, ch16 sim 0.604, ch13 sim 0.571 — all REAL.
- No other active writer: `git status --short` clean before staging, no
  pre-existing `books/wip/leviathan-pilot-ch2/ch13/ch16/` directories.

## Tracker correction found during selection

The chapter tracker's "not started" list carried a stale note flagging
edition chapter **42** ("very long, 138 paras/29,242w — recommend its own
dedicated multi-batch project") from an earlier session. Direct
verification against `leviathan-original-en.json` shows edition ch42 is
actually "Chapter 41. Of the Office of Our Blessed Saviour" — only 10
paragraphs, 3,032 words. The true 138-paragraph/29,242-word giant is
**edition chapter 43** ("Chapter 42. Of Power Ecclesiasticall" — Hobbes's
own ch42, edition-numbered 43 since edition numbering is offset by the
unnumbered Introduction). The tracker's underlying intent (exclude the
giant chapter from ordinary batches) was correct; only the edition-number
label was wrong. Corrected in `LEVIATHAN-CHAPTER-TRACKER.md`.

## Not selected, for the record

Edition ch43 (Hobbes's own ch42, "Of Power Ecclesiasticall," 138
paragraphs / 29,242 words) remains excluded, per the above, pending its
own dedicated multi-batch project.
