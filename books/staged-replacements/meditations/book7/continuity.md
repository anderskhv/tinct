# Continuity sheet — Meditations, Book VII (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV, V
and VI were accepted, and describing what the frozen draft actually did. Term
renderings follow `../GLOSSARY.md` (one row added and two rows extended for
Book VII **before** drafting, see below); the pattern for applying review
findings follows the six earlier `ACCEPTANCE.md` files (decisions D8, D10, D11
and D12 in the ledger).

## Source

- `../meditations-original-en.staged.json`, chapter `number: 7`, title `Book 7`,
  75 paragraphs, one per numbered meditation (VII.1–VII.75). Extracted verbatim
  into `source-book7.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- **The staged file was rebuilt at Book VII step 1** (sha256 `b0ecf3da…` →
  `7798607d…`, D12). Three of Long's footnotes are printed flush left in the PG
  text — "See Aristophanes, Acharnenses, v. 661." and "From the Apologia,
  c. 16." twice, PG lines 4600, 4602, 4604 — and the build's footnote filter
  tested for an *indented* `[A]` opener, so it missed them and appended all
  three to VII.45 as if they were Long's translation. The filter now matches
  unindented openers too. VII.45 is the only paragraph in the whole file that
  changed; the count is still 487; chapters 1–6 are byte-identical, so Books
  I–VI's sources and acceptances stand. This is recorded in `../PROVENANCE.md`
  §4, in the ledger, and in each of Books I–VI's `provenance.json`. **Book VII
  is the first book drafted against the twice-rebuilt file**, and VII.45 is the
  paragraph the rebuild fixed — reviewers should check that paragraph against
  the new source, not against any earlier copy.
- No `[Illustration` survives anywhere in the file (re-verified at step 1); the
  other 124 footnotes in the body were already being stripped correctly.
- Book VII was read in full before any paragraph was drafted: 75 meditations,
  4,357 words, the longest VII.55 (217 words, the three things in man's
  constitution) and VII.68 (202 words, the mind unhindered among wild beasts),
  the shortest VII.39 (9 words, a line of verse). Its threads: nothing new, and
  forty years seen is ten thousand seen (VII.1, VII.21, VII.49); principles
  kept alive by fanning the thoughts that answer to them (VII.2); the show, the
  bone thrown to little dogs, the puppets pulled by strings (VII.3, VII.29);
  limb and part, *melos* and *meros* (VII.13); the emerald that keeps its color
  (VII.15); the ruling part that cannot be disturbed except by itself (VII.16,
  VII.28, VII.33, VII.68); change as the universe's whole business (VII.18,
  VII.19, VII.23, VII.25, VII.32); loving and pardoning the wrongdoer (VII.22,
  VII.26, VII.63, VII.65, VII.70, VII.71); the long quotation cluster, Long's
  own commonplace book — Plato, Antisthenes, and the verse and Apology extracts
  (VII.35–VII.51); the wrestler's art, not the dancer's (VII.61); Socrates
  weighed against Telauges (VII.66); "Look within" and the fountain that
  bubbles up if you dig (VII.59).
- Cross-checked for Book VII against Standard Ebooks' Long (the same edition
  `../PROVENANCE.md` §3 names) at the points where the PG text looked doubtful;
  the results are recorded under the paragraph concerned and under unresolved
  source issues. No wording was taken from Standard Ebooks; the check was for
  the state of the base text only.

## Glossary rows added or extended for Book VII, before drafting

| Row | Change | Why |
|---|---|---|
| imagination → **imagination** | **added** | Long's second English word for *phantasia*, beside "impressions". Books II and III already rendered it "imagination" (II.12, III.1); Book VII has three more (VII.17, VII.29, VII.64) and VIII.29 and IX.7 follow. Merging it into "impressions" would erase a distinction Long keeps, and "imagination" is current English. Promoted to a row in its third book, on the Book VI precedent for "beneficence". |
| the formal / the material / **the causal** → form / matter / **cause** | **extended** | Long pairs "the material" with "the causal" as well as with "the formal" (VII.10, VII.29, VIII.11), giving the other word in brackets each time. The bracketed word is a second rendering and is dropped under D11; Long's primary word is rendered. |
| vexed / vexation → resent / resentment | **extended** | Long's reflexive "to vex ourselves at things" (VII.38) is his "be vexed at" in another shape, not the transitive "vex" the row excludes, so it takes "resent" with the rest. VII.58, VII.66, VII.70 have the plain "be vexed". |

No other row was needed: every other recurring term in Book VII was already
fixed by Books I–VI.

## Glossary terms met in Book VII, and how they were rendered

| Long (Book VII) | Candidate | Where |
|---|---|---|
| the ruling faculty; the leading principle; the ruling principle(s) | the ruling part(s) | VII.16 (twice), VII.22, VII.33, VII.55, VII.62 |
| the rational principle which rules | the rational part which rules | VII.28 — Long's own adjective kept; only "principle" takes the row's "part" |
| the rational and political faculty | the rational and political faculty | VII.72 — not Long's *ruling* faculty, and "faculty" is current; kept |
| the universal nature | the universal nature | VII.5, VII.18 (twice), VII.23, VII.55 |
| the nature of the All | the nature of the whole | VII.75 — the row's rendering of Long's "the All" (as IV.27) |
| out of the universal (noun) | out of the whole | VII.66 — the bare noun, as the row was extended in Book VI at VI.45 |
| the whole; the universe | the whole; the universe | VII.9, VII.10, VII.19, VII.25, VII.75 |
| nature; according to nature; unnatural; contrary to reason | nature; according to nature; against nature; against reason | VII.11, VII.24, VII.53, VII.55, VII.56, VII.58, VII.74 — "altogether unnatural" (VII.24) joins the "contrary to nature" family as "altogether against nature" |
| conformably to the reason | according to the reason | VII.53 |
| reason | reason | VII.8, VII.9, VII.10, VII.11, VII.24, VII.53 |
| rational animal; rational beings; intelligent animals; animals of the same stock | rational being; rational beings; intelligent beings; beings of the same stock | VII.9, VII.11, VII.13, VII.55 — the row's principle (Long's "animal" is a living creature) applied to his "intelligent animals" and bare "animals" at VII.9 |
| social | social | VII.5, VII.52, VII.55, VII.64, VII.67 |
| the god within (Long: "a good daemon") | a good god within | VII.17 — see the paragraph note |
| the Deity | the divine | VII.46 |
| God; the gods; god | God; the gods; one god | VII.9, VII.31, VII.39, VII.41, VII.53, VII.66, VII.67, VII.68 — Long's capitals kept where he has them ("Follow God", "obedient to God", "to man or God"), lowercase where he has that ("one god who pervades all things") |
| the common good; for the general good | the common good | VII.5 |
| opinion | opinion | VII.2, VII.16, VII.26, VII.33, VII.62, VII.68 |
| impressions | impressions | VII.2 |
| imagination | imagination | VII.17, VII.29, VII.64 — row added before drafting |
| principles | principles | VII.2 |
| indifference towards the things which lie between virtue and vice | indifference towards the things which lie between virtue and vice | VII.31 |
| movement (in the sense of impulse) | impulse | VII.4 |
| motion (of the intelligence, of the senses, of the appetites); movement (of the ruling power) | motion; movement | VII.55, VII.60, VII.75 — Long's own word in each place; see the paragraph note on VII.55 |
| intelligence; understanding; mind | intelligence; understanding; mind | VII.5, VII.30, VII.33, VII.55, VII.60, VII.64, VII.66, VII.67, VII.68 — Long's three words kept apart |
| soul | soul | VII.16, VII.63, VII.66 |
| the formal; the causal; the material | form; cause; matter | VII.10, VII.29 — row extended before drafting |
| affects (of the miserable flesh) | feelings | VII.2, VII.66 |
| perturbation; free from perturbation | disturbance; free from disturbance | VII.16 |
| tranquillity; tranquil | calm; calmer | VII.28, VII.33, VII.68 (twice), VII.75 |
| vexed; vex ourselves at | resent; resentful | VII.38, VII.58, VII.66, VII.70 — row extended before drafting |
| discontented | discontented | VII.64 |
| kinsmen | kinsmen | VII.22 |
| beneficence; benevolence | kindness | VII.13, VII.63 — the row added in Book VI |
| the elements | the elements | VII.47, VII.50 |
| fame | fame | VII.6, VII.34 |
| the present | the present | VII.29 |
| happiness; a happy life | happiness; a happy life | VII.17, VII.67 |
| a man; men (generic) | a man; men | throughout; Long's generic "man" kept |

## Paragraph-level decisions

Only departures from a word-for-word modernisation of Long are listed. Where a
paragraph is not listed, the candidate is Long's sentence with "thou/thee/thy"
changed to "you/your", his verb forms made current ("dost" → "do", "wilt" →
"will", "canst" → "can", "hast" → "have"), and nothing else.

- **VII.1** — "It is that which thou hast often seen" → "It is what you have
  often seen" (twice); "on the occasion of everything which happens" → "when
  anything happens".
- **VII.2** — "The impressions [thoughts]" → "the impressions—the thoughts—":
  Long's bracket is **folded as an apposition**, not dropped, because his very
  next sentence says "fan these thoughts into a flame" and the demonstrative
  needs its antecedent. This is the class VI.50 "[men]" settled at Book VI
  acceptance (finding 50.1): a bracket that supplies a referent the following
  text depends on is a supplement, not a D11 alternative rendering. Folded on
  the V.8 "It, necessity or destiny" / VI.43 apposition precedent. **Flagged
  for the reviewer** — it can be argued a D11 drop, since "thoughts" is also a
  second rendering of *phantasiai*. "That opinion about anything which I ought
  to have" → "the opinion about anything that I ought to have"; "external to my
  mind" → "outside my mind"; "thou standest erect" → "you stand upright" (as
  VII.12); "affects" → "feelings" (glossary).
- **VII.3** — "[All alike]" folded as the bare close of Long's list: "puppets
  pulled by strings—all alike." "A bone cast to little dogs" → "a bone thrown
  to little dogs"; "laborings of ants and burden-carrying" → "the labors of
  ants and their carrying of burdens"; "runnings about" kept, it is Long's.
- **VII.4** — "In discourse" → "In conversation" (Long's "discourse" is speech
  between people; "in speech you must attend to what is said" would be
  circular). "In every movement thou must observe what is doing" → "in every
  impulse you must observe what is being done" (glossary: Long's "movement" in
  the sense of impulse). "To what end it refers" kept.
- **VII.5** — "I retire from the work" → "I withdraw from the work"; "my ruling
  principle" → "my ruling part" (glossary); "the general good" → "the common
  good" (glossary). Base-text defect: PG prints "what-soever" with a hyphen
  left over from a line break; rendered "whatever". See unresolved source
  issues.
- **VII.6** — "How many who have celebrated the fame of others" → "how many who
  celebrated the fame of others" (Long's perfect is not needed beside "have
  long been dead").
- **VII.7** — "Mount up on the battlements" → "climb the battlements".
- **VII.9** — "Implicated with one another" → "bound up with one another", the
  rendering Book VI fixed for Long's "implicated" at VI.38. "The same universe
  [order]" — "[order]" is a second rendering of "universe" (*kosmos*) and is
  dropped under D11. "[One] common reason" folded: "one common reason".
  "Intelligent animals" → "intelligent beings" and "all animals which are of
  the same stock" → "all beings which are of the same stock", applying the
  rational-being row's principle (Long's "animal" means living creature) to his
  two other "animal" phrases in this paragraph. "Participate in the reason" →
  "share in the reason".
- **VII.10** — "Everything formal [causal]" → "everything that is form" and
  "everything material" → "everything that is matter" (glossary row extended
  before drafting); "[causal]" is Long's second rendering and is dropped under
  D11. "Overwhelmed in time" kept — it is current and it is his.
- **VII.12** — "Be thou erect, or be made erect" → "Stand upright, or be made
  upright"; cross-reference "(iii. 5)" dropped. This is the book's one
  word-ratio outlier (0.70); the whole difference is the dropped reference and
  Long's "be thou".
- **VII.13** — "The members in those bodies which are united in one" → "the
  limbs in those bodies…", so that Long's later "I am a member" keeps its
  force; "members" of a body is rendered "limbs" again at VII.68. Long's Greek
  is **kept**: "I am a member (melos)… you are a part (meros)". The meditation
  is a pun on two Greek words that differ by one letter and cannot be carried
  in English without them; PG's "[Greek: melos]" is rendered "(melos)" as the
  staged file has it. "[Using the letter r]" folded in Long's own words: "But
  if, using the letter r, you say that you are a part (meros)". "More apparent
  to thee" → "clearer to you"; "beneficence" → "kindness" (glossary).
  **Flagged for the reviewer**: keeping the transliterated Greek is a departure
  from the glossary's note that the candidate never uses Greek — that note
  governs the glossary's own Greek column, not Long's in-text words, but the
  case is worth a ruling.
- **VII.14** — "Let there fall externally what will" → "Let there fall from
  outside what will".
- **VII.15** — Long's full stop before the repeated sentence becomes a colon:
  "as if the gold, or the emerald, or the purple were always saying this:
  Whatever anyone does or says, I must be emerald and keep my color." The colon
  marks what the gold is saying; Long's period leaves the second sentence
  looking like Marcus's own, which is not the point of the image.
- **VII.16** — Two dagger marks (see unresolved source issues). "The ruling
  faculty" → "the ruling part" and "The leading principle" → "The ruling part"
  (glossary; Long uses two phrases for one thing inside one meditation); "For
  the faculty itself" → "For the part itself"; "free from perturbation" → "free
  from disturbance" (glossary). The two dagger-marked clauses are otherwise
  verbatim: "does not frighten itself or cause itself pain" and "for it will
  never deviate into such a judgment". Glossary renderings were applied inside
  them: the daggers mark uncertain **Greek**, which is a question about what
  Long was translating, not about how his English is carried over — the same
  reading Book VI's VI.50 took when it modernised that clause's pronouns.
  **Flagged for the reviewer.**
- **VII.17** — "Eudaemonia [happiness] is a good daemon" → "Eudaemonia,
  happiness, is a good god within": the bracket is folded as an apposition, and
  "a good daemon" takes the glossary's "the god within" for *daimōn*, which is
  what makes Marcus's etymology (*eu-daimonia*, having a good *daimōn*) legible
  at all. Long's transliterated "Eudaemonia" is kept for the same reason the
  Greek is kept at VII.13. "O imagination" → "imagination" (the vocative "O" is
  Victorian; the address survives without it); "I entreat thee" → "I beg you";
  "according to thy old fashion" → "according to your old habit". **Flagged for
  the reviewer** as the hardest paragraph in the book.
- **VII.19** — Cross-reference "(v. 23; vi. 15)" dropped.
- **VII.20** — "Troubles me, lest I should do something" → "troubles me: that I
  should do something" (Long's "lest" after "troubles" is not current).
- **VII.22** — "The wrong-doer" → "the wrongdoer" (as VI.6); "thy ruling
  faculty" → "your ruling part" (glossary).
- **VII.23** — "Moulds" → "molds" (American spelling, following the base text);
  "subsists for a very short time" → "lasts for a very short time";
  cross-reference "(viii. 50)" dropped.
- **VII.24** — "Altogether unnatural" → "altogether against nature" and
  "contrary to reason" → "against reason" (glossary). "All comeliness dies
  away" → "all grace dies away" ("comeliness" is dated; "grace" is the plain
  word for the same thing and imposes nothing). "Cannot be again lighted up" →
  "cannot be lighted up again".
- **VII.25** — "Nature which governs the whole" → "The nature which governs the
  whole"; cross-reference "(xii. 23)" dropped.
- **VII.26** — "Immediately consider" → "consider at once".
- **VII.28** — "The rational principle which rules" → "The rational part which
  rules" (glossary's "part" for "principle"; Long's "rational" kept);
  "tranquillity" → "calm" (glossary).
- **VII.29** — "The causal [formal] and the material" → "cause and matter"
  (glossary row extended before drafting); "[formal]" dropped under D11.
  Cross-reference "(viii. 29)" dropped.
- **VII.30** — "The things that are doing" → "the things that are being done";
  cross-reference "(vii. 4)" dropped.
- **VII.31** — Two dagger marks (see unresolved source issues). Both clauses
  verbatim: "The poet says that law rules all—" and "And it is enough to
  remember that law rules all." Long's capital in "Follow God" kept, per the
  glossary row's "as Long has them".
- **VII.33** — "Tranquillity" → "calm" and "the ruling faculty" → "the ruling
  part" (glossary).
- **VII.34** — "[Of those who seek fame]" folded in Long's own words: "look at
  the minds of those who seek fame". "Hide the former sands" → "hide the sands
  before them" ("former" here means earlier in the heap, which a reader now
  takes as "previous, no longer existing").
- **VII.35** — "Dost thou suppose it possible for him" → "do you suppose it
  possible for him"; nothing else. The dashes marking the dialogue are Long's
  and are kept.
- **VII.37** — "A base thing" → "a shameful thing" and "the countenance" → "the
  face". Long's "base" in its moral sense is now chiefly a literary word; the
  same decision is taken at VII.45 ("baseness" → "disgrace"). These are the
  only two places in the whole work where Long uses it, so this is recorded
  here rather than as a glossary row.
- **VII.38** — "It is not right to vex ourselves at things" → "It is not right
  to resent things" (glossary row extended before drafting); "For they care
  nought about it" → "For they care nothing about it". Long's line breaks in
  the verse are not preserved (the staged original joins them, `../PROVENANCE.md`
  §4); the capital at "For" is Long's and is kept, here and at VII.40, VII.41,
  VII.50, VII.51.
- **VII.41** — "If gods care not for me and my children" → "If the gods do not
  care for me and my children".
- **VII.44** — "Thou sayest not well" → "You do not speak well"; "the works of a
  good or bad man" → "the works of a good or a bad man".
- **VII.45** — "[Of deserting his post]" folded: "before the disgrace of
  deserting his post" ("baseness" → "disgrace", as VII.37). **This is the
  paragraph the step-1 rebuild fixed**: three of Long's footnotes had been
  appended to it in the previous staged file and are now gone; the candidate is
  drafted from the corrected source and ends at "deserting his post."
- **VII.46** — Two dagger marks (see unresolved source issues); both clauses
  stand as Long has them, including his unusual dash and colon ("consider if
  this is not—a thing to be dismissed from the thoughts:"). "Intrust" →
  "entrust"; "the Deity" → "the divine" (glossary).
- **VII.47** — "The terrene life" → "the earthly life", the rendering Book VI
  fixed for Long's "terrene" at VI.30.
- **VII.48** — "He who is discoursing about men" → "he who is talking about
  men"; "noise of the courts of justice" → "the noise of the courts of
  justice".
- **VII.49** — "Such great changes of political supremacies" → "such great
  changes of political power" ("supremacies" as a countable plural is not
  current). Long's dash after "Consider the past" is kept.
- **VII.50** — "The mutual involution of the atoms" → "the mutual entanglement
  of the atoms", the rendering Book VI fixed for Long's "involution" at VI.10.
  "The unsentient elements" → "the elements that have no sensation": "unsentient"
  is not current, "insentient" is formal and rare, and "unfeeling" now means
  callous, which is the wrong sense. This is the one place in Book VII where the
  candidate uses more words than Long for a single term rather than fewer.
  **Flagged for the reviewer.**
- **VII.51** — "To 'scape from death" → "to escape from death".
- **VII.52** — "More expert in casting his opponent" → "more expert at throwing
  his opponent" (Long's wrestling sense of "cast" is now opaque; "throw" is the
  wrestling word in current English and is what VII.61's wrestler does).
- **VII.53** — "Conformably to the reason" → "according to the reason"
  (glossary).
- **VII.54** — "Piously to acquiesce in thy present condition" → "piously to
  accept your present condition" ("acquiesce in" is stiff and now carries a
  note of reluctant consent that Long's "piously" contradicts).
- **VII.55** — "Other men's ruling principles" → "other men's ruling parts" and
  "the ruling principle" → "the ruling part" (glossary). Long's "motion" is
  **kept** as "motion" throughout this paragraph ("the rational and intelligent
  motion", "the motion of the senses or of the appetites"): it is his own word,
  it is not the "movement in the sense of impulse" the glossary row converts,
  and it is current English. "For both are animal" is **kept as Long has it**:
  he is using "animal" as an adjective against "intelligent", and every way of
  unpacking it ("belong to the animal part", "are animal movements") adds a
  noun he does not have, which the no-expansion rule forbids. **Flagged for the
  reviewer.**
- **VII.58** — "How they were vexed" → "how they resented them" (glossary).
  "[To work on]" folded: "they will be a material for you to work on". Long's
  text breaks off at "and remember…"; the ellipsis is kept, on the V.29
  precedent. See unresolved source issues.
- **VII.61** — "In respect of this, that" → "in this respect, that".
- **VII.62** — "Approbation" → "approval" (twice), as VI.13; "what ruling
  principles they possess" → "what ruling parts they possess" (glossary).
- **VII.63** — "Benevolence" → "kindness" (glossary row added in Book VI).
- **VII.64** — "Let this remark of Epicurus aid thee" → "let this remark of
  Epicurus help you"; "the being scorched by heat, and the having no appetite"
  → "being scorched by heat, and having no appetite" (Long's articled gerunds
  are not current); "in imagination" kept (glossary row added before drafting).
- **VII.66** — "How do we know if Telauges was not superior" → "How do we know
  that Telauges was not superior"; "skilfully" → "skillfully" (American
  spelling, following the base text); "when he was bid to arrest Leon" → "when
  he was ordered to arrest Leon"; "idly vexed" → "idly resentful" (glossary);
  "out of the universal" → "out of the whole" (glossary row extended in Book
  VI); "the affects of the miserable flesh" → "the feelings of the miserable
  flesh" (glossary).
- **VII.67** — One dagger mark (see unresolved source issues). "[The
  intelligence]" folded: "Nature has not so mingled the intelligence with the
  composition of the body"; the dagger sits immediately before the bracket, so
  the clause is otherwise verbatim. Long's capital in "obedient to God" kept.
- **VII.68** — "Tranquillity" → "calm" (twice, glossary); "the members of this
  kneaded matter" → "the limbs of this kneaded matter" (as VII.13). "This thou
  art in substance [reality]" → "This you are in substance": "[reality]" is a
  second rendering of "substance" and is dropped under D11. Long's capitals in
  "to man or God" and "either to God or man" kept.
- **VII.69** — "Nor torpid" → "nor sluggish".
- **VII.70** — "Are not vexed because during so long a time" → "do not resent
  that during so long a time" (glossary). Long's "art thou wearied of enduring
  the bad, and this too when thou art one of them?" → "are you wearied of
  enduring the bad—and this too when you are one of them?"; the dash carries
  Long's turn onto Marcus himself.
- **VII.71** — "To fly from his own badness" → "to flee from his own badness"
  (twice); Long's "fly" in this sense now reads as the other verb.
- **VII.72** — "The rational and political [social] faculty" → "the rational and
  political faculty"; "[social]" is a second rendering of "political" and is
  dropped under D11. "Faculty" kept — this is not Long's *ruling* faculty and
  the word is current.
- **VII.74** — "Do not then be tired" → "Do not, then, be tired".
- **VII.75** — "The nature of the All" → "The nature of the whole" (glossary).
  "Comes by way of consequence or [continuity]" → "comes by way of consequence";
  "[continuity]" is a second rendering of "consequence" and is dropped under
  D11. "It will make thee more tranquil" → "it will make you calmer"
  (glossary). Cross-reference "(vi. 44; ix. 28)" dropped.

## Apparatus dropped (each listed, per the glossary's rule)

Cross-references (Long's parenthetical section references, D5):

- VII.12 "(iii. 5)".
- VII.19 "(v. 23; vi. 15)".
- VII.23 "(viii. 50)".
- VII.25 "(xii. 23)".
- VII.29 "(viii. 29)".
- VII.30 "(vii. 4)".
- VII.75 "(vi. 44; ix. 28)".

Seven in all. No verse citation survives in Book VII's source: the three that
had been appended to VII.45 were Long's **footnotes**, and the step-1 rebuild
removed them from the staged original itself, so nothing had to be dropped at
the candidate stage.

Alternative renderings and labels (D11) — six brackets, six drops:

- VII.9 "[order]" — second rendering of "universe" (*kosmos*).
- VII.10 "[causal]" — second rendering of "formal".
- VII.29 "[formal]" — second rendering of "causal".
- VII.68 "[reality]" — second rendering of "substance".
- VII.72 "[social]" — second rendering of "political".
- VII.75 "[continuity]" — second rendering of "consequence".

Long's supplements folded into prose — nine brackets, nine folds:

- VII.2 "[thoughts]" (as an apposition; flagged, see above).
- VII.3 "[all alike]".
- VII.9 "[one]".
- VII.13 "[using the letter r]".
- VII.17 "[happiness]" (as an apposition; flagged).
- VII.34 "[of those who seek fame]".
- VII.45 "[of deserting his post]".
- VII.58 "[to work on]".
- VII.67 "[the intelligence]" (the dagger sits immediately before it).

Fifteen brackets in all, nine folded and six dropped.

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Several Book VII
sentences are widely quoted in other renderings (VII.1 "there is nothing new",
VII.15 the emerald, VII.29 "Wipe out the imagination", VII.47 the courses of
the stars, VII.48 Plato's view from a higher place, VII.59 "Look within",
VII.61 the wrestler and the dancer, VII.69 passing every day as the last); each
was built from Long's sentence, not from memory of the familiar version. Long's
quotations from other authors (Plato at VII.35, VII.44, VII.45, VII.46, VII.48;
Antisthenes at VII.36; the unattributed verse at VII.38–VII.43, VII.50, VII.51)
were modernised from Long's English only — no published translation of Homer,
Hesiod, Euripides or the Apology was consulted, and no familiar English version
of any of them was echoed. Proper names are Long's spellings (Chrysippus,
Socrates, Epictetus, Plato, Antisthenes, Telauges, Leon of Salamis, Epicurus).

## Unresolved source issues (Long's text)

- **Dagger marks — seven, in four sections.** Long marks uncertain Greek
  (`../PROVENANCE.md` §4). Located in the PG text at lines 4433 and 4439
  (VII.16), 4529 and 4530 (VII.31), 4607 and 4609 (VII.46), and 4788 (VII.67).
  The seven clauses are named in `review-instructions.md` and stand as Long has
  them, with pronouns modernised and glossary renderings applied — the reading
  Book VI's VI.50 established. Reviewers should not expect the candidate to
  make them clearer than the source.
- **VII.5, "what-soever".** The PG text prints "For what-soever either by myself
  or with another I can do", with a hyphen left over from a line break in the
  printed original. Standard Ebooks' Long reads "whatsoever". Rendered
  "whatever". Recorded as a base-text defect, not a reading.
- **VII.58, the broken ending.** Long's text stops mid-sentence at "and resolve
  to be a good man in every act which thou doest: and remember…". The ellipsis
  is Long's (the Greek breaks off here), and it is kept, as V.29's ellipsis was
  kept at Book V. Standard Ebooks' Long also ends the section this way.
- **VII.45, Long's footnotes.** Not a defect in Long but in this package's own
  build, fixed at step 1: see Source above and `../PROVENANCE.md` §4. Recorded
  here because a reviewer comparing against an earlier copy of the staged file
  would otherwise find three sentences missing from the source.
- **VII.13, the Greek.** PG renders Long's Greek type as "[Greek: melos]" and
  "[Greek: meros]"; the staged original converts these to "(Greek: melos)" and
  "(Greek: meros)" (`../PROVENANCE.md` §4), and the candidate carries them as
  "(melos)" and "(meros)". Flagged above for a ruling.
