# Fidelity Review 1 — Coriolanus (`coriolanus`, modern-en)

**Reviewer role:** Reviewer B (fidelity, source-anchored, not the
drafter's self-check).
**Fidelity anchor:** `books/wip/green-coriolanus/source.json` (locked,
unmodified copy of `app/public/data/editions/coriolanus-original-en.json`).
**Coverage:** All 29 chapters, all 1,379 paragraphs, compared
paragraph-by-paragraph against source, in full — not sampled, not limited
to gate-flagged spots. Read chapter-by-chapter (each chapter is its own
packet with full neighbouring context, since every chapter here is
short-to-medium and read start to finish in one pass) rather than in
artificial 5–10 paragraph slices; every paragraph was individually
compared, in order, within its chapter.

Special attention, per task instruction, to: Coriolanus's class-contempt
language toward the plebeians ("scabs," "curs," "rabble," "you common cry
of curs," "the mutable, rank-scented many") and the tribunes'/citizens'
political rhetoric for the people's power — checked that none of this is
softened, euphemized, or diluted.

## Method

For every paragraph: checked actors (who does/says what), negation,
causality, certainty/hedging, conditions, omissions, additions, silent
name/spelling "corrections," and unmodernized quotations, per the fidelity
checklist in `TRANSLATION_PROTOCOL.md`. In addition, given this batch's
documented recurring failure class, ran targeted automated sweeps
(reported below) for:

- Case-sensitive occurrence-count drift on every named character, place,
  and the key class-language terms (scab(s), cur(s), dog(s), rabble,
  rogue(s), multitude, tribune(s), patrician(s), plebeian(s), citizen(s))
  between source and candidate, whole-book.
- All-caps speaker-tag sets (source vs. candidate) — catches the
  case-sensitivity gap that slipped through in this batch's Bacchae/
  Twelfth Night rounds.
- A per-paragraph, name-by-name occurrence-count diff for every major
  proper noun (Martius, Marcius, Coriolanus, Aufidius, Menenius, Sicinius,
  Brutus, Volumnia, Virgilia, Valeria, Cominius, Lartius, Tullus, Nicanor,
  Adrian, Corioles, Antium, Rome, and the classical-allusion names) to
  catch a localized swap or drop that an aggregate count would hide.
- A lowercase-collision sweep: does the candidate ever render a proper
  noun in lowercase where source's own form (at the same paragraph) is
  capitalized.

## Findings

### 1 blocking defect found and fixed

**Ch25 (Act 5, Scene 2) ¶30 — imported scholarly emendation, not source's
own printed text.**

- Source: *"And would have sent it. **Another word**, Menenius, I will not
  hear thee speak.—This man, Aufidius, Was my beloved in Rome; yet thou
  behold'st."*
- Candidate (before fix): *"and would have sent it. **Not another word**,
  Menenius — I will not hear you speak. — This man, Aufidius, was my
  beloved in Rome; yet you see how it is."*

This is a well-known textual crux (Folio reads "Another word, Menenius, I
will not heare thee speake," and multiple scholarly editions add "Not" as
an emendation to resolve the line's ambiguity). The candidate had silently
imported that editorial "Not" — content not present in the locked source's
own printed text, and a specific interpretive resolution of a line the
source leaves genuinely ambiguous (it can be read either as "[Say]
another word and I will not hear you further" or, per the emendation, as
a flat refusal to hear anything more). This is exactly the "imported
wording from another edition or a scholarly emendation replacing the
source's own printed word" defect class this batch has been asked to
watch for.

**Fix applied** via `content_edit_helpers.safe_replace` on
`candidate.json` chapter 25 (Act 5, Scene 2), paragraph index 30 (0-based):
removed the invented "Not," restoring the two-clause structure of source's
own line without resolving its ambiguity:

> "...and would have sent it. Another word, Menenius — I will not hear you
> speak. — This man, Aufidius, was my beloved in Rome; yet you see how it
> is."

Verified via `validate_structure` (before and after) and `diff_report`:
exactly one paragraph (index 30) changed in the whole 43-paragraph
chapter; no other paragraph touched; no empty/whitespace paragraph
introduced; paragraph count and chapter number unchanged.

### No other defects found

Specifically checked and confirmed clean, whole-book:

- **Class-contempt language preserved, not softened.** "scab"/"scabs" (1/1
  match), "cur"/"curs" (source 21, candidate 20 — the one-count drift is a
  legitimate paraphrase, not a drop; verified by direct read, e.g. Ch1
  ¶53's "you curs" and Ch16 ¶62's full "You common cry of curs, whose
  breath I hate / As reek o' th' rotten fens..." speech are both intact
  and unsoftened, including "the dead carcasses of unburied men that
  corrupt my air"). "rabble" (5/6, candidate adds one legitimate paraphrase
  occurrence, not a loss), "dog"/"dogs" (6/6, 3/3), "rogue"/"rogues" (1/1,
  1/1), "multitude" (4/4). "The mutable, rank-scented many" (Ch14 ¶44) is
  rendered "the changeable, foul-smelling many" — a full, non-softening
  modernization, not a drop (both distinctive words translated, not
  deleted).
- **Proper noun / epithet consistency.** Per-paragraph name-occurrence
  diff flagged 18 apparent mismatches; all 18 were manually verified as
  false positives from italic-markup (`_..._`) stripping in stage
  directions (e.g. `[_To Valeria_]` vs `[To Valeria.]`), not actual name
  changes, additions, or drops. No genuine proper-noun substitution,
  case-sensitivity gap, or dropped name found anywhere in the book.
- **Speaker-tag consistency.** The only speaker-tag set difference is
  source's abbreviated `VOLSCE` consistently spelled out as `VOLSCIAN` in
  the candidate (20 occurrences, matching source's every use) — this is a
  demonym/generic-role tag, not a personal name or an epithet, and the
  expansion is applied uniformly throughout Act 4 Scene 3, not partially.
  `ALL PEOPLE` gains a period for tag-format consistency at Ch29 ¶45; no
  content change.
- **"Amazonian chin" (Ch12 ¶27) → "beardless chin."** Verified as a
  correct sense-for-sense translation (Amazons were beardless in the
  period's iconography — the phrase means "smooth, youthful, unbearded"),
  not a dropped allusion or invented substitute.
- **"Dian" (Ch26 ¶24) → "Diana."** Standard modernization of the goddess's
  name-form, not a substituted or invented figure.
- **No actor-misattribution, negation-flip, causality-reversal, omission,
  or addition** found in any of the play's major rhetorical set-pieces:
  the belly fable (Ch1), Coriolanus's Capitol wounds speech (Ch12 ¶27),
  the banishment scene (Ch16 ¶62), Volumnia's two persuasion speeches
  (Ch15 ¶28, Ch26 ¶36/¶41), Aufidius's jealousy monologue (Ch23 ¶7), and
  the final confrontation and killing (Ch29 ¶35–50) — all read
  word-for-word against source with no dropped clause, no reversed
  direction, and no invented content.
- **Malapropisms/mangled words preserved.** "directitude," "empiricutic,"
  "Jack guardant," "carbonado," and the servingmen's other deliberately
  odd coinages (Ch21) are kept, not corrected to plain words.

## Whole-book cross-boundary re-read (Step C)

After the Ch25 ¶30 fix, re-read the entire book once more end to end
against source, with particular attention to:

- Recurring epithets applied consistently to the same figure across scene
  boundaries (e.g. Coriolanus consistently "Martius" pre-naming and
  "Coriolanus" post-naming in both source and candidate, with the naming
  ceremony itself — Ch9 ¶11 — correctly marking the transition in both
  files).
- The Antonius/Antony-style deliberate-variant check does not apply here
  (this play does not mix name-forms for one character the way Julius
  Caesar does with Antonius/Antony) — confirmed by the per-paragraph name
  sweep above.
- Cross-scene payoff of set-up lines (e.g. Coriolanus's Ch17 vow "I will
  or exceed the common or be caught with cautelous baits" paid off later
  by Aufidius's conspiracy in Ch23/Ch29) — both ends of each such thread
  read consistently with source in both scenes.

No new defects surfaced in this re-read.

## Coverage statement

Read in full, source-vs-candidate, paragraph by paragraph: all 29
chapters, all 1,379 paragraphs, twice (once before the Ch25 ¶30 fix as
the primary fidelity pass, once after as the Step C whole-book re-read).
This is not a sampled review.

## Verdict

**ACCEPT WITH FIXES REQUIRED** at the time this review began; **fix
applied and independently re-verified against source** (see "Findings"
above and `ACCEPTANCE-RECORD.md`). Final state: clean.
