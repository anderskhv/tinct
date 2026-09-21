# PARKED — A Midsummer Night's Dream (`midsummer-modern-en`)

**Book id:** `midsummer`
**Edition:** `modern-en`
**Parked:** 2026-09-21
**Parked by:** Claude Opus (model id `claude-opus-5`), third independent
verification pass.
**Rule applied:** `SECOND-BATCH-TRACKER.md` / `TRANSLATION_PROTOCOL.md`
three-round rule — after three correction/verification rounds, a book with
remaining blockers in a *recurring* defect class is parked rather than given
a fourth fix cycle or accepted at a lowered bar.

**File state at park:** `books/wip/green-midsummer/candidate.json`,
sha256 `a6528809a8c371d2c1e5b0ba203d948dd87dd1cab763d20fce216fea34d3f115`.
Staged only in this directory. No app, registry, audio, or deploy action was
taken at any point across the three rounds.

> **`ACCEPTANCE-RECORD.md` in this directory is superseded and must not be
> acted on.** It records the round-1 verdict (hash
> `4bd297033dfc8bf1f958ff7578786519a20804dc064f4e81531d6bcb9b108adb`) and
> asserts "No round 2 or round 3 was needed." Both rounds *were* needed, and
> two of that record's specific factual claims are now known to be false
> (see "Why the earlier records cannot be trusted" below). This file
> supersedes it.

---

## Structure (verified clean, all three rounds)

- 9 chapters, 641 paragraphs; source and candidate match exactly in chapter
  count, chapter numbers, chapter titles, per-chapter paragraph counts and
  paragraph order (59+43+50+43+85+141+68+18+134 = 641 in both).
- JSON valid. No empty or whitespace-only paragraphs. No apparatus
  pollution in chapter titles.

Structure is not why this book is parked.

---

## The recurring defect class

**Deliberately mangled language in the mechanicals' mouths — malapropisms,
mispronunciations, garbled names, and comically inept performance — silently
"corrected", smoothed, or replaced with invented wording during drafting.**

This is the play's central comic engine (Bottom, Quince, Flute, Snout, Snug,
Starveling; the Pyramus-and-Thisbe rehearsal in Act 3 Scene 1 and the
performance in Act 5). Every round has found further unfixed instances of it.

A closely related class — **frank period content softened into euphemism** —
appeared in round 2 and is entangled with it (the mechanicals' bad verse and
the lovers' insults both carry period wording a modernizer is tempted to
smooth).

---

## Round history

### Round 1 (Sonnet drafting/repair pass) — 5 fixes, claimed full coverage

1. Ch2 — Bottom's "Ercles"/"Phibbus" (garbled Hercules/Phoebus) restored.
2. Ch2 — Bottom's "obscenely" restored.
3. Ch7 — Bottom's "exposition of sleep" restored.
4. Ch8 — Quince's "paramour" restored (its loss had left Flute's "You must
   say paragon" correcting nothing — a coherence break).
5. Ch9 — Thisbe's "Ninny's tomb" restored at the occurrence where it had
   been corrected to "Ninus's".

Round 1 claimed a full-book grep sweep had confirmed no other instance of
the class remained. That claim was wrong.

### Round 2 (independent verification + fix pass) — 12 paragraphs touched

Found **7 more** unfixed instances of the same class, plus a softening
defect round 1 had explicitly certified as absent:

- Ch2 — Bottom's "aggravate my voice" / "as gently as any sucking dove".
- Ch5 — Bottom's "no more fearful wild-fowl than your lion".
- Ch5 — Bottom's "or to the same defect".
- Ch5 — Quince's "come in ... to disfigure or to present".
- Ch5 — a second paramour/paragon-style coherence break: Pyramus's "flowers
  of odious savours sweet" had been smoothed, leaving Quince's "Odours,
  odours" correcting nothing — and the attempted fix had **invented**
  wording ("not 'odious'") that is not in source.
- Ch9 — Pyramus's and Thisbe's deliberately mangled myth names Limander
  (for Leander) and Shafalus/Procrus (for Cephalus/Procris) silently
  corrected to the real names.
- Ch6 — racial-insult wording softened to generic euphemism: "Tartar's bow",
  "Away, you Ethiope!", "tawny Tartar" had become "dark-skinned girl" /
  "dark-faced foreigner". Round 1's acceptance record had specifically
  stated these were checked and "confirmed **not** softened."

**All 12 round-2 fixes re-derived from source in this pass and confirmed
accurate**, at ch2 ¶34, ch5 ¶15/17/23/30/31, ch6 ¶27/67/71, ch9 ¶53/55/56
(1-based; the round-2 note used 0-based indices). In particular ch5 ¶30–31
now restores **both** Pyramus's "odious" and Quince's "Odors, odors"
correction, and the invented "not 'odious'" wording is gone. The three ch6
restorations read naturally in context and match source's own words — not
overcorrected into something stilted.

### Round 3 (this pass) — still not swept

Full word-by-word read of every mechanicals' scene (ch2, ch5, ch8, ch9's
performance) against source, plus spot checks across ch1, ch3, ch4, ch6 and
ch7. **Three more blocking instances of the same class, none previously
flagged in three rounds:**

**B1 — Ch9 ¶90. Invented wording; the joke is inverted.**
- Source: `LION. Oh!`
- Candidate: `LION. Rawr!`
- The entire point is that Snug — who begged for his part in writing because
  he is "slow of study", and who has just explained at length that he is not
  a real lion — produces an "Oh!" where a roar belongs, and the court
  immediately applauds ("Well roared, Lion"). Replacing it with a competent
  "Rawr!" invents wording not in source *and* destroys the gag that the next
  three lines depend on.

**B2 — Ch9 ¶103. Pyramus's malapropism silently corrected, and softened.**
- Source: "Since lion vile hath here **deflower'd** my dear?"
- Candidate: "since a vile lion has **destroyed** my darling"
- Pyramus means *devoured*; "deflower'd" is his blunder, of exactly the
  "aggravate"/"odious"/"defect" type restored in rounds 1 and 2. The
  substitution also sands off the word's frank sexual charge — the second
  defect class from round 2.

**B3 — Ch5 ¶38. Thisbe's rhyme-filler word removed.**
- Source: "Most brisky juvenal, and eke most lovely **Jew**"
- Candidate: "most lively young man, and also most lovely **soul**"
- This is the same shape as the ch6 softening round 2 had to restore: a
  period ethnic term in absurd doggerel replaced by a neutral abstraction.
  Round 1's record classified it "non-blocking" on the reasoning that the
  word's "status in the source is unsettled" — but fidelity in this
  programme is to the locked `source.json`'s printed form, and that same
  record's *other* softening judgement (Ethiope / tawny Tartar) proved
  flatly false. The rationale does not survive.

---

## Why the earlier records cannot be trusted

Two of `ACCEPTANCE-RECORD.md`'s load-bearing claims are demonstrably wrong:

1. "a full-text grep for each affected term ... was re-run across both files
   to confirm no other occurrence of the same defect existed elsewhere" —
   7 further instances were sitting in the same scenes.
2. "The racially charged insults in Act 3, Scene 2 ... were specifically
   checked for softening and confirmed **not** softened" — all three had
   been softened, and round 2 had to restore them.

Any future work on this book should re-derive from `source.json`, not from
either prior record's coverage claims.

---

## Non-blocking observations (not the reason for the park)

Recorded so a future pass does not have to rediscover them. Each has a
reader-centered reason to leave alone, but several cluster in the same
"named thing replaced by a category" habit and are worth a look if the book
is ever re-drafted:

- **Ch9 ¶126 — "the triple Hecate's team" → "the moon goddess's team".** A
  proper noun the source states outright is replaced with a description.
  Not a comprehension problem for a reader, but it is the gloss-replaces-name
  pattern the batch rules warn about.
- **Ch5 ¶23 — "the person of Moonshine" → "the moon".** "Disfigure" (the
  malapropism) is correctly kept; what is lost is that Moonshine is a
  *character* in their play, which ch9 then stages at length.
- **Ch7 ¶12 — "Cavalery Cobweb" → "Sir Cobweb".** Bottom's invented
  mock-title flattened. The mock-formal register survives, so nothing reads
  as broken.
- **Ch9 ¶116 — "yellow cowslip cheeks" → "yellow-as-a-buttercup cheeks".**
  A named flower swapped for a more familiar one; the absurdity survives.
- **Ch3 ¶6 — "and 'tailor' cries" → "crying 'Ow, my backside!'".** Invented
  wording, but the source phrase is genuinely opaque to a modern reader and
  the substitution carries the same event.
- **Ch3 ¶14 — "nine-men's-morris" → "outdoor game-boards".** Named game
  generalized.

Correctly handled and worth preserving in any re-draft: the mispunctuated
Prologue (ch9 ¶29) is kept almost verbatim, "Thisne, Thisne" (ch2 ¶21),
"hold, or cut bow-strings" (ch2 ¶42), Bottom's scrambled senses (ch7 ¶67),
Thisbe's "I see a voice" / "hear my Thisbe's face" (ch9 ¶51), and the
lovers' quarrel in ch6 (141 paragraphs, read end to end — speaker
attributions, insults and the height-mockery thread all land correctly).

---

## Verdict

**PARKED** — the malapropism / deliberate-mangling defect class is still not
fully swept after three verification rounds, with three fresh blocking
instances (two of them previously unflagged, one previously dismissed on a
rationale that has since been disproved) found in the very scenes the class
lives in. Per the three-round rule, no fourth fix cycle was attempted here
and the bar was not lowered to force acceptance.

Next action per programme: pull the next eligible book (backups: Oresteia,
Nicomachean Ethics) and update `books/wip/SECOND-BATCH-TRACKER.md` row 5 —
both outside this task's allowed scope.
