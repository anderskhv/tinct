# Fidelity Review 1 — The Winter's Tale (`winters-tale`), modern-en

Reviewer: independent fidelity pass against locked `source.json` (this
session, acting as Reviewer B per `books/prompts/fidelity-review-prompt.md`).
Source edition (fidelity anchor): `app/public/data/editions/winters-tale-original-en.json`,
staged unmodified as `books/wip/green-winters-tale/source.json`.

## Coverage statement

Full non-sampled coverage of all 15 chapters / 911 paragraphs, done in two
layers:

1. **Full sequential read of the candidate**, chapter by chapter, in
   reading order with neighboring context always visible (the accessibility
   pass above covers the candidate-only read of the same text).
2. **Source-vs-candidate comparison**, done as:
   - A **complete structural pass**: every chapter's paragraph count,
     order, and chapter numbering checked programmatically against source
     (911/911 paragraphs, 15/15 chapters, exact 1:1 match, no
     merges/splits/reorders).
   - A **complete word-count-ratio tripwire pass** across all 911
     paragraphs (`content_edit_helpers.word_count_ratios`) — only 2
     paragraphs flagged outside [0.7, 1.6], both inspected and found to be
     natural short-line compression with no content loss (ch1 p4 "Beseech
     you—" → "Please—"; ch2 p66 "Didst perceive it?" → "Did you pick up on
     that?").
   - A **complete case-sensitive proper-noun occurrence sweep**: every
     major character/place name (Leontes, Hermione, Polixenes, Mamillius,
     Perdita, Florizel, Camillo, Paulina, Antigonus, Autolycus, Sicilia,
     Bohemia, Delphos, Apollo, Julio Romano, Smalus, Dorcas, Mopsa, Emilia,
     Archidamus, Cleomenes, Dion, Rogero, Taleporter, plus the mythological
     names in Perdita's flower speech) counted case-insensitively in both
     files; every count matched except one genuine defect (below). All
     speaker tags (the ALL-CAPS form) enumerated and cross-checked: source
     and candidate speaker-tag sets match exactly, including the joint tag
     "CLEOMENES, DION" and the plural stage-direction tag "LORDS" — no
     case-mismatch (a name fixed in mixed case but left wrong in the
     all-caps speaker-tag form, or vice versa) found anywhere in the book.
   - **Targeted word-for-word scrutiny**, as instructed, of: the whole of
     Leontes's jealous-rage speeches (Act 1 Sc.2, paras 39–56, 76–98; Act 2
     Sc.1, paras 26–62), and the whole of the trial scene (Act 3 Sc.2,
     paras 1–54) — every paragraph in these ranges read source-against-
     candidate line by line.
   - **Targeted checks** for the specific risks named in the task: the
     bear stage direction and mauling report (ch8 paras 8–33), sexual/bawdy
     content (Autolycus's peddler patter ch12 para 47, "dildos and
     fadings"), the malapropism/dialect comic business (the "saltiers"
     line ch12 para 109, the "advocate"/"pheasant" pun ch12 paras 255–258,
     the Clown's counting/shopping-list arithmetic ch11 paras 9 and 12,
     all numeric ages ch8 para 13 and ch12 para 154), and Antigonus's ghost
     speech (ch8 para 8).
   - A **random-sample spot audit** of 3 additional paragraphs each from
     the seven chapters not covered by the targeted ranges above (chapters
     3, 4, 5, 10, 13, 14, 15), each checked word-for-word against source.

No paragraph in the book was left entirely unchecked: every paragraph
passed the structural/ratio/proper-noun automated sweeps, and the
highest-risk material (rage, trial, violence, bawdy content, dialect/
malapropism, numbers) received full manual word-for-word comparison.

## Defects found

### Blocking (fixed this round)

1. **[Act 1 Sc.2 / chapter 2, paragraph 118] — unlicensed naming of a
   figure the source deliberately leaves unnamed.**
   - Source: "...my name / Be yok'd with **his** that did betray the
     Best!" (Polixenes, swearing an oath, alludes to Judas without naming
     him — deliberate indirection, typical of the play's oath rhetoric.)
   - Candidate (before fix): "...my name be yoked with **Judas's** that
     betrayed the Best!"
   - Problem: this names a figure the source's own wording leaves
     unnamed/allusive — the exact pattern flagged as forbidden by standing
     instruction 3 ("Never let an accessibility gloss NAME a figure/fact
     the source deliberately leaves unnamed or ambiguous"). A general
     reader will still recognize the allusion to Judas from "betrayed the
     Best" without the name being spelled out, exactly as the source
     intends.
   - Fix applied: restored "his that betrayed the Best," matching source's
     own indirection exactly.

2. **[Act 1 Sc.2 / chapter 2, paragraph 43] — unlicensed addition of an
   image/detail not in the source at this point.**
   - Source ends this speech: "...and that to the infection of my brains /
     And hardening of my brows." (no literal mention of "cuckold" or
     "horns" in this particular paragraph — the image is only "hardening
     of my brows.")
   - Candidate (before fix): "...and it sickens my brain and stiffens my
     brow **with the horns of a cuckold**."
   - Problem: this adds a specific image/claim ("the horns of a cuckold")
     that is not licensed by this source paragraph. The cuckold-horns motif
     is genuinely present elsewhere in the play (e.g. paras 56, 80), but
     inventing it here, where the source instead uses the more oblique
     "hardening of my brows," is an addition per the fidelity checklist
     ("is there any claim, image, or detail in the candidate that is not
     licensed by the source").
   - Fix applied: removed the added clause; candidate now ends "...and it
     sickens my brain and stiffens my brow," matching source's own
     (slightly more oblique) image.

Both fixes applied via `content_edit_helpers.safe_replace`; `diff_report`
and `assert_only_changed` confirmed only paragraphs [2][43] and [2][118]
changed, and `validate_structure` confirmed paragraph count/order/chapter
numbering unchanged after the edit. Both edited paragraphs were
independently re-read against source with full neighboring-paragraph
context after the fix (see round-2 whole-book re-read below) and confirmed
correct.

### Non-blocking notes

- **[Act 4 Sc.1 / chapter 9, paragraph 1]** ("that makes and unfolds
  error") is rendered "who makes errors and unmakes them." Source's
  "unfolds" (reveals/discloses an error already made) is rendered as
  "unmakes" (undoes/corrects it) — a subtle shift in the verb's exact
  sense. Judged non-blocking: the overall meaning of Time as an
  all-seeing, all-revealing force is preserved, the surrounding clauses
  make Time's role as truth-revealer clear regardless, and this is a
  single-word nuance in one already-difficult abstract verse speech, not a
  claim, actor, or plot fact getting changed. Left as-is; flagging for the
  record per the "non-blocking needs a reader-centered reason" rule.
- Several vulgar/frank terms are modernized to a different but equally
  frank synonym rather than kept as the exact period word (e.g. "strumpet"
  → "whore," "harlot" → "whore," "hogshead" → "barrel"). This is
  modernization working as intended, not softening — the register and
  force of the insult/detail is preserved or, if anything, made more
  bluntly legible to a modern reader. Not a defect.

## Whole-chapter / whole-book re-read (round 2, cross-boundary)

After applying the two fixes, the full book was re-read once more end to
end (both a fresh candidate-only pass and a source-comparison pass),
looking specifically for: relationships and recurring terms/images that
cross paragraph or scene boundaries (the cuckold-horns motif across chs
1–2; the "bastard"/"changeling" terminology from Act 2 through Act 5; the
oracle/Apollo thread from Act 2 Sc.1 through Act 5 Sc.3; the statue/"old
tale" framing across Act 5 Scenes 2–3); and a dedicated sweep for any
further instance of silently-corrected wording (checked both mixed-case
and ALL-CAPS forms of every proper noun a second time post-fix — no new
mismatches) or softened frank/violent content (re-confirmed the bear
mauling, the trial's "adulteress"/"bastard" language, and the sexual
content in the peddler scene are all still present and unsoftened in the
final file). No further defects found.

## Verdict

**ACCEPT WITH FIXES REQUIRED** (both listed fixes applied and independently
re-verified against source in the final file — see `ACCEPTANCE-RECORD.md`
for the pinned hash).
