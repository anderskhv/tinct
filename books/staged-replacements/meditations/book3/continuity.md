# Continuity sheet — Meditations, Book III (candidate v1, updated for v2)

Written alongside drafting `candidate-v1.json`, after Books II and I were
accepted, and describing what the frozen draft actually did; entries marked "v2"
record where the round-1 review corrections changed a decision. The full change
list is in `changes-v1-to-v2.md`. Term renderings
follow `../GLOSSARY.md`; the pattern for applying review findings follows
`../book2/ACCEPTANCE.md` and `../book1/ACCEPTANCE.md` (decisions D8 and D10 in
the ledger).

## Source

- `../meditations-original-en.staged.json`, chapter `number: 3`, title `Book 3`,
  16 paragraphs, one per numbered meditation (III.1–III.16). Extracted verbatim
  into `source-book3.json` (sha256 in `provenance.json`).
- George Long 1862, PG #15877. See `../PROVENANCE.md` for identification,
  rights and the mechanical normalisations applied to the whole staged file.
- Book III was read in full before any paragraph was drafted. It returns to the
  self-address of Book II after the ledger of debts in Book I: the shortness of
  the time left and the mind failing before the body (III.1, III.3, III.10,
  III.14), the beauty of what follows from nature (III.2), the god within as
  guardian and standard (III.4–III.7, III.12, III.16), the method of defining
  each thing (III.11), and the three-part self (III.16, answering II.2).

## Glossary terms met in Book III, and how they were rendered

| Long (Book III) | Candidate | Where |
|---|---|---|
| the [deity] which is planted within him; the deity which is in thee; the Deity which is planted in thee; his own intelligence and daemon; the divinity which is planted in his breast | the god within him; the god within you; his own intelligence and the god within; the god within his breast | III.4, III.5, III.6, III.7, III.16. Long's "planted" is folded into "within" (the glossary's parenthesis); III.16 keeps Long's "breast" because it is a concrete word, not a variant of the term |
| thy divine part | your divine part | III.12 — Long's own different phrase; kept distinct from "the god within" |
| intelligence and deity | intelligence and the divine | III.3 — abstract, per the glossary's "the Deity → the divine" |
| our own ruling power; thy ruling part | our own ruling part; your ruling part | III.4, III.9 |
| rational animal | rational being | III.4, III.9; "rational being" (Long's own words) III.6 |
| an animal (as against a rational being) | an animal | III.6 — kept, because Long's contrast is between the rational being and the mere animal; "being" would erase it |
| animals (to receive impressions of forms … belongs even to animals) | animals | III.16 — living creatures in general; the glossary's "animal → being" rule is for "rational animal" and "social animal" only |
| social animal; intelligent animal and a member of a civil community | social being; an intelligent being and a member of a community | III.4, III.7 |
| some object of common utility; the general interest; the common interest | something for the common good; the common good; the common good | III.4 (twice), III.5 |
| according to nature | according to nature | III.2, III.4 (three times), III.12 |
| inconsistent with nature | inconsistent with nature | III.9 — not Long's "contrary to nature", so not the glossary's "against nature" |
| Nature and her works | Nature and her works | III.2 — Long's capital kept |
| the universe | the universe | III.2, III.3, III.11 |
| the whole | the whole | III.11 |
| appearances (clearly separating all appearances) | impressions (clearly distinguishing all impressions) | III.1 — technical sense (*phantasiai*); "separating" → "distinguishing" because "separating impressions" is not modern English for discriminating between them |
| the impressions (carefully examines all the impressions); makes an impression on me | the impressions; makes an impression on me | III.6, III.11 |
| the impressions of forms by means of appearances | impressions of forms by means of appearances | III.16 — Long uses both words in one phrase to distinguish the impression received from the appearance that conveys it; both kept, so the distinction is not collapsed |
| the things which appear suitable | the things that seem suitable | III.16 — not the technical sense |
| opinion; the faculty which produces opinion | opinion; the faculty that produces opinion | III.4, III.9 |
| principles | principles | III.13, III.16 |
| things indifferent | things that are indifferent | III.11 |
| this present time | the present | III.10 |
| posthumous fame | fame after death | III.10 |
| tranquillity; tranquil | calm | III.5, III.16 (twice) |
| kinsman | kinsman | III.4, III.11 |
| the highest city | the highest city | III.11 |
| in a manner (twice) | in a way | III.2 |
| benevolent; benevolence | kind; kindness | III.4, III.11 — the "kind" family fixed in `../book1/continuity.md` for Long's beneficence/benevolence |
| reason; right reason; a disciplined reason | reason; right reason; a disciplined reason | III.1, III.6, III.12 |
| understanding; intelligence; mind | understanding; intelligence; mind | III.1, III.3, III.7, III.8, III.11, III.16 — Long's three words kept apart |
| soul | soul | III.6, III.7, III.16 |
| the gods; god | the gods; god | III.3, III.4, III.6, III.9, III.11, III.16 (lowercase "This comes from god" as Long has it) |

## Paragraph-level decisions

- **III.1** — "Our life is daily wasting away" → "wasting away day by day";
  "fall into dotage" → "fall into senility" (Long's word is understood but
  dated; "senility" is the plain current word for the same state, not a
  diagnosis); "perspiration and nutrition and imagination and appetite" kept
  as Long's four nouns; "the conception of things and the understanding of
  them cease first" kept. The three-part structure (life shortens; the mind
  may fail first; therefore make haste) is Long's.
- **III.2** — "Have a certain fashion contrary to the purpose of the baker's
  art" → "have a certain shape contrary to…"; "the lion's eyebrows" kept (it
  is Long's image, odd in any century); "ears of corn" kept as Long has it;
  "examine them severally" → "examine them one by one"; "are beautiful in a
  manner, and in a peculiar way" → "are in a way beautiful, and in a peculiar
  way" (v2; v1 had "beautiful in a way, and in a peculiar way", the glossary's
  rendering producing two "way"s three words apart; review finding 2.1); "consequent upon" →
  "follow on"; "young persons" → "the young".
- **III.3** — "The Chaldaei" → "the Chaldaeans" (the English form of the same
  name, as "Alexander the Platonic" → "Platonist" in Book I); "Pompeius" and
  "Caius Caesar" kept in Long's forms; "many ten thousands" → "many tens of
  thousands"; "What means all this?" → "What does all this mean?"; "get out"
  kept as the bare imperative it is; "there is no want of gods" → "there is no
  lack of gods". The dagger-marked clause "which is as much inferior as that
  which serves it is superior" stands verbatim; the following "for the one is
  intelligence and deity" takes the glossary's "the divine" for "deity".
- **III.4** — Long's very long section (503 words) kept as one paragraph in
  Long's order. "Some object of common utility" → "something for the common
  good"; "the over-curious feeling and the malignant" → "the over-curious
  feeling and the malicious"; "use himself to think" → "accustom himself to
  think"; "What hast thou now in thy thoughts?" → "What is in your thoughts
  now?" with no comma after the question mark (v2; review finding 4.2); "and a
  man should hold on to the opinion not of all" kept as Long's own-voice rule
  after the semicolon, not a third thing the good man remembers (v2; v1 had
  "and that a man should"; review finding 4.1); "no longer delays being among the number of the best" → "no longer
  puts off being…"; "makes the matter for his activity" → "makes the material
  of his activity"; "both at home and from home" → "both at home and away from
  home". The dagger-marked sentence "For the lot which is assigned to each man
  is carried along with him and carries him along with it." stands verbatim.
  Long's bracketed "[deity]" folded into the glossary rendering "the god
  within him".
- **III.5** — "Labor not unwillingly" → "Do not work unwillingly"; "let
  studied ornament set off thy thoughts" → "set off your thoughts" (v2; v1 had
  "dress up", which adds a note of disguise Long does not have; review finding
  5.1); "and engaged in matter political" → "and engaged in political matters"
  with Long's "and … and … and" chain intact (v2; v1 dropped the first "and"); "engaged
  in matter political" → "engaged in political matters"; "having need neither
  of oath nor of any man's testimony" → "needing neither oath nor any man's
  testimony"; "stand erect, not be kept erect by others" → "stand upright, not
  be held upright by others".
- **III.6** — "Thy own mind's self-satisfaction in the things which it enables
  thee to do" → "your own mind's satisfaction with itself in the things it
  enables you to do": Long's "self-satisfaction" now means smugness; the
  rendering says only what Long's compound says (the mind satisfied with
  itself), no more (v2; v1 had "contentment with itself", which collided with
  Long's own "contentment" in III.11 and "content" in III.16; review finding
  6.1). Long's "[or, practically]" is an alternative rendering of one Greek
  adverb, not a supplement to the sense, and is dropped as apparatus: "what is
  rationally and politically good" (v2; v1 folded it as "rationally and
  politically, or practically, good"; review finding 6.3). "But do thou, I say"
  → "But you, I say" (v2; v1 kept "do you", which parses as a question; review
  finding 6.2); "maintain thy judgment" → "maintain your judgment" (v2; v1 had
  "hold to", a third "hold to / keep to" in two lines); "[to the better things]" folded as "fit in with the better things".
  "Obtain the superiority all at once" → "gain the upper hand all at once".
  Long's dialogue dashes ("—But that which is useful is the better.—Well,
  then…") kept as dashes. "As an animal" kept (see table).
- **III.7** — "Never value anything as profitable to thyself which shall
  compel thee" → "Never value as profitable to yourself anything that will
  compel you"; "acts no tragic part" → "plays no tragic part"; "flying from
  [death]" → "fleeing death" (bracket folded); "a member of a civil community"
  → "a member of a community" (glossary); "he cares not at all" → "he does not
  care at all" (v2; v1 left the verb-plus-"not" form, the only one in the book;
  review finding 7.1).
- **III.8** — "Chastened and purified" kept (v2; v1 had "disciplined and
  purified", which echoed III.1 "a disciplined reason" where Long has two
  different words; "chastened" is current English); "any sore
  skinned over" kept; "[to other things]" and "[from other things]" folded as
  "bound to other things, nor yet detached from them".
- **III.9** — Three sentences kept as three; "friendship towards men" →
  "friendship toward men" (spelling only).
- **III.10** — "Throwing away then all things, hold to these only which are
  few" → "Throw away everything, then, and hold to these few things only";
  "the nook of the earth" → "the corner of the earth"; "only continued by a
  succession of poor human beings" → "carried on only by…"; "know not even
  themselves" → "do not know even themselves".
- **III.11** — "In its nudity" → "in its nakedness"; "nothing is so productive
  of elevation of mind as to be able to examine" → "nothing so produces
  elevation of mind as being able to examine"; "Wherefore" → "Therefore";
  "such-like" → "suchlike"; "every object which is presented to thee" → "every
  object that is presented to you", the passive kept both times as Long has it
  (v2; v1 had "presents itself" the second time; review finding 11.1); "But I
  know; for this reason I behave" kept with Long's bare semicolon (v2, flow
  read; v1 added "and"). The dagger-marked "according to the apportionment
  and spinning of the thread of destiny, and suchlike coincidence and chance"
  stands as Long has it apart from that hyphen. "With benevolence and justice"
  → "with kindness and justice" (Book I family). "In things indifferent I
  attempt to ascertain the value of each" → "in things that are indifferent I
  try to determine the value of each".
- **III.12** — One conditional sentence kept as one; "as if thou shouldst be
  bound to give it back immediately" → "as if you were bound to give it back
  at once"; "thou wilt live happy" → "you will live happy" (Long's adjective,
  not "happily").
- **III.13** — "Having a reference to things divine" → "referring it to things
  divine"; "nor the contrary" kept.
- **III.14** — "Wander at hazard" → "wander at random"; "Hellenes" → "Greeks"
  (as "Grecian" → "Greek" in Book I); "which thou wast reserving for thy old
  age" → "that you were saving for your old age".
- **III.15** — "Signified" → "meant"; "effected" → "accomplished" (v2; v1 had
  "done", which repeated the "done" four words earlier and let the last clause
  be misread; review finding 15.1); the one-sentence
  meditation stays one sentence.
- **III.16** — "To the body belong sensation" → "to the body belongs
  sensation" (grammar only; Long's singular noun kept); "men who have made
  themselves into women" kept as Long has it (Marcus's own contrast, as
  "womanish" in II.10); "a Phalaris and a Nero" kept without gloss; "when they
  have shut the doors" kept (v2; v1 had "once", a shade of "as soon as"); "the divinity which
  is planted in his breast" → "the god within his breast"; "preserve it
  tranquil" → "keep it calm"; "deviate from the way" → "turn aside from the
  way" (v2; v1 had "road", more concrete than Long's "way", which also keeps the
  sense of manner; review finding 16.1); "a simple, modest, and contented life"
  with the serial comma of the staged original (v2; review finding 16.2).

## Nothing imported from other translations

No wording was taken from any translation other than Long's. Where a familiar
modern phrasing exists for a Book III sentence (the openings of III.3, III.5,
III.10 and III.14 are often quoted), the candidate was built from Long's
sentence, not from memory of the familiar version. Proper names are Long's
spellings (Hippocrates, Alexander, Pompeius, Caius Caesar, Heraclitus,
Democritus, Socrates, Phalaris, Nero), with "Chaldaeans" for his "Chaldaei" as
recorded above.

## Unresolved source issues (Long's text)

- Long marks three places in Book III with his dagger for uncertain Greek
  (`../PROVENANCE.md` §4): III.3 after "superior:" (the clause "which is as
  much inferior as that which serves it is superior"), III.4 after "carries
  him along with it." (that sentence), and III.11 at "apportionment". All
  three stand as Long has them; reviewers should not expect the candidate to
  make them clearer than the source.
- No truncated or fragmentary source paragraphs in Book III; every source
  paragraph ends in terminal punctuation.
