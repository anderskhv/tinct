# Tail Batch B — Independent Fidelity Review

Reviewer: independent (did not draft this batch).
Source of truth: `tail-batchB-source.json` (Maude), chapters 341–352 (First Epilogue chs. 4–15).
Candidate: `tail-batchB-candidate.json`.
Drafter's notes reviewed but verified independently: `tail-batchB-notes.md`.

Paragraph indices below are **0-based** (as in the JSON array). Where the drafter's notes
use 1-based or approximate numbering, that is noted.

---

## 1. Structural verification (script-verified, not eyeballed)

Re-ran the checks from scratch rather than trusting the notes.

| Check | Result |
|---|---|
| Chapter count | 12 / 12 ✅ |
| Chapter `number` values match source, in order | ✅ 341–352 |
| Chapter `title` exact string match | ✅ all 12 |
| Paragraph count per chapter | ✅ exact match, all 12 |
| Question-mark count **per paragraph** | ✅ zero mismatches across all 370 paragraphs |
| Paragraph word count ≥75% of source (≥15-word paragraphs) | ✅ zero paragraphs below threshold |
| Merges / splits / reorders / drops | ✅ none detected |
| Proper-noun retention (automated set diff per chapter) | ✅ no name dropped; deltas are apostrophe/possessive style and deliberate transliteration normalization |
| Numerals/dates retained per chapter | ✅ no mismatches |

Per-chapter counts confirmed independently and match the drafter's table exactly:
341/20, 342/14, 343/46, 344/14, 345/25, 346/54, 347/21, 348/36, 349/33, 350/22, 351/52, 352/33.
Chapter `?` totals also match the notes' table (3, 1, 7, 1, 6, 9, 0, 7, 5, 9, 14, 10).

Typography: candidate uses straight quotes/apostrophes throughout. This matches the
convention already in `modern-en-name-normalized.json` (0 curly, 4852 straight in the
first 60 chapters), so it is correct, not a regression.

**Structural verdict: PASS, no findings.**

---

## 2. Findings by chapter

### Ch. 341 — Napoleon/Alexander causation essay + bee parable

**F-1 · LOW · para 6 — weakened temporal/conditional clause**
- Source: "...displaying to the whole world what it was that people had mistaken for strength **as long as** an unseen hand directed his actions."
- Candidate: "...showing the whole world exactly what it was that people had mistaken for strength, **all the while** an unseen hand was directing his actions."
- Effect: "as long as" bounds the mistake to the period of direction (Tolstoy's point: the illusion lasted only while the hand moved him). "All the while" makes it merely concurrent.
- Proposed: "...what people had mistaken for strength for as long as an unseen hand was directing his actions."

No other findings. All named referents (Paris, Austerlitz, Tilsit, Erfurt, the two direct
quotations) intact and in order. See §3 for the bee parable.

### Ch. 342 — Count Ilya's death, Nicholas's debts

No findings. Full detail retained (thirty thousand rubles from Bezukhov, Mitenka's gift
promissory notes, twelve hundred ruble salary, Sivtsev Vrazhok, Sonya's release letter).

### Ch. 343 — Nicholas / Princess Mary reconciliation

No findings. Dialogue complete; the "thousand reasons why" emphasis is preserved (candidate
adds a "he said" attribution the source leaves implicit — a grammatical repair, not a change).

### Ch. 344 — Nicholas as farmer (farming-philosophy passage)

No findings. See §3 for the flagged essayistic paragraph.
Note: para 13's peasant quotation renders "He was a master..." as "He was a real master...",
duplicating the closing "a real master!". Cosmetic only; not logged as a finding.

### Ch. 345 — the fist-ring, Sonya the sterile flower, Bald Hills rebuilt

**F-2 · LOW · para 21 — Gospel quotation expanded beyond the source**
- Source: "'To him that hath shall be given, and from him that hath not shall be taken away.'"
- Candidate: "'For unto every one that hath shall be given, and from him that hath not shall be taken away **even that which he hath**.'"
- Effect: the candidate restores fuller KJV wording Tolstoy/Maude did not print. It is not
  wrong scripturally, but it is added text in a quotation, and the rendering elsewhere is
  modernizing rather than archaizing — so the archaic "unto every one... even that which he hath"
  is also stylistically out of key.
- Proposed: keep the source's shorter form, lightly modernized: "'To the one who has, more will be given; and from the one who has not, even what he has will be taken away.'"

**F-3 · LOW · para 22 — adverb reassigned, sense shifted**
- Source: "...and all this was **unconsciously** accepted from her **with insufficient gratitude**."
- Candidate: "...and all of it was accepted from her, **without complaint** but also without much gratitude."
- Effect: "unconsciously" describes the *household's* unthinking acceptance — the point of the
  sentence. "Without complaint" reads as describing Sonya, or the household's contentment,
  and loses the charge of obliviousness.
- Proposed: "...and all of it was accepted from her without a thought, and without much gratitude."

### Ch. 346 — St. Nicholas's eve, the Nicholas/Mary quarrel and making-up

**F-4 · LOW · para 9 — French formula reversed**
- Source: "messieurs et mesdames" → Candidate: "mesdames et messieurs".
- Tolstoy's order is the odd one (that is part of Nicholas's bluff manner). No reason to flip it.
- Proposed: restore "messieurs et mesdames".

**F-5 · LOW · para 3 — small amplification not in source**
- Source: "...and he replied hastily."
- Candidate: "...and he answered quickly, **almost curtly**."
- Proposed: drop "almost curtly".

Otherwise complete: the nursery scene, little Andrew and three-year-old Natasha, the
Malvinas / "do I love my finger?" speech, Daniel Cooper, and Mary's closing "another sort
of happiness" are all fully rendered.

### Ch. 347 — Natasha married; the dinner/marriage argument

**F-6 · MEDIUM · para 19 — meaning inversion (who argued against what)**
- Source: "...Pierre to his surprise and delight would find in his wife's ideas and actions
  the very thought **against which she had argued**, but divested of everything superfluous
  that in the excitement of the dispute **he had added when expressing his opinion**."
- Candidate: "...Pierre... would find in his wife's ideas and actions the very thought
  **he had argued against**, but stripped now of everything superfluous that, in the heat of
  the dispute, **he had piled onto it while stating his own opinion**."
- Effect: this reverses the sides. In the source the thought is *Pierre's*; Natasha argued
  against it and later, silently, adopted its clean core. The candidate makes it a thought
  *Pierre* argued against — which then contradicts its own second half, where Pierre is the
  one who had padded that same thought while "stating his own opinion". As rendered, the
  sentence is not just altered but internally incoherent.
- **This is the one finding that materially changes meaning and should be fixed before ship.**
- Proposed: "...would find in his wife's ideas and actions the very thought she had argued
  against, but stripped now of everything superfluous that, in the heat of the dispute, he had
  piled onto it while stating his own opinion."

**F-7 · LOW · para 10 — parallel assertion turned into subordination**
- Source: "...for those for whom the purpose of a dinner is the nourishment it affords; **and**
  the purpose of marriage is the family."
- Candidate: "...for people whose purpose in eating dinner is the nourishment it provides,
  **just as** the purpose of marriage is the family."
- Effect: Tolstoy states the second premise flatly (it is a premise of the syllogism that
  follows). "Just as" demotes it to a simile. The argument still lands, because paras 11–13
  restate both premises, but the premise-statement force is softened at the hinge.
- Proposed: "...the nourishment it provides; and the purpose of marriage is the family."

**F-8 · LOW · para 20 — added attribution**
- Source: "And this was not the result of logical reasoning but was a direct and mysterious reflection."
- Candidate: "And this was not the result of any reasoning **on her part**—it was a direct and mysterious reflection."
- Effect: "logical reasoning" is unattributed in the source (it is about the mechanism, not about
  Natasha's mental process). Minor, but "on her part" is added.
- Proposed: "And this was not the result of logical reasoning—it was a direct and mysterious reflection."

### Ch. 348 — Pierre's return, Natasha's outburst, the baby

**F-9 · LOW · para 20 — "unseemly" → "unreasonable"**
- Source: "he knew this outburst was **unseemly** and would blow over in a minute or two".
- Candidate: "...was **unreasonable**...". Pierre's judgment in the source is about propriety
  (and he immediately declines to act on it), not about logic — and "not to blame" in the same
  sentence already covers reasonableness.
- Proposed: "he knew this outburst was improper and would blow over in a minute or two".

Nothing dropped: Prince Theodore's letter, the four weeks' leave, Petya at three months and
"her only boy", the overfeeding, Denisov's "bad likeness of a person once dear", the nurse,
"A lump of flesh."

### Ch. 349 — the household's several worlds; the old countess's psychology

No findings. Young Nicholas's portrait (age fifteen, Platon Karataev, Knight of St. George,
Dessalles) and Pierre's shopping list are complete. See §3 for the psychology passage.

### Ch. 350 — tea, the Bible Society, Anna Makarovna's stockings

**F-10 · LOW–MEDIUM · para 6 — Denisov's speech impediment silently dropped in a proper noun**
- Source: "'Well, and all this idiocy—Gossner and **Tatáwinova**?' Denísov asked. 'Is that weally still going on?'"
- Candidate: "'Well, and all this idiocy—Gossner and **Tatarinova**? Is that weally still going on?' Denisov asked."
- Effect: the candidate keeps "weally" but restores the standard spelling of the name, so
  Denisov's r→w is applied inconsistently inside one speech. It also merges two source
  sentences into one quotation and moves the attribution to the end (cosmetic).
- Proposed: restore "Tatawinova" (and keep the source's tag placement).

Named references all present and correct: Gossner, Golitsyn ("Prince Alexander Golitsyn"),
Arakcheev, the Bible Society, the Semyonovsky regiment, Mary Antonovna, Anna Timofeyevna,
Belova, Anna Makarovna, Milka (and "daughter of the first Milka"), Prince Vasili, Countess
Mary Alexeyevna, Andrusha.

**F-11 · INFORMATIONAL · para 29 of ch. 352 vs. ch. 352 para 1 — "overseer" → "steward"**
(logged under ch. 352 below; noted here because it is the same household role vocabulary.)

### Ch. 351 — the secret-society debate

**F-12 · LOW–MEDIUM · para 9 — same impediment inconsistency, two names**
- Source: "One used to have to be a German—now one must dance with **Tatáwinova** and Madame
  **Kwüdener**, and wead **Ecka'tshausen** and the bwethwen.... Fancy giving the command of the
  **Semënov wegiment** to a fellow like that **Schwa'tz**!"
- Candidate: "...now one has to dance attendance on **Tatarinova** and Madame **Krüdener**, and wead
  **Eckartshausen** and the bwethwen.... Fancy giving command of the **Semyonov wegiment** to a
  fellow like that **Schwa'tz**!"
- Effect: three of the four impediment-marked names are normalized (Tatawinova, Kwüdener,
  Ecka'tshausen) while "wead", "bwethwen", "wegiment" and "Schwa'tz" are kept. The line is
  Denisov's signature joke-through-a-lisp; the partial normalization makes it read as
  inconsistent typography rather than characterization. This directly contradicts the drafter's
  note 4 claim that the impediment "is preserved in the modern rendering exactly as in the source."
- Also "dance **with** Tatawinova" → "dance **attendance on**": in the source it is literal dancing
  at the mystics' gatherings; "dance attendance on" changes it to servility.
- Proposed: "...now one must dance with Tatawinova and Madame Kwüdener, and wead Ecka'tshausen and the bwethwen..."

**F-13 · LOW · para 23 — "enlightenment" narrowed to "education"**
- Source: "the people are tortured, **enlightenment** is suppressed."
- Candidate: "the people are being tormented, **education** is being crushed."
- Effect: *prosveshchenie* in this speech is the broad Enlightenment-era sense (intellectual life,
  free thought), not schooling. "Education" narrows Pierre's indictment.
- Proposed: "the people are being tormented, free thought is being crushed."

**F-14 · INFORMATIONAL · para 37 — Russian loanword "bunt" replaced**
- Source: "If we're not satisfied, let us have a **bunt** of our own."
- Candidate: "...let's have a **wevolt** of our own."
- This is defensible for a modern reading edition (it translates the term *and* carries the
  impediment through, which the source's italicized loanword does not). Logged for the record,
  not as a defect. If the house rule is "preserve loanwords", restore "bunt".

Debate content otherwise verified line by line and intact: Tugendbund (named three times,
"alliance of virtue", "what Christ preached on the Cross", "saved Europe" with the parenthetical
about Russia), Magnitsky, Arakcheev (twice, including the "lead a squadron against you and cut
you down" oath speech), Pugachev, Schwartz, the Semyonovsky regiment, Prince Theodore,
*sans foi ni loi* with its footnote, *mot d'ordre*, *Je suis vot'e homme* with its footnote,
Military Settlements, "the position of assistants", "true conservatives". The two footnote
paragraphs (21, 38) are present as separate paragraphs, preserving alignment.

### Ch. 352 — Countess Mary's diary; the closing scene

**F-15 · LOW · para 29 — role term flattened**
- Source: "Elias Mitrofánych (this was his **overseer**)"; para 1 of the same chapter has a
  distinct "**steward**".
- Candidate calls both "steward", collapsing a distinction the source draws within one chapter.
- Proposed: "this was his overseer".

Diary entries (December 4 Andrusha/Mademoiselle Louise/the ticket; December 5 Mitya and the
pudding), the "man does not live by bread alone" restraint, the eighty thousand rubles for the
Tambov forest, Otradnoe, and the closing icon/prayer are all complete and in order.

---

## 3. The flagged argumentative passages — verification of the drafter's claims

**Claim: ch. 341's six-example bee-teleology parable is complete, in order, none collapsed.
VERIFIED — TRUE.** The parable is at index 18 (the notes' "para 19" in 1-based terms). All six
explanations are present as distinct named examples, in the source's order:
1. the child stung by the bee → bees exist to sting people;
2. the poet → to drink in the fragrance of flowers;
3. the beekeeper → to gather honey;
4. the second beekeeper, who has studied the hive more closely → to feed the young and rear a
   queen, i.e. to perpetuate its kind;
5. the botanist → fertilization of the pistil by male-flower pollen;
6. the second botanist, observing the migration of plants → the bee's role in that migration.
The closing two-step ("not exhausted by the first, the second, or any of the processes the human
mind can discern" → "the higher the intellect rises, the more obvious that the ultimate purpose is
beyond comprehension") is intact, as is the para-19 application to historical figures and nations,
and the para-17 sun/atom-of-ether analogy that sets it up. No inversion. No compression.

**Claim: ch. 347's numbered dinner/marriage argument keeps all four steps intact and in order.
VERIFIED — TRUE**, with one qualifier. The chain is at indices 9–13 (the notes' "paras 6–14" is
loose; the four-step chain proper is 1-based 10–14):
1. index 11 — dinner's purpose is nourishment; two dinners may please more but fail the purpose,
   because the stomach cannot digest them. ✅
2. index 12 — marriage's purpose is the family; many wives/husbands may give more pleasure but
   produce no family. ✅
3. index 13 first half — the synthesis: "not eating more than one can digest, and not having more
   wives or husbands than are needed for a family—that is, one wife, or one husband." ✅
4. index 13 second half — applied to Natasha: she needed a husband; a husband was given her; he
   gave her a family; she saw no need and no interest in imagining otherwise. ✅
The setup premises (index 9, "those who see nothing in marriage but the pleasure"; index 10, the
dinner analogy stated) are also present. Qualifier: F-7 above, the "and" → "just as" softening at
index 10, which weakens the second premise's status without breaking the chain.

**Claim: ch. 347 index 5's absorption claim survives as a standalone general observation.
VERIFIED — TRUE.** "We know that a person has the capacity to become completely absorbed in a
subject, however trivial... no subject so trivial that it will not swell to infinite proportions if
one's whole attention is fixed on it." Full claim, not folded into narrative.

**Claim: ch. 344's farming-philosophy paragraph was rendered clause-by-clause, not compressed.
VERIFIED — TRUE.** At index 3 (the notes' "paragraph 5" is off by one or two depending on base;
the material is at 0-based 3, with the bailiff/elder/cattle continuation at index 4). Everything
is there: dislike of English innovations, contempt for theoretical treatises, factories, expensive
products, expensive seed corn; the whole-estate-not-the-part principle; the full
nitrogen/oxygen/manure/plow list culminating in the peasant laborer as "that most important
agent"; the peasant as tool *and* judge *and* end in himself; and all four stages of the learning
narrative (watch → pretend to direct while actually learning their methods, speech and judgments →
understand tastes, language and hidden meanings and feel akin → only then manage boldly). No
compression anywhere; word count is above source in several clauses.

**Claim: ch. 349's psychology passage keeps the full enumeration of needs and pretexts.
VERIFIED — TRUE.** The notes' "paragraph 19" is actually index 24 (with the enumeration completing
at index 29) — a numbering error in the notes, not a content error. The full list is present and
correctly paired:
- anger → Belova's deafness (dramatized in indices 25–28, including the "It seems a little warmer
  today" / "Oh yes, they've come" exchange) and, additionally, the snuff (too dry, too damp, not
  ground fine enough);
- thought → a game of patience;
- tears → the late count;
- agitation → Nicholas and his health;
- spite → Countess Mary;
- talk (vocal organs, around seven o'clock after the darkened-room rest) → retelling the same
  stories to the same listeners.
The framing claims survive too: eating/drinking/sleeping "but she did not live"; the
very-young-children-and-very-old-people parallel; the stomach/brain/muscles/nerves/liver list;
"what is a goal for people in full vigor was for her plainly nothing but a pretext"; and the
closing memento mori glance. No summarization.

**Meaning inversions in the flagged passages:** one found — F-6, ch. 347 index 19. It sits just
outside the numbered argument (it is in the marriage-dynamics material that follows), so the
argument itself is clean, but it is in the chapter the drafter flagged as most exposed and the
drafter did not catch it.

**Overall:** the "summarize instead of translate" defect this re-render exists to fix does **not**
recur anywhere in this batch. Every essayistic passage is rendered at or above source length,
clause by clause.

---

## 4. Character / relationship consistency

Checked every family line across all twelve chapters.

| Relationship | Source | Candidate | Verdict |
|---|---|---|---|
| Nicholas Rostov ⇄ Princess/Countess Mary | married winter 1813 (ch. 344); at Bald Hills with the old countess and Sonya | identical | ✅ |
| Natasha ⇄ Pierre | married early spring 1813 (chs. 342, 347); 1820 = seven years married (ch. 347) | identical, dates intact | ✅ |
| Prince Andrew | always "Prince Andrew", never "Andrei"; dead; Natasha's private grief; her belief Pierre is jealous of his memory | identical, and the parenthetical belief preserved (ch. 347 index 0) | ✅ |
| Young Nicholas Bolkonsky | Prince Andrew's son, fifteen, raised by aunt Countess Mary, tutor Dessalles, adores "Uncle Pierre", loves uncle Nicholas "with a shade of contempt" | identical; tagged "young/little Nicholas Bolkonsky" at exactly the points the source tags him | ✅ |
| Nicholas Rostov vs. Nicholas Bolkonsky disambiguation | source relies on tags + "his uncle" / "his nephew" | candidate preserves every tag and every uncle/nephew cue; ch. 351 index 17 and ch. 352 indices 23–26 both stay unambiguous | ✅ no confusion introduced |
| Nicholas & Mary's children | Andrew/Andrusha (eldest), three-year-old Natasha, Mitya; a further pregnancy in ch. 346 | all present, ages and birth order intact | ✅ |
| Pierre & Natasha's children | three daughters + son Petya (three months, "her only boy"); eldest daughter Masha; a delicate first child and the wet-nurse/Rousseau episode | all present; "little Masha" (ch. 349) and Petya (ch. 348) consistent | ✅ |
| Sonya | cousin; released Nicholas from the engagement by letter; unmarried; lives in Nicholas's house; "sterile flower" | all preserved, including the Gospel metaphor and the cat simile (see F-2/F-3 for wording notes) | ✅ substance intact |
| Count Ilya Rostov | dies 1813; debts double the estate's value | intact | ✅ |
| Petya Rostov (Natasha's late brother) | referenced in ch. 342's list of blows | intact; not conflated with baby Petya | ✅ |
| Denisov | retired general, Vasili Dmitrich, visits for St. Nicholas's day, malcontent, r→w speech | relationships and rank correct; **speech pattern inconsistently applied** — see F-10, F-12 | ⚠️ minor |
| Pierre's circle | Prince Theodore, the society, Magnitsky/Golitsyn/Gossner/Tatarinova (ch. 350) ⇄ Tugendbund debate (ch. 351) | consistent across chapters | ✅ |

**No relationship contradictions, no dropped or garbled relationship details.** The drafter's
note-4 claims are accurate with the single exception of the speech-impediment claim
("preserved... exactly as in the source"), which F-10 and F-12 disprove for three proper nouns.

---

## 5. Whole-batch flow and warmth

Read continuously, end to end.

It reads as an epilogue should. The register shifts correctly between the three modes in this
range — the cold analytic voice of ch. 341, the domestic comedy of chs. 345–350, and the
argumentative heat of ch. 351 — and the candidate handles all three without flattening any of them
into a single house tone, which is the usual failure of a modern re-rendering.

The warmth is genuinely there and in the right places: Nicholas asleep on the sofa and little
Natasha kissing the hand under his head; "No, Mamma, he doesn't want to sleep. He's laughing";
the finger speech ("I don't love it, but just try cutting it off!"); Pierre coming through the
anteroom into Natasha's storm and out the other side into the nursery with the baby on his palm;
Anna Makarovna's two stockings and Pierre listening for Andrusha's laughter as the sign that all
is well; Mary's diary and Nicholas's "I quite, quite approve, my dearest!"; and Mary's closing
"I would never, never have believed one could be so happy," with the sigh immediately after it.
None of these is rushed or clipped; several are slightly more relaxed in the candidate than in
Maude, which suits the material.

Sentence rhythm is good. The candidate uses em-dash parentheticals where Maude uses
comma-clauses, and breaks a few of Maude's longest periodic sentences at their natural hinge —
both legitimate modernizations that do not lose clauses. Dialogue is more idiomatic
("You ought to be ashamed of yourself!", "That's fine by me") without becoming anachronistic;
I found no modern slang intrusion anywhere in the batch.

Two small texture notes, neither a finding: the candidate occasionally adds a clarifying word
Maude leaves implicit ("You **men** reproach us women", ch. 346 index 42 — correct and helpful),
and it sometimes converts an inline gloss to an em-dash aside ("this was his steward", ch. 352
index 29), which reads better on a phone screen and matches the reader's layout.

The one real seam in the flow is F-12: mid-way through Denisov's most characterful line, three
names snap back to standard spelling while the surrounding words stay lisped. A reader will
register it as a typo rather than as characterization.

---

## 6. Summary verdict

**Findings by severity**

| Severity | Count | IDs |
|---|---|---|
| Critical (blocks ship) | 0 | — |
| Medium (fix before ship) | 1 | F-6 |
| Low–Medium | 2 | F-10, F-12 |
| Low | 11 | F-1, F-2, F-3, F-4, F-5, F-7, F-8, F-9, F-13, F-15, (+F-11 rolled into F-15) |
| Informational | 1 | F-14 |
| **Total** | **15** | |

**Structural integrity:** PASS, clean. 12/12 chapters, exact paragraph parity, exact per-paragraph
question-mark parity, no paragraph under the 75% word-count floor, no name or numeral dropped.

**Argumentative-passage fidelity:** PASS. The documented "summarize instead of translate" defect
does not recur. The ch. 341 bee parable is complete with all six named examples in order; the
ch. 347 dinner/marriage argument keeps all four steps intact and in sequence; the ch. 344 farming
passage and the ch. 349 psychology enumeration are rendered clause by clause, not compressed.
One meaning inversion exists in this batch (F-6) and it is in ch. 347, but it falls just outside
the numbered argument, in the surrounding marriage-dynamics material. The drafter's substantive
claims about these passages are true; two of the drafter's paragraph *numbers* are wrong
(ch. 349's psychology passage is 0-based index 24, not "paragraph 19"; ch. 347's argument proper
is 0-based 9–13), which should be corrected in the notes so later auditors can find them.

**Character/relationship consistency:** PASS. No contradictions, no dropped or garbled
relationship details, and the two-Nicholases hazard is handled correctly everywhere. The only
consistency defect is Denisov's speech impediment being normalized in three proper nouns
(F-10, F-12), which contradicts the drafter's own claim that it was preserved exactly.

**Recommendation: ACCEPT WITH CORRECTIONS.** Apply F-6 (required — the sentence is currently
self-contradictory), then F-10 and F-12 (Denisov's names, cheap and visible to readers). F-1
through F-5, F-7 through F-9, F-13 and F-15 are optional polish and can be batched with whatever
pass touches these chapters next; none of them would block publication. Do not re-render the
batch — the translation quality is high and consistently above the 75% fidelity floor, and a
re-render would risk the parity that this batch currently holds perfectly.
