# Acceptance Record — The Tempest (`the-tempest`, modern-en)

**Book id:** `the-tempest`
**Edition:** `modern-en`
**Accepted (round 1, pending independent verification):** 2026-09-21

**Model note.**
- Round 1 (blind accessibility review, fidelity review, fixes, whole-book
  re-read, this record): **Claude Sonnet 5** (`claude-sonnet-5`). Artifacts:
  `accessibility-review-1.md`, `fidelity-review-1.md`.
- No independent adversarial round has run yet. Per this task's
  instructions, a separate Opus verification pass runs after this dispatch
  and will produce its own record (`RELEASE-PACKET.md` and
  `accepted-paragraph-hashes.tsv` are intentionally NOT written here —
  they are that pass's responsibility).

**Staged files:** `books/wip/green-the-tempest/source.json` (unmodified,
locked, never edited), `books/wip/green-the-tempest/candidate.json` (round-1
corrections applied), `books/wip/green-the-tempest/candidate_readable.txt`
and `source_readable.txt` (linear dumps used for the paragraph-by-paragraph
read; **not regenerated after the fixes** — the fix locations and exact
wording are recorded in `fidelity-review-1.md`'s table instead; an
independent verifier should re-derive fresh dumps from the final
`candidate.json` rather than trust these).

**Final file hash (candidate.json, sha256):**
`14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`

This is pinned to `candidate.json`'s state after all 14 round-1 fixes and
after each fix was independently re-verified against `source.json`
directly (not just against its own stated rationale) — see
`fidelity-review-1.md` for the full defect table and verification method.

No app, registry, audio, or deploy action was taken. This directory only.
No paid API calls.

---

## Source completeness check (done first, per task instructions)

Given this batch's recent history of two structurally-incomplete sources
(Henry V's missing Prologue, Macbeth's two missing soliloquies), `source.json`
was spot-checked against six of the play's best-known passages before any
review work began:

- Prospero's "Our revels now are ended" (Ch8) — present.
- Caliban's "This island's mine" (Ch2 ¶105, 1-based) — present.
- Ariel's "Come unto these yellow sands" and "Full fathom five" songs (Ch2)
  — both present in full.
- Miranda's "O brave new world" (Ch9 ¶47) — present.
- "The red plague rid you" (Ch2 ¶109) — present.
- "Setebos" (Ch2 ¶113 and Ch9 ¶76) — present.

Source is structurally complete. No structural-skip.

## Structure

- 10 chapters in both files, all real Act/Scene reading units: Act 1
  Sc.1–2, Act 2 Sc.1–2, Act 3 Sc.1–3, Act 4 Sc.1, Act 5 Sc.1, Epilogue. No
  apparatus, editorial-note, collation, or scene-crosswalk chapters; titles
  are all reader-facing ("Act 2, Scene 3 — ...").
- Chapter `number` sequence and `title` strings identical between source
  and candidate.
- Per-chapter paragraph counts identical, chapter by chapter: 43, 175, 170,
  58, 29, 74, 39, 98, 102, 2 — **790 paragraphs total in both files**,
  order locked, no empty or whitespace-only paragraph on either side.
- JSON valid (`python3 -m json.tool`) for both `source.json` and
  `candidate.json`.

## Methodology

Full detail is in `fidelity-review-1.md`. Summary:

1. Every one of 790 paragraph pairs read in full, source against candidate,
   no sampling (both files dumped to linear readable text and read start
   to finish by chapter).
2. A verbal-tic audit built fresh from the actual read, not inherited from
   any prior book's defect list (this is the first pass on this book):
   Caliban's cursing register, his drinking-song self-naming stutter,
   Stephano/Trinculo's drunk banter, and Ariel's songs were each checked
   for every occurrence of a repeated marker.
3. A charged/crude-word grep run fresh against the source (filth, vile,
   abhorred, loathsome, villain, wretch, malice, scum, knave, traitor,
   coward, dog, cur, monstrous, whore, wench, unstanched, piss, damn, hell,
   devil, bastard, whoreson, pox, murrain), every hit checked against the
   candidate's matching paragraph.
4. A full capitalized-token cross-reference (Python `Counter` diff) between
   source and candidate to catch dropped proper nouns; every genuine name
   on the resulting list (as opposed to expected archaic-verb noise like
   "Thou"/"Dost") checked in context.
5. An exclamation-mark count diff across all 790 paragraphs; every
   paragraph where the candidate's count was lower than source's was
   individually re-read (all confirmed as legitimate restructuring, not
   lost emphasis).
6. A second full-book re-read after the first fix round, specifically to
   find what the above, list-based checks would structurally miss — this
   is what surfaced the Hymen/Phoebus name drops and the "My mistress" →
   "My mother" silent correction (items not on any prior list, since none
   existed).

## Defects found and fixed (round 1)

14 fixes across 5 chapters. Full table with source/before/after text is in
`fidelity-review-1.md`. Defect classes:

| Class | Count | Examples |
|---|---|---|
| Erasure of a crude/charged word | 3 | "whoreson" dropped; "whores" → "scoundrels"; "malice" (vocative insult) dropped |
| Register-softening (bawdy/crude image replaced with a neutral one) | 2 | "unstanched wench" → "leaked like a sieve"; "horse-piss" → "horse urine" |
| Dropped specific adjective/noun (curse/disease made generic) | 2 | "red plague" → "plague"; "dropsy" → "plague" |
| Dropped image breaking joke coherence | 1 | "an apple"/"kernels" (Antonio's island-in-a-pocket joke) generalized to "a present"/"seeds," breaking the apple→kernel logic |
| Malapropism/deliberate-mangling erasure | 1 | Caliban's drunken self-naming stutter "Cacaliban" flattened to plain "Caliban" |
| Silent "correction" of source's own printed form | 1 | "My mistress" (a well-known editorial crux) silently corrected to "My mother" |
| Meaning alteration | 1 | "Mars's hot minion" (passionate favorite) mistranslated as "hot-tempered mistress" (invents a temper trait) |
| Dropped mythological proper noun | 3 | Hymen (×2), Phoebus — all in the Act 4 masque, where every other deity (Iris, Ceres, Juno, Venus, Cupid, Mars, Dis, Jove) is named |

Verification per fix: `content_edit_helpers.safe_replace()` for every
change; `validate_structure()` after each round; `assert_only_changed()`
confirming each round touched exactly its intended paragraph indices and
nothing else; every fixed paragraph independently re-read against
`source.json` directly after writing it, not just checked against its own
stated rationale.

## Deliberately non-blocking items (reader-centered reasoning)

- **Argier → Algiers, still-vex'd Bermoothes → ever-stormy Bermudas.**
  Both are the source's own archaic spellings of real, identifiable
  present-day places, used consistently; modernized the same way "thou" is
  modernized to "you," not corrected as if an error. No image, claim, or
  distinguishing word is lost — unlike the fixed defects above (red
  plague, dropsy, Hymen, "My mistress"), nothing here is a specific
  detail the text depends on.
- **"Poor-John" → "dried cod."** A period-specific cheap-fish term
  translated to a comparably cheap, recognizable fish name; preserves
  Trinculo's joke without requiring period fishmongering knowledge.
- **"flesh-fly blow my mouth" → "let flies crawl in my mouth" (Ch5 ¶15).**
  Drops the specific carrion/egg-laying entomological detail but keeps the
  core meaning (Ferdinand would rather suffer this than dishonor Miranda);
  the technical specificity is inessential to the claim being made.
- **"pox"/"murrain" occasionally rendered as a different period curse of
  equal force** (e.g. "pox" → "plague" at one Stephano line). Judged
  non-blocking where no specific claim/detail is lost, as distinct from
  the red-plague/dropsy cases (fixed) where a *precisely-once-used*
  distinguishing adjective or disease name was generalized away.
- **Nautical commands simplified** (Ch1: "lay her a-hold" → "hold her
  steady," etc.). Jacobean seamanship jargon with no modern-reader
  meaning even glossed; the dramatic content (crew fighting the storm) is
  fully preserved.

## Accessibility review

No blocking issues found. `accessibility-review-1.md` documents the full
blind read and two non-blocking soft notes (Prospero's long Act 1 Sc.2
narration is inherently dense — a structural feature of the source, not a
rendering defect; the masque scene names several classical figures without
inline glosses, consistent with not inventing interpretation the source
doesn't supply).

## Verdict

**READY FOR INDEPENDENT VERIFICATION.**

Final `candidate.json` sha256:
`14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`

This is round 1 only. Per task instructions, a separate independent Opus
verification pass follows and will either confirm this acceptance (and
produce `RELEASE-PACKET.md` / `accepted-paragraph-hashes.tsv`), or find
further defects, in which case standard correction-round tracking applies
per `SECOND-BATCH-TRACKER.md`'s process notes.
