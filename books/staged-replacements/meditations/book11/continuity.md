# Continuity sheet — Meditations, Book XI (accepted as candidate v2)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V,
VI, VII, VIII, IX and X were accepted, and describing what the frozen draft
actually did, and **updated at acceptance (2026-09-12)** to record the round-1
rulings and the five substitutions in `candidate-v2.json`. Where an entry
describes a change made at acceptance it says so; everything else describes the
frozen v1, which `candidate-v2.json` leaves untouched in 34 of 39 paragraphs.
Term renderings follow `../GLOSSARY.md` (two rows fixed for Book XI
**before** drafting, see below); the pattern for applying review findings follows
the ten earlier `ACCEPTANCE.md` files (decisions D8, D10, D11, D12 and the new
**D13** in the ledger). Book XI is the **third** book drafted under the "shall"
rule fixed at Book VIII acceptance and widened at Book IX acceptance, and the
**first** drafted under D13.

## Source

`source-book11.json` (sha256 `41ff9b07…`) is chapter 11 of
`../meditations-original-en.staged.json` (sha256 `7798607d…`), extracted by
`chapter.number == 11`, paragraphs byte-identical: **39 paragraphs, XI.1–XI.39,
3,902 words**, one per numbered meditation, which is the standard section count
for Book XI.

**Step 1 did not rebuild the staged original, the check was not a re-run of the
build, and the reconstruction's own rules were audited before its output was
looked at.** The file has been rebuilt twice (Book IV step 1, three PG
illustration captions; Book VII step 1, three of Long's footnotes printed flush
left). Two methodological points now govern, both from earlier reviewers. The
Book IX reviewer's: byte-identity to a re-run proves only that the file matches
the script, **which is exactly how the Book IV captions and the Book VII
footnotes survived the first build**. The Book X reviewer's: a reconstruction
that shares a blind spot with the build proves nothing either, so its **rules**
must be tested against the raw text. `../scripts/verify_book11_source.py` was
written from scratch for this book, does both, and reports the audit before the
diff.

**Result: 39 reconstructed paragraphs, matching the staged count, and the only
differences in the whole book are the three dagger marks** at XI.8 (PG 6488),
XI.15 (PG 6544) and XI.17 (PG 6577) — exactly the three `../PROVENANCE.md`
§4 documents as deliberately removed.

Class by class, over PG lines 6376–6816 (after the `XI.` header at 6375,
before the `XII.` header at 6817):

- **Seventeen maximal indented runs**, each enumerated with its indentation
  profile so that the footnote-consumption rule cannot silently swallow Long's
  verse. **Eleven are footnote runs, every one indented four spaces** (openers at
  PG 6398, 6401, 6420, 6459, 6461, 6554, 6647, 6702, 6750, 6753, 6757); the
  consumption rule takes them in seven blocks, because notes separated only by a
  blank line are consumed together. **Three are Long's verse in XI.6** (PG
  6441–6442, 6446, 6450), indented **six** spaces, and **flush-left text stands
  between every verse run and every footnote run**, so no verse can have been
  taken for a footnote body. **Two are verse citations** (PG 6777 `_Odyssey_,
  ix. 413.` indented 26, PG 6780 `HESIOD, _Works and Days_, 184.` indented 17),
  kept in the staged original under D5 and dropped from the candidate as
  apparatus. **One is the second half of footnote [A]'s two-paragraph body** (PG
  6558–6559), which carries no opener of its own and is consumed with the note
  it belongs to.
- **Eleven in-text footnote markers, reconciling exactly with the eleven
  openers**: ten in flush-left text (PG 6388, 6395, 6416, 6437, 6549, 6645,
  6700, 6734, 6742, 6746), all mid-sentence, plus **one at the end of the
  indented verse line 6442** — the same arrangement as Book X's seventeenth
  marker inside Long's Homer couplet.
- **No flush-left footnote opener**, so the VII.45 defect does not recur; and a
  flush-left footnote *body* would have been read by the reconstruction as
  ordinary text and would have shown as a diff. None did.
- **No illustration caption** (the Book IV class).
- **Three standalone short flush-left lines only** — "And again,—", "And,—"
  and "And other things of the same kind." — all three Long's own connectives
  between the XI.6 quotations, none of them a running head, page number or
  catchword.
- **No Greek in the body**: all **seven** `[Greek: …]` spans in the range, on
  **five** indented footnote lines (PG 6398 ×1, 6554 ×2, 6555 ×1, 6702 ×1,
  6757 ×2), are inside footnote bodies, and the staged Book XI contains no
  `(Greek:` at all. *(Corrected at acceptance, finding C1: v1 said "five spans",
  counting lines and calling them spans. The material claim is unchanged and was
  re-verified against the raw range; the numeral matters because the step-1 audit
  is the package's defence against a Book VII-class leak and its figures must be
  reproducible by the next person to run it.)*
- **Underscores** occur only in the two verse citations, and are removed as
  `../PROVENANCE.md` §4 specifies.

**One rule of the build was found undocumented, and is now documented.** The
first run of the reconstruction produced a **fourth** diff, at XI.18: PG line
6645 prints "present ...[A]" and the staged file has "present...". The build has
always closed up a space before `,` `;` `:` `.` `?` `!`; the rule was simply not
in `../PROVENANCE.md` §4. It fires on **six lines of PG #15877, four of them in
the translation body** — 3156 (IV.19), 3779 (V.29), 4712 (VII.58) and 6645
(XI.18) — every one at an ellipsis marking a lacuna in Long's Greek — **and
two outside it**: 4889, four-space-indented inside the long Book VII footnote
whose body runs 4885–4900, and 1092, inside Long's introduction, neither of which
the build ever reads. It **changes no word anywhere**. A typographic normalisation
of the em-dash class, so **no rebuild**: D12's standard is not even engaged,
because no paragraph would change. Recorded in `../PROVENANCE.md` §4 and in the
ledger as **D14** (added at acceptance, finding C3), and reproduced in the
reconstruction, so that it and the staged file are compared on the same rules.
*(Corrected at acceptance, finding C2: v1 listed 4889 as VII.66 and counted five
body firings. PG 4889 is inside a footnote body the build strips, and the
consequence is checkable — **VII.66 contains no ellipsis at all** in the staged
file. Scanning the whole PG file rather than the body turns up 1092 as well, which
the finding does not mention. This strengthens the "changes no word" conclusion
and changes no ruling. Both counts are now asserted by
`../scripts/build_book11_v2.py` against the raw file.)*

sha256 still `7798607d…`, 487 paragraphs, twelve chapters, section profile 17,
17, 16, 51, 36, 59, 75, 61, 42, 38, **39**, 36, and `git status` clean. **No
rebuild was made and no accepted book is reopened.**

## Glossary rows fixed before drafting

Both committed and pushed **before any paragraph of Book XI was written**.

1. **The rational-being row lost "rational soul" from its left column.** The row
   listed "rational animal; reasonable animal; rational being; rational soul →
   rational being", but the edition has never rendered "rational soul" that way:
   the accepted Book VI keeps "a rational soul" at VI.14 (recorded in
   `../book6/continuity.md`) and the accepted Book X keeps "an irrational soul"
   at X.33, which the Book X round-1 reviewer confirmed as "current English and
   Long's own". Where Long names **the soul itself** — XI.1 "the properties of
   the rational soul", XI.39's "souls of rational men" — the phrase is his and
   is **kept**; the row governs his names for the **creature**. XI.1 is the
   third book, so the practice is promoted from the continuity sheets to the row,
   on the "beneficence" (Book VI) and "imagination" (Book VII) precedent. This is
   a **correction of a row that misdescribed the edition**, not a change of
   practice: no accepted paragraph is affected.
2. **The common-good row gained "the common advantage"** (XI.13). Long's fourth
   English shape for the same idea, already rendered "for the common good" in the
   accepted Book IV at IV.12; XI.13 is its second book, so the variant is named in
   the row as "common weal" was in Book V. Long's bare "advantage" for the
   advantage of the whole or of a part (X.6 ×2) is a different phrase and is
   untouched.

No new rendering row was needed.

## Glossary terms met in Book XI

| Long (source) | Rendering used | Where |
|---|---|---|
| the rational soul; irrational | the rational soul; irrational | XI.1, XI.39 — Long's own phrases, kept; the row corrected for this book |
| the nature of the universe | the nature of the whole | XI.5, XI.13 |
| the universal nature | the universal nature | XI.10 — kept as its own term |
| the universal (bare noun) | the whole | XI.20 ×2 — the row extended in Book VI |
| the general interest; the common interest; the common advantage | the common good | XI.4, XI.21, XI.13 |
| benevolent | kind | XI.9, XI.13, XI.15 — the Book VI row |
| vexed; vexation | resent; resentment; resentful | XI.9, XI.18 ×5 |
| dissatisfied | discontented | XI.13 |
| discontented; discontent | discontented; discontent | XI.18, XI.20 ×2 — Long's own word, kept |
| ruling principles; ruling faculty | the ruling parts; the ruling part | XI.18, XI.20 |
| movements (the *hormē* sense) | impulses | XI.20, XI.37 |
| contrary to nature | against nature | XI.16 |
| conformable to | in accordance with | XI.16, XI.20 |
| in a manner | in a way | XI.1, XI.11 |
| opinion; opinions | opinion; opinions | XI.16 ×2, XI.18 ×4, XI.21, XI.23 |
| assent | assent | XI.37 |
| things indifferent; indifferent | indifferent | XI.16 ×2 |
| the elements; dissolution | the elemental parts; dissolution | XI.20 ×2 |
| intelligent part | intelligent part | XI.20 — Long's own phrase, kept apart from the ruling part as at X.8 |
| the superior faculty | the superior faculty | XI.19 — Long's own phrase, kept; not one of the five variants the *hēgemonikon* row collects, and the section's argument is about **superiority**, not ruling (see XI.19 below; finding 19.1) |
| a kinsman | a kinsman | XI.9 |
| a man; men (generic) | a man; men | throughout |

## The "shall" rule

**Third book drafted under the rule** fixed at Book VIII acceptance and widened
at Book IX acceptance. Long has **eight** "shall / shalt" in Book XI; the
candidate keeps **two** and removes **six**.

**Kept (2), both in XI.18, both licensed twice over:**

- "How then **shall** I take away these opinions?" — first person *and* the
  deliberative "shall" of a direct question, the VIII.1 case exactly.
- "I **shall** certainly not be injured" — first person, the II.1 / VIII.45
  case.

**Removed (6), every one a plain future:**

- XI.13 "Suppose any man **shall** despise me" → "Suppose any man **despises**
  me" (a supposition, which is a clause of condition; the plain present, as the
  rule directs).
- XI.13 "**Shall** any man hate me?" → "**Will** any man hate me?" A direct
  question in the third person, but a **rhetorical future** and not a
  deliberative one — it asks whether a thing will happen, not what is to be
  done — so the widened Book IX clause does not reach it. This is the X.11 /
  X.32 ruling in its third book.
- XI.19 "when thou **shalt** reproach thyself" → "when you reproach yourself"
  (clause of time).
- XI.20 "until again the universal **shall** sound the signal" → "until the
  whole again **sounds** the signal" (clause of time).
- XI.21 "an object which **shall** be of a common kind" → "an object which
  **is** of a common kind" (a relative clause stating the object's required
  character; the positive consecutive shape the Book X reviewer ruled on at X.1,
  where the plain present is what the rule directs).
- XI.29 "before thou **shalt** have first learned" → "before you **have** first
  learned" (clause of time, the present perfect for future time).

No second-person "shall" and no plain-future "shall" survives anywhere in the
book. Book XI adds **no** new case to the three third-person plain futures
already standing in accepted books (III.9, VII.8, VII.24), which stay in
`../00-progress-ledger.md` under "Open, not blocking".

## Paragraph-level decisions

- **XI.1** — **"The fruit which it bears itself enjoys" is reordered to "it
  itself enjoys the fruit which it bears."** Long's fronted object leaves a
  modern reader reading "bears itself" as a unit, and the meditation's point is
  the contrast with plants and animals, whose fruit *others* enjoy. Nothing is
  added and nothing dropped; only the order changes, and Long's own "itself"
  keeps the emphasis. "Such like things" → "**things of that kind**" ("such
  like" is dead). **"Comprehends" is rendered two ways in one paragraph, and
  deliberately.** Long's first, "embraces and comprehends the periodical
  renovation", is his older sense *takes in, encompasses*, which now reads as
  "understands" — the exact defect found at VI.9 — so it becomes "embraces
  and **takes in**"; his second, "it comprehends **that** those who come after us
  will see nothing new", governs a that-clause and *is* the modern sense, so it
  becomes "**understands**". "The periodical renovation of all things" → "the
  **periodic renewal** of all things": "renovation" now names the refurbishing of
  buildings and "periodical" now names a magazine, and neither is Long's sense
  (the Stoic *palingenesia*, which Long explains only in a footnote the package
  drops). The X.1 "conservation" → "preservation" case in its second book.
  "In a manner" → "in a way" (glossary). **"The property of Law" keeps Long's
  capital**, as X.25's "he is Law" does. **At acceptance (finding 1.1): "Thus the
  right reason *differs not at all* from the reason of justice" → "does not
  differ at all".** A finite negative without do-support, and the reviewer's
  search of the whole candidate found it was the **only one left standing in Book
  XI** — the identical shape at XI.19 ("comes not from the real thoughts") had
  already been modernised. Two sentences of the same grammar decided two ways in
  one book was the defect. PG's article is kept under D6, and the weight still
  falls on "not at all".
- **XI.2** — "**Distribute** the melody of the voice" → "**divide** the melody
  of the voice": Long's own "division" stands four clauses later in the same
  sentence, so the word is his. "Its several sounds" and "their several parts" →
  "its **separate** sounds", "their **separate** parts": the plural distributive
  "several" is dead in this sense (what survives is legal), and "single", the
  IX.32 / X.8 / X.9 rendering, is right for "each several thing" but wrong for a
  plural. "Ask thyself as to each, if thou art mastered" → "ask yourself as to
  each, **whether** you are mastered": after "ask", "if" now reads as a
  condition. **"Pancratium" is kept** as Long prints it, on the X.9 "Mimi"
  ruling: it is his text and not apparatus, the reader meets it in a list of
  three entertainments and takes it as one, and any gloss would import the
  footnote content the no-glosses rule exists to prevent.
- **XI.3** — "**To** continue to exist" — Long's third limb lacks the "to" that
  his first two have ("either to be extinguished or dispersed or continue to
  exist"), and without it a modern reader attaches "continue" to "readiness". One
  word supplied to restore Long's own parallel. **"As with the Christians" is
  kept exactly**, with no note: it is Long's text and the only such remark in the
  Meditations, and explaining it would be commentary.
- **XI.4** — "[Doing such good]" **folded** — the completion of "never stop".
  "The general interest" → "the common good" (glossary).
- **XI.5** — "The nature of the universe" → "the nature of the whole"
  (glossary). Nothing else.
- **XI.6** — "Even **they** bear them who cry out" → "even **those** bear them
  who cry out": Long's "they … who" is his, but "they" with a following
  restrictive relative now reads as a dangling pronoun; "those … who" is the same
  construction in current English, one word for one word. **The three dramatic
  quotations are kept in Long's words**, joined into the paragraph as the staged
  original has them (verse lines are not preserved as lines anywhere in this
  package). **Two commas before dashes removed**: "And again,—" → "And
  again—", "And,—" → "And—", the practice of eight accepted books (Book VIII
  alone removed twelve). Long's own "especially:—" is kept as he prints it.
  "Magisterial freedom of speech", "mimic artifice" and "dramaturgy" are kept:
  all three are current, and all three are his.
- **XI.7** — "How plain **does it appear** that" → "how plain **it appears**
  that": the interrogative inversion in an exclamation is archaic; the verb is
  untouched.
- **XI.8** — One dagger mark, at "it grows with the rest of the tree, **+** but
  that it has not the same mind with it" (see unresolved source issues); the
  clause stands as Long has it. "**Ingrafted**" → "**grafted on**" ("ingraft"
  is dead; the image is not). **"However, if it often happens, this kind of
  separation, it makes it difficult" → "However, if this kind of separation often
  happens, it makes it difficult"**: Long's right-dislocated subject is a spoken
  shape that a modern reader has to re-read; the words are all his and only the
  order changes.
- **XI.9** — "Benevolent feelings" → "**kind** feelings" (glossary). "To be
  vexed at them" → "**to resent them**" (glossary). **One comma before a dash
  removed**: "deserters from their post,—the man" → "post—the man".
  "Toward" is kept as Long spells it here, against his "towards" elsewhere in the
  same section, because both are current and the variation is his.
- **XI.10** — **"[Things indifferent]" DROPPED under D11**, and this is the one
  bracket in the book where the drop leaves an unfamiliar term standing.
  "Middle things [things indifferent]" is a second English rendering of one
  Greek term (*ta mesa*) beside the primary rendering Long has already given, the
  same shape as X.2's "[social]" and X.15's "[political community]", which the
  Book X round-1 review settled are dropped and not folded; folding it would have
  Marcus name two classes where he names one. Long's "middle things" stands.
  **Flagged below**, because unlike "political" and "law" the primary word here
  is the *less* transparent of the two. **A missing full stop supplied**: PG
  prints "cannot fall short of the skill of art Now all arts do the inferior
  things", with no stop after "art"; Standard Ebooks has the stop, and the
  sentence cannot run on. A typographic slip in PG, not a reading — no word
  changes. **One comma removed** between the long subject and its verb ("that
  nature which is the most perfect and the most comprehensive of all natures,
  cannot fall short"). Cross-reference "(v. 16. 30; vii. 55)" dropped.
  **Base-text point:** PG "the arts imitate the **natures** of things" against
  SE's "the nature of things"; PG's plural is right and is followed — Long's
  own next clause is "the most comprehensive of **all natures**".
- **XI.11** — "In a manner" → "in a way" (glossary). "Let **then** thy judgment"
  → "**Then** let your judgment", Long's word in its current position.
- **XI.12** — **One comma before a dash removed**: "it sees the truth,—the
  truth of all things" → "the truth—the truth of all things". Cross-reference
  "(viii. 41, 45; xii. 3)" dropped. Long's shift from participles to a finite
  verb ("nor dispersed, nor sinks down") is his and is kept. **Confirmed at
  acceptance (finding 12.1, optional, not applied), and logged in the ledger under
  "Open, not blocking" beside the II.5 dangling relative, which is the reviewer's
  own second route.** "Nor sunk down" would complete the parallel, but it would
  make a past participle in a series of *passives* ("is extended … contracted
  … dispersed"), so the soul's sinking would become something **done to it**,
  where Long's finite verb is intransitive and the sinking is the soul's own —
  the Stoic image is a sphere that keeps or loses its figure of itself. Repairing
  the grammar would import an agent the sentence does not have. Nor is Long's
  construction strictly wrong: the negation can be read as scoping over the whole
  verb phrase (*neither is extended … nor sinks down*), which is loose but
  available.
- **XI.13** — "Suppose any man shall despise me" → "Suppose any man despises me"
  and "Shall any man hate me?" → "Will any man hate me?" (the "shall" rule; see
  above). "That I **be** not discovered" → "that I **am** not discovered".
  "Mild and **benevolent**" → "mild and **kind**" (glossary). "The interior
  **[parts]**" **folded** — the noun Long's adjective needs. "Neither
  **dissatisfied** with anything" → "neither **discontented** with anything"
  (glossary). "The nature of the universe" → "the nature of the whole"
  (glossary). "The common **advantage**" → "the common **good**" (the row
  extended for this book). **"Like the great Phocion, unless indeed he only
  assumed it" is kept entire**, including Long's doubt about Phocion, and no note
  is added about who he was.
- **XI.14** — **Byte-identical to Long.** No thou-form, no archaic inflection, no
  glossary term, no bracket, no cross-reference.
- **XI.15** — One dagger mark, inside the clause "Such as a man's character
  **is, +** he immediately shows it in his eyes" (see unresolved source issues);
  **the clause stands as Long has it, including his comma**, on the VI.50 /
  VII.16 / VIII.51 / X.25 practice. "**Forthwith** reads everything in the eyes
  of lovers" → "**at once** reads everything": "forthwith" is dead and X.30
  rendered it "immediately", but Long's own "immediately" stands nine words
  earlier **inside the dagger clause**, so "immediately" here would invent an
  echo Long does not have; "at once" is the same plain word for the same thing.
  **Ruled at round 1 and settled: the disposition is upheld and the word is
  replaced (finding 15.1, applied at acceptance) — "at once" → "instantly".**
  The refusal of X.30's "immediately" is right, and "forthwith" could not stand:
  it is dead, and sitting in the dagger *sentence* does not protect it, since the
  package's dagger practice protects the **clause**, which ends at "in his eyes".
  Only the replacement was questionable. "At once" carries a second current sense
  — *simultaneously* — and it stands immediately before "everything", so "at
  once reads everything" could be taken for "reads everything at the same time",
  which is not the sense: the point is the speed of the reading, not its scope.
  "Instantly" is one word for one word, the same plain register, unambiguous, and
  does not echo "immediately". "Whether he **choose** or not" → "whether he **chooses** or
  not". "A wolfish friendship **[false friendship]**" — **the bracket DROPPED
  under D11**: it is Long's second English rendering of the phrase he has just
  given literally, and the wolf is the point (his footnote refers it to the fable
  of the sheep and the wolves, apparatus which is not imported). "The good and
  simple and **benevolent**" → "the good and simple and **kind**" (glossary).
  **Base-text point:** PG prints "What **are** thou doing, man?" for "art"; SE
  has "art". Both become "What are you doing" under the thou-rule, so the slip
  does not reach the candidate — the X.32 case in this book's form.
- **XI.16** — "If it **be** indifferent" → "if it **is** indifferent"; "even if
  it **bring** no reputation" → "even if it **brings** no reputation" (the same
  archaic subjunctive, decided the same way in the same paragraph).
  "**Perchance** these judgments have imperceptibly got admission" →
  "**perhaps**": the X.36 line, where "perchance" in a plain reported clause
  takes the current word and "perchance" inside heightened quoted speech is kept
  (IX.3; and XI.34 below, where the reason is written out and the test for a third
  case is stated). This is the opposite case: Marcus's own running prose in an
  unquoted reported clause. "Contrary to nature" → "against nature" and
  "conformable to thy own nature" → "in accordance with your own nature"
  (glossary).
- **XI.17** — One dagger mark, inside "and of what it consists, **+** and into
  what it changes" (see unresolved source issues); the clause stands as Long has
  it, **including his comma**, as at XI.15 and X.25. "**Whence** each thing is
  come" → "**where** each thing **has come from**" — this is before the
  dagger. "What kind of **a** thing" → "what kind of thing".
- **XI.18** — the longest meditation in the book, 922 source words, and the one
  with the most apparatus.
  - **"[If any have offended against thee, consider first]" FOLDED**, as "If
    anyone has offended against you, consider first:". This is the largest
    bracket in the package so far and the one the drafter is least certain of; it
    is a **supplement** and not a note about the translation, since it supplies
    the occasion of the nine rules rather than telling the reader anything about
    Long's Greek. Without it XI.18 opens on "What is my relation to men" with no
    frame at all. **Flagged below.**
  - **"[Apollo]" folded as an apposition** — "from the leader of the Muses,
    Apollo" — a **referent** supplement of the VI.50 / VII.2 / X.7 class,
    naming who is meant.
  - **Eight cross-reference spans dropped**, more than any section in the
    package: "(ii. 1; ix. 39; v. 16; iii. 4)", "(viii. 14; ix. 34)", "(vii. 62,
    63; ii. 1; vii. 26; viii. 29)", "(i. 17)", "(ix. 38; iv. 51)", "(vii. 58;
    iv. 48)", "(v. 25; vii. 16)", "(iv. 39, 49; vii. 24)". Each was the last
    thing in its sentence, so a full stop is supplied where Long's parenthesis
    carried it. This accounts for about forty of the paragraph's words and for
    its 0.95 ratio.
  - **Base-text correction, the one departure from PG's letters in Book XI.** PG
    line 6797 prints "thou must equally avoid **nattering** men and being vexed
    at them". "Nattering" is not the word: Long writes "flatter" of exactly this
    at XI.14 ("Men despise one another and **flatter** one another"), the pairing
    is flattery against resentment, and Standard Ebooks reads "flattering".
    Rendered "**flattering**". The VIII.37 "Fergamus"/"Pergamus", IX.34 "pool
    souls"/"poor souls" and X.15 "Let me see"/"Let men see" case in this book's
    form. **Flagged below.**
  - **And in the same clause, PG is right and Standard Ebooks is wrong**: SE
    prints "being **veied** at them" for PG's "vexed". Each text carries a slip
    in the same eleven words, and each gets right what the other gets wrong. PG's
    "vexed" is followed, and takes the glossary's "resenting".
  - "Much vexed or grieved" → "**deeply resentful** or grieved": the glossary
    row gives "resent" for "be vexed at", and "much resentful" is not English, so
    Long's adverb takes the current one. **v1 read "greatly resentful"; corrected
    at acceptance (finding 18.1)** — the adverbs that take *resentful* are
    *deeply* and *bitterly*, and "greatly" was reached for as a workaround, where
    "deeply" is the same register as Long's "much vexed" and keeps the pairing with
    "or grieved". The glossary row is untouched. "Vexation" → "**resentment**", "angry
    and vexed" → "angry and **resentful**", "being vexed at them" → "**resenting
    them**" (glossary).
  - "Men's ruling **principles**" → "men's ruling **parts**" (glossary; the
    IX.18 rendering).
  - "**Wrong-doers**" → "**wrongdoers**", the 1862 hyphenation normalised as
    "some one" → "someone" was at X.36 (finding 36.2). **That ruling reaches the
    indefinite pronoun and the 1862 hyphenations, and not a partitive "some one of
    …"; see XI.26 (finding 26.1).**
  - **One comma before a dash removed**: "and it is this,—that to expect bad
    men" → "and it is this—that to expect bad men".
  - **Long's broken ending is kept**: "nor yet that any bystander may admire, but
    either when he is alone, and if others are present**...**". Long's own
    footnote says "It appears that there is a defect in the text here"; that
    footnote is apparatus and is not imported, and the ellipsis stands, on the
    V.29 and VII.58 precedent. Recorded under unresolved source issues.
  - The nine rules keep their numbering, their order and Long's "Second, …
    Third, …" openings; the tenth present from the Muses keeps its place at the
    end; and "Not so, my child … my child" keeps both vocatives.
- **XI.19** — "**An** evidence of" → "**evidence** of" ("an evidence" is dated).
  "The **diviner** part within thee" → "the **more divine** part within you":
  Long's comparative is current only as a stiff literary form, and the sense is
  the comparison itself. "Comes not from the real thoughts" → "**does not come**
  from the real thoughts"; Long's definite article is kept, since he means what a
  man really thinks and not specifically yours. "The **superior faculty**" is
  **kept** as Long's own phrase, and the reviewer rules on the substance that it
  should be (finding 19.1). It is **not** one of the five variants the
  *hēgemonikon* row collects, and the package's settled practice with Long's own
  phrases the row does not name is to keep them (VI.14 "a rational soul", X.33 "an
  irrational soul", X.8 and XI.20 "the intelligent part"); the section's argument
  — the superior part overpowered by the perishable part — is about
  **superiority**, not about ruling, so "the ruling part" would be the wrong word
  as well as an imported one. That it stands eleven lines from XI.20's "the ruling
  part" is not a drift: they are two different phrases of Long's, kept apart.
  *(v1 said "see the flagged decisions" here and in the glossary-terms table, and
  it was never in the flagged list of five; the dangling pointer is replaced by the
  reason in both places at acceptance, finding 19.1.)* Cross-reference
  "(iv. 24; ii. 16)" dropped, with a full stop supplied.
- **XI.20** — "The **disposition** of the universe" → "the **ordering** of the
  universe": "disposition" now means temperament, which is the sense Long himself
  uses twice in this very book (XI.18 "a good disposition", and X.1's
  "affectionate and contented disposition" in the accepted Book X), and
  "ordering" is his own word for this at IX.1 ("this ordering of things").
  "**Perforce** they remain" → "**of necessity** they remain", Long's own phrase
  at XI.8. "The universal" (bare noun, ×2) → "**the whole**" (glossary).
  "Conformable to its nature" → "in accordance with its nature" (glossary).
  "The **movement** towards injustice and intemperance and to anger and grief and
  fear" → "the **impulse** towards…": the *hormē* sense, where the glossary
  draws the line, against the physical motion the same row leaves as "movement".
  "The ruling **faculty**" → "the ruling **part**" (glossary), while "your
  **intelligent part**" is kept apart from it, as X.8's was and as the Book X
  reviewer confirmed it should be. "**Comprehended** under the **generic** term"
  → "**included** under the **general** term": "comprehended" is the VI.9 case
  again (the older sense now reads as "understood"), and "generic" now means
  unbranded. "[The body]" **folded as an apposition** — "in the compound mass,
  the body" — a referent supplement.
- **XI.21** — "**[Social]" DROPPED under D11**: Long's second English word for
  the one Greek adjective he has already rendered "of a common kind", the X.2
  case exactly, and his primary words stand. "The common **interest**" → "the
  common **good**" (glossary). "An object which **shall be**" → "which **is**"
  (the "shall" rule). **Two commas removed** between subject and verb: "he who
  directs all his own efforts to this object**,** will make all his acts alike"
  (v1) and, **at acceptance (finding 21.1)**, "He who has not one and always the
  same object in life**,** cannot be one and the same all through his life" — the
  first sentence of the paragraph. v1 removed the one and kept the other, in two
  sentences of identical construction (a long "He who …" subject followed
  directly by its verb) in the same paragraph, and recorded only the removal, so
  the inconsistency was not a decision. Removal is the direction of the X-book
  precedent (X.6, X.20, X.33 ×2) and of XI.10 in this book; restoring both would
  have been internally consistent but would have broken with five accepted
  removals. The meditation is about being **one and the same all through**, which
  made it the worst place in the book to leave its own pointing inconsistent.
- **XI.22** — **Byte-identical to Long.**
- **XI.23** — **One comma before a dash removed**: "by the name of
  Lamiae,—bugbears" → "Lamiae—bugbears". **Long's own gloss "bugbears to
  frighten children" is kept**: it is in his text, not in brackets and not in a
  footnote, so it is not apparatus.
- **XI.24** — **Byte-identical to Long.** "Lacedaemonians" kept in Long's
  spelling under D6, as X.27's Latin name forms are.
- **XI.25** — **Byte-identical to Long.**
- **XI.26** — "The **[Ephesians]**" **folded**, the brackets simply removed:
  Long brackets the name because the manuscript reading is uncertain, not because
  the word is his supplement or his second rendering, so this is the same kind of
  thing as a dagger — a mark of textual doubt — and the package's practice
  with those is that the mark goes and the word stands. His footnote, which
  reports Gataker's conjecture, is apparatus and is not imported. **Confirmed at
  round 1 and settled** (see below). "**Some one** of the men of former times"
  → "**one or another** of the men of former times". *(v1 read "one of the men of
  former times" and filed it under the X.36.2 normalisation; **corrected at
  acceptance, finding 26.1**.)* **The X.36.2 ruling does not reach this case.** At
  X.36 "some one" is the indefinite pronoun, printed as two words in 1862; here
  "some one of the men of former times" is a **partitive** — one or another of
  them, indefinite as to which — and the X.36 normalisation would have produced
  the ungrammatical "someone of the men". Seeing that, v1 deleted "some" instead;
  but deleting it makes an indefinite definite, turning "one or another of the men
  of former times" into "one of the men", which reads as one particular exemplar
  the precept has in mind, where the Ephesian precept is to keep *some* exemplar or
  other constantly before you. Keeping Long's "some one of" was weighed and
  declined: it is readable, but in a modern edition the two-word spelling reads as
  the pronoun *someone* mis-set, which is the misreading X.36.2 exists to prevent.
  "One or another of" is plain current English, holds the indefiniteness exactly,
  and adds two words and no sense. **This paragraph is now the book's maximum word
  ratio, 1.04.**
- **XI.27** — "Their purity and **nudity**" → "their purity and **nakedness**":
  "nudity" is now almost exclusively of human bodies, and "nakedness" is the word
  the accepted Book III already uses for Long's same noun at III.11 ("in its
  nakedness"). The closing line "For there is no veil over a star" is Long's own
  explanation and is kept.
- **XI.28** — **Byte-identical to Long.**
- **XI.29** — "Wilt thou be able" → "will you be able"; "before thou shalt have
  first learned" → "before you have first learned" (the "shall" rule).
- **XI.30** — "A slave **thou art**" → "A slave **you are**". Long's fronted
  complement is kept, because the sentence is a taunt and the fronting is the
  taunt.
- **XI.31** — **Verse citation "Odyssey, ix. 413." dropped** as apparatus, with
  the verse citations of V.33 and the cross-references. Long's one line stands.
  Its ratio, 0.67, is the whole of that drop: six words of Long's text against
  three of his citation.
- **XI.32** — **Verse citation "HESIOD, Works and Days, 184." dropped**, as
  XI.31. Ratio 0.64, again entirely the citation.
- **XI.33** — "**Mad-man's**" → "**madman's**" (the X.36.2 normalisation).
  Citation "(Epictetus, iii. 24, 87)" dropped, with a full stop supplied.
- **XI.34** — "**To-morrow**" → "**Tomorrow**" (the same normalisation).
  "**Perchance** thou wilt die" → "**perchance** you will die": **"perchance" is
  KEPT here**, because it stands inside Epictetus's quoted whisper, which is the
  IX.3 case (Marcus's heightened quoted cry) and not the XI.16 or X.36 case (a
  plain reported clause). **Upheld at round 1 (finding 34.1, optional, not
  applied), with the reason written out as the reviewer asks, since a Book XII
  drafter meeting a third case would otherwise have only the citation to go on.**
  What makes this heightened is not *who says it* but **what kind of utterance it
  is**: a sentence composed to be said over and over as a discipline, framed twice
  as quoted speech (Epictetus reported by Marcus, quoting the father's whisper to
  himself), set off by quotation marks, and immediately treated by the interlocutor
  as a *form of words* ("But those are words of bad omen") rather than as
  information. A formula's solemnity is its whole function; "perhaps" would make it
  a casual aside and leave the objection that follows unmotivated. **The test for a
  third case is therefore: is the word inside a quoted utterance whose form is
  itself the point?** Not: who is speaking. Citation "(Epictetus, iii. 24, 88)" dropped, and the
  full stop it carried is supplied **inside** the closing quotation mark, where
  the sentence ends. Long's dashes round "But those are words of bad omen" are
  kept exactly.
- **XI.35** — "Which **exists not yet**" → "which **does not exist yet**".
  Citation "(Epictetus, iii. 24)" dropped, with a full stop supplied.
  **Base-text point:** PG "the dried grape, **are all** changes" against SE's
  "**all are** changes"; PG followed under D6, and nothing turns on it.
- **XI.36** — Citation "(Epictetus, iii. 22, 105)" dropped, with a full stop
  supplied. Ratio 0.71, entirely that drop: ten words of Long against four of
  citation. "Free will" is Long's phrase and is kept.
- **XI.37** — **Two brackets DROPPED under D11**: "an art **[or rules]**", which
  is the III.6 "[or, practically]" shape exactly, Long's own "or" and all; and
  "as to avoidance **[aversion]**", his second English word for *ekklisis*. His
  primary words stand. "His **movements**" → "his **impulses**" (the *hormē*
  sense; glossary). "That they **be** made … that they **be** consistent" → "that
  they **are** made … that they **are** consistent" (the XI.16 subjunctive).
- **XI.38** — **Byte-identical to Long.**
- **XI.39** — **Byte-identical to Long.** Socrates's dialogue keeps its dashes,
  its six turns and Long's unpunctuated final question.

## Apparatus dropped or folded

**Cross-references dropped: eleven spans in four paragraphs.**

- XI.10 "(v. 16. 30; vii. 55)".
- XI.12 "(viii. 41, 45; xii. 3)".
- XI.18 ×8 — see the XI.18 entry above.
- XI.19 "(iv. 24; ii. 16)".

**Verse and source citations dropped: six.** XI.31 "Odyssey, ix. 413."; XI.32
"HESIOD, Works and Days, 184."; and the four Epictetus references at XI.33,
XI.34, XI.35 and XI.36. All are Long's references to his sources, of the class
`../GLOSSARY.md` and D5 name as apparatus, and the accepted Book V dropped the
Hesiod citation at V.33 on the same ground. **Standard Ebooks omits every one of
the seventeen references in this book**, which corroborates the classification
without deciding it.

**Brackets in Long's Book XI: eleven. Six folded, five dropped under D11, none
under D13 — 6 + 5 + 0 = 11.** (The arithmetic is asserted by the mechanical
check in `README.md` from the enumerated list below, on the Book X finding C1
ruling, so a numeral cannot drift from the list.)

*Folded — six*, of which the ones marked **referent** supply a word the
sentence's syntax needs, under the VI.50 / VII.2 rulings and the Books VIII, IX
and X applications:

- XI.4 "[doing such good]" — the completion of "never stop".
- XI.13 "[parts]" — the noun for Long's adjective "the interior".
- XI.18 "[If any have offended against thee, consider first]" — the occasion
  of the nine rules; the largest supplement in the package. Flagged.
- XI.18 "[Apollo]" — **referent**: who the leader of the Muses is.
- XI.20 "[the body]" — **referent**: what the compound mass is.
- XI.26 "[Ephesians]" — not a supplement at all but Long's mark of an
  uncertain manuscript reading; the brackets are removed and his word stands, as
  a dagger's mark is removed and the clause stands. Flagged.

*Dropped under D11 — five, each a second English rendering of one Greek word
beside the primary rendering Long has already given:*

- **XI.10 "[things indifferent]"** — for "middle things". Flagged, because
  here the primary word is the less transparent of the two.
- **XI.15 "[false friendship]"** — for "a wolfish friendship". The wolf is the
  image and the image is the point.
- **XI.21 "[social]"** — for "of a common kind". The X.2 case exactly.
- **XI.37 "[or rules]"** — for "an art". The III.6 "[or, practically]" shape,
  Long's own "or" included.
- **XI.37 "[aversion]"** — for "avoidance".

*Dropped under D13 — none.* Book XI contains no bracketed translator's note of
the X.23 kind. The nearest thing, XI.26's "[Ephesians]", is a mark of textual
doubt rather than a remark about the translation, and is folded.

**Verse:** three quotations, all in XI.6, kept in Long's words and joined into
the paragraph with spaces as the staged original has them.

**Punctuation changed**, in full.

- **Six of Long's commas before em dashes removed** (XI.6 ×2, XI.9, XI.12,
  XI.18, XI.23), which is the practice of eight accepted books — Book VIII
  alone removed twelve, and the source's count in this book falls from six to
  nought.
- **Three commas removed between a long subject and its verb** (XI.10 "that
  nature which is the most perfect and the most comprehensive of all natures**,**
  cannot fall short"; XI.21 "he who directs all his own efforts to this object**,**
  will make all his acts alike"; and, **at acceptance, finding 21.1**, XI.21 "He
  who has not one and always the same object in life**,** cannot be one and the
  same all through his life"). The X.6 / X.20 / X.33 class. v1 removed two and
  recorded two; the third is the sentence v1 left, in the same paragraph and the
  same construction as one it removed.
- **One comma added**, and only one in the whole book: XI.20's fold of "[the
  body]" as an apposition, "in the compound mass**,** the body". It is the mark
  the fold needs, as X.13's em dash was.
- **Sixteen full stops supplied**, fifteen of them where a dropped
  cross-reference or citation had carried the sentence's own terminal
  punctuation — XI.10, XI.12, XI.18 ×8, XI.19, XI.33, XI.34 (inside the
  closing quotation mark), XI.35, XI.36 — and one repairing a PG typographic
  slip (XI.10, "the skill of art Now all arts", where Standard Ebooks has the
  stop). XI.31 and XI.32 needed none: Long's line already ends in a full stop
  before the citation.
- **No other punctuation of Long's is touched**, and no comma of his that
  separates a subject from its verb is removed inside a dagger clause (XI.15,
  XI.17), where the practice is that his pointing stands.

**Spaced em dashes inherited from the source, not authored:** XI.6's
"especially:— " before the first quotation is Long's own and is kept, on the
X.34 ruling (finding 34.1) that the package's "em dashes without spaces" governs
the candidate's own dashes and not the source's.

**No expansion.** The short meditations stay at Long's length, and **seven
paragraphs are byte-identical to Long** — XI.14, XI.22, XI.24, XI.25, XI.28,
XI.38 and XI.39, more than any book so far. The word ratio for the book is
**0.9777** (3,902 → 3,815) after v2, the lowest in the package (v1: 0.9772,
3,813 words; the two words are XI.26's "or another"), and **all but two words of
the shortfall are apparatus**: eleven cross-reference spans, six source citations
and five dropped brackets, 89 words in all. *(Refinement taken from the round-1
review, which computed every paragraph's ratio rather than accepting the
aggregate: the apparatus-bearing paragraphs net −87 and the non-apparatus
paragraphs net −2 — −1 XI.7, −1 XI.29, −2 XI.2, −2 XI.9, +3 XI.1, +1 XI.3. v1's
sheet said "the whole of the shortfall is apparatus", true to within two words.)* The minimum paragraph ratios are XI.32
(0.64), XI.31 (0.67) and XI.36 (0.71) — three of the shortest meditations in
the book, whose entire difference is a dropped citation of five, three and four
words respectively — then XI.33 (0.87), XI.12 (0.91) and XI.35 (0.92), again
dropped citations and cross-references. Of the paragraphs that carry no
apparatus at all, **none is below 0.96** — the minimum is XI.7 at 0.964, which
the reviewer verified paragraph by paragraph — and twenty-two sit between 0.99
and 1.02. XI.18, the longest meditation, is 0.954, and its 42 missing words are
the eight dropped cross-reference spans exactly. The maximum after v2 is **1.04 at
XI.26** (finding 26.1); in v1 it was 1.02 at XI.3, where one "to" is supplied.

## Nothing imported from other translations

Every candidate paragraph was drafted from Long's text of the same numbered
section and from nothing else. Standard Ebooks' Long was consulted **after the
draft was written**, for the state of the base text only, by a word-level diff of
the whole of Book XI fetched 2026-09-12; no wording was taken from it, and the
places where it differs are recorded below. The widely quoted passages keep
Long-specific turns that the familiar modern versions do not have: XI.1 "the
fruit which it bears"; XI.3 "without tragic show"; XI.15 "like a man who smells
strong"; XI.18 "Not so, my child"; XI.22 "the alarm and trepidation of the town
mouse"; XI.27 "there is no veil over a star"; XI.33 "To look for the fig in
winter".

## Unresolved source issues (Long's text)

**Three dagger marks in three sections**, PG #15877 lines 6488 (XI.8), 6544
(XI.15), 6577 (XI.17), matching `../PROVENANCE.md` §4. Long uses the dagger for a
place where the Greek is corrupt. Each clause stands as Long has it, with
pronouns modernised and glossary renderings applied, and nothing is made clearer
than the source:

- **XI.8 (PG 6488)** — inside the clause: "it grows with the rest of the tree,
  **+** but that it has not the same mind with it." Kept as Long has it.
- **XI.15 (PG 6544)** — inside the clause: "Such as a man's character **is, +**
  he immediately shows it in his eyes." **Long's comma is kept**, though by
  modern punctuation it separates a subject from its verb, on the X.25 ruling.
- **XI.17 (PG 6577)** — inside the clause: "and of what it **consists, +** and
  into what it changes." **Long's comma is kept**, for the same reason.

**Long's own broken text at XI.18**, "but either when he is alone, and if others
are present…", where his footnote says "It appears that there is a defect in the
text here". The footnote is apparatus and is not imported; the ellipsis is
reproduced as the staged original has it, on the V.29 and VII.58 precedent.

**Base-text points, from a word-level diff of the whole book against Standard
Ebooks' Long (fetched 2026-09-12):**

- **XI.18, a PG slip. FLAGGED.** PG "avoid **nattering** men"; SE "avoid
  **flattering** men". Rendered "flattering". **The one departure from PG's
  letters in Book XI.**
- **XI.18, PG right and Standard Ebooks wrong, in the same clause.** PG "being
  **vexed** at them"; SE "being **veied** at them", which is not a word. PG
  followed.
- **XI.8, PG right and Standard Ebooks wrong.** PG "and again to **become** a
  part which helps to make up the whole"; SE "and **be to come** a part", which
  is garbled. PG followed.
- **XI.10, PG right and Standard Ebooks wrong.** PG "the arts imitate the
  **natures** of things"; SE "the **nature** of things". Long's own next clause
  is "the most comprehensive of **all natures**". PG followed.
- **XI.6, PG right on grammar.** PG "which gradually **sank** down"; SE "**sunk**
  down". PG followed.
- **XI.10, a PG typographic slip.** PG has no full stop after "the skill of art";
  SE has it. Supplied. No word changes.
- **XI.15, a slip in PG that SE gets right, and it does not reach the
  candidate.** PG "What **are** thou doing"; SE "What **art** thou doing". Both
  become "What are you doing" under the thou-rule. The X.32 case.
- **XI.1, an open variant.** PG "Thus **the** right reason differs not at all
  from the reason of justice"; SE "Thus **then** right reason differs…". Both are
  English and both make sense. PG followed under D6, and nothing in the sentence
  turns on it.
- **XI.35, an open variant.** PG "are all changes"; SE "all are changes". PG
  followed under D6.
- **XI.18, XI.33–XI.36, Standard Ebooks omits every cross-reference and every
  Epictetus citation**, which corroborates (without deciding) their
  classification as apparatus.
- **XI.18 and XI.33, typographic.** PG "wrong-doers" and "mad-man's"; SE
  "wrongdoers" and "madman's". Normalised with SE, under the X.36.2 ruling on
  "some one" → "someone", which is a convention of 1862 and not a reading.
  **Bound on that ruling, fixed at acceptance (finding 26.1): it reaches the
  indefinite pronoun and the 1862 hyphenations, and it does NOT reach a partitive
  "some one of …", where normalising would produce the ungrammatical "someone of
  the men" and deleting "some" would make an indefinite definite.** XI.26 is the
  package's first partitive of this shape and is rendered "one or another of".
- **Standard Ebooks prints Book XI in more typographic paragraphs than PG**,
  breaking out XI.6's three verse quotations as separate blocks. None is a
  section break: PG prints each section whole, 39 is the standard section count
  for Book XI, no text differs on either side of any break, and extra paragraphs
  here would break the 487-paragraph alignment the whole package is built on. The
  same point arose at IX.28 and X and was ruled the same way both times.

## Decisions flagged for the reviewer — all settled at round 1

Five were flagged for an explicit ruling and one was offered for confirmation;
two further points were put to the reviewer with reasons. **All eight were ruled,
and the drafter is upheld on every one.** Nothing is left open.

1. **XI.18 "flattering" for PG's "nattering" — UPHELD, "and it is not a close
   call".** "Natter" is a nineteenth-century dialect verb for chattering that does
   not enter standard written English until much later and makes no sense paired
   against "being vexed at them"; Long writes "flatter" of exactly this at XI.14
   eleven sections earlier; the sentence's shape is flattery against resentment;
   Standard Ebooks reads "flattering"; and an `fl` ligature read as `n` is the
   ordinary class of slip. Same class as VIII.37, IX.34 and X.15, each upheld at
   round 1 of its own book. It remains **the one departure from PG's letters in
   Book XI**.
2. **XI.18's nine-word bracket folded — UPHELD, and D13 must NOT acquire a size
   threshold.** The decisive ground is stronger than the one v1 gave: **the
   bracket carries the enumeration.** "[If any have offended against thee,
   consider first]" contains the word *first*, and the meditation then runs
   "Second, … Third, … Fourth, … Fifth, … Sixth, … Seventh, … Eighth,
   … Ninth," and closes "Remember these **nine rules**". Drop the bracket and
   the list has nine members and eight labels — an incoherence on the page. So
   folding is not merely the better reading; it is the only one that leaves Long's
   text consistent with itself. It also passes D13's own test cleanly: the bracket
   is in Marcus's voice and is about the occasion of the rules, not about Long's
   handling of the Greek. **And size is not the test** — X.23's dropped
   translator's note is *also nine words*, and is dropped on its content; a size
   threshold would fail the very case D13 was written to get right. The ledger's
   D13 row now says so explicitly. (The colon after the bracket is Long's own,
   outside the bracket, and the candidate keeps it — confirmed.)
3. **XI.10's "[things indifferent]" dropped under D11 — UPHELD, with the opacity
   answered rather than denied.** In shape it is X.2's "[social]" and X.15's
   "[political community]" exactly, so D11 fires and folding would make Marcus name
   two classes where he names one. The objection — that here the primary word left
   standing is the *less* transparent of the two — is real, and each alternative is
   worse: folding contradicts the Book X ruling on identical shapes; extending the
   glossary's "indifferent" row to swallow "middle things" is folding by another
   name and overwrites Long's word with his gloss; a clarification breaches the
   no-glosses rule. The cost is also smaller than it looks — the clause supplies
   its own sense ("justice will not be observed, if we either care for middle
   things, or are easily deceived…"), where "middle things" is plainly the class
   one should *not* care about, and the accepted Book II already gives the reader
   Long's own gloss at II.11. **Recorded here so the question does not reopen at
   Book XII.**
4. **XI.26's "[Ephesians]" folded as a mark of textual doubt — CONFIRMED.** Long
   brackets the name because the manuscript reading is uncertain (his footnote
   reports Gataker's conjecture of *Epikoureion* for *Ephesion*), not because it is
   his supplement or his second English word for something. It is a **textual
   mark**, and the package's settled practice with textual marks is that the mark
   goes and the word stands — exactly what it does with Long's daggers, three of
   them in this same book. D11 cannot reach it (there is no primary rendering for
   it to be an alternative to) and D13 cannot (it says nothing about Long's
   *handling*; it marks the state of the *Greek*). **This is the first bracket of
   its class in the package**, and a sentence naming it is added to the ledger's
   D13 row, where the three-way classification lives, against the chance that Book
   XII contains another.
5. **XI.15's "at once" for "forthwith" — the reasoning UPHELD, the word replaced**
   (finding 15.1, applied at acceptance; see XI.15 above). v2 reads
   **"instantly"**.
6. **"Pancratium" kept untranslated at XI.2 — CONFIRMED**, the X.9 "Mimi" case
   exactly: Long's text and not apparatus, third in a list of three entertainments
   where the reader takes it from its company, reused later in the same section so
   that a replacement would have to be made twice, and no gloss possible without
   importing the footnote the no-glosses rule excludes.
7. **The four Epictetus references dropped — CONFIRMED.** They are Long's
   parenthetical citations of Arrian's *Discourses* by book, chapter and section,
   the same apparatus class as "(vi. 28)" and as the Hesiod citation dropped at
   V.33. The objection that they point outside the Meditations to a source Marcus
   names does not survive contact with the text: **Marcus's own naming of Epictetus
   is in the body and is kept** — "said Epictetus" and "No word is a word of bad
   omen, said Epictetus" at XI.34, "Epictetus also said" at XI.37 — so no
   attribution is lost. What is dropped is a chapter-and-verse locator to a
   nineteenth-century edition of another book. Standard Ebooks omits every one.
8. **The seven byte-identical paragraphs — CONFIRMED as a real result, not an
   omission.** Each was checked against the accessibility standard on its own:
   XI.14, XI.22, XI.24, XI.25, XI.28, XI.38 and XI.39 contain no thou-form, no
   archaic inflection, no glossary term needing a row, no bracket, no
   cross-reference and no dagger-affected wording. XI.39's "What do you want" is
   Long's genuine plural; XI.24's "Lacedaemonians" is the X.27 name class; XI.25
   reads in current English as the refusal it is. "Long's English in these seven is
   already the modern edition's English. Leaving them identical is correct;
   changing them would have been the error."

**Also settled at round 1, without having been flagged:** the step-1 no-rebuild
finding (upheld by a reconstruction the reviewer wrote from scratch with a
*different* footnote rule — classify maximal indented runs by indentation and
drop the four-space runs — which produced the same 39 paragraphs and the same
three dagger-only diffs, after which the rules were audited class by class against
the raw range and agreed line for line); the newly found space-before-punctuation
rule (rightly reproduced, rightly documented rather than rebuilt out, and now a
decision row of its own, **D14**, with its scope corrected under finding C2); the
"shall" audit (all eight classified independently, the drafter's report matched
exactly, XI.13's "Shall any man hate me?" confirmed a **rhetorical** future on the
X.11 / X.32 ruling, and no new case added to the three third-person plain futures
in the ledger); **D13 confirmed not to fire anywhere in Book XI**, tested bracket
by bracket against its own voice-and-subject test — "Book XI is not evidence that
D13 was unnecessary; it simply has nothing of the X.23 kind"; the 0.977 ratio
(ruled on paragraph by paragraph, not in aggregate); and the absence of any import
from another translation (no inserted phrase anywhere except the seven documented
words).
