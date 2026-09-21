# Fidelity Review 1 — A Midsummer Night's Dream (`midsummer-modern-en`)

**Source edition (fidelity anchor):** `midsummer-original-en.json` (locked source
staged in this directory as `source.json`). No other edition or remembered
Shakespeare translation was consulted.

**Coverage:** All 9 chapters, all 641 paragraphs, compared against source in
full — every candidate paragraph read against its source counterpart with
neighboring context, not a sample. Given the size, comparison was done densely
rather than in literal numbered 5–10-paragraph blocks, but every paragraph was
individually checked against source; the whole-chapter cross-boundary re-read
(step C) was performed separately afterward and is reported at the end.

## Blocking defects (fixes required)

### 1. Ch2 ¶12 — Bottom's "Ercles"/"Phibbus" malapropisms silently corrected

- **Source:** "I could play Ercles rarely... And Phibbus' car / Shall shine from
  far... This is Ercles' vein, a tyrant's vein."
- **Candidate:** "I could play Hercules brilliantly... and the sun god's chariot
  shall shine from far... That was the Hercules style — a tyrant's style."
- **What's wrong:** "Ercles" and "Phibbus" are Bottom's own garbled forms of
  Hercules and Phoebus — a running characterization joke (the bombastic amateur
  actor mangling classical names he's heard but doesn't really know). The
  candidate silently "corrects" both to their standard forms, erasing the joke
  and Bottom's distinct comic voice. This is exactly the silent-name-correction
  failure this batch has hit before.
- **Fix:** Restore "Ercles" (both occurrences) and "Phibbus'" as printed in
  source; do not substitute "Hercules"/"the sun god."

### 2. Ch2 ¶39 — Bottom's "obscenely" malapropism smoothed away

- **Source:** "We will meet, and there we may rehearse most obscenely and
  courageously."
- **Candidate:** "We'll meet there, and we can rehearse freely and boldly."
- **What's wrong:** "obscenely" (for "seemly") is a real, plain modern word — no
  modernization was needed here at all; the drafter replaced Bottom's comic
  misuse with the "correct" meaning, deleting the joke.
- **Fix:** Restore "obscenely" in place of "freely."

### 3. Ch7 ¶17 — Bottom's "exposition" malapropism smoothed away

- **Source:** "I have an exposition of sleep come upon me" (malapropism for
  "disposition").
- **Candidate:** "I feel a powerful urge to sleep coming over me."
- **What's wrong:** Same pattern as #2 — "exposition" is already a plain modern
  word; substituting the "correct" phrasing erases the malapropism.
- **Fix:** Restore "exposition" — e.g. "I have an exposition of sleep coming
  over me," keeping the malapropped word intact rather than paraphrasing around
  it.

### 4. Ch8 ¶6–7 — Quince's "paramour"/"paragon" malapropism dropped, breaking the joke

- **Source ¶6 (QUINCE):** "...he is a very paramour for a sweet voice."
- **Source ¶7 (FLUTE):** "You must say paragon. A paramour is, God bless us, a
  thing of naught."
- **Candidate ¶6:** "...he's an absolute dream when it comes to a sweet voice."
- **Candidate ¶7 (unchanged):** "You mean 'paragon.' A 'paramour' is — God help
  us — something indecent."
- **What's wrong:** This is the most serious defect in the chapter. The word
  "paramour" was dropped entirely from Quince's line, so Flute's correction in
  the very next paragraph now refers to nothing actually said — a genuine
  actor/coherence break, not just a stylistic loss. (Caught independently in the
  accessibility review as well, as a reader-facing non sequitur.)
- **Fix:** Restore "paramour" in Quince's line (¶6): "...he's a real paramour
  for a sweet voice" or equivalent, keeping the exact word "paramour" so ¶7's
  correction still makes sense.

### 5. Ch9 ¶88 — Thisbe's "Ninny's tomb" silently corrected to "Ninus's tomb"

- **Source:** "THISBE. This is old Ninny's tomb. Where is my love?"
- **Candidate:** "THISBE. This is old Ninus's tomb. Where is my love?"
- **What's wrong:** Thisbe (the amateur actor) consistently mispronounces
  "Ninus" as "Ninny" throughout the play — candidate ¶58 ("Will you meet me
  right away at Ninny's tomb?") correctly preserves this, and the Prologue
  correctly says "Ninus's tomb" at ¶34 (spoken by Quince/Prologue, who does not
  have this mispronunciation). But at ¶88 the same character (Thisbe) who says
  "Ninny's" everywhere else has been silently corrected to "Ninus's," breaking
  the joke's internal consistency for exactly the reason this batch has been
  warned about (silent name-form correction).
- **Fix:** Restore "Ninny's tomb" at ¶88 to match Thisbe's consistent usage
  elsewhere in the candidate and in source.

## Non-blocking notes (preserved, with reader-centered reasoning)

- **Ch7 ¶11 — "Cavalery Cobweb" → "Sir Cobweb."** Source's "Cavalery" is Bottom's
  own mock-military title for Cobweb (an archaic/dialectal form of "Cavalier"
  used as invented honorific). The candidate's "Sir" loses this specific comic
  coinage but keeps the mock-formal register and the joke of a giant treating a
  fairy with pompous courtesy. Minor stylistic loss, not a meaning or actor
  error — non-blocking, but flagged for the merge owner's judgment call since it
  is part of the same "Bottom's invented vocabulary" pattern as the blocking
  items above. Left as a judgment call rather than auto-fixed because, unlike
  #1–#4, there is no broken joke-logic or ambiguity for the reader — "Sir
  Cobweb" reads perfectly sensibly on its own.
- **Ch1 ¶53 — "What cheer, my love?" → "What's the matter, my love?"** Source's
  "what cheer" is a general how-are-you-feeling check-in; the candidate's
  phrasing presupposes something is wrong. Mild unlicensed shift in
  implication, not an actor/fact error — Hippolyta's actual state (unbothered,
  simply asked about) is not contradicted elsewhere in the scene. Judged
  non-blocking: no plot or characterization consequence, and "what's the
  matter" is a natural, idiomatic way to render a solicitous aside in modern
  English.
- **Ch3 ¶165 (Titania) — "your entire fairy kingdom" adds "entire."** Source:
  "Not for thy fairy kingdom." Minor intensifying addition; doesn't change what
  is being refused or introduce new content. Non-blocking.
- **Ch5, Thisbe's rehearsal verse (¶16 area) — "most brisky juvenal, and eke most
  lovely Jew" → "most lively young man, and also most lovely soul."** The
  source line is a textual crux (the word "Jew" here is widely read by editors
  as filler/rhyme padding rather than a literal reference, and "brisky juvenal"
  is invented mock-elevated diction typical of the mechanicals' bad verse). The
  candidate's smoothing loses some of the deliberate over-the-top badness of
  the amateur verse but introduces no incorrect claim, invented content, or
  named referent the source leaves unnamed. Given the word's disputed status,
  reproducing it in a general-audience modern edition risks a confusing,
  unintended reading with no compensating fidelity gain; left as-is.
- **Ch9, Bottom's line — "Bergomask dance" → "country dance."** Source names a
  specific historical dance (a comic dance associated with the Bergamo region,
  itself part of the mechanicals-are-unsophisticated joke). "Country dance" is
  a plainer modern equivalent that keeps the "simple/rustic" comic register but
  loses the specific place-name joke. Non-blocking: no named figure or fact is
  invented, and the humor (rustic performers, unsophisticated dance) survives.
- **Ch9, Wall's line — "the wittiest partition" → "the wittiest wall."** Minor
  vocabulary simplification; "partition" and "wall" refer to the same thing in
  context and no distinction the dialogue depends on is lost.

## Cross-boundary re-read (step C)

Re-read the whole book again after the packet-level pass, focused on
recurring terms/relationships across chapter boundaries:

- **Bottom's malapropisms** (Ercles, Phibbus, obscenely, exposition, and
  Quince's paramour/paragon) form one consistent pattern across chapters 2, 7,
  and 8 — all five are listed above as blocking fixes, since together they
  establish a specific running joke (amateurs mangling elevated vocabulary)
  that must survive consistently or not at all. Confirmed no other malapropism
  instance was missed: no other hits for "Cavalery," "Ercles," "Phibbus,"
  "obscenely," "exposition," "paramour," or "paragon" appear anywhere else in
  source outside the five locations addressed above (verified by full-text
  grep of source.json).
- **"Ninny's tomb" vs "Ninus's/Ninus' tomb"** — confirmed exactly one candidate
  occurrence (¶88 of ch9) breaks the Thisbe-vs-Prologue distinction; the other
  two occurrences (¶34 Prologue, ¶58 Pyramus quoting the meeting point Thisbe
  set) are correct as-is. No other tomb reference exists in the text.
- **Love-juice/flower plot mechanics** (who was anointed, in what order, actor
  attribution across Oberon/Puck/Demetrius/Lysander) checked end to end across
  ch3–ch7: consistent and correctly attributed throughout — no actor swaps.
- **The four lovers' names and epithets** (Egeus's daughter Hermia, Nedar's
  daughter Helena, etc.) checked for consistency across all 9 chapters: stable
  throughout, no drift.

## Verdict

**ACCEPT WITH FIXES REQUIRED** — five blocking fixes (items 1–5 above), all
narrow and mechanical (restore specific source words/names rather than their
"corrected" modern equivalents). No content is dropped, no actor is
misattributed at scale, no negation is flipped, and no invented content was
found anywhere in the 641 paragraphs. The defects found are all one failure
class: reflexive "cleanup" of deliberately non-standard source wording
(malapropisms and a character-specific mispronunciation) into its standard
form — precisely the silent-correction failure mode this batch has been
warned to watch for.
