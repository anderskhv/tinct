# don-quixote — Don Quixote, Miguel de Cervantes

**Scope:** public. Audited 2026-09-11. **14 passages inspected.**

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `f7f7785e59136d88` | 126 | 3,939 | 402,675 | "Ormsby (1885)", translator `John Ormsby`, year `1885` |
| modern-en | `6610ca122d1db97f` | 126 | 3,939 | 395,083 | "Modern English" |
| modern-da | `4865fe9fbead9055` | 126 | 3,939 | 394,739 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.7083**, identical long
paragraphs **0.2%**, 0 truncation flags, 0 empty paragraphs, 0 paragraph-count mismatches,
`en_editions_aligned: true`.

Provenance of the core English text: **John Ormsby, 1885**, complete (both Parts, 52 + 74 = 126
chapters), translated from Spanish. Public domain. Registry attribution is correct — the file's
opening matches Ormsby verbatim ("In a village of La Mancha, the name of which I have no desire to
call to mind…").

## THE CENTRAL QUESTION: is the May 2026 failure actually repaired?

`books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23) recorded don-quixote as **123/126 chapters
MECHANICAL, 3 LIGHT** — i.e. essentially no modernization at all. **That state no longer exists.**

I recomputed length-weighted per-chapter similarity across all 126 chapters myself (same
word-token `SequenceMatcher` method as the Phase 1 script). Results:

- **No chapter is above 0.849.** Range: 0.482 (Pt 2 ch 15) to 0.849 (Pt 2 ch 5 / ch 25).
- Mean 0.708. Nothing in the ≥0.95 mechanical-failure band, nothing even in the 0.90s.
- Only 0.2% of long source paragraphs are byte-identical (9 of ~3,300), versus 33.4% for
  vindication and 16.9% for walden in this same batch.

The repair is real and it covers the **whole** book, not just the opening. I read passages from
Part 1 chs 1, 8, 12, 20, 33, 41; Part 1 ch 52 / Part 2 ch 1 boundary; Part 2 chs 15, 23, 43, 45,
62, 68, 74 — early, middle and late thirds of both Parts. Every one is a genuine rewrite of
Ormsby, not a copy.

### Is it actually THIS book (the "filled from an unrelated source" failure mode)?

**No sign of it.** Checks performed:

1. Paragraph-for-paragraph, modern-en tracks the same plot beats, the same proper nouns and the
   same specific details as the matching Ormsby paragraph. Every sampled paragraph pair is a
   recognisable rewrite of its own partner, never of a neighbour.
2. Automated proper-noun retention (capitalised tokens ≥4 chars, original ∩ modern per chapter):
   **median 0.905**, minimum 0.457 (Pt 2 ch 46, a 35-name chapter where the shortfall is
   spelling/diacritic normalisation — "Montalban"→"Montalbán", "Phœbus"→"Phoebus" — not different
   content). A file filled from a foreign text would show near-zero retention.
3. Distinctive, book-specific untranslatables survive in place: `_tantum pellis et ossa fuit_`
   (Pt 1 ch 1), `_post tenebras spero lucem_` (Pt 2 ch 68), Cide Hamete Benengeli, Barataria,
   Tom Cecial, the Cave of Montesinos, the Avellaneda spurious-sequel complaint in the will.

### Image-artifact check (the `45e51394` "strip DQ image artifacts" commit)

Regex sweep of both editions for `illustration | [image | plate N | engraving | frontispiece |
caption | full-page | fig. N | p. NNN`: **0 hits in original-en, 0 hits in modern-en.** The strip
was clean; no caption or illustration-reference debris remains.

## Samples inspected (14)

### 1. Opening — Pt 1 ch 1, ¶1–6 (the hidalgo, his books, Rocinante)

SRC ¶6: *"He next proceeded to inspect his hack, which, with more quartos than a real and more
blemishes than the steed of Gonela…"*
MOD ¶6: *"He next turned to inspect his horse, which — with more cracks in its hooves than a
worn-out coin and more blemishes than Gonela's old nag…"*

**Finding — strong.** Ormsby's untranslated pun (Spanish *cuartos* = both a coin and a hoof-crack)
is glossed into English without a footnote and without flattening the joke. The Feliciano de Silva
parody sentences ("the reason of the unreason with which my reason is afflicted…") are preserved
verbatim in italics, as they must be — they are the joke. Nothing dropped.

One small logic slip: SRC *"at Roncesvalles he slew Roland in spite of enchantments"* →
MOD *"at Roncesvalles he killed the enchanted Roland"*. "In spite of" (the concessive — Roland was
invulnerable and Bernardo beat him anyway) becomes a bare epithet. Local.

### 2. Pt 1 ch 8, ¶1–7 (the windmills) — a high-similarity chapter (0.839)

SRC ¶1: *"Fortune is arranging matters for us better than we could have shaped our desires
ourselves…"*
MOD ¶1: *"Fortune is arranging matters for us better than we could have wished…"*

**Finding — LIGHT but adequate.** This chapter is at the top of the book's similarity range and it
shows: ¶1 is 0.90 similar, changed in two clauses only. Don Quixote's elevated register survives
("righteous warfare", "God's good service", "fierce and unequal combat") and Sancho's plain register
survives. But the register *gap* narrows, because Ormsby marks Quixote's archaism with
`thou/thee/thyself` and the modern edition simply deletes the thou-forms without substituting any
other marker of elevation — so Quixote says *"It's easy to see that you're not used to this business
of adventures"* with the same contractions Sancho uses. See finding 12.

### 3. Pt 1 ch 12, ¶1–3 (the goatherds; Chrysostom and Marcela)

SRC ¶3: *"…she that wanders about the wolds here in the dress of a shepherdess."*
MOD ¶3: *"…the one who roams the open country around here dressed as a shepherdess."*

**Finding — strong.** "Wolds" glossed into "open country" at the point of need; nothing added.

### 4. Pt 1 ch 20, ¶20–33 (the fulling mills; Sancho's interminable goat story)

SRC ¶32: *"“As much as my mother has,” said Sancho."*
MOD ¶32: *"“As dead as my mother is,” said Sancho."*

SRC ¶24: *"…let your worship keep count of the goats the fisherman is taking across, for if one
escapes the memory there will be an end of the story…"*
MOD ¶24: *"…and your worship had better keep count of the goats the fisherman is ferrying across,
because if even one slips your memory, the story ends right there…"*

**Finding — strong.** The joke's whole machinery (the count, Quixote's refusal to count, the story
dying) is intact, including the deadpan close. ¶32 is the one place the modern edition opens up an
idiom: Ormsby's elliptical *"As much as my mother has"* is made explicit as *"As dead as my mother
is."* Defensible gloss; it costs a little obliqueness.

### 5. Pt 1 ch 33, ¶1–4 (the interpolated novella, "The Ill-Advised Curiosity") — lowest-similarity long chapter (0.503)

SRC ¶3: *"…what cannot be done or arranged in the market-place, in church, at public festivals or
at stations (opportunities that husbands cannot always deny their wives)…"*
MOD ¶3: *"…what cannot be done or arranged in the marketplace, at church, at public festivals, or
at religious stations, opportunities that husbands cannot always deny their wives…"*

**Finding — strong.** A 7,900-word chapter rewritten sentence by sentence with no loss. "Stations"
gains the single word "religious" — a minimal, accurate gloss of Ormsby's opaque term, at the point
of need. This is the chapter most heavily rewritten in the book and it is also the cleanest.

### 6. Pt 1 ch 41, ¶1–2 (the Captive's tale, Zoraida) — a light chapter (0.829)

SRC ¶2: *"…she had carcajes (for so bracelets or anklets are called in Morisco) of the purest
gold…"*
MOD ¶2: *"…she had carcajes (which is the Morisco word for bracelets or anklets) of the purest
gold…"*

**Finding — light, complete, but Victorian in places.** The 627-word ¶2 is present clause for
clause; changes are largely punctuation and clause order. "More pearls hung from her fair neck…
than she had hairs on her head", "the highest display and adornment of the Moorish women", "she,
who is now mistress of me only" all survive untouched or near-untouched. Nothing is lost; the
reader simply gets Ormsby with the joints loosened.

### 7. Pt 2 ch 1 (file ch 53), ¶1–3 (the curate and barber test Quixote's recovery)

SRC ¶2: *"…each of the three setting up for a new legislator, a modern Lycurgus, or a brand-new
Solon; and so completely did they remodel the State, that they seemed to have thrust it into a
furnace and taken out something quite different from what they had put in…"*
MOD ¶2: *"…each of the three setting himself up as a fresh lawgiver, a modern Lycurgus or a
brand-new Solon; and they overhauled the State so thoroughly that they might as well have thrown it
into a furnace and pulled out something entirely different from what went in."*

**Finding — strong.** The satirical image survives as an image, not as an explanation.

### 8. Pt 2 ch 15 (file ch 67), ¶1–5 — the book's lowest-similarity chapter (0.482) and the shortest

SRC ¶1: *"…señor bachelor would have been incapacitated for ever from taking his degree of
licentiate, all through not finding nests where he thought to find birds."*
MOD ¶1: *"…señor bachelor would have been disqualified forever from ever taking his licentiate's
degree — all because he found no nests where he expected to find birds."*

SRC ¶5: *"…it is not any wish that he may recover his senses that will make me hunt him out now,
but a wish for the sore pain I am in with my ribs won't let me entertain more charitable
thoughts."*
MOD ¶5: *"…it isn't any hope of restoring his sanity that will drive me to hunt him down now —
it's the desire for revenge; for the throbbing pain in my ribs won't allow me any more charitable
thoughts than that."*

**Finding — strong, and it repairs a corrupt source sentence.** Ormsby's ¶5 is garbled ("but a wish
for the sore pain I am in…" — the noun the wish is *for* has dropped out of the transmitted text).
The modern edition supplies "the desire for revenge", which is what the Spanish says. This is an
editorial repair, not an invention, but it is worth recording as the one place in my samples where
the modern edition adds a phrase the English source does not contain.

### 9. Pt 2 ch 23 (file ch 75), ¶1–3 (the Cave of Montesinos — the book's central ambiguity)

SRC ¶2: *"'For a long time now, O valiant knight Don Quixote of La Mancha, we who are here
enchanted in these solitudes have been hoping to see thee…'"*
MOD ¶2: *"'For a long time now, O valiant knight Don Quixote of La Mancha, we who are held
enchanted in these solitudes have been hoping to see you…'"*

**Finding — strong.** The 538-word set-piece is complete, including the rosary beads "bigger than
fair-sized filberts" (→ "hazelnuts") with "every tenth bead like a moderate ostrich egg", and the
poniard-not-a-dagger correction that makes the whole episode funny. Crucially, the narration keeps
Quixote's *own* claim-structure — the modern editor never steps in to tell the reader whether the
vision was real, which is the one thing that would kill the chapter.

### 10. Pt 2 ch 43 (file ch 95), ¶4–11 (Quixote's advice to Governor Sancho; the "eruct" joke)

SRC ¶9–11: *"'Take care, Sancho, not to chew on both sides, and not to eruct in anybody's
presence.' / 'Eruct!' said Sancho; 'I don't know what that means.' / 'To eruct, Sancho,' said Don
Quixote, 'means to belch…'"*
MOD ¶9–11: *"'Take care, Sancho, not to chew on both sides at once, and not to _eruct_ in anyone's
presence.' / 'Eruct!' said Sancho. 'I don't know what that means.' / 'To eruct, Sancho,' said Don
Quixote, 'means to belch — one of the filthiest words in the Spanish language…'"*

**Finding — strong, and the single best evidence that the rewrite understood the book.** A careless
modernizer would replace "eruct" with "belch" and destroy a joke that exists *because* the word is
obscure. This edition instead italicises it and lets Sancho's confusion play. Note also ¶7–8
(0.955 and 0.938 similarity): *"Dine sparingly and sup more sparingly still; for the health of the
whole body is forged in the workshop of the stomach"* is left verbatim. That is the right call —
the aphorism is already plain modern English.

### 11. Pt 2 ch 45 (file ch 97), ¶1–3 (the mock-invocation to the sun; Sancho enters Barataria)

SRC ¶1: *"…sweet stimulator of the water-coolers!"*
MOD ¶1: *"…sweet rocker of the water-jars!"*

**Finding — strong.** The burlesque apostrophe is kept as burlesque, not paraphrased into
explanation. "Thimbraeus here, Phœbus there" survives.

### 12. Pt 2 ch 62 (file ch 114), ¶1–3 (Barcelona; Sancho at Don Antonio's table) — voice-differentiation test

SANCHO (MOD ¶2): *"…because I'm more tidy than greedy… Of course, if it happens that somebody
offers me a heifer, I come running with the halter — by which I mean, I eat what's put in front of
me and take my chances as they come."*
QUIXOTE (MOD ¶3): *"Truly… Sancho's restraint and cleanliness at the table deserve to be inscribed
and engraved on plates of bronze, to be remembered forever in ages yet to come."*

**Finding — voice differentiation survives, at reduced contrast.** Sancho keeps his proverbs
(*"if they offer me a heifer, I run with a halter"*), his contractions and his self-defending
bluster; Quixote keeps the ceremonial register, the hyperbole and the full clauses. What is lost is
the *archaic* layer of Quixote's speech: Ormsby differentiates the two men partly by giving Quixote
`thou/thee/thy/-est` forms, and the modern edition — necessarily — drops those without replacing
them with any other marker of old-fashioned formality. Quixote therefore sounds grandiloquent but
contemporary, where Cervantes has him sound grandiloquent *and dated*. This is the one recurring
literary cost in the book.

### 13. Pt 2 ch 68 (file ch 114 → 120), ¶1–5 — the book's highest-similarity chapter (0.847)

SRC ¶1: *"I am amazed, Sancho, at the unconcern of thy temperament… I lie awake while thou
sleepest, I weep while thou singest, I am faint with fasting while thou art sluggish and torpid
from pure repletion."*
MOD ¶1: *"I am amazed, Sancho, at the unconcern of your temperament… I lie awake while you sleep, I
weep while you sing, I am faint with fasting while you are sluggish and torpid from pure
repletion."*

MOD ¶3: *"…for I — _post tenebras spero lucem_."*

**Finding — this is the book's weakest band, and it is a real (if bounded) first-read-clarity
problem.** For long stretches of this chapter the edit is a `thou`→`you` conversion and nothing
more: "sluggish and torpid from pure repletion", "bread ill-bestowed and favours ill-acknowledged",
"O pitiless squire" are carried over verbatim, and the Latin motto *post tenebras spero lucem*
("after darkness I hope for light" — the Plantin press device Cervantes is quoting) is left
untranslated and unglossed, where the same edition glosses Latin elsewhere. Sancho's famous praise
of sleep ("the universal coin wherewith everything is bought") is likewise barely touched.

**Scale of this band:** counting from my own per-chapter recomputation, **~35 of 126 chapters
(≈28%) sit at 0.80–0.85**, and they cluster in late Part 2 — chapters 115–120 (Pt 2 chs 63–68) are
*all* ≥0.796. So the light-touch chapters are not randomly scattered; there is a stretch near the
end of Part 2 that got noticeably less work than Part 1 did.

### 14. Ending — Pt 2 ch 74 (file ch 126), ¶12–21 (the will, the death, the epitaph)

SRC ¶17: *"…but still the niece ate and the housekeeper drank and Sancho Panza enjoyed himself; for
inheriting property wipes out or softens down in the heir the feeling of grief the dead man might
be expected to leave behind him."*
MOD ¶17: *"…and yet the niece went on eating, the housekeeper drank, and Sancho Panza kept his
spirits up — for inheriting something erases, or at least softens, in the heir the grief the dead
man might reasonably be expected to leave behind."*

SRC ¶20: *"A doughty gentleman lies here; A stranger all his life to fear; Nor in his death could
Death prevail, In that last hour, to make him quail."*
MOD ¶20: *"Here lies a gentleman of mettle, a stranger all his life to fear; not even in his final
hour, with Death upon him, could Death contrive to make him cower."*

**Finding — strong in prose, weaker in verse.** The will (including the Avellaneda clause and the
niece's marriage condition), the notary's testimony, the Cide Hamete frame and the seven-cities-of-
Homer joke are all complete and clear. But Ormsby's epitaph is a rhymed tetrameter quatrain
(*here / fear / prevail / quail*) and the modern rendering is unrhymed prose-with-line-feel. The
sense survives; the form does not. Same pattern on ¶21. Verse is a small fraction of this book, so
this is local rather than systemic.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| mean similarity 0.7083 "verified repair band" | **Confirmed as a real repair** by 14 read passages spread across both Parts and all three thirds. Not a metric artifact. |
| 0.2% identical long paragraphs | **Confirmed** — I found no byte-identical long paragraph in any sample. |
| 0 truncation flags / 0 empty paragraphs / 0 paragraph-count mismatches | **Confirmed** — every sampled modern paragraph carried the full content of its source partner. |
| `books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23): "123/126 MECHANICAL" | **Disconfirmed as a current description.** No chapter now exceeds 0.849. The file is accurate history, not a current verdict. |
| "DQ image artifacts" (commit `45e51394`) | **Disconfirmed as an outstanding problem** — 0 regex hits for illustration/caption/plate/figure debris in either edition. |
| Possible fill-from-unrelated-source | **Disconfirmed** — 0.905 median proper-noun retention, paragraph-level plot/detail correspondence throughout, book-specific Latin and names intact. |

## Phase 3 — human-edition research

**Rights of the current core text.** Ormsby 1885 is public domain (author d. 1895; publication
1885). Confirmed at Wikisource
(<https://en.wikisource.org/wiki/Don_Quixote_(Cervantes/Ormsby)>) and Standard Ebooks, whose
edition states *"This ebook is thought to be free of copyright restrictions in the United States"*
with Standard Ebooks' own production work dedicated CC0
(<https://standardebooks.org/ebooks/miguel-de-cervantes-saavedra/don-quixote/john-ormsby>).

**Is Ormsby's reputation deserved?** Substantially yes, with a caveat, and the caveat is exactly
what our modern-en exists to fix. Per the Wikipedia translator article
(<https://en.wikipedia.org/wiki/John_Ormsby_(translator)>): Ormsby's is *"perhaps the most scholarly
and accurate English translation of the novel up to that time"*, has seen more editions than any
other 19th-century English version, and was chosen for *Great Books of the Western World*; it was
revised and reissued as a Norton Critical Edition (Jones & Douglas). The same source records the
standing criticisms: Samuel Putnam faulted Ormsby for tracking Cervantes' pronouns so closely that
sense blurs, and the *Oxford Guide to Literature in English Translation* calls it "remarkable" but
"not always easy" for readers today, noting that "in his quest for accuracy, he often introduces
obscure Elizabethan words; more seriously, in attempting to reflect the syntax of the original, he
frequently writes what amount to pseudo-Spanish sentences which bear little relation to natural
English." That is a precise description of the barrier our modern-en removes.

**Better public-domain alternative?** None found in this search.
- Shelton (1612), Motteux (1700–03), Jarvis (1742), Smollett (1755): all PD, all either more
  archaic than Ormsby or (Motteux) notoriously loose.
- Duffield (1881), Watts (1888): PD contemporaries of Ormsby, described as "virtually forgotten";
  no evidence they read better.
- **Samuel Putnam (Viking, 1949)** — the strongest scholarly rival. **Not rights-clear.** It is
  still in commercial print (Modern Library ISBN 9780679602866). US term for a 1949 work with
  renewal runs to the end of 2044. Putnam d. 1950, so it is *probably* PD in the EU/Denmark
  (life+70 expired 2021) — a genuine jurisdictional split that I cannot resolve here, and Tinct
  serves US readers. Record as **permission required / unresolved**, not as available.
- **John Rutherford (Penguin, 2000)** and **Edith Grossman (Ecco, 2003)**: in copyright, widely
  reviewed as the best modern reading versions, permission required.

So: the best rights-clear human English Don Quixote is the one we already use as `original-en`, and
it carries a documented readability problem. That is the case for keeping a modern edition.

**Candidate accessed and read?** Ormsby — yes, it is our own core file. Putnam/Rutherford/Grossman —
**not accessed**; assessed from secondary sources only. Their rights status, not their quality, is
the blocker.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **5** — 14 passages across both Parts, all thirds; no omission, no content shifted between chapters, 0 truncation/empty/count flags, proper nouns retained at 0.905 median |
| first-read clarity | 25% | **4** — excellent in Part 1 and most of Part 2, but ~28% of chapters (clustered in Pt 2 chs 63–68) remain close to Ormsby, and at least one Latin motto is left unglossed |
| literary voice | 20% | **4** — jokes, proverbs, mock-epic register and the Sancho/Quixote contrast survive; Quixote's *archaic* layer is flattened and verse loses its rhyme |
| restraint / no invention | 10% | **5** — no invented motive, diagnosis or transition found; the one addition (Pt 2 ch 15 "the desire for revenge") repairs a demonstrably corrupt English source sentence |
| naturalness | 5% | **4** — reads as English throughout; the lightest chapters retain Victorian rhythm |

**Weighted score: 4.5 — band: Strong.**

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **medium-high**. Estimated correction scope: **local**.

The May 2026 catastrophe is genuinely and comprehensively repaired across the full 126 chapters,
not just at the front — this is the main thing the batch needed to establish, and it is
established. No substantive omission or invention was found in 14 passages, so nothing rules out an
unqualified keep.

The one worthwhile follow-up is **not** a retranslation: it is a second pass over the ~35 chapters
in the 0.80–0.85 similarity band, above all the run of Part 2 chs 63–68, plus a gloss for
`post tenebras spero lucem` and a verse pass on the two closing epitaphs. That is scoped,
mechanical to locate (sort by per-chapter similarity) and optional.

## Limitations of this review

- 14 passages out of 3,939 paragraphs. "Strong in samples" is what this supports; it is **not** a
  verification of the whole book.
- I sampled all three thirds of both Parts, but the chapters I read in the light 0.80–0.85 band
  were 8, 41, 68 and 74 — I did not read every chapter in that band, so the characterisation of
  that band rests on similarity plus four reads.
- I did not check modern-da at all.
- I did not read Putnam, Rutherford or Grossman; their assessments here are second-hand and used
  only to establish that no *rights-clear* alternative to Ormsby exists.
- The Putnam EU-vs-US rights split is flagged, not resolved. That is a question for counsel, not
  for this audit.
- I did not verify Ormsby's ~1,000 footnotes against our file (our `original-en` appears not to
  carry them); footnote coverage was not part of this review.
