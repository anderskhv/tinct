# Acceptance Record — Paradise Lost, front matter restoration (English)

**Status: ACCEPTED (English editions), ready for Codex integration. Not
published.** Danish (`modern-da`) front matter translation is a separate,
follow-up package (in progress).

| Item | Value |
|---|---|
| Package | `books/wip/paradise-lost-frontmatter-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| `original-en` sha256 | `1ef6b3667859b7d4e5bd7c9e615880395687fb3b4df67a1dd9829f3adcd9398c` (12 chapters, 1202 paragraphs, was 1188) |
| `modern-en` sha256 | `32e8c716ccc80f93df1aa4761718642f9c86997682fb4af0a55ec0c8ed1bde32` (12 chapters, 1202 paragraphs) |
| Replaces live sha256 | to be recorded by Codex from `app/public/data/editions/paradise-lost-{original,modern}-en.json` at integration time |
| Independent reviewer | A separate Claude agent instance, verdict formed before reading `CHANGELOG.json` or any release notes |
| Review verdict | **ACCEPT — no defects found** |

## What this restores

Confirmed audit findings G10-paradise-lost-01 (Milton's 12 prose
"Arguments," ~2,399 words) and G10-paradise-lost-02 (Milton's prefatory
note "The Verse," ~236 words) — both genuine Milton content, missing from
all editions.

## Independent review summary

Confirmed both files valid JSON, 12 chapters, identical per-chapter
paragraph counts in both editions (76, 91, 93, 125, 103, 95, 73, 77, 157,
123, 111, 78). Programmatically diffed the tail of every chapter against
the live files: 100% byte-identical, zero drift in the actual poem text,
correctly shifted to new indices. Independently re-fetched both sources
(Standard Ebooks for the Arguments, Wikisource for "The Verse") and
confirmed all 12 Arguments match verbatim in `original-en`; "The Verse"
matches in full content (only trivial typographic differences —
curly/straight quotes, case — consistent with this file's existing
style). Read all 12 modernized Arguments and both Verse paragraphs in
`modern-en` in full: character-length ratios 0.95-1.17, every plot point
and causal clause preserved, no summarization, no invented content.
Confirmed chapter 1 reads, in order: "The Verse" (2 paragraphs) → Book
1's Argument (1 paragraph) → the unchanged original opening line, in
both editions. All 12 chapter titles unchanged.

## Structural note

Content was prepended within each existing Book chapter (Arguments) and
at the start of chapter 1 ("The Verse"), rather than creating a new
leading chapter — this avoids renumbering all 12 Books and breaking
existing audio/highlight/character-card coordinates for a single small
prefatory note. Every pre-existing paragraph shifted to a new index
within its own chapter; no chapter was added, removed, or renumbered.

## Disposition (per this project's front-matter-vs-principal-text distinction)

Both the Arguments and "The Verse" are genuine Milton content restored to
completeness, not merely optional decoration — but they occupy different
positions on the front-matter/principal-text spectrum:
- **The 12 Arguments** function as reading content (chapter-opening plot
  summaries), analogous to how other classic editions on this platform
  present chapter synopses. Their absence is a more clearly a
  completeness gap.
- **"The Verse"** is more clearly paratext — a short prefatory essay
  about poetic form, not narrative content. Its absence, while now
  fixed, was the more purely optional of the two; it does not by itself
  justify withholding the book's visibility, and its restoration here is
  a completeness improvement, not the resolution of a blocking defect.

## Character-card / threads note for Codex

This changes every chapter's paragraph indices (by 1 for chapters 2-12,
by 3 for chapter 1). `CHANGELOG.json` (this folder) gives the exact
per-chapter insertion counts needed to shift any existing
character-card/threads coordinate data by the corresponding offset.

## What "accepted" does not mean

Accepted for integration (English editions); not published, not live.
Danish translation of the same new content is a separate follow-up
package. Codex owns integration, coordinate-shift application to
character-card/threads data, and the serialized release process per
`books/BOOK-TASK-WORKFLOW.md`.
