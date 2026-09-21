# PARKED — Henry V (`henry-v`, modern-en)

**Status:** PARKED before review passes began. This is a **source-structure**
block, not a translation-quality block — the pipeline never reached step
3 (blind accessibility review) or step 4 (fidelity review).

## What's wrong

`source.json` (staged unmodified from
`app/public/data/editions/henry-v-original-en.json`) is missing the play's
opening **Prologue** — the Chorus speech beginning "O for a Muse of fire,
that would ascend / The brightest heaven of invention," one of the most
quoted passages in the play and the piece that sets up the "wooden O" /
audience-imagination framing the rest of the Chorus speeches return to.

Verification:

- Searched the full JSON text of `source.json` for `Muse of fire`,
  `brightest heaven`, `wooden O`, `swelling scene` — zero hits.
- `chapters[0]` (`Act 1, Scene 1 — London. An ante-chamber in the King's
  palace`) begins directly with `Enter the Archbishop of Canterbury and the
  Bishop of Ely.` / `CANTERBURY. My lord, I'll tell you...` — no Prologue
  content precedes it, and no separate `Prologue` chapter exists anywhere
  in the file.
- `candidate.json` (the existing `modern-en` draft) also has zero hits for
  the same search terms — the gap is inherited from the same missing
  source content, not an independent modern-en omission.
- Cross-checked the rest of the play's Chorus structure to confirm this
  isn't a parsing-convention quirk: this source attaches each act's Chorus
  prologue to the *end* of the previous act's final scene chapter (Act 2's
  Chorus is the last two paragraphs of Ch2 "Act 1, Scene 2"; Act 3's at the
  end of Ch6; Act 4's at the end of Ch13; Act 5's at the end of Ch21; the
  Epilogue at the end of Ch23). That convention is intact and internally
  consistent everywhere it applies. But there is no chapter before Ch1 for
  the opening Prologue to be attached to the end of — it is simply absent,
  not attached elsewhere.
- Confirmed this is a genuine parsing gap and not house convention for this
  edition by checking a sibling play in the same registry:
  `romeo-and-juliet-original-en.json` chapter 1 is its own `"Prologue"`
  chapter containing `Enter Chorus.` / `CHORUS. Two households, both alike
  in dignity...` / `Exit.` — i.e. this pipeline's own source parsing does
  preserve a play's opening Chorus Prologue as real content elsewhere. Henry
  V's source is missing the equivalent.
- No `books/raw/henry-v/` directory exists in this checkout to check against
  the original Gutenberg/raw text that was parsed.

## Why this stops the pipeline here rather than being patched

- The task's own step 2 instruction is explicit: verify chapter structure
  is sound; "if broken, STOP and report instead."
- This is content loss in the **locked source**, not a translation defect
  in `candidate.json` I'm authorized to repair. Filling the gap would
  require re-parsing/re-extracting the original text from a public-domain
  source and re-deriving the paragraph structure — that's original-source
  parsing work (`books/AGENTS.md` → "Source Text" / "Edition Format"), not
  content-repair/acceptance-procedure work, and it falls outside this
  task's scope (`books/wip/green-henry-v/` only, no touching
  `app/public/data/editions/*` originals or re-fetching sources).
- Inventing or reconstructing the Prologue's wording from memory would
  violate the standing rule against importing wording from another
  edition/printing of the play — a well-known passage is exactly the kind
  of thing memory-based reconstruction would get subtly wrong relative to
  the specific printed source this project uses, and doing so would not
  be "the locked source's own printed text."

## What's needed to unblock

`henry-v-original-en.json` needs the opening Prologue re-parsed from a
public-domain source (Project Gutenberg or similar) and inserted as its
own chapter (matching the `romeo-and-juliet` convention: a `Prologue`
chapter before `Act 1, Scene 1`), with `modern-en` then drafted for that
new chapter and every subsequent chapter number re-verified against
`henry-v-modern-en.json` and any threads/onboarding files that reference
chapter numbers by index. That is source-parsing work, not
content-repair work, and belongs to whoever owns
`app/public/data/editions/henry-v-*.json` edits (out of scope here).

## What was and wasn't done

- Staged `source.json` and `candidate.json` unmodified in
  `books/wip/green-henry-v/` (copies only; no originals touched).
- Verified chapter/paragraph structure otherwise: 23 chapters in both
  files, matching Act/Scene counts (1.1–1.2, 2.1–2.4, 3.1–3.7, 4.1–4.8,
  5.1–5.2), all four in-play Chorus prologues (before Acts 2–5) and the
  Epilogue chorus present and correctly attached per the source's own
  convention. No apparatus/editorial-note/scene-crosswalk chapters found.
- Did **not** run the blind accessibility review (step 3) or the fidelity
  review (step 4) — no point certifying a translation against a source
  that is itself known to be missing a chapter's worth of canonical
  content; any "full coverage" claim from this point on would be false on
  its face.
- No edits were made to `candidate.json`.
- No files outside `books/wip/green-henry-v/` were touched.

## Model note

No drafting/repair work was performed, so there is nothing to attribute
to a drafting model. This session (Claude Sonnet 5) did the structural
verification and wrote this report.
