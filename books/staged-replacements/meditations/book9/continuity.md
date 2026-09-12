# Continuity sheet — Meditations, Book IX (candidate v1 frozen; accepted as v2)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V,
VI, VII and VIII were accepted, and describing what the frozen draft actually
did. **Updated at acceptance (2026-09-12)** with the round-1 corrections, the
findings declined and why, and the reviewer's rulings — the accepted file is
`candidate-v2.json` (sha256 `56dd7d13…`); see `ACCEPTANCE.md` and
`changes-v1-to-v2.md`. Where an entry below described v1 and v2 changed it, the
entry now says so. Term renderings follow `../GLOSSARY.md` (one row extended for Book IX
**before** drafting, see below); the pattern for applying review findings
follows the eight earlier `ACCEPTANCE.md` files (decisions D8, D10, D11 and D12
in the ledger), and the "shall" rule fixed at Book VIII acceptance is applied
here for the first time in a book drafted under it.

## Source

- `../meditations-original-en.staged.json`, chapter `number: 9`, title `Book 9`,
  42 paragraphs, one per numbered meditation (IX.1–IX.42). Extracted verbatim
  into `source-book9.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- **Step 1: the staged original was NOT rebuilt for Book IX, and it did not need
  to be — but this book is the one where the question was live.** The file had
  already been rebuilt twice for PG apparatus the first build missed: three
  illustration captions at Book IV step 1 (`7bf2d1b1…` → `b0ecf3da…`), **one of
  which was in Book IX**, and three flush-left footnotes at Book VII step 1
  (`b0ecf3da…` → `7798607d…`). The Book VIII reviewer warned explicitly that PG
  line 5628 carries an illustration caption inside Book IX. PG #15877 was
  therefore re-read line by line for Book IX (PG lines 5419–5864, the `IX.`
  header at 5419 to the `X.` header at 5865), class by class:
  - **Illustration captions.** **One**, at PG line 5628: `[Illustration: THE
    FORUM]`, standing alone between blank lines, between the end of IX.21
    ("…a thing to be afraid of.") and the start of IX.22 ("22. Hasten [to
    examine]…"). It is the caption the reviewer warned about, and it is the
    third of the three that survived the *first* build (appended then to IV.20,
    V.8 and IX.21). **It is already stripped**: the caption filter added at Book
    IV step 1 removes it, IX.21 ends at "a thing to be afraid of." and IX.22
    begins at "22.", and no `[Illustration` survives anywhere in the staged
    file. The six captions in the whole PG file are at lines 56, 1352, 1747,
    3169, 3580 and 5628.
  - **Footnotes.** Book IX has **eight**, at PG lines 5462, 5515, 5601, 5649,
    5680, 5707, 5778 and 5858, and **every one is printed indented** (four spaces, then `[A]`), which is the form the build's footnote
    filter has always caught. There is **no flush-left footnote opener anywhere
    in the book**, so the defect that hit VII.45 does not recur. Their bodies
    are Long's notes quoting Butler's Analogy, "Note 1 of the Philosophy",
    Cicero *De Off.* i. 6, Gataker and Schultz on *to tes Nekuias*, the corrupt
    words after *kat' epakolouthesin*, Davies and Vaughan's Plato, the
    corruption at the end of IX.29, and *Apechei to idion* — none of it
    translation, and none of it in the staged text.
  - **Flush-left standalone lines.** Every flush-left line in PG 5419–5864 was
    listed and inspected. Exactly **three** stand alone between blank lines: the
    `IX.` header at 5419, the `X.` header at 5865, and the illustration caption
    at 5628. Every other short flush-left line is the last wrapped line of a
    paragraph. So there is no orphan footnote body of the VII.45 kind and no
    other apparatus printed flush left.
  - **Running heads, page numbers, catchwords.** None: no digits-only line and
    no all-caps line between the two book headers except the `IX.` header
    itself.
  - **Verse and verse citations.** **None.** Book IX contains no indented
    (verse-set) line at all outside the eight footnote bodies, and no source
    citation of the "HESIOD, Works, etc." kind. The build's own verse report
    lists sections in Books 5, 7, 10, 11 and 12 and none in Book 9.
  - **Greek in the body.** None. Every `[Greek: …]` span in PG 5419–5864 is
    inside a footnote body (5473–5476, 5649, 5651, 5680, 5858, 5860) and is
    stripped with it. The four `(Greek: …)` spans in the staged file are VII.13
    ×2 and VIII.57 ×2, as before.
  - **Dagger marks.** **Three**, and only three: PG 5525 (IX.6), 5661 (IX.26)
    and 5669 (IX.27), matching `../PROVENANCE.md` §4.
  **Proof, run rather than argued:** the staged file was copied aside and
  `scripts/build_original_en_from_pg15877.py` re-run from
  `../source/pg15877-long-1862.txt` (sha256 `6584df7e…`). The output is
  **byte-identical** to the file already on the branch — `cmp` clean, `git
  status` reports no modification, sha256 still
  `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`, 487
  paragraphs, 12 chapters, the section profile still
  17, 17, 16, 51, 36, 59, 75, 61, **42**, 38, 39, 36. Nothing anywhere in the
  file changed, so **no accepted book is reopened** and Books I–VIII's
  `source-bookN.json` files and acceptances stand untouched. The build's own
  leftover checks print `[X] 0 plus 0 Greek 4 underscore 0 dbl-hyphen 0
  illustration 0`, which is the expected state.
- Book IX was read in full before any paragraph was drafted: 42 meditations,
  4,252 words, the longest IX.42 (504 words, on being offended at another's
  shamelessness and turning the blame round) and IX.1 (474 words, on injustice
  as impiety), the shortest IX.7 (16 words, the four commands) and IX.38 (19
  words, the harm is his own). Its threads: injustice and lying as impiety
  against the universal nature (IX.1, IX.4, IX.5, IX.38, IX.42); death as one
  of nature's operations (IX.3, IX.21, IX.33); the drawing together of things of
  the same kind (IX.9, IX.23, IX.31); the ruling part examined, entered and
  addressed (IX.7, IX.15, IX.18, IX.22, IX.26, IX.34, IX.39); the smallness of
  reputation seen from above (IX.29, IX.30, IX.32, IX.34); gods, chance and
  prayer (IX.28, IX.39, IX.40); and the rottenness of matter (IX.24, IX.36).
- Cross-checked for Book IX against Standard Ebooks' Long (the edition
  `../PROVENANCE.md` §3 names), fetched 2026-09-12, by a word-level diff of the
  whole book, for the **state of the base text only**; no wording was taken from
  it. Everything the diff turned up is recorded under unresolved source issues
  below: one base-text slip in PG, three places where PG is right and Standard
  Ebooks is wrong or adds a word, one genuinely open variant (IX.29), one
  typographic paragraph break, and otherwise only spelling convention
  (`honor`/`honour`, `labor`/`labour`, `neighbor`/`neighbour`, `gray`/`grey`,
  `judgment`/`judgement`, `to-day`/`today`, `co-operate`/`cooperate`,
  `such like`/`suchlike`, `Philippus`/`Philip`) and the apparatus Standard
  Ebooks drops or moves to endnotes.

## Glossary rows extended for Book IX, before drafting

| Row | Change | Why |
|---|---|---|
| the Deity; the divinity; a portion of the divinity → **the divine**; **a share of the divine** | **extended** | Long also uses "divinity" as a **count noun with a modifier**, naming the god rather than the quality: "impiety towards the highest divinity" and "impiety to the same divinity" (IX.1, the only two such uses in the book). The row's "the divine" cannot stand there — "the highest divine" is not English — and no substitution is needed, because "the highest divinity" is current English for exactly what Long means. The row therefore governs his **bare abstract** uses (II.1's "a portion of the divinity", rendered "a share of the divine"; VII.46's "the Deity", rendered "the divine") and his modified count uses keep "divinity". Committed and pushed before any paragraph of Book IX was written. |

No new rendering row was needed. Every other recurring term in Book IX was
already fixed: nature and according to nature, the universal nature, the common
nature, the whole and the universe, reason, rational being, social, the ruling
part, the gods and God, providence, opinion, impressions, imagination,
principles, impulse, intelligence and understanding and mind, soul, the
elements and dissolution, fame after death, disturbance, kindness, the common
good, commonplace, change and transformation, a man and men.

## Glossary terms met in Book IX and how they were rendered

| Long (source) | Candidate | Where |
|---|---|---|
| the universal nature | the universal nature | IX.1 ×7, IX.35 — Long's own phrase, kept |
| the common nature | the common nature | IX.29 |
| the common intelligent nature | the common intelligent nature | IX.9 |
| the whole; the whole universe | the whole; the whole universe | IX.19, IX.32, IX.39 |
| according to nature; conformable to thy nature; conformably to his constitution | according to nature; according to your nature; according to his constitution | IX.3, IX.31, IX.42 ×2 |
| reason; the social reason | reason; the social reason | IX.8, IX.9, IX.10 ×2, IX.12, IX.42 |
| rational animals; reasonable animals; rational social animal | rational beings; rational social being | IX.1, IX.8, IX.9, IX.16 |
| animals which have not reason; animals devoid of reason; animals (as beasts) | animals | IX.8 ×2, IX.9 ×3 — Long means beasts here, so the rational-being row does not reach them; the VIII.12 reading |
| intelligent animals (of men) | intelligent beings | IX.9 |
| social (system, life, acts, end, good) | social | IX.6, IX.12, IX.23 ×3, IX.31 |
| the ruling faculty; men's leading principles | the ruling part; men's ruling parts | IX.7, IX.15, IX.18, IX.22 ×3, IX.26, IX.34, IX.39 |
| the divinity (with a modifier) | divinity | IX.1 ×2 — row extended before drafting |
| the gods; God; a god | the gods; God; a god | IX.11, IX.27, IX.28, IX.35, IX.40 — Long's capitals kept where he has them |
| Providence | Providence | IX.1 — Long's capital kept, as the row keeps his capitals |
| opinion(s) | opinion(s) | IX.6, IX.13, IX.21, IX.29 ×2, IX.32 |
| imagination | imagination | IX.7 |
| impressions | — | not used in Book IX |
| movement(s) in the sense of *hormē* | impulse | IX.21 ("cessation from impulse and opinion"), IX.31 ("impulse and action") |
| movement(s) in the sense of motion | movement(s) | IX.1 ("a certain original movement of Providence"), IX.28 ("the periodic movements of the universe"), IX.41 ("such movements as go on in the poor flesh") |
| perturbations; free from perturbations | disturbances; freedom from disturbances | IX.31, IX.41 |
| mutation | change | IX.19 |
| transformations | transformations | IX.28 |
| dissolution | dissolution | IX.3, IX.32 ×2, IX.33 |
| vulgar kind of comfort | commonplace kind of comfort | IX.3 |
| posthumous name | a name after death | IX.30 |
| benevolence; benevolent | kindness; kind | IX.42 ×2 |
| the common interest | the common good | IX.42 |
| in a manner | in a way | IX.9 ×2, IX.19, IX.28 |
| a man; men (generic) | a man; men | throughout |

## Paragraph-level decisions

Only departures from a word-for-word modernisation of Long are listed. Where a
paragraph is not listed, the candidate is Long's sentence with "thou/thee/thy"
changed to "you/your", his verb forms made current ("dost" → "do", "wilt" →
"will", "canst" → "can", "hast" → "have", "mayst" → "may"), and nothing else.

- **IX.1** — Cross-reference "(vii. 75)" dropped. "According to their deserts"
  and "contrary to their deserts" → "according to what they deserve" and
  "contrary to what they deserve": Long's noun survives only in the fixed
  phrase "just deserts" and is read as the geographical word on the page. This
  is Book I's rendering of the same noun at I.16, twice ("according to his
  deserts" → "what he deserved"), and its second book; if it recurs in Book XI
  (XI.18) it should be promoted to a glossary row on the Book VI precedent.
  "He who transgresses her will" → "he who goes against her will" (plainer, and
  Long's own idiom elsewhere). "Inasmuch as" → "since" — **three times, not four**;
  the sheet said four at v1 and the round-1 reviewer (finding 1.1) found only
  three "inasmuch as" in IX.1. The fourth "since" had silently replaced Long's
  ordinary "for" and was unrecorded. **Corrected in v2**: Long's connective is
  restored — "…contrary to truth, **for** he had received powers from nature…"
  — because "for" is current English and needed no modernising, and because
  Long's two "for"s mark the two explanatory descents of a sentence that
  already carries three "since". The paragraph now holds four "since" (Long's
  own "For since the universal nature has made…" plus the three that render his
  "inasmuch as") and two "for". **In v2 also (finding 1.2), Long's semicolon is
  restored** in "the universal nature is the nature of the things that are;
  and the things that are have a relation to all things that come into
  existence" — the two definite articles the candidate added stay (Long's
  anarthrous "things that are" is a technical term, *ta onta*, and the article
  is what makes a modern reader hear it as one), but lowering the semicolon to
  a comma left two independent clauses spliced, and the semicolon separates
  what the universal nature *is* from the consequence drawn about it. "The prime cause" → "the first cause". "Manifestly
  acting impiously" → "plainly acting impiously" — Long's own word two sentences
  earlier ("this is plainly impiety"), so this is his vocabulary, not a
  substitution. "They who wish to follow nature" → "those who wish to follow
  nature". **"A certain original movement of Providence" keeps "movement"**: it
  is the first motion of the cosmos, not *hormē*, and the glossary row converts
  only the impulse sense. "The highest divinity" and "the same divinity" keep
  "divinity" under the row extended for this book.
- **IX.2** — "Hast thou determined to abide with vice" → "have you determined
  to remain with vice" ("abide with" in the sense of *stay with* is archaic;
  "abide by" is the surviving use and means something else). "To fly from this
  pestilence" → "to flee from this pestilence", the rendering Book VII fixed for
  Long's "fly" at VII.71 and Book VIII applied at VIII.48. "The next best
  voyage, as the saying is" **kept**: it is Long's rendering of the proverb, he
  marks it as a proverb himself, and replacing it would delete the fact that
  Marcus is quoting one.
- **IX.3** — "Which shall reach thy heart" → "which will reach your heart", and
  "the time when the child shall come out" / "when thy soul shall fall out" →
  "when the child comes out" / "when your soul falls out": the "shall" rule
  fixed at Book VIII acceptance (`../GLOSSARY.md`, Voice and form) — plain
  futures in a relative or temporal clause take "will" or the plain present.
  "A vulgar kind of comfort" → "a commonplace kind of comfort" (glossary). "It
  is no way right" → "it is in no way right". **"Envelope" is kept**: Long's
  word for the body the soul falls out of is concrete and current.
  "Perchance" **kept** inside the quoted cry "Come quick, O death, lest
  perchance I, too, should forget myself" — it is Long's one heightened
  sentence in the paragraph and it is a quotation of Marcus's own exclamation.
  **Recorded at acceptance (finding 3.1, declined):** "thou wilt **be made**
  best reconciled to death" → "you will be best reconciled to death". The
  auxiliary is dropped and the drop was not listed here at v1, which is the
  part of the finding that was a real omission. The text stands: "be made best
  reconciled" is not English anyone writes now, the reviewer's own proposed
  repair ("be brought best to terms with death") is further from Long than the
  candidate is, and the reviewer would sooner see the drop recorded than
  undone. Long's causal shade survives in the sentence's own means clause, "by
  observing the objects from which you are going to be removed".
- **IX.7** — "Keep the ruling faculty in its own power" → "keep the ruling part
  in its own power" (glossary). Long's mixed pointing between the four commands
  is kept as he has it: "Wipe out imagination; check desire: extinguish
  appetite: keep the ruling part in its own power." **Considered again at
  acceptance (finding 7.1, declined).** The reviewer rates the unevenness the
  one place in the book where reproducing Long's accidentals costs a little
  clarity, would not press the change, and says consistency with eight accepted
  books is worth more. It is. Nothing here misdirects — four commands are four
  commands under any pointing, and no reader takes a colon between two
  imperatives as a change of subject — whereas repointing would be the first
  time this edition normalised punctuation Long left uneven for no reason but
  evenness, which `../GLOSSARY.md` does not license. Contrast the commas
  actually moved in this book (IX.9, IX.29), each of which changes how a clause
  is parsed.
- **IX.8** — "Reasonable animals" → "rational beings" (glossary). "The animals
  which have not reason" **kept** as "animals": Long means beasts, and the
  contrast in the sentence is precisely beasts against rational beings (the
  VIII.12 reading).
- **IX.9** — "[This union]" folded: "though men strive to avoid this union" —
  **referent**: the object of "avoid", and without it the verb has none.
  Standard Ebooks runs the words as plain text. "Everything which is of an
  aerial kind" → "everything which is of the nature of air", following Book
  VIII's "the aerial power" → "the power of the air" at VIII.54. "To keep them
  asunder" → "to keep them apart". "In a manner, loves" → ", in a way, loves" and
  "unity in a manner exists" → "unity in a way exists" (glossary). **The commas
  round the hedge were corrected in v2 (finding 9.1)**: v1 kept Long's comma
  placement, "and in a way, loves", which a modern reader parses with "loves"
  as a **verb** — Long's "in a manner" read as a set phrase and carried the
  reader past it, and "in a way" does not. v2 reads "and the nurture of young
  birds, **and, in a way, loves**", the hedge properly parenthetical and
  "loves" recovered as the fourth item in the list. One comma, no word
  changed. "Only
  intelligent animals" → "only intelligent beings" (Long means men; the Book
  VII rendering). "Anything earthy" **kept** twice, as Long has it.
- **IX.10** — "But and if usage has especially fixed these terms" → "but if
  usage has especially fixed these terms": "But and if" is a dead construction
  (it is the King James "but and if"), and Long's sense is the plain
  conditional.
- **IX.12** — "Labor not as one who is wretched" **kept** with Long's inversion:
  it is an imperative and the inversion is the sentence's force, not its
  difficulty.
- **IX.15** — "Neither knowing aught of themselves" → "neither knowing anything
  of themselves" ("aught" is archaic). "The ruling faculty" → "the ruling part"
  (glossary).
- **IX.16** — "The rational social animal" → "the rational social being"
  (glossary).
- **IX.17** — Cross-reference "(viii. 20)" dropped.
- **IX.18** — "Men's leading principles" → "men's ruling parts" (glossary:
  "leading principle" is Long's fifth variant for *to hēgemonikon*, added to the
  row in Book V).
- **IX.19** — "Continuous mutation" → "continuous change" (glossary). "In a
  manner in continuous destruction" → "in a way in continuous destruction". The
  resulting "changing … change" is Long's own repetition and is kept.
- **IX.20** — Cross-reference "(vii. 29; ix. 38)" dropped. This is the book's
  lowest word ratio (0.79) and the whole of the difference is that dropped
  reference in a nineteen-word meditation.
- **IX.21** — "Cessation from movement and opinion" → "cessation from impulse
  and opinion": the glossary's *hormē* sense — the triad is activity, impulse
  and opinion, the three things that cease — as at VIII.7 and VIII.41.
- **IX.22** — "[To examine]" folded: "Hasten to examine your own ruling part" —
  **referent**: it supplies the verb the whole meditation turns on, and without
  it "Hasten your own ruling part" is not a sentence. Standard Ebooks runs the
  words as plain text. "The ruling faculty" → "the ruling part" ×3 (glossary).
  "That thou mayst also consider" → "that you may also consider" (Long's
  parallel "that … that … that" is kept, with the third "that" supplied in the
  candidate only where his own ellipsis would otherwise read as a new clause).
- **IX.23** — "This tears asunder thy life" → "this tears your life apart", as
  at IX.9.
- **IX.24** — "[Such is everything]" folded: "poor spirits carrying about dead
  bodies—such is everything" — it completes Long's sentence, which otherwise has
  a list and no predicate; Standard Ebooks runs the words as plain text.
  "What is exhibited in the representation" → "what is shown in the
  representation". "The mansions of the dead" → "the dwellings of the dead":
  "mansions" in the sense of *dwellings* is the King James sense and a modern
  reader hears large houses, which inverts the image.
- **IX.25** — "A thing of this peculiar form" → "a thing of this particular
  form", the rendering fixed at Book VIII acceptance for Long's attributive
  "peculiar" (VIII.12, on the V.3 and VI.3 precedents), with the fixed
  collocation "peculiar to X" untouched wherever it occurs.
- **IX.26** — One dagger mark (see unresolved source issues). "[Of this]"
  folded: "But enough of this." — it completes Long's elliptical "But enough",
  and the fold falls inside the dagger-marked sentence, where the VI.50 practice
  (confirmed at VII.16 and VIII.51) is that the clause stands as Long has it
  with pronouns modernised and glossary renderings applied; folding his own
  bracketed completion is not a smoothing of his words. Standard Ebooks runs the
  words as plain text. "Thy ruling faculty" → "your ruling part" (glossary).
- **IX.27** — One dagger mark, at the very end of the paragraph (see unresolved
  source issues). Otherwise Long with the pronouns modernised.
- **IX.28** — Cross-references "(vi. 44; vii. 75)" and "(xii. 21)" dropped.
  "Do not thou also be governed by it" → "do not let yourself also be governed
  by it": Long's emphatic "thou" inside an imperative has no modern form
  ("do not you also be governed" is not English), and the reflexive carries the
  same emphasis without adding an idea. **Considered again at acceptance
  (finding 28.1, declined).** The reviewer proposes "do not be governed by it
  **yourself**", on the ground that "let yourself" adds a faint note of
  permission Long's plain passive does not have. The objection is fair, but the
  repair drops Long's **"also"**, which is the hinge of the sentence: chance
  rules the universe, and the meditation is that it need not rule *you as
  well*. Trading a faint shade for a load-bearing word is the worse exchange —
  and the shade is not wrong here, since what Marcus asserts is precisely that
  the ruling part stays his, so that being governed by chance is something a
  man permits. Every wording that keeps both the plain passive and "also" is
  worse English than either version ("do not also be governed by it" splits the
  verb; "do not be governed by it also" attaches "also" to "it"; "do not be
  governed by it yourself as well" adds two words for one emphatic pronoun). "Everything else comes by way of
  sequence in a manner" → "…by way of sequence, in a way" (glossary), with the
  comma added so the hedge attaches where Long's does.
- **IX.29** — "All drivellers." → "All of them drivel." Long's noun is not
  current; the verb "drivel" is, and it keeps the sentence at three words and
  keeps the dismissal a dismissal. **Considered again at acceptance (finding
  29.1, declined).** The reviewer's diagnosis is accepted — Long's fragment is
  a nominal *verdict* thrown at the men just described, and the candidate
  reports what they do instead — and the reviewer's confidence is low, the
  point being one of ear. Both repairs offered cost more than the shape is
  worth. "Drivellers, all of them." restores the very noun this sheet ruled out
  as no longer current. "Drivel, all of it." keeps a nominal fragment with the
  modern word but **moves the referent** from the people to their talk: Long's
  verdict is on the men "playing the philosopher", not on what they say, and
  the next sentence turns from those men to Marcus himself. The candidate keeps
  Long's referent, his three words and his contempt, and pays only in
  grammatical shape, the smallest of the three losses available. "Draw me not aside to insolence and pride" →
  "Do not draw me aside to insolence and pride" (Long's inversion is archaic;
  the imperative is unchanged). "**They themselves shall judge**" is **kept**:
  this is the emphatic or volitional "shall", which is current English and which
  the Book VIII "shall" rule licenses — "let them judge for themselves" is what
  Long's sentence says, and "will judge" would turn a challenge into a
  prediction. "Playing the philosopher", "tragedy heroes" and "Plato's Republic"
  kept as Long has them. On PG's "insolence" against Standard Ebooks'
  "indolence", see unresolved source issues.
- **IX.30** — "Their countless solemnities" → "their countless ceremonies":
  Long's noun means a ceremony, and the modern noun means seriousness. "The
  infinitely varied voyagings" → "the infinitely varied voyages" (the current
  form of Long's own noun). "Neither a posthumous name" → "neither a name after
  death" (glossary).
- **IX.31** — "Freedom from perturbations" → "freedom from disturbances"
  (glossary). "Let there be movement and action terminating in this, in social
  acts" → "let there be impulse and action terminating in this, in social acts":
  the *hormē* sense again — the pair is impulse and act — as at IX.21.
- **IX.32** — "Every several thing" → "every single thing" ("several" in the
  sense of *separate, respective* is archaic here). "The illimitable time before
  birth" → "the limitless time before birth"; Long pairs it with his own
  "boundless" in the same clause, which is kept, so the pair survives with one
  current word in place of one obsolete one. Long's exclamation mark kept
  (Standard Ebooks has a full stop).
- **IX.33** — "He who dies at the extremest old age" → "he who dies in extreme
  old age" (Long's superlative form is not current).
- **IX.34** — "Men's leading principles" → "men's ruling parts" (glossary).
  **"Their pool souls" → "their poor souls"**: a base-text slip in PG, and the
  one place in Book IX where the candidate does not follow PG's letters —
  flagged for the reviewer, and see unresolved source issues.
- **IX.35** — Cross-reference "(iv. 45, vii. 18)" dropped. "What, then, dost
  thou say,—that all things have been…" → "What, then, do you say—that all
  things have been…", keeping Long's dash and his single question.
- **IX.36** — "The callosities of the earth" → "the calluses of the earth":
  "callosity" is not current English, "callus" is, and the image — marble as the
  earth's hardened growths — is unchanged. Long's word occurs nowhere else in
  the twelve books.
- **IX.37** — "Apish tricks" **kept**: the adjective is current, the phrase is
  transparent, and it is one of the book's two contemptuous images. "Why art
  thou disturbed?" → "Why are you disturbed?".
- **IX.39** — "Say to the ruling faculty" → "say to the ruling part"
  (glossary). "Art thou become a beast" → "have you become a beast". The five
  questions addressed to the ruling part keep their asyndeton, as Long has it.
- **IX.40** — "Do thou pray thus" / "Pray thou" / "Thou thus" → **"You, pray
  thus" / "You, pray" / "You thus"** in v2, correcting v1's "Do you pray thus"
  / "You pray thus" / "You thus" (finding 40.1, the book's one **substantive**
  finding). Long's alternation between the man who prays and Marcus is what the
  passage is built on, and v1 kept all three turns and their shortening but
  lost the **mood** of two of them: in modern English "Do you pray thus:" is a
  yes/no question, and "You pray thus:" is a declarative saying the reader
  already prays that way — the reverse of Marcus's point. The vocative comma
  makes all three unambiguously imperative, keeps Long's fronted second person
  (the rhetorical device itself), keeps the three-two-two diminuendo against
  his four-two-two, and adds no word. "Do pray thus:" was weighed and rejected
  because it drops the fronted pronoun; the comma alone in both first turns was
  weighed and rejected because it flattens the diminuendo. "In fine" → "In short". The six prayers keep
  Long's "How shall I…" — first-person deliberative questions, which the "shall"
  rule licenses and which are current English. On Standard Ebooks' reading of
  the fourth turn, see unresolved source issues.
- **IX.41** — "Shall be free from perturbations" → "shall be free from
  disturbances" (glossary): the "shall" is **kept** here, because it is an
  indirect deliberative question inside Epicurus's reported speech ("keeping to
  this main point, how the mind … shall be free"), the same construction as
  IX.40's direct "How shall I…", and the rule licenses it. "Such movements as go
  on in the poor flesh" keeps "movements": Long means motions in the body, not
  *hormē*. "Trifling talks" kept as PG has it (Standard Ebooks has the
  singular).
- **IX.42** — "In the case of the knave" → "in the case of the rogue"
  ("knave" is archaic; "rogue" is the current word for the same man, and Long's
  three-term list — the rogue, the faithless man, every man who does wrong —
  keeps its shape). "Wherein hast thou been injured?" → "In what have you been
  injured?". "Manifestly thy own" → "plainly your own". "Thou didst not confer
  it absolutely" → "you did not confer it unconditionally", **following the
  Book VIII ruling at VIII.41**: Long's "absolutely" in this technical sense
  means *without reservation*, which is the whole point of the sentence that
  follows (the man who wants to be paid for a kindness conferred it with a
  reserve clause). Long's ordinary intensifying "absolutely" at III.1 is a
  different sense and was rightly kept there. "Their several constitutions" →
  "their respective constitutions" (as "every several thing" at IX.32). "Acts of
  benevolence" → "acts of kindness" and "anything benevolent" → "anything kind"
  (glossary). "Conducive to the common interest" → "conducive to the common
  good" (glossary). "Conformable to thy nature" → "according to your nature" and
  "conformably to his constitution" → "according to his constitution"
  (glossary). "Recompense" **kept**: current, and the eye demanding payment for
  seeing is Long's image.

## Apparatus dropped or folded

Cross-references dropped (`../GLOSSARY.md`, Voice and form) — **six spans in
five paragraphs**:

- IX.1 "(vii. 75)".
- IX.17 "(viii. 20)".
- IX.20 "(vii. 29; ix. 38)".
- IX.28 "(vi. 44; vii. 75)" and "(xii. 21)".
- IX.35 "(iv. 45, vii. 18)".

No verse citation appears in Book IX: the book contains no verse.

Alternative renderings and labels (D11) — **none**. Book IX contains no
bracketed alternative rendering: not one of its four brackets carries Long's
"or" joining two English words for one Greek word, which is the III.6 shape D11
was written for. **Zero D11 drops in this book**, and that is a fact about Long's
text here, not a relaxation of the rule.

Long's supplements folded into prose — **four brackets, four folds**. Each is
marked **referent** where it supplies a referent, object or verb the sentence
depends on, which is the class the VI.50 "[men]" ruling and the VII.2
"[thoughts]" ruling settled, and which is folded rather than dropped. Standard
Ebooks runs all four as plain text, which corroborates the classification:

- IX.9 "[this union]" — **referent**: the object of "avoid".
- IX.22 "[to examine]" — **referent**: the verb the meditation turns on;
  "Hasten your own ruling part" is not a sentence without it.
- IX.24 "[such is everything]" — completes Long's sentence, which otherwise has
  a list of images and no predicate.
- IX.26 "[of this]" — completes Long's elliptical "But enough", inside the
  dagger-marked sentence.

**Four brackets in all, four folded and none dropped.**

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Several Book IX
sentences are widely quoted in other renderings (IX.4 "He who does wrong does
wrong against himself", IX.6 the three present things, IX.13 "Today I have got
out of all trouble", IX.28 "if there is a god, all is well", IX.29 the winter
torrent and "no one has condemned me to imitate them", IX.40 the prayers, IX.42
"the eye demanded a recompense for seeing"); each was built from Long's
sentence, not from memory of the familiar version. Standard Ebooks' Long was
consulted for the state of the base text only, by a word-level diff, after the
draft was written; the single place where its reading was adopted is none, and
the one place where the candidate departs from PG's letters (IX.34 "poor") is
recorded as a base-text defect and flagged. Proper names are Long's spellings as
PG prints them (Alexander, Philippus, Demetrius of Phalerum, Epicurus, Plato).

## Unresolved source issues (Long's text)

- **Dagger marks — three, in three sections.** Long marks uncertain Greek
  (`../PROVENANCE.md` §4). Located in the PG text at lines 5525 (IX.6), 5661
  (IX.26) and 5669 (IX.27). The three clauses are named in
  `review-instructions.md` with those line numbers and stand as Long has them,
  with pronouns modernised and glossary renderings applied — the reading Book VI
  established at VI.50, the Book VII reviewer confirmed at VII.16, and the Book
  VIII reviewer enforced at VIII.51 by reverting a stylistic change inside a
  dagger clause. Reviewers should not expect the candidate to make them clearer
  than the source. Long's footnote at IX.27 says the words after
  *kat' epakolouthesin* are corrupt but the meaning is hardly doubtful.
- **IX.34, "pool souls".** PG line 5741 prints "Imagine that thou seest their
  pool souls laid bare"; Standard Ebooks' Long reads "poor souls", and Long
  himself has "approach their poor souls" in the same construction seven
  sections earlier (IX.27, PG line 5664). "Pool souls" is not a reading but a
  slip in the PG text. **Rendered "poor souls".** Recorded as a base-text defect
  and **flagged for the reviewer**, since it is the one place in Book IX where
  the candidate does not follow PG's letters — the VIII.37 "Fergamus" /
  "Pergamus" case in this book's form.
- **IX.35, PG right and Standard Ebooks wrong (twice).** PG reads "the world has
  been condemned to be **bound** in never ceasing evil"; Standard Ebooks has
  "condemned to be **found** in never ceasing evil", which says nothing and
  looks like an eye-skip from "no power has ever been found" in the clause
  before. PG is followed. Standard Ebooks also adds a word PG does not have —
  "from eternity have been **done** in like form" against PG's "have been in
  like form" — and PG is followed there too, under D6.
- **IX.40, PG right and Standard Ebooks wrong.** PG reads "Another prays thus:
  How shall I be released from this? **Pray thou:** How shall I not desire to be
  released?"; Standard Ebooks reads "**Another prays:**" in place of "Pray
  thou", which breaks the alternation the whole passage is built on — one man's
  prayer, then Marcus's, three times over. PG is followed. Recorded on the
  precedent of VIII.2 and VIII.44.
- **IX.29, an open variant: "insolence" or "indolence".** PG line 5705 prints
  "Draw me not aside to insolence and pride"; Standard Ebooks' Long reads
  "indolence and pride". Unlike IX.34 this is not a slip that can be settled by
  looking at the word — both are English words and both make a kind of sense
  after "Simple and modest is the work of philosophy". PG is the base text (D6)
  and is followed; the variant is recorded so a reader collating against
  Standard Ebooks finds it explained, and a reviewer who can weigh the Greek is
  invited to rule. Standard Ebooks also prints "Philip" for PG's "Philippus";
  PG's form is kept with the other proper names.
- **IX.28, a paragraph break that is not a section break.** Standard Ebooks
  prints IX.28 as two typographic paragraphs, breaking before "Soon will the
  earth cover us all", which is why an automatic count of its Book IX paragraphs
  returns 43. PG prints the section whole, and 42 is the standard section count
  for Book IX (`../PROVENANCE.md` §1). No text differs; nothing is missing on
  either side; the candidate keeps Long's section whole as the staged original
  has it.
- **Spelling convention.** The PG text is an American printing and the staged
  original follows it. Standard Ebooks differs at `honor`/`honour`,
  `labor`/`labour`, `neighbor`/`neighbour`, `gray`/`grey`,
  `judgment`/`judgement`, `such like`/`suchlike`, `co-operate`/`cooperate`,
  `to-day`/`to‑day`. PG governs (D6); the candidate uses current forms of the
  same spellings (`today`).

## Decisions flagged for the reviewer — all three SETTLED at round 1

None is left open. The round-1 reviewer endorsed every base-text call in the
book and confirmed the "shall".

1. **IX.34 "poor souls" for PG's "pool souls" — upheld without reservation.**
   "Pool souls" is not English; Long writes "approach their **poor** souls" in
   the same construction seven sections earlier (IX.27, PG line 5664), and the
   reviewer confirmed by grep that those are the **only** two occurrences of
   the phrase in the whole PG file, so the internal witness is exact rather
   than approximate; Standard Ebooks agrees. Same shape as VIII.37's
   Fergamus/Pergamus and the same answer. It stays the one departure from PG's
   letters in Book IX.
2. **IX.29 "insolence" — CLOSED in favour of PG, on grounds stronger than D6.**
   The draft followed PG under D6 and recorded the variant as genuinely open;
   the reviewer closes it on the sense, and the reasoning is adopted in full.
   The meditation's whole subject is the temptation to grandiosity — the
   worthless people "playing the philosopher", the refusal to "expect Plato's
   Republic", being "content if the smallest thing goes on well", the warning
   not to act "like tragedy heroes" — and the final clause answers "Simple and
   modest is the work of philosophy", whose opposite is *showy and proud*, not
   *lazy and proud*. **Indolence has no antecedent anywhere in the meditation**
   and would introduce a vice Marcus has not been discussing; insolence is the
   vice he has spent the paragraph naming and pairs naturally with pride. And
   "indolence"/"insolence" is a one-letter confusion of the kind a re-keyed
   text produces, which SE's Long is. **Recorded as settled, not open.**
   *Limitation kept on the record, in the reviewer's words:* the reviewer did
   not consult a Greek text and makes no claim about the Greek word behind it;
   a reviewer with the Greek could overturn the ruling. On the English evidence
   it is not open.
3. **IX.29 "They themselves shall judge" — confirmed and kept.** The emphatic
   or volitional "shall", licensed by the Book VIII rule. The reviewer would
   resist "will" firmly: Marcus is not forecasting a verdict on Alexander,
   Philippus and Demetrius but dismissing the question of their merits as none
   of his business, and the next sentence — "But if they acted like tragedy
   heroes, no one has condemned me to imitate them" — is a rebuttal of a claim
   on him, not the second half of a prediction.

Two further things the reviewer settled, recorded here so they are not reopened:
**the step-1 no-rebuild finding was upheld by the stronger method** (an
independently written reconstruction of PG lines 5419–5864 diffed word for word
against the staged Book IX, whose only three differences in the whole book are
the three documented dagger marks — not a re-run of the build, which proves only
that the file matches the script); and **the "shall" rule was widened in
`../GLOSSARY.md` at acceptance** (finding 41.1) from "a direct question" to "a
question, direct or indirect", so that IX.41's indirect deliberative question
inside Epicurus's reported speech is licensed by the rule's letter as well as
its spirit. The IX.41 rendering itself did not change.
