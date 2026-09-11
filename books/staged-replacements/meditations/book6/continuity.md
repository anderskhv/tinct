# Continuity sheet — Meditations, Book VI (candidate v1)

Written alongside drafting `candidate-v1.json`, after Books II, I, III, IV and
V were accepted, and describing what the frozen draft actually did. Term
renderings follow `../GLOSSARY.md` (one row added and two rows extended for
Book VI before drafting, see below); the pattern for applying review findings
follows the five earlier `ACCEPTANCE.md` files (decisions D8, D10 and D11 in
the ledger).

## Source

- `../meditations-original-en.staged.json`, chapter `number: 6`, title `Book 6`,
  59 paragraphs, one per numbered meditation (VI.1–VI.59). Extracted verbatim
  into `source-book6.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- The staged file is the one rebuilt at Book IV step 1 (sha256 `b0ecf3da…`,
  D12); step 1 for Book VI re-verified the hash and that no `[Illustration`
  survives anywhere in the file. No Book VI paragraph was among the three the
  rebuild changed.
- Book VI was read in full before any paragraph was drafted: 59 meditations,
  4,561 words, the longest VI.16 (344 words, what is worth valuing) and VI.30
  (316 words, the portrait of Antoninus), the shortest VI.34 (11 words). Its
  threads: the reason that governs the universe and has no malice (VI.1, VI.5,
  VI.9, VI.40); confusion or providence (VI.10, VI.44); returning to oneself
  and to philosophy as to a mother (VI.11, VI.12); stripping things of the
  words that exalt them — the dead fish, the Falernian, the purple robe
  (VI.13); the grades of what men admire (VI.14); the flowing stream and the
  sparrow (VI.15); fame as a clapping of tongues (VI.16, VI.18, VI.59); the
  antagonist in the gymnasium and teaching without anger (VI.20, VI.27,
  VI.50, VI.57); spelling out the name Antoninus letter by letter (VI.26);
  not being made into a Caesar, and Antoninus as the model (VI.30); little
  body and soul, and what is indifferent (VI.32); Asia and Europe as corners
  of the universe (VI.36); all things bound up with one another and working
  to one end (VI.38, VI.42, VI.43, VI.54); Rome and the world as one's two
  cities (VI.44); the dead of every kind, from Philistion to Archimedes
  (VI.47); the virtues of those one lives with (VI.48); litrae and years
  (VI.49); the jaundiced and honey (VI.57).
- Cross-checked for Book VI against Standard Ebooks' Long (the same edition
  `../PROVENANCE.md` §3 used for Book II) at the points where the PG text
  looked doubtful; the results are recorded under the paragraph concerned and
  under unresolved source issues. No wording was taken from Standard Ebooks;
  the check was for the state of the base text only.

## Glossary terms met in Book VI, and how they were rendered

| Long (Book VI) | Candidate | Where |
|---|---|---|
| the ruling principle | the ruling part | VI.8 |
| the reason which governs | the reason that governs | VI.1, VI.5 — Long's phrase, kept |
| in conformity to the nature of the universe | according to the nature of the whole | VI.9 — both halves of the glossary: "in conformity to" collapses to "according to", "the nature of the universe" to "the nature of the whole" (as II.9, IV.36 v2, V.8, V.10) |
| conformable to (reason, his nature, his constitution); in conformity to (thy proper constitution) | according to | VI.14, VI.16, VI.19, VI.30, VI.44 |
| in conformity to intelligence | in conformity with intelligence | VI.40 (twice) — not the "nature" collapse; Long's own phrase kept with the current preposition |
| the universal ruling power; the universal nature | the universal ruling power; the universal nature | VI.36, VI.58 — Long's adjective, kept |
| the universal (noun: "for the interest of the universal") | the whole | VI.45 — glossary row extended before drafting |
| the universe; the whole | the universe; the whole | VI.1, VI.4, VI.9, VI.10, VI.24, VI.36, VI.38, VI.40, VI.42, VI.44 |
| the one and all, which we call Cosmos | the one and all, which we call Cosmos | VI.25 — Long's words, kept |
| God; the gods; a deity | God; the gods; a deity | VI.7, VI.41 (Long's capital, "as Long has them"); VI.44 "a deity without forethought" is Long's countable noun, not the abstract "the Deity" of the glossary row, and stays |
| providence | providence | VI.10, VI.44 |
| seminal principles | generative principles | VI.24 — Book IV row |
| perturbation (in a state of perturbation) | disturbance | VI.16 — Book IV row |
| disturbed | disturbed | VI.10, VI.11, VI.26, VI.52 — Long's own verb |
| impressions; the appearances of things; impression | impressions; the appearances of things; impression | VI.13, VI.16, VI.28 — the technical "impressions" kept; "appearances" kept where Long has it beside it |
| opinion; a false opinion; a just opinion | opinion | VI.36, VI.52, VI.57 |
| indifferent; things of the middle kind | indifferent; things of the middle kind | VI.32, VI.45 — Long's own gloss of "the middle kind" folded (see VI.45) |
| social act(s); social spirit; social life; society | social act(s); social spirit; social life; society | VI.7, VI.14, VI.16, VI.23, VI.30 |
| rational and social | rational and social | VI.44 |
| a rational soul; the reason of thy own nature | a rational soul; the reason of your own nature | VI.14, VI.58 |
| the understanding; the mind; intelligence | the understanding; the mind; intelligence | VI.32, VI.40, VI.51 — Long's words kept apart |
| human beings | human beings | VI.23 — Long's own phrase; the glossary row now names VI.23 beside V.1 |
| vexation; vexed because | resentment; resentful because | VI.20, VI.27 — glossary row extended before drafting |
| dissatisfied | discontented | VI.49 (twice) |
| tranquillity | calm | VI.50 |
| in a manner | in a way | VI.11, VI.27, VI.38 |
| benevolent disposition | kind disposition | VI.47 — new glossary row (Book I family; Long's own phrase at V.31) |
| liberality; a generous and liberal spirit | generosity; a generous and liberal spirit | VI.48 (the plain noun), VI.23 (Long's own pair, both current, kept) |
| fame; posterity | fame; posterity | VI.16, VI.18, VI.30, VI.51 |
| the elements; dispersion of my elements | the elements; the dispersion of my elements | VI.10, VI.15, VI.17 |
| the many; the multitude | the many; the multitude | VI.16, VI.14 — both Long's, both current, kept apart |
| movements (of the elements); the discursive movements of the thoughts; the active movement | movements; movements; movement | VI.17, VI.28, VI.38 — motion, not impulse; "movement" stays (glossary) |
| philosophy | philosophy | VI.12 (with Long's "her"), VI.30 |
| the ruling part; the god within | — | "the god within" not met in Book VI; "the ruling principle" once (VI.8) |

## Paragraph-level decisions

- **VI.1** — "The reason which governs" → "the reason that governs"; nothing
  else.
- **VI.2** — "Ill-spoken of" → "ill spoken of"; Long's cross-reference
  "(vi. 22, 28)" dropped (apparatus, listed below).
- **VI.3** — "The peculiar quality of anything" → "the particular quality of
  anything" (Long's "peculiar" = its own, particular, as V.3 "their own").
- **VI.4** — Pronoun-free; word for word Long's.
- **VI.5** — "Which" → "that"; nothing else.
- **VI.6** — "[The wrong-doer]" folded: "not to become like the wrongdoer"
  (Standard Ebooks prints it as running text, "the wrong doer").
- **VI.7** — "Rest in it, in passing" → "rest in it: in passing" (Long's comma
  introduces the one thing; the colon makes that plain).
- **VI.8** — "The ruling principle is that which rouses and turns itself" →
  "The ruling part is what rouses and turns itself".
- **VI.9** — "In conformity to the nature of the universe" → "According to the
  nature of the whole" (glossary, both halves); "a nature external and
  independent of this" → "a nature external to and independent of this";
  cross-reference "(xi. 1; vi. 40; viii. 50)" dropped.
- **VI.10** — "A mutual involution of things" → "a mutual entanglement of
  things" (Long's "involution" is a rolling-together; "entanglement" is the
  plain word and keeps the image); "tarry" → "linger"; "fortuitous" kept
  (current); "and why … and why" → "And why … And why" as separate questions;
  cross-reference "(iv. 27)" dropped.
- **VI.11** — "In a manner" → "in a way"; "by continually recurring to it" →
  "by continually turning back to it" (so Long's two verbs, return / recur,
  stay two, as IV.3 v2).
- **VI.12** — "Step-mother" → "stepmother"; "repose in her" → "rest in her"
  (V.9's "repose in it" is inside a dagger clause and stays there; this one is
  not); "what thou meetest with in the court appears to thee tolerable" →
  "what you meet with in the court appears to you tolerable".
- **VI.13** — "Grape-juice" → "grape juice"; "shell-fish" → "shellfish"; "Just
  in the same way ought we to act" → "In just the same way we ought to act";
  "approbation" → "approval"; "Consider then what Crates says of Xenocrates
  himself" kept as the bare reference Long leaves it.
- **VI.14** — "Fig-trees" → "fig trees"; "as flocks, herds" → "as flocks and
  herds"; "not however a universal soul" → "not, however, a universal soul";
  "conformable to reason and social life" → "according to reason and social
  life"; "co-operates" → "cooperates" (spelling, as V.30 "coordinated");
  "political life" kept (glossary: "political community" as Long has it).
- **VI.15** — "Of that which is coming into existence part is already
  extinguished" → "of what is coming into existence, part is already
  extinguished"; "on which there is no abiding" → "on which nothing stays";
  "the sparrows which fly by, but it has already passed" → "the sparrows that
  fly by—but it has already passed" (Long's "but" is the turn of the image;
  the dash marks it); "the respiration of the air" → "the breathing in of the
  air"; "the whole respiratory power" → "the whole power of breathing".
- **VI.16** — "Transpiration, as in plants" kept (Long's term; a reader meets
  it in biology); "respiration, as in domesticated animals" → "breathing"
  (as VI.15); "assembling in herds" → "gathering in herds"; "in conformity to
  thy proper constitution" → "according to your proper constitution";
  "vine-planter", "horse-breaker" → "vine planter", "horse breaker"; "in a
  state of perturbation" → "in a state of disturbance" (glossary); the long
  chain of "nor … nor" and "neither … nor … nor" kept as Long has it.
- **VI.17** — "Movements of the elements" and "the motion of virtue" kept as
  Long's two words (motion, not impulse).
- **VI.18** — "Living with themselves" → "living with them" (Long's reflexive
  refers to the men themselves; "with them" is the current form); "those who
  have lived before thee" → "those who lived before you".
- **VI.19** — "If a thing is difficult to be accomplished by thyself" → "If a
  thing is difficult for you to accomplish"; "conformable to his nature" →
  "according to his nature".
- **VI.20** — "In the gymnastic exercises" kept; "signs of vexation" → "signs
  of resentment" (glossary, extended); "afterwards" → "afterward" (spelling,
  as "toward"); "Something like this let thy behavior be" → "Let your behavior
  be something like this"; "antagonists in the gymnasium" → "opponents in the
  gymnasium".
- **VI.21** — "Abides in his error" → "persists in his error"; "act right"
  kept as Long has it.
- **VI.22** — "Other things trouble me not" → "other things do not trouble
  me"; "things that have rambled and know not the way" → "things that have
  strayed and do not know the way" ("rambled" now means talked at length;
  "strayed" is Long's sense).
- **VI.23** — "Do thou, since thou hast reason and they have none, make use of
  them" → "since you have reason and they have none, make use of them" (the
  imperative carries the address); "a generous and liberal spirit" kept
  (both words current); "towards" → "toward"; "human beings" kept (Long's
  own).
- **VI.24** — "By death were brought to the same state" → "were brought by
  death to the same state"; "seminal principles" → "generative principles"
  (glossary).
- **VI.25** — "How many things in the same indivisible time take place in each
  of us,—things which" → "how many things take place in each of us in the
  same indivisible time—things that"; "the one and all, which we call Cosmos"
  kept.
- **VI.26** — "Propose to thee the question, how the name Antoninus is
  written" → "put to you the question how the name Antoninus is written";
  "What then if they grow angry, wilt thou be angry too?" → "What, then, if
  they grow angry—will you be angry too?"; "towards" → "toward"; "that which
  is set before thee" → "what is set before you".
- **VI.27** — PG's capital "After" mid-sentence ("to strive After the things")
  lowered; "in a manner" → "in a way"; "when thou art vexed because they do
  wrong" → "when you are resentful because they do wrong" (glossary);
  "towards" → "toward"; "Teach them then, and show them" → "Teach them, then,
  and show them".
- **VI.28** — "The strings which move the appetites" → "the strings that move
  the appetites"; "discursive movements of the thoughts" kept (motion);
  cross-reference "(ii. 12)" dropped.
- **VI.29** — "To be first to give way" → "to be the first to give way".
- **VI.30** — "Terrene life" → "earthly life"; "a worshipper of the gods" kept
  as PG spells it; "conformable to reason" → "according to reason"; "how he
  listened not to calumnies" → "how he did not listen to slander"; "how he was
  able on account of his sparing diet to hold out to the evening, not even
  requiring to relieve himself by any evacuations except at the usual hour" →
  "how he was able, on account of his sparing diet, to hold out until the
  evening, not even needing to relieve himself by any evacuation except at the
  usual hour"; "the pleasure that he had" → "the pleasure he had"; "that thou
  mayest have as good a conscience" → "so that you may have as good a
  conscience"; cross-reference "(i. 16)" dropped. Long's list of Antoninus's
  qualities kept in his order, item for item.
- **VI.31** — Both supplements folded: "look at these [the things about thee]
  as thou didst look at those [the dreams]" → "look at these things about you
  as you looked at those dreams".
- **VI.32** — "Those things only are indifferent which are not" → "those
  things only are indifferent that are not"; "And of these however only those"
  → "And of these, however, only those".
- **VI.33** — "Contrary to nature" → "against nature" (glossary, three times);
  "So then neither to a man as a man is his labor contrary to nature" → "So,
  then, neither is his labor against nature for a man as a man".
- **VI.34** — Word for word Long's, including "patricides" (PG and Standard
  Ebooks both have it; Long's spelling, a real word for father-killers, not
  emended to "parricides").
- **VI.35** — "Handicrafts-men" → "craftsmen"; "the reason [the principles] of
  their art" and "the reason [the principles] of their own arts" → "the reason
  of their art" / "the reason of their own arts": "[the principles]" is Long's
  second rendering of the one word he has just rendered "reason", dropped
  under D11 (twice; Standard Ebooks keeps the brackets, confirming it is
  apparatus); "shall have more respect to the reason … than man to his own
  reason" → "have more respect for the reason … than man has for his own
  reason".
- **VI.36** — "From thence" → "from there"; "that which is poisonous" → "what
  is poisonous"; "as a thorn, as mud" → "such as a thorn, or mud"; "Do not
  then imagine … from that which thou dost venerate" → "Do not, then, imagine
  … from what you venerate"; cross-reference "(vii. 75)" dropped.
- **VI.37** — "Which" → "that" (twice); nothing else.
- **VI.38** — "In a manner" → "in a way"; "all things are implicated with one
  another" → "all things are bound up with one another" (Long's "implicated" =
  folded together; in current English it means involved in wrongdoing).
  Long's dagger falls before "active movement"; the clause "by virtue of the
  active movement and mutual conspiration and the unity of the substance"
  stands verbatim, "conspiration" included. Cross-reference "(ix. 1)"
  dropped.
- **VI.39** — "But do it truly [sincerely]" → "but do it truly": "[sincerely]"
  is a second rendering of "truly", dropped under D11. Standard Ebooks prints
  "truly, sincerely" as running text; that is a doubling of one word, and the
  D11 classification is by kind, not by printing. Flagged for the reviewer.
- **VI.40** — "There abides in them the power which made them" → "there
  remains in them, the power that made them"; "wherefore the more is it fit to
  reverence this power" → "therefore it is all the more fitting to reverence
  this power"; "in conformity to intelligence" → "in conformity with
  intelligence" (twice; see table).
- **VI.41** — PG "thou wilt not blame the gods, and hate men too": the "not"
  makes the sentence say the opposite of its argument (supposing external
  things good or evil *makes* a man blame the gods and hate men, which is the
  injustice the next clause names), and Standard Ebooks' Long reads "thou wilt
  blame the gods". Rendered "you will blame the gods, and hate men too";
  recorded under unresolved source issues. "Befall thee" → "befalls you".
  Long's dagger falls inside his bracket "[because we do not regard these
  things as indifferent]", which is his own second rendering of "because we
  make a difference between these things" (his footnote gives Gataker's
  different reading and says "I doubt"); the bracket is dropped under D11
  and the primary clause "and indeed we do much injustice because we make a
  difference between these things" stands verbatim. Flagged for the reviewer:
  the dagger marks a clause whose alternative rendering is the thing dropped.
  "God" kept with Long's capital.
- **VI.42** — "Co-operators", "co-operate" → "cooperators", "cooperate"
  (spelling); "after different fashions" → "in different ways"; "and even
  those co-operate abundantly, who find fault" → "and even those cooperate
  abundantly who find fault"; "whose labors conduce to one end" → "whose
  labors contribute to one end"; "But be not thou such a part as the mean and
  ridiculous verse in the play, which Chrysippus speaks of" → "But do not be
  such a part as the mean and ridiculous verse in the play that Chrysippus
  speaks of".
- **VI.43** — "The Fruit-bearer [the earth]" → "the Fruit-bearer, the earth":
  Long's bracket supplies the referent of a title that is otherwise opaque
  ("the Fruit-bearer" is the earth, as Aesculapius is the healer), so it is
  folded as an apposition, on the V.8 "It, necessity or destiny" precedent,
  rather than dropped as a label. Standard Ebooks keeps the brackets. Flagged
  for the reviewer as a fold that could be argued a D11 drop.
- **VI.44** — "Why should they have any desire towards that?" → "toward";
  "for what advantage would result to them from this or to the whole" → "For
  what advantage would result to them from this, or to the whole"; "But if
  they determine about nothing,—which it is wicked to believe … and lived
  with us,—but if however" → the same with em dashes and "but if, however";
  "that which is useful … which is conformable to his own constitution and
  nature" → "what is useful … which is according to his own constitution and
  nature"; "a deity without forethought" kept (see table). Long's three-way
  conditional (determined about me / about the whole / about nothing) and
  the Rome / the world close kept as he has them.
- **VI.45** — "For the interest of the universal" → "for the interest of the
  whole" (glossary row extended); "things of the middle kind [neither good
  nor bad]" → "things of the middle kind, neither good nor bad": Long's gloss
  of the technical phrase, folded. It is the one bracket in Book VI where
  Standard Ebooks prints the words as running text without brackets ("of
  things of the middle kind, neither good nor bad"), so in at least one
  printing of Long it is his sentence; and without it "the middle kind" is a
  term no reader can resolve from the paragraph. Recorded as a fold, not a
  drop; flagged for the reviewer.
- **VI.46** — "Amphitheatre" kept as PG spells it (the glossary follows the
  base text's spelling; PG has "amphitheatre" here, as it has "ploughed" at
  V.7); "How long then?" → "How long, then?".
- **VI.47** — "[Of men]" folded: "the other kinds of men" (Standard Ebooks
  prints it as running text); "To that place then we must remove" → "To that
  place, then, we must go"; "as Menippus and such as are like him" → "such as
  Menippus and those like him"; "with a benevolent disposition" → "with a kind
  disposition" (new glossary row; Long's own phrase at V.31). Long's roll of
  names kept in his order.
- **VI.48** — "Liberality" → "generosity"; "Wherefore we must keep them before
  us" → "Therefore we must keep them before us".
- **VI.49** — PG prints "Thou art not dissatisfied. I suppose, because thou
  weighest" — the full stop after "dissatisfied" is a PG error for a comma
  (Standard Ebooks has the comma); rendered "You are not discontented, I
  suppose, because you weigh"; "dissatisfied" → "discontented" (glossary,
  twice); "litrae" kept (a unit of weight; a proper term, not glossed, as
  "Rostra" at V.36).
- **VI.50** — "Let us try to persuade them [men]" → "Let us try to persuade
  them": the bracket names the referent of "them", which the next two
  sentences ("against their will", "any man") supply anyway, so it is dropped
  as a label under D11 rather than folded (Standard Ebooks keeps the
  brackets); "betake thyself to contentment and tranquillity" → "turn to
  contentment and calm" (glossary for "tranquillity"); "towards" → "toward";
  "with a reservation [conditionally]" → "with a reservation": "[conditionally]"
  is a second rendering of "reservation" (the Stoic *hypexairesis*, which
  V.20 met as "acting conditionally" in Long's own text), dropped under D11
  (Standard Ebooks omits it too). Long's dagger falls at the very end, after
  "[not] accomplished."; the last sentence "But thou attainest thy object, if
  the things to which thou wast moved are [not] accomplished" stands with
  pronouns modernised and Long's supplement "[not]" folded: "But you attain
  your object, if the things to which you were moved are not accomplished."
  The supplement is Long's, printed as a supplement, and the rule folds
  supplements; but it carries the sentence's sense (Standard Ebooks omits it,
  reading "are accomplished"), and the dagger says Long himself was unsure of
  the Greek. **Flagged for the reviewer as the first thing to rule on in Book
  VI**: fold (as drafted), or drop to "are accomplished".
- **VI.51** — Word for word Long's.
- **VI.52** — Word for word Long's.
- **VI.53** — "Accustom thyself" → "Accustom yourself"; "as much as it is
  possible" → "as much as possible".
- **VI.54** — "That which is not good for the swarm, neither is it good for the
  bee" → "What is not good for the swarm is not good for the bee either"
  (Long's "neither" carried by "either").
- **VI.55** — "Would they listen to anybody else? or how could" → "…else? Or
  how could".
- **VI.56** — "How many together with whom I came into the world are already
  gone out of it" → "How many of those who came into the world with me are
  already gone out of it" (Long's relative has no head noun in current
  English; "of those who" supplies the grammar, not a thought).
- **VI.57** — "To the jaundiced honey tastes bitter" → "To the jaundiced,
  honey tastes bitter"; "Why then am I angry? Dost thou think" → "Why, then,
  am I angry? Do you think".
- **VI.58** — "Contrary to the reason of the universal nature" → "against the
  reason of the universal nature" (glossary).
- **VI.59** — Pronoun-free; word for word Long's.

## Apparatus dropped (each listed, per the glossary's rule)

Cross-references (Long's parenthetical section references, D5):

- VI.2 "(vi. 22, 28)".
- VI.9 "(xi. 1; vi. 40; viii. 50)".
- VI.10 "(iv. 27)".
- VI.28 "(ii. 12)".
- VI.30 "(i. 16)".
- VI.36 "(vii. 75)".
- VI.38 "(ix. 1)".

Alternative renderings and labels (D11):

- VI.35 "[the principles]" — second rendering of "reason" (twice).
- VI.39 "[sincerely]" — second rendering of "truly".
- VI.41 "[because we do not regard these things as indifferent]" — Long's
  second rendering of "because we make a difference between these things"
  (dagger inside; see VI.41 above).
- VI.50 "[men]" — label for "them", whose referent the next sentences give.
- VI.50 "[conditionally]" — second rendering of "with a reservation".

No verse citations in Book VI.

Long's supplements folded into prose: VI.6 "[the wrong-doer]"; VI.31 "[the
things about thee]" and "[the dreams]"; VI.43 "[the earth]" (as an
apposition); VI.45 "[neither good nor bad]" (running text in Standard
Ebooks); VI.47 "[of men]"; VI.50 "[not]" (inside the dagger-marked last
sentence; see VI.50 above).

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Several Book VI
sentences are widely quoted in other renderings (VI.6 "The best revenge is
not to be like…", VI.13 the dead fish and the purple robe, VI.15 the sparrow,
VI.16 the clapping of tongues, VI.21 "If anyone can show me…", VI.30 "not
made into a Caesar", VI.44 "my city and country … is Rome … it is the world",
VI.54 the swarm and the bee); each was built from Long's sentence, not from
memory of the familiar version. Standard Ebooks' Long was consulted only to
check the state of the PG base text at the points listed above, never for
wording. Proper names are Long's spellings (Falernian, Crates, Xenocrates,
Alexander the Macedonian, Antoninus, Athos, Heraclitus, Chrysippus,
Aesculapius, Philistion, Phoebus, Origanion, Pythagoras, Socrates, Eudoxus,
Hipparchus, Archimedes, Menippus).

## Unresolved source issues (Long's text)

- Long marks three places in Book VI with his dagger for uncertain Greek
  (`../PROVENANCE.md` §4): VI.38 before "active movement"; VI.41 inside the
  bracket after "as indifferent"; VI.50 after "[not] accomplished." Three
  marks, three clauses, named in `review-instructions.md`. VI.38's clause
  stands verbatim; VI.41's primary clause stands verbatim and the bracketed
  alternative the dagger sits in is dropped under D11; VI.50's last sentence
  stands verbatim with pronouns modernised and Long's "[not]" folded. Each is
  flagged above; reviewers should not expect the candidate to make them
  clearer than the source.
- VI.41 PG "thou wilt not blame the gods": the "not" is a base-text error
  (Standard Ebooks' Long has "thou wilt blame"; the argument requires it);
  the candidate has "you will blame". A reviewer who reads PG's "not" as
  Long's should say so.
- VI.49 PG "Thou art not dissatisfied. I suppose, because" — a full stop for a
  comma (Standard Ebooks has the comma); rendered with the comma.
- VI.27 PG "to strive After the things" — a stray capital mid-sentence;
  lowered.
- VI.34 "patricides": PG and Standard Ebooks agree; Long's spelling, kept.
- VI.13 "Consider then what Crates says of Xenocrates himself" — Long gives
  no more, and neither does the candidate.
- No truncated source paragraphs; every source paragraph ends in terminal
  punctuation.
