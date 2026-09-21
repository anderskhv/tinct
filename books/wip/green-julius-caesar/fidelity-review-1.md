# Fidelity Review 1 — Julius Caesar (`julius-caesar`, modern-en)

**Reviewer:** Claude Sonnet 5, independent pass against `source.json` (locked
fidelity anchor — the `julius-caesar-original-en.json` text staged in this
directory).

**Coverage statement:** All 18 chapters / 997 paragraphs read and compared
against source, non-sampled. Method combined (a) a full sequential read of
every paragraph pair in packets with neighboring context, and (b) targeted,
programmatic whole-book sweeps for every defect class this batch's tracker
(`SECOND-BATCH-TRACKER.md`) flags as recurring: silently "corrected" proper
names/spelling, and softened graphic/violent content. The programmatic
sweeps are not a substitute for the paragraph read — they are the
whole-book coverage check that a packet-scoped read can miss, per the
tracker's explicit warning that this exact failure class has slipped past
review rounds that only checked flagged spots.

Specific checks run and their coverage:
- Structure: chapter count (18/18), paragraph counts per chapter (exact
  match, 997/997 total), paragraph order, no empty/whitespace paragraphs —
  all pass (`content_edit_helpers.validate_structure`).
- Apparatus scan (Cambridge/Gutenberg editorial-note pattern): 1 false-
  positive hit (a stray "Ff" substring inside ordinary prose), no actual
  apparatus content.
- Speaker-tag set comparison: source and candidate speaker-tag sets match
  exactly (no character silently renamed or merged).
- **Whole-book proper-noun occurrence count for every named character and
  place** (Calphurnia, Ligarius, Metellus Cimber, Decius Brutus, Trebonius,
  Artemidorus, Popilius Lena, Lepidus, Octavius, Messala, Titinius,
  Pindarus, Strato, Volumnius, Clitus, Dardanius, Lucilius, Varro, Claudius,
  Flavius, Marullus, Cinna, Casca, Cassius, Brutus, Antony, Caesar, Portia,
  Lucius, Publius, Statilius, Labeo, Aeneas, Anchises, Erebus, Colossus,
  Tarquin, Cato, Pompey, Nervii, Sardis, Philippi, Parthia, Thassos, Hybla,
  Ate, Olympus, Plutus) — found a count mismatch on "Antony" only; every
  other name matched exactly.
- **Whole-book scan for graphic/violent-content vocabulary**
  (carrion, quartered, butcher, bowels, entrails, hack, hew, dismember,
  slaughter, gore, gash, mutilate, plus frank/coarse-register words: whore,
  strumpet, cur, harlot, bastard, spaniel, dog) comparing presence in every
  source paragraph against the matching candidate paragraph.
- Negation-word count per paragraph (not/never/no/nor/none/nothing and
  common contracted negatives) as a flip/drop tripwire — no paragraph
  showed an outlier gap.
- Word-count ratio tripwire (`content_edit_helpers.word_count_ratios`) on
  every paragraph — 7 flagged, all independently read and confirmed benign
  (short stage-direction-adjacent lines like "Stand, ho!" → "Halt!" or
  "Bid every noise be still" → "Silence every noise", not omissions).

## Defects found (Round 1) — both fixed in this same round

### Defect class 1: silently "corrected" name form — `Antonius` → `Antony`

Source deliberately uses the Latin form **"Antonius"** in exactly 4
locations (5 occurrences), all clustered in Act 1 Scene 2 / Scene 3, while
using **"Antony"** everywhere else in the play (77 other occurrences). This
is the source's own printed variation, not a typo — Shakespeare texts
routinely mix "Antonius"/"Antony" as verse-meter allows. The candidate had
silently normalized every one of these to "Antony," and in one case dropped
the vocative name entirely:

- **Ch2 ¶6** — source "Stand you directly in Antonius' way... Antonius."
  (2 occurrences) → candidate had "...Antony's path... Antony."
- **Ch2 ¶8** — source "Forget not in your speed, **Antonius**, / To touch
  Calphurnia..." → candidate had dropped the name outright: "Don't forget,
  in your hurry, to touch Calphurnia" (not just a spelling change — the
  direct address vanished).
- **Ch2 ¶52** — source "CAESAR. Antonius." → candidate had "CAESAR. Antony."
- **Ch3 ¶6** — source "...he did bid **Antonius** / Send word to you..." →
  candidate had "...he told Antony to send word to you..."

**Fix applied:** restored "Antonius" verbatim in all 4 paragraphs (5
occurrences), including restoring the dropped vocative in Ch2 ¶8.

### Defect class 2: softened violent imagery — Antony's prophecy speech

**Ch8 ¶99** (Antony's "O, pardon me, thou bleeding piece of earth" speech,
immediately after the assassination) had two instances of the
violence-softening pattern this batch has repeatedly hit:

- Source: "mothers shall but smile when they behold / Their infants
  **quartered** with the hands of war" → candidate had "...infants **cut to
  pieces** by the hands of war." "Quartered" is a specific, historically
  loaded term (the method of execution/mutilation) that the source chose
  deliberately for its horror; "cut to pieces" is a generic euphemistic
  substitute that loses that specificity.
- Source: "this foul deed shall smell above the earth / With **carrion
  men**, groaning for burial" → candidate had "...shall stink above the
  earth with **bodies of the dead**, groaning for burial." "Carrion" casts
  the unburied dead explicitly as scavenger-meat — degraded, rotting flesh —
  which is the entire point of the image (civil war reduces Roman corpses to
  animal carrion). "Bodies of the dead" is a neutral, dignified phrase that
  removes exactly that degradation.

**Fix applied:** restored "quartered" and "carrion men" verbatim in Ch8 ¶99.
Both words are ordinary modern English (neither is archaic vocabulary
requiring rebuilding), so restoring them costs nothing in accessibility.

## Cross-boundary / whole-chapter re-read (Step C)

Re-read the whole play once more end to end after the packet passes and
after applying the two fixes above, specifically watching for:
- **Assassination scene (Act 3 Sc. 1, Ch8) and Antony's oration (Ch9)** —
  read word-for-word against source given the task's explicit instruction to
  give these extra scrutiny. Confirmed exact match on: the stabbing stage
  direction ("Casca stabs Caesar in the neck... stabbed by several other
  Conspirators, and at last by Marcus Brutus"), "Et tu, Brute?", the
  "bathe our hands in Caesar's blood up to the elbows," "three-and-thirty
  wounds," Casca's "hack'd one another in the sides of Caesar," and the
  full "poor poor dumb mouths" wound imagery — all preserved without
  softening beyond the two Ch8 ¶99 items already fixed.
- **Act 5 deaths (Ch16–18)** — Cassius's suicide ("this good sword, that ran
  through Caesar's bowels, search this chest"), Titinius's suicide, Cato's
  death, Brutus's suicide — all checked word-for-word; no softening found,
  "bowels" preserved, both suicides' mechanics and lines preserved intact.
- Recurring images (the "honorable men" refrain, the lion/deer/hart
  imagery, the "Roman" self-identification motif) — used consistently
  across scene boundaries in both source and candidate; no drift found.
- No further instance of the Antonius/Antony pattern or the
  carrion/quartered-class softening pattern found anywhere else in the
  book after the targeted whole-book sweeps above.

## Verdict

**ACCEPT WITH FIXES REQUIRED** at time of this review — both fixes were
applied in this same round (see `ACCEPTANCE-RECORD.md` for the
re-verification and final hash). No blocking defects remain after the
fixes. No non-blocking notes beyond the accessibility reviewer's five
inherent-difficulty items (allusion density, not wording).
