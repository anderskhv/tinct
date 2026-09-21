# Fidelity Review 1 — The Merchant of Venice (`merchant-of-venice`, modern-en)

**Reviewer:** Claude Sonnet 5, full-book comparison against locked `source.json`
(not sampled).
**Coverage statement:** Every one of the 20 chapters and all 779 paragraphs
read against the corresponding source paragraph, in full, not just
tripwire-flagged spots. Compared via full parallel `source_readable.txt` /
`candidate_readable.txt` dumps plus targeted scripted sweeps (word-count
ratio tripwire, case-sensitive speaker-tag map, and occurrence counts for
~25 sensitive/recurring terms: Jew, Christian, dog, cur, currish, infidel,
usurer, tribe, nation, Hebrew, Barabbas, synagogue, turquoise, negro, Moor,
gaberdine, misbeliever, publican, Nazarite, and others).

## Structure check

20 chapters, all real Act/Scene units (Act 1 Scene 1 through Act 5 Scene 1) —
no apparatus, editorial, or crosswalk chapters. 779 paragraphs total; chapter
numbers, titles, and per-chapter paragraph counts match `source.json` exactly
in every chapter (verified programmatically, zero mismatches). No empty or
whitespace-only paragraphs on either side.

## Method

1. Full parallel read of both files, paragraph by paragraph, chapter by
   chapter, checking actors, negation, causality, certainty, conditions, and
   omissions/additions — with particular attention to the failure classes
   named in the task brief: silently "corrected" names/spellings/quotations,
   imported wording from another edition, glosses naming what source leaves
   unnamed, softened content (especially the antisemitic dialogue directed at
   Shylock and Shylock's own voice), reversed meaning/direction, inconsistent
   recurring epithets, and "corrected" malapropisms/mangled dialect.
2. Scripted word-count-ratio tripwire across all 779 paragraphs (flag outside
   0.7–1.8×). Three paragraphs flagged, all very short one-line exchanges
   (6→4, 6→4, 6→3 words) — read directly and confirmed benign natural
   compression of short lines ("I do never use it" → "I never do";
   "'Tis good we do so" → "Good plan"), no content lost.
3. Case-sensitive speaker-tag map: extracted the leading `NAME.` token from
   every paragraph in both files (regex `^[A-Z][A-Z .]+?\.`) and compared
   position-by-position. 627 speaker tags in each file; **zero mismatches**,
   including the ALL-CAPS tag forms (`SHYLOCK.`, `PORTIA.`, `GRATIANO.`,
   `DUKE OF VENICE.`, etc.) — this is the exact case-sensitivity gap that
   caused a missed defect elsewhere in this batch, checked explicitly here.
4. Scripted occurrence counts for sensitive/recurring terms across the whole
   book, comparing source vs. candidate totals, to catch a defect class a
   line-by-line read alone can miss (a term dropped in one place while
   preserved elsewhere). See findings below.

## Findings

Two fidelity defects found and fixed (see corrections section). Both are
re-derived and confirmed directly against `source.json`.

### Defect 1 — "Nazarite" silently corrected to "Nazarene" (Ch3 ¶15)

Source (Shylock, on why he won't eat pork): *"Yes, to smell pork, to eat of
the habitation which your prophet, the Nazarite, conjured the devil into."*

The pre-fix candidate read "your prophet, the **Nazarene**, conjured the devil
into" — silently substituting a different, more standard word ("Nazarene" =
someone from Nazareth, i.e. Jesus) for the source's own printed "Nazarite" (a
distinct Biblical term for one under a vow, e.g. Samson). This is the exact
forbidden pattern named in this batch's carried-forward lessons: source's own
printed wording — even where a reader might expect it to be an error or an
unusual choice — is not to be silently corrected to a more standard reading.
Fixed to reproduce source's own "Nazarite" exactly.

### Defect 2 — frank period racial term softened/altered (Ch17 ¶12)

Source (Lorenzo, bantering with Launcelet about the pregnant enslaved woman
in the household): *"I shall answer that better to the commonwealth than you
can the getting up of the negro's belly!"*

The pre-fix candidate read "than you can answer for the swelling of the
**Moorish woman's** belly!" — replacing the source's own frank, specific
period racial term ("negro") with a softer paraphrase ("Moorish woman"),
which also changes the specific word used (Moor and negro are not
interchangeable in the period text; the next sentence — "The Moor is with
child by you, Launcelet" — already uses "Moor" for the same person, so the
candidate's substitution also erased a distinction the source itself makes
between the two words in adjacent sentences). This falls under the same
"never soften frank/period-specific content" principle this batch has
applied to the play's antisemitic dialogue, extended to the play's other
frank period language. Fixed to reproduce source's own wording.

### Antisemitic content and Shylock's own voice — checked directly, found intact

Given the task's specific instruction to watch this class of content
closely, every scene involving hostility toward Shylock and every line of
Shylock's own dialogue was checked directly against source, not just
skimmed:

- **Ch3 ¶19–20 (Shylock's aside on first seeing Antonio)** — "How like a
  fawning publican he looks!" → "How like a fawning tax-collector he looks!"
  (accurate modern gloss of "publican," not a softening); "our sacred
  nation," "Cursed be my tribe if I forgive him!" both preserved exactly in
  sense and force.
- **Ch3 ¶36 ("Signior Antonio, many a time and oft...")** — "misbeliever,
  cut-throat dog," "spet upon my Jewish gaberdine" → "spit on my Jewish
  gabardine" (spelling modernization of the same word, not a substitution)
  all preserved; the "bated breath and whispering humbleness" passage intact.
- **Ch13 ¶21 ("Hath not a Jew eyes?")** — checked word-for-word against
  source. Every clause preserved: the full catalogue (eyes, hands, organs,
  dimensions, senses, affections, passions; fed, hurt, subject to disease,
  healed, warmed and cooled); "If you prick us, do we not bleed?" through
  "the villainy you teach me I will execute...I will better/improve on the
  instruction" — nothing flattened, softened, or abridged. This is the
  speech singled out in the task brief, and it reads with its full force
  intact.
- **Ch18 ¶9 (Shylock's "I'll not answer that, but say it is my humour")**
  and **¶20 ("You have among you many a purchased slave...")** — both
  argument speeches preserved in full logical sequence.
- **Ch18 ¶88 ("These be the Christian husbands...")** — "the stock of
  Barabbas" preserved exactly, not glossed or softened.
- Hostile dialogue from other characters — "currish Jew" (Gratiano, Ch18
  ¶86), "inexecrable dog" → "be damned, inexecrable dog" (Ch18 ¶34, checked:
  candidate correctly keeps the coined/unusual "inexecrable" rather than
  normalizing to "execrable"), the Pythagoras/wolf-soul speech (Ch18 ¶34),
  Gratiano's mock-baptism taunt at Shylock's exit (Ch18 ¶126) — all preserved
  at full force, nothing euphemized.
- Scripted occurrence counts confirm no silent deletions: "Jew" 78→79 (the
  +1 is a natural duplication in modernizing Ch14 ¶47's "if he had the money
  ... he would not take it" into "if he had the money to pay off the Jew,
  the Jew wouldn't take it" — same referent, not a softening or addition of
  new claims); "Christian" 26→26; "dog" 9→9; "currish" 2→2; "infidel" 2→2;
  "tribe" 4→4; "Hebrew" 2→2; "Barabbas" 1→1; "synagogue" 2→2; "misbeliever"
  1→1 — all exact matches.

### Name / epithet consistency

Speaker names throughout (Shylock, Antonio, Bassanio, Portia, Nerissa,
Jessica, Lorenzo, Gratiano, Salarino, Salerio, Solanio, Tubal, Launcelet
Gobbo, Old Gobbo, the Prince of Morocco, Arragon) rendered consistently
throughout, matching source's own spelling in every instance, including
source's own internal inconsistency (the play itself alternates between
"Salarino"/"Solanio" in earlier acts and "Salerio" appearing separately from
Act 3 on — this is source's own printed text, not something to "fix," and the
candidate reproduces it exactly rather than normalizing it). No case where a
mixed-case form was corrected while an ALL-CAPS speaker-tag form was missed,
or vice versa (confirmed by the full speaker-tag map above).

## Conclusion

Two defects found and fixed (see `ACCEPTANCE-RECORD.md` for the verified
before/after). No other fidelity defects found across a full, non-sampled
read of all 779 paragraphs.
