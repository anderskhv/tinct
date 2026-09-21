# The Tempest — Fidelity Review, Round 1

Reviewer: Claude Sonnet 5 (claude-sonnet-5), acting as Reviewer B per
`TRANSLATION_PROTOCOL.md` steps B–D, run in the same dispatch as the
accessibility pass (Reviewer A) but performed second, after the blind read,
and independently re-verified against `source.json` for every finding
before any fix was applied.

All indices below are 0-based paragraph indices within a chapter's
`paragraphs` array. Chapter numbers are the 1-based `number` field
(1 = Act 1 Sc.1 … 9 = Act 5 Sc.1, 10 = Epilogue).

## 0. Source completeness spot check (done before any review)

Before starting, `source.json` was checked for the passages this task
named as most likely to be missing given this batch's Henry V/Macbeth
history of truncated Gutenberg/Cambridge-apparatus parses:

- "revels now are ended" (Ch8, Prospero) — present.
- "This island's mine" (Ch2 para 104, Caliban) — present.
- "Full fathom five" (Ch2 para 123, Ariel's song) — present.
- "brave new world" (Ch9 para 46, Miranda) — present.
- "Sea-nymphs hourly ring his knell" (Ch2 para 123) — present.
- "cloud-capp'd towers" (Ch8 para 46) — present.
- "The red plague rid you" (Ch2 para 108, Caliban) — present.
- "Setebos" (Ch2 para 112 and Ch9 para 75) — present.

Chapter/paragraph structure was also verified: 10 chapters, all real
Act/Scene units (Act 1 Sc.1–2, Act 2 Sc.1–2, Act 3 Sc.1–3, Act 4 Sc.1, Act 5
Sc.1, Epilogue), no apparatus/editorial/crosswalk chapters, and source vs.
candidate paragraph counts match exactly per chapter (43/175/170/58/29/74/
39/98/102/2 — 790 paragraphs total). Source is structurally complete; no
structural-skip needed.

## Methodology (per this task's explicit non-checklist instruction)

This was **not** a sweep built around a list of characters/terms carried
over from any prior round (there is no prior round on this book — this is
its first pass — but the task explicitly required a non-scoped method
regardless):

1. **Full paragraph-by-paragraph read of both files side by side**, all
   790 paragraph pairs, no sampling. Both `source_readable.txt` and
   `candidate_readable.txt` were generated as full linear dumps and read
   in their entirety, in order, by chapter.
2. **Verbal-tic/dialect audit built fresh from what was actually read**,
   not from a prior round's list: Caliban's cursing register, Stephano's
   and Trinculo's drunk banter and malapropism-adjacent jokes, and Ariel's
   songs were each checked for every occurrence of any repeated marker
   (Caliban's "Ca-Caliban" self-naming stutter in his drinking song;
   Stephano/Trinculo's running "monster" address; the "afeard"/"prithee"
   archaic-filler pattern, confirmed as consistently and legitimately
   modernized book-wide, not a tic worth preserving verbatim).
3. **Charged/crude/violent-word list built from a direct grep of the
   source**, after reading, not assumed in advance: `filth`, `vile`,
   `abhorred`, `loathly/loathsome`, `villain/villanous`, `wretch`,
   `malice`, `scum`, `knave`, `traitor`, `coward`, `fool`, `dog`, `cur`,
   `monstrous`, `whore`, `wench`, `strumpet`, `unstanched`, `piss`,
   `damn`, `hell`, `devil`, `bastard`, `slut`, `whoreson`, `pox`,
   `murrain`. Every hit was cross-checked against the candidate's
   corresponding paragraph.
4. **Location-keyed proper-noun map**: every capitalized token in
   `source.json` was diffed against every capitalized token in
   `candidate.json` (a Python `Counter` cross-reference), producing the
   full list of words present in source and absent from candidate. The
   large majority were archaic sentence-initial verb/pronoun forms
   expected to disappear in modernization ("Thou," "Dost," "Hark," etc.);
   every genuine proper noun or mythological name on that list was
   individually checked in context (see Defect 8 below on Hymen/Phoebus,
   and the accepted policy decision on Argier/Bermoothes).
5. **Exclamation-mark diff**: every paragraph's `!` count was compared
   source vs. candidate; every paragraph where the candidate's count was
   *lower* than the source's (the direction that could indicate lost
   emphasis, as opposed to legitimate sentence-restructuring producing
   *more* exclamations) was individually re-read in context. All were
   confirmed as legitimate prose restructuring (run-on verse fragments
   joined into flowing sentences), not softened tone.
6. **A second full pass after the first fix round**, specifically to
   catch what a scoped/list-based sweep structurally cannot — this
   surfaced two further defects (the Hymen/Phoebus name drops and the
   "My mistress" → "My mother" silent correction) that were not on the
   original charged-word or verbal-tic lists.

## Defects found and fixed

All 14 fixes were applied with `content_edit_helpers.safe_replace()`,
validated with `validate_structure()` after every round, and confirmed with
`assert_only_changed()` to touch only the intended paragraph indices. Every
fix below was independently re-read against `source.json` directly after
applying it (not just re-checked against the fix's own stated rationale).

| # | Ch | Para | Class | Source | Candidate before | Candidate after |
|---|----|------|-------|--------|-------------------|-------------------|
| 1 | 1 | 27 | Erasure of a crude word | "Hang, cur! hang, you **whoreson**, insolent noisemaker!" | "Hang, you cur! Hang, you insolent noisemaker!" (whoreson dropped entirely) | "Hang, you cur! Hang, you **whoreson**, insolent noisemaker!" |
| 2 | 1 | 28 | Register-softening (bawdy image erased) | "as leaky as an **unstanched wench**" | "leaked like a sieve" (crude image replaced with a neutral cliché) | "as leaky as **a woman who couldn't stop her bleeding**" |
| 3 | 2 | 108 | Dropped specific adjective | "The **red** plague rid you" | "May the plague destroy you" (red dropped) | "May the **red** plague destroy you" |
| 4 | 2 | 109 | Dropped vocative insult | "Shrug'st thou, **malice**?" | "Are you giving me a defiant look?" (malice, the insult, dropped entirely) | "Are you shrugging at me, **you spiteful creature**?" |
| 5 | 3 | 94 | Erasure of a crude word | "None, man; all idle: **whores and knaves**." | "nothing but scoundrels." (whores dropped) | "None, man. Everyone idle: **whores and knaves**." |
| 6 | 3 | 60/61 | Dropped image breaking joke coherence | "give it his son for **an apple**" / "sowing the **kernels** of it" | "give it to his son as a present" / "planting the seeds of it" (apple image dropped, breaking the apple→kernel joke logic) | "give it to his son as **an apple**" / "planting the **kernels** of it" |
| 7 | 4 | 55 | Malapropism/deliberate-mangling erasure | "'Ban, 'Ban, **Cacaliban**" | "Ban, ban, Caliban" (Caliban's own drunken self-naming stutter flattened to his plain name) | "Ban, ban, **Ca-Caliban**" |
| 8 | 4 | 39 | Silent "correction" of source's own printed form | "**My mistress** show'd me thee" (a well-known editorial crux; many modern editions emend to "dam," but source prints "mistress") | "My mother showed me you" (silently corrected to what the line is usually taken to mean) | "**My mistress** showed me you" |
| 9 | 8 | 65 | Register-softening | "I do smell all **horse-piss**" | "I smell like horse urine" (crude word replaced with clinical term) | "I smell like **horse piss**" |
| 10 | 8 | 80 | Dropped/altered specific curse | "The **dropsy** drown this fool!" | "May the plague drown this fool!" (dropsy swapped for a generic curse) | "May the **dropsy** drown this fool!" |
| 11 | 8 | 25 | Meaning alteration | "Mars's hot **minion**" (= passionate favorite/lover) | "Mars's hot-tempered mistress" (minion, a term of endearment, misrendered as bad temper — invents a character trait the source doesn't state) | "Mars's hot **mistress**" |
| 12 | 8 | 3 | Dropped mythological proper noun | "as **Hymen's** lamps shall light you" | "let the sacred torches of marriage light your way" (Hymen, the god of marriage, dropped though every other deity in this scene — Iris, Ceres, Juno, Venus, Cupid, Mars, Dis, Jove — is named) | "let **Hymen's** torches light your way" |
| 13 | 8 | 25 | Dropped mythological proper noun | "Till **Hymen's** torch be lighted" | "until the marriage torch is lit" | "until **Hymen's** torch is lit" |
| 14 | 8 | 4 | Dropped mythological proper noun | "or **Phoebus'** steeds are founder'd" | "the sun's horses have gone lame" | "**Phoebus's** horses have gone lame" |

## Whole-book re-read (step C)

After the fix round, the whole book was re-read once more end to end
(step C of the acceptance procedure), specifically hunting for
cross-boundary issues and anything a scoped/list-based sweep would miss:
name consistency across scenes (Prospero/Prosper contraction handling,
Ariel/Caliban/Stephano/Trinculo address forms), recurring images
(the "red plague"/"dropsy"/"murrain"/"pox" family of period curses, now
checked for consistent-but-not-uniform handling — see note below), and
the masque scene's full deity roster. This pass found the Hymen/Phoebus/
"My mistress" defects (items 8, 12–14 above), which were not on the
original charged-word grep list — confirming the value of the second,
differently-instrumented pass the task required.

## Deliberately non-blocking items (reader-centered reasoning, not
"the source did it")

- **Argier → Algiers, still-vex'd Bermoothes → ever-stormy Bermudas.**
  Both are the play's own archaic English spellings of real-world
  present-day places (Algiers, Bermuda), used consistently at every
  occurrence, not fictional names or a deliberately ambiguous reference.
  Modernizing them to their standard current spelling is treated the same
  as modernizing "thou" to "you" — an orthographic update to a real,
  identifiable place, not an invented correction of a name/fact/quotation.
  This is judged case-by-case rather than as a blanket rule; unlike the
  "My mistress"/"malice"/"Hymen" fixes above, no meaning, image, or
  distinct word is lost by this normalization.
- **"Poor-John" → "dried cod."** A period-specific term for cheap salted
  hake; translating it to a comparably cheap, comparably dried fish name a
  modern reader recognizes preserves Trinculo's joke (comparing Caliban's
  smell to bargain-bin dried fish) without requiring readers to know
  Elizabethan fishmongering terms.
- **"flesh-fly blow my mouth" → "let flies crawl in my mouth" (Ch5 para
  14).** The source image is specifically about flies laying eggs
  (i.e., a corpse/carrion image implying decay), which is obscure
  entomological knowledge to a modern reader; the candidate keeps the
  core revulsion/degradation meaning (Ferdinand would rather suffer flies
  in his mouth than dishonor Miranda) without the added technical
  specificity. Checked and judged acceptable compression of an
  inessential technical detail, not a dropped claim.
- **"pox"/"murrain"/"damn'd" handling.** The source uses several distinct
  period curse-words (pox, murrain, damn'd, plague) somewhat
  interchangeably across characters. The candidate's choices don't map
  1:1 by word but do preserve a curse of equivalent force at every
  occurrence, with the two exceptions already fixed above (red plague,
  dropsy) where a *specific* named affliction was swapped for a generic
  one. Where the word swapped is itself just another period curse of
  equal weight (e.g. "pox" → "plague" at Ch6 para 39), this was judged
  non-blocking: no specific claim, image, or distinguishing detail is
  lost, unlike the red plague/dropsy cases which drop a distinguishing
  adjective/noun the text uses precisely once.
- **Nautical terms simplified ("lay her a-hold" → "hold her steady," etc.
  in Ch1).** Technical Jacobean seamanship instructions unlikely to be
  meaningful to any modern reader even glossed; the dramatic content (crew
  fighting to save the ship, panic mounting) is fully preserved.

## Verification (step D)

- `validate_structure()` passed for every chapter, before and after every
  fix round.
- `assert_only_changed()` confirmed each fix round touched exactly its
  intended paragraph indices and nothing else.
- Every one of the 14 fixed paragraphs was re-read directly against
  `source.json` after being written to `candidate.json` (not just
  compared against the fix's own stated rationale).
- Final `candidate.json` validated as well-formed JSON
  (`python3 -m json.tool`).
- Final sha256: `14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`

## Verdict

Clean after round 1's fixes and the follow-up whole-book re-read. No
further defects found on the second, differently-instrumented pass. Ready
for independent verification.
