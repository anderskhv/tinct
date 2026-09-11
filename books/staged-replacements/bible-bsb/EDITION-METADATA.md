# Proposed edition metadata — bible-bsb-en

Content prepared for the app agent to review and, if accepted, wire in per the handoff
document (`docs/content-release-2026-09-11/handoff/`). Nothing below has been applied to
`bookRegistry.ts` or any app file.

## Registry edition entry (proposed — for app agent review, not applied)

```ts
{
  key: 'modern-en',          // see "Key/identifier question" below — this needs a decision
  language: 'en',
  style: 'modern',
  label: 'Berean Standard Bible (2023)',
  translator: 'Berean Bible Translation Committee',
  year: 2023,
  aligned: true,              // aligned to kjv-en/web-en at the chapter level; see paragraph-alignment note below
  hasAudio: false,             // MUST be false — see audio-incompatibility note
}
```

### Key/identifier question — flagged for the app agent, not decided here

The current registry key for the AI-generated file is `modern-en`, styled `'modern'`. BSB
is not an AI modernization — it's a specific named human translation, like `original-en`
entries elsewhere in the registry (e.g. Odyssey's `Butler (Prose, 1900)`). Two options,
left for the app agent/Anders to decide since it's a registry-shape and UI-labeling
decision outside this task's scope:

1. **Reuse the `modern-en` key**, relabeled "Berean Standard Bible (2023)" instead of
   "Modern English" — simplest, no schema change, but the `style: 'modern'` tag becomes
   inaccurate (BSB is a human translation aiming for natural contemporary English, not an
   AI "modern rendering" of an older core text the way other books' modern-en works).
2. **Add a new key** (e.g. `bsb-en`, `style: 'original'` or a new style value) alongside
   `kjv-en` and `web-en`, and retire/hide `modern-en` for the Bible specifically. Cleaner
   semantically, but is a registry shape change and needs the app agent to confirm the
   `Edition` type and any code that assumes exactly one `style: 'modern'` per book still
   works for a book with none.

This document defaults to option 1's field values (reusing `modern-en`) only so the table
above is concrete; it is not a recommendation over option 2.

## Description / onboarding copy suggestions (content, not final UI copy)

- **Edition label:** "Berean Standard Bible (2023)"
- **Short descriptor** (for any "translator" or edition-picker subtitle): "A contemporary,
  word-for-word-leaning English translation, produced by the Berean Bible Translation
  Committee and dedicated to the public domain in 2023."
- Do **not** reuse any onboarding/description copy written for the old AI `modern-en`
  edition — it described an AI-generated "modern rendering," which no longer applies.

## Structural facts (from the staged build, `validation-report.md` has full detail)

- 1189 chapters, matching `bible-kjv-en.json` and `bible-web-en.json` chapter
  numbers/titles/order exactly (both were used as the identifier source; they already
  agree with each other per the September audit's `en_editions_aligned: true` finding).
- 31,102 verses total — matches `bible-kjv-en.json`'s verse count exactly, chapter by
  chapter, 1189/1189, zero mismatches (see validation-report.md).
- Paragraph convention: same as `kjv-en`/`web-en` — verses chunked 5-per-paragraph in
  verse order, inline superscript verse numbers (e.g. `¹ ... ² ...`), last paragraph in a
  chapter may have 1-5 verses. This is a **mechanical pagination convention already used
  uniformly across all 1189 chapters of the existing Bible editions**, not a literary
  paragraph structure — confirmed by directly checking all 1189 `kjv-en` chapters before
  reuse (0 exceptions). Reusing it does not compress, cut, or reorder any BSB wording;
  it only decides where paragraph-break boundaries fall between whole verses.
- `sections` (the Old Testament / New Testament / Pentateuch / Gospels / etc. navigation
  tree) copied verbatim from `bible-kjv-en.json` — no changes, since chapter
  numbers/order are identical.

## Paragraph-alignment note for Compare mode

Because paragraph boundaries were deliberately built to match `kjv-en`/`web-en`'s existing
5-verses-per-paragraph convention, paragraph-for-paragraph Compare between `bsb-en` (or
relabeled `modern-en`) and `kjv-en`/`web-en` should work exactly as well as `kjv-en` vs.
`web-en` already does today — no new alignment work should be needed. This was a deliberate
choice, not a default: BSB's own natural paragraphing was not used, per the analysis in
`validation-report.md`'s methodology section, because the existing convention is already a
neutral, non-damaging, whole-verse-preserving chunking rule, not an edited paragraph
structure — reusing it costs nothing in fidelity and buys back full Compare compatibility.
If Anders or the app agent would rather use BSB's natural paragraphing instead, that is a
straightforward re-run of `build_bsb_edition.py` with a different chunking function; flag
this back to content work rather than reformatting in the app layer.

## Audio and timing — explicit incompatibility

**None of Tinct's existing `modern-en` Bible audio or its timing/highlight-sync files may
be reused with this replacement text.** The audio was generated from the old (NIV-derived,
partially-omitted, chapter-boundary-displaced) file; this replacement has different
wording at essentially every verse, different paragraph content in any chapter where the
old file's chapter-boundary displacement bug applied (32 chapters per the audit — those
chapters' entire paragraph contents differ, not just individual words), and reads
naturally at different lengths/pacing. Reusing old audio against this text would
desynchronize immediately and often severely.

**Recommendation: ship this edition text-only until new narration is recorded against it.**
Do not set `hasAudio: true` for this edition/key until Kokoro audio (per
`books/ENGLISH_AUDIO_PIPELINE.md`) has been generated and a timing/manifest QA pass has
confirmed sync, per the existing pipeline's own gate ("Generate or regenerate audio only
after the relevant text passes QA," `books/AGENTS.md`). This is a recommendation for the
app agent to implement (setting `hasAudio: false` and any related availability flag) — no
audio/availability code has been touched by this content-only pass.
