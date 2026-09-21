# Acceptance Record — The Winter's Tale (`winters-tale`), modern-en

**Status: ACCEPTED**

**File covered:** `books/wip/green-winters-tale/candidate.json` (final
state, after round-1 fixes and round-2 independent re-verification)

**sha256:** `4c6ee62fec2b1c65230f378574a7c5b6551169e5824e1c9e012fbdea10f6da3d`

**Date:** 2026-09-21

**Model/settings note:** This pass (drafting was already present in the
live `winters-tale-modern-en.json`; this session performed acceptance-
procedure review and repair only) used Sonnet (this session) for review
and repair. **Independent verification:** Claude Opus (model id
`claude-opus-5`) — re-derived both round-1 fixes from source, ran a
location-level (not count-only) case-form check on 41 proper nouns,
did its own word-for-word reads of the bear scene, trial scene, and
peddler scene, spot-checked 18 further paragraphs, and independently
verified the full 911-paragraph structure. Verdict: VERIFIED, no
further changes needed.

## Source structure verification (step 1–2)

- 15 chapters in both `source.json`/`original-en` and `candidate.json`/
  `modern-en`, each a real act/scene (Act 1 Sc.1 through Act 5 Sc.3), not
  apparatus. Apparatus-pattern scan (`Pope|Rowe|Hanmer|Capell|Collier|Ff|
  F1-F4|conj.|om.|SCENA|] SCENE`) found one hit in both editions
  (chapter 9, "Act 4, Scene 1," 3 paragraphs) — manually inspected and
  confirmed genuine reading content (Time's Chorus speech, a
  deliberately short scene in the source play itself), not a stub.
- 911/911 paragraphs total, exact 1:1 count and order match per chapter,
  no merges/splits/reorders, no empty/whitespace-only paragraphs.

## Coverage table

| Step | What | Result |
|---|---|---|
| A. Accessibility review | Full candidate-only blind read, all 15 chapters / 911 paragraphs | `accessibility-review-1.md` — substantially accessible, no blocking issues |
| B. Fidelity review (packets + targeted scrutiny) | Full structural/ratio/proper-noun automated sweep (911/911 paragraphs) + full word-for-word read of Leontes's rage speeches and the entire trial scene + targeted checks on bear scene, bawdy content, dialect/malapropisms, numeric facts + random-sample audit of remaining chapters | `fidelity-review-1.md` — 2 blocking defects found |
| C. Whole-book cross-boundary re-read | Full re-read after fixes: candidate-only pass + source-comparison pass, recurring-motif check, dedicated case-sensitivity name sweep repeated | No further defects found |
| D. Verify in final file, pin hash | Fixes applied via `safe_replace`; `diff_report`/`assert_only_changed` confirmed only the 2 intended paragraphs changed; `validate_structure` re-run; hash computed on final file | Complete — see hash above |

## Defect counts by round

- **Round 1 (initial fidelity pass):** 2 blocking defects found and fixed.
  1. `[ch2, p118]` — unlicensed naming: candidate said "Judas's" where
     source deliberately says only "his that did betray the Best" (an
     unnamed allusion). Fixed to restore source's own indirection.
  2. `[ch2, p43]` — unlicensed addition: candidate appended "with the
     horns of a cuckold," an image not present in this source paragraph
     (source ends on the more oblique "hardening of my brows"). Fixed by
     removing the added clause.
  0 accessibility defects found (accessibility pass returned no blocking
  items).
- **Round 2 (post-fix whole-book re-read):** 0 new defects found. Both
  fixed paragraphs independently re-verified against source with
  neighboring context; case-sensitive proper-noun sweep re-run clean
  across the whole book (no mismatches for any of ~35 tracked names,
  including all ALL-CAPS speaker tags).
- **Round 3:** not needed — book cleared in 2 rounds.

## Deliberately preserved, non-blocking items (reader-centered reasons)

- **`[ch9, p1]`** "that makes and unfolds error" rendered as "who makes
  errors and unmakes them" — a subtle shift in one verb's exact sense
  within Time's single dense allegorical speech. Left as-is: the
  surrounding clauses already establish Time as the force that reveals
  truth, so the overall meaning a reader takes from the passage is
  unaffected, and this is one word inside the single hardest speech in
  the play, not a plot fact, actor, or claim.
- **Vulgar-term substitutions** ("strumpet"/"harlot" → "whore," "hogshead"
  → "barrel") — kept as legitimate modernization. The insults and period
  detail keep their full force and specificity; a modern reader gets an
  equally frank, equally legible word, not a softened one. Not treated as
  a defect because the standing instruction against softening is about
  content being diluted, not about a period-specific synonym being
  replaced with a contemporary one of equal or greater bluntness.
- **Deliberate malapropisms/dialect** ("saltiers" for satyrs, the
  "advocate"/"pheasant" pun, "hodgepodge of capers") — left uncorrected,
  matching source exactly, because "correcting" them would erase the
  comedy the source is built on; this is the exact failure pattern this
  batch has hit repeatedly on other books, checked here with a dedicated
  full-book pass and found clean.
- **Untranslated period/technical vocabulary** ("distaff," "Dame
  Partlet," "tod" of wool) — left as the source's own words because they
  are either glossed in-line by surrounding context (the sheep-counting
  math for "tod") or their comic/functional meaning is recoverable from
  context without the specific reference being known (distaff as a
  women's-weapon joke, Partlet as a hen-name in a henpecked-husband
  joke). Flagged in the accessibility review but not treated as
  blocking.
- **Mythological allusions kept as proper nouns** (Proserpina, Dis,
  Cytherea, Phoebus, Deucalion, etc. in Perdita's flower speech and
  elsewhere) — these are the source's own classical references, assumed
  by the play itself; replacing or glossing them would go beyond
  clarifying essential terms into interpreting/annotating content the
  source presents as allusive without explanation.

## Content preserved as intended (explicit check per task instructions)

- "Exit, pursued by a bear." — preserved verbatim (`[ch8, p11]`).
- Leontes's paranoid, cruel language toward Hermione throughout Act 1
  Sc.2, Act 2 Sc.1, and the Act 3 Sc.2 trial — not softened; "adulteress,"
  "bastard," "whore" (via modernized "strumpet"/"harlot"), and the full
  force of his accusations are all present and were given word-for-word
  scrutiny.
- Mamillius's offstage death and the report of it (`[ch7, p35-38]`) —
  preserved without euphemism.
- The sheep-shearing scene's wordplay, songs, and bawdy peddler patter
  (`[ch11]`, `[ch12]`) — checked and confirmed not cleaned up.

## Conclusion

**ACCEPTED — sha256 4c6ee62fec2b1c65230f378574a7c5b6551169e5824e1c9e012fbdea10f6da3d**

Ready for an independent Opus verification pass per the second-batch
process. No app, registry, deploy, or audio changes were made as part of
this work — this record covers only the staged files in
`books/wip/green-winters-tale/`.
