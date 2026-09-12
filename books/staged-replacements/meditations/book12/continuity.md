# Continuity sheet — Meditations, Book XII (accepted candidate v2)

**Updated at acceptance (2026-09-12) to describe `candidate-v2.json`**, the
accepted file, after the round-1 independent review (`review/findings-v1.md`).
Ten substitutions in eight paragraphs and seven record corrections are marked
**[v2]** at the entries they change; `changes-v1-to-v2.md` lists every one by
paragraph ID against the finding it answers. `candidate-v1.json` stays frozen at
sha256 `8665adc8…` and is never edited.

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V,
VI, VII, VIII, IX, X and XI were accepted, and describing what the frozen draft
actually did. Term renderings follow `../GLOSSARY.md` (two rows fixed for Book
XII **before** drafting, see below); the pattern for applying review findings
follows the eleven earlier `ACCEPTANCE.md` files (decisions D8, D10, D11, D12,
D13 and the new **D14** in the ledger). **Book XII is the last book of the
Meditations and the last of this package.**

## Source

`source-book12.json` (sha256 `1e7a003b…`) is chapter 12 of
`../meditations-original-en.staged.json` (sha256 `7798607d…`), extracted by
`chapter.number == 12`, paragraphs byte-identical: **36 paragraphs, XII.1–XII.36,
3,131 words**, one per numbered meditation, which is the standard section count
for Book XII.

**Step 1 did not rebuild the staged original, the check was not a re-run of the
build, the reconstruction's own rules were audited before its output was looked
at, and the reconstruction derives the chapter by a rule of a different KIND from
the build's.** Three methodological points now govern, each from an earlier
reviewer. The Book IX reviewer's: byte-identity to a re-run proves only that the
file matches the script, which is how the Book IV captions and the Book VII
footnotes survived the first build. The Book X reviewer's: a reconstruction that
shares a blind spot with the build proves nothing either, so its **rules** must be
tested against the raw text. The Book XI reviewer's: the strongest form of the
check is a second rule set written **from a different angle**, because two rules
of different kinds reproducing the same file to the byte cannot share a blind
spot. `../scripts/verify_book12_source.py` does all three and prints the audit
before the diff.

**The build's rule** is a state machine: on a line matching an `[A-D]` opener,
consume every following indented *or blank* line until flush-left text resumes.
**The rule here** is per-block and keys on the indentation profile, with no
opener state and no consumption: split the range into blank-line-separated
blocks; a block whose first line is flush left is **body**; a block all of whose
lines are indented by **four or more** is **apparatus**; a block all of whose
lines are indented but whose *minimum* indentation is **less than four** is
**verse**, joined into the body paragraph before it; a body block opening `N. `
starts a section and any other body block continues the one before.

**Result: 36 reconstructed paragraphs, matching the staged count, and the only
difference in the whole book is the single dagger mark** at XII.16 (PG 6963) —
exactly the one `../PROVENANCE.md` §4 documents as deliberately removed. The
dagger was deliberately **left in** the reconstruction so that it would surface
as a diff and could be counted; the paragraph differs by that one `+` and by
nothing else.

Class by class, over PG lines 6818–7174 (after the `XII.` header at 6817, before
`INDEXES.` at 7175):

- **Fourteen maximal indented runs**, each enumerated with its indentation
  profile. **Eleven are footnote openers, all indented four spaces** (PG 6883,
  6888, 6969, 6974, 7017, 7052, 7069, 7079, 7123, 7168, 7170). **Two are
  unmarked continuations of a footnote body**, consumed with the note they belong
  to: PG 6886, and PG 7092–7102 (the second half of the long note opened at
  7079, separated from it by a single blank line). **One is verse** — Long's line
  of Empedocles at PG 6866, `"All round and in its joyous rest reposing;"`,
  indented **three** spaces.
- **A finding about method, not about the text.** PG 6886 is the second half of
  footnote [A]'s body and is indented **nine** spaces, not four. The Book XI
  reviewer's own alternative rule — "classify maximal indented runs by
  indentation and drop the **four-space** runs as footnotes" — would have kept it
  and leaked `[Greek: Sphairos kykloteres monie perigethei gaion.]` into the body
  of **XII.4** — **[v2, finding C1]**, corrected from "XII.3", which this sheet,
  `README.md`, `review-instructions.md` and `../PROVENANCE.md` §4 all carried. The
  round-1 reviewer did not reason about the alternative rule; it implemented it
  and ran it on the range, and the block at PG 6886 stands between the end of
  XII.4 (PG 6881, "of ourselves.") and the start of XII.5 (PG 6890), so "the
  paragraph before it" is XII.4. XII.3 ends at PG 6872 and the whole of XII.4
  stands between. **The conclusion is unchanged and is kept verbatim.** The rule used here drops every run whose minimum indentation is four
  **or more**, and then checks, run by run and by content, that each such run is
  either a footnote opener or the continuation of the run before it with only
  blank lines between. Both continuations are accounted for that way. A number
  taken from one book does not transfer to the next; the *shape* of the rule does.
- **Eleven in-text footnote markers, reconciling exactly with the eleven
  openers**: ten in flush-left text (PG 6879, 6964, 6967, 7008, 7046, 7062, 7073,
  7111, 7155, 7160) plus **one at the end of the indented verse line 6866** — the
  same arrangement as Book X's seventeenth marker inside Long's Homer couplet and
  Book XI's eleventh inside the XI.6 quotation.
- **No flush-left footnote opener**, so the VII.45 defect does not recur; and a
  flush-left footnote *body* would have been read by the reconstruction as
  ordinary text and would have shown as a diff. None did.
- **No illustration caption** (the Book IV class).
- **Twenty-four short standalone flush-left lines**, every one of them the wrapped
  tail of a paragraph ending in terminal punctuation; **no running head, no page
  number, no catchword**.
- **No Greek in the body**: all **four** `[Greek: …]` spans in the range, on four
  lines (PG 6886, 6969, 6971, 7069), are inside indented footnote bodies, and the
  staged Book XII contains no `(Greek:` at all.
- **Underscores** occur only inside footnote bodies (PG 7087, 7089, 7094) and are
  removed as `../PROVENANCE.md` §4 specifies.
- **D14 checked**: the space-before-punctuation rule documented at Book XI **does
  not fire anywhere in Book XII's range**; it is reproduced in the reconstruction
  regardless, so the two are compared on the same rules. The `--` → em dash rule
  and the underscore rule are reproduced too.

sha256 still `7798607d…`, 487 paragraphs, twelve chapters, section profile 17,
17, 16, 51, 36, 59, 75, 61, 42, 38, 39, **36**, and `git status` clean. **No
rebuild was made and no accepted book is reopened.**

## Glossary rows fixed before drafting

Both committed and pushed **before any paragraph of Book XII was written**.

1. **The *daimōn* row's left column gained two of Long's shapes it did not name**
   — "the divinity which is planted in his breast" and "the divinity within
   thee". The row listed only his "deity" forms, but the edition has always
   rendered the "divinity" forms the same way: the accepted Book III has "not to
   defile **the god within** his breast" at III.16. XII.1's "thy ruling faculty
   and **the divinity within thee**" is the same phrase in a fourth shape. This is
   a **correction of a row that under-described the edition**, not a change of
   practice: no accepted paragraph is affected. Long's *bare abstract* "the
   divinity" (XII.5 ×2, XII.14) is a different thing and belongs to the row that
   renders it "the divine".
2. **The beneficence row gained the adverb "benevolently"** → "kindly". It occurs
   exactly once in the whole work, at XII.5 ("arranged all things well and
   benevolently for mankind"), and takes the family's word as the noun
   ("benevolence" → "kindness", V.5) and the adjective ("a benevolent
   disposition" → "a kind disposition", VI.47) already do.

No new rendering row was needed.

## Glossary terms met in Book XII

| Long (source) | Modern edition | Where |
|---|---|---|
| conformably to nature; according to nature | according to nature | XII.1, XII.12, XII.35, XII.36 |
| conformably to piety / to justice / to the laws | in accordance with piety / justice / the laws | XII.1 ×2, XII.36 — not the nature row; the Book X rule that "in accordance with" carries Long's "conformably" where he is not speaking of nature |
| the ruling faculty | the ruling part | XII.1, XII.3, XII.33 |
| the divinity within thee | the god within | XII.1 (row corrected for this book; III.16 precedent) |
| thy own daemon [to the god that is within thee] | the god within you | XII.3 — the row's own citation; the bracket is a second English rendering of the word the row renders, and is dropped under D11 (flagged below) |
| the Deity; the divinity (bare abstract) | the divine | XII.5 ×3, XII.14, XII.23 ×2, XII.26 ×2 |
| benevolently | kindly | XII.5 (row extended for this book) |
| providence | providence | XII.1, XII.14 ×2, XII.24 |
| perturbations | disturbance | XII.3 |
| impressions (of sense) | impressions | XII.3 |
| the universal (bare noun) | the whole | XII.23 ×2 |
| the universal nature | the universal nature | XII.23, XII.26 |
| the common nature | the common nature | XII.32 |
| the general interest | the common good | XII.23 |
| the formal; the material (as nouns) | form; matter | XII.18, XII.29 — both named in the row |
| affects | feelings | XII.19 — named in the row |
| opinion | opinion | XII.8, XII.22 ×3, XII.25, XII.26 |
| principles | principles | XII.9, XII.24 |
| social (end) | social | XII.20 |
| movement (physical) | movement | XII.31 — the *hormē* row leaves physical motion alone |
| flesh and breath | flesh and breath | XII.1, XII.3, XII.14 |
| intelligence; understanding; mind | intelligence; understanding; mind | XII.2, XII.3 ×2, XII.14, XII.19, XII.26 ×2 — Long's three words kept apart |
| fame | fame | XII.2, XII.8, XII.27 |
| the present | the present | XII.3, XII.26 |
| a man; men (generic) | a man; men | throughout |
| the pancratium / the pancratiast | the pancratiast | XII.9 — kept untranslated on the X.9 "Mimi" and XI.2 "pancratium" rulings (offered for confirmation below) |

## The "shall" rule

Long has **ten** "shall / shalt" in Book XII. The candidate **keeps one** and
removes nine. Each is classified below against the rule fixed at Book VIII
acceptance and widened at Book IX acceptance.

**Kept (1).** XII.4, "than to what **we shall** think of ourselves" — **first
person**, which the rule keeps as current English in its own right (II.1 "I shall
meet the busybody", VIII.45, X.6 ×5, XI.18 ×2). **Flagged below**, because its
pair four words earlier — "what our neighbors **shall** think of us" — is third
person and takes "will", so the sentence carries "will" and "shall" side by side
in one comparison. The rule as written produces exactly that, and the traditional
English distribution it reproduces (third-person "will", first-person "shall") is
unremarkable; but it is the first place in the package where the two stand in the
same construction, and a reviewer may prefer both as "will".

**Removed (9), every one a plain future.**

- XII.1 ×4 — "when thou **shalt** be near to thy departure" (clause of time →
  "when you are near"), "thou **shalt** respect only" (inside the same
  conditional → "you respect only"), "if thou **shalt** be afraid" and "if thou
  **shalt** fear" (clauses of condition → "if you are afraid", "you fear").
- XII.3 ×2 — "if thou **shalt** separate" → "if you separate"; "if thou
  **shalt** strive" → "if you strive". Clauses of condition.
- XII.4 — "what our neighbors **shall** think of us" → "will think". A plain
  future in a noun clause, third person.
- XII.15 — "and **shall** the truth which is in thee and justice and temperance
  be extinguished?" → "**will** … be extinguished?". A **rhetorical future**,
  not a deliberative question: the lamp's light in the first half keeps its
  splendour until it is put out, and the question asks whether the truth in you
  will in fact be put out earlier. The X.11 / X.32 / XI.13 disposition, and the
  widened IX.41 clause (indirect deliberative questions) does not reach it.
- XII.36 — "for what **shall** be a complete drama is determined by him who was
  once the cause of its composition" → "for what **will** be a complete drama…".
  A plain future in a noun clause. "What is to be a complete drama" was weighed
  and declined: it reads more naturally, but "is to be" carries an appointment or
  obligation that Long's plain future does not, and the rule directs "will".

**Long's "wilt" — decided once for the book at v2 [finding 1.1 with 3.2].**
The "shall" rule governs "shall / shalt" and says nothing about "wilt", so
neither of v1's two treatments broke a rule; but v1 dropped it at XII.1 ("if thou
wilt take no notice of all the past" → "if you take no notice") and kept it at
XII.3 ("if thou wilt separate, I say" → "if you will separate, I say"; "and wilt
make thyself" → "and will make yourself"), which is the same modal in the same
position decided two ways two sections apart. **v2 aligns on the present**, which
is what English uses in an if-clause and what XII.1 already had: XII.3 reads "if
you separate, I say, from this ruling part" and "and make yourself like
Empedocles' sphere". "If you will separate" reads as volitional — *if you are
willing to* — which imports a shade Long's plain future does not carry, and "and
will make yourself" inside a protasis is marked English. Long's three "wilt" in
Book XII are therefore all rendered by the plain present, and the class is
recorded here so that it is not left unruled.

**After finding 4.1 the candidate keeps none of Long's ten "shall / shalt".**
XII.4's first-person "shall" — the one v1 kept — becomes "will"; see the XII.4
entry. The rule's other instances, all of them unpaired, stand untouched in the
accepted books.

**Book XII adds no new case to the three third-person plain futures already
standing in accepted books** (III.9, VII.8, VII.24), which stay in
`../00-progress-ledger.md` under "Open, not blocking" and are not reopened.

## Paragraph-level decisions

- **XII.1** — "Conformably to piety / to justice" → "**In accordance with**
  piety / justice": Long's "conformably" collapses to "according to nature" only
  where he speaks of nature; elsewhere the edition uses "in accordance with"
  (the Book X rule). **One comma added**, after "In accordance with piety":
  Long punctuates his two parallel sentences differently ("Conformably to piety
  that thou mayest…" without, "Conformably to justice, that thou mayst…" with),
  and Standard Ebooks has the comma in both. Deciding two identical constructions
  in one passage alike is the XI.21 ruling, applied here at the draft rather than
  at review. **"But if thou shalt fear" → "but because you fear"**: Long opens the
  correlative with "not because" and closes it with a second "if", which does not
  complete the pair in modern English; "because" completes the pair he started and
  no word is lost. "Thy ruling faculty" → "your **ruling part**"; "the divinity
  within thee" → "the **god within** you" (both glossary; the second on the row
  corrected for this book). "Circuitous" is current English and is Long's, and
  stands.
- **XII.2** — "The **[ruling principles]**" **DROPPED under D11**: Long's second
  English rendering of the one Greek word he has already rendered "the minds", the
  X.2 "[social]" and XI.21 "[social]" case exactly; his primary word stands.
  "Bared of the material **vesture**" → "**stripped of** the material
  **covering**": "vesture" is dead, and "bared of" now reads as exposure rather
  than removal. "If thou also **usest thyself** to do this" → "if you also
  **accustom yourself** to do this". "Rid thyself of **thy much** trouble" →
  "rid yourself of **much** trouble" ("thy much trouble" is not English). "He who
  **regards not** the poor flesh" → "he who **does not regard** the poor flesh"
  (a finite negative without do-support, the XI.1 finding 1.1 class). "Raiment" →
  "**clothing**". "Such like externals" → "**externals of that kind**" (the XI.1
  ruling on "such like"; see the note on IX.1 under unresolved source issues).
- **XII.3** — "The things are three of which thou art composed" → "**The things
  of which you are composed are three**", Long's words in the order modern English
  needs. **"[Life]" DROPPED under D11, twice** — his second English rendering of
  "a little breath", where the glossary keeps Marcus's three-part self in his own
  words ("flesh and breath"). **"[To the god that is within thee]" DROPPED under
  D11**: Long's own English gloss of "daemon", which is exactly the phrase the
  glossary's *daimōn* row uses to render the word, so the row renders "thy own
  daemon" as "**the god within you**" and the bracket is a second rendering of it.
  **Flagged below**, because the result is textually indistinguishable from folding
  and because this is the very section the glossary row cites as its authority.
  "The external **circumfluent vortex** whirls round" → "the **vortex that flows
  round you from outside** whirls about": "circumfluent" is not current English,
  and its sense — flowing around — is what the phrase is rendered by; "vortex" is
  Long's and is current. "This ruling **faculty**" → "this ruling **part**"
  (glossary). "Free from **perturbations**" → "free from **disturbance**"
  (glossary). **One comma before an em dash removed** ("the present,—then" →
  "the present—then"). Long's Empedocles line is kept in his words and in his
  quotation marks, joined into the paragraph as the staged original has it; his
  footnote on the corrupt Greek is apparatus and is not imported. Cross-reference
  "(ii. 13, 17; iii. 5, 6; xi. 12)" dropped, with a full stop supplied.
- **XII.4** — "Bid him **to think** of nothing and **to design** nothing" → "bid
  him **think** … and **design** nothing" (after "bid", the bare infinitive is
  the current form). "So much more respect **have we to** X **than to** Y" → "so
  much more respect **do we have for** X **than for** Y". The "shall" pair: see
  the inventory above and the flagged decisions.
- **XII.5** — "Well and **benevolently**" → "well and **kindly**" (the row
  extended for this book). "The divinity" ×2 and "the Deity" → "**the divine**"
  (glossary, bare abstract). "Be thou convinced" → "be convinced". **Base-text
  point:** PG "disputing with the **Deity**"; Standard Ebooks prints "**diety**",
  which is not a word. PG followed.
- **XII.6** — "**Practise** / **practised**" → "**practice** / **practiced**",
  the package's American spelling rule, which PG itself follows everywhere else
  (it prints "practiced" at XI.26). No word changes.
- **XII.7** — **Byte-identical to Long.** No thou-form, no archaic inflection, no
  glossary term, no bracket, no cross-reference.
- **XII.8** — "The formative principles **[forms]**" **DROPPED under D11**:
  Long's second English rendering of one Greek word, the III.6 "[or,
  practically]" class. "Formative principles" is current English and is his
  primary rendering, and the sentence supplies its own sense ("of things bare of
  their coverings").
- **XII.9** — "**Pancratiast**" kept as Long prints it, on the X.9 "Mimi" and
  XI.2 "pancratium" rulings: it is his text and not apparatus, and the sentence
  glosses it by contrast — the gladiator drops the sword he uses and is killed,
  the pancratiast always has his hand. Offered for confirmation below.
- **XII.10** — **Byte-identical to Long.**
- **XII.11** — **Byte-identical to Long.**
- **XII.12** — "That which happens **conformably to** nature" → "**according
  to** nature" (glossary). Cross-reference "(ii. 11, 12, 13; vii. 62; 18 viii.
  17)" dropped, with a full stop supplied; **the stray "18" inside it is a PG
  typographic slip that never reaches the candidate**, because the whole span is
  apparatus (recorded under unresolved source issues). Ratio 0.81, the lowest in
  the book, and the whole of it is that nine-word span.
- **XII.13** — **Byte-identical to Long.**
- **XII.14** — "A **fatal** necessity and an invincible order" → "a **necessity
  of fate** and an invincible order": "fatal" now means deadly, and Long means *of
  fate*. **"Invincible" is kept** in both places, because it is current English
  and because Long's repetition ("invincible order" … "an invincible necessity")
  is the sentence's own hinge. "Make thyself worthy of the help of the
  **divinity**" → "**the divine**" (glossary). "Even if the tempest **carry** thee
  away" → "**carries** you away" (the archaic subjunctive, the XI.16 class).
  "Propitiated" is formal but current, is Long's, and stands. Cross-reference
  "(iv. 27)" dropped, with a full stop supplied. **Base-text point:** PG "a
  confusion without **a** governor"; SE omits the article. PG followed.
- **XII.15** — "**[Before thy death]**" **FOLDED** — the completion Long's own
  question needs, and without it the question loses the comparison with the lamp,
  which burns to the end. **One comma added [v2, finding 15.1; v1 added two]**, marking off the long
  relative: "will the truth which is in you**,** and justice and temperance be
  extinguished before your death?" Without it, "the truth which is in you and
  justice and temperance" reads as one relative clause with three objects of
  "in". **v1's second comma is removed**: it closed a parenthesis, making "and
  justice and temperance" an aside about the truth rather than two further
  subjects of "be extinguished", and it sat between a compound subject and its
  verb — exactly the comma this book removes at XII.2 and XII.16, so the XI.21
  ruling (decide two identical constructions alike) was being applied against
  itself. Dropping both and leaving Long unpunctuated was weighed and declined on
  the reviewer's own ground: the first comma resolves a genuine ambiguity, not an
  unevenness (Book IX finding 7.1).
  "**Shall** … be extinguished" → "**will**" (a rhetorical future; see the
  inventory).
- **XII.16** — One dagger mark, inside the clause "If then thou art irritable,
  **+** cure this man's disposition" (see unresolved source issues); **the clause
  stands as Long has it, including his comma**, on the VI.50 / VII.16 / VIII.51 /
  X.25 / XI.15 practice. "**[Say]**" **FOLDED**, with **one comma added** before
  it, which the fold needs: "having done wrong**,** say, How then do I know…".
  "He who would not have the bad man do wrong**,** is like" — **one comma removed**
  between a long subject and its verb (the X.6 / X.20 / X.33 / XI.10 / XI.21
  class). "Would not have the fig-tree **to bear** … and infants **to cry** … and
  the horse **to neigh**" → "would not have the fig tree **bear** … and infants
  **cry** … and the horse **neigh**": after "have" in this causative sense, modern
  English takes the bare infinitive. "**Fig-tree**" → "**fig tree**" (the X.36.2
  normalisation of 1862 hyphenation).
- **XII.17** — **"[For let thy efforts be—]"**: the brackets are removed and
  Long's words stand, with his dash, as **a mark of textual doubt** — the class
  settled at Book XI for XI.26's "[Ephesians]" and written into the ledger's D13
  row at that acceptance. Long brackets the clause because the Greek breaks off
  there; his footnote says "There is something wrong here, or incomplete." The
  footnote is apparatus and is not imported, and the broken clause is reproduced
  as Long leaves it, on the V.29 / VII.58 / XI.18 precedent that a defect the
  reader is entitled to meet is neither mended nor hidden. **Flagged below**,
  because it is the first time the XI.26 class is applied to a bracket that is a
  whole clause rather than a word.
- **XII.18** — "Into **the formal, the material**, the purpose, and the time" →
  "into **the form, the matter**, the purpose, and the time" (glossary; XII.18 is
  named in the row). **[v2, finding 18.1]** v1 read "its form, its matter, its
  purpose": the row licenses "form" and "matter" for Long's nominalised
  adjectives, but not the change of determiner. Long's articles are kept — one
  fewer departure for the same clarity, and it matches XII.29, where "its" is
  Long's own word.
- **XII.19** — "The various **affects**" → "the various **feelings**" (glossary;
  XII.19 is named in the row). **One comma before an em dash removed** ("in my
  mind,—is it fear" → "in my mind—is it fear"). Cross-reference "(v. 11)"
  dropped, and the question mark it carried is supplied where the sentence ends.
- **XII.20** — "Do nothing **inconsiderately**" → "do nothing **without
  consideration**": "inconsiderately" is current English but now means *without
  regard for other people*, which is not the sense — Long means without
  deliberation. Rendered the same way at XII.24, where Long uses the word again.
- **XII.21** — Cross-reference "(ix. 28)" dropped, with a full stop supplied.
- **XII.22** — "Like a mariner who has **doubled the promontory**" is **kept**:
  "double" in the nautical sense of rounding a headland is current English, it is
  Long's, and the sentence explains itself in its next four words ("you will find
  calm … a waveless bay"). The X.9 "gravity" reasoning — Long's own current word
  stands unless something is wrong with it.
- **XII.23** — **Two of Long's resumptive constructions repaired**: "nor he who
  has done this act, does he suffer any evil" → "**nor does he who has done this
  act suffer** any evil", and "nor he who has terminated this series at the proper
  time, has he been ill dealt with" → "**nor has he who has terminated this series
  at the proper time been** ill dealt with". Long is reproducing Greek word order
  with a resumptive pronoun, which modern English does not have. **[v2, finding
  23.1] The ground recorded in v1 — "no word is added or dropped" — was false and
  is withdrawn.** Long's resumptive pronoun is removed with the construction it
  belongs to: **two words in all, "he" in each clause** ("nor he who has done this
  act, **does he** suffer"; "nor he who has terminated this series at the proper
  time, **has he** been ill dealt with"). No other word is added, dropped or
  reordered beyond the fronting the repair requires, and the two commas that held
  the resumptions open go with them. The repairs themselves are allowed at round
  1; it was their stated reason that was checkable and wrong. "If
  it **cease** at its proper time" → "if it **ceases**" (the archaic subjunctive).
  "Useful to **the universal**" and "congruent with **the universal**" → "**the
  whole**" (glossary, Long's bare noun). "Not opposed to the **general interest**"
  → "the **common good**" (glossary). "Moved by **the Deity** … in the same manner
  with **the Deity**" → "moved by **the divine** … in the same manner **as** the
  divine". **Base-text point:** PG "moved towards the same **thing** in his mind";
  SE "the same **things**". Nothing of sense turns on it; PG followed under D6.
- **XII.24** — "Do nothing either **inconsiderately**" → "either **without
  consideration**" (as XII.20). "If thou **shouldst** … and **shouldst** look
  down … and **shouldst** see" → "if you **should** … and **should** look down …
  and **should** see"; "thou **wouldst** see" → "you **would** see". **Base-text
  point:** PG "the number of beings who dwell **all** around in the air"; SE omits
  "all". PG followed.
- **XII.25** — "Thou art saved" → "you are saved". Long's colon kept.
- **XII.26** — "Is a god and **is an efflux of** the Deity" → "is a god and
  **an outflow from** the divine" (**[v2, finding 26.1]**; v1 had "flows out
  from", which turned the second of Long's two parallel predicate nominals into a
  finite verb phrase and lost the parallel — "outflow" keeps his noun, is one word
  for one word, and leaves the II.4 precedent untouched, since II.4 renders a
  different sentence): "efflux" is now a technical word for a discharge
  of fluid or gas, and the accepted Book II already renders Long's same noun as a
  flowing ("what administrator of the universe your existence **flows from**",
  II.4). "The universal nature" and "the present time" are as the glossary has
  them.
- **XII.27** — "And **in fine** think of the eager pursuit" → "and **in short**"
  (the X.26 rendering). "**[Or Rufus at Velia]**" **DROPPED under D11**: it is
  not a second English rendering of a Greek word but a second *construal* of the
  same Greek letters — Long telling his reader that the name may be read another
  way — which is the same species of remark, addressed to the reader and not
  part of Marcus's sentence. **Flagged below.** **Base-text points:** PG
  "Stertinius at **Briae**"; SE "**Baiae**". **Rendered "Baiae"** — Briae is not
  a place, Baiae is the Roman seaside resort that belongs in exactly this list of
  retreats beside Tiberius at Capreae, and a single-letter slip is the ordinary
  explanation. **Flagged below.** PG "Fabius **Catellinus**"; SE "**Catullinus**".
  **PG kept** under D6 and the X.27 ruling on Latin name forms. **[v2, finding
  27.1] The reason is restated:** v1 said "nothing in the sentence decides between
  them", which invites a later editor to reopen it as an oversight. Nothing in the
  *sentence* does — but Catullinus is the form the standard editions carry and an
  attested cognomen of the gens Fabia, and Catellinus is not attested. **The
  departure threshold is what settles it**: the package departs from its base text
  where the printed word names nothing (Briae) or makes the sentence say the
  opposite of its argument (XII.29), and "Catellinus" meets neither — it is a
  possible Latin formation and the sentence works with it. PG stands under D6. The names of Lucius Lupus, Stertinius, Tiberius and
  Velius Rufus stand as Long prints them.
- **XII.28** — "Where **hast thou seen** the gods, or how **dost thou
  comprehend** … and so **worshippest** them" → "where **have you seen** … how
  **do you comprehend** … and so **worship** them".
- **XII.29** — "What the **formal part**" → "what its **form**", and "its
  **material**" → "its **matter**" (glossary; XII.29 is named in the row).
  **Base-text point:** PG "what it is itself, **that** is its material, what the
  formal part"; SE "**what** is its material". **SE followed.** PG's "that is its
  material" makes the material what the thing "is itself", which is the one thing
  Marcus's division denies, and it breaks a three-member series ("what it is
  itself, what is its material, what the formal part") that the third member, with
  its verb already elided, depends on. A `th`/`wh` slip is the ordinary
  explanation. **Flagged below**, as the second of the book's two departures from
  PG's letters.
- **XII.30** — "**[Or individuals]**" **DROPPED under D11**: Long's second
  English rendering of "individual circumscriptions", his own "or" included — the
  XI.37 "[or rules]" shape exactly. "Their **several** qualities" → "their
  **separate** qualities" (the XI.2 rendering of the dead plural distributive; see
  the note on V.1 under unresolved source issues). **One comma added**, before the
  elliptical second subject: "the intelligent principle holds together**,** and
  the gravitation towards the same". Long's ellipsis is his, and the comma is the
  mark it needs.
- **XII.31** — "What **dost thou wish**—to continue to exist?" → "what **do you
  wish**—to continue to exist?"; Long's dash kept. "**Movement**" stays
  "movement": this is physical growth and motion, where the glossary's *hormē* row
  leaves Long's word alone.
- **XII.32** — "On what a small clod of the whole earth **thou creepest**" → "you
  **creep**". Long's exclamation marks kept where he has them.
- **XII.33** — "The ruling **faculty**" → "the ruling **part**" (glossary).
- **XII.34** — **[v2, finding 34.1] "Most adapted to move" → "best suited to
  move".** v1 left the paragraph byte-identical to Long, and this was the one dead
  usage among the five: "adapted to" in the sense *suited to* is no longer the
  live sense, which is *altered to fit*, so a reader can take the sentence as
  "this reflection has been most altered in order to move us" — not merely obscure
  but wrong. It survived because the paragraph carried no thou-form to force a
  second look. Two words for two; the rest of the sentence untouched. **The class
  is wider than this book**: "adapted to" in the dead sense also stands at V.8,
  VI.16 and X.11 in accepted books, and the decision is carried to the cross-book
  pass rather than taken for XII.34 alone.
- **XII.35** — "Acts **conformable to** right reason" → "acts **in accordance
  with** right reason" (the XII.1 rule for Long's non-nature "conformably").
  Cross-reference "(iii. 7; vi. 23; x. 20; xii. 23)" dropped, with a full stop
  supplied. Long's unfinished-looking close, "for this man neither is death a
  terrible thing", is his own inversion and is kept.
- **XII.36** — "**[The world]**" **FOLDED as an apposition**, with **one comma
  added**: "a citizen in this great state**,** the world" — a referent supplement,
  as XI.20's "[the body]" was. "**[Or three]**" **FOLDED**: "whether for five
  years or three", which the rest of the meditation depends on ("I have not
  finished the five acts, but only three of them"). "That which is **conformable
  to** the laws" → "**in accordance with** the laws". "**Thou sayest** well" →
  "**you say** well". "What **shall** be a complete drama" → "what **will** be"
  (the "shall" rule). **[v2, finding 36.1] Long's lowercase after both question marks is restored**:
  the candidate reads "? **for** that which is in accordance with the laws" and
  "? **the** same as if a praetor". v1 capitalised both and recorded that as "the
  only change" in those two places. But lowercase after a question mark is Long's
  settled habit and the package's settled practice — it stands twice in Book XII
  itself (XII.15 "? and will the truth", XII.33 "? for all lies in this") and at
  VIII.17, VIII.36, IX.40, X.1 ×2, X.24 ×5 and X.30 in the accepted books,
  including three accepted instances of the very construction capitalised here, a
  question mark followed by "for". Capitalising twice in the last paragraph of the
  last book would have punctuated one construction two ways inside one book and
  one way in every other, against Book IX's finding 7.1 (Long's uneven punctuation
  is not normalised for evenness alone). **No capitalisation of Long's is now
  changed anywhere in Book XII.**
  "Praetor" is kept as Long prints it, with the Latin name forms of X.27.

## Apparatus dropped or folded

**Cross-references dropped: six spans in six paragraphs** — XII.3 "(ii. 13, 17;
iii. 5, 6; xi. 12)", XII.12 "(ii. 11, 12, 13; vii. 62; 18 viii. 17)", XII.14
"(iv. 27)", XII.19 "(v. 11)", XII.21 "(ix. 28)", XII.35 "(iii. 7; vi. 23; x. 20;
xii. 23)". **No verse citation and no source citation in the body**: Long's one
verse quotation in Book XII, the line of Empedocles at XII.3, carries its
reference in a footnote, not in the text.

**Brackets in Long's Book XII: twelve. Four folded, seven dropped under D11, one
textual mark whose brackets go and whose words stand — 4 + 7 + 1 = 12.** (The
arithmetic is asserted by the mechanical check in `README.md` from the enumerated
list below, on the Book X finding C1 ruling, so a numeral cannot drift from the
list.)

*Folded — four:*

- XII.15 "[before thy death]" — the completion Long's question needs.
- XII.16 "[say]" — the verb the sentence needs, with the comma the fold needs.
- XII.36 "[the world]" — **referent**: what the great state is. Folded as an
  apposition, as XI.20's "[the body]" was.
- XII.36 "[or three]" — the alternative the drama's three acts depend on.

*Dropped under D11 — seven, each a second English rendering (or, at XII.27, a
second construal) of what Long has already given:*

- **XII.2 "[ruling principles]"** — for "the minds".
- **XII.3 "[life]" ×2** — for "a little breath".
- **XII.3 "[to the god that is within thee]"** — for "thy own daemon", which the
  glossary renders with those very words. Flagged.
- **XII.8 "[forms]"** — for "the formative principles".
- **XII.27 "[or Rufus at Velia]"** — a second construal of the same Greek
  letters, Long's own "or" included. Flagged.
- **XII.30 "[or individuals]"** — for "individual circumscriptions". The XI.37
  "[or rules]" shape.

*A mark of textual doubt — one, on the XI.26 ruling now in the ledger's D13 row:*

- **XII.17 "[For let thy efforts be—]"** — Long brackets the clause because the
  Greek breaks off; the brackets go, his words and his dash stand. Flagged.

*Dropped under D13 — none.* Book XII contains no bracketed **translator's note**
of the X.23 kind: not one of the twelve brackets says what Long omitted,
supplied, transposed or could not render. D13 therefore fires in neither of the
two books drafted under it, and XII.17 is the second bracket of the third class
the row also names.

**Verse:** one quotation, Long's line of Empedocles at XII.3, kept in his words
and in his quotation marks and joined into the paragraph with spaces as the
staged original has it.

**Punctuation changed**, in full.

- **Two of Long's commas before em dashes removed** (XII.3, XII.19), which is the
  practice of nine accepted books.
- **Two commas removed between a long subject and its verb** (**[v2, finding
  2.1]**; v1's tally said one): XII.2, "he who regards not the poor flesh which
  envelops him**,** surely will not trouble himself", and XII.16, "he who would
  not have the bad man do wrong**,** is like". The X.6 / X.20 / X.33 / XI.10 /
  XI.21 class.
- **Two commas removed with the two resumptive constructions they held open**
  (XII.23; see the paragraph entry). Not stylistic removals: the commas exist only
  to support a resumptive pronoun that the repair removes.
- **Six commas added** (**[v2, findings 2.1 and 15.1]**; v1's tally said five and
  was one short as well as one too many), each required by a fold or by a real
  ambiguity and each listed at its paragraph: XII.1 ×1 (after "In accordance with
  piety", making Long's two parallel sentences agree, as Standard Ebooks does),
  XII.2 ×1 (before the last member of Long's polysyndetic list, unrecorded in v1),
  XII.15 ×1 (marking off the long relative — v1 added two, and the second is
  removed under finding 15.1), XII.16 ×1 (before the folded "say"), XII.30 ×1
  (before Long's elliptical second subject), XII.36 ×1 (the apposition fold). This
  is more than any earlier book, and every one is recorded here rather than left
  to be found.
- **Two of Long's own commas relocated**, both at XII.3, onto the word before,
  because the bracket they followed is dropped under D11: "a little breath
  [life]**,** intelligence" → "a little breath**,** intelligence", and "in the
  breath [life]**,** which is by nature" → "in the breath**,** which is by
  nature". Neither is an added comma and neither is a removed one; they are
  recorded because a positional check sees them.
- **How the tally is now asserted.** `../scripts/build_book12_v2.py` and the
  `README.md` check block compare **comma positions** — the two paragraphs are
  aligned word by word and the comma following each aligned pair is compared —
  rather than net comma counts per paragraph, which is what let XII.2's swap pass
  unseen in v1 (finding 2.1). Ten comma differences fall inside text otherwise
  identical to Long and are enumerated in the script; the two remaining added
  commas (XII.2's and XII.15's) lie inside spans whose wording was modernised,
  cannot be aligned, and are enumerated separately with their source and candidate
  forms.
- **Six terminal marks supplied** where a dropped cross-reference carried the
  sentence's own punctuation — five full stops (XII.3, XII.12, XII.14, XII.21,
  XII.35) and one question mark (XII.19, where Long prints "(v. 11)?").
- **No capitalisation of Long's is changed** (**[v2, finding 36.1]**; v1
  capitalised twice at XII.36 after Long's own question marks, and his lowercase is
  restored in both places).
- **No other punctuation of Long's is touched**, and his comma inside the XII.16
  dagger clause is kept.

**No expansion.** The short meditations stay at Long's length, and **four
paragraphs are byte-identical to Long** — XII.7, XII.10, XII.11 and XII.13.
**[v2, finding 34.1]** XII.34 was the fifth; a byte-identical paragraph is a
result and not a target, and the finding was right to take it. The word ratio for
the book is **0.983** (3,131 → 3,078, v1 was 0.9844), and the
shortfall is apparatus: the six cross-reference spans are 33 words between them,
and the seven D11 brackets 15 more. The minimum paragraph ratio is **XII.12 at
0.81**, whose entire difference is its nine-word cross-reference; then XII.35
(0.90, a seven-word cross-reference) and XII.3 (**0.93** at v2, a nine-word
cross-reference, four dropped bracket-words and the three words findings 1.1/3.2
and 3.1 remove, in a 259-word meditation). **[v2, finding C2, and the figures recomputed against v2 rather than carried
over.]** Of the paragraphs that carry no apparatus at all, **none is below 0.98**;
the lowest is **XII.29 at 0.983**, whose entire difference is the base-text
correction and the glossary row, then XII.5 and XII.4 (0.990) and XII.23 (0.991).
XII.19 (0.96) and XII.21 (0.96) are the lowest paragraphs **whose only apparatus
is a cross-reference** — v1's sheet named those two as the lowest carrying *no*
apparatus, which contradicted itself in its own sentence and understated a claim
that is true. The maximum is 1.04 at XII.20, where "inconsiderately" becomes
three words.

## Nothing imported from other translations

Every candidate paragraph was drafted from Long's text of the same numbered
section and from nothing else. Standard Ebooks' Long was consulted **after the
draft was written**, for the state of the base text only, by a word-level diff of
the whole of Book XII fetched 2026-09-12; no wording was taken from it except the
two single words recorded as base-text corrections below, and the places where it
differs are recorded there. The widely quoted passages keep Long-specific turns
that the familiar modern versions do not have: XII.1 "a stranger in your native
land"; XII.3 "Empedocles' sphere"; XII.22 "like a mariner who has doubled the
promontory … a waveless bay"; XII.27 "Smoke and ash and a tale, or not even a
tale"; XII.36 "in life the three acts are the whole drama".

## Unresolved source issues (Long's text)

**One dagger mark**, PG #15877 line 6963 (XII.16), matching `../PROVENANCE.md`
§4. Long uses the dagger for a place where the Greek is corrupt.

- **XII.16 (PG 6963)** — inside the clause: "If then thou art irritable, **+**
  cure this man's disposition." The clause stands as Long has it, with the
  pronoun modernised and **his comma kept**, on the X.25 ruling. Nothing in it is
  made clearer than the source; the sentence is as abrupt in the candidate as in
  Long.

**Long's own broken text at XII.17**, "[For let thy efforts be—]", where his
footnote says "There is something wrong here, or incomplete." The footnote is
apparatus and is not imported; the clause and its dash are reproduced, on the
V.29 / VII.58 / XI.18 precedent. The brackets are removed as a mark of textual
doubt (the XI.26 class).

**Base-text points, from a word-level diff of the whole book against Standard
Ebooks' Long (fetched 2026-09-12):**

- **XII.27, a PG slip. FLAGGED.** PG "Stertinius at **Briae**"; SE "**Baiae**".
  Rendered **"Baiae"**. Briae is not a place; Baiae is the Roman seaside resort,
  and it stands in a list of retreats beside "Tiberius at Capreae". One of **two
  departures from PG's letters in Book XII**.
- **XII.29, a PG slip. FLAGGED.** PG "what it is itself, **that** is its
  material"; SE "**what** is its material". Rendered **"what is its matter"**.
  The second of the two departures. See the paragraph entry for the reasoning.
- **XII.5, PG right and Standard Ebooks wrong.** PG "disputing with the
  **Deity**"; SE "**diety**", which is not a word. PG followed.
- **XII.14, PG right and Standard Ebooks wrong.** PG "a confusion without **a**
  governor"; SE drops the article. PG followed.
- **XII.24, PG right and Standard Ebooks wrong.** PG "beings who dwell **all**
  around in the air"; SE drops "all". PG followed.
- **XII.27, an open variant.** PG "Fabius **Catellinus**"; SE "**Catullinus**".
  Both are possible Roman cognomina and nothing in the sentence decides. PG
  followed under D6 and the X.27 ruling on Latin name forms.
- **XII.23, an open variant.** PG "moved towards the same **thing** in his mind";
  SE "the same **things**". PG followed under D6; nothing of sense turns on it.
- **XII.1, a spelling variant that does not reach the candidate.** PG "thou
  **mayst**"; SE "**mayest**". Both become "you may" under the thou-rule. The
  X.32 / XI.15 case in this book's form; recorded so that a later collator does
  not find an unexplained difference.
- **XII.12, a PG typographic slip inside apparatus.** PG's cross-reference reads
  "(ii. 11, 12, 13; vii. 62; **18** viii. 17)" — a stray numeral with no
  referent. SE omits the whole span, as it omits every cross-reference. The span
  is dropped as apparatus, so the slip never reaches the candidate; recorded for
  the same reason.
- **XII.2, XII.6, XII.16, typographic.** PG prints "such like" as two words at
  XII.2 where SE has "suchlike"; rendered "of that kind" on the XI.1 ruling.
  **Both texts print "fig-tree"** at XII.16; the 1862 hyphen is normalised to
  "fig tree" under X.36.2, which is a convention and not a reading. PG "Practise
  / practised" at XII.6 is normalised to the American "practice / practiced",
  which PG itself uses elsewhere in the same book of the work (XI.26
  "practiced"); no word changes.
- **Standard Ebooks prints Book XII with page numbers in the text flow** (113–122
  in the extracted plain text) and omits every cross-reference. Neither is a
  reading; neither affects the paragraph count, which is 36 in both.

**Two cross-book inconsistencies noticed while drafting, in accepted books, not
reopened** (recorded here and in `../00-progress-ledger.md` under "Open, not
blocking", because a reader collating the twelve books would find them):

- **"Such like".** The accepted Book IX keeps it at IX.1 ("of such like
  successions"), while Book XI rendered it "things of that kind" at XI.1 and Book
  XII follows XI. IX.1's acceptance is closed and the divergence is formal, not
  semantic.
- **The plural distributive "several".** The accepted Book V keeps it at V.1
  ("their several parts of the universe"), while Book XI rendered it "separate"
  at XI.2 and Book XII follows XI at XII.30. Same class, same disposition.

## Decisions flagged for the reviewer — all ruled at round 1

**[v2] Every one of the five was ruled, the point offered for confirmation was
confirmed, and the two points put with reasons were answered. Every substantive
call stands; the only ruling that went against the draft is finding 4.1, which is
a ruling on a rule and not an error.** The rulings, in the reviewer's order:

1. **XII.27 "Baiae" and XII.29 "what" — both confirmed**, each on its own
   evidence, neither leaning on the other or on Standard Ebooks (which only
   corroborates). XII.29 is "the stronger evidence of the two". **The number of
   departures in a book is a symptom, not a standard.**
2. **XII.3's "[to the god that is within thee]" under D11 — route and outcome
   confirmed.** The VII.17 alternative is declined: VII.13 and VII.17 keep Long's
   Greek because those meditations *are* arguments about the Greek words, and
   XII.3 contains no such argument. The circularity worry is answerable — the
   glossary row cites XII.3 as evidence of Long's own understanding of the word,
   which is what makes "the god within" his rendering rather than an editorial
   choice.
3. **XII.17's "[For let thy efforts be—]" as a mark of textual doubt —
   confirmed**, and D13's own Book XI amendment ("voice and subject, **not
   length**") supports extending the class from a word to a clause. **The ledger's
   D13 row is widened at acceptance to "a word or a clause", naming XI.26 and
   XII.17** (finding C3).
4. **XII.4's "shall" beside "will" — ruled for "will" in both** (finding 4.1);
   applied at v2.
5. **XII.27's "[or Rufus at Velia]" under D11 — confirmed.** D11 reaches an
   alternative *construal*: Long's own "or" is inside the bracket, and unlike the
   XI.26 / XII.17 class the words cannot stand as text once the mark is removed.
6. **"Pancratiast" at XII.9 — confirmed.**
7. **XII.23's two resumptive repairs — allowed**, with finding 23.1 correcting
   their stated ground.
8. **The added commas — four of the five earned**, XII.15's second not (finding
   15.1), and there are six, not five (finding 2.1).
9. **D13 fires nowhere in Book XII — agreed**, tested bracket by bracket against
   the row's own voice-and-subject test. X.23 remains D13's only instance in the
   work.

The five as they were put, for the record:

1. **XII.27's "Baiae" for PG's "Briae", and XII.29's "what" for PG's "that" —
   two departures from PG's letters in one book.** Every earlier book had at most
   one, and the Book XI reviewer called that one "the best-evidenced in the
   package". Each of these is argued on its own evidence: Briae is not a place
   and Baiae belongs in a list of Roman retreats beside Capreae; and "that is its
   material" makes a thing's matter be what the thing "is itself", which is the
   distinction the meditation exists to draw, while breaking a three-member series
   whose third member has already elided its verb. Both have Standard Ebooks
   against PG. Are both right? If only one, which?
2. **XII.3's "[to the god that is within thee]" dropped under D11.** The bracket
   is Long's own English gloss of "daemon", and it is the phrase the glossary's
   *daimōn* row uses to render the word — the row cites this very section as its
   authority. Applying the row gives "obedient to **the god within you**", after
   which the bracket is a second rendering of the same thing and D11 drops it. The
   result is textually indistinguishable from folding the bracket and deleting the
   word, which is uncomfortable: a reader cannot tell which rule produced it.
   Confirm the route, or rule that the VII.17 treatment applies instead — keep
   Long's word and fold his gloss as an apposition ("obedient to your own daemon,
   the god that is within you"), as the accepted Book VII does with
   "Eudaemonia, happiness".
3. **XII.17's "[For let thy efforts be—]" treated as a mark of textual doubt.**
   The XI.26 ruling — the mark goes and the word stands — was made for a single
   bracketed proper name. Here it is applied to a whole bracketed clause that
   Long brackets because his Greek breaks off. The alternatives are to drop the
   clause entirely as apparatus (which would leave XII.17 as two short lines and
   would hide a defect the reader is entitled to meet, against the V.29 / VII.58 /
   XI.18 precedent) or to keep the brackets (which no other bracket in the
   package does). Confirm, or rule otherwise.
4. **XII.4's "shall" beside "will" in one comparison.** "So much more respect do
   we have for what our neighbors **will** think of us than for what we **shall**
   think of ourselves." The rule keeps first-person "shall" and converts
   third-person plain futures, and applying it produces this. It is ordinary
   English, and it is what II.1, VIII.45, X.6 and XI.18 have done with first-person
   "shall" — but it is the first place where the two stand in the same
   construction, and a reviewer may prefer "will" in both. Confirm, or rule for
   "will".
5. **XII.27's "[or Rufus at Velia]" dropped under D11.** D11 as worded reaches
   Long's bracketed *alternative renderings*. This bracket is not a second
   rendering of a Greek word but a second **construal** of the same Greek letters
   — one name, or a name and a place. The reasoning applied is that it is the same
   species of remark: Long addressing his reader about his own choices, not part
   of Marcus's sentence, and folding it would have Marcus name a fifth man. Confirm
   that D11 reaches a bracketed alternative *construal*, or rule that it is the
   XII.17 / XI.26 textual-doubt class and that the words should stand.

A sixth point is offered for confirmation rather than ruling: **"pancratiast" is
kept untranslated at XII.9**, on the X.9 "Mimi" and XI.2 "pancratium" rulings —
it is Long's text and not apparatus, the sentence glosses it by its contrast with
the gladiator, and XI.2 already puts "pancratium" before the reader in an accepted
book.

Two further points are put to the reviewer with reasons rather than flagged:
whether **XII.23's two resumptive repairs** go further than the fidelity rule
allows (no word is added or dropped, and the repair is the same class as the
XI.18 sentence-shape changes, but it does move Long's words), and whether the
**five added commas** — more than in any earlier book — are each earned.
