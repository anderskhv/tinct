# Continuity sheet — Meditations, Book VIII (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V,
VI and VII were accepted, and describing what the frozen draft actually did.
Term renderings follow `../GLOSSARY.md` (one row extended for Book VIII
**before** drafting, see below); the pattern for applying review findings
follows the seven earlier `ACCEPTANCE.md` files (decisions D8, D10, D11 and D12
in the ledger).

## Source

- `../meditations-original-en.staged.json`, chapter `number: 8`, title `Book 8`,
  61 paragraphs, one per numbered meditation (VIII.1–VIII.61). Extracted
  verbatim into `source-book8.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- **Step 1: the staged original was NOT rebuilt for Book VIII, and it did not
  need to be.** The file had already been rebuilt twice for PG apparatus the
  first build missed — three illustration captions at Book IV step 1 (`7bf2d1b1…`
  → `b0ecf3da…`) and three flush-left footnotes at Book VII step 1 (`b0ecf3da…`
  → `7798607d…`) — so PG #15877 was re-read for Book VIII (PG lines 4933–5418, the
  `VIII.` header at 4933 to the `IX.` header at 5419) looking specifically for the same classes.
  The result, class by class:
  - **Footnotes.** Book VIII has **nine**, at PG lines 4969, 5045, 5131, 5160,
    5218, 5223, 5277, 5396 and 5414. **Every one is printed indented** — four
    spaces, then `[A]` / `[B]` — which is the form the build's footnote filter
    has always caught. There is no flush-left footnote opener anywhere in the
    book, so the defect that hit VII.45 does not recur. (The filter now matches
    unindented openers as well, so it would have caught them either way.) The
    nine bodies are Long's notes on Caius and Pompeius, Thucydides iii 10,
    Schultz/Valkenaer/Corais on *aition*, Areius and Suetonius, the corrupt
    text at VIII.35, Saumaise's conjecture "Verus", *oregomene*, "A piece of
    bad etymology", and Epictetus iii. 9, 12 — none of it translation, and none
    of it in the staged text.
  - **Illustration captions.** None in Book VIII. The six in the whole PG file
    are at lines 56, 1352, 1747, 3169, 3580 and 5628; the nearest to Book VIII
    is line 5628, "[Illustration: THE FORUM]", which falls inside **Book IX**.
    No `[Illustration` survives anywhere in the staged file.
  - **Running heads, page numbers, catchwords.** None: no digits-only line and
    no all-caps line anywhere between the two book headers except the `VIII.`
    header itself.
  - **Verse and verse citations.** None. Book VIII contains no indented
    (verse-set) line at all outside the footnote bodies, and no source citation
    of the "HESIOD, Works, etc." kind, so the class that produced the V.33 and
    VII.45 problems has nothing to act on here.
  - **Flush-left bracket openers.** Two lines in Book VIII begin flush left with
    an open bracket — 5247 `[unconditionally, or without any reservation]` and
    5249 `[into consideration]`, both in VIII.41 — but neither is a footnote
    opener (the filter tests for a single bracketed capital, `[A]`…`[D]`) and
    both are Long's own bracketed words wrapping onto a new line. They are
    handled as the brackets they are, below.
  **Proof, run rather than argued:** the staged file was copied aside and
  `scripts/build_original_en_from_pg15877.py` re-run from
  `source/pg15877-long-1862.txt` (sha256 `6584df7e…`). The output is
  **byte-identical** to the file already on the branch — `cmp` clean, sha256
  still `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`, 487
  paragraphs, 12 chapters. Nothing changed, so **no accepted book is reopened**
  and Books I–VII's `source-bookN.json` files and acceptances stand untouched.
  The build's own leftover checks print `[X] 0, plus 0, underscore 0,
  dbl-hyphen 0, illustration 0` and four `(Greek:` spans (VII.13 ×2,
  VIII.57 ×2), which is the expected state.
- Book VIII was read in full before any paragraph was drafted: 61 meditations,
  4,543 words, the longest VIII.1 (238 words, on giving up the ambition to be
  seen as a philosopher) and VIII.7 (210 words, on every nature being contented
  with itself), the shortest VIII.38 (13 words, the philosopher's line) and
  VIII.33 (14 words, receive and let go). Its threads: the court and its dead
  (VIII.1, VIII.25, VIII.31, VIII.37); everything done for the common good and
  referred to the gods (VIII.2, VIII.23, VIII.26, VIII.59); the nature of the
  whole as the thing that moves and changes and redistributes (VIII.5, VIII.6,
  VIII.18, VIII.50); hindrance and what it is an evil to (VIII.32, VIII.35,
  VIII.41, VIII.47); the ruling part as a citadel, entered and entered into
  (VIII.43, VIII.48, VIII.61); pain and opinion (VIII.28, VIII.40, VIII.47); the
  sun's rays and the mind that extends rather than spills (VIII.54, VIII.57);
  the first impressions and adding nothing (VIII.29, VIII.49, VIII.50).
- Cross-checked for Book VIII against Standard Ebooks' Long (the edition
  `../PROVENANCE.md` §3 names), fetched 2026-09-12, by a word-level diff of the
  whole book, for the **state of the base text only**; no wording was taken from
  it. Everything the diff turned up is recorded under unresolved source issues
  below: four base-text slips in PG, two places where PG is right and Standard
  Ebooks is wrong, one editorial difference over Long's Greek, and otherwise
  only spelling convention (`unfavorable`/`unfavourable`, `judgment`/`judgement`,
  `neighbor`/`neighbour`, `briers`/`briars`, `Hadrianus`/`Hadrian`,
  `Maecenas`/`Mæcenas`, `to-morrow`/`tomorrow`) and the apparatus Standard
  Ebooks drops.

## Glossary rows extended for Book VIII, before drafting

| Row | Change | Why |
|---|---|---|
| the nature of the whole; the nature of the universe; **the nature of the universal** | **extended** | Long has a third shape for the same idea in Book VIII — "the nature of the universal" at VIII.5, VIII.6 and VIII.35, its only three occurrences in the twelve books. It is the existing "the universal (as a noun) → the whole" row read inside his genitive phrase, so it renders "the nature of the whole" with his other two variants. His *adjective* in "the universal nature" (VIII.35, VIII.50) is a different phrase and keeps its own row, and both appear in VIII.35 and are kept apart there. Committed and pushed before any paragraph of Book VIII was written. |

No new row was needed. Every other recurring term in Book VIII was already
fixed: nature and according to nature, the common nature, the universal nature,
the whole, reason, rational being, social, the ruling part, the divine, the
gods and God, opinion, impressions, imagination, principles, impulse,
indifferent, intelligence and understanding and mind, soul, fame and fame after
death, the elements, happiness, resent, calm, kinsman, disturbance, form and
matter and cause, kindness, a man and men.

## Glossary terms met in Book VIII and how they were rendered

| Long (source) | Candidate | Where |
|---|---|---|
| the nature of the universal | the nature of the whole | VIII.5, VIII.6, VIII.35 — row extended before drafting |
| the universal nature | the universal nature | VIII.35, VIII.50 — Long's adjective phrase, kept distinct; VIII.35 has both phrases and they stay apart |
| the common nature | the common nature | VIII.7 ×2, VIII.46 |
| the universal (bare noun) | the whole | VIII.34 "not to be separated at all from the whole" |
| according to nature; conformably to its proper constitution | according to nature; according to its proper constitution | VIII.12, VIII.45, VIII.46 |
| reason | reason | VIII.7, VIII.40 ×2, VIII.48 |
| rational animal; rational being; rational nature | rational being; rational nature | VIII.7, VIII.35, VIII.39, VIII.41 — Long's "rational animal" at VIII.35, VIII.39 and VIII.41 takes the row's "rational being"; his "irrational animals" at VIII.12 does **not** (see the paragraph note) |
| social (acts, being) | social (acts, being) | VIII.2, VIII.7, VIII.12, VIII.34, VIII.41 |
| unsocial | unsocial | VIII.34 |
| the ruling faculty; the ruling principles | the ruling part | VIII.3, VIII.43, VIII.48, VIII.61 |
| the ruling power | the ruling power | VIII.56 — Long's own distinct phrase, kept |
| the divine cause | the divine cause | VIII.27 |
| God; the gods | God; the gods | VIII.2, VIII.19, VIII.23, VIII.34, VIII.56 — Long's capitals kept where he has them |
| opinion | opinion | VIII.14, VIII.16, VIII.22, VIII.40, VIII.44, VIII.47 |
| impressions; appearances (technical) | impression; impressions | VIII.13, VIII.26 "plausible impressions", VIII.49 ×2 "the first impressions" |
| imaginations | imaginations | VIII.29 — the row added in Book VII, which names VIII.29 |
| principles | principles | VIII.1 ×2, VIII.13 |
| movement (in the sense of impulse) | impulse | VIII.7, VIII.16, VIII.28, VIII.41 |
| movements (of the senses) | movements | VIII.26 — not the impulse sense; see the paragraph note |
| perturbed; perturbation | disturbed; disturbance | VIII.5, VIII.29 |
| affects | feelings | VIII.1 — the row added in Book V, which names VIII.1 |
| vexed | resent | VIII.8 |
| tranquil; tranquillity | calm | VIII.28, VIII.45 |
| benevolent | kindness | VIII.26 — the row added in Book VI; "kindness to his own kind" rather than "kind to his own kind", see the note |
| kindness | kindness | VIII.34 — Long's own noun |
| the cause; the causal nature; the material | cause; causal nature; material | VIII.3, VIII.7, VIII.11, VIII.17 — Long's primary words rendered, his bracketed second words dropped under D11 |
| the elements | elements | VIII.18 |
| posthumous fame; empty fame | fame after death; empty fame | VIII.1, VIII.44 |
| a man; men (generic) | a man; men | throughout |
| kinsmen | kinsmen | VIII.31 |

## Paragraph-level decisions

Only departures from a word-for-word modernisation of Long are listed. Where a
paragraph is not listed, the candidate is Long's sentence with "thou/thee/thy"
changed to "you/your", his verb forms made current ("dost" → "do", "wilt" →
"will", "canst" → "can", "hast" → "have"), and nothing else.

- **VIII.1** — "This reflection also tends to the removal of the desire of empty
  fame, that…" → "This reflection also tends to remove the desire of empty
  fame: that…" (Long's nominalisation and his comma-for-colon are the only
  changes; no clause moves). "[To others]" folded: "throw away the thought of
  how you will seem to others" — the bracket supplies the referent the thought
  is about, and without it the thought has no object. "In such wise as" → "in
  such a way as"; "affects" → "feelings" (glossary). Base-text slip: PG prints
  "How thou shall seem" where Standard Ebooks has "shalt"; the modernised "how
  you will seem" is unaffected either way. "Manly" is **kept**, as Book III kept
  it at III.5 (D10: one rendering per Long word across the edition, and his word
  is not archaic, only old-fashioned).
- **VIII.2** — "On the occasion of every act ask thyself" → "When you do
  anything, ask yourself", the shape Book VII fixed at VII.1 for Long's "on the
  occasion of". Standard Ebooks lacks PG's "the" in "is the work of an
  intelligent living being"; PG is right and is followed. See unresolved source
  issues.
- **VIII.3** — "[Forms]" is a second rendering of "causes" and is dropped under
  D11 (the glossary's form / matter / cause row: where Long gives the other word
  in brackets, the bracketed word goes). "[Or conformable to their pursuits]" is
  an alternative rendering of "the same", introduced by his own "or", and is
  dropped under D11 — Standard Ebooks omits it outright, which confirms it is
  apparatus. "The ruling principles of these men" → "the ruling parts of these
  men" (glossary); Long's shift from "they" to "these men" inside the sentence
  is kept, obscure as it is.
- **VIII.4** — "[Consider] that men will do the same things" → "Consider that
  men will do the same things": the bracket supplies the meditation's only
  verb, and without it the sentence has no main clause. A supplement, folded.
- **VIII.5** — "Be not perturbed" → "do not be disturbed" (glossary); "the
  nature of the universal" → "the nature of the whole" (row extended before
  drafting). Long's dash-colon after "This is the chief thing" is kept as a
  colon.
- **VIII.6** — "The nature of the universal" → "the nature of the whole" (row).
  "To take them away hence" → "to take them away from here". Base-text slip: PG
  prints a stray comma, "to take, them away hence"; Standard Ebooks has none,
  and it is not reproduced. See unresolved source issues.
- **VIII.7** — "It directs its movements to social acts only" → "it directs its
  impulses to social acts only" (glossary: Long's "movement" in the sense of
  *hormē*). "Cause [form]" — "[form]" is a second rendering of "cause" and is
  dropped under D11. Long's list "worth, times, substance, cause, activity, and
  incident" is kept entire, "incident" included: it is his word for what befalls
  a thing, it is one item in a technical list, and no current single word
  carries it without choosing an interpretation.
- **VIII.8** — "[Or ability]" ×2 dropped under D11: both are alternative
  renderings of "leisure", given with Long's own "or". "Not to be vexed at
  stupid and ungrateful people" → "not to resent stupid and ungrateful people"
  (glossary). "Nay even to care for them" → "indeed even to care for them"
  ("nay" as an intensifier is archaic; "indeed" carries the same corrective
  force in one word, where "and" would lose it).
- **VIII.9** — Cross-reference "(v. 16)" dropped.
- **VIII.11** — "What its causal nature [or form]?" → "what is its causal
  nature?": "[or form]" is a second rendering and is dropped under D11. "How
  long does it subsist?" → "how long does it last?", the rendering Book VII
  fixed for Long's "subsists" at VII.23.
- **VIII.12** — Cross-reference "(v. 1)" dropped. "Irrational animals" is
  **kept** and does **not** take the rational-being row: the row exists because
  Long's "animal" means *living creature* and "rational animal" would otherwise
  read as a beast, but here Long does mean beasts — sleeping is what men share
  with them — and "animals" is the accurate current word for that. The same
  reading kept "animal nature" at VIII.41.
- **VIII.13** — "On the occasion of every impression on the soul" → "at every
  impression on the soul" (as VII.1 and VIII.2, and keeping "it" attached to the
  impression). "The principles of Physic, of Ethic, and of Dialectic" → "the
  principles of physics, of ethics, and of dialectic": "Physic" now means
  medicine and "Ethic" is not a current noun, but "physics" and "ethics" are the
  same words in their current form, and "dialectic" is Long's own third word,
  unchanged. The three parts of Stoic philosophy are not renamed — "logic" for
  his "dialectic" would be an import from other translations. Long's capitals
  are lowered with his other mid-sentence capitals.
- **VIII.14** — "Fame and ignominy" → "fame and disgrace" ("ignominy" is not
  current; "disgrace" is the rendering Book VII fixed for Long's "baseness" at
  VII.45 and is the plain word for the opposite of fame).
- **VIII.15** — "Fig-tree" → "fig tree" (current spelling; no other change).
- **VIII.16** — "According to thy own movement and judgment" → "according to
  your own impulse and judgment" (glossary: *hormē*).
- **VIII.17** — "The atoms [chance]" — "[chance]" is a second English word for
  "the atoms" and is dropped under D11, the class of VII.9's "[order]" for
  "universe". Long's atoms-or-gods disjunction stands as he wrote it. "Correct
  [that which is the cause]" → "correct the cause": the bracket supplies the
  object of "correct", without which the imperative is bare, and the next clause
  ("correct at least the thing itself") depends on the contrast. A supplement,
  folded.
- **VIII.18** — "Falls not out of the universe" → "does not fall out of the
  universe"; "they murmur not" → "they do not murmur".
- **VIII.21** — "Turn it [the body] inside out" → "Turn the body inside out":
  the bracket supplies the referent of "it", and the meditation opens on it with
  nothing before it. A referent supplement of the VI.50 "[men]" and VII.2
  "[thoughts]" class, folded. "Short lived" → "Short-lived". "Rememberer" is
  **kept**: Long's four-term chiasmus (praiser / praised, rememberer /
  remembered) is the sentence, and any substitute breaks the pair.
- **VIII.22** — "To-morrow" → "tomorrow", "to-day" → "today" (current spelling).
- **VIII.26** — "To be benevolent to his own kind" → "to show kindness to his
  own kind": the Book VI row renders Long's benevolence family as kindness, but
  "to be kind to his own kind" makes a jingle Long does not have, so the row's
  noun is used instead of its adjective. "To despise the movements of the
  senses" — "movements" is **kept**, not converted to "impulses": these are the
  stirrings that come through sense, not the technical *hormē* the glossary row
  converts, and the row itself says Long's "movement" stays where he does not
  mean impulse. "Plausible appearances" → "plausible impressions" and, at
  VIII.49, "the first appearances" → "the first impressions" (glossary);
  III.16's and VI.16's kept "appearances" is a different case, where Long pairs
  "impressions" and "appearances" in one clause and the distinction is his.
  "The nature of the universe" → "the nature of the whole" (glossary).
- **VIII.27** — "[Between thee and other things]" folded: "There are three
  relations between you and other things". A supplement; without it "three
  relations" has no terms, and the three that follow are exactly those terms.
- **VIII.28** — "Its own serenity and tranquillity" → "its own serenity and
  calm" (glossary for "tranquillity"; "serenity" is Long's own second word and
  stays). "Every judgment and movement and desire and aversion" → "every
  judgment and impulse and desire and aversion" (glossary: the four are
  *krisis*, *hormē*, *orexis*, *ekklisis*).
- **VIII.29** — "Wipe out thy imaginations" → "Wipe out your imaginations" (the
  Book VII row; VII.29 has the same imperative in the singular). "Nor any
  perturbation at all" → "nor any disturbance at all" (glossary). "I see what is
  their nature" → "I see what their nature is".
- **VIII.30** — "Use plain discourse" → "use plain speech", following VII.4's
  "discourse" → "conversation" and VII.48's "discoursing" → "talking": Long's
  "discourse" is speech, and the noun now reads as a treatise.
- **VIII.31** — "[But of a whole race]" folded: "not considering the death of a
  single man but of a whole race". A supplement completing Long's own
  contrast, which the sentence's last clause then repeats ("here consider the
  death of a whole race").
- **VIII.32** — "By acquiescing in the hindrance" → "by accepting the
  hindrance", the rendering Book VII fixed for Long's "acquiesce in" at VII.54
  (its second use in the edition; if a third comes, it is a glossary row).
- **VIII.33** — "Receive [wealth or prosperity] without arrogance" → "Receive
  wealth or prosperity without arrogance": the bracket supplies the object of
  the imperative, and "be ready to let it go" needs the antecedent. A referent
  supplement of the VI.50 "[men]" class, folded. Standard Ebooks runs the words
  as plain text, which confirms they are Long's.
- **VIII.34** — "If thou didst ever see" → "If you have ever seen". "Separated
  at all from the universal" → "separated at all from the whole" (glossary row
  for Long's bare noun). "Cut asunder" is **kept**: it is Long's and it is
  current in this idiom.
- **VIII.35** — One dagger mark (see unresolved source issues). "The nature of
  the universal" → "the nature of the whole" (row extended before drafting) and
  "the universal nature" kept as Long's other phrase, both inside this
  paragraph and kept apart. "The rational animal" → "the rational being"
  (glossary). Glossary renderings were applied inside the dagger clause, on the
  VII.16 ruling: the daggers mark uncertain **Greek**, not uncertain English.
- **VIII.36** — "Let not thy thoughts at once embrace" → "Do not let your
  thoughts at once embrace". "Chidest thy mind" → "rebuke your mind" ("chide" is
  archaic). "Circumscribest it" → "circumscribe it": "circumscribe" is Long's
  own word and current, as Book VII kept it at VII.67.
- **VIII.37** — Base-text defect: PG prints "Does Panthea or **Fergamus** now sit
  by the tomb of Verus?" Standard Ebooks' Long reads **"Pergamus"**, which is
  the name (Pergamus, like Panthea, was one of Verus's household), and PG's F
  for P is a compositor's or scanner's slip, not a reading. **Rendered
  "Pergamus"**, and flagged for the reviewer. "Chaurias" is kept: Standard
  Ebooks has it too, so it is Long's spelling. "Hadrianus" is kept as Long's
  (Standard Ebooks modernises to "Hadrian"; PG governs under D6).
- **VIII.40** — Cross-reference "(vii. 16)" dropped. "Let then the reason itself
  not trouble itself" → "Let the reason itself, then, not trouble itself".
  Long's four dashes marking the internal dialogue are kept.
- **VIII.41** — Cross-reference "(xi. 12)" dropped. "The movements [desires]" →
  "the impulses": "[desires]" is a second English word for "movements" and is
  dropped under D11, and "movements" here is *hormē* and takes the glossary's
  "impulses" (the triad is sense-perception, impulse, and the nature of plants).
  "Absolutely [unconditionally, or without any reservation]" — the bracket is an
  alternative rendering of "absolutely", given with Long's own "or", and is
  dropped under D11. "[Into consideration]" folded: "if you take into
  consideration the usual course of things" — the bracket completes the verb,
  which is bare without it. "The animal nature" is **kept** (twice): Long's
  three-way scale is plant, animal, intelligent, and "animal nature" is the
  standing current English name for the middle term; the rational-being row does
  not reach it, for the reason given at VIII.12. "The rational animal" →
  "a rational being" (glossary).
- **VIII.44** — "Those who rather pursue posthumous fame" → "those who rather
  pursue fame after death" (glossary). Standard Ebooks reads "do consider" where
  PG reads "do **not** consider"; PG is right — the whole meditation is that
  fame-seekers fail to consider it — and PG is followed. See unresolved source
  issues.
- **VIII.45** — "[Change of place]" folded: "Is this change of place sufficient
  reason…" — the bracket supplies the referent of "this", which has no antecedent
  in the sentence. A referent supplement, folded; Standard Ebooks runs the words
  as plain text. "Tranquil" → "calm" (glossary). "Affrighted" → "frightened".
  Base-text defect: PG prints "comformably"; Standard Ebooks has "conformably",
  and the word is rendered "according to" under the glossary row either way.
- **VIII.47** — "Take thy departure then from life contentedly" → "Take your
  departure, then, from life contentedly". Long's three dashes marking the
  internal dialogue are kept.
- **VIII.48** — "When self-collected it is satisfied with itself" → "when,
  collected in itself, it is satisfied with itself" ("self-collected" is not
  current). "The ruling faculty" → "the ruling part" (glossary). "To which he
  can fly for refuge" → "to which he can flee for refuge" and "does not fly to
  this refuge" → "does not flee to this refuge", the rendering Book VII fixed
  for Long's "fly" at VII.71. "Inexpugnable" → "impregnable": Long's word is
  not current, and "impregnable" is the current English word for exactly the
  image he has already set up, a citadel that cannot be taken.
- **VIII.49** — "The first appearances" → "the first impressions" (twice;
  glossary — see VIII.26). "Always abide by" → "always keep to".
- **VIII.50** — "If thou didst find fault because thou seest" → "if you found
  fault because you see": Long's mixed tenses are kept as he has them. "Briers"
  kept (a current American spelling, as the base text has it).
- **VIII.51** — One dagger mark (see unresolved source issues). "[And not a mere
  well]" folded: "How then shall you possess a perpetual fountain and not a mere
  well?" — the bracket is Long's completion of the image, and Standard Ebooks
  runs it as plain text. "Conjoined with" → "joined with"; "potable water" →
  "drinkable water". "External effusion" — Long's "effusion" is **kept** here and
  at VIII.57 (see the note at VIII.57). The dagger clause is otherwise verbatim
  with pronouns modernised.
- **VIII.52** — "[Avoids or] seeks the praise" — the bracket is an alternative
  rendering of "seeks", given with Long's own "or", and is dropped under D11.
  "Know not either where they are or who they are" → "know neither where they
  are nor who they are".
- **VIII.53** — "Thrice every hour" → "three times every hour"; "wouldst thou
  wish" → "would you wish".
- **VIII.54** — "The aerial power for him who is able to respire it" → "the
  power of the air for him who is able to breathe it", following Book VI's
  "respiration" → "breathing" at VI.15 and VI.16.
- **VIII.55** — "[Of one man]" folded: "the wickedness of one man does no harm
  to another". A supplement; Long's contrast is general wickedness against one
  man's, and without the bracket the second half loses its term.
- **VIII.57** — **Long's Greek is kept**, under the exception written into
  `../GLOSSARY.md` at Book VII acceptance: "its rays are called Extensions
  (aktines) because they are extended (apo tou ekteinesthai)". PG prints these
  as `[[Greek: …]]` and the staged original as `(Greek: …)`; the candidate
  carries them as `(aktines)` and `(apo tou ekteinesthai)`, the form VII.13 set.
  **Flagged for the reviewer**, because this case is weaker than VII.13's: there
  the pun is unintelligible without the Greek, whereas here Long's English
  ("Extensions … extended") already carries the etymology, and Standard Ebooks
  moves both words to an endnote rather than printing them in the line. The
  glossary exception is written as a rule about words Long prints in his body
  text, which these are, so they are kept; a reviewer who reads the exception
  as licensing only load-bearing Greek would drop them, and that reading is not
  unreasonable. "In a right line" → "in a straight line"; "enlighten that which
  receives it" → "light up that which receives it" ("enlighten" now means
  *instruct*). "Effused" and "effusion" are **kept** here and at VIII.51: the
  meditation's whole argument is the contrast between effusion and extension,
  Long uses the word three times in the paragraph, and rendering it two ways in
  one book (or replacing it with a phrase in one place and not the other) would
  cost more than the uncommon word does. It is the class of "propriety",
  "circumscribe" and "onsets" kept in Book VII.
- **VIII.58** — "But if thou shalt have no sensation" → "But if you shall have
  no sensation": Long's future conditionals are kept.
- **VIII.61** — "Every man's ruling faculty" → "every man's ruling part"
  (glossary).

## Apparatus dropped or folded

Cross-references dropped (`GLOSSARY.md`, Voice and form) — four:

- VIII.9 "(v. 16)".
- VIII.12 "(v. 1)".
- VIII.40 "(vii. 16)".
- VIII.41 "(xi. 12)".

No verse citation appears in Book VIII: the book contains no verse.

Alternative renderings and labels (D11) — ten brackets, nine drops (VIII.8's is
the same bracket twice):

- VIII.3 "[forms]" — second rendering of "causes".
- VIII.3 "[or conformable to their pursuits]" — alternative rendering of "the
  same", with Long's own "or"; Standard Ebooks omits it outright.
- VIII.7 "[form]" — second rendering of "cause".
- VIII.8 "[or ability]" ×2 — alternative rendering of "leisure", with his "or".
- VIII.11 "[or form]" — second rendering of "causal nature", with his "or".
- VIII.17 "[chance]" — second English word for "the atoms" (the VII.9 "[order]"
  class).
- VIII.41 "[desires]" — second English word for "movements".
- VIII.41 "[unconditionally, or without any reservation]" — alternative
  rendering of "absolutely", with his "or".
- VIII.52 "[avoids or]" — alternative rendering of "seeks", with his "or".

Long's supplements folded into prose — twelve brackets, twelve folds. Each is
marked **referent** where it supplies a referent or object the sentence or the
next sentence depends on, which is the class the VI.50 "[men]" ruling (Book VI
finding 50.1) and the VII.2 "[thoughts]" ruling settled, and which is folded
rather than dropped:

- VIII.1 "[to others]" — **referent**: the object of "how you will seem".
- VIII.4 "[Consider]" — **referent**: the meditation's only verb.
- VIII.6 "[to us]" — completes "familiar".
- VIII.17 "[that which is the cause]" — **referent**: the object of "correct",
  and the contrast the next clause turns on.
- VIII.21 "[the body]" — **referent**: the antecedent of "it", which opens the
  meditation.
- VIII.27 "[between thee and other things]" — **referent**: the terms of the
  three relations that follow.
- VIII.31 "[but of a whole race]" — completes Long's contrast, which the last
  sentence repeats.
- VIII.33 "[wealth or prosperity]" — **referent**: the object of "Receive" and
  the antecedent of "let it go".
- VIII.41 "[into consideration]" — completes the verb "take".
- VIII.45 "[change of place]" — **referent**: the antecedent of "this".
- VIII.51 "[and not a mere well]" — completes Long's image, inside the
  dagger-marked sentence.
- VIII.55 "[of one man]" — completes the contrast with general wickedness.

Twenty-two brackets in all, twelve folded and ten dropped (nine D11 items).

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Several Book VIII
sentences are widely quoted in other renderings (VIII.5 "This is the chief
thing", VIII.21 the body turned inside out, VIII.47 "it is not this thing that
disturbs you, but your own judgment about it", VIII.48 the mind free from
passions as a citadel, VIII.50 the cucumber and the briers, VIII.51 the limpid
spring, VIII.57 the sun's rays, VIII.59 "Teach them then, or bear with them");
each was built from Long's sentence, not from memory of the familiar version.
Proper names are Long's spellings as PG prints them (Caius, Pompeius, Diogenes,
Heraclitus, Hadrianus, Augustus, Lucilla, Verus, Secunda, Maximus,
Epitynchanus, Diotimus, Antoninus, Faustina, Celer, Charax, Demetrius,
Eudaemon, Agrippa, Areius, Maecenas, Panthea, Chaurias, the Pompeii), the one
exception being VIII.37's "Fergamus", corrected to "Pergamus" as a base-text
defect and flagged.

## Unresolved source issues (Long's text)

- **Dagger marks — three, in three sections.** Long marks uncertain Greek
  (`../PROVENANCE.md` §4). Located in the PG text at lines 5193 (VIII.35), 5226
  (VIII.38) and 5345 (VIII.51). The three clauses are named in
  `review-instructions.md` and stand as Long has them, with pronouns modernised
  and glossary renderings applied — the reading Book VI's VI.50 established and
  the Book VII reviewer confirmed at VII.16. Reviewers should not expect the
  candidate to make them clearer than the source. Long's own footnote at
  VIII.35 says "The text is corrupt at the beginning of the paragraph", which
  the dagger marks.
- **VIII.37, "Fergamus".** PG line 5209 prints "Does Panthea or Fergamus now
  sit by the tomb of Verus?" Standard Ebooks' Long reads "Pergamus". The name is
  Pergamus; "Fergamus" is not a name and is not a variant reading but a slip in
  the PG text. **Rendered "Pergamus".** Recorded as a base-text defect, and
  **flagged for the reviewer** since it is the one place in Book VIII where the
  candidate does not follow PG's letters.
- **VIII.45, "comformably".** PG line 5272 prints "if it can feel and act
  comformably to its proper constitution"; Standard Ebooks has "conformably".
  A typographical slip, not a reading; the word is rendered "according to" under
  the glossary row in either case, so nothing turns on it. Recorded as a
  base-text defect.
- **VIII.6, a stray comma.** PG line 4985 prints "to change them, to take, them away
  hence, and to carry them there" — a comma between the verb and its object,
  which is a compositor's slip; Standard Ebooks has none. Not reproduced, on the
  VII.54 precedent.
- **VIII.1, "thou shall".** PG line 4943 prints "How thou shall seem"; Standard Ebooks has
  "shalt". A slip; the modernised "how you will seem" is the same either way.
  Recorded for completeness.
- **VIII.2, PG right and Standard Ebooks wrong.** PG reads "if what I am now
  doing is **the** work of an intelligent living being"; Standard Ebooks drops
  "the". PG is followed, under D6 and because the article is needed.
- **VIII.44, PG right and Standard Ebooks wrong.** PG reads "those who rather
  pursue posthumous fame do **not** consider that the men of after time will be
  exactly such as these whom they cannot bear now"; Standard Ebooks omits the
  "not", which reverses the meditation — the point is that fame-seekers fail to
  consider it, which is why the next sentence asks what their opinion is worth
  to you. PG is followed. Recorded on the precedent of the VII.9 variants and of
  II.14 in `../PROVENANCE.md` §3.
- **VIII.57, Long's Greek and Standard Ebooks' treatment of it.** PG prints
  `[[Greek: aktines]]` and `[[Greek: apo tou ekteinesthai]]` in the body of the
  paragraph, where Long had the Greek in his line; the staged original converts
  them to `(Greek: …)` (`../PROVENANCE.md` §4) and the candidate carries them as
  `(aktines)` and `(apo tou ekteinesthai)`. Standard Ebooks moves both to an
  endnote and prints the sentence without them. They are kept under the
  `../GLOSSARY.md` exception added at Book VII acceptance; **flagged above for a
  ruling**, because unlike VII.13 the English sentence is intelligible without
  them.
- **Spelling convention.** The PG text is an American printing and the staged
  original follows it. Standard Ebooks differs at `unfavorable`/`unfavourable`,
  `judgment`/`judgement`, `neighbor`/`neighbour`, `briers`/`briars`,
  `to-morrow`/`tomorrow`, `Hadrianus`/`Hadrian`, `Maecenas`/`Mæcenas`. PG
  governs (D6); the candidate uses current forms of the same spellings
  (`tomorrow`, `today`, `fig tree`).

## Decisions flagged for the reviewer

Three, each argued above and each open to an explicit ruling:

1. **VIII.37 "Pergamus" for PG's "Fergamus"** — the one place in Book VIII where
   the candidate departs from PG's letters, on the ground that "Fergamus" is a
   slip rather than a reading.
2. **VIII.57's transliterated Greek kept** — the glossary exception added at
   Book VII acceptance covers it by its wording, but this case is weaker than
   VII.13's: Long's English carries the etymology without the Greek, and
   Standard Ebooks prints the sentence without it.
3. **VIII.57 and VIII.51 "effusion" / "effused" kept** — Long's word is
   uncommon rather than archaic, and the VIII.57 argument turns on the
   effusion/extension contrast; a plain substitute would need different words
   in the two places and would break the pair the paragraph is built on.
