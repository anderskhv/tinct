# Accessibility Review 1 — Narrative of the Life of Frederick Douglass, modern-en

Reviewer: Claude (Sonnet 5), acting as Reviewer A per
`books/prompts/accessibility-review-prompt.md`. This review was done
**blind**: only `candidate.json` was read for this pass (via
`candidate_full_text.txt`, a plain dump of all 12 chapters/162 paragraphs
in order, paragraph indices visible). `source.json` was not consulted for
this pass.

**Coverage:** All 12 chapters, all 162 paragraphs, read in full, start to
finish, then re-read paragraph by paragraph for stumble points. No
sampling.

## Overall verdict

**Substantially accessible.** This candidate is already close to
contemporary, idiomatic English almost everywhere — expected, since the
1845 source is itself unusually plain, direct 19th-century prose for its
era (per the task brief: "already in modern-ish English... the
'modernization' here is about accessibility for a contemporary general
reader, not translating archaic syntax"). The candidate's sentences are
generally well-formed, natural-sounding, and readable at a normal pace. I
found very few places where a general contemporary reader would actually
stumble, and the one substantial issue below is concentrated in a single
paragraph.

## Chapter-by-chapter notes

**Chapters 1–9:** No accessibility blockers found. A few terms are
period-specific and slightly unfamiliar (e.g. "dearborns and barouches"
in ch. 3 — types of carriage; "class-leader and exhorter" in ch. 9 —
Methodist lay offices) but these read as clearly contextual period detail
that a reader will parse as "kinds of carriages" / "church roles" without
needing to know the exact referent, and inventing a gloss for them would
risk adding explanatory content not in the source. Not flagged as
blocking.

- Ch. 9, para 1: "He might have passed for a lion, were it not for his
  ears" — this line depends on the reader recognizing the Aesop
  fable/idiom of a donkey in a lion's skin given away by its ears
  (i.e., Auld is all bluster, no substance). A reader unfamiliar with
  that idiom may find the sentence oddly abrupt. This is the source's
  own allusion (verified identical in source), not a modernization
  choice, and rephrasing it would erase Douglass's own ironic joke. Not
  flagged as blocking — noted for the fidelity reviewer's awareness only.

**Chapter 10:** No blockers. Long chapter, dense with action and dialect
("in-hand ox," "off-hand ox," the root/superstition episode), all of
which reads clearly in context. The oxen-team vocabulary is specific but
self-explanatory from the surrounding action.

**Chapter 11:** No blockers. Clear throughout, including the discussion
of hiring-out arrangements and the escape narrative.

**Chapter 12 (Appendix) — the one substantial issue:**

- **Paragraph 2** contains an extended quotation (roughly 200 words)
  reproducing Matthew 23 in full King James Version wording: "They bind
  heavy burdens... for to be seen of men... Woe unto you, scribes and
  Pharisees, hypocrites!... Ye compass sea and land to make one
  proselyte... ye pay tithe of mint, and anise, and cumin... Ye blind
  guides! which strain at a gnat, and swallow a camel... whited
  sepulchres..." This entire block is left in unmodified 17th-century
  English while every sentence of surrounding prose in the same
  paragraph (and the whole Appendix) has been modernized. A contemporary
  reader will very likely stumble on: "for to be seen of men" (unusual
  word order), "doeth," "ye" used as both subject and (implicitly)
  object, "compass sea and land to make one proselyte," "twofold more
  the child of hell than yourselves," "tithe of mint, and anise, and
  cumin," and "whited sepulchres." This reads as an archaic island
  inside otherwise fully modern prose — exactly the pattern the
  accessibility prompt asks me to flag regardless of quotation marks.
  **Flagged as the review's one blocking-level finding.**

- Paragraph 1 (the "Just God!" verse quotation) and paragraph 7 (the "A
  PARODY" song) are also left in period diction ("thine altar," "thy own
  afflicted poor," "dona like goats," "gewgaws," "sable sons of grief"),
  but both are metered, rhymed verse quoted from other sources within
  Douglass's own text. I flag these for the fidelity reviewer's
  attention but do **not** treat them as accessibility blockers on their
  own: their archaic pronouns ("thee/thy/thine") are broadly recognized
  by general readers through common exposure to historical verse and
  scripture, and the specific difficulty (rhyme words like "thine"
  rhyming with "combine," folk-dialect words that carry the song's
  satirical voice) is a function of verse form rather than of obscure
  vocabulary a reader would misread. This is a judgment call for the
  fidelity/acceptance stage, not a plain accessibility failure.

## What's already working well

- The narrative chapters (1–11) read naturally and clearly throughout;
  long 19th-century periodic sentences have been broken into readable
  units without becoming choppy or list-like.
- Emotionally weighted passages (the death of the narrator's mother, the
  whipping of Aunt Hester, the grandmother's abandonment, the fight with
  Covey, the escape) retain their rhetorical force — the modernization
  does not flatten or soften them.
- Dialogue (Colonel Lloyd's road conversation, Henry's defiance of the
  constables, Mrs. Freeland's tirade) reads as natural spoken English
  while preserving each speaker's distinct voice.
- Terms load-bearing for the book's own argument (e.g. "abolition") are
  correctly left unglossed where the source itself explains them a few
  sentences later, exactly as the source does.

## Summary

One blocking-level issue (Appendix, paragraph 2's embedded KJV quotation)
requiring a targeted fix in step D. Otherwise the candidate is
substantially accessible as drafted.
