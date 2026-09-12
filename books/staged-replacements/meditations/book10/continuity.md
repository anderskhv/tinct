# Continuity sheet — Meditations, Book X (accepted as candidate v2)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V,
VI, VII, VIII and IX were accepted, and describing what the frozen draft
actually did, and **updated at acceptance (2026-09-12)** to record the round-1
rulings and the six substitutions in `candidate-v2.json`. Where an entry
describes a change made at acceptance it says so; everything else describes the
frozen v1, which `candidate-v2.json` leaves untouched in 33 of 38 paragraphs.
Term renderings follow `../GLOSSARY.md` (two rows extended for Book X **before**
drafting, see below); the pattern for applying review findings follows the nine
earlier `ACCEPTANCE.md` files (decisions D8, D10, D11, D12 and the new **D13**
in the ledger). Book X is the **second** book drafted under the "shall" rule
fixed at Book VIII acceptance, and the first drafted under its widened wording
(finding 41.1 at Book IX acceptance: "the deliberative 'shall' of a question,
direct or indirect").

## Source

`source-book10.json` (sha256 `db635cde…`) is chapter 10 of
`../meditations-original-en.staged.json` (sha256 `7798607d…`), extracted by
`chapter.number == 10`, paragraphs byte-identical: **38 paragraphs, X.1–X.38,
4,537 words**, one per numbered meditation, which is the standard section count
for Book X.

**Step 1 did not rebuild the staged original, and the check was not a re-run of
the build.** The file has been rebuilt twice (Book IV step 1, three PG
illustration captions; Book VII step 1, three of Long's footnotes printed flush
left). The Book IX round-1 reviewer made the point that matters here: getting a
byte-identical file out of a re-run proves only that the file matches the
script, **which is exactly how the Book IV captions and the Book VII footnotes
survived the first build**. So the check for Book X was an **independent
reconstruction**, written from scratch as
`../scripts/verify_book10_source.py` and not reusing
`build_original_en_from_pg15877.py`: PG lines 5866–6374 (after the `X.` header
at 5865, before the `XI.` header at 6375) were re-extracted by their own rules
and diffed **word for word** against the staged Book X.

It reconstructs **38 paragraphs**, matching the staged count, and **the only
four differences in the whole book are the four dagger marks** — X.9 (PG 6038),
X.19 (PG 6132), X.25 (PG 6183), X.31 (PG 6229) — which `../PROVENANCE.md` §4
documents as deliberately removed. Nothing else differs anywhere. Class by
class, from the same reading:

- **Footnotes: seventeen, all indented, all already stripped.** Openers at PG
  5886, 5968, 6009, 6015, 6050, 6054, 6077, 6082, 6158, 6172, 6188, 6257, 6264,
  6268, 6319, 6353, 6370, in eleven indented runs (several notes share a run).
  **No flush-left footnote opener and no flush-left footnote body**, so the
  VII.45 defect does not recur — and this was tested the strong way: a
  flush-left body would have been read by the reconstruction as ordinary text
  and would have shown as a diff. None did. Their **seventeen** in-text markers
  are all gone: sixteen sat in flush-left text, and the seventeenth sits inside
  Long's indented verse at PG 6306 ("So is the race of men.[A]"), which is why
  the opener count and the flush-left marker count differ by one.
- **Illustration captions: none** in Book X (the nearest, PG 5628, is in Book
  IX, where it is correctly stripped).
- **Running heads, page numbers, catchwords: none.** Exactly **one** standalone
  flush-left line in the whole book, the `X.` header itself.
- **Verse: present, and it is Long's text, correctly joined.** X.34 quotes Homer
  in two indented lines at PG 6305–6306 (indented five spaces); they are joined
  into X.34 with spaces, as `../PROVENANCE.md` §4's verse rule requires and as
  that section already lists ("X.34"). The four-line Odyssey quotation at PG
  6026–6029 is indented *seven* spaces **inside footnote [B]** and goes with the
  footnote; the reconstruction and the build agree on both.
- **Verse citations in the body: none.** The Homer citation is itself footnote
  [A] at PG 6319, not a flush-left line of the `HESIOD, Works, etc.` kind that
  produced the V.33 and VII.45 problems.
- **Greek in the body: none.** Every `[Greek: …]` span in PG 5866–6374 sits
  inside a footnote body (5975, 6050, 6160, 6165, 6188–6189, 6266, 6353), so the
  in-text-Greek exception added to `../GLOSSARY.md` before VIII.57 does not fire
  in Book X, correctly.

The staged file's sha256 is unchanged at `7798607d…`, 487 paragraphs, twelve
chapters, section profile 17, 17, 16, 51, 36, 59, 75, 61, 42, **38**, 39, 36,
and `git status` is clean. **No rebuild was made and no accepted book is
reopened.** Recorded in `../PROVENANCE.md` §4 and `../00-progress-ledger.md`.

## Glossary rows extended for Book X, before drafting

Both were committed and pushed **before any paragraph was written**, as the
Books IV–IX practice requires.

1. **"social animal" row extended to Long's "political animal".** X.2: "the
   rational animal is consequently also a political [social] animal." "Animal"
   takes "being" as it does in every other compound in the edition, and the
   bracket is a second English rendering of one Greek word, so it is dropped
   under D11 and Long's primary word stands: **"a political being"**. Not
   "political animal", which in current English is an idiom about a person who
   enjoys politics — the one reading Marcus does not mean.
2. **"the daemon (within)" row extended to Long's "a good daemon".** X.13:
   "fidelity, modesty, truth, law, a good daemon [happiness]". This is the
   *eudaimonia* pun, and the accepted Book VII already renders it at VII.17
   ("Eudaemonia, happiness, is a good god within"). X.13 follows it —
   **"a good god within—happiness"** — with Long's own bracketed gloss folded
   as an apposition, which is what the glossary's bracket rule says to do with
   a translator's gloss beside his own word.

No new *rendering* row was needed: every other recurring term in Book X was
already fixed.

## Glossary terms met in Book X and how they were rendered

| Long (source) | Candidate | Where |
|---|---|---|
| the universal nature | the universal nature | X.11, X.20 |
| the nature of the universe | the nature of the whole | X.6 |
| the common nature | the common nature | X.8 |
| the whole; the universe | the whole; the universe | X.6 ×6, X.7 ×3, X.9, X.17 |
| the universal reason | the universal reason | X.7 — Long's adjective + noun, kept as its own phrase on the "the universal nature" principle, not turned into "the reason of the whole" |
| according to nature; conformable to reason; conformable to man's constitution | according to nature; in accordance with reason; in accordance with man's constitution | X.36, X.33 ×2 — "in accordance with" is the accepted Books I and IV rendering of Long's "conformable to" outside the *kata physin* row (I.16, IV.32); "according to" is kept where Long has "according to" (X.12, X.33, X.36) |
| contrary to nature | against nature | X.7 |
| reason | reason | X.11, X.12, X.31, X.32, X.33 ×5 |
| rational animal; reasonable beings; political [social] animal | rational being; rational beings; a political being | X.2 ×2, X.8, X.28 |
| irrational soul | irrational soul | X.33 — Long's own phrase, kept |
| the ruling faculty | the ruling part | X.24 |
| the intelligent part | the intelligent part | X.8 — Long's own phrase, **not** one of the five variants the ruling-part row collects, and kept distinct |
| a good daemon | a good god within | X.13 (row extended for this book) |
| the gods; God | the gods; God | X.1 ×2, X.8, X.11 — Long's capitals kept where he has them |
| the common interest | the common good | X.6 |
| a state; political community | a state; political community | X.15 |
| opinion | opinion | X.3, X.10, X.33 |
| dissolution | dissolution | X.7, X.18 |
| the elements | the elements | X.7 |
| change | change | X.7 ×3, X.11, X.18, X.31 |
| vexed | resentful | X.7 |
| dissatisfied | discontented | X.25 |
| discontented | discontented | X.28 |
| tranquil | calm | X.12 |
| benevolent | kind | X.36 |
| kinsmen | kinsmen | X.36 |
| flesh | flesh | X.8, X.24 |
| fame | fame | X.8, X.34 |
| in a manner | in a way | X.6 ×2 |
| inasmuch as | since | X.6 ×2 — the IX.1 rendering, in its second book |
| every several thing | every single thing | X.8, X.9 ×2 — the IX.32 rendering, in its second book; if it recurs in a third it should be promoted to a glossary row on the Book VI precedent |
| a man; men (generic) | a man; men | throughout |

## The "shall" rule in Book X

Long has **23** "shall / shalt" in Book X. The candidate keeps **six**, and
removes **seventeen**, every one of them a plain future.

**Kept — six, all licensed:**

- **X.6 ×5, first person** — "I shall be discontented with none of the things",
  "I shall be content with everything that happens", "I shall do nothing
  unsocial", "I shall rather direct myself", "I shall turn all my efforts". The
  rule names the first person explicitly, and this is the one paragraph in the
  book where Marcus argues in the first person throughout.
- **X.36, the subjunctive of a negative consecutive clause** — "There is no man
  so fortunate that there **shall not be** by him when he is dying some who are
  pleased with what is going to happen." This is the VIII.32 class ("so that
  each act shall not do its duty"), not a future; English still admits it, and
  "that there will not be by him" would read as a prediction about every man
  rather than as the shape of the claim.

**Removed — seventeen plain futures**, taking "will" or the plain present as
the rule directs: X.1 ("wherein thou shalt have longer enjoyment" → "in which
you will have longer enjoyment"; "whatever shall please them" → "whatever
pleases them"; "whatever they shall give" → "whatever they give"; "such that
thou shalt so dwell in community" → "such that you live in community"), X.2 ×2
("if thy nature … shall not be made worse by it" → "is not made worse by it",
both times, conditional clauses), X.8 ×2 ("if thou shalt perceive" → "if you
perceive"; "where thou shalt maintain them" → "where you will maintain them"),
X.11 ("what any man shall say or think about him" → "will say or think" — an
indirect question, but about what men will in fact say, not a deliberative one),
X.25 ("something has been or is or shall be" → "or will be"), X.31 ("until thou
shalt have made these things thy own" → "until you have made these things your
own", a temporal clause taking the plain present), X.32 ×3 ("whoever shall
think anything of this kind" → "whoever thinks"; "who is he that shall hinder
thee" → "who is he that will hinder you" — a direct third-person question, but
a plain future, not a deliberative "what shall be done"; "unless thou shalt be
such" → "unless you are such"), X.33 ("such shall be to thee" → "such will be
to you"), X.34 ×2 ("those who shall receive and transmit a man's fame" → "those
who will receive"; "thou shalt close thy eyes" → "you will close your eyes").

No second-person "shall" and no plain-future "shall" survives anywhere in the
book. Book X contains **no** deliberative question, direct or indirect, so the
clause widened at Book IX acceptance does not itself fire here; the widened rule
was nonetheless in place before drafting, as the Book IX finding required.

## Paragraph-level decisions

- **X.1** — "Wilt thou" ×5 → "Will you". **One comma removed**, after the
  pronoun: Long's "Wilt thou, then, my soul, never be good" → "Will you then,
  my soul, never be good". Keeping it would give four comma-separated fragments
  before the verb and now reads as fussy; "then" goes unpaired inside the
  address instead, which is current practice. *Recorded at acceptance, finding
  1.1: this was the only punctuation change in Book X the sheet did not list,
  and the round-1 reviewer endorsed the wording while naming the gap.* "More manifest than the body" → "more
  plain to see than the body" ("manifest" as a predicate adjective is stiff;
  "plainly" is the edition's word for Long's "manifestly" at IX.1 and IX.42).
  "The conservation of the perfect living being" → "the **preservation** of the
  perfect living being": "conservation" now names a movement about the natural
  world, which is the one sense Long cannot mean. "Or society of men" → "or
  **the** society of men", Long's dropped article supplied, as at IX.42 ("in
  such way" → "in such a way"). The closing question is recast to keep its
  mood without "shalt": "Will you never be such that you live in community with
  gods and men in such a way as neither to find fault with them at all, nor to
  be condemned by them?" — Long's "so … as" correlative is kept, moved onto
  "in such a way … as", because "so dwell" without "shalt" is not current.
  Every one of Long's five questions stays a question, and the long middle
  question keeps all of its clauses and its "but".
- **X.2** — "A political [social] animal" → "a political being": the bracket is
  a D11 alternative rendering and is dropped; the row extended for this book
  governs the noun. Long's two conditional "shall not be made worse by it"
  become "is not made worse by it" under the "shall" rule.
- **X.3** — "In such wise" → "in such a way", three times, matching Long's own
  "in such way" in the same paragraph. Nothing else; the four-fold repetition
  of "formed by nature to bear it" is Long's and is kept entire, because the
  meditation is built on the repetition.
- **X.4** — "Blame not even thyself" → "**do not blame even yourself**": Long's
  inversion is archaic (the IX.29 treatment of "Draw me not aside"), and the
  focus stays on "even yourself" rather than moving to the verb, which "do not
  even blame yourself" would do.
- **X.5** — Cross-reference "(iii. 11; iv. 26)" dropped. Otherwise Long with
  the pronouns modernised; "the implication of causes … spinning the thread of
  your being" is kept as the image it is.
- **X.6** — "[A concourse of]" and "[is a system]" **folded**: both complete
  Long's elliptical disjunction ("Whether the universe is a concourse of atoms,
  or nature is a system"), and without them the sentence has no predicate in
  either limb. "Inasmuch as" → "since" ×2 (the IX.1 rendering). "In a manner" →
  "in a way" ×2 (glossary). "The nature of the universe" → "the nature of the
  whole" (glossary), standing beside the paragraph's many plain "the whole"s,
  which is Long's own play of part and whole. "The common interest" → "the
  common good" (glossary). **One comma removed**: "the life of a citizen is
  happy, who continues a course of action" → "the life of a citizen is happy
  who continues a course of action" — the relative is restrictive, and Long's
  comma now reads as though every citizen's life were happy. Same class as the
  comma removed at IX.1.
- **X.7** — "For whether did Nature herself design to do evil…" → "For **did**
  Nature herself design to do evil…": Long's "whether" introducing the first
  limb of a direct alternative question is dead in English; the "or" that
  follows carries the alternative unaided. "[As an efficient power]" folded (it
  qualifies "the term Nature" and is Long's own explanation of what dropping
  the term would mean). "[The accretion]" folded — **referent**: the object of
  "has received". "[Which thy mother brought forth]" folded — **referent**:
  Long repeats his own phrase rather than write "it". "[Of change]" folded —
  the quality named. "Vexed" → "resentful" and "contrary to nature" → "against
  nature" (glossary). "The peculiar quality [of change]" → "the **particular**
  quality of change", which is VI.3's rendering of the identical phrase,
  confirmed by the Book VIII ruling at VIII.12. "The air which is inspired" →
  "the air which is **breathed in**" ("inspired" now means something else
  entirely). **"The universal reason" is kept** rather than converted to "the
  reason of the whole": it is Long's adjective + noun, of the same shape as
  "the universal nature", which the glossary keeps as its own term. **"From the
  airy to the aerial" is kept as Long has it**: both words are current English,
  the distinction is his, and rendering one of them would collapse a pair he
  evidently meant to keep apart. **One comma raised to a semicolon**: "which has
  the particular quality of change**;** this is nothing in fact in the way of
  objection" — Long's comma splices two independent clauses.
- **X.8** — "Thou shouldst lose them" → "you lose them". "Every several thing" →
  "every single thing" (the IX.32 rendering). "Intreat" → "**beg**"
  ("intreat"/"entreat" is not current and the fighters are not making a formal
  petition). "As thou hast hitherto been" → "as you have been until now"
  ("hitherto" is dead). "As if thou wast removed" → "as if you were removed".
  "[Laudable]" folded. "Reasonable beings" → "rational beings" (glossary).
  "**In order, however to the remembrance of these names**, it will greatly help
  thee if thou rememberest the gods" → "**To remember these names, however**, it
  will greatly help you if you remember the gods": "in order to the remembrance
  of" is not English now, and PG's missing comma after "however" (SE has the
  same) made it worse. Long's own repetition ("remembrance … rememberest …
  rememberest") is kept as "remember … remember … remember". "They wish not to
  be flattered" → "they do not wish to be flattered". **"Islands of the Happy"
  is kept**, capital and all: it is Long's phrase for the Fortunate Isles and
  it is transparent. The three definitions (Rational, Equanimity, Magnanimity)
  keep Long's capitals and their order, and "the intelligent part" is kept as
  his own phrase rather than folded into the ruling-part row.
- **X.9** — One dagger mark, between "those holy principles of yours." and "How
  many things", that is, at a sentence boundary rather than inside a clause (see
  unresolved source issues). "Mimi" **kept** as Long prints it — ruled on at
  round 1 and settled, see below. **"Gravity" kept** in "when will you enjoy
  simplicity, when gravity": Marcus uses it as a **virtue-name** in a list of
  virtue-names, and the list's own parallelism recovers the sense within two
  words, while "seriousness" flattens a name into a description and "weight"
  imports a reading Long does not give. *Recorded at acceptance, optional
  finding 9.1, which the reviewer raised only so the decision would be on the
  record and which it would itself leave; the modern physical sense of
  "gravity" can be heard for a beat, and that is the whole cost.* "Each several thing" and "every several thing" → "each single
  thing", "every single thing". The seven-part final question keeps all seven
  of its members and its order.
- **X.10** — "If thou examinest their opinions?" → "if you examine their
  opinions?". The list of catches — fly, hare, fish, boars, bears, Sarmatians —
  is untouched, including the sting of the last item, and no note is added to
  explain it.
- **X.11** — "[Of philosophy]" folded — **referent**: which part. "What any man
  shall say" → "will say" (the "shall" rule). Long's dash before "with acting
  justly" is kept.
- **X.12** — "Tranquil" → "calm" (glossary). "If thou dost fail" → "if you do
  fail", keeping Long's emphatic auxiliary, which is current English.
- **X.13** — Two cross-references dropped, "(vi. 32; viii. 55)" and "(vii. 17)".
  "A good daemon [happiness]" → "**a good god within—happiness**" (the row
  extended for this book, on the VII.17 precedent; the gloss folded as an
  apposition with an em dash because the sentence is already a comma list).
  Long's single long question survives as one question, with its question mark
  where he puts it.
- **X.14** — "Give what thou wilt; take back what thou wilt." → "Give what you
  will; take back what you will." Nature's address is left as Marcus reports it.
- **X.15** — **"[Political community]" DROPPED under D11** (changed at
  acceptance, finding 15.1; v1 folded it as an apposition on "a state"). It is
  the same shape as X.2's "[social]" — a second English rendering of one
  Greek word beside the primary rendering Long has already given — and the
  operative test is the same: the meditation's point, that the world is the
  community one lives in so that place is indifferent, survives the drop entire
  in "if he lives everywhere in the world as in a state." Long uses neither word
  again in the section, so the X.33 "[order]" consideration (a primary word that
  recurs, beside a folded gloss that would dangle) does not arise either. The
  round-1 reviewer named the v1 fold "the one place where I think the D11 line
  is drawn inconsistently", and it was. **"[As men do]" stays folded** as the
  completion of "to live thus". **Base-text
  correction:** PG's "Let **me** see, let them know a real man" is a slip;
  Standard Ebooks reads "Let **men** see", which the parallel with "let them
  know" requires and which is the only reading that makes the sentence a
  sentence. Rendered "**Let men see**" — the one place in Book X where the
  candidate departs from PG's letters, flagged below.
- **X.16** — Unchanged from Long but for nothing at all; a one-line meditation
  left at one line.
- **X.17** — **"Gimlet" is kept**: a gimlet is a small hand tool for boring, the
  word is current, and the image — a whole life is one turn of it — is the
  meditation. No gloss is added.
- **X.18** — Unchanged from Long. "Putrefaction" kept: current, and exact.
- **X.19** — One dagger mark, inside the clause "when they are imperious + and
  arrogant" (see unresolved source issues); the clause stands as Long has it.
- **X.20** — **One comma removed**: "That is for the good of each thing, which
  the universal nature brings to each" → "…of each thing which the universal
  nature brings to each". The relative is restrictive and is the whole claim;
  Long's comma turns it into an aside.
- **X.21** — **"[Is wont]" folded, not dropped, and this is the one bracket in
  the book where D11's boundary had to be drawn.** In form it is a second
  English rendering of one Greek word, which is what D11 drops. But the
  meditation *is* that one Greek verb carries both senses: Marcus notes that
  common speech says a thing "loves" to be produced where it means the thing "is
  wont" to be produced, and Long's bracket is the only place in the English
  where the second sense exists. Dropping it would not remove a note about
  Long's choices (D11's reason for existing); it would delete the observation
  the section is made of. This is the VII.13 / VIII.57 principle in another
  form — Long prints the extra words because his sentence is not a sentence
  without them — so the words are kept and set off as an apposition with em
  dashes, as IX.24's "[such is everything]" was. **The dashes now stand OUTSIDE
  Long's quotation marks** (changed at acceptance, finding 21.1): `that "this or
  that loves"—is wont—"to be produced?"`, where v1 had `that "this or that
  loves—is wont—to be produced?"`. Long's square brackets were the universally
  understood signal "not part of the quoted text"; em dashes are not, so v1's
  placement credited common speech with words common speech does not use, which
  is the one thing this meditation cannot afford — its point is that the
  saying is exactly what people say and that the second sense is supplied from
  outside it. Long's quotation marks and his question mark inside the quotation
  are kept where he puts them.
- **X.22** — Long with the pronouns modernised. The three-limbed disjunction and
  "But besides these things there is nothing" are untouched.
- **X.23** — **Long's bracketed translator's note "[The three last words are
  omitted in the translation.]" is DROPPED as apparatus.** It is not a
  supplement to Marcus's sentence and not a second rendering of a word: it is
  Long telling the reader what he did with Plato's Greek, which is the same kind
  of thing as a cross-reference or a footnote, and the package drops both.
  Standard Ebooks omits it outright, which corroborates the classification
  without deciding it. **Dropped under D13** — the ledger row added at
  acceptance in answer to finding 23.1, which upheld the drop and pointed out
  that the package had no rule covering it: D11 reaches bracketed *alternative
  renderings* only, and the glossary's bracket rule reaches supplements,
  cross-references and verse citations. A translator's note about the
  translator's own practice is a third kind, and a drafter of Books XI–XII
  reading D11 literally would have folded it and put a sentence about the
  translation into Marcus's mouth. Listed below with the D11 drops because it is
  the same family — Long talking to his reader — though it is not an
  alternative rendering. Plato's sentence itself is kept exactly as Long gives it, unmarked
  and unexplained.
- **X.24** — "Ruling faculty" → "the ruling part" (glossary). "Loosed and rent
  asunder" → "loosed and **torn apart**" (the IX.9 and IX.23 rendering of
  "asunder"). The six questions keep their asyndeton and Long's lower-case
  openings after the question marks, as he prints them.
- **X.25** — "Flies from his master" → "**flees** from his master" (the VII.71,
  VIII.48, IX.2 rendering of Long's "fly"). "Dissatisfied" → "discontented"
  (glossary). "Or shall be" → "or will be" (the "shall" rule). One dagger mark,
  at "or afraid, +" — and **Long's comma after "afraid" is kept**, although in
  modern English it separates a subject from its verb, because it falls at the
  dagger and the practice set at VI.50, confirmed at VII.16 and enforced at
  VIII.51, is that a dagger clause stands as Long has it with only pronouns and
  glossary renderings changed. Flagged below.
- **X.26** — Cross-reference "(vii. 85)" dropped. "In fine" → "**in short**"
  (the IX.40 rendering). The two exclamations are kept as exclamations.
- **X.27** — "Hadrianus", "Antoninus", "Philippus", "Alexander", "Croesus" kept
  in PG's spellings (Standard Ebooks modernises the first and third to "Hadrian"
  and "Philip"; D6 governs, and the accepted Book IX already keeps "Philippus"
  at IX.29).
- **X.28** — "The rational animal" → "the rational being" (glossary). The pig
  and the man on his bed are left as they are, with nothing added to join them.
- **X.29** — "**Severally** on the occasion of everything that thou dost" →
  "**One by one**, on the occasion of everything that you do": Long's adverb in
  this distributive sense is dead (what survives is legal, "jointly and
  severally"), and "one by one" is what it says. The two added words are the
  paragraph's whole difference, and are why its ratio is 1.08.
- **X.30** — "Forthwith" → "**immediately**" (Long's own word elsewhere, and
  IX.42's). "In what like manner thou dost err thyself" → "in what like manner
  you err yourself"; Long's "like manner" is kept, because the point is that the
  fault is of the same kind.
- **X.31** — One dagger mark, after "the Socratic,+" (see unresolved source
  issues); the clause stands as Long has it. "[For thy activity]" folded —
  **referent**: what the matter and opportunity are for. "Until thou shalt have
  made these things thy own" → "until you have made these things your own" (the
  "shall" rule). The nine proper names and the pairings they make are untouched,
  and no note is added about who they were; Long's own footnote, which says that
  nothing is known of several of them, is apparatus and is not imported.
- **X.32** — "Whoever shall think" → "whoever thinks" and "unless thou shalt be
  such" → "unless you are such" (the "shall" rule); "who is he that shall hinder
  thee" → "who is he that **will** hinder you", a plain future in a direct
  question rather than a deliberative one. "**Do thou only determine** to live
  no longer unless thou shalt be such" → "**Only determine** to live no longer
  unless you are such" (changed at acceptance, finding 32.1; v1 read "**You,
  only determine**"). Long's emphatic "do + thou" imperative has no modern form,
  and the plain "Do you only determine…" would read as a yes/no question, so v1
  borrowed the vocative comma the Book IX round-1 review introduced at IX.40.
  **The round-1 reviewer ruled against that borrowing and the ruling is right.**
  At IX.40 the fronted pronoun does rhetorical work: the passage is an
  *alternation* ("One man prays thus: … You, pray thus: …") and the comma
  preserves a contrast that would otherwise vanish. **X.32 has no contrast at
  all**, so the fronted "You," carries nothing, and a bare vocative "You,"
  before an imperative reads as a summons to a stranger rather than as
  self-address — the one register Anders's brief rules out; worse, "You, only
  determine…" invites the misparse "only *you* determine…", the reverse of the
  sense. The plain imperative is unambiguous in mood, is self-addressed like
  every other imperative in the edition, and keeps "only" exactly where Long has
  it. "Do only determine", the reviewer's alternative, was declined with the
  reviewer: it reads as a concession ("do at least"). **The IX.40 repair is
  localised, not narrowed**: the vocative comma is licensed where a fronted
  pronoun carries a contrast, not merely where a "do + thou" imperative needs
  modernising. "[Thee to live]" folded — the completion of
  "does not allow". **Base-text point:** PG prints "thou **are** not simple" for
  "art"; SE has the same slip transposed to the next clause ("thou are not
  good"). Both are modernised to "you are" and the slip does not reach the
  candidate.
- **X.33** — "[Our life]" folded as an apposition on "this material", **set
  with em dashes** — "What is that which, as to this material—our
  life—can be done or said…" (changed at acceptance, optional finding 33.1; v1
  set it with commas). Four commas in eleven words held the relative "which …
  can be done" open across two nested appositives before the reader reached the
  verb; the dashes are the same device X.13's and X.21's appositions use, and
  every word and Long's order are kept. Applied under D8: v1 recorded no
  considered reason for preferring commas here, so there was none on record
  better than the reviewer's. **"[Order]"
  is DROPPED under D11**: it is a second English rendering of Long's "law", and
  unlike X.21's "[is wont]" nothing in the meditation turns on the second sense
  — Long himself then uses "law" three more times in the next two clauses, so
  folding "order" in once would leave the reader wondering why it never comes
  back. "Conformable to reason" and "conformable to man's constitution" → "in
  accordance with reason" and "in accordance with man's constitution" (the
  Book I and Book IV rendering of Long's "conformable to" outside the *kata
  physin* row). **Two commas removed**, both before restrictive relatives:
  "nothing harms him who is really a citizen**,** which does not harm the state"
  and "anything harm the state**,** which does not harm law" — the X.6 and X.20
  class. The long closing chain (citizen, state, law, misfortunes, and back to
  citizen) keeps every link and its order.
- **X.34** — Long's Homer quotation is kept in his words, with his dash inside
  it, joined into the paragraph as the staged original has it (verse lines are
  not preserved as lines anywhere in this package). "Those who shall receive and
  transmit a man's fame" → "will receive"; "thou shalt close thy eyes" → "you
  will close your eyes"; "thou avoidest and pursuest" → "you avoid and pursue".
  "After-times" **kept** as Long's compound. **The two spaced em dashes in the
  Homer quotation — "For example:— \"Leaves, some the wind scatters on the
  ground— So is the race of men.\"" — are inherited from the verse join
  and are deliberate** (recorded at acceptance, optional finding 34.1, which
  asks for the record and not for a change). The paragraph is byte-identical to
  the staged original here: the first dash is Long's own after "For example:"
  and the second is his line-end dash at PG 6305, and the spaces are what
  `../PROVENANCE.md` §4's verse rule produces when it joins verse lines with
  spaces. The glossary's "em dashes without spaces" governs the candidate's own
  dashes, not the source's. Changing it would mean changing the verse-joining
  rule, which reaches V.31, V.33, five places in Book VII, XI.6, XI.31, XI.32
  and XII.3, five of them in accepted books. The second quotation, "are produced
  in the season of spring," and "as the poet says" are kept and not identified.
- **X.35** — Long with the pronouns modernised; nothing else. The four healthy
  organs and the fifth term they build to are in Long's order.
- **X.36** — "There shall not be **by him**" → "there shall not be **beside
  him**" (changed at acceptance, optional finding 36.1). The **"shall" is
  untouched and stays defended** (negative consecutive clause; see the "shall"
  section); the word repaired is the preposition. Long means *at his side*, and
  "be by him" in modern English reads first as agentive — something done
  **by** him — and only on a second pass as locative, at the opening of the
  longest meditation in the second half of the book and inside a long
  correlative the reader is already holding open. The same class of change as
  "like to an axe" → "like an axe" at X.38 and "in fine" → "in short" at
  X.26. "At least **some one**" → "at least **someone**" (changed at
  acceptance, optional finding 36.2): PG's two-word pronoun is a typographic
  convention of 1862, not a reading, and is normalised with the American
  spelling, the straight quotation marks and the em dashes. **The base-text
  ruling at X.36 is untouched by it** — it is about "least" against Standard
  Ebooks' "last", and the candidate still reads "at least". "**Perchance**" → "**perhaps**": unlike IX.3, where
  "perchance" stands inside Marcus's one heightened sentence, a quoted cry to
  death, here it sits in a plain reported reflection about associates hoping for
  a small advantage, where the archaic word has no work to do. "Benevolent" →
  "**kind**" (glossary). "As if thou wast torn away" → "as if you were torn
  away". The whole of the dying man's speech, the dash before "This is what is
  said of a good man", the turn back onto Marcus, and the closing "for this,
  too, is one of the things according to nature" are kept in Long's order.
- **X.37** — **Two commas added**, round "on the occasion of anything being done
  by any person", so the long adverbial phrase does not read as attaching to
  "possible". House style, and the only punctuation added in the book that is
  not answering an ambiguity in a clause.
- **X.38** — "They are like to an axe" → "they are like an axe" ("like to" is
  dead). The three final instruments — the weaver's shuttle, the writer's pen,
  the driver's whip — keep their order and their possessives.

## Apparatus dropped or folded

**Cross-references dropped: four spans in three paragraphs.**

- X.5 "(iii. 11; iv. 26)".
- X.13 "(vi. 32; viii. 55)" and "(vii. 17)".
- X.26 "(vii. 85)".

**Brackets in Long's Book X: eighteen. Fourteen folded, three dropped under
D11, one translator's note dropped under D13 — 14 + 3 + 1 = 18.**

*Corrected at acceptance (finding C1, and finding 15.1).* Two things were wrong
in v1's records. The numeral said **sixteen** folded against two dropped, which
with the translator's note makes nineteen, one more than the eighteen brackets
the same sentences assert and the mechanical check verifies; the **list below
was right all along** and only the numeral above it was wrong, and v1's
`README.md` check block was labelled "the sixteen folds" while spot-checking
thirteen of them, which is how the error survived a draft, a freeze and a
self-check. The true v1 count was **fifteen** folded. Applying finding 15.1
moves X.15's "[political community]" from the folds to the D11 drops, so the
accepted count is **fourteen folded, three dropped under D11, one translator's
note**. `../scripts/build_book10_v2.py` and the `README.md` check block now
**enumerate every fold individually and assert that folds + D11 drops +
translator's note equals the source's own bracket count**, so a numeral that
disagrees with the list is a build failure rather than a reading error.

*Folded — fourteen*, of which the ones marked **referent** are supplements that
supply a word the sentence's syntax needs, under the VI.50 / VII.2 rulings and
the Books VIII and IX applications:

- X.6 "[a concourse of]" and "[is a system]" — **completions**: each supplies
  the predicate of one limb of Long's disjunction.
- X.7 "[as an efficient power]" — qualifies "the term Nature".
- X.7 "[the accretion]" — **referent**: the object of "has received".
- X.7 "[which thy mother brought forth]" — **referent**: Long repeats his own
  phrase in place of a pronoun.
- X.7 "[of change]" — **referent**: the quality named.
- X.8 "[laudable]" — the adjective Long supplies for "this one thing".
- X.11 "[of philosophy]" — **referent**: which part.
- X.13 "[happiness]" — Long's own gloss on "a good daemon", folded as an
  apposition (the VII.17 practice; see the glossary row extended for this book).
- X.15 "[as men do]" — the completion of "to live thus". (X.15's
  "[political community]" was folded in v1 and is **dropped under D11** in v2;
  see below and the X.15 entry.)
- X.21 "[is wont]" — the second sense of the one verb the meditation is about;
  folded rather than dropped, for the reason given at X.21 above.
- X.31 "[for thy activity]" — **referent**: what the matter and opportunity are
  for.
- X.32 "[thee to live]" — the completion of "does not allow".
- X.33 "[our life]" — an apposition on "this material".

*Dropped under D11 — three, each Long addressing his reader rather than
Marcus addressing himself:*

- **X.2 "[social]"** — a D11 alternative rendering: Long's second English word
  for the one Greek adjective he has already translated "political". His
  primary word stands.
- **X.33 "[order]"** — the same, for "law". His primary word stands, and stands
  three more times in the sentences that follow.
- **X.15 "[political community]"** — the same, for "a state" (moved here at
  acceptance, finding 15.1). Long uses neither word again in the section, so
  nothing dangles, and the meditation's point survives the drop entire.

*And one further drop of the same family under **D13**, not an alternative
rendering:*

- **X.23 "[The three last words are omitted in the translation.]"** — a
  translator's note about Long's own handling of Plato's Greek. Apparatus, of
  the cross-reference and footnote kind, and dropped with them. Standard Ebooks
  omits it too. **D13** is the ledger row added at acceptance in answer to
  finding 23.1, which upheld the drop and pointed out that no rule covered it;
  it is worded to generalise to any bracket in Long's own voice about his own
  handling of the Greek, with the X.21 limit written into it.

**Verse:** one quotation, Homer at X.34, joined into the paragraph with spaces
as the staged original has it. **Verse citations:** none in the body (Long's
"Homer, Il., vi. 146." is a footnote).

**No expansion.** The short meditations stay at Long's length: X.4, X.5, X.14,
X.16, X.17, X.18, X.20, X.22, X.29, X.37 are all within a word or two of the
source, and **five are byte-identical to Long** — X.16, X.17, X.18, X.19 and
X.35 (X.19 including its dagger-marked clause, since the dagger falls where the
candidate changes nothing) **in v2 as in v1**. The word ratio for the
book is **0.9927** in v2 (4,537 → 4,504; 0.9943 in v1, the six acceptance
substitutions removing five tokens between them). The minimum paragraph ratio is
**0.88** at X.23, whose whole difference is the nine-word translator's note
dropped — the round-1 reviewer ruled on it directly rather than accepting the
explanation, and found that with the note set aside the meditation is 57 source
words against the candidate's 58, so "the 0.88 is entirely the dropped note;
there is no compression anywhere in the book". Next lowest are X.5 (0.90, a
dropped cross-reference of four tokens out of forty), X.13 (0.95, two dropped
cross-references) and X.32 (0.95). The maximum is 1.08 at X.29, a twenty-six-word
meditation where "Severally" becomes "One by one". Twenty-five of the
thirty-eight paragraphs sit between 0.99 and 1.02.

## Punctuation changed

The whole tally, corrected at acceptance (finding 1.1 added the first row, which
v1 had made in the text and listed nowhere).

**Five of Long's commas removed.** X.1, after the pronoun in the address ("Will
you then, my soul"). X.6, X.20 and X.33 ×2, each before a restrictive relative
that Long's comma turns into an aside ("the life of a citizen is happy who
continues a course of action"; "the good of each thing which the universal
nature brings to each"; "nothing harms him who is really a citizen which does
not harm the state"; "anything harm the state which does not harm law").

**One comma raised to a semicolon.** X.7, where Long splices two independent
clauses ("the particular quality of change; this is nothing in fact").

**Two commas added.** X.37, round the long adverbial "on the occasion of
anything being done by any person", which without them reads as attaching to
"possible".

**Two commas replaced by em dashes at acceptance.** X.33's apposition "as to
this material—our life—" (finding 33.1).

**One of Long's commas deliberately kept although it separates a subject from
its verb.** X.25's "who is grieved or angry or afraid, is discontented", because
it falls at a dagger; confirmed at round 1.

**Two spaced em dashes inherited, not authored.** X.34's, from the verse join;
recorded, not changed (finding 34.1).

## Nothing imported from other translations

Every candidate paragraph was drafted from Long's text of the same numbered
section and from nothing else. Standard Ebooks' Long was consulted **after the
draft was written**, for the state of the base text only, by a word-level diff
of the whole of Book X fetched 2026-09-12; no wording was taken from it, and the
two places where it differs substantively are recorded below. The widely quoted
passages keep Long-specific turns that the familiar modern versions do not have:
X.1 "more plain to see than the body which surrounds you"; X.8 "what does the
work of a fig-tree is a fig-tree"; X.15 "Live as on a mountain"; X.16 "No longer
talk at all about the kind of man that a good man ought to be, but be such";
X.17 "a grain of a fig … the turning of a gimlet"; X.34 "Leaves, also, are your
children"; X.38 "this which pulls the strings".

## Unresolved source issues (Long's text)

**Four dagger marks in four sections**, PG #15877 lines 6038 (X.9), 6132 (X.19),
6183 (X.25), 6229 (X.31), matching `../PROVENANCE.md` §4. Long uses the dagger
for a place where the Greek is corrupt. Each clause stands as Long has it, with
pronouns modernised and glossary renderings applied, and nothing is made clearer
than the source:

- **X.9 (PG 6038)** — the dagger falls at a **sentence boundary**, after "those
  holy principles of thine." and before "How many things without studying
  nature…". No clause is affected.
- **X.19 (PG 6132)** — inside the clause: "when they are imperious + and
  arrogant, or angry and scolding from their elevated place." Kept as Long has
  it.
- **X.25 (PG 6183)** — inside the clause: "And he also who is grieved or angry
  or afraid, + is dissatisfied because…". **Long's comma after "afraid" is
  kept**, though by modern punctuation it separates the subject from its verb;
  see X.25 above and the flagged decisions below.
- **X.31 (PG 6229)** — "When thou hast seen Satyron[A] the Socratic,+ think of
  either Eutyches or Hymen". Kept as Long has it.

Long's own footnotes at X.7 and X.9 say as much: the first ("The end of this
section is perhaps corrupt. The meaning is very obscure") and the second
(Corais's conjecture for "Mimi"). Both are apparatus and are not imported; they
are named here so a reviewer can weigh findings in those sections accordingly.

**Base-text points, from a word-level diff of the whole book against Standard
Ebooks' Long (fetched 2026-09-12):**

- **X.15, a PG slip. FLAGGED.** PG line 6106 prints "Let **me** see, let them
  know a real man who lives according to nature." Standard Ebooks reads "Let
  **men** see". "Let me see" cannot be right: the clause is one half of a
  parallel pair with "let them know", the subject of both is the people among
  whom Marcus lives, and "let me see … let them know" changes subject mid-pair
  for no reason and leaves "them" without an antecedent. Rendered "**Let men
  see**". This is the **one departure from PG's letters in Book X**, the VIII.37
  "Fergamus"/"Pergamus" and IX.34 "pool souls"/"poor souls" case in this book's
  form.
- **X.6, PG right and Standard Ebooks wrong.** PG "I shall turn **all** my
  efforts to the common interest"; SE prints "turn **an** my efforts", which is
  not English. PG followed.
- **X.36, PG right and Standard Ebooks wrong.** PG "will there not be **at
  least** some one to say to himself"; SE reads "at **last** someone", which
  would put "at last" twice in eleven words ("Let us at last breathe freely")
  and says something Long's sentence does not. PG followed.
- **X.32, a slip in both, in different places.** PG prints "thou **are** not
  simple … thou art not good"; SE prints "thou art not simple … thou **are** not
  good". Each has one "are" for "art", in the clause the other gets right. Both
  become "you are" in the candidate, so the slip does not reach it either way.
- **X.23, Standard Ebooks omits Long's bracketed translator's note** entirely,
  which corroborates (without deciding) the classification of it as apparatus.
- **X.27, PG's Latin name forms followed.** PG "Hadrianus" and "Philippus"; SE
  modernises to "Hadrian" and "Philip". D6 governs and the accepted Book IX
  already keeps "Philippus" at IX.29.
- **X.11 and X.34, PG's em dashes followed** where SE has none.
- **Standard Ebooks prints Book X in 43 typographic paragraphs**, breaking
  inside X.2, X.13, X.28 and X.34 (twice). None is a section break: PG prints
  each section whole, 38 is the standard section count for Book X, no text
  differs on either side of any break, and a 39th or 43rd paragraph here would
  break the 487-paragraph alignment the whole package is built on. The same
  point arose at IX.28 and was ruled the same way at round 1.

## Decisions flagged for the reviewer — all settled at round 1

Three were flagged for an explicit ruling and one offered for confirmation. The
round-1 reviewer ruled on all four and **none is left open**; the drafter is
upheld on three and overruled on one (X.32), which is finding 32.1, applied.

1. **X.15 "Let men see" for PG's "Let me see" — UPHELD.** Four independent
   grounds converge: the clause is one half of a parallel pair with "let them
   know" and changing subject mid-pair is motiveless; "them" is left without an
   antecedent under "let me see"; the section is about how Marcus is *seen* by
   those among whom he lives, not about what he sees; and a dropped single
   letter is the commonest class of transcription slip. Standard Ebooks reads
   "men". Same class as VIII.37 "Fergamus"/"Pergamus" and IX.34 "pool
   souls"/"poor souls", both upheld at round 1 of their books. It stays **the
   one departure from PG's letters in Book X**.
2. **X.9 "Mimi" kept as Long prints it — UPHELD, and no gloss exception is
   warranted.** It is Long's text, not apparatus; "mimes" would import the
   dropped footnote's content *and* mislead, since a modern "mime" is a silent
   performer rather than the broad farce Marcus means, and a bracketed or
   appositive gloss would be exactly the imported-footnote content the
   no-glosses rule exists to prevent. The reader meets an unfamiliar proper noun
   first in a list of five distractions and takes it as a kind of show, which is
   close enough to right. Kept ungloss'd, on the IX.2 "the next best voyage, as
   the saying is" precedent.
3. **X.32's vocative-comma imperative — REJECTED; the reviewer rules for the
   other option, modified.** Finding 32.1, applied: "**Only determine** to live
   no longer unless you are such." See the X.32 entry above for the reasoning
   and for what it settles about the IX.40 repair, which is localised rather
   than narrowed.
4. **Long's comma after "afraid" inside the X.25 dagger clause — CONFIRMED,
   kept.** The comma closes a long relative subject, ordinary nineteenth-century
   practice, and creates no misreading for a modern reader; it is a rhythm mark,
   not a syntax error waiting to trip anyone. And it falls at the dagger, where
   the VI.50 / VII.16 / VIII.51 / IX.6-26-27 practice is that the clause stands
   as Long has it with only pronouns and glossary renderings changed. Removing
   it would be a stylistic change inside a dagger clause, the exact thing the
   Book VIII reviewer reverted at VIII.51.

## Further rulings recorded at acceptance

Not flagged by the drafter, but ruled on by the reviewer and recorded so they do
not reopen:

- **X.21's "[is wont]" folded rather than dropped — CONFIRMED** (the
  execution repaired; finding 21.1). In form a D11 case, in substance not one.
- **X.2's "[social]" and X.33's "[order]" dropped — CONFIRMED**, on the
  drafter's own test; X.15 is now decided the same way (finding 15.1).
- **X.6 and X.36, PG right against Standard Ebooks — both CONFIRMED.** SE's
  "turn **an** my efforts" is not English and is plainly a slip for "all", which
  is also what the argument needs; SE's "at **last** someone" would put "at
  last" twice inside eleven words and flattens Long's concessive "at least" into
  a temporal.
- **The "thou are" slip present in both base texts — correctly invisible**,
  and recording it anyway is the right call, so a later collator does not think
  one text was silently preferred.
- **X.27's Latin name forms — CONFIRMED** under D6, with IX.29's "Philippus"
  as the precedent; modernising two of five would produce a mixed roll.
- **Standard Ebooks' five typographic paragraph breaks — CONFIRMED ignored**,
  the IX.28 ruling; none is a section break and a 39th or 43rd paragraph would
  break the 487-paragraph alignment.
- **The three terms kept out of glossary rows — all three right**: X.7's
  "the universal reason" (Long's own adjective + noun, of the same shape as "the
  universal nature"), X.8's "the intelligent part" (not one of the five variants
  the ruling-part row collects, and a different thing), X.33's "irrational soul"
  (current English and Long's own).
- **The "shall" audit passed.** All 23 classified independently and matched to
  the drafter's report exactly: six kept, seventeen removed, every removal a
  plain future. X.11's indirect "what any man shall say" and X.32's direct "who
  is he that shall hinder thee" are both **rhetorical** futures, not deliberative
  questions, so the clause widened at Book IX acceptance never fires in Book X.
  The rule's edge — X.1's *positive* consecutive clause removed while X.36's
  *negative* one is kept — is consistent under the rule's letter and its
  spirit; no finding. Book X adds no new case to the three third-person plain
  futures standing in accepted books (III.9, VII.8, VII.24).
- **The step-1 no-rebuild finding — UPHELD by the stronger method**, with
  `../scripts/verify_book10_source.py`'s own *rules* audited against the raw PG
  range before its output was looked at. The three rules that can fail silently
  were each tested: the footnote-consumption rule cannot have swallowed Long's
  Homer couplet (twelve maximal indented runs in the range, eleven footnote runs
  at four spaces with the footnote-[B] Odyssey quatrain at seven, and the
  twelfth — 6305–6307 — at **five**, containing no footnote opener and
  adjacent to no footnote run); the join-unnumbered-blocks rule cannot hide a
  running head, page number or catchword, and there are no standalone short
  flush-left lines **inside** the range at all (the drafter's "exactly one"
  counted the `X.` header at 5865, which sits outside it — noted, no
  consequence); and a flush-left footnote body of the VII.45 kind would have
  shown as a diff. The marker recount reconciles exactly: 16 flush-left markers
  + 1 inside the verse at 6306 = 17, for 17 indented openers in eleven runs.
  Four differing paragraphs, each differing only by one `+`. **No rebuild, no
  accepted book reopened.**
- **The word ratio and the five byte-identical paragraphs — ruled on
  directly.** The 0.88 minimum at X.23 is entirely the dropped note; the five
  identical paragraphs are a real result, each checked against the accessibility
  standard on its own and containing no thou-form, no archaic inflection, no
  glossary term, no bracket, no cross-reference and no dagger-affected wording.
  "Changing them would have been the error."
- **Nothing imported** — the complete list of words the candidate uses that
  occur nowhere in Long's Book X is eleven, each documented, and the seven
  passages most likely to attract a familiar modern rendering each keep a
  Long-specific turn that Hays, Farquharson and Staniforth do not have.
