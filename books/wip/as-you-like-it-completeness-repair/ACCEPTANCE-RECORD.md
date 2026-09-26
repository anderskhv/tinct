# Acceptance Record — As You Like It structure and completeness repair

**Status: ACCEPTED (content), ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/as-you-like-it-completeness-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate original-en sha256 | `8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358` |
| Candidate modern-en sha256 | `5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48` |
| Replaces live sha256 | original-en `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179`; modern-en `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` |
| Author (this package) | Claude, this session, 2026-09-26 |
| Independent reviewer | A separate Claude agent instance, spawned with no visibility into this package's build notes, working only from the archive.org source and the candidate/live JSON |
| Review evidence | `INDEPENDENT-REVIEW.md` (this folder) |
| Review verdict | **DO NOT ACCEPT as staged** — one real, narrow defect found (missing scene-location captions at the 4 newly-split scene boundaries). **Fixed and re-verified in this final candidate** (see below); the reviewer's other checks all passed. |

## Independent review summary and disposition

The reviewer independently downloaded the archive.org source, verified its
sha256, and independently re-derived the play's full scene structure and
Act 1 Scene 1's text before reading any of this package's own claims.

**Found and fixed:** the four scenes that had to be split out of a merged
predecessor chapter (new chapters 4, 11, 16, 19 — Act 2 Scene 1, Act 3
Scene 1, Act 4 Scene 1, Act 5 Scene 1) were each missing their short setting
caption as an opening paragraph ("The Forest of Arden", "The palace", "The
forest", "The forest"). Every other scene in the book, including the newly
restored Act 1 Scene 1, keeps this caption as its own paragraph; the
original build of this package had discarded it along with the merged
"ACT N. SCENE I." heading line it was concatenated with in the source
parse. **Fixed**: each of the four chapters now opens with its caption, in
both `original-en` and `modern-en` (927 → 931 paragraphs). Hashes,
paragraph counts, `PARAGRAPH-MAP.json` and `CHARACTER-CARD-IMPACT.json` in
this package reflect the corrected candidate. The similarity gate was
re-run after the fix and still passes (0.703 weighted, 0% LIGHT/MECHANICAL).

**Confirmed clean (reviewer's independent checks, all passed):**

- Act 1 Scene 1: verbatim against the source, complete, correctly
  attributed (47/47 paragraphs), and correctly preserves the source's own
  "not Charles, the Duke's wrestler..." transcription quirk rather than
  silently fixing it.
- The full 23-chapter act/scene structure (22 scenes + Epilogue) matches
  the reviewer's independent re-derivation exactly — no mislabeling, no
  remaining merges, no bad splits; all four splice-point boundaries
  verified line-for-line against the source with nothing dropped or
  duplicated.
- All 4 World Library notice instances and the trailing "End of this
  Etext..." line are fully removed, with no collateral damage to adjacent
  dialogue at any of the 4 removal sites.
- A full independent word-diff of the whole play found no other
  completeness defects (missing/extra/reordered text, wrong speaker).
- `modern-en` matches `original-en`'s paragraph structure 1:1 across all 23
  chapters. The reviewer sampled 7 chapters, including the restored Scene
  1 and the Touchstone/Jaques wordplay scenes, and found genuine
  sentence-level modernization, not shallow word-swapping, in all but one:
  "All the world's a stage" (new chapter 10) stays close to the source —
  defensible for a famous, tightly-constructed set-piece, and flagged only
  as a borderline case, not a defect.
- A handful of pre-existing word-level source deviations ("pulpiter" vs.
  "Jupiter" and similar) were checked and confirmed already present,
  unchanged, in the currently-served `original-en.json` — not introduced
  by this repair, out of scope for it.
- Both candidate JSON files parse cleanly.

## Open items handed to Codex

1. **Rights decision** (`RELEASE-PACKET.md` "Rights note"): whether removing
   the notice and restructuring is sufficient, or Anders wants the larger
   PG #1523/#100 re-base.
2. **Danish scope decision**: `modern-da` (17 chapters, 901 paragraphs, live)
   becomes fully chapter-misaligned once this integrates (23 chapters, 931
   paragraphs). Needs Anders' decision per `RELEASE-PACKET.md`.
3. **Character-card re-anchoring**: `CHARACTER-CARD-IMPACT.json` gives the
   bulk remap (167/166 mentions) and flags 2 phantom mentions (anchored to
   removed licence boilerplate) for deletion rather than remapping.
4. **Threads re-keying**: `app/public/data/editions/as-you-like-it-threads.json`
   needs its chapter keys re-derived per the correspondence table in
   `RELEASE-PACKET.md` — straightforward for 12 old chapters, needs editorial
   judgment for the 5 that were split.
5. **Onboarding update**: `openingChapterLabel` is now correct for the first
   time; `openingText` should be updated to quote the real Scene 1 opening.
6. **Narration cache invalidation**: essentially the whole book's chapter
   numbering changed; no audio generation was performed or requested here.

## What "accepted" does not mean

This content is accepted for integration. It is not published, not live,
not deployed. Codex owns registry/character-card/threads/onboarding
integration, the rights and Danish-scope decisions above, app verification,
and the serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
