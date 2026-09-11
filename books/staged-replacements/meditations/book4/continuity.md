# Continuity sheet — Meditations, Book IV (candidate v2, accepted)

Written alongside drafting `candidate-v1.json`, after Books II, I and III were
accepted, and describing what the frozen draft actually did; updated at
acceptance (candidate v2) where a review finding reversed or recorded a
decision — each such line says so. Term renderings
follow `../GLOSSARY.md` (five rows added for Book IV before drafting, see
below); the pattern for applying review findings follows the three earlier
`ACCEPTANCE.md` files (decisions D8, D10 and D11 in the ledger).

## Source

- `../meditations-original-en.staged.json`, chapter `number: 4`, title `Book 4`,
  51 paragraphs, one per numbered meditation (IV.1–IV.51). Extracted verbatim
  into `source-book4.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- **Step 1 found a defect in the staged original**: three Project Gutenberg
  illustration captions ("[Illustration: INTERIOR OF THE PARTHENON]" at the
  end of IV.20, and two more at V.8 and IX.21) had survived the build. The
  build script now strips them; the staged file was rebuilt (sha256
  `7bf2d1b1…` → `b0ecf3da…`); only those three paragraphs changed, the count
  is still 487, and chapters 1–3 are byte-identical before and after, so the
  accepted Books I–III are unaffected. Recorded in `../PROVENANCE.md` §4 and
  the ledger (D12). `source-book4.json` is taken from the rebuilt file.
- Book IV was read in full before any paragraph was drafted. It is the longest
  book so far (51 meditations, 4,308 words) and the most varied in length:
  one-line sayings (IV.9, IV.15, IV.35, IV.41, IV.42) beside the long retreat
  meditation (IV.3, 557 words). Its threads: the retreat into oneself and the
  two things to keep ready (IV.3); the argument from common reason to the
  world as a state (IV.4, IV.29); death and change as the nature of things
  (IV.5, IV.14, IV.21, IV.36, IV.42–IV.48, IV.50); fame as nothing (IV.19,
  IV.20, IV.33, IV.35); opinion as the seat of harm (IV.7, IV.11, IV.39);
  doing few things and the short way (IV.24, IV.51).

## Glossary terms met in Book IV, and how they were rendered

| Long (Book IV) | Candidate | Where |
|---|---|---|
| That which rules within; the ruling and legislating faculty; ruling principles; the ruling principle of another | the ruling part; the ruling and legislating part; ruling parts; the ruling part of another | IV.1, IV.12, IV.38, IV.39 |
| rational animals; rational beings; reasonable animal(s) | rational beings; rational being(s) | IV.3, IV.4, IV.5, IV.29 — "reasonable animal" added to the glossary row as Long's variant of the same term |
| the animal which is naturally social | the being that is naturally social | IV.24 — per the glossary's "social animal → social being" |
| social reason | social reason | IV.29 |
| the reason of our common nature | the reason of our common nature | IV.29 |
| the nature of the universe | the nature of the whole | IV.36 — v1 had kept Long's phrase on the mistaken ground that it was not a glossary phrase; the glossary row merges both of Long's variants into "the nature of the whole", as Book II does (II.9). Corrected at the v2 flow read |
| the universe; the whole; the All | the universe; the whole; the whole | IV.3, IV.21, IV.25, IV.27, IV.29, IV.40 — "the All" (IV.27) rendered "the whole" (glossary row extended) |
| a kind of political community; in a manner a state; some political community; the state | a kind of political community; in a way a state; some political community; the state | IV.3, IV.4, IV.29 |
| providence or atoms | providence or atoms | IV.3 |
| the common interest; of common advantage | the common good; for the common good | IV.12 — "common advantage" taken as Long's variant of the same term |
| opinion (take away thy opinion; life is opinion; the power of forming opinions) | opinion | IV.3, IV.7, IV.11, IV.12, IV.26, IV.39, IV.49 |
| impression | impression | IV.22 |
| movement (in every movement have respect to justice) | impulse | IV.22 — the glossary's *hormē* sense; the meditation is about action, not motion. Reviewer finding 22.1 proposed "movement" for consistency with IV.40; declined at v2: the glossary row distinguishes by sense, IV.40 is left open by record, and Book V's "follow their peculiar movement" (V.3) takes "impulse" too, so "impulse" here is the consistent rendering across the edition |
| movement (all things act with one movement) | movement | IV.40 — left as Long has it, because the sentence can be read of motion or of impulse and the candidate does not decide |
| principles | principles | IV.3, IV.16, IV.49 |
| tranquillity; tranquil | calm | IV.3 (twice), IV.24 (three times) — "calm is nothing else than the good ordering of the mind" |
| discontent; discontented; dissatisfied | discontent; discontented; discontented | IV.3 (three times), IV.32 |
| perturbations | disturbances | IV.3, IV.37 — new glossary row |
| seminal principle; seminal intelligence | generative principle; generative intelligence | IV.14, IV.21 — new glossary row; "seed" itself (IV.36) stays "seed" |
| transmutation; transmuted; mutation | transformation; transformed; change | IV.14, IV.21, IV.39 — new glossary row; Long's own "transformation(s)" and "change(s)" (IV.3, IV.21, IV.36, IV.42) unchanged |
| the vulgar; a very vulgar notion; a vulgar … help | the common sort of men; a very commonplace notion; a commonplace … help | IV.20, IV.36, IV.50 — new glossary row; "the common sort of men" is Long's own phrase in IV.3 |
| posthumous fame | fame after death | IV.19 |
| the present | the present | IV.3, IV.26, IV.32, IV.49 |
| the elements; dissolution | the elements; dissolution | IV.5, IV.21, IV.32 |
| benevolence; benevolent disposition | kindness; kind disposition | IV.20, IV.25 — the "kind" family fixed in Book I |
| kindly disposed | kindly disposed | IV.37 — Long's own phrase, already in the family |
| vexes; vexation | vexes; resentment | IV.44, IV.49 — v1 had "annoys" in IV.44 (the Book I "annoy" family); reviewer finding 44.1 restored Long's transitive "vexes", which is current and, after "disease, and death", covers real distress where "annoys" understated. "On every occasion which leads thee to vexation" (IV.49) takes the glossary's "resent" family, since it is resentment at what happens that the principle answers |
| conformably to nature; contrary to nature; according to nature | according to nature; against nature; according to nature | IV.39, IV.48 |
| contrary to the nature of a reasonable animal; contrary to the reason of our constitution | against the nature of a rational being; against the reason of our constitution | IV.5 — the glossary's "against" carried to both halves so Long's parallel stays parallel |
| not contrary to the will of man's nature | not contrary to the will of man's nature | IV.49 — not Long's "contrary to nature", so not converted |
| intelligence; understanding; mind; intellectual part | intelligence; understanding; mind; intellectual part | IV.3, IV.4, IV.21, IV.29 — Long's words kept apart |
| soul | soul | IV.3, IV.21, IV.29, IV.31, IV.40, IV.41 |
| breath | breath | IV.3, IV.33 |
| reason; right reason; the soundest reason; social reason | reason; right reason; the soundest reason; social reason | throughout |
| the gods; god; a god | the gods; god; a god | IV.16, IV.23 ("Dear city of Zeus"), IV.31, IV.47 |

## Paragraph-level decisions

- **IV.1** — "So affected with respect to the events which happened" → "so
  disposed toward the events that happen": Long's "affected" here means
  disposed, and a modern reader would hear "affected by"; his past "happened"
  beside "always … adapts" is taken as the general present his "always"
  implies. "Extinguished" → "put out"; "appropriates to itself the matter which
  is heaped on it" → v1 "takes over the matter heaped on it"; at v2 (finding
  1.1) "makes its own the matter heaped on it" — "takes over" means assumes
  control of, and the fire absorbs the fuel; "makes … its own" is the plain
  equivalent of "appropriates to itself".
- **IV.2** — Already modern; kept word for word.
- **IV.3** — Long's longest section (557 words) kept as one paragraph in his
  order, with the four dialogue dashes. "Thou too art wont to desire" → "you
  too are in the habit of wanting"; "sea-shores" → "seashores"; "Recall to thy
  recollection" → "Recall to your mind" (as Long's own earlier "Recall to thy
  mind"; "recall to your recollection" is a tautology); "corporeal things" →
  "bodily things"; "as soon as thou shalt recur to them" → v1 "as soon as you
  return to them", at v2 (finding 3.1) "as soon as you turn to them", so that
  Long's two verbs (recur to the principles; return to the things) stay two; "nook" → "corner" (as III.10); "circumscribed" →
  "confined"; "want of judgment" → "lack of judgment"; "stretched dead" →
  "stretched out dead". Long's brackets folded: "[fortuitous concurrence of
  things]" → "atoms, a chance concurrence of things" (his gloss on "atoms",
  kept as a gloss); "[and be quiet at last]" three times → "; and be quiet at
  last" each time, matching his own unbracketed fourth; "[the present]" → "the
  present". "The universe is transformation: life is opinion." kept verbatim.
- **IV.4** — The "if this is so" chain kept as six links; "in a manner a
  state" → "in a way a state"; "from thence" → "from there"; "or whence do they
  come?" → "or where else do they come from?". Long's "from certain earth" (no
  article: some earth, a quantity of the element) restored at v2 (finding 4.1);
  v1's "from a certain earth" had made earth countable.
- **IV.5** — "Generation" → "birth"; "[the nature of]" folded; "contrary to" →
  "against" in both halves (see table).
- **IV.6** — "Fig-tree" → "fig tree"; nothing else.
- **IV.7** — Long's double quotation marks around "I have been harmed" kept.
- **IV.9** — "[universally]" folded: "what is universally useful".
- **IV.10** — "Do it in conjunction with this, the being good" → "do it
  together with this, being good"; the "and in the sense in which" kept.
- **IV.12** — "The ruling and legislating faculty" → "part" (glossary); "of
  common advantage" → "for the common good" (glossary; see table).
- **IV.13** — "Hast thou reason? I have.—Why then dost not thou use it?" →
  "Do you have reason? I have.—Why, then, do you not use it?".
- **IV.14** — "Seminal principle" → "generative principle"; "transmutation" →
  "transformation"; "but rather" → "or rather".
- **IV.18** — Long's dagger is on the name "Agathon"; the two words "as
  Agathon says" stand verbatim. The rest of the sentence is modernised ("look
  not round" → "do not look round").
- **IV.19** — Long has three daggers here. "What is praise, except indeed so
  far as it has a certain utility?" stands verbatim, and so does the broken
  ending "clinging to something else...." with Long's four dots (his ellipsis
  for a lacuna plus the full stop). "Vehement desire" kept (current);
  "posthumous fame" → "fame after death"; "transmitted" → "passed on";
  "rejectest unseasonably" → "unseasonably reject" (Long's adverb, current).
  Long's second "also" ("then again also they who have succeeded them"), which
  carries the elided verb, was dropped in v1 and restored at v2 (finding 19.1):
  "then again also those who succeeded them".
- **IV.20** — "Terminates in itself" → "ends in itself"; "Neither worse then
  nor better is a thing made by being praised" → "A thing, then, is made
  neither worse nor better by being praised"; "the vulgar" → "the common sort
  of men"; "benevolence" → "kindness". The PG illustration caption that had
  been appended to this paragraph in the staged original is removed at source
  (see above); it was never Long's text.
- **IV.21** — "Mutation" → "change"; "subsisting" → "existing"; "transmuted"
  → "transformed"; "seminal intelligence" → "generative intelligence"; "assume
  a fiery nature" → "take on a fiery nature"; "the aerial or the fiery
  element" kept. "[of these bodies]" folded. Long's "[the formal]" is an
  alternative label for "that which is the cause of form", not a supplement,
  and is dropped under D11; his cross-reference "(vii. 29.)" dropped as
  apparatus.
- **IV.22** — "In every movement" → "in every impulse" (glossary *hormē*
  sense; see table); "have respect to justice" → "have regard to justice";
  "maintain the faculty of comprehension" kept (Long's verb, current). "[or
  understanding]" is an alternative rendering and is dropped under D11. Finding
  22.1 (keep Long's "movement" here, as in IV.40) declined at v2; see the table.
- **IV.23** — "O Universe", "O Nature", "Dear city of Cecrops", "Dear city of
  Zeus" kept as Long has them, without added quotation marks.
- **IV.24** — "If thou wouldst be tranquil" → "if you would be calm"; "the
  tranquillity which comes from doing well … that which comes from doing few
  things" → "the calm that comes from doing well … the calm that comes from
  doing few things" (the noun repeated where Long has "that which"); "For the
  greatest part of what we say and do being unnecessary" → "For since the
  greatest part … is unnecessary"; "for thus" → "for then".
- **IV.26** — Nine short sentences kept as nine; "Thou must turn to profit the
  present by the aid of reason and justice" → "You must turn the present to
  profit with the aid of reason and justice".
- **IV.27** — "Subsist" → "exist"; "the All" → "the whole" (glossary); "so
  separated and diffused and sympathetic" → "so separated and diffused and in
  sympathy with one another": Long's "sympathetic" is the Stoic sense (acting
  on one another), which the modern adjective no longer carries; "in sympathy
  with one another" keeps his word and only its old sense. Word ratio 1.10 is
  from this one phrase.
- **IV.28** — Long's twelve-word list of characters kept word for word.
- **IV.29** — "Flies from" → "flees from"; "reasonable animals" → "rational
  beings"; "rent asunder" → "torn off"; the PG stray comma in "tears, his own
  soul" dropped; "for the same nature produces this" kept singular as Long has
  it.
- **IV.30** — Long's dagger falls after "learning,"; the clause "I do not get
  the means of living out of my learning" stands verbatim, and "[by my
  reason]" is folded: "and I abide by my reason". "Bread I have not, he says"
  → "I have no bread, he says".
- **IV.31** — "Intrusted" → "entrusted".
- **IV.32** — Long's list of what people are seen doing kept as a list of the
  same length; "warring" → "making war"; "trafficking" → "trading";
  "cultivating the ground" kept; "desiring consulship" → "desiring the
  consulship"; "remove to the times of Trajan" → "move on to the times of
  Trajan"; "In like manner" → "In the same way"; "herein" → "here";
  "dissatisfied" → "discontented" (glossary); "than is fit" → "than is fitting".
- **IV.33** — The seven names kept in Long's spellings (Camillus, Caeso,
  Volesus, Leonnatus, Scipio, Cato, Augustus, Hadrianus, Antoninus); "employ
  our serious pains" → v1 "spend our serious pains"; Long's "employ" restored at
  v2 (finding 33.1): pains are taken, spared or employed, not spent.
- **IV.34** — Long's dagger falls after "thread"; the clause "into whatever
  things she pleases" stands verbatim and "thy thread" becomes "your thread"
  (pronoun only, as in Book II). "[one of the fates]" folded as "Clotho, one of
  the fates", Long's lowercase kept.
- **IV.36** — "In a manner the seed" → "in a way the seed"; "a very vulgar
  notion" → "a very commonplace notion". "The nature of the universe" → "the
  nature of the whole" at v2 (flow read; glossary row, Book II precedent); v1
  had kept Long's phrase — see the table.
- **IV.37** — "Perturbations" → "disturbances"; "towards" → "toward" (spelling
  only).
- **IV.38** — "Ruling principles" → "ruling parts".
- **IV.39** — "Subsist" → "exist" (twice); "mutation of thy corporeal
  covering" → "change of your bodily covering"; "[such]" folded; "contrary to
  nature" → "against nature" (three times, glossary).
- **IV.40** — "Co-operating" → "cooperating"; "the contexture of the web" →
  v1 "the weaving of the web", at v2 (finding 40.1) "the weave of the web":
  Long's pair is a process and its product, and "weave" as a noun says what
  "contexture" said; "act with one movement" kept (see table).
- **IV.41** — "Bearing about a corpse" → "carrying about a corpse"; Long's
  cross-reference "(i. c. 19)" to Epictetus dropped as apparatus. Ratio 0.83
  is from that drop.
- **IV.42** — "Subsist in consequence of change" → "exist as a result of
  change".
- **IV.44** — "Calumny" → "slander"; "vexes them" → v1 "annoys them", Long's
  "vexes them" restored at v2 (finding 44.1; see table).
- **IV.45** — Long's cross-references "(vi. 38; vii. 9; vii. 75, note)"
  dropped as apparatus; "exhibit no mere succession" → "show no mere
  succession". Ratio 0.91 is from the drop.
- **IV.46** — Long has two daggers here; both clauses stand verbatim: "we
  ought not to act and speak as if we were asleep, for even in sleep we seem
  to act and speak" and "like children who learn from their parents, simply
  to act and speak as we have been taught". "And reversely" → "and the
  reverse"; "whither the way leads" → "where the way leads"; "the things which
  they daily meet with" → "the things they meet with daily".
- **IV.47** — "To-morrow" → "tomorrow"; "on the morrow" → "tomorrow"; "unless
  thou wast in the highest degree mean-spirited" → "unless you were
  mean-spirited in the highest degree"; "how small is the difference!" → "how
  small the difference is!".
- **IV.48** — "Contracting their eyebrows over the sick" kept (Long's image;
  compare the lion's eyebrows in III.2); "others innumerable" kept;
  "conformably to nature" → "according to nature" (glossary); "an olive falls
  off when it is ripe, blessing nature who produced it" kept with Long's
  "who".
- **IV.49** — "Promontory" kept; "Unhappy am I because this has happened to
  me? Not so, but happy am I" → "Am I unhappy because this has happened to
  me? Not so; rather, I am happy" (word order only); "but every man would not
  have continued" → "but not every man would have continued" (Long's order
  now reads as "no man would"); "inconsiderate opinions" → "rash opinions"
  ("inconsiderate" now means unkind; Long means formed without
  consideration); "vexation" → "resentment" (see table); "magnanimous" kept.
- **IV.50** — Long's dagger falls after "value."; the sentence "Do not then
  consider life a thing of any value." stands verbatim. "A vulgar, but still a
  useful help" → "a commonplace, but still a useful help"; "tenaciously stuck
  to life" → "clung tenaciously to life"; "[between birth and death]" folded;
  the four names kept in Long's spellings.
- **IV.51** — Long's dagger falls after "trouble,"; the whole sentence "For
  such a purpose frees a man from trouble, and warfare, and all artifice and
  ostentatious display." stands verbatim. "Always run to the short way" →
  "Always run by the short way"; "the natural" → "the natural one".

## Apparatus dropped (each listed, per the glossary's rule)

- IV.21 "(vii. 29.)" — cross-reference.
- IV.21 "[the formal]" — alternative label (D11).
- IV.22 "[or understanding]" — alternative rendering (D11).
- IV.41 "(i. c. 19)" — citation of Epictetus.
- IV.45 "(vi. 38; vii. 9; vii. 75, note)" — cross-references.
- IV.20 "[Illustration: INTERIOR OF THE PARTHENON]" — PG caption, removed
  from the staged original itself (see Source above).

Long's supplements folded into prose: IV.3 "[fortuitous concurrence of
things]", "[and be quiet at last]" ×3, "[the present]"; IV.5 "[the nature
of]"; IV.9 "[universally]"; IV.21 "[of these bodies]"; IV.30 "[by my reason]";
IV.34 "[one of the fates]"; IV.39 "[such]"; IV.50 "[between birth and death]".

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Several Book IV
sentences are widely quoted in other renderings (IV.3 on retreats, IV.7 on
"I have been harmed", IV.17 "while it is in your power, be good", IV.41 the
little soul carrying a corpse, IV.43 time as a river, IV.49 the promontory);
each was built from Long's sentence, not from memory of the familiar version.
Proper names are Long's spellings (Agathon, Cecrops, Zeus, Vespasian, Trajan,
Camillus, Caeso, Volesus, Leonnatus, Scipio, Cato, Augustus, Hadrianus,
Antoninus, Clotho, Epictetus, Heraclitus, Helice, Pompeii, Herculaneum,
Cadicianus, Fabius, Julianus, Lepidus).

## Unresolved source issues (Long's text)

- Long marks ten places in Book IV with his dagger for uncertain Greek
  (`../PROVENANCE.md` §4; v1 of this sheet said "nine places", which was the
  count of clauses, not marks — corrected after the reviewer re-counted the
  PG text): IV.18 at "Agathon", IV.19 ×3 (after "except", after "has", and at
  the broken ending "else ... +."), IV.30 after "learning,", IV.34 after
  "thread", IV.46 ×2 (after "and that" and at the end), IV.50 after "value.",
  IV.51 after "trouble,". Ten marks, nine clauses named in
  `review-instructions.md`, which cover all ten. The clauses named in `review-instructions.md` stand
  as Long has them (pronoun modernised in IV.34 only); reviewers should not
  expect the candidate to make them clearer than the source.
- IV.19 ends in Long's ellipsis ("something else...."): the Greek breaks off.
  Kept as Long prints it; nothing supplied.
- IV.1 "the events which happened": Long's past tense beside "always … adapts"
  is rendered as the general present ("that happen"); a reviewer who reads
  Long's past as deliberate should say so.
- IV.40 "act with one movement": left open between motion and impulse (see
  table; and finding 22.1, declined).
- No truncated source paragraphs other than IV.19; every other source
  paragraph ends in terminal punctuation.
