# Acceptance Record — Coriolanus (`coriolanus`, modern-en)

**Book id:** `coriolanus`
**Edition:** `modern-en`
**Accepted:** 2026-09-21
**Drafting/repair pass — round 1 review and fix:** Claude Sonnet 5 (model
id `claude-sonnet-5`).
**Independent verification:** Not yet run. This record covers Sonnet's
own review-and-fix pass only; a separate independent Opus verification
pass is expected to follow before this text is treated as fully cleared,
per the dispatching task's instructions.

**Staged files:**
- `books/wip/green-coriolanus/source.json` — copied unmodified from
  `app/public/data/editions/coriolanus-original-en.json`. Never edited.
- `books/wip/green-coriolanus/candidate.json` — copied from
  `app/public/data/editions/coriolanus-modern-en.json`, then corrected in
  this round (one paragraph; see below).

**Final file hash (candidate.json, sha256):**
`daabd24d383433a8d906801698ba74b133e2f950316c57b21fb3ae8a50ab5e13`

This hash is pinned to the file's state *after* the round-1 fix and
*after* that fix was re-verified against `source.json` and structurally
validated — per `TRANSLATION_PROTOCOL.md`'s pin-to-hash requirement.

Source hash (unmodified copy, for reference):
`d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`

No app, registry, audio, or deploy action was taken at any point. This
directory only.

---

## Structure (verified)

- 29 chapters (Act 1 Sc.1–10, Act 2 Sc.1–3, Act 3 Sc.1–3, Act 4 Sc.1–7,
  Act 5 Sc.1–6), all real act/scene units — no apparatus, editorial-note,
  transcriber's-note, or scene-crosswalk chapters.
- Chapter titles are reader-facing `Act N, Scene M — location` form,
  matching source exactly, no apparatus fragments.
- 1,379 paragraphs total in both source and candidate; exact per-chapter
  paragraph-count match (verified per-chapter via
  `content_edit_helpers.validate_structure` for all 29 chapters); no
  paragraph merged, split, reordered, or invented.
- No empty or whitespace-only paragraph on either side.
- Apparatus scan (Cambridge/Gutenberg pattern regex) run on both source
  and candidate: 0 apparatus/stub suspects in either.

## Coverage table

| Step | What was done | Coverage |
|---|---|---|
| A. Accessibility (blind) | Full read of `candidate.json` only, no source seen; see `accessibility-review-1.md` | 29/29 chapters, 1,379/1,379 paragraphs, full read not sampled |
| B. Fidelity (source-anchored, in-context packets) | Full paragraph-by-paragraph comparison against `source.json`, chapter-by-chapter (every chapter read whole, in order, as its own fully-contextualized packet); plus targeted whole-book automated sweeps (case-sensitive name/term occurrence diff, speaker-tag set diff, per-paragraph name-by-name occurrence diff, lowercase-proper-noun collision sweep); see `fidelity-review-1.md` | 29/29 chapters, 1,379/1,379 paragraphs |
| C. Whole-book cross-boundary re-read | Full re-read of the entire book against source after the fix, focused on recurring epithets/relationships across scene boundaries; see `fidelity-review-1.md` "Whole-book cross-boundary re-read" | 29/29 chapters |
| D. Verify in final file + pin hash | Fixed paragraph re-derived from `source.json` directly after edit; `validate_structure` re-run per-chapter; `diff_report` confirmed only the one intended paragraph changed | 1/1 fixed paragraph re-verified |

## Defects found and fixed (Round 1 — the only round needed)

**1 paragraph corrected, 1 defect: imported scholarly-edition emendation
replacing source's own printed text.**

- **Ch25 (Act 5, Scene 2), paragraph index 30 (0-based).** Source's line
  — a well-known textual crux — reads: *"Another word, Menenius, I will
  not hear thee speak."* The candidate had silently added the word "Not"
  (*"Not another word, Menenius..."*), which is not in the locked source's
  printed text. That exact insertion matches a specific scholarly
  emendation used by some published editions to resolve the line's
  genuine ambiguity — exactly the "imported wording from another
  edition/scholarly emendation instead of the locked source's own printed
  text" defect class this batch has repeatedly hit. Fixed by removing the
  invented "Not" via `content_edit_helpers.safe_replace`, restoring
  source's own two-clause structure without resolving its ambiguity.
  Verified via `validate_structure` (before/after) and `diff_report`:
  exactly paragraph index 30 changed in the 43-paragraph chapter; nothing
  else touched.

No other defects found anywhere in the book. See `fidelity-review-1.md`
for the full "no other defects found" checklist (class-contempt language
integrity, proper-noun/epithet consistency, speaker-tag consistency,
malapropism preservation, no actor-misattribution/negation-flip/
causality-reversal/omission/addition in any major set-piece speech).

## Independent re-verification of the fix

The corrected paragraph was re-read directly against `source.json` after
the edit (full text comparison recorded in `fidelity-review-1.md`,
"Findings" section). It matches source's structure and content exactly,
without importing the editorial "Not." `diff_report` confirmed the edit
touched exactly one paragraph (Ch25, index 30) and no others; per-chapter
`validate_structure` confirmed no structural regression anywhere in the
29-chapter book after the edit.

## Deliberately preserved, non-blocking items (with reader-centered reasons)

- **Dense, unbroken classical-allusion speeches kept as single long
  paragraphs** (e.g. Cominius's battle narration, Ch12 ¶27; Aufidius's
  jealousy monologue, Ch23 ¶7; Volumnia's two persuasion speeches, Ch15
  ¶28 and Ch26 ¶36/¶41). Flagged in the accessibility review as dense but
  not split or trimmed — source itself presents these as single
  continuous speeches, and the play's rhetorical structure (one
  uninterrupted eulogy, one uninterrupted plea) depends on that
  continuity; splitting or condensing would misrepresent the source's own
  form, not just modernize its vocabulary.
- **Unglossed classical/legendary allusions** (the Penelope reference,
  Ch3 ¶33; "this Triton of the minnows," Ch14 ¶53; the implication about
  Coriolanus's Volscian mother, Ch26 ¶45). Source itself does not explain
  these; per this batch's carried-forward rule, an accessibility gloss may
  only define a term/reference already explicit in the source's own
  words — inventing background here would exceed that license.
- **Deliberately odd/mangled diction preserved as-is** ("directitude,"
  "empiricutic," "Jack guardant," the servingmen's coinages in Ch21;
  malapropisms and non-standard usages throughout the citizen/servant
  prose scenes). These are the source's own deliberate character voice,
  not translation errors, and "correcting" them to plain modern English
  would be exactly the erasure-of-deliberate-non-standard-wording defect
  this batch has been warned against.
- **`VOLSCE` → `VOLSCIAN` speaker-tag expansion (Act 4, Scene 3, 20
  occurrences).** This is a demonym/role tag (not a personal proper noun
  or a fixed character epithet) spelled out consistently and completely
  throughout its one scene of use; kept as a legitimate, uniform
  speaker-tag modernization rather than reverted, since it does not touch
  any character's name or introduce inconsistency (verified: no
  occurrence left in abbreviated form anywhere in the scene).

## Class-language integrity (explicit check, per task instruction)

Coriolanus's contemptuous class-based language toward the plebeians and
the tribunes'/citizens' political argument for the people's power were
checked as a distinct pass across the whole book (see `fidelity-review-1
.md` for full detail). Confirmed unsoftened and unglossed throughout,
including:

- Ch1 ¶51/¶53: "you dissentious rogues... make yourselves scabs," "you
  curs, that like nor peace nor war"
- Ch14 ¶44: "the mutable, rank-scented many" → "the changeable,
  foul-smelling many" (full modernization, not a euphemism or drop)
- Ch16 ¶62: "You common cry of curs, whose breath I hate / As reek o' th'
  rotten fens, whose loves I prize / As the dead carcasses of unburied
  men / That do corrupt my air, I banish you!" — kept in full, with its
  most graphic image intact
- Ch13, Ch14, Ch16: the tribunes' and citizens' arguments about the
  people's power, the "many-headed multitude" characterization, and the
  citizens' own self-aware "monstrous members" reasoning (Ch13 ¶3) all
  preserved as frank political argument, not hedged or summarized.

## Model/settings note

This entire review-and-fix pass (structural verification, accessibility
review, fidelity review, the one fix, and the whole-book re-read) was
performed by Claude Sonnet 5 (model id `claude-sonnet-5`) in a single
dispatch. No paid Anthropic API calls were made; all review and drafting
work was done through this CLI conversation, consistent with the
project's zero-API-spend rule. No independent (different-model) adversarial
verification pass has been run yet on this book — that is expected to
follow as a separate pass per the dispatching task.
