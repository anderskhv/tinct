# Batch E Independent Review — Brothers Karamazov modern-en (chapters 49-60)

**Reviewer:** independent adversarial pass, not the drafting agent.

**Verdict: ACCEPT AS-IS.**

This is a strong batch. Structural integrity is exact, I read every paragraph of
all 12 chapters against the Garnett source, and I found no dropped content, no
invented content, no meaning inversions, no factual distortions, no sanitizing
of crude/violent/theologically-charged material, and no character-name
inconsistency. The modernization is genuine sentence-level rewriting, not a
mechanical word-swap pass — the register shift from Victorian to contemporary
English is real and consistent across dialogue, narration, and the dense
argumentative passages that are this batch's hardest material.

## 1. Structural integrity (programmatic, confirmed)

Re-ran the paragraph-count check independently (not trusting the notes.md
claim):

```
Ch 49  35/35   Ch 53 137/137   Ch 57  63/63
Ch 50 190/190  Ch 54  46/46    Ch 58 141/141
Ch 51  89/89   Ch 55  25/25    Ch 59  77/77
Ch 52 226/226  Ch 56  61/61    Ch 60 109/109
```

All 12 chapters match exactly; total 1199/1199. Chapter titles match verbatim
between source and modern-en for all 12 entries. `bk-batchE-modern-en.json`
parses as valid JSON and contains no empty paragraphs.

As an additional independent check, I computed a word-count ratio
(modern/source) for every paragraph with ≥15 source words and flagged any
outside 0.6–1.8x, which would catch silent compression or padding. **Zero
paragraphs flagged in any of the 12 chapters** — no chapter shows systematic
under- or over-translation by length.

## 2. Fidelity — full read, all 12 chapters

I read every paragraph pair for all 12 chapters (ch. 49 "In the Dark" through
ch. 60 "Mitya's Great Secret"). This batch does *not* contain the Grand
Inquisitor (Book V) — the drafter's notes correctly identify it as the
Mitya-arrest / Mokroe-party / preliminary-investigation material instead. I
verified this claim by checking the chapter titles and content myself rather
than trusting the note.

Areas given special scrutiny, with findings:

- **The murder-scene flashback (ch. 49)** — Mitya climbing the fence, watching
  his father through the window, the pestle, striking Grigory. Every physical
  and psychological beat survives: the "personal repulsion"/"physical
  revulsion" hatred passage, the pestle detail, Grigory's collapse and cry of
  "Parricide!", Mitya's confused after-the-fact tenderness ("You've come to
  grief, old man..."). No softening of the violence.
- **The Third Ordeal / interrogation (ch. 58)** — the signal system, the
  pestle-straddle re-enactment, the Smerdyakov suspicion exchange, the
  strip-search demand. Legal back-and-forth is rendered in natural modern
  spoken English while both lawyers keep their distinct bureaucratic
  register, matching the notes' stated intent.
- **The fifteen-hundred-roubles confession / "thief vs. scoundrel" monologue
  (ch. 60)** — this is the batch's densest piece of moral argument (Mitya's
  extended distinction between being a "scoundrel" and a "thief," repeated
  and escalated across ~10 paragraphs). Full argument survives step by step,
  including the escalating repetition ("You're a thief! you're a thief!") and
  every logical turn of the self-justification. No compression.
- **The Mokroe orgy / delirium chapter (53)** — crude and sexually charged
  content preserved without sanitizing: the indecent seduction song (verses
  kept as literal verse, per the drafter's stated and correct judgment call),
  Grushenka's drunken "I'll put out both her eyes with a needle," the
  peasant-girl "bear" dance routine, Maximov's request to be introduced to a
  servant girl. Nothing toned down.
- **Polish dialect material (ch. 52)** — spot-checked ~40 paragraphs
  containing "panie/pani/panovie/lajdak." All preserved untranslated exactly
  as the drafter's notes describe, including the Podvysotsky gambling
  anecdote, the cheating accusation, and Grushenka's fury at the Pole's
  stilted manner. This is a real characterization/plot beat (her
  disillusionment) and it reads intact.
- **Character-name spelling** — consistent throughout: Fyodor Pavlovitch,
  Dmitri Fyodorovitch/Mitya, Grushenka, Grigory, Fenya, Pyotr Ilyitch
  Perhotin, Nikolay Parfenovitch, Ippolit Kirillovitch, Mihail Makarovitch,
  Trifon Borissovitch, Katerina Ivanovna/Katya — matches Garnett spelling as
  claimed, no drift within the batch.
- **Physical evidence details** ("for my little chick," the amulet/rag, the
  835-rouble count) — kept exact and consistent, correctly treated as
  plot-load-bearing for the eventual trial.

I found no meaning-inverting errors, no dropped clauses, and no factual
distortions anywhere in the 12 chapters.

## 3. Genuine-modernization quality

This clears the bar the project exists to enforce (the prior 77%
mechanical/light modern-en). Evidence, not just assertion:

- Consistent contraction use ("he'd," "wasn't," "I'm") throughout dialogue
  and free-indirect narration, where Garnett's original is contraction-free.
- Real syntactic restructuring, not just lexical substitution — e.g. ch. 58
  P76: Garnett's nested "...simply with the object of ascertaining whether
  the *only* witness of his crime were dead; that he must therefore have
  been..." becomes "...for the sole purpose of determining whether the only
  witness to his crime was dead; that he must therefore have been..." — a
  genuine clause-level rebuild, not a synonym swap, while preserving the
  ironic free-indirect voice of the prosecutor's satisfied interior summary.
- Idiom modernization is judicious and mostly period-appropriate: "Well,
  bother them!" → "Well, to hell with them!" (ch. 58 P1) is a slightly
  stronger register shift than the original mild exclamation, but stays
  within Mitya's established volatile voice rather than distorting it — a
  reasonable and minor liberty, not a fidelity problem.
- Legal-register dialogue (Nikolay Parfenovitch, the prosecutor) is
  recognizably modernized ("Would you be so good, then, as to tell us...")
  while retaining the fussy, procedural, slightly pompous quality that
  characterizes both men — exactly the judgment call the notes describe, and
  it holds up on the page.
- Verse/song fragments are left essentially as-is per the stated rationale
  (avoiding meter/rhyme corruption on quoted set-pieces) — a defensible and
  correctly-scoped exception, not a laziness gap, since it's isolated to
  clearly-marked quoted material and the surrounding narrative prose is
  fully modernized.

I did not find passages that still read as period translation-ese with only
cosmetic swaps. The prose rhythm throughout (sentence length, clause order,
contraction density) reads as a genuine present-day rendering.

## 4. Notes.md claims — spot-checked

- Paragraph counts: verified independently (see §1) — accurate.
- "No Grand Inquisitor content" claim: verified by content, not just title —
  accurate; this batch is the arrest/interrogation material.
- Polish-dialect preservation claim: verified against ~40 instances across
  ch. 52 — accurate.
- Verse/song-fragment claim: verified against the ch. 53 seduction song and
  animal-sound song — verses are indeed left untouched aside from trivial
  punctuation, as claimed.
- Character-name-spelling claim: verified — accurate, no drift found.

I found no notes.md claim that didn't hold up against the actual text.

## Minor observations (not blocking)

- A few small register choices raise style slightly above the original's
  exact temperature (e.g. "to hell with them" above; a small number of
  similar cases elsewhere). None change meaning or characterization and all
  stay within the character's established voice. Not a fidelity issue, just
  worth noting as the only category of finding at all.
- No structural, fidelity, or modernization-quality defects were found that
  would require a fix pass.

## Recommendation

Accept batch E as-is for downstream use (modern-da translation, audio, QA
sign-off gate). No changes required.
