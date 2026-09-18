# Book 13 — Corrections Log

Applied against `book13-candidate.json` (frozen candidate) using `book13-source.json`
(Pusey 1838, locked, 53 paragraphs) as ground truth and `book13-review.md`
(independent adversarial review: 1 major, 6 moderate, 23 minor) as the
finding set. Paragraph numbers below are **0-based array indices**, verified
against the actual `paragraphs` array (valid range 0–52). The review's own
numbering is 1-based (`P1`...`P53`); the mapping is `array index = P − 1`.

Output: `book13-corrected.json` (53 paragraphs, same shape as candidate/source).

---

## MAJOR (1)

### Paragraph 44 (review P45) — theological-verb direction inversion, fixed twice

**What was wrong:** Pusey has God as the one who *is pleasing* (active —
God's delight/approval is the thing at issue), not the one who *is pleased*
(passive). The candidate inverted both occurrences of the verb, collapsing
the paragraph's three-way distinction (thinking good is bad / seeing good
but enjoying the creature not God / God seeing good in what He made) at its
middle hinge.

**Occurrence 1**
- Old: "and whatever pleases them for your sake, you are pleased by it in them; and whatever, through your Spirit, pleases us, pleases you in us."
- New: "and whatever pleases for your sake, it is you who are pleasing in them; and whatever, through your Spirit, pleases us, pleases you in us."

**Occurrence 2** (also corrects a mis-attachment: "those people" → "those creatures")
- Old: "yet you are not pleased by them in those people, when they prefer to enjoy the creatures rather than you;"
- New: "yet you yourself are not what pleases them in those creatures, when they prefer to enjoy the creatures rather than you;"

---

## MODERATE (6) — all six addressed

### Paragraph 21 (review P22) — DEDICATED DISCLOSURE NOTE (Finding 2)

**No text change in this pass** — the candidate's existing emendation is
**kept**: "as it were the **greater** light" for the word of wisdom, with the
locked source's duplicated "to another faith" clause removed once.

**This is a deliberate, disclosed divergence from the literal locked source
text, not a verified-against-source rendering.** The locked
`book13-source.json` reads, verbatim: "the word of wisdom, **as it were the
lesser light**: **to another faith;** ... the word of knowledge by the same
Spirit, **as it were the lesser light**: to another faith; ..." — i.e. the
locked text calls both the word of wisdom *and* the word of knowledge "the
lesser light," and prints "to another faith" twice in immediate succession.
This is self-contradictory dittography: the rest of the same paragraph
(wisdom "gladdens the forementioned day," knowledge/sacraments are "for the
rule of the night") makes the intended direction unambiguous — wisdom is the
**greater** light (sun/day), knowledge and the sacraments are the lesser
light/moon (night). Rendering the locked text literally as "lesser" for
wisdom would have manufactured a real sun/moon inversion that does not exist
in Augustine's argument, only in this transcription of the locked file.

**Decision:** keep "greater light" for the word of wisdom and the single
deduplicated "to another faith," but log it here explicitly rather than
allow it to pass silently as "verified against source" in any mapping
table. Row 14 of any allegorical-mapping table for this book should be
annotated "correct, but rests on a disclosed emendation of the locked text"
— not marked as a plain source match.

**Two minor fixes also applied within paragraph 21** (bundled here since
they sit in the same paragraph as the disclosed emendation):
- Old: "and those other, lesser tokens of gifts which are listed in order,"
- New: "and those other tokens of gifts which are listed in order,"
  (dropped added evaluative "lesser" — the source establishes inferiority in the following clause, not by epithet)
- Old: "For they are necessary to such people as your wisest servant could not speak to as spiritual,"
- New: "For they are necessary to such people as your most prudent servant could not speak to as spiritual,"
  (*prudens*, not *sapientissimus* — "wisest" wrongly links this to the paragraph's technical *sapientia* chain)

### Paragraph 37 (review P38) — substituted Bible translation broke the argument

**What was wrong:** the candidate quoted a different English Bible
translation of Philippians 4:10 ("had no opportunity") instead of Pusey's
own wording ("had become wearisome unto you"). The very next sentence in
the candidate already argues from "over a long weariness ... withered," so
the citation no longer supplied the weariness the next sentence needs —
producing a non sequitur.

- Old: "...your concern for me has flourished again, in which you were also concerned, but had no opportunity."
- New: "...your concern for me has flourished again, in which you were also concerned, but it had become wearisome to you."

### Paragraph 32 (review P33) — added creation gloss severed an allegorical echo

**What was wrong:** "which you called **into being**" converts Pusey's act
of *naming/electing* into an act of *creating*, severing the deliberate
echo of the adjacent paragraph's "hast divided and **called** them in
secret, or ever the firmament was made" — the sentence that establishes the
day/night division as the secret election man may not judge.

- Old: "nor over the day and the night, which you called into being before the foundation of the heaven,"
- New: "nor over the day and the night, which you called before the foundation of the heaven,"

### Systemic vocabulary drift (review Finding 5) — two technical chains standardized

**`affectus` chain** (Augustine's recurring term for the affections/passions
the soul disciplines) had drifted across three renderings: "affections"
(paragraphs 7, 30 — 0-indexed), "passions" (paragraph 32), "feelings"
(paragraphs 35, 47). Standardized to **"affections"** everywhere:

- Paragraph 32: "living soul, living by the taming of the **passions**" → "...the taming of the **affections**"
- Paragraph 35: "and to **feelings** shaped into self-control" → "and to **affections** shaped into self-control"
- Paragraph 47: "through **feelings** brought into order by the strength of self-control" → "through **affections** brought into order by the strength of self-control"
- (Paragraphs 7 and 30 already read "affections" — left unchanged.)

**`continentia` chain** had drifted across four renderings: "hold yourselves
back" (verb, paragraph 28), "self-controlled" (paragraph 29), "self-control"
(paragraphs 35, 47), "self-restraint" (paragraphs 36, 38). Standardized to
**"self-control"** for the noun/adjective, and **"restrain yourselves"** for
the verb, per the review's explicit recommendation:

- Paragraph 28 (both occurrences): "**Hold yourselves back** from it..." / "**Hold yourselves back** from the unruly wildness of pride..." → "**Restrain yourselves** from it..." / "**Restrain yourselves** from the unruly wildness of pride..."
- Paragraph 36: "example in every kind of **self-restraint**" → "example in every kind of **self-control**"
- Paragraph 38: "living soul of such great **self-restraint**" → "living soul of such great **self-control**"
- (Paragraph 29's "self-controlled" and paragraphs 35/47's "self-control" already matched the chosen standard — left unchanged.)

### Paragraph 7 (review P8) — broken "supereminent" chain

**What was wrong:** Pusey uses "supereminent" three times in one paragraph
as a deliberate linking device (the knowledge of Christ's love → the Spirit
borne supereminent above the waters → that supereminent repose). The
candidate rendered the three slots as "surpassing" / "supreme" / "supreme,"
severing the chain.

- Slot 1 (already correct, unchanged): "we may know the surpassing knowledge of the love of Christ"
- Slot 2 — Old: "And so from the beginning he was borne, supreme, above the waters." New: "And so from the beginning he was borne, surpassing all, above the waters."
- Slot 3 — Old: "and reach that supreme rest, when our soul shall have passed through the waters that give no support." New: "and reach that surpassing rest, when our soul shall have passed through the waters that give no support."

### Paragraph 6 (review P7) — hardened hedge restored, question-mark parity preserved

**What was wrong:** Pusey's tentative "Was it because it was meet that..."
was flattened into a flat assertion, "It was because it was fitting
that...". Fixed using the review's proposed wording, which restores the
hedge without adding or removing a "?" (the source clause itself ends in a
period, not a question mark, so parity with source is unaffected).

- Old: "...your Scripture should then finally mention your Spirit? It was because it was fitting that knowledge of him should be conveyed..."
- New: "...your Scripture should then finally mention your Spirit? Perhaps it was because it was fitting that knowledge of him should be conveyed..."

Confirmed by script: total question marks remain 54/54 (source/corrected),
zero per-paragraph mismatches (see Verification section below).

---

## MINOR — applied (editorial judgment)

### Paragraph 0 (review P1) — 2 fixes
- Old: "who created me and did not forget me even as I, forgetting you, was lost." New: "who created me and did not forget me even when I was forgetting you." (dropped invented "was lost")
- Old: "and yet here I am, by your goodness alone, going ahead of all this..." New: "and yet here I am, by your goodness, going ahead of all this..." (dropped added intensifier "alone")

### Paragraph 4 (review P5)
- Old: "Those on whom your good Spirit is said to rest, he causes to rest in himself instead." New: "...he causes to rest in himself." (dropped added contrastive "instead")

### Paragraph 5 (review P6)
- Old: "Now the Trinity appears to me, though in a glass darkly, and this is you, my God:" New: "Look — now the Trinity appears to me, though in a glass darkly, and this is you, my God:" (restored Pusey's "Lo" as the hinge into the Trinity passage)

### Paragraph 9 (review P10) — 2 fixes
- Old: "We climb the ascents that are in our heart, and sing a song of steps;" New: "We climb your ascents that are in our heart, and sing a song of steps;" (restored the God-reference dropped from the Psalm allusion)
- Old: "We are set aflame by your gift, and kindled, and carried upward;" New: "We are set aflame; by your gift we are kindled; and we are carried upward;" (un-merged the source's two separate predicates)

### Paragraph 13 (review P14)
- Old: "though he already has the firstfruits of the Spirit stored up within him," New: "though he already has the firstfruits of the Spirit laid up with him," (restored Pusey's ambiguity — the referent is God/Christ, not resolved inward to the friend of the Bridegroom)

### Paragraph 15 (review P16)
- Old: "that solid firmament of authority in the discourses they set forth was extended..." New: "that solid firmament of authority in your discourses, set forth by them, was extended..." (restored "your" — the discourses are God's, set forth by the writers, not the writers' own; this is the paragraph's actual point, that mortality raises the authority of what is God's)

### Paragraph 18 (review P19) — 2 fixes
- Old: "because just as it cannot enlighten itself, neither can it satisfy itself." New: "because just as it cannot of itself enlighten itself, neither can it of itself satisfy itself." (restored both dropped "of itself" qualifiers)
- Old: "For with you is the fountain of life, and in your light we shall see light." New: "For with you is the fountain of life, like as in your light we shall see light." (restored the likeness/comparison Pusey is drawing, not a flat conjunction)

### Paragraph 19 (review P20)
- Old: "For it is not the bitterness of men's wills that is called sea, but the gathering together of the waters" New: "Nor is it the bitterness of men's wills that is called sea, but the gathering together of the waters" ("For" wrongly converts a continuation into a causal claim)

### Paragraph 25 (review P26) — 2 fixes
- Old: "For of those things whose knowledge is fixed and unchanging, without any increase by begetting" New: "...whose knowledge is substantive and determinate, without any increase by begetting" (closer to Pusey's "substantial and defined" than "fixed and unchanging," which drifts toward a different predicate)
- Old: "...who have relieved the weariness of mortal senses," New: "...who have relieved the squeamishness of mortal senses," (*fastidium* is squeamish distaste, not tiredness)

### Paragraph 29 (review P30)
- Old: "and good serpents, not dangerous enough to do harm, but wise enough to be watchful," New: "and good serpents, not dangerous so as to do harm, but wise so as to be watchful," ("enough" implies thwarted intent rather than a changed nature)

### Paragraph 31 (review P32)
- Old: "Nor does he judge that division between spiritual and carnal people, which is known to your eyes, our God, and which they have not yet revealed to us by their works, so that we might know them by their fruits" New: "Nor does he judge that division between spiritual and carnal people — people known to your eyes, our God, who have not yet revealed themselves to us by their works — so that we might know them by their fruits" (the relative pronoun shifted referent mid-sentence in the candidate; restructured with the em-dash appositive the review proposed)

### Paragraph 34 (review P35) — 3 fixes
- Old: "What then shall I say, O Truth, my Light? That it was said idly, and without meaning? Never, O Father of holiness" New: "What then shall I say, O Truth, my Light? \"That it was said idly, and without meaning?\" Never, O Father of piety" (restored the quotation marks around the hypothetical objection being rejected, and restored "piety" for *pietas*, which had drifted to "holiness")
- Old: "but through various kinds of true meaning?" New: "but through various kinds of true senses?" (the plural "senses," not singular "meaning," is the argument — many true senses)

### Paragraph 35 (review P36) — 2 fixes
- Old: "...which I rather suppose to be the intent of Scripture, since it surely would not attach this blessing, without purpose, only to..." New: "...which I rather suppose to be the intent of Scripture, which surely would not attach this blessing, without purpose, only to..." (source leaves this as apposition, not an explicit causal "since")
- Old: "In this way the waters of the sea are filled, since they are stirred only by their many meanings;" New: "...which are stirred only by their many meanings;" (same pattern)

### Paragraph 39 (review P40)
- Old: "which might otherwise have perished for want of that food." New: "which might also, for want of that food, have perished." (restored "also" for the candidate's substituted "otherwise")

### Paragraph 40 (review P41)
- Old: "then neither do they truly feed these, nor are these truly fed by them;" New: "then neither do they feed these, nor are these fed by them;" (dropped two added intensifiers)

### Paragraph 45 (review P46)
- Old: "just as the appetite for acting must draw the skill of right action from the reason of the mind." New: "...seeks to draw the skill of right action from the reason of the mind." (*fain* is desire/inclination, not the obligation implied by "must")

### Paragraph 48 (review P49)
- Old: "once it has run its course, is to pass away" New: "having finished their courses, is to pass away" (restored the plural — the source's "courses" belongs to the many things named in the sentence, not a singular collapsed "it")

### Paragraph 51 (review P52) — 2 fixes, explicitly requested in the task brief (closing sentence of the whole work)
- Old: "Let it be asked of you, sought in you, knocked for at your door; so, and only so, shall it be received, so shall it be found, so shall it be opened. Amen." New: "Let it be asked of you, sought in you, knocked for at you; so, so shall it be received, so shall it be found, so shall it be opened. Amen."
  - Restored "at you" (i.e. "at Thee") in place of the added "at your door," recovering the source's triple preposition chain (of you / in you / at you).
  - Removed the added "and only so," restoring the bare four-beat repetition ("so, so shall it be received, so shall it be found, so shall it be opened") that carries the book's — and the whole *Confessions*' — final cadence.

---

## Declined finding

### Paragraph 17 (review P18) — floating participle, declined

The review itself assesses this as "a small resolution of an ambiguity. Low
impact; **acceptable**," recommending no change. Left as-is: "...where they
might look up and learn your mercy, which announces in time you who made
the times." No edit applied; logged here as a deliberate non-change rather
than an omission.

---

## Not touched

No paragraph outside the list above was edited. In particular, all 31
allegorical mappings the review confirmed correct (heaven/earth,
light/darkness, firmament, waters above/below, sea/dry land, herb/tree,
lights-in-firmament, moving creatures/living soul, beasts/cattle/serpents,
man-after-image, male/female, "increase and multiply," gift/fruit, "very
good," the Sabbath) were left untouched. The closing Sabbath/eternal-rest
meditation (paragraphs 48–52, review P49–53) was not flattened — only the
two explicitly requested cadence restorations in paragraph 51 were applied.

---

## Verification (script-checked)

Script: `/tmp/.../scratchpad/verify.py`, run against `book13-corrected.json`.

- **Paragraph count:** 53 (source), 53 (candidate), 53 (corrected). ✅
- **SCRIPT-VERIFIED changed paragraph indices (0-based, candidate → corrected):**
  `[0, 4, 5, 6, 7, 9, 13, 15, 18, 19, 21, 25, 28, 29, 31, 32, 34, 35, 36, 37, 38, 39, 40, 44, 45, 47, 48, 51]`
  — 28 paragraphs changed, 25 untouched.
- **Question marks:** source total 54, corrected total 54. Zero per-paragraph
  mismatches against source (paragraph 6/review-P7's fix confirmed not to
  break parity). ✅
- **Exclamation marks:** source total 1, corrected total 1. ✅
- **Archaisms** (thee/thou/thy/hath/doth/saith/unto/whilst/betwixt/whereof/spake):
  zero matches in corrected file. ✅
- **`--` (double hyphen):** zero occurrences. ✅
- **Single-quote-as-quotation-mark:** zero. All 5 single quotes in the
  corrected file are possessive apostrophes ("man's" ×2, "men's" ×2,
  "world's" ×1). ✅
- **Double quotes:** 6 total, in 3 matched pairs — paragraph 6 ("borne
  above"), paragraph 34 (the newly restored hypothetical-objection quote),
  paragraph 35 ("multitude"). No orphaned quote marks. ✅
